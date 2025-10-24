// Main JavaScript file for GameNews website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive features
    initLikeButtons();
    initSearchForm();
    initImagePreview();
    initFormValidation();
    initSmoothScrolling();
    initFeaturedCarousel();
    initArticlePreview();
    initMarkdownPreview();
    initCategoryFilter();
});

// Like button functionality
function initLikeButtons() {
    const likeButtons = document.querySelectorAll('.like-btn, .like-stat');
    
    likeButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const postId = this.dataset.postId;
            if (!postId) return;
            
            try {
                const response = await fetch(`/posts/${postId}/like`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    updateLikeCount(postId, data.likes);
                    showNotification('Article liked!', 'success');
                } else {
                    showNotification('Failed to like article', 'error');
                }
            } catch (error) {
                console.error('Error liking post:', error);
                showNotification('Failed to like article', 'error');
            }
        });
    });
}

// Update like count in the UI
function updateLikeCount(postId, newCount) {
    const likeElements = document.querySelectorAll(`[data-post-id="${postId}"] .like-count`);
    likeElements.forEach(element => {
        element.textContent = newCount;
    });
    
    // Also update any other like count displays
    const allLikeCounts = document.querySelectorAll('.like-count');
    allLikeCounts.forEach(element => {
        if (element.textContent !== newCount.toString()) {
            element.textContent = newCount;
        }
    });
}

// Search form enhancements
function initSearchForm() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    
    if (searchForm && searchInput) {
        // Add search suggestions (basic implementation)
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length > 2) {
                // Could implement search suggestions here
                console.log('Search query:', query);
            }
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
}

// Image preview functionality for forms
function initImagePreview() {
    const imageInputs = document.querySelectorAll('input[name="image"]');
    
    imageInputs.forEach(input => {
        input.addEventListener('input', function() {
            const url = this.value.trim();
            if (url && isValidImageUrl(url)) {
                showImagePreview(url, this);
            } else {
                hideImagePreview(this);
            }
        });
    });
}

// Check if URL is a valid image
function isValidImageUrl(url) {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
    return imageExtensions.test(url) || url.includes('unsplash.com') || url.includes('picsum.photos');
}

// Show image preview
function showImagePreview(url, input) {
    let preview = input.parentNode.querySelector('.image-preview');
    
    if (!preview) {
        preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.innerHTML = `
            <div class="preview-container">
                <img src="${url}" alt="Preview" class="preview-image">
                <button type="button" class="preview-close">&times;</button>
            </div>
        `;
        input.parentNode.appendChild(preview);
        
        // Add close functionality
        const closeBtn = preview.querySelector('.preview-close');
        closeBtn.addEventListener('click', function() {
            hideImagePreview(input);
        });
    } else {
        const img = preview.querySelector('.preview-image');
        img.src = url;
    }
}

// Hide image preview
function hideImagePreview(input) {
    const preview = input.parentNode.querySelector('.image-preview');
    if (preview) {
        preview.remove();
    }
}

// Form validation
function initFormValidation() {
    const forms = document.querySelectorAll('.post-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    });
}

// Validate entire form
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error
    removeFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = `${getFieldLabel(field)} is required`;
        isValid = false;
    }
    
    // URL validation for image field
    if (fieldName === 'image' && value && !isValidImageUrl(value)) {
        errorMessage = 'Please enter a valid image URL';
        isValid = false;
    }
    
    // Title length validation
    if (fieldName === 'title' && value && value.length > 200) {
        errorMessage = 'Title must be less than 200 characters';
        isValid = false;
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Get field label
function getFieldLabel(field) {
    const label = field.parentNode.querySelector('label');
    return label ? label.textContent.replace('*', '').trim() : field.name;
}

// Show field error
function showFieldError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.classList.add('error');
    field.parentNode.appendChild(errorDiv);
}

