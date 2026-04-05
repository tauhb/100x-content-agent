/**
 * Content Sanitizer v1.0
 * Biến đổi các kịch bản hỗn tạp (HTML, Markdown) về chuẩn sạch cho các Media Engine.
 */

function sanitizeText(str) {
    if (!str || typeof str !== 'string') return str;
    
    // 1. Đồng bộ Xuống dòng: Chuyển mọi loại tag HTML xuống dòng thành \n
    let clean = str
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p><p>/gi, '\n')
        .replace(/<p>/gi, '')
        .replace(/<\/p>/gi, '\n');

    // 2. Đồng bộ Nhấn mạnh (Strong/Bold): Chuyển <b>, <strong> thành **
    clean = clean.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
                 .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');

    // 3. Đồng bộ Nghiêng (Em/Italic): Chuyển <i>, <em> thành *
    clean = clean.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
                 .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');

    // 4. Xóa các tag HTML lạ còn sót
    clean = clean.replace(/<[^>]+>/g, '');

    // 5. Trim khoảng trắng thừa
    return clean.trim();
}

function normalizeVisualContent(vc) {
    if (!vc) return {};
    const result = { ...vc };
    
    // Sanitize các trường text đơn
    ['headline', 'quote', 'subheadline', 'cta', 'text'].forEach(field => {
        if (result[field]) result[field] = sanitizeText(result[field]);
    });

    // Sanitize mảng text
    ['bullets', 'list', 'content'].forEach(field => {
        if (result[field] && Array.isArray(result[field])) {
            result[field] = result[field].map(item => sanitizeText(item));
        }
    });

    return result;
}

/**
 * Biến đổi Markdown chuẩn sang HTML để các Engine nhúng (Image/Carousel) kết xuất
 */
function parseMarkdownToHtml(str) {
    if (!str || typeof str !== 'string') return str;
    let html = str;
    
    // 1. Xuống dòng
    html = html.replace(/\n/g, '<br/>');
    
    // 2. Highlight dạ quang (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
        return `<span class="highlight-text">${p1.toLowerCase()}</span>`;
    });
    
    // 3. Highlight màu nghiêng (*text*)
    html = html.replace(/\*(.*?)\*/g, (match, p1) => {
        return `<span class="highlight-text">${p1.toLowerCase()}</span>`;
    });
    
    return html;
}

module.exports = { sanitizeText, normalizeVisualContent, parseMarkdownToHtml };
