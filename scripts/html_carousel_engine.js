const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { saveDeliverableAndPrunePipeline } = require('./utils/inventory_manager');
const { getAssetForImageEngine } = require('./utils/image_asset_pipeline');

async function renderDynamicCarousel(inputHtmlPath) {
    if (!fs.existsSync(inputHtmlPath)) {
        console.error(`[Lỗi] Không tìm thấy file HTML: ${inputHtmlPath}`);
        process.exit(1);
    }

    const rawInputHtml = fs.readFileSync(inputHtmlPath, 'utf8');

    console.log('[Carousel Engine] Phân tích cấu trúc file Carousel Bespoke...');
    const browser = await puppeteer.launch({ headless: "new" });
    const extractionPage = await browser.newPage();
    await extractionPage.setContent(rawInputHtml, { waitUntil: 'load' });

    // Trích xuất mã CSS (Style) của Đặc Nhiệm và phân tách từng Slide
    const payload = await extractionPage.evaluate(() => {
        const styles = Array.from(document.querySelectorAll('style')).map(s => s.outerHTML).join('\n');
        const slideNodes = document.querySelectorAll('section.slide');
        const slides = Array.from(slideNodes).map(el => ({
            html: el.innerHTML,
            bgKeyword: el.getAttribute('data-bg-keyword') || ''
        }));
        return { styles, slides };
    });

    if (!payload.slides || payload.slides.length === 0) {
        console.error('[Lỗi] Không tìm thấy thẻ <section class="slide"> nào. Hãy kiểm tra AI Code Generator.');
        await browser.close();
        process.exit(1);
    }

    console.log(`[Carousel Engine] Mổ xẻ thành công ${payload.slides.length} khối Slides. Bắt đầu Dập khuôn...`);

    const brandConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'database', 'brand_config.json'), 'utf8'));
    const accentColor = brandConfig.brand_identity?.colors?.accent || '#B6FF00';
    const founderName = brandConfig.founder || 'System';
    const fontPrimary = brandConfig.brand_identity?.fonts?.primary || 'Inter';
    const fontPrimarySafe = fontPrimary.replace(/\s+/g, '+');
    const fontSecondary = brandConfig.brand_identity?.fonts?.accent || 'Playfair Display';
    const fontSecondarySafe = fontSecondary.replace(/\s+/g, '+');
    const fontUrlParams = fontPrimary === fontSecondary 
        ? `family=${fontPrimarySafe}:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900`
        : `family=${fontPrimarySafe}:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=${fontSecondarySafe}:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900`;

    // Fetch Avatar specifically from media-input/avatar.jpg
    let avatarImgSrc = 'https://dummyimage.com/200/333/fff&text=Avatar';
    try {
        const avatarPath = path.join(__dirname, '..', 'media-input', 'avatar.jpg');
        if (fs.existsSync(avatarPath)) {
            const data = fs.readFileSync(avatarPath, 'base64');
            avatarImgSrc = `data:image/jpeg;base64,${data}`;
        } else {
            console.warn('[Cảnh báo] Không tìm thấy media-input/avatar.jpg');
        }
    } catch (e) {
        console.error('[Cảnh báo] Lỗi bốc Avatar:', e.message);
    }

    const outputDir = path.dirname(inputHtmlPath);

    // Renderer Page 
    const renderPage = await browser.newPage();
    await renderPage.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

    const baseWrappedHtml = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <script src="https://unpkg.com/@phosphor-icons/web"></script>
        <link href="https://fonts.googleapis.com/css2?${fontUrlParams}&display=swap" rel="stylesheet">
        <style>
            :root {
                --brand-accent: ${accentColor};
                --font-primary: '${fontPrimary}', sans-serif;
                --font-secondary: '${fontSecondary}', serif;
            }
            * { box-sizing: border-box; }
            body { margin: 0; background-color: #0b0c10; color: #ffffff; font-family: var(--font-primary); display: flex; flex-direction: column; width: 1080px; height: 1080px; overflow: hidden; }
            .wrapper { flex: 1; display: flex; flex-direction: column; height: 1080px; position: relative; }
            
            #bgContainer { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: -1; }

            /* Uniform Base Styling (Absolute Overlay Reconstruction) */
            header { position: absolute; top: 0; left: 0; width: 100%; display: flex; align-items: center; padding: 25px 45px; background: linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%); z-index: 100; height: 160px; }
            .avatar { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 4px solid var(--brand-accent); margin-right: 25px; box-shadow: 0 4px 25px rgba(0,0,0,0.5); }
            .header-text { display: flex; flex-direction: column; }
            .founder-name { font-size: 32px; font-weight: 900; letter-spacing: -0.5px; color: #fff; line-height: 1.1; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
            .handle { font-size: 22px; color: var(--brand-accent); font-weight: 600; margin-top: 5px; letter-spacing: 1px; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
            
            main { position: absolute; top: 0; left: 0; width: 1080px; height: 1080px; display: flex; flex-direction: column; overflow: hidden; background-color: #0b0c10; z-index: 1; }
            
            footer { position: absolute; bottom: 0; left: 0; width: 100%; padding: 0 30px; height: 100px; text-align: center; background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%); font-size: 20px; font-weight: 500; z-index: 100; display: flex; align-items: center; justify-content: center; }
            #footer-pagenum { font-weight: 700; color: #fff; }

            /* Standard Typo Rules enforced globally */
            em, i, .highlight-text { font-family: var(--font-secondary); font-style: italic; background: transparent !important; color: var(--brand-accent); margin: 0 5px; font-weight: inherit; }
            .ai-illustration { width: 100%; height: 100%; object-fit: cover; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 2px solid rgba(255,255,255,0.1); }
        </style>
        ${payload.styles}
    </head>
    <body>
        <div class="wrapper">
            <div id="bgContainer"></div>
            <header>
                <img src="${avatarImgSrc}" class="avatar">
                <div class="header-text">
                    <div class="founder-name">${founderName}</div>
                    <div class="handle">${brandConfig.brand_identity?.handle || ''}</div>
                </div>
            </header>
            <main class="slide" id="slideContainer">
            </main>
            <footer>
                <span id="footer-pagenum">1</span>/${payload.slides.length}
            </footer>
        </div>
    </body>
    </html>
    `;

    await renderPage.setContent(baseWrappedHtml, { waitUntil: 'load' });
    
    // Font loading penalty ONCE
    await new Promise(r => setTimeout(r, 1500)); 

    for (let i = 0; i < payload.slides.length; i++) {
        const slideData = payload.slides[i];
        console.log(`🎨 Đang ép khuôn mặt Slide số ${i+1}... (Background Keyword: '${slideData.bgKeyword}')`);

        // Fetch Background
        let bgImgCss = '';
        if (slideData.bgKeyword) {
            try {
                let bgUrl = await getAssetForImageEngine(slideData.bgKeyword, 'image_stock');
                if (bgUrl && bgUrl.startsWith('file://')) {
                    const localPath = decodeURI(bgUrl.slice(7));
                    const ext = path.extname(localPath).substring(1) || 'jpg';
                    const data = fs.readFileSync(localPath, 'base64');
                    bgImgCss = `background-image: url('data:image/${ext};base64,${data}'); background-size: cover; background-position: center; opacity: 0.15; filter: blur(30px) brightness(0.5); width: 100%; height: 100%;`;
                }
            } catch (e) {
               console.log("-> Lỗi kết xuất Background cho Slide này.");
            }
        }

        let slideHtml = slideData.html;
        
        // 1. New Logic: Handle [data-img-vault] inside slides
        const tempDiv = await renderPage.evaluateHandle((html) => {
            const div = document.createElement('div');
            div.innerHTML = html;
            return div;
        }, slideHtml);

        const imgRequests = await renderPage.evaluate((div) => {
            const vaultElements = Array.from(div.querySelectorAll('[data-img-vault]'));
            return vaultElements.map((el, index) => {
                const uniqueId = 'img-inj-' + index;
                el.setAttribute('data-inj-id', uniqueId);
                return {
                    id: uniqueId,
                    vault: el.getAttribute('data-img-vault'),
                    keyword: el.getAttribute('data-keyword') || ''
                };
            });
        }, tempDiv);

        const resolvedImgData = [];
        for (const req of imgRequests) {
            let base64Src = '';
            try {
                const assetUrl = await getAssetForImageEngine(req.keyword, req.vault);
                if (assetUrl && assetUrl.startsWith('file://')) {
                    const localPath = decodeURI(assetUrl.slice(7));
                    const ext = path.extname(localPath).substring(1) || 'jpg';
                    const data = fs.readFileSync(localPath, 'base64');
                    base64Src = `data:image/${ext};base64,${data}`;
                }
            } catch(e) {
                console.log(`[Cảnh báo] Lỗi truy xuất ${req.vault} cho keyword "${req.keyword}"`);
            }
            resolvedImgData.push({ id: req.id, base64: base64Src });
        }

        // Apply injections to slideHtml
        slideHtml = await renderPage.evaluate((div) => div.innerHTML, tempDiv);

        // 2. Legacy Logic: <ai-image>
        const aiTags = slideHtml.match(/<ai-image\s+keyword=["'][^"']+["']\s*><\/ai-image>/g) || [];
        for (const tag of aiTags) {
            const keywordMatch = tag.match(/keyword=["']([^"']+)["']/);
            if (keywordMatch) {
                const keyword = keywordMatch[1];
                let imgSrc = 'https://dummyimage.com/600x400/333/fff&text=Loading';
                try {
                    const assetUrl = await getAssetForImageEngine(keyword, 'image_stock');
                    if (assetUrl && assetUrl.startsWith('file://')) {
                        const localPath = decodeURI(assetUrl.slice(7));
                        const ext = path.extname(localPath).substring(1) || 'jpg';
                        const data = fs.readFileSync(localPath, 'base64');
                        imgSrc = `data:image/${ext};base64,${data}`;
                    } else if (assetUrl && assetUrl.startsWith('http')) {
                        imgSrc = assetUrl;
                    }
                } catch(e) {}
                slideHtml = slideHtml.replace(tag, `<img src="${imgSrc}" class="ai-illustration" />`);
            }
        }

        await renderPage.evaluate((htmlContent, bgStyles, pageIndex, imgInjections) => {
            const container = document.getElementById('slideContainer');
            container.innerHTML = htmlContent;
            document.getElementById('bgContainer').style.cssText = bgStyles || 'background-image: none;';
            document.getElementById('footer-pagenum').innerText = pageIndex;

            // Inject Vault Images
            imgInjections.forEach(img => {
                var el = container.querySelector('[data-inj-id="' + img.id + '"]');
                if (el && img.base64) {
                    if (el.tagName.toLowerCase() === 'img') {
                        el.src = img.base64;
                    } else {
                        el.style.backgroundImage = "url('" + img.base64 + "')";
                        el.style.backgroundSize = 'cover';
                        el.style.backgroundPosition = 'center';
                    }
                }
            });
        }, slideHtml, bgImgCss, (i + 1), resolvedImgData);
        
        await new Promise(r => setTimeout(r, 50));

        const fileName = `slide_${(i + 1).toString().padStart(2, '0')}.png`;
        const outputPath = path.join(outputDir, fileName);
        await renderPage.screenshot({ path: outputPath });
        console.log(`✅ Chụp ảnh thành công: ${fileName}`);
    }

    await browser.close();
    console.log(`🎯 [Thành Công] Toàn bộ Carousel Động đã được xuất kỹ thuật số tại thư mục: ${outputDir}`);
    return outputDir;
}

// Chạy chế độ CLI
if (require.main === module) {
    (async () => {
        const args = process.argv.slice(2);
        const pathIndex = args.indexOf('--path');
        
        if (pathIndex > -1 && args[pathIndex + 1]) {
            const inputPath = path.isAbsolute(args[pathIndex + 1]) ? args[pathIndex + 1] : path.join(process.cwd(), args[pathIndex + 1]);
            const outputDir = await renderDynamicCarousel(inputPath);
            
            const ticketIdIndex = args.indexOf('--ticketId');
            if (ticketIdIndex > -1 && args[ticketIdIndex + 1]) {
                const ticketId = args[ticketIdIndex + 1];
                saveDeliverableAndPrunePipeline(ticketId, 'carousel', outputDir);
            }
        } else {
            console.log("Usage: node html_carousel_engine.js --path <path_to_html>");
            process.exit(1);
        }
    })().catch(console.error);
}

module.exports = { renderDynamicCarousel };
