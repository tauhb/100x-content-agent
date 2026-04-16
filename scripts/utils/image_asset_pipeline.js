const fs = require('fs');
const path = require('path');
const os = require('os');
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

/**
 * screenshotUrl: Dùng Puppeteer chụp màn hình một URL bất kỳ.
 * Trả về đường dẫn file PNG tạm thời.
 */
async function screenshotUrl(url) {
    if (!url || !url.startsWith('http')) {
        console.log(`[url_screenshot] ⛔️ URL không hợp lệ: "${url}"`);
        return null;
    }
    try {
        const puppeteer = require('puppeteer');
        console.log(`[url_screenshot] 🌐 Đang mở trình duyệt chụp: ${url}`);
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        // Giả lập user agent thật để tránh bị chặn bot
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
        await new Promise(r => setTimeout(r, 1500));
        const tmpFile = path.join(os.tmpdir(), `url_screenshot_${Date.now()}.png`);
        await page.screenshot({ path: tmpFile, fullPage: false });
        await browser.close();
        console.log(`[url_screenshot] ✅ Chụp thành công: ${url}`);
        return tmpFile;
    } catch (e) {
        console.error(`[url_screenshot] ❌ Lỗi khi chụp "${url}":`, e.message);
        return null;
    }
}

// 3. Hàm Controller Cấp Cao: Quản lý chiến thuật săn ảnh
async function getAssetForImageEngine(keyword, media_source) {
    if (!keyword) {
        console.log(`[Asset Pipeline] Không có Keyword, mặc định trả về ảnh Stock tối tăm vắng vẻ.`);
        return 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1080&auto=format&fit=crop';
    }

    // url_screenshot → dùng Puppeteer chụp màn hình URL (keyword chứa URL)
    if (media_source === 'url_screenshot') {
        return await screenshotUrl(keyword);
    }

    const noAccentKeyword = removeVietnameseTones(keyword);
    const cleanKeyword = noAccentKeyword.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    // image_stock → gọi Pexels trực tiếp, local chỉ là cache dự phòng
    if (media_source === 'image_stock') {
        console.log(`[Asset Pipeline] 📡 image_stock — Gọi Pexels API cho keyword: "${keyword}"`);
        const pexelsResult = await fetchAndSaveImage(keyword);
        if (pexelsResult) return pexelsResult;

        // Pexels thất bại (key chưa cấu hình hoặc lỗi) → thử local cache
        const stockDir = path.join(__dirname, '..', '..', 'media-input', 'image_stock');
        if (fs.existsSync(stockDir)) {
            const vaultFiles = fs.readdirSync(stockDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i) && !f.toLowerCase().includes('master'));
            const matches = vaultFiles.filter(f => f.toLowerCase().includes(cleanKeyword) || cleanKeyword.includes(f.split('.')[0].toLowerCase()));
            const selectedFile = matches.length > 0
                ? matches[Math.floor(Math.random() * matches.length)]
                : vaultFiles.length > 0 ? vaultFiles[Math.floor(Math.random() * vaultFiles.length)] : '';
            if (selectedFile) {
                console.log(`[Asset Pipeline] 💾 Dùng ảnh cache local: ${selectedFile}`);
                return path.resolve(stockDir, selectedFile);
            }
        }

        console.log(`[Asset Pipeline] ❌ Pexels và local đều thất bại. Dùng Unsplash backup.`);
        return 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1080&auto=format&fit=crop';
    }

    // Các loại media khác → quét thư mục local
    let targetDir = '';
    if (media_source === 'personal_image' || media_source === 'personal_library') {
        targetDir = path.join(__dirname, '..', '..', 'media-input', 'personal_image');
    } else if (media_source === 'celebrity_vault' || media_source === 'celebrity_image') {
        targetDir = path.join(__dirname, '..', '..', 'media-input', 'celebrity_image');
    } else {
        targetDir = path.join(__dirname, '..', '..', 'media-input', 'image_stock');
    }

    if (fs.existsSync(targetDir)) {
        // TUYỆT ĐỐI KHÔNG BỐC NHẦM ẢNH HẠT GIỐNG (master_face) LÀM BACKGROUND
        const vaultFiles = fs.readdirSync(targetDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i) && !f.toLowerCase().includes('master'));
        const matches = vaultFiles.filter(f => f.toLowerCase().includes(cleanKeyword) || cleanKeyword.includes(f.split('.')[0].toLowerCase()));

        let selectedFile = '';
        if (matches.length > 0) {
            selectedFile = matches[Math.floor(Math.random() * matches.length)];
            console.log(`[Asset Pipeline] 🎯 Tái sử dụng thành công Ảnh Caching: ${selectedFile} (Nguồn: ${media_source})`);
        } else if (vaultFiles.length > 0) {
            selectedFile = vaultFiles[Math.floor(Math.random() * vaultFiles.length)];
            console.log(`[Asset Pipeline] 💡 Lấy tạm một hình bất kỳ trong kho rương ${media_source} do tìm không thấy đích danh.`);
        }

        if (selectedFile) {
            return path.resolve(targetDir, selectedFile);
        }
    }

    console.log(`[Asset Pipeline] 🚨 Thư mục ${media_source} trống. Dùng Unsplash backup.`);
    return 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1080&auto=format&fit=crop';
}

/**
 * Chuẩn hóa kết quả từ getAssetForImageEngine thành base64 data URI
 * hoặc HTTP URL. Thay thế pattern `file://` cũ — tương thích Windows.
 * @param {string|null} result - giá trị trả về từ getAssetForImageEngine
 * @returns {string} base64 data URI hoặc http URL, rỗng nếu thất bại
 */
function resolveAssetToBase64(result) {
    if (!result) return '';
    // HTTP/HTTPS URL — trả thẳng
    if (result.startsWith('http')) return result;
    // Legacy file:// (giữ lại compat)
    const localPath = result.startsWith('file://') ? decodeURI(result.replace(/^file:\/{2,3}/, '')) : result;
    try {
        const ext = path.extname(localPath).substring(1) || 'jpg';
        const data = fs.readFileSync(localPath, 'base64');
        return `data:image/${ext};base64,${data}`;
    } catch {
        return '';
    }
}

module.exports = {
    getAssetForImageEngine,
    resolveAssetToBase64,
};
