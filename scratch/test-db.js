
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoUri = process.env.mongoUri || process.env.MONGO_URI;

console.log('Testing connection to:', mongoUri.split('@')[1] || mongoUri); // Hide credentials in log

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', err.message);
    process.exit(1);
  });
