const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
// const mongoUri = 'mongodb://127.0.0.1:27017/blog';
const mongoUri = process.env.MONGO_URI || process.env.mongoUri;
mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
  })
  .then(() => console.log('✅ MongoDB connected to Atlas successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));
