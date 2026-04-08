const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');
const { saveDeliverableAndPrunePipeline } = require('./utils/inventory_manager');

// Parse arguments
const args = process.argv.slice(2);
let inputHtmlPath = '';
let ticketId = 'default';

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--path' && args[i + 1]) inputHtmlPath = args[i + 1];
    if (args[i] === '--ticketId' && args[i + 1]) ticketId = args[i + 1];
}

async function getLocalMedia(type, keyword) {
    const dir = path.join(__dirname, '..', 'media-input', type);
    if (!fs.existsSync(dir)) return null;

    let files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
    if (type === 'background-video') files = files.filter(f => f.match(/\.(mp4|webm)$/i));
    if (type === 'background-music') files = files.filter(f => f.match(/\.(mp3|wav|m4a)$/i));

    if (files.length === 0) return null;

    let matches = files;
    if (keyword && keyword.trim() !== '') {
        const keywordMatches = files.filter(f => f.toLowerCase().includes(keyword.toLowerCase()));
        if (keywordMatches.length > 0) matches = keywordMatches;
    }

    const randomFile = matches[Math.floor(Math.random() * matches.length)];
    return path.join(dir, randomFile);
}

async function renderBrollEngine(htmlPath) {
    if (!fs.existsSync(htmlPath)) {
        console.error(`[Lỗi] Không tìm thấy HTML B-Roll: ${htmlPath}`);
        process.exit(1);
    }
    const outputDir = path.dirname(htmlPath);
    let rawInputHtml = fs.readFileSync(htmlPath, 'utf8');

    // Nạp Brand Config
    const brandConfigPath = path.join(__dirname, '..', 'database', 'brand_config.json');
    let brandConfig = {};
    if (fs.existsSync(brandConfigPath)) brandConfig = JSON.parse(fs.readFileSync(brandConfigPath, 'utf8'));

    const founderName = brandConfig.founder || 'System';
    const brandHandle = brandConfig.brand_identity?.handle || brandConfig.brand_identity?.watermark?.text || '@brand';

    // Xử lý nạp Avatar Base64 Thần tốc
    let avatarBase64 = 'https://dummyimage.com/200/333/fff&text=Avatar';
    try {
        let avatarPath = path.join(__dirname, '..', 'media-input', 'avatar.png');
        if (!fs.existsSync(avatarPath)) avatarPath = path.join(__dirname, '..', 'media-input', 'avatar.jpg');
        if (fs.existsSync(avatarPath)) {
            const ext = path.extname(avatarPath).substring(1);
            const data = fs.readFileSync(avatarPath, 'base64');
            avatarBase64 = `data:image/${ext};base64,${data}`;
        }
    } catch (e) {
        console.warn('[Cảnh báo] Lỗi bốc Avatar:', e.message);
    }

    console.log('[B-Roll Engine] Động Cơ V3 Decentralization: Phân tách HTML 1080x1920...');
    const browser = await puppeteer.launch({ headless: "new" });
    const extractionPage = await browser.newPage();
    await extractionPage.setContent(rawInputHtml, { waitUntil: 'load' });

    // Trích xuất keyword & Nội dung Lõi của AI sinh
    const metadata = await extractionPage.evaluate(() => {
        const brollMeta = document.querySelector('meta[name="broll-keyword"]');
        const musicMeta = document.querySelector('meta[name="music-keyword"]');
        const styles = Array.from(document.querySelectorAll('style')).map(s => s.outerHTML).join('\n');
        const mainEl = document.querySelector('main');
        return { 
            brollKeyword: brollMeta ? brollMeta.getAttribute('content') : '',
            musicKeyword: musicMeta ? musicMeta.getAttribute('content') : '',
            styles,
            mainHtml: mainEl ? mainEl.innerHTML : document.body.innerHTML
        };
    });

    const accentColor = brandConfig.brand_identity?.colors?.accent || '#B6FF00';
    const fontPrimary = brandConfig.brand_identity?.fonts?.primary || 'Inter';
    const fontPrimarySafe = fontPrimary.replace(/\s+/g, '+');
    const fontSecondary = brandConfig.brand_identity?.fonts?.accent || 'Playfair Display';
    const fontSecondarySafe = fontSecondary.replace(/\s+/g, '+');
    const fontUrlParams = fontPrimary === fontSecondary 
        ? `family=${fontPrimarySafe}:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900`
        : `family=${fontPrimarySafe}:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=${fontSecondarySafe}:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900`;

    // System Core HTML: Tiêm cứng Watermark và CTA
    const baseWrappedHtml = `
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
                --brand-main-bg: transparent; 
            }
            * { box-sizing: border-box; }
            body { 
                margin: 0; background-color: transparent !important; background: none !important;
                color: #ffffff; font-family: var(--font-primary); overflow: hidden; 
                width: 1080px; height: 1920px; position: relative;
            }
            main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 1080px; height: 1920px; }
            em, i, .highlight-text { font-family: var(--font-secondary) !important; font-style: italic !important; background: transparent !important; color: var(--brand-accent) !important; margin: 0 5px; font-weight: inherit !important; }
            
            /* LÕI HỆ THỐNG: WATERMARK */
            #system-watermark {
                position: absolute; bottom: 80px; display: flex; align-items: center;
                background: rgba(0,0,0,0.5); padding: 15px 40px; border-radius: 50px; z-index: 9999;
                left: 50%; transform: translateX(-50%); width: auto;
            }
            #system-watermark img.avatar { width: 60px; height: 60px; border-radius: 50%; margin-right: 20px; object-fit: cover;}
            #system-watermark .brand-info { display: flex; flex-direction: column; text-align: left; }
            #system-watermark .founder { font-size: 28px; font-weight: bold; color: #fff; }
            #system-watermark .handle { font-size: 22px; color: #ccc; }

            /* LÕI HỆ THỐNG: NÚT CTA */
            #system-cta {
                position: absolute; bottom: 250px; left: 50%; transform: translateX(-50%);
                background: var(--brand-accent); color: #000;
                padding: 20px 40px; border-radius: 50px; font-size: 35px; font-weight: 900;
                box-shadow: 0 15px 30px rgba(0,0,0,0.5); z-index: 10000; display: flex;
            }
        </style>
        ${metadata.styles}
    </head>
    <body>
        <main>
            ${metadata.mainHtml}
        </main>
        
        <!-- THÀNH PHẦN HỆ THỐNG ÉP BUỘC -->
        <div id="system-cta">👇 Đọc Caption ngay!</div>
        <div id="system-watermark">
            <img class="avatar" src="${avatarBase64}"> 
            <div class="brand-info">
                <span class="founder">${founderName}</span>
                <span class="handle">${brandHandle}</span>
            </div>
        </div>
    </body>
    </html>
    `;

    const renderPage = await browser.newPage();
    await renderPage.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await renderPage.setContent(baseWrappedHtml, { waitUntil: 'networkidle0' });
    
    // Tẩy nền
    await renderPage.evaluate(() => {
        document.body.style.backgroundColor = 'transparent';
        document.documentElement.style.backgroundColor = 'transparent';
    });

    const overlayBasePng = path.join(outputDir, 'overlay_base.png');
    const overlayCtaPng = path.join(outputDir, 'overlay_cta.png');

    // 📸 CHỤP NHỊP 1: KÍNH NỀN BASE (Sản phẩm AI tạo ra + Watermark, Giấu CTA của hệ thống)
    await renderPage.evaluate(() => {
        const wm = document.getElementById('system-watermark');
        if (wm) wm.style.display = 'flex';
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.style.display = 'flex';
        // Hide CTA
        const cta = document.getElementById('system-cta');
        if (cta) cta.style.display = 'none';
    });
    await renderPage.screenshot({ path: overlayBasePng, omitBackground: true });
    console.log(`[B-Roll Engine] Nhịp 1: Đã chụp Kính nền Base (Sáng tạo AI + Watermark)`);

    // 📸 CHỤP NHỊP 2: KÍNH CTA (Tắt hết, chỉ Bất tử CTA)
    await renderPage.evaluate(() => {
        const wm = document.getElementById('system-watermark');
        if (wm) wm.style.display = 'none';
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.style.display = 'none';
        // Show CTA
        const cta = document.getElementById('system-cta');
        if (cta) cta.style.display = 'flex';
    });
    await renderPage.screenshot({ path: overlayCtaPng, omitBackground: true });
    console.log(`[B-Roll Engine] Nhịp 2: Đã chụp Kính Hệ thống CTA`);
    
    await browser.close();

    // Săn Video và Nhạc
    console.log(`[B-Roll Engine] Đang tìm Video Broll và Music...`);
    const finalBgVideo = await getLocalMedia('background-video', metadata.brollKeyword) || path.join(__dirname, '..', 'media-input', 'background-video', 'default.mp4'); 
    const finalBgMusic = await getLocalMedia('background-music', metadata.musicKeyword);
    
    if (!fs.existsSync(finalBgVideo)) {
        console.error(`[Lỗi Nặng] Không tìm thấy Video B-Roll nào trong thư mục.`);
        process.exit(1);
    }

    const finalOutput = path.join(outputDir, 'media.mp4');
    
    try {
        console.log(`[FFMPEG Math Engine] Đang ráp thuật toán: Fading (1s) + Bắn nảy CTA (Giây thứ 2)...`);
        
        let audioInput = finalBgMusic ? `-stream_loop -1 -i "${finalBgMusic}"` : '';
        let mapAudio = finalBgMusic ? `-map 3:a` : '';

        // [0:v] = BG Video
        // [1:v] = overlay_base.png
        // [2:v] = overlay_cta.png

        const filterStr = `[1:v]format=rgba,fade=in:st=0:d=1:alpha=1[base_faded];[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg_cropped];[bg_cropped][base_faded]overlay=shortest=1[middle];[middle][2:v]overlay=enable='gte(t,2)'[outv]`;

        const ffmpegCmd = `"${ffmpegStatic}" -hide_banner -loglevel error -stream_loop -1 -i "${finalBgVideo}" -loop 1 -i "${overlayBasePng}" -loop 1 -i "${overlayCtaPng}" ${audioInput} -filter_complex "${filterStr}" -map "[outv]" ${mapAudio} -t 8 -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -y "${finalOutput}"`;
        
        execSync(ffmpegCmd, { stdio: 'inherit' });
        
        // Dọn rác
        if (fs.existsSync(overlayBasePng)) fs.unlinkSync(overlayBasePng);
        if (fs.existsSync(overlayCtaPng)) fs.unlinkSync(overlayCtaPng);

        console.log(`✅ [Hoàn Tất] Thước phim B-Roll V3 Đỉnh Phong đã ra lò thành công: ${finalOutput}`);
        
        if (ticketId !== 'default') {
            saveDeliverableAndPrunePipeline(ticketId, 'broll', finalOutput);
        }
    } catch (e) {
        console.error(`[FFMPEG Lỗi Nén] ${e.message}`);
    }
}

if (inputHtmlPath) {
    renderBrollEngine(inputHtmlPath).catch(err => {
        console.error(err);
        process.exit(1);
    });
} else {
    console.error("Cách dùng: node scripts/html_broll_engine.js --path <output_html_path>");
}
