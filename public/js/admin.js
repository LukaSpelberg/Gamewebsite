// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initRichTextEditor();
    initLivePreview();
    initImageUpload();
    initFormValidation();
    initFeaturedBulkToggle();
});

// Also try to initialize after a short delay in case of timing issues
setTimeout(function() {
    if (document.querySelector('.new-post-container')) {
        initLivePreview();
    }
}, 100);

// Initialize Rich Text Editor (TinyMCE or Simple Textarea)
function initRichTextEditor() {
    // Check if we're on the new post page and should use simple textarea
    const isNewPostPage = document.querySelector('.new-post-container');
    
    if (isNewPostPage) {
        // For new post page, we'll use the simple textarea with live preview
        return;
    }
    
    // For other pages, use TinyMCE if available
    if (typeof tinymce !== 'undefined' && document.getElementById('content')) {
        tinymce.init({
            selector: '#content',
            height: 500,
            menubar: true,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
                'template', 'codesample', 'hr', 'pagebreak', 'nonbreaking', 'toc',
                'imagetools', 'textpattern', 'noneditable', 'quickbars', 'accordion'
            ],
            toolbar: 'undo redo | blocks | ' +
                'bold italic backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help | image link | code preview | fullscreen',
            content_style: 'body { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; line-height: 1.6; }',
            setup: function (editor) {
                editor.on('change', function () {
                    updateLivePreview();
                });
                editor.on('keyup', function () {
                    updateLivePreview();
                });
            },
            image_upload_handler: function (blobInfo, success, failure) {
                // Handle image uploads
                uploadImage(blobInfo.blob(), success, failure);
            },
            file_picker_types: 'image',
            file_picker_callback: function (callback, value, meta) {
                if (meta.filetype === 'image') {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();
                    
                    input.onchange = function () {
                        const file = this.files[0];
                        if (file) {
                            uploadImage(file, function(url) {
                                callback(url, { title: file.name });
                            }, function(error) {
                                console.error('Upload failed:', error);
                                failure('Upload failed');
                            });
                        }
                    };
                }
            }
        });
    }
}

// Initialize Live Preview
function initLivePreview() {
    const titleInput = document.getElementById('title');
    const categorySelect = document.getElementById('category');
    const authorInput = document.getElementById('author');
    const imageInput = document.getElementById('image');
    const contentTextarea = document.getElementById('content');
    const toggleBtn = document.getElementById('toggle-preview');
    const refreshBtn = document.getElementById('refresh-preview');
    
    if (titleInput) {
        titleInput.addEventListener('input', updateLivePreview);
    }
    
    if (categorySelect) {
        categorySelect.addEventListener('change', updateLivePreview);
    }
    
    if (authorInput) {
        authorInput.addEventListener('input', updateLivePreview);
    }
    
    if (imageInput) {
        imageInput.addEventListener('input', updateLivePreview);
    }
    
    if (contentTextarea) {
        contentTextarea.addEventListener('input', updateLivePreview);
        contentTextarea.addEventListener('keyup', updateLivePreview);
    }
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', togglePreview);
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', updateLivePreview);
    }
    
    // Initialize toolbar
    initEditorToolbar();
    
    // Initial preview update
    updateLivePreview();
}

// Initialize Editor Toolbar
function initEditorToolbar() {
    const toolbar = document.querySelector('.editor-toolbar');
    const textarea = document.getElementById('content');
    
    if (!toolbar || !textarea) return;
    
    // Remove existing listeners to prevent duplicates
    const buttons = toolbar.querySelectorAll('.toolbar-btn');
    buttons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
    
    // Re-select buttons after cloning
    const newButtons = toolbar.querySelectorAll('.toolbar-btn');
    
    newButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const format = this.dataset.format;
            insertMarkdownFormat(format, textarea);
        });
    });
}

