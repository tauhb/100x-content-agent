const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const urlArg = process.argv.findIndex(arg => arg === '--url');
if (urlArg === -1 || !process.argv[urlArg + 1]) {
    console.error("Vui lòng cung cấp URL qua tham số --url");
    process.exit(1);
}
const postUrl = process.argv[urlArg + 1];

const STATE_FILE = 'database/fb_state.json';
const OUTPUT_DIR = path.join('database/scraped_temp', 'latest');

(async () => {
    if (fs.existsSync(OUTPUT_DIR)) {
        fs.rmSync(OUTPUT_DIR, {recursive: true, force: true});
    }
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`[FB Scraper] Bắt đầu cào dữ liệu từ: ${postUrl}`);

    const hasState = fs.existsSync(STATE_FILE);

    const browser = await chromium.launch({
        headless: hasState ? true : false, // Bật hiện trình duyệt ở lần đầu đăng nhập để vượt Captcha nếu có!
        args: ['--disable-blink-features=AutomationControlled', '--disable-notifications']
    });

    const context = hasState
        ? await browser.newContext({ storageState: STATE_FILE, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36' })
        : await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36' });

    const page = await context.newPage();

    // Nếu chưa có state, thử login
    if (!fs.existsSync(STATE_FILE)) {
        console.log("[FB Scraper] Chưa có phiên đăng nhập. Tiến hành Login...");
        await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle' });
        
        const email = process.env.FB_EMAIL;
        const pass = process.env.FB_PASSWORD;

        if (!email || !pass) {
            console.error("❌ Lỗi: Cần cấu hình FB_EMAIL và FB_PASSWORD trong .env");
            await browser.close();
            process.exit(1);
        }

        try {
            await page.fill('#email', email, {timeout: 5000});
            await page.fill('#pass', pass, {timeout: 5000});
            await page.click('button[name="login"], input[name="login"], [type="submit"]', {timeout: 5000});
            await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
        } catch (e) {
            console.log("⚠️ Không tìm thấy ô tự động nhập tài khoản (Facebook check bot).");
            console.log("👉 VUI LÒNG ĐĂNG NHẬP BẰNG TAY TRONG CỬA SỔ TRÌNH DUYỆT VỪA HIỆN LÊN! (Bạn có 60 giây).");
            await page.waitForTimeout(60000); // Cho user 60s để tự bấm login và giải captacha
        }
        
        await context.storageState({ path: STATE_FILE });
        console.log("✅ Đã lưu phiên đăng nhập Facebook.");
    }

    try {
        console.log(`[FB Scraper] Đang truy cập vảo bài Post...`);
        // Force desktop viewport for standard DOM
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Wait for main content to load
        await page.waitForTimeout(5000); // Tạm chờ FB render React content

        // Extract Text Caption
        console.log(`[FB Scraper] Đang dò quét Content Caption...`);
        let textContent = "";
        try {
            // Rất nhiều cấu trúc class tĩnh của facebook có thể thay đổi, ta thử quét qua [data-ad-comet-play] hoặc các div nội dung
            const texts = await page.evaluate(() => {
                const nodes = document.querySelectorAll('[data-ad-rendering-role="story_message"]');
                if (nodes.length > 0) {
                    return Array.from(nodes).map(n => n.innerText).join('\n---\n');
                }
                const possible = document.querySelectorAll('.x193iq5w.xeuugli.x13faqbe.x1vvkbs'); 
                return Array.from(possible).map(n => n.innerText).join('\n---\n');
            });
            textContent = texts;
        } catch(e) {
            console.log("Không scrape được Text do HTML phức tạp, Vision AI sẽ đọc thay thế.");
        }

        const textOutput = path.join(OUTPUT_DIR, 'caption_raw.txt');
        fs.writeFileSync(textOutput, textContent || "[Trống - Đề nghị Vision AI đọc Text trực tiếp từ Ảnh Snapshot]");
        console.log(`✅ Text thô đã lưu tại: ${textOutput}`);

        // Chụp Layout đúng thẻ chứa nội dung chính (Tránh Newsfeed)
        const screenshotPath = path.join(OUTPUT_DIR, 'layout_snapshot.jpg');
        try {
            const mainContent = await page.$('div[role="main"]') || await page.$('div.x1yztbdb') || await page.$('body');
            if (mainContent) {
                await mainContent.screenshot({ path: screenshotPath });
            } else {
                await page.screenshot({ path: screenshotPath, fullPage: false });
            }
        } catch(e) {
            await page.screenshot({ path: screenshotPath, fullPage: false });
        }
        console.log(`✅ Chụp Layout thành công (đã khử viền rác): ${screenshotPath}`);

        // Try extracting Images
        console.log(`[FB Scraper] Đang tìm kiếm Hình ảnh...`);
        let imgUrls = [];
        
        // Thăm dò chức năng Carousel
        const hasCarousel = await page.$('div[aria-labelledby] a[aria-label]');
        
        if (hasCarousel) {
            console.log(`[FB Scraper] Phát hiện định dạng Carousel! Đang gọi Robot lật trang (Lazy-Load Bypass)...`);
            // Mở lồng kính ảnh đầu tiên
            await page.click('div[aria-labelledby] a[aria-label]');
            await page.waitForTimeout(2000); // Đợi lightbox mở
            
            let previousLength = 0;
            let retryCount = 0;
            
            while(retryCount < 3 && imgUrls.length < 30) {
                // Hút ảnh hiện tại trên màn hình
                const currentImages = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('img'))
                                .filter(i => i.width > 300 && i.src.includes('scontent'))
                                .map(i => i.src);
                });
                
                currentImages.forEach(src => {
                    if (!imgUrls.includes(src)) imgUrls.push(src);
                });
                
                if (imgUrls.length === previousLength) {
                    retryCount++;
                } else {
                    retryCount = 0; // Reset nếu có ảnh mới
                    previousLength = imgUrls.length;
                }
                
                // Trượt sang phải
                await page.keyboard.press('ArrowRight');
                await page.waitForTimeout(1000); // Đợi Facebook load ảnh mượt mà
            }
            console.log(`[FB Scraper] Lật trang hoàn tất. Trích xuất ${imgUrls.length} ảnh lõi!`);
            
            // Xóa rác Caption theo luật "Đóng băng"
            textContent = "[TRỐNG] - Bài Carousel chứa Caption rác/Share. Yêu cầu Đặc nhiệm Brain AI phân tích nội dung trực tiếp trên Hình Ảnh (Vision OCR) để ra Master Content!";
            fs.writeFileSync(textOutput, textContent);
            console.log(`✅ Đã Clear Text rác của Carousel gốc!`);
            
        } else {
            // Logic cũ (Single Image & Fallback)
            imgUrls = await page.evaluate(() => {
                const arr = [];
                const postCore = document.querySelector('div[aria-labelledby]') || document;
                
                postCore.querySelectorAll('a[attributionsrc] img').forEach(i => arr.push(i.src));
                
                if (arr.length === 0) {
                    document.querySelectorAll('div[role="main"] img, body img').forEach(i => {
                        if(i.width > 200 && i.height > 200 && i.src.includes('scontent')) {
                            arr.push(i.src);
                        }
                    });
                }
                return Array.from(new Set(arr)).filter(src => src && src.includes('scontent'));
            });
        }

        console.log(`[FB Scraper] Tìm thấy ${imgUrls.length} ảnh hợp lệ.`);
        
        for(let i=0; i<imgUrls.length; i++) {
            const p = await context.newPage();
            const viewSource = await p.goto(imgUrls[i]);
            fs.writeFileSync(path.join(OUTPUT_DIR, `image_${i+1}.jpg`), await viewSource.body());
            await p.close();
            console.log(`✅ Đã tải: image_${i+1}.jpg`);
        }

        // Export metadata.json
        const isCarousel = imgUrls.length > 1;
        const detectedFormat = isCarousel ? 'carousel' : 'single_image';
        const metadata = {
            imageCount: imgUrls.length,
            detectedFormat: detectedFormat
        };
        fs.writeFileSync(path.join(OUTPUT_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2));
        console.log(`✅ Đã xuất siêu dữ liệu (metadata): ${detectedFormat}`);

        console.log(`\n🎉 [Hoàn Tất] Chắp tay dâng dữ liệu vào thư mục:`);
        console.log(`${OUTPUT_DIR}`);
        console.log(`Dữ liệu này đã sẵn sàng để Vision AI nhai lại.`);

    } catch (e) {
        console.error(`❌ Lỗi trong quá trình Cào:`, e);
    } finally {
        await browser.close();
    }
})();
