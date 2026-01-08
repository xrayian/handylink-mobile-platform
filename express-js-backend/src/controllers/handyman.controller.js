const db = require('../config/db');

// Private Handyman Routes

const getMyProfile = async (req, res) => {
  try {
    const [profiles] = await db.execute('SELECT * FROM handyman_profiles WHERE user_id = ?', [req.user.id]);
    const profile = profiles[0];

    if (profile) {
      if (profile.document_link) {
        profile.document_url = `${req.protocol}://${req.get('host')}/${profile.document_link.replace(/\\/g, '/')}`;
      }
      res.json(profile);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const verifyProfile = async (req, res) => {
  try {
    const { bio, experience_years } = req.body;
    let documentLink = null;

    if (req.file) {
      documentLink = req.file.path;
    }

    const [profiles] = await db.execute('SELECT id FROM handyman_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length > 0) {
      let sql = 'UPDATE handyman_profiles SET bio = ?, experience_years = ?, is_verified = "pending"';
      let params = [bio, experience_years];
      
      if (documentLink) {
        sql += ', document_link = ?';
        params.push(documentLink);
      }
      
      sql += ' WHERE user_id = ?';
      params.push(req.user.id);

      await db.execute(sql, params);
    } else {
      await db.execute(
        'INSERT INTO handyman_profiles (user_id, bio, experience_years, document_link, is_verified) VALUES (?, ?, ?, ?, "pending")',
        [req.user.id, bio, experience_years, documentLink]
      );
    }
    
    res.json({ message: 'Verification submitted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

const getStats = async (req, res) => {
  try {
    const [profiles] = await db.execute('SELECT id FROM handyman_profiles WHERE user_id = ?', [req.user.id]);
    const profile = profiles[0];
    
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const sql = `
      SELECT 
        COUNT(b.id) as total_bookings,
        SUM(CASE WHEN b.status = 'completed' THEN b.total_price ELSE 0 END) as total_earnings,
        (SELECT AVG(rating) FROM reviews r JOIN bookings b2 ON r.booking_id = b2.id WHERE b2.gig_id IN (SELECT id FROM gigs WHERE handyman_profile_id = ?)) as avg_rating
      FROM bookings b
      JOIN gigs g ON b.gig_id = g.id
      WHERE g.handyman_profile_id = ?
    `;

    const [stats] = await db.execute(sql, [profile.id, profile.id]);
    res.json(stats[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const status = req.query.status;
    let sql = `
      SELECT b.*, u.full_name as customer_name, g.title as gig_title 
      FROM bookings b
      JOIN gigs g ON b.gig_id = g.id
      JOIN handyman_profiles hp ON g.handyman_profile_id = hp.id
      JOIN users u ON b.customer_id = u.id
      WHERE hp.user_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    const [bookings] = await db.execute(sql, params);
    res.json(bookings);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const getMyGigs = async (req, res) => {
  try {
    const sql = `
      SELECT g.*, c.name as category_name 
      FROM gigs g 
      JOIN categories c ON g.category_id = c.id 
      JOIN handyman_profiles hp ON g.handyman_profile_id = hp.id 
      WHERE hp.user_id = ?
      ORDER BY g.created_at DESC
    `;
    const [gigs] = await db.execute(sql, [req.user.id]);
    res.json(gigs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Public Handyman Routes

const getPublicProfile = async (req, res) => {
  try {
    const profileId = req.params.id;
    const sql = `
      SELECT hp.id, hp.bio, hp.experience_years, u.full_name, u.created_at as joined_at,
      (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r JOIN bookings b ON r.booking_id = b.id JOIN gigs g ON b.gig_id = g.id WHERE g.handyman_profile_id = hp.id) as avg_rating,
      (SELECT COUNT(r.id) FROM reviews r JOIN bookings b ON r.booking_id = b.id JOIN gigs g ON b.gig_id = g.id WHERE g.handyman_profile_id = hp.id) as review_count,
      (SELECT COUNT(*) FROM bookings b JOIN gigs g ON b.gig_id = g.id WHERE g.handyman_profile_id = hp.id AND b.status = 'completed') as jobs_done
      FROM handyman_profiles hp
      JOIN users u ON hp.user_id = u.id
      WHERE hp.id = ? AND hp.is_verified = 'approved'
    `;
    
    const [profiles] = await db.execute(sql, [profileId]);
    const profile = profiles[0];

    if (!profile) return res.status(404).json({ error: 'Handyman not found' });
    res.json(profile);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const getPublicGigs = async (req, res) => {
  try {
    const profileId = req.params.id;
    const sql = `
      SELECT g.*, c.name as category_name 
      FROM gigs g 
      JOIN categories c ON g.category_id = c.id
      WHERE g.handyman_profile_id = ? AND g.is_active = 1
    `;
    const [gigs] = await db.execute(sql, [profileId]);
    res.json(gigs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const getPublicReviews = async (req, res) => {
  try {
    const profileId = req.params.id;
    const sql = `
      SELECT r.rating, r.comment, r.created_at, u.full_name as reviewer_name, g.title as gig_title
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      JOIN gigs g ON b.gig_id = g.id
      JOIN users u ON b.customer_id = u.id
      WHERE g.handyman_profile_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    const [reviews] = await db.execute(sql, [profileId]);
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getMyProfile,
  verifyProfile,
  getStats,
  getMyBookings,
  getMyGigs,
  getPublicProfile,
  getPublicGigs,
  getPublicReviews
};
