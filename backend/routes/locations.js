const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/auth');
const { Location, User } = require('../models');

// @route   GET api/locations
// @desc    Get locations available to the current user
//          - Admin: all locations
//          - Employee: assigned locations only
router.get('/', authMiddleware, async (req, res) => {
    try {
        if (req.user?.role === 'admin') {
            const locations = await Location.find().sort({ createdAt: -1 });
            return res.json(locations);
        }

        const user = await User.findById(req.user.id).populate('assignedLocations');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.json(user.assignedLocations || []);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;

