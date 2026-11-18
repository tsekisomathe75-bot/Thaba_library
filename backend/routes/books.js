const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function checkBook(body) {
  const { title, author, genre, isbn, quantity } = body;
  if (!title?.trim() || !author?.trim() || !genre?.trim() || !isbn?.trim()) {
    return 'Title, author, genre and ISBN are all required';
  }
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 0) {
    return 'Quantity must be a whole number, 0 or more';
  }
  return null;
}

// GET /books
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books ORDER BY title');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load books' });
  }
});

// GET /books/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /books
router.post('/', requireAdmin, async (req, res) => {
  const problem = checkBook(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const { title, author, genre, isbn, quantity } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?,?,?,?,?)',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity)]
    );
    // log the opening stock as a restock so the history adds up
    if (Number(quantity) > 0) {
      await db.query(
        "INSERT INTO transactions (book_id, user_id, type, quantity, note) VALUES (?,?,'restock',?,?)",
        [result.insertId, req.user.id, Number(quantity), 'Opening stock']
      );
    }
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A book with that ISBN already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Could not add book' });
  }
});

// PUT /books/:id
router.put('/:id', requireAdmin, async (req, res) => {
  const problem = checkBook(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const { title, author, genre, isbn, quantity } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE books SET title=?, author=?, genre=?, isbn=?, quantity=? WHERE id=?',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity), req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Another book already uses that ISBN' });
    }
    console.error(err);
    res.status(500).json({ error: 'Could not update book' });
  }
});

// DELETE /books/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete book' });
  }
});

module.exports = router;
