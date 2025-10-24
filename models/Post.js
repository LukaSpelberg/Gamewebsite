const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  contentHtml: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['News', 'Opinion', 'Reviews']
  },
  author: {
    type: String,
    default: 'Editor'
  },
  image: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  semiFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search functionality
postSchema.index({ title: 'text', content: 'text' });

// Virtual for formatted date
postSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for excerpt
postSchema.virtual('excerpt').get(function() {
  return this.content.substring(0, 150) + '...';
});

module.exports = mongoose.model('Post', postSchema);
