const express = require('express');
const router = express.Router();
const multer = require('multer');
const Blog = require('../models/Blog');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const { blogValidation } = require('../middleware/validation');
const { calculateReadingTime } = require('../utils/readingTime');

const { storage } = require('../config/cloudinary');
const upload = multer({ storage });


/**
 * HOME – SHOW ALL BLOGS (PUBLIC) WITH PAGINATION & SEARCH & CATEGORY
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    let query = { status: 'published' };
    
    // Handle "My Feed" (Following) logic
    if (req.query.feed === 'following' && req.session.userId) {
      const Follow = require('../models/Follow');
      const following = await Follow.find({ follower: req.session.userId }).select('following');
      const followingIds = following.map(f => f.following);
      query.author = { $in: followingIds };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      query.category = category;
    }

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    const blogs = await Blog.find(query)
      .populate('author')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const blogsWithExtras = await Promise.all(
      blogs.map(async blog => {
        const likesCount = await Like.countDocuments({ blog: blog._id });

        const comments = await Comment.find({ blog: blog._id })
          .populate('user')
          .sort({ createdAt: -1 });
        const commentMap = {};
        comments.forEach(c => {
          c = c.toObject();
          c.replies = [];
          commentMap[c._id] = c;
        });
        const rootComments = [];
        comments.forEach(c => {
          if (c.parent) {
            commentMap[c.parent]?.replies.push(commentMap[c._id]);
          } else {
            rootComments.push(commentMap[c._id]);
          }
        });
        return {
          ...blog.toObject(),
          likesCount,
          commentsCount: comments.length,
          comments,
          readingTime: calculateReadingTime(blog.content),
        };
      })
    );

    res.render('index', {
      blogs: blogsWithExtras,
      currentPage: page,
      totalPages,
      totalBlogs,
      search,
      category,
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.render('index', {
      blogs: [],
      currentPage: 1,
      totalPages: 1,
      totalBlogs: 0,
      search: '',
      category: '',
    });
  }
});

/**
 * SHOW CREATE BLOG PAGE
 */
router.get('/blogs/new', auth, (req, res) => {
  res.render('blogs/create');
});

/**
 * CREATE BLOG
 */
router.post('/blogs', upload.array('images', 5), blogValidation, async (req, res) => {
  try {
    const images = req.files.map(file => file.path); // Use path for Cloudinary URL

    const tags = req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [];

    const blog = new Blog({
      title: req.body.title,
      content: req.body.content,
      images,
      category: req.body.category || 'Other',
      tags,
      author: req.session.userId,
    });

    await blog.save();

    // Trigger Automated Followers Alert (Asynchronous)
    (async () => {
      try {
        const Follow = require('../models/Follow');
        const User = require('../models/User');
        const { sendNewPostAlert } = require('../utils/newsletterService');
        
        const author = await User.findById(req.session.userId);
        const followers = await Follow.find({ following: req.session.userId }).populate('follower');
        const emails = followers.map(f => f.follower.email).filter(e => !!e);
        
        if (emails.length > 0) {
          sendNewPostAlert(author.name, emails, {
            ...blog.toObject(),
            readingTime: calculateReadingTime(blog.content)
          });
        }
      } catch (err) {
        console.error('Automation Failed:', err);
      }
    })();

    return res.status(200).json({ success: true, redirectUrl: '/' });
  } catch (err) {
    console.error('Error creating blog:', err);
    return res.status(500).json({ error: 'Failed to create blog' });
  }
});

/**
 * SHOW EDIT PAGE
 */
router.get('/blogs/:id/edit', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog || blog.author.toString() !== req.session.userId) {
      return res.redirect('/');
    }

    res.render('blogs/edit', { blog });
  } catch (err) {
    console.error('Error loading edit page:', err);
    res.redirect('/');
  }
});

/**
 * UPDATE BLOG
 */
router.post('/blogs/:id/update', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog || blog.author.toString() !== req.session.userId) {
      return res.redirect('/');
    }

    const tags = req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [];

    await Blog.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      tags: tags
    });

    return res.status(200).json({ success: true, redirectUrl: '/' });
  } catch (err) {
    console.error('Error updating blog:', err);
    return res.status(500).json({ error: 'Failed to update blog' });
  }
});

/**
 * DELETE BLOG
 */
router.post('/blogs/:id/delete', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog || blog.author.toString() !== req.session.userId) {
      return res.redirect('/');
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.redirect('/');
  }
});
// SHOW SINGLE BLOG (PUBLIC)
router.get('/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author');

    if (!blog) {
      return res.redirect('/');
    }

    const likesCount = await Like.countDocuments({ blog: blog._id });
    const comments = await Comment.find({ blog: blog._id }).populate('user');
    
    // Calculate Reading Time
    const readingTime = calculateReadingTime(blog.content);

    // Fetch Related Blogs
    const relatedBlogs = await Blog.find({
      category: blog.category,
      _id: { $ne: blog._id }
    }).limit(3).populate('author');

    // Check if current user follows author
    let isFollowing = false;
    if (req.session.userId && blog.author) {
      const Follow = require('../models/Follow');
      isFollowing = await Follow.exists({
        follower: req.session.userId,
        following: blog.author._id
      });
    }

    res.render('blogs/show', {
      blog: {
        ...blog.toObject(),
        likesCount,
        commentsCount: comments.length,
        comments,
        readingTime,
        relatedBlogs,
        isFollowing
      },
    });
  } catch (err) {
    console.error('Error fetching single blog:', err);
    res.redirect('/');
  }
});

module.exports = router;
