const mongoose = require('mongoose');
const Blog = require('../models/Blog');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || process.env.mongoUri;
const authorId = '69e1c012e54b0816234724b4';

const blogData = {
  title: '10 Essential SEO Tips for Your Node.js Blog in 2026',
  content: `
    <h2>Introduction</h2>
    <p>Building a blog with Node.js is a great way to showcase your development skills. But building the site is only half the battle. If you want people to actually read your stories, you need to optimize for Search Engines (SEO).</p>
    
    <h2>1. Use Server-Side Rendering (SSR)</h2>
    <p>Google loves HTML. By using a template engine like EJS or a framework like Next.js, you ensure that the content is already in the HTML when Google crawls it. Avoid loading your main content via client-side APIs if possible.</p>
    
    <h2>2. Implement Clean Slugs</h2>
    <p>Stop using IDs in your URLs! A URL like <code>/blog/how-to-rank-on-google</code> is much better than <code>/blog/64f1...</code>. It tells both the user and the search engine exactly what the page is about.</p>
    
    <h2>3. Optimize Your Meta Tags</h2>
    <p>The <strong>Meta Title</strong> and <strong>Meta Description</strong> are your "advertisements" on Google. Make sure they are catchy, contain your primary keyword, and are the right length (under 60 and 160 characters respectively).</p>
    
    <h2>4. Use JSON-LD Structured Data</h2>
    <p>Structured data helps Google understand that your page is a blog post. It can lead to "rich snippets" in search results, which improves your click-through rate.</p>
    
    <h2>5. Focus on Content Quality</h2>
    <p>No amount of technical SEO can save poor content. Write for humans first, search engines second. Use clear headings (H2, H3) and break up long paragraphs.</p>
    
    <p>By following these steps, you'll be well on your way to ranking your Node.js blog in 2026!</p>
  `,
  category: 'Technology',
  tags: ['SEO', 'Node.js', 'Web Development'],
  author: authorId,
  metaTitle: 'SEO for Node.js: 10 Tips to Rank Your Blog in 2026',
  metaDescription: 'Learn how to optimize your Node.js and Express blog for Google. From SSR to Slugs, these 10 tips will help you rank higher and get more traffic.',
  status: 'published'
};

async function createBlog() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const blog = new Blog(blogData);
    await blog.save();

    console.log('Blog created successfully!');
    console.log('Slug:', blog.slug);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create blog:', err);
    process.exit(1);
  }
}

createBlog();
