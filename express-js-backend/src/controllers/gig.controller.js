const db = require('../config/db');

const createGig = async (req, res) => {
  try {
    const { category_id, title, description, price, lat, lng } = req.body;
    
    // Check verification
    const [profiles] = await db.execute('SELECT id, is_verified FROM handyman_profiles WHERE user_id = ?', [req.user.id]);
    const profile = profiles[0];

    if (!profile) return res.status(400).json({ error: 'Complete your profile first' });
    if (profile.is_verified !== 'approved') return res.status(403).json({ error: 'You must be verified to create gigs' });

    const sql = `
      INSERT INTO gigs (handyman_profile_id, category_id, title, description, price, price_type, latitude, longitude, city, is_active) 
      VALUES (?, ?, ?, ?, ?, 'fixed', ?, ?, 'Dhaka', 1)
    `;
    
    await db.execute(sql, [profile.id, category_id, title, description || '', price, lat, lng]);
    res.json({ message: 'Gig created' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gig creation failed' });
  }
};

const updateGig = async (req, res) => {
  try {
    const gigId = req.params.id;
    const { title, description, price, is_active } = req.body;

    const [profiles] = await db.execute('SELECT id, is_verified FROM handyman_profiles WHERE user_id = ?', [req.user.id]);
    const profile = profiles[0];
    
    if (!profile || profile.is_verified !== 'approved') return res.status(403).json({ error: 'You must be verified to manage gigs' });

    // Verify ownership
    const [gigs] = await db.execute('SELECT id FROM gigs WHERE id = ? AND handyman_profile_id = ?', [gigId, profile.id]);
    if (gigs.length === 0) return res.status(404).json({ error: 'Gig not found or access denied' });

    let fields = [];
    let params = [];

    if (title) { fields.push('title = ?'); params.push(title); }
    if (description) { fields.push('description = ?'); params.push(description); }
    if (price) { fields.push('price = ?'); params.push(price); }
    if (typeof is_active !== 'undefined') { fields.push('is_active = ?'); params.push(is_active); }

    if (fields.length > 0) {
      params.push(gigId);
      await db.execute(`UPDATE gigs SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    res.json({ message: 'Gig updated' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
};

const deleteGig = async (req, res) => {
  try {
    const gigId = req.params.id;
    
    if (req.user.role === 'handyman') {
      const [profiles] = await db.execute('SELECT id FROM handyman_profiles WHERE user_id = ?', [req.user.id]);
      if (profiles.length === 0) return res.status(404).json({ error: 'Profile not found' });
      
      const [gigs] = await db.execute('SELECT id FROM gigs WHERE id = ? AND handyman_profile_id = ?', [gigId, profiles[0].id]);
      if (gigs.length === 0) return res.status(404).json({ error: 'Gig not found or access denied' });
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    try {
      const [result] = await db.execute('DELETE FROM gigs WHERE id = ?', [gigId]);
      if (result.affectedRows > 0) {
        res.json({ message: 'Gig deleted' });
      } else {
        res.status(500).json({ error: 'Delete failed' });
      }
    } catch (e) {
      // Soft delete on constraint error
      await db.execute('UPDATE gigs SET is_active = 0 WHERE id = ?', [gigId]);
      res.json({ message: 'Gig deactivated (bookings exist)' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

const getAllGigs = async (req, res) => {
  try {
    const { lat, lng, radius = 15, category, sort, q } = req.query;

    let sql, params = [];

    if (lat && lng) {
        sql = `
            SELECT g.*, c.name as category_name, hp.experience_years, u.full_name as handyman_name,
            ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance,
            (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r JOIN bookings b ON r.booking_id = b.id JOIN gigs g2 ON b.gig_id = g2.id WHERE g2.handyman_profile_id = g.handyman_profile_id) as avg_rating,
            (SELECT COUNT(r.id) FROM reviews r JOIN bookings b ON r.booking_id = b.id JOIN gigs g2 ON b.gig_id = g2.id WHERE g2.handyman_profile_id = g.handyman_profile_id) as review_count,
             (SELECT COUNT(*) FROM bookings b3 JOIN gigs g3 ON b3.gig_id = g3.id WHERE g3.handyman_profile_id = g.handyman_profile_id AND b3.status = 'completed') as jobs_done
            FROM gigs g
            JOIN categories c ON g.category_id = c.id
            JOIN handyman_profiles hp ON g.handyman_profile_id = hp.id
            JOIN users u ON hp.user_id = u.id
            WHERE g.is_active = 1
        `;
        params = [lat, lng, lat];
    } else {
        sql = `
            SELECT g.*, c.name as category_name, hp.experience_years, u.full_name as handyman_name,
            (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r JOIN bookings b ON r.booking_id = b.id JOIN gigs g2 ON b.gig_id = g2.id WHERE g2.handyman_profile_id = g.handyman_profile_id) as avg_rating,
            (SELECT COUNT(r.id) FROM reviews r JOIN bookings b ON r.booking_id = b.id JOIN gigs g2 ON b.gig_id = g2.id WHERE g2.handyman_profile_id = g.handyman_profile_id) as review_count,
             (SELECT COUNT(*) FROM bookings b3 JOIN gigs g3 ON b3.gig_id = g3.id WHERE g3.handyman_profile_id = g.handyman_profile_id AND b3.status = 'completed') as jobs_done
            FROM gigs g
            JOIN categories c ON g.category_id = c.id
            JOIN handyman_profiles hp ON g.handyman_profile_id = hp.id
            JOIN users u ON hp.user_id = u.id
            WHERE g.is_active = 1
        `;
    }

    if (category) {
      sql += ' AND g.category_id = ?';
      params.push(category);
    }

    if (q) {
      sql += ' AND (g.title LIKE ? OR g.description LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    if (lat && lng) {
        sql += ' HAVING distance < ?';
        params.push(radius);
    }

    if (sort === 'price_asc') {
        sql += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
        sql += ' ORDER BY price DESC';
    } else if (lat && lng) {
        sql += ' ORDER BY distance ASC';
    }

    const [gigs] = await db.execute(sql, params);
    res.json(gigs);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const getGigById = async (req, res) => {
  try {
    const gigId = req.params.id;
    const sql = `
      SELECT g.*, c.name as category_name, hp.bio, hp.experience_years, u.full_name as handyman_name 
      FROM gigs g 
      JOIN categories c ON g.category_id = c.id 
      JOIN handyman_profiles hp ON g.handyman_profile_id = hp.id 
      JOIN users u ON hp.user_id = u.id 
      WHERE g.id = ?
    `;
    const [gigs] = await db.execute(sql, [gigId]);
    if (gigs.length > 0) {
      res.json(gigs[0]);
    } else {
      res.status(404).json({ error: 'Gig not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const getGigReviews = async (req, res) => {
  try {
    const gigId = req.params.id;
    const sql = `
      SELECT r.id, r.rating, r.comment, r.created_at, u.full_name as reviewer_name
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      JOIN users u ON b.customer_id = u.id
      WHERE b.gig_id = ?
      ORDER BY r.created_at DESC
    `;
    const [reviews] = await db.execute(sql, [gigId]);
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { createGig, updateGig, deleteGig, getAllGigs, getGigById, getGigReviews };
