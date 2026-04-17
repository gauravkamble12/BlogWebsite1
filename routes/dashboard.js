const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

/**
 * @route   GET /dashboard
 * @desc    Author Analytics Dashboard
 * @access  Private
 */
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.session.userId;

    // 1. Get all blogs by the author
    const blogs = await Blog.find({ author: userId }).sort({ createdAt: -1 });
    const blogIds = blogs.map(b => b._id);

    // 2. Aggregate stats
    const totalBlogs = blogs.length;
    
    const [totalLikes, totalComments] = await Promise.all([
      Like.countDocuments({ blog: { $in: blogIds } }),
      Comment.countDocuments({ blog: { $in: blogIds } })
    ]);

    // 3. Get detailed stats for each blog (top 5 by engagement could be cool, but let's do all for now)
    const blogsWithStats = await Promise.all(blogs.map(async (blog) => {
      const [likes, comments] = await Promise.all([
        Like.countDocuments({ blog: blog._id }),
        Comment.countDocuments({ blog: blog._id })
      ]);
      return {
        ...blog.toObject(),
        likes,
        comments,
        engagement: likes + comments
      };
    }));

    // Sort by engagement for the "Top Performance" section
    const topBlogs = [...blogsWithStats].sort((a, b) => b.engagement - a.engagement).slice(0, 3);

    res.render('dashboard', {
      stats: {
        totalBlogs,
        totalLikes,
        totalComments,
        avgEngagement: totalBlogs > 0 ? ((totalLikes + totalComments) / totalBlogs).toFixed(1) : 0
      },
      blogs: blogsWithStats,
      topBlogs
    });
  } catch (err) {
    console.error('Dashboard Error:', err);
    res.status(500).render('blogs/error', { message: 'Failed to load dashboard statistics.' });
  }
});

module.exports = router;
