const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { saveDeliverableAndPrunePipeline } = require('./utils/inventory_manager');
const { getAssetForImageEngine, resolveAssetToBase64 } = require('./utils/image_asset_pipeline');

async function renderDynamicInfographic(inputHtmlPath) {
    if (!fs.existsSync(inputHtmlPath)) {
        console.error(`[Lỗi] Không tìm thấy file HTML: ${inputHtmlPath}`);
        process.exit(1);
    }

    const rawContentHtml = fs.readFileSync(inputHtmlPath, 'utf8');
    const brandConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'database', 'brand_config.json'), 'utf8'));
    const accentColor = brandConfig.brand_identity?.colors?.accent || '#B6FF00';
    const fontPrimary = brandConfig.brand_identity?.fonts?.primary || 'Inter';
    const fontPrimarySafe = fontPrimary.replace(/\s+/g, '+');
    const fontSecondary = brandConfig.brand_identity?.fonts?.accent || 'Playfair Display';
    const fontSecondarySafe = fontSecondary.replace(/\s+/g, '+');
    const fontUrlParams = fontPrimary === fontSecondary 
        ? `family=${fontPrimarySafe}:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900`
        : `family=${fontPrimarySafe}:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=${fontSecondarySafe}:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900`;
    
    // Xử lý nạp Avatar Cá Nhân (avatar.jpg/png) - Ưu tiên hàng đầu
    const founderName = brandConfig.founder || 'System';
    let avatarImgSrc = 'https://dummyimage.com/200/333/fff&text=Avatar';
    try {
        let avatarPath = path.join(__dirname, '..', 'media-input', 'avatar.png');
        if (!fs.existsSync(avatarPath)) avatarPath = path.join(__dirname, '..', 'media-input', 'avatar.jpg');
        
        if (fs.existsSync(avatarPath)) {
            const ext = path.extname(avatarPath).substring(1);
            const data = fs.readFileSync(avatarPath, 'base64');
            avatarImgSrc = `data:image/${ext};base64,${data}`;
            console.log(`[Camera Engine] Đã nhận diện Avatar cá nhân: ${path.basename(avatarPath)}`);
        } else {
            // Fallback sang Asset Pipeline nếu không có file local
            const resolved = resolveAssetToBase64(await getAssetForImageEngine(founderName, 'personal_image'));
            if (resolved) avatarImgSrc = resolved;
        }
    } catch (e) {
        console.error('[Cảnh báo] Lỗi kết xuất Avatar:', e.message);
    }

    // Fetch Background from image_stock
    let bgImgSrc = '';
    try {
        bgImgSrc = resolveAssetToBase64(await getAssetForImageEngine('', 'image_stock'));
    } catch (e) {
        console.error('[Cảnh báo] Lỗi kết xuất Background:', e.message);
    }

    const wrappedHtml = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?${fontUrlParams}&display=swap" rel="stylesheet">
        <style>
            :root {
                --brand-accent: ${accentColor};
                --font-primary: '${fontPrimary}', sans-serif;
                --font-secondary: '${fontSecondary}', serif;
            }
            * { box-sizing: border-box; }
            body { 
                margin: 0; background-color: #0b0c10; color: #ffffff; 
                font-family: var(--font-primary); display: flex; flex-direction: column; 
                height: 1350px; width: 1080px; overflow: hidden;
            }
            .wrapper { flex: 1; display: flex; flex-direction: column; height: 1350px; }
            header { 
                display: flex; align-items: center; padding: 45px 60px; 
                border-bottom: 2px solid rgba(255,255,255,0.08); 
                background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%);
            }
            .avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--brand-accent); margin-right: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
            .header-text { display: flex; flex-direction: column; }
            .founder-name { font-size: 38px; font-weight: 900; letter-spacing: -0.5px; color: #fff; line-height: 1.1; }
            .handle { font-size: 26px; color: var(--brand-accent); font-weight: 600; margin-top: 8px; letter-spacing: 1px; }
            
            main { padding: 60px; flex: 1; display: flex; flex-direction: column; position: relative; }
            
            footer { 
                padding: 40px; text-align: center; border-top: 2px solid rgba(255,255,255,0.08); 
                background: rgba(0,0,0,0.2); font-size: 22px; font-weight: 500; opacity: 0.6; tracking: 2px;
            }
            
            /* Add base styling that AI can utilize in its internal generation */
            .highlight { color: var(--brand-accent) !important; font-weight: 700; }
            .glass-panel { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; backdrop-filter: blur(10px); }
            em, i, .highlight-text { 
                font-family: var(--font-secondary); 
                font-style: italic; 
                color: var(--brand-accent); 
                background: transparent !important;
                margin: 0 5px; 
                font-weight: inherit; 
            }
            }
        </style>
    </head>
    <body>
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('${bgImgSrc}'); background-size: cover; background-position: center; opacity: 0.2; filter: blur(40px) brightness(0.6); z-index: -1;"></div>
        <div class="wrapper">
            <header>
                <img src="${avatarImgSrc}" class="avatar">
                <div class="header-text">
                    <div class="founder-name">${founderName}</div>
                    <div class="handle">${brandConfig.brand_identity?.handle || ''}</div>
                </div>
            </header>
            <main>
                ${rawContentHtml}
            </main>
            <footer>
                ${brandConfig.brand_identity?.watermark?.text || '100X Content'} • Sáng tạo bởi Antigravity
            </footer>
        </div>
    </body>
    </html>`;

    console.log('[Camera Engine] Khởi động trình duyệt đo đạc kích thước...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Set locked viewport to strict 4:5 Facebook ratio
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    await page.setContent(wrappedHtml, { waitUntil: 'load' });
    
    // Wait for fonts to load
    await new Promise(r => setTimeout(r, 1500));

    // Force strict height
    const finalHeight = 1350;
    console.log(`[Camera Engine] Chốt khóa hiển thị tĩnh (Strict 4:5 Layout): 1080px x ${finalHeight}px`);
    
    // Take screenshot
    const outputDir = path.dirname(inputHtmlPath);
    const outputPath = path.join(outputDir, 'media.png');
    
    await page.screenshot({ path: outputPath });
    await browser.close();
    
    console.log(`✅ [Thành Công] Infographic đã được đóng khung hoàn chỉnh tại: ${outputPath}`);
    return outputPath;
}

// Chạy chế độ CLI
if (require.main === module) {
    (async () => {
        const args = process.argv.slice(2);
        const pathIndex = args.indexOf('--path');
        
        if (pathIndex > -1 && args[pathIndex + 1]) {
            const inputPath = path.isAbsolute(args[pathIndex + 1]) ? args[pathIndex + 1] : path.join(process.cwd(), args[pathIndex + 1]);
            const outputPath = await renderDynamicInfographic(inputPath);
            
            const ticketIdIndex = args.indexOf('--ticketId');
            if (ticketIdIndex > -1 && args[ticketIdIndex + 1]) {
                const ticketId = args[ticketIdIndex + 1];
                saveDeliverableAndPrunePipeline(ticketId, 'infographic', outputPath);
            }
        } else {
            console.log("Usage: node html_infographic_engine.js --path <path_to_html>");
            process.exit(1);
        }
    })().catch(console.error);
}

module.exports = { renderDynamicInfographic };
