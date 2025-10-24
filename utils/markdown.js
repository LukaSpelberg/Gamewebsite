// Markdown to HTML conversion utility
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

module.exports = { convertMarkdownToHtml };
