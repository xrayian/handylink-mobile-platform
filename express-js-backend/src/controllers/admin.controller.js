const db = require('../config/db');

const getVerifications = async (req, res) => {
  try {
    const sql = `
      SELECT hp.*, u.full_name, u.email, u.phone 
      FROM handyman_profiles hp 
      JOIN users u ON hp.user_id = u.id 
      WHERE hp.is_verified = 'pending'
    `;
    const [verifications] = await db.execute(sql);

    const result = verifications.map(v => {
      if (v.document_link) {
        v.document_url = `${req.protocol}://${req.get('host')}/${v.document_link.replace(/\\/g, '/')}`;
      }
      return v;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const approveHandyman = async (req, res) => {
  try {
    const { handyman_id, action } = req.body;

    if (!handyman_id || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let status = 'rejected';
    if (action === 'approve' || action === 'approved') {
      status = 'approved';
    } 

    await db.execute('UPDATE handyman_profiles SET is_verified = ? WHERE user_id = ?', [status, handyman_id]);
    res.json({ message: `Handyman ${status}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Operation failed' });
  }
};

const getAllGigsAdmin = async (req, res) => {
  try {
    const sql = `
      SELECT g.*, c.name as category_name, u.full_name as handyman_name, hp.user_id as handyman_user_id
      FROM gigs g 
      JOIN categories c ON g.category_id = c.id 
      JOIN handyman_profiles hp ON g.handyman_profile_id = hp.id 
      JOIN users u ON hp.user_id = u.id
      ORDER BY g.created_at DESC
    `;
    const [gigs] = await db.execute(sql);
    res.json(gigs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // 1. Get Handymen
    const sqlHandymen = `
      SELECT u.id, u.full_name, u.email, u.phone, u.role, u.created_at, 
             hp.is_verified, hp.document_link, hp.bio 
      FROM users u 
      JOIN handyman_profiles hp ON u.id = hp.user_id 
      WHERE u.role = 'handyman'
    `;
    const [handymen] = await db.execute(sqlHandymen);

    const handymenWithUrl = handymen.map(h => {
        if (h.document_link) {
            h.document_url = `${req.protocol}://${req.get('host')}/${h.document_link.replace(/\\/g, '/')}`;
        }
        return h;
    });

    // 2. Get Customers with Spend
    const sqlCustomers = `
      SELECT u.id, u.full_name, u.email, u.phone, u.role, u.created_at,
             COALESCE(SUM(b.total_price), 0) as total_spend
      FROM users u 
      LEFT JOIN bookings b ON u.id = b.customer_id AND b.status = 'completed'
      WHERE u.role = 'customer'
      GROUP BY u.id, u.full_name, u.email, u.phone, u.role, u.created_at
    `;
    const [customers] = await db.execute(sqlCustomers);

    res.json({ handymen: handymenWithUrl, customers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const userAction = async (req, res) => {
  try {
    const { user_id, action } = req.body;

    if (!user_id || !action) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    if (action === 'delete') {
      await db.execute('DELETE FROM users WHERE id = ?', [user_id]);
      res.json({ message: 'User deleted' });
    } else if (action === 'disable_handyman') {
      await db.execute('UPDATE handyman_profiles SET is_verified = "rejected" WHERE user_id = ?', [user_id]);
      res.json({ message: 'Handyman disabled' });
    } else if (action === 'enable_handyman') {
      await db.execute('UPDATE handyman_profiles SET is_verified = "approved" WHERE user_id = ?', [user_id]);
      res.json({ message: 'Handyman enabled' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Operation failed' });
  }
};

module.exports = { getVerifications, approveHandyman, getAllGigsAdmin, getAllUsers, userAction };
