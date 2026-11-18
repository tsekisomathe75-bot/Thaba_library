const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const TYPES = ['restock', 'borrow', 'return'];

// how much a record moves the stock: borrowing takes copies out, the rest put them in
const effect = (type, qty) => (type === 'borrow' ? -qty : qty);

// GET /transactions  - admins see everything, members only see their own
router.get('/', async (req, res) => {
  try {
    const base = `
      SELECT t.id, t.type, t.quantity, t.note, t.created_at,
             b.id AS book_id, b.title AS book_title,
             u.id AS user_id, u.name AS user_name, u.membership_id
      FROM transactions t
      JOIN books b ON b.id = t.book_id
      LEFT JOIN users u ON u.id = t.user_id`;

    const [rows] =
      req.user.role === 'admin'
        ? await db.query(base + ' ORDER BY t.created_at DESC, t.id DESC LIMIT 200')
        : await db.query(base + ' WHERE t.user_id = ? ORDER BY t.created_at DESC, t.id DESC LIMIT 200', [req.user.id]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load transactions' });
  }
});

// POST /transactions
// body: { bookId, type, quantity, note?, userId? }
router.post('/', async (req, res) => {
  const { bookId, type, note } = req.body;
  const qty = Number(req.body.quantity);

  if (!bookId || !TYPES.includes(type)) {
    return res.status(400).json({ error: 'Pick a book and a transaction type' });
  }
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ error: 'Quantity must be a whole number of at least 1' });
  }

  const isAdmin = req.user.role === 'admin';
  if (type === 'restock' && !isAdmin) {
    return res.status(403).json({ error: 'Only admins can add stock' });
  }
  // members always borrow for themselves; admins can pick someone
  const userId = isAdmin && req.body.userId ? Number(req.body.userId) : req.user.id;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // lock the row so two people can't borrow the last copy at the same time
    const [rows] = await conn.query('SELECT quantity FROM books WHERE id = ? FOR UPDATE', [bookId]);
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Book not found' });
    }

    const change = type === 'borrow' ? -qty : qty;
    const newQty = rows[0].quantity + change;
    if (newQty < 0) {
      await conn.rollback();
      return res.status(400).json({ error: `Only ${rows[0].quantity} in stock right now` });
    }

    await conn.query('UPDATE books SET quantity = ? WHERE id = ?', [newQty, bookId]);
    await conn.query(
      'INSERT INTO transactions (book_id, user_id, type, quantity, note) VALUES (?,?,?,?,?)',
      [bookId, userId, type, qty, note?.trim() || null]
    );

    await conn.commit();
    res.status(201).json({ message: 'Transaction recorded', newQuantity: newQty });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Could not record transaction' });
  } finally {
    conn.release();
  }
});

// PUT /transactions/:id  (admin) - fix a wrong entry.
// The old effect on stock is undone and the new one applied, so the numbers stay honest.
router.put('/:id', requireAdmin, async (req, res) => {
  const { type, note } = req.body;
  const qty = Number(req.body.quantity);

  if (!TYPES.includes(type)) return res.status(400).json({ error: 'Pick a transaction type' });
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ error: 'Quantity must be a whole number of at least 1' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [txRows] = await conn.query('SELECT * FROM transactions WHERE id = ? FOR UPDATE', [req.params.id]);
    if (txRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Transaction not found' });
    }
    const old = txRows[0];

    const [bookRows] = await conn.query('SELECT quantity FROM books WHERE id = ? FOR UPDATE', [old.book_id]);
    const newStock = bookRows[0].quantity - effect(old.type, old.quantity) + effect(type, qty);
    if (newStock < 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'That change would push the stock below zero' });
    }

    await conn.query('UPDATE books SET quantity = ? WHERE id = ?', [newStock, old.book_id]);
    await conn.query('UPDATE transactions SET type = ?, quantity = ?, note = ? WHERE id = ?', [
      type,
      qty,
      note?.trim() || null,
      req.params.id,
    ]);

    await conn.commit();
    res.json({ message: 'Transaction updated', newQuantity: newStock });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Could not update transaction' });
  } finally {
    conn.release();
  }
});

// DELETE /transactions/:id  (admin) - removes the record and reverses its effect on stock
router.delete('/:id', requireAdmin, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [txRows] = await conn.query('SELECT * FROM transactions WHERE id = ? FOR UPDATE', [req.params.id]);
    if (txRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Transaction not found' });
    }
    const old = txRows[0];

    const [bookRows] = await conn.query('SELECT quantity FROM books WHERE id = ? FOR UPDATE', [old.book_id]);
    const newStock = bookRows[0].quantity - effect(old.type, old.quantity);
    if (newStock < 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Deleting this record would push the stock below zero' });
    }

    await conn.query('UPDATE books SET quantity = ? WHERE id = ?', [newStock, old.book_id]);
    await conn.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);

    await conn.commit();
    res.json({ message: 'Transaction deleted', newQuantity: newStock });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Could not delete transaction' });
  } finally {
    conn.release();
  }
});

module.exports = router;
