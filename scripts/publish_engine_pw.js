const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function launchBrowserContext(post) {
    const channelId = post.target_channels ? post.target_channels[0] : 'default';
    const userDataDir = path.join(__dirname, '../browser_data', channelId);
    console.log(`[System] Thư mục Session phân quyền: ${userDataDir}`);
    if (!fs.existsSync(userDataDir)) {
        console.log("[System] Tạo thư mục browser_data mới...");
        fs.mkdirSync(userDataDir, { recursive: true });
    }

    console.log("[System] Đang khởi động Chromium (Headless: OFF)...");
    return await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1280, height: 720 },
        args: ['--disable-notifications']
    });
}

async function handleLoginWait(page, targetUrl) {
    const isLoginNode = await page.locator('input[name="email"], button[name="login"]').first().isVisible().catch(() => false);
    if (page.url().includes('login') || page.url().includes('session_expired') || isLoginNode) {
        console.log("⚠️ [ACTION REQUIRED] Hệ thống đang Tạm Dừng. Vui lòng thả tay vào bàn phím và Đăng nhập. Trọng tài đang đếm ngược 5 phút (300s) chấn thương...");
    }
}

async function markAsPublished(post, inventory, inventoryPath, page) {
    await new Promise(r => setTimeout(r, 10000));
    await page.screenshot({ path: path.join(__dirname, '../media_output/publish_pw_success.png') });
    console.log("📸 Đã chụp ảnh xác nhận tại media_output/publish_pw_success.png");

    post.status = "published";
    if (!post.published_data) post.published_data = {};
    post.published_data.published_at = new Date().toISOString();
    post.published_data.live_url = "Chờ đồng bộ API FB";
    fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
    console.log("✅ Cập nhật Kho Inventory thành công.");
}

async function getCaption(post) {
    const captionPath = post.caption_link ? path.join(__dirname, '..', post.caption_link) : '';
    let finalCaption = '';
    if (captionPath && fs.existsSync(captionPath)) {
        finalCaption = fs.readFileSync(captionPath, 'utf8');
    } else {
        console.log(`⚠️ Không tìm thấy file caption tại: ${captionPath}`);
    }
    return finalCaption;
}

// 1. ENGINE CHO REELS
async function publishReelPlaywright(post, inventory, inventoryPath) {
    console.log(`🚀 [PLAYWRIGHT] KHỞI ĐỘNG TIẾN TRÌNH ĐĂNG REELS: ${post.post_id}`);
    const videoPath = path.join(__dirname, '..', post.media_link || "");
    if (!fs.existsSync(videoPath)) {
        console.error(`❌ Video không tồn tại: ${videoPath}`); return;
    }

    const context = await launchBrowserContext(post);
    const page = await context.newPage();

    try {
        console.log("[Router] Điều hướng đến: Reels Creator...");
        await page.goto('https://www.facebook.com/reels/create/', { waitUntil: 'networkidle' });
        await handleLoginWait(page, 'reels/create');

        console.log("[Engine] Bắt đầu tải video lên...");
        await page.setInputFiles('input[type="file"]', videoPath);

        const nextBtnSelector = '[aria-label="Tiếp"], [aria-label="Next"]';
        await page.waitForSelector(nextBtnSelector, { state: 'visible', timeout: 300000 });
        console.log("[Engine] Nhấn 'Tiếp' lần 1 (Chế độ chỉnh sửa)...");
        await page.click(nextBtnSelector);
        
        await new Promise(r => setTimeout(r, 2000));
        await page.waitForSelector(nextBtnSelector, { state: 'visible' });
        console.log("[Engine] Nhấn 'Tiếp' lần 2 (Chế độ cài bài)...");
        await page.click(nextBtnSelector);

        console.log("[Engine] Nhập Caption (v16.0 Playwright Fill)...");
        const captionBox = page.locator('div[role="textbox"]');
        await captionBox.first().waitFor({ state: 'visible' });
        await captionBox.first().click();
        await captionBox.first().fill(await getCaption(post));
        console.log("✅ Caption đã được điền.");

        console.log("[Engine] Chuẩn bị nhấn 'Đăng'...");
        const postBtn = page.locator('[aria-label="Đăng"], [aria-label="Publish"], [aria-label="Chia sẻ"], [aria-label="Post"]').last();
        await postBtn.waitFor({ state: 'visible' });
        await postBtn.click();
        console.log("🚀 [LIVE] Đã nhấn nút Đăng!");

        await markAsPublished(post, inventory, inventoryPath, page);
    } catch (error) {
        console.error(`❌ Lỗi Playwright: ${error.message}`);
        await page.screenshot({ path: path.join(__dirname, '../media_output/publish_pw_error.png') });
    } finally {
        console.log("[Engine] Đóng browser trong 5s...");
        await new Promise(r => setTimeout(r, 5000));
        await context.close();
    }
}

