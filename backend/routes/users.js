const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { idProblem, passwordProblem } = require('../utils/rules');

const router = express.Router();
router.use(requireAuth);

// GET /users  (admin only - password hashes are never sent)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, membership_id, role, created_at FROM users ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load users' });
  }
});

// POST /users
router.post('/', requireAdmin, async (req, res) => {
  const { name, membershipId, role, password } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const problem = idProblem(membershipId?.trim(), role) || passwordProblem(password);
  if (problem) return res.status(400).json({ error: problem });

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?,?,?,?)',
      [name.trim(), membershipId.trim(), role, hash]
    );
    res.status(201).json({ id: result.insertId, name, membership_id: membershipId, role });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That membership ID is already taken' });
    }
    console.error(err);
    res.status(500).json({ error: 'Could not add user' });
  }
});

// PUT /users/:id   (password is optional - only changes if one is sent)
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, membershipId, role, password } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const problem = idProblem(membershipId?.trim(), role) || (password ? passwordProblem(password) : null);
  if (problem) return res.status(400).json({ error: problem });

  try {
    let result;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      [result] = await db.query(
        'UPDATE users SET name=?, membership_id=?, role=?, password_hash=? WHERE id=?',
        [name.trim(), membershipId.trim(), role, hash, req.params.id]
      );
    } else {
      [result] = await db.query(
        'UPDATE users SET name=?, membership_id=?, role=? WHERE id=?',
        [name.trim(), membershipId.trim(), role, req.params.id]
      );
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That membership ID is already taken' });
    }
    console.error(err);
    res.status(500).json({ error: 'Could not update user' });
  }
});

// DELETE /users/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  // don't let an admin lock themselves out
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: "You can't delete your own account" });
  }
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete user' });
  }
});

module.exports = router;
