const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?', 
      [req.user.id]
    );
    const user = users[0];

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, password } = req.body;
    let fields = [];
    let params = [];

    if (full_name) {
      fields.push('full_name = ?');
      params.push(full_name);
    }
    if (phone) {
      fields.push('phone = ?');
      params.push(phone);
    }
    if (password) {
      fields.push('password_hash = ?');
      params.push(await bcrypt.hash(password, 10));
    }

    if (fields.length === 0) {
      return res.json({ message: 'No changes provided' });
    }

    params.push(req.user.id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    await db.execute(sql, params);
    res.json({ message: 'Profile updated successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
};

module.exports = { getProfile, updateProfile };
