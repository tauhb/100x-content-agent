function toSentenceCase(text) {
    if (typeof text !== 'string') return text;
    if (!text.trim()) return text;
    // Bỏ qua nếu có chứa tag HTML để an toàn
    if (text.includes('<div') || text.includes('<span')) return text;

    return text.split('\n').map(line => {
        let trimmed = line.trim();
        if (!trimmed) return '';
        
        let firstCharIdx = trimmed.search(/[a-zA-ZÀ-ỹ0-9]/);
        if (firstCharIdx === -1) return trimmed.toLowerCase();
        
        let prefix = trimmed.substring(0, firstCharIdx);
        let firstChar = trimmed.charAt(firstCharIdx).toUpperCase();
        let tail = trimmed.substring(firstCharIdx + 1).toLowerCase();
        
        return prefix + firstChar + tail;
    }).join('\n');
}

function deeplyFormatPayload(payload) {
    if (!payload) return;
    
    const keysToFormat = ['headline', 'subheadline', 'quote', 'cta_text'];
    
    const traverse = (obj) => {
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                if (typeof obj[i] === 'string') {
                    obj[i] = toSentenceCase(obj[i]);
                } else if (typeof obj[i] === 'object') {
                    traverse(obj[i]);
                }
            }
        } else if (obj !== null && typeof obj === 'object') {
            for (const key in obj) {
                if (keysToFormat.includes(key) && typeof obj[key] === 'string') {
                    obj[key] = toSentenceCase(obj[key]);
                } else if (key === 'list' && Array.isArray(obj[key])) {
                    obj[key] = obj[key].map(i => toSentenceCase(i));
                } else if (key === 'content' && Array.isArray(obj[key])) {
                    obj[key] = obj[key].map(i => toSentenceCase(i));
                } else if (typeof obj[key] === 'object') {
                    traverse(obj[key]);
                }
            }
        }
    };
    
    traverse(payload);
    return payload;
}

module.exports = { toSentenceCase, deeplyFormatPayload };
