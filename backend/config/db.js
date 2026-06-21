const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '../db.log');

const connectDB = async () => {
  try {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] Connecting to MongoDB at: ${process.env.MONGODB_URI}\n`);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] MongoDB Connected: ${conn.connection.host}\n`);
  } catch (error) {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] MongoDB Connection Error: ${error.message}\n`);
    process.exit(1);
  }
};

module.exports = connectDB;
