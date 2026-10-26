const express = require('express');
const router = express.Router();
const MortalityAlert = require('../models/MortalityAlert');
const { authMiddleware } = require('../middleware/authMiddleware'); // adjust path to match your project

// GET /api/alerts - fetch mortality alerts for the logged-in user's role.
// e.g. the Veterinarian calls this to see their mortality-threshold alerts.
// ?onlyUnread=true filters to unread ones only.
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { onlyUnread } = req.query;
    const filter = { targetRole: req.userRole }; // set by authMiddleware
    if (onlyUnread === 'true') filter.isRead = false;

    const alerts = await MortalityAlert.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// PATCH /api/alerts/:id/read - mark a single alert as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const alert = await MortalityAlert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;