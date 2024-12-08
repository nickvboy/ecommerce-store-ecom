const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const fallbackUri = process.env.MONGO_URI_FALLBACK || 'mongodb://127.0.0.1:27017/ecommerce';
    const mongoUri = process.env.MONGO_URI || fallbackUri;
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 