const express = require('express');
const Post = require('../models/Post');
const router = express.Router();

// Home page – featured carousel + featured grid + recent with category tabs
router.get('/', async (req, res) => {
  try {
    const { search, category, sort, recentCategory } = req.query;
    let query = {};
    
    // Search functionality
    if (search) {
      // Simple title-only search
      query.title = { $regex: search, $options: 'i' };
    }
    
    // Recent section category filter (separate from header nav)
    const recentCat = recentCategory || category || 'all';
    if (recentCat && recentCat !== 'all') {
      query.category = recentCat;
    }
    
    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'popular') {
      sortOption = { likes: -1 };
    } else if (sort === 'views') {
      sortOption = { views: -1 };
    }
    
    // Recent posts (formerly 'posts')
    const recentPosts = await Post.find(query)
      .sort(sortOption)
      .limit(20);

    // Featured posts for carousel (main featured)
    const featuredCarousel = await Post.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(5);

    // Semi-featured posts for grid (up to 8)
    const featuredGrid = await Post.find({ semiFeatured: true })
      .sort({ createdAt: -1 })
      .limit(8);

    res.render('index', {
      recentPosts,
      featuredCarousel,
      featuredGrid,
      currentCategory: category || 'all',
      currentRecentCategory: recentCat,
      currentSort: sort || 'newest',
      searchTerm: search || '',
      title: 'Home'
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.render('index', { 
      recentPosts: [], 
      featuredCarousel: [],
      featuredGrid: [],
      currentRecentCategory: 'all',
      error: 'Failed to load posts',
      title: 'Home'
    });
  }
});

// Helper to render a category page
async function renderCategoryPage(req, res, categoryName) {
  try {
    const posts = await Post.find({ category: categoryName })
      .sort({ createdAt: -1 })
      .limit(30);

    const featuredArticle = posts.length ? posts[0] : null;
    const recentArticles = posts.length > 1 ? posts.slice(1) : [];

    res.render('category', {
      title: categoryName,
      categoryName,
      featuredArticle,
      recentArticles
    });
  } catch (error) {
    console.error(`Error loading ${categoryName} posts:`, error);
    res.render('category', {
      title: categoryName,
      categoryName,
      featuredArticle: null,
      recentArticles: [],
      error: 'Failed to load articles'
    });
  }
}

// Category pages
router.get('/news', (req, res) => renderCategoryPage(req, res, 'News'));
router.get('/reviews', (req, res) => renderCategoryPage(req, res, 'Reviews'));
router.get('/opinion', (req, res) => renderCategoryPage(req, res, 'Opinion'));

module.exports = router;
