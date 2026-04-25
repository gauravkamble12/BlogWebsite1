const mongoose = require('mongoose');
const Blog = require('../models/Blog');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || process.env.mongoUri;

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const blogs = await Blog.find({ slug: { $exists: false } });
    console.log(`Found ${blogs.length} blogs without slugs.`);

    for (let blog of blogs) {
      console.log(`Generating slug for: ${blog.title}`);
      // Simply saving will trigger the pre-save hook
      await blog.save();
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
