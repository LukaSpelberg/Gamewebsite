const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Post = require('../models/Post');
const { body, validationResult } = require('express-validator');
const { requireAuth, redirectIfLoggedIn } = require('../middleware/auth');
const { convertMarkdownToHtml } = require('../utils/markdown');
const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Memory upload (for storing images directly in DB). We keep disk `upload` for the rich-text-image endpoint
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Flash message helper
const flash = (req, type, message) => {
  req.session[`flash${type.charAt(0).toUpperCase() + type.slice(1)}`] = message;
};

// Admin login page
router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('admin/login', { 
    title: 'Admin Login',
    layout: false // Don't use admin layout for login
  });
});

// Admin login process
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/login', {
        title: 'Admin Login',
        errors: errors.array(),
        username: req.body.username
      });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }],
      isActive: true 
    });

    if (!user) {
      flash(req, 'error', 'Invalid username or password');
      return res.redirect('/admin/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      flash(req, 'error', 'Invalid username or password');
      return res.redirect('/admin/login');
    }

    // Update last login
    await user.updateLastLogin();

    // Set session
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    flash(req, 'success', 'Welcome back!');
    res.redirect('/admin');
  } catch (error) {
    console.error('Login error:', error);
    flash(req, 'error', 'Login failed. Please try again.');
    res.redirect('/admin/login');
  }
});

// Admin dashboard – Featured posts manager
router.get('/', requireAuth, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ featured: -1, semiFeatured: -1, createdAt: -1 })
      .select('title category createdAt featured semiFeatured author');

    res.render('admin/dashboard', {
      title: 'Featured Manager',
      layout: 'admin/layout',
      posts
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    flash(req, 'error', 'Failed to load dashboard');
    res.redirect('/admin/login');
  }
});

// Update featured posts (bulk)
router.post('/featured', requireAuth, async (req, res) => {
  try {
    const featuredSelected = Array.isArray(req.body.featured)
      ? req.body.featured
      : (req.body.featured ? [req.body.featured] : []);
    
    const semiFeaturedSelected = Array.isArray(req.body.semiFeatured)
      ? req.body.semiFeatured
      : (req.body.semiFeatured ? [req.body.semiFeatured] : []);

    // Reset all featured statuses
    await Post.updateMany({}, { $set: { featured: false, semiFeatured: false } });
    
    // Set new featured posts
    if (featuredSelected.length) {
      await Post.updateMany({ _id: { $in: featuredSelected } }, { $set: { featured: true } });
    }
    
    // Set new semi-featured posts
    if (semiFeaturedSelected.length) {
      await Post.updateMany({ _id: { $in: semiFeaturedSelected } }, { $set: { semiFeatured: true } });
    }
    
    flash(req, 'success', `Featured posts updated: ${featuredSelected.length} featured, ${semiFeaturedSelected.length} semi-featured`);
    res.redirect('/admin');
  } catch (error) {
    console.error('Update featured error:', error);
    flash(req, 'error', 'Failed to update featured posts');
    res.redirect('/admin');
  }
});

// Admin posts management
router.get('/posts', requireAuth, async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'popular') {
      sortOption = { likes: -1 };
    } else if (sort === 'views') {
      sortOption = { views: -1 };
    }
    
    const posts = await Post.find(query)
      .sort(sortOption)
      .limit(50);

    res.render('admin/posts', {
      title: 'Manage Posts',
      layout: 'admin/layout',
      posts,
      currentCategory: category || 'all',
      currentSort: sort || 'newest',
      searchTerm: search || ''
    });
  } catch (error) {
    console.error('Posts management error:', error);
    flash(req, 'error', 'Failed to load posts');
    res.redirect('/admin');
  }
});

// Create new post (admin)
router.get('/posts/new', requireAuth, (req, res) => {
  res.render('admin/posts/new', { 
    title: 'Create New Post',
    layout: 'admin/layout',
    post: {},
    useTinyMCE: false // Don't load TinyMCE for new post page
  });
});

// Create post process
// Create post (admin) - supports optional imageFile upload (stored in DB)
router.post('/posts', requireAuth, memoryUpload.single('imageFile'), [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('category').isIn(['News', 'Opinion', 'Reviews']).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/posts/new', {
        title: 'Create New Post',
        layout: 'admin/layout',
        post: req.body,
        errors: errors.array()
      });
    }

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      contentHtml: convertMarkdownToHtml(req.body.content), // Convert markdown to HTML
      category: req.body.category,
      author: req.body.author || req.session.user.username,
      imageUrl: req.body.image || '',
      featured: req.body.featured === 'on',
      semiFeatured: req.body.semiFeatured === 'on'
    });

    if (req.file && req.file.buffer) {
      post.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      post.imageUrl = '';
    }

    await post.save();
    flash(req, 'success', 'Post created successfully!');
    res.redirect('/admin/posts');
  } catch (error) {
    console.error('Create post error:', error);
    flash(req, 'error', 'Failed to create post');
    res.redirect('/admin/posts/new');
  }
});

// Edit post (admin)
router.get('/posts/:id/edit', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      flash(req, 'error', 'Post not found');
      return res.redirect('/admin/posts');
    }
    res.render('admin/posts/edit', { 
      title: 'Edit Post',
      layout: 'admin/layout',
      post,
      useTinyMCE: true // Use TinyMCE for edit page
    });
  } catch (error) {
    console.error('Edit post error:', error);
    flash(req, 'error', 'Failed to load post');
    res.redirect('/admin/posts');
  }
});

// Update post process
router.put('/posts/:id', requireAuth, memoryUpload.single('imageFile'), [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('category').isIn(['News', 'Opinion', 'Reviews']).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const post = await Post.findById(req.params.id);
      return res.render('admin/posts/edit', {
        title: 'Edit Post',
        layout: 'admin/layout',
        post: { ...post.toObject(), ...req.body },
        errors: errors.array()
      });
    }

    const updateData = {
      title: req.body.title,
      content: req.body.content,
      contentHtml: convertMarkdownToHtml(req.body.content), // Convert markdown to HTML
      category: req.body.category,
      author: req.body.author || req.session.user.username,
      imageUrl: req.body.image || '',
      featured: req.body.featured === 'on',
      semiFeatured: req.body.semiFeatured === 'on'
    };

    if (req.file && req.file.buffer) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      updateData.imageUrl = '';
    }

    const post = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!post) {
      flash(req, 'error', 'Post not found');
      return res.redirect('/admin/posts');
    }

    flash(req, 'success', 'Post updated successfully!');
    res.redirect('/admin/posts');
  } catch (error) {
    console.error('Update post error:', error);
    flash(req, 'error', 'Failed to update post');
    res.redirect('/admin/posts');
  }
});

// Delete post (admin)
router.delete('/posts/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      flash(req, 'error', 'Post not found');
    } else {
      flash(req, 'success', 'Post deleted successfully!');
    }
    res.redirect('/admin/posts');
  } catch (error) {
    console.error('Delete post error:', error);
    flash(req, 'error', 'Failed to delete post');
    res.redirect('/admin/posts');
  }
});

// Image upload for rich text editor
router.post('/upload-image', requireAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const imageUrl = `/uploads/images/${req.file.filename}`;
    
    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/admin/login');
  });
});

module.exports = router;
