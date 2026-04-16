/**
 * URL Capture Utility
 * Hướng 1: captureUrlScreenshot — Puppeteer chụp màn hình URL → PNG
 * Hướng 3: captureUrlRecording  — Puppeteer chụp full-page → ffmpeg scroll animation → MP4
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');

const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;
const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/**
 * Chụp màn hình một URL (viewport desktop 1920x1080).
 * @param {string} url - URL cần chụp
 * @param {string} outputPngPath - Đường dẫn lưu file PNG
 * @returns {Promise<boolean>} true nếu thành công
 */
async function captureUrlScreenshot(url, outputPngPath) {
    if (!url || !url.startsWith('http')) {
        console.warn(`[url_capture] ⛔️ URL không hợp lệ: "${url}"`);
        return false;
    }
    let browser;
    try {
        console.log(`[url_capture] 📸 Đang chụp màn hình: ${url}`);
        browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setUserAgent(USER_AGENT);
        await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: outputPngPath, fullPage: false });
        console.log(`[url_capture] ✅ Chụp thành công: ${path.basename(outputPngPath)}`);
        return true;
    } catch (e) {
        console.error(`[url_capture] ❌ Lỗi chụp "${url}":`, e.message);
        return false;
    } finally {
        if (browser) await browser.close();
    }
}

/**
 * Quay video ngắn từ URL bằng cách chụp full-page rồi tạo scroll animation với ffmpeg.
 * @param {string} url - URL cần quay
 * @param {string} outputMp4Path - Đường dẫn lưu file MP4
 * @param {number} durationSec - Thời lượng video (giây), mặc định 8
 * @returns {Promise<boolean>} true nếu thành công
 */
async function captureUrlRecording(url, outputMp4Path, durationSec = 8) {
    if (!url || !url.startsWith('http')) {
        console.warn(`[url_capture] ⛔️ URL không hợp lệ: "${url}"`);
        return false;
    }

    const tmpPng = outputMp4Path.replace(/\.mp4$/, '_fullpage.png');
    let browser;

    try {
        // Bước 1: Chụp full-page (cao hơn viewport để có nội dung để scroll)
        console.log(`[url_capture] 🎬 Đang ghi màn hình: ${url}`);
        browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setUserAgent(USER_AGENT);
        // Dùng viewport 1080px rộng để gần với tỉ lệ video dọc
        await page.setViewport({ width: VIDEO_WIDTH, height: VIEWPORT_HEIGHT });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
        await new Promise(r => setTimeout(r, 2000));

        // Cuộn xuống 1/3 trang để load lazy content
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
        await new Promise(r => setTimeout(r, 800));
        await page.evaluate(() => window.scrollTo(0, 0));
        await new Promise(r => setTimeout(r, 500));

        await page.screenshot({ path: tmpPng, fullPage: true });
        console.log(`[url_capture] 📄 Đã chụp full-page: ${path.basename(tmpPng)}`);

        // Bước 2: ffmpeg tạo scroll animation
        // - Scale về width=1080
        // - Crop 1080x1920, scroll từ y=0 đến y=max(ih-1920, 0) theo thời gian
        // Scale về width=VIDEO_WIDTH trước, sau đó scroll từ trên xuống nếu trang đủ cao
        // Nếu trang không đủ cao (< VIDEO_HEIGHT), fill theo chiều dọc
        const ffCmd = [
            `"${ffmpegStatic}"`,
            `-hide_banner -loglevel error`,
            `-loop 1 -framerate 30`,
            `-i "${tmpPng}"`,
            `-vf "scale=${VIDEO_WIDTH}:-2,`,
            `pad=${VIDEO_WIDTH}:max(ih\\,${VIDEO_HEIGHT}):0:0:black,`,
            `crop=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:0:'min((ih-${VIDEO_HEIGHT})*t/${durationSec},max(ih-${VIDEO_HEIGHT},0))'"`,
            `-t ${durationSec}`,
            `-c:v libx264 -preset fast -crf 20`,
            `-pix_fmt yuv420p`,
            `-r 30`,
            `-y "${outputMp4Path}"`
        ].join(' ');

        execSync(ffCmd, { stdio: 'pipe' });
        console.log(`[url_capture] ✅ Video scroll animation hoàn thành: ${path.basename(outputMp4Path)}`);

        // Dọn file tạm
        if (fs.existsSync(tmpPng)) fs.unlinkSync(tmpPng);
        return true;
    } catch (e) {
        console.error(`[url_capture] ❌ Lỗi ghi video "${url}":`, e.message);
        if (fs.existsSync(tmpPng)) fs.unlinkSync(tmpPng);
        return false;
    } finally {
        if (browser) await browser.close();
    }
}

/**
 * Chuyển đổi ảnh PNG tĩnh thành video ngắn (dùng cho url_screenshot → bg_video).
 * @param {string} imagePath - Đường dẫn file PNG
 * @param {string} outputMp4Path - Đường dẫn lưu file MP4
 * @param {number} durationSec - Thời lượng video (giây)
 * @returns {boolean} true nếu thành công
 */
function convertImageToVideo(imagePath, outputMp4Path, durationSec = 5) {
    try {
        // scale=W:H:force_original_aspect_ratio=increase → phóng to để lấp đầy khung dọc 1080x1920
        // crop=W:H → cắt về đúng kích thước (giữa)
        // Xử lý cả ảnh ngang (landscape 1920x1080) lẫn ảnh dọc
        const ffCmd = [
            `"${ffmpegStatic}"`,
            `-hide_banner -loglevel error`,
            `-loop 1 -framerate 25`,
            `-i "${imagePath}"`,
            `-vf "scale=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:force_original_aspect_ratio=increase,crop=${VIDEO_WIDTH}:${VIDEO_HEIGHT}"`,
            `-t ${durationSec}`,
            `-c:v libx264 -preset fast -crf 20`,
            `-pix_fmt yuv420p`,
            `-r 25`,
            `-y "${outputMp4Path}"`
        ].join(' ');
        execSync(ffCmd, { stdio: 'pipe' });
        return true;
    } catch (e) {
        console.error(`[url_capture] ❌ Lỗi convert ảnh sang video:`, e.message);
        return false;
    }
}

module.exports = { captureUrlScreenshot, captureUrlRecording, convertImageToVideo };
