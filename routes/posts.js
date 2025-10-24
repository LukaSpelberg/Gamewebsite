const express = require('express');
const Post = require('../models/Post');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { convertMarkdownToHtml } = require('../utils/markdown');
const multer = require('multer');

// Use memory storage so uploaded files are available as buffers and can be stored directly in DB
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Show all posts (admin view)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render('posts/index', { posts, title: 'All Posts' });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.render('posts/index', { posts: [], error: 'Failed to load posts', title: 'All Posts' });
  }
});

// Show new post form
router.get('/new', (req, res) => {
  res.render('posts/new', { post: {}, title: 'New Post' });
});

// Create new post (supports optional file upload field `imageFile` and/or image URL input `image`)
router.post('/', upload.single('imageFile'), [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('category').isIn(['News', 'Opinion', 'Reviews']).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('posts/new', {
        post: req.body,
        errors: errors.array(),
        title: 'New Post'
      });
    }

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      contentHtml: convertMarkdownToHtml(req.body.content),
      category: req.body.category,
      author: req.body.author || 'Editor',
      imageUrl: req.body.image || '',
      featured: req.body.featured === 'on'
    });

    // If an image file was uploaded, store its buffer and mimetype in the document
    if (req.file && req.file.buffer) {
      post.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      // clear any imageUrl fallback
      post.imageUrl = '';
    }

    await post.save();
    res.redirect(`/posts/${post._id}`);
  } catch (error) {
    console.error('Error creating post:', error);
    res.render('posts/new', {
      post: req.body,
      error: 'Failed to create post',
      title: 'New Post'
    });
  }
});

// Show single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).render('error', { error: 'Post not found' });
    }
    
    // Increment view count
    post.views += 1;
    await post.save();
    
    // Ensure HTML content exists for rendering
    const renderPost = post.toObject();
    renderPost.contentHtml = renderPost.contentHtml && renderPost.contentHtml.trim()
      ? renderPost.contentHtml
      : convertMarkdownToHtml(renderPost.content || '');
    
    res.render('posts/show', { post: renderPost, title: post.title });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).render('error', { error: 'Failed to load post' });
  }
});

// Show edit form
router.get('/:id/edit', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).render('error', { error: 'Post not found' });
    }
    res.render('posts/edit', { post, title: 'Edit Post' });
  } catch (error) {
    console.error('Error fetching post for edit:', error);
    res.status(500).render('error', { error: 'Failed to load post' });
  }
});

// Update post (supports optional file upload `imageFile`)
router.put('/:id', upload.single('imageFile'), [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('category').isIn(['News', 'Opinion', 'Reviews']).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const post = await Post.findById(req.params.id);
      return res.render('posts/edit', {
        post: { ...post.toObject(), ...req.body },
        errors: errors.array(),
        title: 'Edit Post'
      });
    }

    const updateData = {
      title: req.body.title,
      content: req.body.content,
      contentHtml: convertMarkdownToHtml(req.body.content),
      category: req.body.category,
      author: req.body.author || 'Editor',
      imageUrl: req.body.image || '',
      featured: req.body.featured === 'on'
    };

    // If a new file was uploaded, store it in image (and remove imageUrl fallback)
    if (req.file && req.file.buffer) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      updateData.imageUrl = '';
    }

    const post = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!post) {
      return res.status(404).render('error', { error: 'Post not found' });
    }

    res.redirect(`/posts/${post._id}`);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).render('error', { error: 'Failed to update post' });
  }
});

// Delete post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).render('error', { error: 'Post not found' });
    }
    res.redirect('/posts');
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).render('error', { error: 'Failed to delete post' });
  }
});

// Like post (AJAX endpoint)
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    post.likes += 1;
    await post.save();
    
    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

module.exports = router;
