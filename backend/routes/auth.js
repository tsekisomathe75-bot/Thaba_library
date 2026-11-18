const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken } = require('../middleware/auth');
const { idProblem, passwordProblem } = require('../utils/rules');

const router = express.Router();

// POST /auth/login
router.post('/login', async (req, res) => {
  const { membershipId, password } = req.body;
  if (!membershipId || !password) {
    return res.status(400).json({ error: 'Membership ID and password are required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE membership_id = ?', [membershipId.trim()]);
    const user = rows[0];
    // same message for both cases so nobody can guess which IDs exist
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Wrong membership ID or password' });
    }

    res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, membershipId: user.membership_id, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /auth/register
// Anyone can sign up, but the account is always a plain member -
// the role is never read from the request.
router.post('/register', async (req, res) => {
  const { name, membershipId, password } = req.body;
  const id = (membershipId || '').trim();

  if (!name?.trim()) return res.status(400).json({ error: 'Please enter your name' });
  const problem = idProblem(id, 'member') || passwordProblem(password);
  if (problem) return res.status(400).json({ error: problem });

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, membership_id, role, password_hash) VALUES (?,?,'member',?)",
      [name.trim(), id, hash]
    );
    const user = { id: result.insertId, name: name.trim(), membership_id: id, role: 'member' };

    res.status(201).json({
      token: signToken(user),
      user: { id: user.id, name: user.name, membershipId: id, role: 'member' },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That membership ID is already taken' });
    }
    console.error(err);
    res.status(500).json({ error: 'Could not create the account' });
  }
});

module.exports = router;