// Remove field error
function removeFieldError(field) {
    field.classList.remove('error');
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .field-error {
        color: #e74c3c;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    
    .form-input.error,
    .form-textarea.error,
    .form-select.error {
        border-color: #e74c3c;
    }
    
    .image-preview {
        margin-top: 1rem;
    }
    
    .preview-container {
        position: relative;
        display: inline-block;
        max-width: 300px;
    }
    
    .preview-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
        border: 2px solid #e9ecef;
    }
    
    .preview-close {
        position: absolute;
        top: 5px;
        right: 5px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
`;
document.head.appendChild(style);

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Test function for markdown preview
window.testMarkdownPreview = function() {
    const markdownPreview = document.getElementById('markdown-preview');
    if (markdownPreview) {
        markdownPreview.innerHTML = '<h1>Test Heading</h1><p>This is a <strong>test</strong> of the markdown preview.</p><ul><li>Item 1</li><li>Item 2</li></ul>';
        console.log('Test preview updated');
    } else {
        console.log('Markdown preview element not found');
    }
};

// Export functions for global access
window.GameNews = {
    showNotification,
    updateLikeCount,
    validateForm,
    validateField
};

// Featured carousel logic - improved: support external dots, prev/next, data-interval and cut-off side slides
function initFeaturedCarousel() {
    const carousel = document.querySelector('.featured-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    // Allow dots to live outside the carousel container (placed below the carousel in markup)
    const dots = Array.from(document.querySelectorAll('.carousel-dot'));
    const dataInterval = parseInt(carousel.dataset.interval, 10);
    const intervalMs = !isNaN(dataInterval) && dataInterval > 0 ? dataInterval : 5000;

    if (slides.length === 0) return;

    // Handle 1 or 2 slides gracefully
    if (slides.length === 1) {
        slides[0].classList.add('is-active');
        return;
    }

    if (slides.length === 2) {
        // Make one active and the other visible to the side
        slides.forEach((s, i) => s.className = 'carousel-slide');
        slides[0].classList.add('is-left');
        slides[1].classList.add('is-active');
        if (dots.length >= 2) {
            dots.forEach((d, i) => d.classList.toggle('active', i === 1));
        }
        return;
    }

    let currentIndex = 0;
    let isAnimating = false;
    let timer;

    // Determine logical position for each slide relative to centerIndex
    const getSlidePosition = (slideIndex, centerIndex) => {
        const diff = (slideIndex - centerIndex + slides.length) % slides.length;
        if (diff === 0) return 'center';
        if (diff === 1) return 'right';
        if (diff === slides.length - 1) return 'left';
        return 'hidden';
    };

    // Apply classes and positions to all slides in one pass
    // Accepts newCenter and previousCenter so we can detect which slides
    // are moving from left -> right and speed them up briefly to avoid a visible gap.
    const updateAllSlides = (newCenter, prevCenter = null) => {
        slides.forEach((slide, i) => {
            const newPos = getSlidePosition(i, newCenter);
            const prevPos = (prevCenter === null) ? null : getSlidePosition(i, prevCenter);

            // Reset base classes
            slide.className = 'carousel-slide';
            slide.style.order = '';

            // Add new positional class
            switch (newPos) {
                case 'center':
                    slide.classList.add('is-active');
                    break;
                case 'left':
                    slide.classList.add('is-left');
                    break;
                case 'right':
                    slide.classList.add('is-right');
                    break;
                default:
                    slide.classList.add('is-hidden');
            }

            // If the slide moved from left -> right, make it transition quicker
            if (prevPos === 'left' && newPos === 'right') {
                slide.classList.add('quick');
                // remove the quick class after the shorter duration plus small buffer
                setTimeout(() => slide.classList.remove('quick'), 700);
            } else {
                // ensure quick removed for other slides
                slide.classList.remove('quick');
            }
        });

        // Update dots (global) as well
        if (dots && dots.length) {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === newCenter);
            });
        }
    };

    const goToSlide = (index) => {
        if (isAnimating) return;
        isAnimating = true;
        const targetIndex = (index + slides.length) % slides.length;
        const prevIndex = currentIndex;
        currentIndex = targetIndex;

        // Pass previous index so updateAllSlides can adjust transition speed for crossing slides
        updateAllSlides(currentIndex, prevIndex);

        // Unlock after transition duration (matches CSS 1s) plus small buffer
        setTimeout(() => {
            isAnimating = false;
        }, 1050);

        resetTimer();
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    function resetTimer() {
        if (timer) clearInterval(timer);
        timer = setInterval(nextSlide, intervalMs);
    }

    // Attach handlers to dots (global)
    if (dots && dots.length) {
        dots.forEach((dot, i) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(i);
            });
        });
    }

    // Prev / Next buttons
    const prevBtn = carousel.querySelector('.carousel-nav.prev');
    const nextBtn = carousel.querySelector('.carousel-nav.next');

    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); prevSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); nextSlide(); });

    // Init (no previous center)
    updateAllSlides(currentIndex, null);
    resetTimer();

    // Pause / resume on hover
    carousel.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
    carousel.addEventListener('mouseleave', () => { resetTimer(); });
}

// Category filter functionality
function initCategoryFilter() {
    const tabs = document.querySelectorAll('.tabs .tab');
    const articles = document.querySelectorAll('.recent-item');
    
    if (tabs.length === 0 || articles.length === 0) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            const category = this.getAttribute('data-category');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Filter articles with animation
            articles.forEach(article => {
                const articleCategory = article.getAttribute('data-category');
                
                if (category === 'all' || articleCategory === category) {
                    article.classList.remove('hidden');
                    // Force reflow for animation
                    void article.offsetWidth;
                    article.style.animation = 'none';
                    setTimeout(() => {
                        article.style.animation = '';
                    }, 10);
                } else {
                    article.classList.add('hidden');
                }
            });
        });
    });
}

// Article preview functionality
function initArticlePreview() {
    const form = document.querySelector('.post-form');
    const previewArticle = document.getElementById('preview-article');
    
    if (!form || !previewArticle) return;
    
    const titleInput = form.querySelector('input[name="title"]');
    const contentTextarea = form.querySelector('textarea[name="content"]');
    const imageInput = form.querySelector('input[name="image"]');
    const categorySelect = form.querySelector('select[name="category"]');
    const authorInput = form.querySelector('input[name="author"]');
    
    // Update preview when form inputs change
    const updatePreview = debounce(() => {
        updateArticlePreview();
    }, 300);
    
    if (titleInput) titleInput.addEventListener('input', updatePreview);
    if (contentTextarea) contentTextarea.addEventListener('input', updatePreview);
    if (imageInput) imageInput.addEventListener('input', updatePreview);
    if (categorySelect) categorySelect.addEventListener('change', updatePreview);
    if (authorInput) authorInput.addEventListener('input', updatePreview);
    
    function updateArticlePreview() {
        const title = titleInput?.value.trim() || '';
        const content = contentTextarea?.value.trim() || '';
        const imageUrl = imageInput?.value.trim() || '';
        const category = categorySelect?.value || '';
        const author = authorInput?.value.trim() || 'Editor';
        
        if (!title && !content) {
            previewArticle.innerHTML = `
                <div class="preview-empty">
                    <i class="fas fa-eye"></i><br>
                    Start typing to see your article preview
                </div>
            `;
            return;
        }
        
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        let imageHtml = '';
        if (imageUrl && isValidImageUrl(imageUrl)) {
            imageHtml = `<img src="${imageUrl}" alt="${title}" class="preview-image">`;
        } else if (imageUrl) {
            imageHtml = `<div class="preview-placeholder"><i class="fas fa-image"></i></div>`;
        }
        
        const categoryBadge = category ? `<span class="category-badge category-${category.toLowerCase()}">${category}</span>` : '';
        
        previewArticle.innerHTML = `
            ${imageHtml}
            <div class="preview-meta">
                ${categoryBadge}
                <span><i class="fas fa-calendar"></i> ${currentDate}</span>
                <span><i class="fas fa-user"></i> ${author}</span>
            </div>
            <h1 class="preview-post-title">${title || 'Untitled Article'}</h1>
            <div class="preview-post-content">${content || 'Start writing your content...'}</div>
        `;
    }
}

// Markdown preview functionality
function initMarkdownPreview() {
    console.log('Initializing markdown preview...');
    const contentTextarea = document.querySelector('textarea[name="content"]');
    const markdownPreview = document.getElementById('markdown-preview');
    
    console.log('Found elements:', { contentTextarea, markdownPreview });
    
    if (!contentTextarea || !markdownPreview) {
        console.log('Markdown preview elements not found:', { contentTextarea, markdownPreview });
        return;
    }
    
    // Update preview when content changes
    const updateMarkdownPreview = debounce(() => {
        updateMarkdownContent();
    }, 200);
    
    contentTextarea.addEventListener('input', updateMarkdownPreview);
    
    // Initial update
    updateMarkdownContent();
    
    function updateMarkdownContent() {
        const content = contentTextarea.value.trim();
        console.log('Updating markdown preview with content:', content);
        
        if (!content) {
            markdownPreview.innerHTML = `
                <div class="preview-empty">
                    <i class="fas fa-eye"></i><br>
                    Start writing to see your markdown preview
                </div>
            `;
            return;
        }
        
        const html = parseMarkdown(content);
        console.log('Parsed markdown HTML:', html);
        markdownPreview.innerHTML = html;
        
        // Test with simple content if nothing shows
        if (!html || html.trim() === '') {
            markdownPreview.innerHTML = '<p>Test content: ' + content + '</p>';
        }
    }
}

// Simple markdown parser
function parseMarkdown(text) {
    return text
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        
        // Bold and italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        
        // Images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        
        // Blockquotes
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        
        // Horizontal rules
        .replace(/^---$/gim, '<hr>')
        .replace(/^\*\*\*$/gim, '<hr>')
        
        // Lists
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
        
        // Wrap consecutive list items in ul/ol
        .replace(/(<li>.*<\/li>)/gs, function(match) {
            const lines = match.split('\n');
            let inList = false;
            let listType = 'ul';
            let result = '';
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('<li>')) {
                    if (!inList) {
                        inList = true;
                        result += `<${listType}>`;
                    }
                    result += line + '\n';
                } else {
                    if (inList) {
                        result += `</${listType}>`;
                        inList = false;
                    }
                    result += line + '\n';
                }
            }
            
            if (inList) {
                result += `</${listType}>`;
            }
            
            return result;
        })
        
        // Paragraphs (convert double newlines to paragraphs)
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(.*)$/gm, '<p>$1</p>')
        
        // Clean up empty paragraphs
        .replace(/<p><\/p>/g, '')
        .replace(/<p>\s*<\/p>/g, '')
        
        // Clean up list formatting
        .replace(/<p><li>/g, '<li>')
        .replace(/<\/li><\/p>/g, '</li>')
        .replace(/<p><ul>/g, '<ul>')
        .replace(/<p><ol>/g, '<ol>')
        .replace(/<\/ul><\/p>/g, '</ul>')
        .replace(/<\/ol><\/p>/g, '</ol>')
        
        // Clean up blockquotes
        .replace(/<p><blockquote>/g, '<blockquote>')
        .replace(/<\/blockquote><\/p>/g, '</blockquote>')
        
        // Clean up headers
        .replace(/<p><h([1-6])>/g, '<h$1>')
        .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
        
        // Clean up horizontal rules
        .replace(/<p><hr><\/p>/g, '<hr>')
        
        // Clean up code blocks
        .replace(/<p><pre>/g, '<pre>')
        .replace(/<\/pre><\/p>/g, '</pre>');
}
