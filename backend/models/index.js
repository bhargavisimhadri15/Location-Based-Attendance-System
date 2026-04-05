const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User (Admin/Employee)
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' }
}, { timestamps: true });

// Location (Geofence)
const locationSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String },
    coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    radius: { type: Number, required: true } // in meters
}, { timestamps: true });

locationSchema.index({ coordinates: '2dsphere' });

// Attendance
const attendanceSchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    checkIn: {
        time: { type: Date, default: Date.now },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
        accuracy: { type: Number }
    },
    checkOut: {
        time: { type: Date },
        coordinates: { type: [Number] },
        accuracy: { type: Number }
    },
    status: { type: String, enum: ['present', 'absent'], default: 'present' }
}, { timestamps: true });

module.exports = {
    User: mongoose.model('User', userSchema),
    Location: mongoose.model('Location', locationSchema),
    Attendance: mongoose.model('Attendance', attendanceSchema)
};