// Insert markdown formatting
function insertMarkdownFormat(format, textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeCursor = textarea.value.substring(0, start);
    const afterCursor = textarea.value.substring(end);
    
    let replacement = '';
    let newCursorPos = start;
    
    switch (format) {
        case 'bold':
            replacement = `**${selectedText || 'bold text'}**`;
            newCursorPos = selectedText ? end + 4 : start + 2;
            break;
        case 'italic':
            replacement = `*${selectedText || 'italic text'}*`;
            newCursorPos = selectedText ? end + 2 : start + 1;
            break;
        case 'heading':
            replacement = `## ${selectedText || 'Heading'}`;
            newCursorPos = selectedText ? end + 3 : start + 3;
            break;
        case 'link':
            const linkText = selectedText || 'link text';
            const linkUrl = prompt('Enter URL:', 'https://');
            if (linkUrl) {
                replacement = `[${linkText}](${linkUrl})`;
                newCursorPos = start + replacement.length;
            } else {
                return;
            }
            break;
        case 'image':
            const imageAlt = selectedText || 'image description';
            const imageUrl = prompt('Enter image URL:', 'https://');
            if (imageUrl) {
                replacement = `![${imageAlt}](${imageUrl})`;
                newCursorPos = start + replacement.length;
            } else {
                return;
            }
            break;
        case 'upload':
            openImageUploadModal(textarea, start, end);
            return;
        case 'list':
            replacement = `- ${selectedText || 'list item'}`;
            newCursorPos = selectedText ? end + 2 : start + 2;
            break;
        case 'quote':
            replacement = `> ${selectedText || 'quote text'}`;
            newCursorPos = selectedText ? end + 2 : start + 2;
            break;
        case 'code':
            if (selectedText.includes('\n')) {
                replacement = `\`\`\`\n${selectedText || 'code block'}\n\`\`\``;
                newCursorPos = selectedText ? end + 7 : start + 4;
            } else {
                replacement = `\`${selectedText || 'code'}\``;
                newCursorPos = selectedText ? end + 2 : start + 1;
            }
            break;
    }
    
    textarea.value = beforeCursor + replacement + afterCursor;
    textarea.focus();
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    // Trigger input event to update preview
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

// Update Live Preview
function updateLivePreview() {
    const title = document.getElementById('title')?.value || '';
    const category = document.getElementById('category')?.value || '';
    const author = document.getElementById('author')?.value || '';
    const image = document.getElementById('image')?.value || '';
    const content = document.getElementById('content')?.value || '';
    
    const preview = document.getElementById('live-preview');
    if (!preview) {
        return;
    }
    
    // Clear placeholder
    const placeholder = preview.querySelector('.preview-placeholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }
    
    // Create preview HTML
    let previewHTML = '<div class="preview-article">';
    
    // Featured image
    if (image) {
        previewHTML += `
            <div class="preview-image">
                <img src="${image}" alt="${title}" onerror="this.style.display='none'">
            </div>
        `;
    }
    
    // Category badge
    if (category) {
        previewHTML += `
            <div class="preview-meta">
                <span class="category-badge category-${category.toLowerCase()}">${category}</span>
            </div>
        `;
    }
    
    // Title
    if (title) {
        previewHTML += `<h1 class="preview-title">${title}</h1>`;
    }
    
    // Author
    if (author) {
        previewHTML += `<p class="preview-author" style="color: #6c757d; font-size: 0.9rem; margin-bottom: 1rem;">By ${author}</p>`;
    }
    
    // Content
    if (content && content.trim()) {
        // Convert markdown-like content to HTML for preview
        const htmlContent = convertMarkdownToHtml(content);
        previewHTML += `<div class="preview-content-text">${htmlContent}</div>`;
    } else {
        previewHTML += `
            <div class="preview-placeholder">
                <i class="fas fa-eye"></i>
                <p>Start typing to see live preview</p>
            </div>
        `;
    }
    
    previewHTML += '</div>';
    preview.innerHTML = previewHTML;
}

// Convert markdown to HTML for preview
function convertMarkdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Code blocks (must be processed first to avoid conflicts)
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Headers (process from largest to smallest)
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');
    html = html.replace(/^\*\*\*$/gim, '<hr>');
    
    // Bold and italic (bold first, then italic)
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Strikethrough
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Images with optional captions (must be processed before links)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)\s*\n\*(.*?)\*/g, '<figure style="margin: 1.5rem 0; text-align: center;"><img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"><figcaption style="margin-top: 0.5rem; font-size: 0.9rem; color: #6c757d; font-style: italic;">$3</figcaption></figure>');
    
    // Images without captions
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 6px; margin: 1rem 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">');
    
    // Links (after images so image syntax isn't converted to links)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Lists - unordered
    html = html.replace(/^[\s]*[-*+] (.+)$/gim, '<li>$1</li>');
    
    // Lists - ordered
    html = html.replace(/^[\s]*\d+\. (.+)$/gim, '<li>$1</li>');
    
    // Process line breaks and paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs and fix structure
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p><br><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');
    
    // Wrap consecutive list items in ul/ol
    html = html.replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/gs, function(match) {
        // Check if it's an ordered list (contains numbers)
        const isOrdered = /^\d+\./.test(markdown.split('\n').find(line => line.trim().startsWith('*') || line.trim().startsWith('-') || line.trim().startsWith('+') || /^\d+\./.test(line.trim())));
        const tag = isOrdered ? 'ol' : 'ul';
        return `<${tag}>${match}</${tag}>`;
    });
    
    // Fix blockquotes
    html = html.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/gs, '$1');
    
    // Fix headers
    html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/gs, '$1');
    
    // Fix horizontal rules
    html = html.replace(/<p>(<hr>)<\/p>/gs, '$1');
    
    // Fix code blocks
    html = html.replace(/<p>(<pre><code>.*?<\/code><\/pre>)<\/p>/gs, '$1');
    
    return html;
}

