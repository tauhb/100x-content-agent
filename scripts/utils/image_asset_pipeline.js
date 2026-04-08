// Removed Puppeteer
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Image Asset Pipeline: Thợ Săn Ảnh Đầu Chiếu
 * Sử dụng Puppeteer vờ làm người dùng truy cập DuckDuckGo Images để săn ảnh gốc thay vì trả tiền API.
 */

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

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

function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    // eslint-disable-next-line
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}

// 3. Hàm Controller Cấp Cao: Quản lý chiến thuật săn ảnh
async function getAssetForImageEngine(keyword, media_source) {
    if (!keyword) {
        console.log(`[Asset Pipeline] Không có Keyword, mặc định trả về ảnh Stock tối tăm vắng vẻ.`);
        return 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1080&auto=format&fit=crop';
    }

    const noAccentKeyword = removeVietnameseTones(keyword);
    const cleanKeyword = noAccentKeyword.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Nếu AI yêu cầu đích danh một thư mục:
    let targetDir = '';
    if (media_source === 'personal_image' || media_source === 'personal_library') {
        targetDir = path.join(__dirname, '..', '..', 'media-input', 'personal_image');
    } else if (media_source === 'celebrity_vault' || media_source === 'celebrity_image') {
        targetDir = path.join(__dirname, '..', '..', 'media-input', 'celebrity_image');
    } else if (media_source === 'image_stock') {
        targetDir = path.join(__dirname, '..', '..', 'media-input', 'image_stock');
    } else {
        // Fallback for old payloads
        targetDir = path.join(__dirname, '..', '..', 'media-input', 'image_stock');
    }

    // Quét Thư Mục Đích:
    if (fs.existsSync(targetDir)) {
        // TUYỆT ĐỐI KHÔNG BỐC NHẦM ẢNH HẠT GIỐNG (master_face) LÀM BACKGROUND
        const vaultFiles = fs.readdirSync(targetDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i) && !f.toLowerCase().includes('master'));
        // Tìm file có chứa keyword, nếu không có lấy Random (Đảm bảo Antigravity đã đẻ sẵn vào đây rồi)
        let matches = vaultFiles.filter(f => f.toLowerCase().includes(cleanKeyword) || cleanKeyword.includes(f.split('.')[0].toLowerCase()));
        
        let selectedFile = '';
        if (matches.length > 0) {
            selectedFile = matches[Math.floor(Math.random() * matches.length)];
            console.log(`[Asset Pipeline] 🎯 Tái sử dụng thành công Ảnh Caching: ${selectedFile} (Nguồn: ${media_source})`);
        } else if (vaultFiles.length > 0) {
            selectedFile = vaultFiles[Math.floor(Math.random() * vaultFiles.length)];
            console.log(`[Asset Pipeline] 💡 Lấy tạm một hình bất kỳ trong kho rương ${media_source} do tìm không thấy đích danh.`);
        }

        if (selectedFile) {
             // ĐÓNG ĐƯỜNG DẪN TUYỆT ĐỐI CHỐNG LỖI WINDOWS
             const absolutePath = path.resolve(targetDir, selectedFile).replace(/\\/g, '/');
             return 'file://' + encodeURI(absolutePath);
        }
    }
    
    // Chiến thuật cuối cùng: Rớt đài mọi phòng ban! Gọi Pexels API
    console.log(`[Asset Pipeline] 🚨 Báo Động! Thư mục ${media_source} trống trơn! Khởi động Fallback lấy ảnh từ Pexels cho keyword: ${cleanKeyword}`);
    const pexelsFallback = await fetchAndSaveImage(cleanKeyword);
    if (pexelsFallback) {
        return pexelsFallback;
    }

    console.log(`[Asset Pipeline] ❌ Pexels cũng thất bại. Mượn tạm Unsplash Backup cuối cùng.`);
    return 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1080&auto=format&fit=crop';
}

module.exports = {
    getAssetForImageEngine
};
