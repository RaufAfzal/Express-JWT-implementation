const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.error('MongoDB connection failed:', err);
        process.exit(1);  // Exit the app if unable to connect
    }
};

module.exports = connectDB;


