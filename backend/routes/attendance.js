const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/auth');
const { Attendance, Location, User } = require('../models');
const { isWithinRange } = require('../utils/geoUtils');

// @route   POST api/attendance/checkin
// @desc    Check-in to a location
router.post('/checkin', authMiddleware, async (req, res) => {
    const { locationId, userCoordinates, accuracy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(locationId)) {
        return res.status(400).json({ msg: 'Invalid location id' });
    }

    if (!Array.isArray(userCoordinates) || userCoordinates.length !== 2) {
        return res.status(400).json({ msg: 'userCoordinates must be [longitude, latitude]' });
    }

    // 1. Accuracy Handling (Threshold 50 meters, for instance)
    if (!Number.isFinite(accuracy) || accuracy > 50) {
        return res.status(400).json({ msg: 'Location accuracy too low' });
    }

    try {
        if (req.user?.role !== 'admin') {
            const user = await User.findById(req.user.id).select('assignedLocations role');
            if (!user) return res.status(404).json({ msg: 'User not found' });

            const isAssigned = (user.assignedLocations || []).some((id) => String(id) === String(locationId));
            if (!isAssigned) {
                return res.status(403).json({ msg: 'Location not assigned to this employee' });
            }
        }

        const location = await Location.findById(locationId);
        if (!location) {
            return res.status(404).json({ msg: 'Location not found' });
        }

        // 2. Distance Validation
        const withinRange = isWithinRange(userCoordinates, location.coordinates.coordinates, location.radius);
        if (!withinRange) {
            return res.status(403).json({ msg: 'Out of range. You must be within the defined boundary.' });
        }

        // 3. Consistency Rules: Check for duplicate check-in today
        // Find if user already checked in today at any location 
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeCheckIn = await Attendance.findOne({
            employeeId: req.user.id,
            'checkIn.time': { $gte: today },
            'checkOut.time': { $exists: false }
        });

        if (activeCheckIn) {
            return res.status(400).json({ msg: 'Already checked in' });
        }

        const newAttendance = new Attendance({
            employeeId: req.user.id,
            locationId,
            checkIn: {
                coordinates: userCoordinates,
                accuracy
            }
        });

        await newAttendance.save();
        res.json(newAttendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/attendance/checkout
// @desc    Check-out from current active session
router.post('/checkout', authMiddleware, async (req, res) => {
    const { userCoordinates, accuracy } = req.body;

    if (!Array.isArray(userCoordinates) || userCoordinates.length !== 2) {
        return res.status(400).json({ msg: 'userCoordinates must be [longitude, latitude]' });
    }

    if (!Number.isFinite(accuracy) || accuracy > 50) {
        return res.status(400).json({ msg: 'Location accuracy too low' });
    }

    try {
        // Disallow check-outs without valid prior check-in
        const attendance = await Attendance.findOne({
            employeeId: req.user.id,
            'checkOut.time': { $exists: false }
        }).populate('locationId');

        if (!attendance) {
            return res.status(400).json({ msg: 'No active check-in session' });
        }

        // Verify distance again for check-out
        const location = attendance.locationId;
        const withinRange = isWithinRange(userCoordinates, location.coordinates.coordinates, location.radius);
        if (!withinRange) {
            return res.status(403).json({ msg: 'Out of range. You must be within the defined boundary for check-out.' });
        }

        attendance.checkOut = {
            time: Date.now(),
            coordinates: userCoordinates,
            accuracy
        };

        await attendance.save();
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/attendance/status
// @desc    Check current attendance status for the user
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const attendance = await Attendance.findOne({
          employeeId: req.user.id,
          'checkOut.time': { $exists: false }
        }).populate('locationId');
        
        res.json(attendance || { msg: 'No active check-in' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
