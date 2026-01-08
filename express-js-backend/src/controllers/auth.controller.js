const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { full_name, email, password, phone, role } = req.body;

    if (!full_name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const userRole = role || 'customer';

    const [result] = await db.execute(
      'INSERT INTO users (full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, hash, userRole, phone]
    );

    const userId = result.insertId;
    const tokenPayload = {
      id: userId,
      role: userRole,
      email: email
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

    res.status(200).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        full_name,
        email,
        role: userRole
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const tokenPayload = {
        id: user.id,
        role: user.role,
        email: user.email
      };
      
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

      res.status(200).json({
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = { register, login, logout };
