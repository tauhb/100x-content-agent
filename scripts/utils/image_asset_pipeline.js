// Removed Puppeteer
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Image Asset Pipeline: Thợ Săn Ảnh Đầu Chiếu
 * Sử dụng Puppeteer vờ làm người dùng truy cập DuckDuckGo Images để săn ảnh gốc thay vì trả tiền API.
 */

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * fetchAndSaveImage: Tự động truy xuất kho ảnh PEXELS thông qua API Key.
 */
async function fetchAndSaveImage(keyword) {
    try {
        const apiKey = process.env.PEXELS_API_KEY;
        if (!apiKey || apiKey.includes('YOUR_PEXELS')) {
             console.log(`[Pexels] ⛔️ Chưa cấu hình PEXELS_API_KEY trong file .env`);
             return null;
        }
        
        const qs = `query=${encodeURIComponent(keyword)}&per_page=1&orientation=square`;
        const response = await axios.get(`https://api.pexels.com/v1/search?${qs}`, {
            headers: { Authorization: apiKey }
        });
        
        if (response.data && response.data.photos && response.data.photos.length > 0) {
            const photoUrl = response.data.photos[0].src.large;
            console.log(`[Pexels] 🎉 Đã dùng API Key kéo thành công ảnh VIP cho "${keyword}"`);
            return photoUrl;
        }
        return null; 
    } catch (err) {
        console.error(`[Pexels Lỗi] Chạm giới hạn hoặc API Key lỗi:`, err.message);
        return null;
    }
}

// 3. Hàm Controller Cấp Cao: Quản lý chiến thuật săn ảnh
async function getAssetForImageEngine(keyword) {
    if (!keyword) {
        console.log(`[Asset Pipeline] Không có Keyword, mặc định trả về ảnh Stock tối tăm vắng vẻ.`);
        return 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1080&auto=format&fit=crop';
    }
    
    // Chiến thuật 1: Đi bưỡi trong kho rác nhà trước (Thư mục /media-input/personal_image)
    const localDir = path.join(__dirname, '../../media-input/personal_image');
    if (fs.existsSync(localDir)) {
        const files = fs.readdirSync(localDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
        const exactMatches = files.filter(f => f.toLowerCase().includes(keyword.toLowerCase()));
        
        if (exactMatches.length > 0) {
            const randomFile = exactMatches[Math.floor(Math.random() * exactMatches.length)];
            console.log(`[Asset Pipeline] 🏠 Ồ, tìm thấy "hàng nhà trồng" khớp keyword luôn: ${randomFile}`);
            return 'file://' + encodeURI(path.join(localDir, randomFile));
        }
    }
    
    // YÊU CẦU MỚI TỪ SẾP: Nhận diện Người nổi tiếng / Danh nhân để gọi Vault
    const CELEBRITIES = [
        'jack ma', 'warren buffet', 'warren buffett', 'steve jobs', 'elon musk', 'naval ravikant', 'bill gates', 'mark zuckerberg',
        'jeff bezos', 'robert kiyosaki', 't harv eker', 'tony robbins', 'napoleon hill', 'andrew carnegie', 'alex hormozi',
        'charlie munger', 'ray dalio', 'sam altman', 'donald trump'
    ];
    
    const isCelebrity = CELEBRITIES.some(celeb => keyword.toLowerCase().includes(celeb));
    const forceAI = keyword.toLowerCase().startsWith('ai:');
    
    if (isCelebrity || forceAI) {
        const cleanKeyword = (forceAI ? keyword.slice(3).trim() : keyword).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        // Kiểm tra trong thư mục Celebrity Vault trước
        const celebVaultDir = path.join(__dirname, '../../media-input/celebrity_image');
        if (fs.existsSync(celebVaultDir)) {
            const vaultFiles = fs.readdirSync(celebVaultDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
            // Tìm file có chứa tên
            const matches = vaultFiles.filter(f => f.toLowerCase().includes(cleanKeyword) || cleanKeyword.includes(f.split('.')[0].toLowerCase()));
            
            if (matches.length > 0) {
                const vaultFile = matches[Math.floor(Math.random() * matches.length)];
                console.log(`[Asset Pipeline] 💡 Phát hiện danh nhân (${keyword}). Đã chốt thẻ ảnh từ Kho Antigravity Vault: ${vaultFile}!`);
                return 'file://' + encodeURI(path.join(celebVaultDir, vaultFile));
            }
        }
        console.log(`[Asset Pipeline] ⚠️ Thư viện Vault chưa có ảnh của Danh nhân này (${keyword}). Bạn bảo Antigravity vẽ 1 tấm bổ sung nhé! Rẽ nhánh về cào mạng...`);
    }
    
    // Chiến thuật mạng: Ở nhà không có, Vault không có thì xách đao ra mạng (Browser Scraper)
    const internetFile = await fetchAndSaveImage(keyword);
    if (internetFile) {
        return internetFile; // File:// path đã tải xong 
    }
    
    // Chiến thuật 3: Bất lực toàn tập thì múc ảnh bừa trên Unsplash cho nó đỡ vỡ layout
    console.log(`[Asset Pipeline] 🏳️ Đầu hàng, không cào được. Mượn tạm Unsplash vậy.`);
    return 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1080&auto=format&fit=crop';
}

module.exports = {
    getAssetForImageEngine
};