// Toggle Preview Panel
function togglePreview() {
    const previewSection = document.querySelector('.preview-section');
    const toggleBtn = document.getElementById('toggle-preview');
    
    if (previewSection) {
        previewSection.classList.toggle('hidden');
        const isHidden = previewSection.classList.contains('hidden');
        
        if (isHidden) {
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            toggleBtn.title = 'Show Preview';
            // Adjust form section to take full width when preview is hidden
            const formSection = document.querySelector('.form-section');
            if (formSection) {
                formSection.style.gridColumn = '1 / -1';
            }
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
            toggleBtn.title = 'Hide Preview';
            // Reset form section to normal width
            const formSection = document.querySelector('.form-section');
            if (formSection) {
                formSection.style.gridColumn = '';
            }
        }
    }
}

// Image Upload Handler
function uploadImage(file, success, failure) {
    const formData = new FormData();
    formData.append('image', file);
    
    fetch('/admin/upload-image', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            success(data.url);
        } else {
            failure(data.error || 'Upload failed');
        }
    })
    .catch(error => {
        console.error('Upload error:', error);
        failure('Upload failed');
    });
}

// Open image upload modal
function openImageUploadModal(textarea, start, end) {
    const modal = document.getElementById('image-upload-modal');
    const uploadArea = document.getElementById('upload-area');
    const uploadPreview = document.getElementById('upload-preview');
    const previewImage = document.getElementById('preview-image');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const altTextInput = document.getElementById('image-alt-text');
    const captionInput = document.getElementById('image-caption');
    const confirmBtn = document.getElementById('confirm-upload');
    const cancelBtn = document.getElementById('cancel-upload');
    const closeBtn = document.querySelector('.modal-close');
    const fileInput = document.getElementById('image-upload');
    
    let selectedFile = null;
    let textareaStart = start;
    let textareaEnd = end;
    let targetTextarea = textarea;
    
    // Reset modal
    uploadArea.style.display = 'block';
    uploadPreview.style.display = 'none';
    altTextInput.value = '';
    captionInput.value = '';
    confirmBtn.disabled = true;
    
    // Show modal
    modal.style.display = 'flex';
    
    // Upload area click handler
    uploadArea.onclick = function() {
        fileInput.click();
    };
    
    // Drag and drop handlers
    uploadArea.ondragover = function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    };
    
    uploadArea.ondragleave = function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    };
    
    uploadArea.ondrop = function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };
    
    // File input change handler
    fileInput.onchange = function() {
        if (this.files.length > 0) {
            handleFileSelect(this.files[0]);
        }
    };
    
    // Handle file selection
    function handleFileSelect(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', 'error');
            return;
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image file too large. Maximum size is 5MB', 'error');
            return;
        }
        
        selectedFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            uploadArea.style.display = 'none';
            uploadPreview.style.display = 'block';
            confirmBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
    
    // Alt text validation
    altTextInput.oninput = function() {
        confirmBtn.disabled = !this.value.trim() || !selectedFile;
    };
    
    // Confirm upload
    confirmBtn.onclick = function() {
        if (!selectedFile || !altTextInput.value.trim()) return;
        
        showNotification('Uploading image...', 'info');
        
        uploadImage(selectedFile, function(url) {
            const altText = altTextInput.value.trim();
            const caption = captionInput.value.trim();
            
            // Create markdown with optional caption
            let markdown;
            if (caption) {
                markdown = `![${altText}](${url})\n*${caption}*`;
            } else {
                markdown = `![${altText}](${url})`;
            }
            
            // Insert into textarea
            const beforeCursor = targetTextarea.value.substring(0, textareaStart);
            const afterCursor = targetTextarea.value.substring(textareaEnd);
            
            targetTextarea.value = beforeCursor + markdown + afterCursor;
            targetTextarea.focus();
            targetTextarea.setSelectionRange(textareaStart + markdown.length, textareaStart + markdown.length);
            
            // Trigger input event to update preview
            targetTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            
            showNotification('Image uploaded successfully!', 'success');
            closeModal();
        }, function(error) {
            showNotification('Failed to upload image: ' + error, 'error');
        });
    };
    
    // Close modal
    function closeModal() {
        modal.style.display = 'none';
        selectedFile = null;
        fileInput.value = '';
    }
    
    // Cancel button
    cancelBtn.onclick = closeModal;
    closeBtn.onclick = closeModal;
    
    // Close on backdrop click
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeModal();
        }
    };
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Featured manager helpers
function initFeaturedBulkToggle() {
    const form = document.querySelector('form[action="/admin/featured"]');
    if (!form) return;
    
    // Add event listeners to checkboxes for real-time count updates
    const featuredCheckboxes = form.querySelectorAll('input[name="featured"]');
    const semiFeaturedCheckboxes = form.querySelectorAll('input[name="semiFeatured"]');
    
    featuredCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateFeaturedCounts);
    });
    
    semiFeaturedCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateFeaturedCounts);
    });
    
    // Initial count update
    updateFeaturedCounts();
}

