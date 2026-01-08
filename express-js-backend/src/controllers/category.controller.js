const db = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT * FROM categories');
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const [result] = await db.execute('INSERT INTO categories (name) VALUES (?)', [name]);
    res.json({ success: true, id: result.insertId, name });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Creation failed' });
  }
};

module.exports = { getCategories, createCategory };
