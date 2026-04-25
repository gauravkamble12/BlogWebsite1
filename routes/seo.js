const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

/**
 * GENERATE SITEMAP.XML
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' }).select('slug updatedAt');
    const baseUrl = process.env.BASE_URL || 'https://blogwebsite1-q22u.onrender.com';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>`;

    blogs.forEach((blog) => {
      if (blog.slug) {
        xml += `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${blog.updatedAt.toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>`;
      }
    });

    xml += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap optimization error:', err);
    res.status(500).end();
  }
});

module.exports = router;