// Update featured counts in real-time
function updateFeaturedCounts() {
    const featuredCheckboxes = document.querySelectorAll('input[name="featured"]:checked');
    const semiFeaturedCheckboxes = document.querySelectorAll('input[name="semiFeatured"]:checked');
    
    const featuredCount = document.getElementById('featured-count');
    const semiFeaturedCount = document.getElementById('semi-featured-count');
    
    if (featuredCount) {
        featuredCount.textContent = featuredCheckboxes.length;
    }
    
    if (semiFeaturedCount) {
        semiFeaturedCount.textContent = semiFeaturedCheckboxes.length;
    }
}

// Initialize Image Upload
function initImageUpload() {
    // This will be handled by the upload route we'll create
}

// Enhanced Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('.new-post-form, .post-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Sync TinyMCE content with textarea if it exists
            if (tinymce.get('content')) {
                tinymce.get('content').save();
            }
            
            // Validate form
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
}

// Validate Form
function validateForm(form) {
    let isValid = true;
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            removeFieldError(field);
        }
    });
    
    // Check content length
    const contentTextarea = form.querySelector('#content');
    const content = contentTextarea ? contentTextarea.value : '';
    if (content.length < 10) {
        showNotification('Content must be at least 10 characters long', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Show Field Error
function showFieldError(field, message) {
    removeFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.classList.add('error');
    field.parentNode.appendChild(errorDiv);
}

// Remove Field Error
function removeFieldError(field) {
    field.classList.remove('error');
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Show Notification
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

// Add CSS for animations (only if not already added)
if (!document.querySelector('#admin-styles')) {
    const style = document.createElement('style');
    style.id = 'admin-styles';
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
    `;
    document.head.appendChild(style);
}

