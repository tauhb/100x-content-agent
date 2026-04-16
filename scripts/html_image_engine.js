const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { saveDeliverableAndPrunePipeline } = require('./utils/inventory_manager');
const { getAssetForImageEngine, resolveAssetToBase64 } = require('./utils/image_asset_pipeline');

async function renderDynamicImage(inputHtmlPath) {
    if (!fs.existsSync(inputHtmlPath)) {
        console.error(`[Lỗi] Không tìm thấy file HTML: ${inputHtmlPath}`);
        process.exit(1);
    }

    const rawInputHtml = fs.readFileSync(inputHtmlPath, 'utf8');

    console.log('[Image Engine] Phân tích lưới (Grid) bản vẽ Bespoke HTML...');
    const browser = await puppeteer.launch({ headless: "new" });
    const extractionPage = await browser.newPage();
    await extractionPage.setContent(rawInputHtml, { waitUntil: 'load' });

    // Trích xuất mã CSS (Style) và phân tách các hộp ảnh (Image Vault Boxes)
    const payload = await extractionPage.evaluate(() => {
        const styles = Array.from(document.querySelectorAll('style')).map(s => s.outerHTML).join('\n');
        
        // Find all tags that want dynamic image insertion
        const vaultElements = Array.from(document.querySelectorAll('[data-img-vault]'));
        const imgRequests = vaultElements.map((el, index) => {
            const uniqueId = 'img-inj-' + index;
            el.setAttribute('data-inj-id', uniqueId);
            return {
                id: uniqueId,
                vault: el.getAttribute('data-img-vault'),
                keyword: el.getAttribute('data-keyword') || ''
            };
        });
        
        const mainEl = document.querySelector('main');
        const mainHtml = mainEl ? mainEl.innerHTML : document.body.innerHTML; 
        
        return { styles, mainHtml, imgRequests };
    });

    console.log(`[Image Engine] Quét thấy ${payload.imgRequests.length} yêu cầu lấy ảnh từ Vault. Đang gọi Pipeline...`);

    const resolvedImgData = [];
    for (const req of payload.imgRequests) {
        let base64Src = 'https://dummyimage.com/600x400/333/fff&text=Loading';
        try {
            const resolved = resolveAssetToBase64(await getAssetForImageEngine(req.keyword, req.vault));
            if (resolved) base64Src = resolved;
        } catch(e) {
            console.log(`[Cảnh báo] Lỗi truy xuất ${req.vault} cho keyword "${req.keyword}"`);
        }
        resolvedImgData.push({ id: req.id, base64: base64Src });
    }

    const _myAccountsPath = path.join(__dirname, '..', 'database', 'my_accounts.json');
    let brandConfig = {};
    if (fs.existsSync(_myAccountsPath)) {
        const _myAccounts = JSON.parse(fs.readFileSync(_myAccountsPath, 'utf8'));
        const _activeAccount = _myAccounts.accounts.find(a => a.active) || _myAccounts.accounts[0];
        brandConfig = { founder: _activeAccount.founder, brand_identity: _activeAccount.brand_identity };
    }

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
    // 4:5 ratio for single images: 1080x1350
    await renderPage.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });

    // Footer watermark disabled — header (avatar + name + handle) đã đủ brand identity
    const footerHtml = '';

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
                --brand-main-bg: #0b0c10;
            }
            * { box-sizing: border-box; }
            body { margin: 0; background-color: var(--brand-main-bg); color: #ffffff; font-family: var(--font-primary); display: flex; flex-direction: column; width: 1080px; height: 1350px; overflow: hidden; }
            .wrapper { flex: 1; display: flex; flex-direction: column; height: 1350px; position: relative; }
            
            #bgContainer { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: -1; }

            /* Uniform Base Styling (Absolute Overlay Reconstruction V8) */
            header { position: absolute; top: 0; left: 0; width: 100%; display: flex; align-items: center; padding: 35px 50px; background: linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%); z-index: 100; height: 160px; }
            .avatar { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 4px solid var(--brand-accent); margin-right: 25px; box-shadow: 0 4px 25px rgba(0,0,0,0.5); }
            .header-text { display: flex; flex-direction: column; justify-content: center; }
            .founder-name { font-size: 34px; font-weight: 900; letter-spacing: -0.5px; color: #fff; line-height: 1.1; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
            .handle { font-size: 24px; color: var(--brand-accent); font-weight: 600; margin-top: 5px; letter-spacing: 1px; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
            
            main { position: absolute; top: 0; left: 0; width: 1080px; height: 1350px; display: flex; flex-direction: column; overflow: hidden; z-index: 1; }
            
            footer { position: absolute; bottom: 0; left: 0; width: 100%; height: 100px; padding: 25px 40px; background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%); font-size: 22px; font-weight: 500; z-index: 100; display: flex; align-items: center; justify-content: flex-end; }
            .watermark-brand { color: #fff; font-family: var(--font-primary); font-size: 26px; font-weight: 700; letter-spacing: 2px; }

            /* Standard Typo Rules enforced globally */
            em, i, .highlight-text { font-family: var(--font-secondary); font-style: italic; background: transparent !important; color: var(--brand-accent); margin: 0 5px; font-weight: inherit; }
        </style>
        ${payload.styles}
        <style>
            /* Engine override: strip mọi hiệu ứng kính mờ từ AI-generated HTML */
            * { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <header>
                <img src="${avatarImgSrc}" class="avatar">
                <div class="header-text">
                    <div class="founder-name">${founderName}</div>
                    <div class="handle">${brandConfig.brand_identity?.handle || ''}</div>
                </div>
            </header>
            <main id="slideContainer">
            </main>
            ${footerHtml}
        </div>
    </body>
    </html>
    `;

    await renderPage.setContent(baseWrappedHtml, { waitUntil: 'load' });
    
    // Font loading penalty
    await new Promise(r => setTimeout(r, 1500)); 

    await renderPage.evaluate((htmlContent, imgData) => {
        document.getElementById('slideContainer').innerHTML = htmlContent;
        imgData.forEach(img => {
            var el = document.querySelector('[data-inj-id="' + img.id + '"]');
            if (el) {
                if (el.tagName.toLowerCase() === 'img') {
                    el.src = img.base64;
                } else {
                    el.style.backgroundImage = "url('" + img.base64 + "')";
                    el.style.backgroundSize = 'cover';
                    el.style.backgroundPosition = 'center';
                }
            }
        });
    }, payload.mainHtml, resolvedImgData);
    
    await new Promise(r => setTimeout(r, 100)); // Paint settlement

    const fileName = `media.png`;
    const outputPath = path.join(outputDir, fileName);
    await renderPage.screenshot({ path: outputPath });
    console.log(`✅ [Thành Công] Đã xuất bản Single Image: ${fileName} tại ${outputDir}`);

    await browser.close();

    // Check if called from CLI ID logic (update JSON statuses)
    const args = process.argv.slice(2);
    if (args.includes('--ticketId')) {
        const idIndex = args.indexOf('--ticketId');
        const ticketId = args[idIndex + 1];
        
        const dbPath = path.join(__dirname, '..', 'database', 'ideation_pipeline.json');
        if (fs.existsSync(dbPath)) {
            const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            const ticketIndex = db.findIndex(t => t.id === ticketId);
            
            if (ticketIndex > -1) {
                saveDeliverableAndPrunePipeline(ticketId, 'image', outputPath);
            }
        }
    }

    return outputPath;
}

// Chạy chế độ CLI
if (require.main === module) {
    (async () => {
        const args = process.argv.slice(2);
        const pathIndex = args.indexOf('--path');
        
        if (pathIndex > -1 && args[pathIndex + 1]) {
            const inputPath = path.isAbsolute(args[pathIndex + 1]) ? args[pathIndex + 1] : path.join(process.cwd(), args[pathIndex + 1]);
            await renderDynamicImage(inputPath);
        } else {
            console.log("Usage: node html_image_engine.js --path <path_to_html> [--ticketId <ID>]");
            process.exit(1);
        }
    })().catch(console.error);
}

module.exports = { renderDynamicImage };
