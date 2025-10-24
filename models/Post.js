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
  // Store image binary in DB (preferred). For backwards compatibility we keep an imageUrl field.
  image: {
    data: Buffer,
    contentType: String
  },
  imageUrl: {
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

// Ensure virtuals are included when converting documents to objects/JSON
postSchema.set('toObject', { virtuals: true });
postSchema.set('toJSON', { virtuals: true });

// Virtual to provide an image src for templates (data URL when stored in DB, otherwise fallback to imageUrl)
postSchema.virtual('imageSrc').get(function() {
  if (this.image && this.image.data) {
    const base64 = this.image.data.toString('base64');
    return `data:${this.image.contentType};base64,${base64}`;
  }
  return this.imageUrl || '';
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