// 2. ENGINE CHO ẢNH (New Feature - Cross Format)
async function publishImagePlaywright(post, inventory, inventoryPath) {
    console.log(`🚀 [PLAYWRIGHT] KHỞI ĐỘNG TIẾN TRÌNH ĐĂNG ẢNH: ${post.post_id}`);
    const imagePath = path.join(__dirname, '..', post.media_link || "");
    if (!fs.existsSync(imagePath)) {
        console.error(`❌ Ảnh không tồn tại: ${imagePath}`); return;
    }

    const context = await launchBrowserContext(post);
    const page = await context.newPage();

    try {
        console.log("[Router] Điều hướng đến: Trang Cá Nhân (Profile)...");
        await page.goto('https://www.facebook.com/me', { waitUntil: 'load' });
        // Handle login manually
        await handleLoginWait(page, 'me');

        console.log("[Engine] Mở Box Đăng Bài (Composer)... Chờ tín hiệu (Max 5 phút).");
        const composerBtn = page.locator('div[role="button"]:has-text("mind"), div[role="button"]:has-text("nghĩ gì")').first();
        await composerBtn.waitFor({ state: 'visible', timeout: 300000 });
        await composerBtn.click();
        
        await new Promise(r => setTimeout(r, 2000)); // Chờ animation

        // Chọn "Ảnh/Video" để kích file input (Bỏ qua overlay ẩn của FB)
        console.log("[Engine] Click chọn đính kèm Ảnh...");
        const attachPhotoBtn = page.locator('div[aria-label="Ảnh/video"], div[aria-label="Photo/video"]').first();
        if (await attachPhotoBtn.isVisible()) {
            await attachPhotoBtn.click({ force: true });
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log("[Engine] Trỏ file Ảnh vào UI...");
        const fileInput = page.locator('input[type="file"]').last();
        await fileInput.waitFor({ state: 'attached' });
        await fileInput.setInputFiles(imagePath);

        console.log("[Engine] Nhập Caption...");
        const captionBox = page.getByRole('dialog').locator('div[role="textbox"][contenteditable="true"]').first();
        await captionBox.waitFor({ state: 'visible', timeout: 10000 });
        await captionBox.click({ force: true });
        await page.keyboard.insertText(await getCaption(post));
        console.log("✅ Caption đã được điền.");

        console.log("[Engine] Chờ 3s tải ảnh Preview...");
        await new Promise(r => setTimeout(r, 3000));

        console.log("[Engine] Kiểm tra luồng xét duyệt hiển thị 'Tiếp' (Flow mới của Facebook)...");
        const nextBtn = page.getByRole('dialog').getByRole('button', { name: /Tiếp|Next/i }).first();
        if (await nextBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
            console.log("[Engine] Đã thấy nút 'Tiếp' -> Nhấn chuyển bước!");
            await nextBtn.click({ force: true });
            await new Promise(r => setTimeout(r, 3000)); // Đợi load trang cấu hình Đăng
        } else {
            console.log("⚠️ Không tìm thấy nút Tiếp, FB có thể đã skip bước này.");
        }

        console.log("[Engine] Nhấn nút Đăng...");
        const postBtn = page.getByRole('dialog').getByRole('button', { name: /Đăng|Post/i }).last();
        await postBtn.waitFor({ state: 'visible', timeout: 15000 });
        await postBtn.click({ force: true });
        console.log("🚀 [LIVE] Đã nhấn nút Đăng xong!");

        await markAsPublished(post, inventory, inventoryPath, page);
    } catch (error) {
        console.error(`❌ Lỗi Playwright Profile Image: ${error.message}`);
        await page.screenshot({ path: path.join(__dirname, '../media_output/publish_pw_error.png') });
    } finally {
        console.log("[Engine] Đóng browser trong 5s...");
        await new Promise(r => setTimeout(r, 5000));
        await context.close();
    }
}

// ==========================================
// THỰC THI (ROUTER MAIN)
// ==========================================
async function runAutoPublish() {
    const postId = process.argv[2];
    if (!postId) {
        console.log("Usage: node scripts/publish_engine_pw.js <postId>");
        return;
    }

    const inventoryPath = path.join(__dirname, '../database/post_inventory.json');
    if (!fs.existsSync(inventoryPath)) {
        console.error("❌ database/post_inventory.json không tồn tại!"); return;
    }
    const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
    const post = inventory.find(p => p.post_id === postId);

    if (!post) {
        console.error("❌ Không tìm thấy bài đăng trong Inventory hoặc Id sai!");
        return;
    }

    const format = post.delivery_format || 'reels';
    if (format === 'reels' || format === 'broll') {
        await publishReelPlaywright(post, inventory, inventoryPath);
    } else if (format === 'image' || format === 'carousel' || format === 'infographic') {
        await publishImagePlaywright(post, inventory, inventoryPath);
    } else {
        console.log(`❌ Engine Publish chưa hỗ trợ định dạng: ${format}`);
    }
}

runAutoPublish();
