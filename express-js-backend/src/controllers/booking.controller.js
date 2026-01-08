const db = require('../config/db');

const createBooking = async (req, res) => {
  try {
    const { gig_id, booking_time, notes } = req.body;

    if (!gig_id || !booking_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [gigs] = await db.execute('SELECT price FROM gigs WHERE id = ?', [gig_id]);
    const gig = gigs[0];

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    await db.execute(
      'INSERT INTO bookings (customer_id, gig_id, booking_time, status, total_price, customer_notes) VALUES (?, ?, ?, "pending", ?, ?)',
      [req.user.id, gig_id, booking_time, gig.price, notes || '']
    );

    res.json({ message: 'Booking created' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Booking failed' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const sql = `
      SELECT b.*, g.title as gig_title, u.full_name as handyman_name,
      (SELECT COUNT(*) FROM reviews r WHERE r.booking_id = b.id) as has_review
      FROM bookings b 
      JOIN gigs g ON b.gig_id = g.id 
      JOIN handyman_profiles hp ON g.handyman_profile_id = hp.id 
      JOIN users u ON hp.user_id = u.id 
      WHERE b.customer_id = ? 
      ORDER BY b.booking_time DESC
    `;
    const [bookings] = await db.execute(sql, [req.user.id]);
    
    // Map has_review to boolean
    const result = bookings.map(b => ({
        ...b,
        reviewed: b.has_review > 0
    }));
    
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    // Verify ownership via gig
    const sql = `
      SELECT b.id 
      FROM bookings b 
      JOIN gigs g ON b.gig_id = g.id 
      JOIN handyman_profiles hp ON g.handyman_profile_id = hp.id 
      WHERE b.id = ? AND hp.user_id = ?
    `;
    
    const [bookings] = await db.execute(sql, [bookingId, req.user.id]);
    if (bookings.length === 0) return res.status(404).json({ error: 'Booking not found or access denied' });

    if (status) {
      await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
    }
    
    res.json({ message: 'Booking updated' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
};

const createReview = async (req, res) => {
  try {
    const { booking_id, rating, comment } = req.body;

    if (!booking_id || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify booking belongs to user and is completed
    const [bookings] = await db.execute(
      'SELECT id FROM bookings WHERE id = ? AND customer_id = ? AND status = "completed"',
      [booking_id, req.user.id]
    );

    if (bookings.length === 0) {
      return res.status(400).json({ error: 'Invalid booking or not completed' });
    }

    await db.execute(
      'INSERT INTO reviews (booking_id, rating, comment) VALUES (?, ?, ?)',
      [booking_id, rating, comment || '']
    );

    res.json({ message: 'Review submitted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Review failed' });
  }
};

module.exports = { createBooking, getMyBookings, updateBookingStatus, createReview };
