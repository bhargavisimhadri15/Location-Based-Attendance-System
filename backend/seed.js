require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models');

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance-system');
        console.log('Database Connected for seeding...');

        // Clear existing users to avoid duplicates
        await User.deleteMany({ email: { $in: ['admin@geoattend.com', 'employee@geoattend.com'] } });

        const salt = await bcrypt.genSalt(10);
        
        // 1. Create Admin
        const adminPassword = await bcrypt.hash('admin123', salt);
        const admin = new User({
            name: 'System Admin',
            email: 'admin@geoattend.com',
            password: adminPassword,
            role: 'admin'
        });

        // 2. Create Employee
        const employeePassword = await bcrypt.hash('employee123', salt);
        const employee = new User({
            name: 'John Doe',
            email: 'employee@geoattend.com',
            password: employeePassword,
            role: 'employee'
        });

        await admin.save();
        await employee.save();

        console.log('--------------------------------------------------');
        console.log('SEEDING SUCCESSFUL');
        console.log('--------------------------------------------------');
        console.log('ADMIN CREDENTIALS');
        console.log('Email: admin@geoattend.com');
        console.log('Password: admin123');
        console.log('--------------------------------------------------');
        console.log('EMPLOYEE CREDENTIALS');
        console.log('Email: employee@geoattend.com');
        console.log('Password: employee123');
        console.log('--------------------------------------------------');

        process.exit();
    } catch (err) {
        console.error('Seeding error:', err.message);
        process.exit(1);
    }
};

seedUsers();
