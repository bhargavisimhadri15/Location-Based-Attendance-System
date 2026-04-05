const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { Location, Attendance, User } = require('../models');

// @route   GET api/admin/users
// @desc    Get all employees
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({ role: 'employee' })
            .select('-password')
            .populate('assignedLocations', 'name address radius');
        res.json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/users
// @desc    Create a new employee
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
    const { name, email, password, assignedLocations } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ msg: 'name, email, and password are required' });
    }

    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ msg: 'User already exists' });

        let resolvedLocations = [];
        if (typeof assignedLocations !== 'undefined') {
            if (!Array.isArray(assignedLocations)) {
                return res.status(400).json({ msg: 'assignedLocations must be an array of location ids' });
            }

            for (const id of assignedLocations) {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ msg: 'Invalid location id in assignedLocations' });
                }
            }

            const found = await Location.find({ _id: { $in: assignedLocations } }).select('_id');
            resolvedLocations = found.map(l => l._id);
        }

        const user = new User({
            name,
            email,
            password,
            role: 'employee',
            assignedLocations: resolvedLocations
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const created = await User.findById(user._id)
            .select('-password')
            .populate('assignedLocations', 'name address radius');

        res.status(201).json(created);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/users/:id
// @desc    Update an employee (profile + assigned locations)
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'Invalid user id' });
    }

    const { name, email, password, assignedLocations } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.role !== 'employee') return res.status(400).json({ msg: 'Only employees can be updated here' });

        if (typeof email === 'string' && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ msg: 'Email already in use' });
            user.email = email;
        }
        if (typeof name === 'string') user.name = name;

        if (typeof password === 'string' && password.length > 0) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        if (typeof assignedLocations !== 'undefined') {
            if (!Array.isArray(assignedLocations)) {
                return res.status(400).json({ msg: 'assignedLocations must be an array of location ids' });
            }

            for (const locId of assignedLocations) {
                if (!mongoose.Types.ObjectId.isValid(locId)) {
                    return res.status(400).json({ msg: 'Invalid location id in assignedLocations' });
                }
            }

            const found = await Location.find({ _id: { $in: assignedLocations } }).select('_id');
            user.assignedLocations = found.map(l => l._id);
        }

        await user.save();

        const updated = await User.findById(id)
            .select('-password')
            .populate('assignedLocations', 'name address radius');

        res.json(updated);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete an employee (blocked if attendance exists)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'Invalid user id' });
    }

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.role !== 'employee') return res.status(400).json({ msg: 'Only employees can be deleted here' });

        const inUse = await Attendance.exists({ employeeId: id });
        if (inUse) {
            return res.status(409).json({ msg: 'Cannot delete employee: attendance records exist.' });
        }

        await User.findByIdAndDelete(id);
        res.json({ msg: 'Employee deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/locations
// @desc    Add a new location (geofence)
router.post('/locations', authMiddleware, adminMiddleware, async (req, res) => {
    const { name, coordinates, radius, address } = req.body;
    try {
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
            return res.status(400).json({ msg: 'Coordinates must be [longitude, latitude]' });
        }
        if (!Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) {
            return res.status(400).json({ msg: 'Coordinates must be finite numbers' });
        }
        if (!Number.isFinite(radius) || radius <= 0) {
            return res.status(400).json({ msg: 'Radius must be a positive number' });
        }

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
        if (!Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) {
            return res.status(400).json({ msg: 'Coordinates must be finite numbers' });
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
