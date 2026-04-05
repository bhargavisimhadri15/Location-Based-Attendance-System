const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { Location, Attendance, User } = require('../models');

// @route   GET api/admin/users
// @desc    Get all employees
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({ role: 'employee' }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/locations
// @desc    Add a new location (geofence)
router.post('/locations', authMiddleware, adminMiddleware, async (req, res) => {
    const { name, coordinates, radius, address } = req.body;
    try {
        const newLocation = new Location({
            name,
            address,
            coordinates: {
                type: 'Point',
                coordinates // [longitude, latitude]
            },
            radius
        });

        const location = await newLocation.save();
        res.json(location);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/locations
// @desc    Get all locations
router.get('/locations', authMiddleware, async (req, res) => {
    try {
        const locations = await Location.find();
        res.json(locations);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/locations/:id
// @desc    Update a location (geofence)
router.put('/locations/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'Invalid location id' });
    }

    const { name, coordinates, radius, address } = req.body;

    const update = {};
    if (typeof name === 'string') update.name = name;
    if (typeof address === 'string') update.address = address;
    if (typeof radius !== 'undefined') update.radius = radius;

    if (typeof coordinates !== 'undefined') {
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
            return res.status(400).json({ msg: 'Coordinates must be [longitude, latitude]' });
        }
        update.coordinates = { type: 'Point', coordinates };
    }

    try {
        const location = await Location.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        if (!location) return res.status(404).json({ msg: 'Location not found' });
        res.json(location);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/locations/:id
// @desc    Delete a location (geofence)
router.delete('/locations/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'Invalid location id' });
    }

    try {
        const inUse = await Attendance.exists({ locationId: id });
        if (inUse) {
            return res.status(409).json({ msg: 'Cannot delete location: it is referenced by attendance records.' });
        }

        const deleted = await Location.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ msg: 'Location not found' });

        res.json({ msg: 'Location deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/attendance
// @desc    Get all attendance records
router.get('/attendance', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const records = await Attendance.find()
            .populate('employeeId', 'name email')
            .populate('locationId', 'name')
            .sort({ 'checkIn.time': -1 });
        res.json(records);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
