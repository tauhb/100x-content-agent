const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const { getAssetForImageEngine } = require('./utils/image_asset_pipeline');

const { normalizeVisualContent, parseMarkdownToHtml } = require('./utils/content_sanitizer');

/**
 * Image Engine: Rửa ảnh đơn (Single Post)
 * Hỗ trợ Đa kênh Độc lập: Tự động phân tách Output theo Channel & Post ID.
 */

function injectBrandTheme(html, brandConfig) {
    const accent = brandConfig.brand_identity?.colors?.accent || '#B6FF00';
    const primaryFont = brandConfig.brand_identity?.fonts?.primary || 'Inter';
    const secondaryFont = brandConfig.brand_identity?.fonts?.accent || 'Playfair Display';
    const handle = brandConfig.brand_identity?.handle || '@rainmaker';
    const founder = brandConfig.founder || 'Mentor';

    // Tạo mã nhúng Font động từ Google Fonts
    const fontFamilies = [primaryFont, secondaryFont].map(f => f.replace(/\s+/g, '+'));
    const fontImport = `@import url('https://fonts.googleapis.com/css2?family=${fontFamilies.join('&family=')}:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap');`;
    
    const themeStyle = `
        <style>
            ${fontImport}
            :root {
                --brand-accent: ${accent};
                --brand-font-primary: '${primaryFont}', sans-serif;
                --brand-font-secondary: '${secondaryFont}', serif;
                --brand-handle: '${handle}';
                --brand-founder: '${founder}';
            }
            body { font-family: var(--brand-font-primary) !important; }
            .accent, .highlight, .tag, .quote-icon { color: var(--brand-accent) !important; }
            .tag { background-color: color-mix(in srgb, var(--brand-accent) 80%, transparent) !important; color: #000 !important; }
            .footer-brand::after { content: var(--brand-handle); }

            /* --- GLOBAL HIGHLIGHT OVERRIDES (SINGLE SOURCE OF TRUTH) --- */
            /* 1. Mặc định (Nội dung nhỏ): Viết thường, in nghiêng, màu accent */
            span.highlight-text {
                color: var(--brand-accent) !important;
                font-family: var(--brand-font-secondary), serif !important;
                font-style: italic !important;
                text-transform: lowercase !important;
            }
            
            /* 2. Tiêu đề lớn: Nền dạ quang chữ trắng, có bọc padding */
            .title span.highlight-text,
            .quote-text span.highlight-text,
            .headline span.highlight-text,
            .main-text span.highlight-text,
            .col-title-left span.highlight-text,
            .col-title-right span.highlight-text,
            .step-title span.highlight-text {
                color: #FFFFFF !important;
                background-color: color-mix(in srgb, var(--brand-accent) 80%, transparent) !important;
                padding: 2px 10px !important;
                border-radius: 8px !important;
                display: inline-block;
                line-height: 1.1;
            }
        </style>
    `;
    return html.replace('</head>', themeStyle + '</head>');
}

async function renderPersonalQuote(quoteText, author = '', headline = '', keyword = '', outputFileName = 'quote_post.png', customOutputDir = null) {
    const today = new Date().toISOString().split('T')[0];
    const defaultDir = path.join(__dirname, `../media_output/${today}/default/images`);
    const outputDir = customOutputDir || defaultDir;
    
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    const bgImageUrl = await getAssetForImageEngine(keyword);
    console.log(`[Image Engine] Đã nhận ảnh nền: ${path.basename(bgImageUrl)} (Keyword: ${keyword})`);

    let bgImageBase64 = bgImageUrl;
    if (bgImageUrl.startsWith('file://')) {
        const localPath = decodeURI(bgImageUrl.slice(7));
        try {
            const ext = path.extname(localPath).substring(1) || 'jpg';
            const data = fs.readFileSync(localPath, 'base64');
            bgImageBase64 = `data:image/${ext};base64,${data}`;
        } catch (e) {
            console.error("Lỗi đọc File Nền Local:", e.message);
        }
    }

    const templatePath = path.join(__dirname, 'templates', 'image', 'personal_quote.html');
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Nhúng Dữ liệu & Theme
    const brandConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/brand_config.json'), 'utf8'));
    let html = injectBrandTheme(template, brandConfig)
        .replace('{{bgImageUrl}}', bgImageBase64)
        .replace('{{quoteText}}', parseMarkdownToHtml(quoteText))
        .replace('{{author}}', author || brandConfig.founder || '')
        .replace('{{handle}}', brandConfig.brand_identity?.handle || '');
        
    // Đọc Brand Config để tiêm Watermark
    if (brandConfig.brand_identity?.watermark?.enabled) {
        const wm = brandConfig.brand_identity.watermark;
        let logoBase64 = '';
        try {
            const logoPath = wm.logo_url.startsWith('file://') ? wm.logo_url.slice(7) : wm.logo_url;
            const ext = path.extname(logoPath).substring(1);
            const data = fs.readFileSync(logoPath, 'base64');
            logoBase64 = `data:image/${ext};base64,${data}`;
        } catch (e) {
            console.error("Lỗi đọc Logo:", e.message);
        }
        html += `
            <div style="position: absolute; bottom: ${wm.bottom_margin}; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 20px; opacity: ${wm.opacity}; z-index: 9999;">
                <img src="${logoBase64}" style="width: 50px; height: 50px; object-fit: contain;">
                <span style="color: white; font-family: 'Inter', sans-serif; font-size: 30px; font-weight: 700; letter-spacing: 3px;">${wm.text}</span>
            </div>
        `;
    }
        
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    
    await page.setContent(html, { waitUntil: 'load' });
    // Chờ 1 chút để ảnh local load lên Canvas UI
    await new Promise(r => setTimeout(r, 1000));
    
        const outputPath = path.join(outputDir, outputFileName);
    await page.screenshot({ path: outputPath });
    
    await browser.close();
    console.log(`✅ [Thành Công] Đã xuất ảnh Quote: ${outputPath}`);
    return outputPath;
}

async function renderSuccessQuote(quoteText, author = '', title = '', handle = '@rainmaker', keyword = '', outputFileName = 'success_quote_post.png', customOutputDir = null) {
    const today = new Date().toISOString().split('T')[0];
    const defaultDir = path.join(__dirname, `../media_output/${today}/default/images`);
    const outputDir = customOutputDir || defaultDir;
    
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    const bgImageUrl = await getAssetForImageEngine(keyword);
    console.log(`[Image Engine] Đã nhận ảnh nền: ${path.basename(bgImageUrl)} (Keyword: ${keyword})`);

    let bgImageBase64 = bgImageUrl;
    if (bgImageUrl.startsWith('file://')) {
        const localPath = decodeURI(bgImageUrl.slice(7));
        try {
            const ext = path.extname(localPath).substring(1) || 'jpg';
            const data = fs.readFileSync(localPath, 'base64');
            bgImageBase64 = `data:image/${ext};base64,${data}`;
        } catch (e) {
            console.error("Lỗi đọc File Nền Local:", e.message);
        }
    }

    const templatePath = path.join(__dirname, 'templates', 'image', 'success_quote.html');
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Đọc handle chính thức từ Brand DNA (Fail-safe: Tránh AI quên truyền)
    let finalHandle = handle;
    const brandConfigPath = path.join(__dirname, '../database/brand_config.json');
    if (fs.existsSync(brandConfigPath)) {
        const bd = JSON.parse(fs.readFileSync(brandConfigPath, 'utf8'));
        if (bd.brand_identity?.handle) {
            finalHandle = bd.brand_identity.handle;
        }
    }
    
    // Nhúng Dữ liệu & Theme
    const brandConfig = JSON.parse(fs.readFileSync(brandConfigPath, 'utf8'));
    let html = injectBrandTheme(template, brandConfig)
        .replace('{{bgImageUrl}}', bgImageBase64)
        .replace('{{titleHtml}}', title ? `<div class="title">${parseMarkdownToHtml(title)}</div>` : '')
        .replace('{{author}}', author)
        .replace('{{handle}}', finalHandle)
        .replace('{{quoteText}}', parseMarkdownToHtml(quoteText));
        
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    
    await page.setContent(html, { waitUntil: 'load' });
    // Chờ 1 chút để ảnh local load lên Canvas UI
    await new Promise(r => setTimeout(r, 1000));
    
    const outputPath = path.join(outputDir, outputFileName);
    await page.screenshot({ path: outputPath });
    
    await browser.close();
    console.log(`✅ [Thành Công] Đã xuất ảnh Success Quote: ${outputPath}`);
    return outputPath;
}

async function renderStepByStep(titleHtml, stepsHtml, outputFileName = 'step_by_step.png', customOutputDir = null) {
    const today = new Date().toISOString().split('T')[0];
    const outputDir = customOutputDir || path.join(__dirname, `../media_output/${today}/default/images`);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    let template = fs.readFileSync(path.join(__dirname, 'templates', 'image', 'step_by_step.html'), 'utf8');
    const brandConfigPath = path.join(__dirname, '../database/brand_config.json');
    const brandConfig = JSON.parse(fs.readFileSync(brandConfigPath, 'utf8'));

    let html = injectBrandTheme(template, brandConfig)
        .replace('{{titleHtml}}', parseMarkdownToHtml(titleHtml))
        .replace('{{stepsHtml}}', stepsHtml.map((step, index) => {
            const lines = parseMarkdownToHtml(step).split('<br/>');
            const headline = lines.shift();
            return `
            <div class="step">
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                    <div class="step-title">${headline}</div>
                    <div class="step-desc">${lines.join('<br/>')}</div>
                </div>
            </div>`;
        }).join(''));

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'load' });
    
    const outputPath = path.join(outputDir, outputFileName);
    await page.screenshot({ path: outputPath });
    await browser.close();
    console.log(`✅ [Thành Công] Đã xuất ảnh Step By Step: ${outputPath}`);
    return outputPath;
}

async function renderComparison(titleHtml, leftTitle, rightTitle, leftPoints, rightPoints, outputFileName = 'comparison.png', customOutputDir = null) {
    const today = new Date().toISOString().split('T')[0];
    const outputDir = customOutputDir || path.join(__dirname, `../media_output/${today}/default/images`);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    let template = fs.readFileSync(path.join(__dirname, 'templates', 'image', 'comparison.html'), 'utf8');
    const brandConfigPath = path.join(__dirname, '../database/brand_config.json');
    const brandConfig = JSON.parse(fs.readFileSync(brandConfigPath, 'utf8'));

    const parsePoints = (points, className) => points.map(p => `<div class="${className}">${parseMarkdownToHtml(p)}</div>`).join('');

    let html = injectBrandTheme(template, brandConfig)
        .replace('{{titleHtml}}', parseMarkdownToHtml(titleHtml))
        .replace('{{leftTitle}}', parseMarkdownToHtml(leftTitle))
        .replace('{{rightTitle}}', parseMarkdownToHtml(rightTitle))
        .replace('{{leftPointsHtml}}', parsePoints(leftPoints, 'point-left'))
        .replace('{{rightPointsHtml}}', parsePoints(rightPoints, 'point-right'));

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'load' });
    
    const outputPath = path.join(outputDir, outputFileName);
    await page.screenshot({ path: outputPath });
    await browser.close();
    console.log(`✅ [Thành Công] Đã xuất ảnh Comparison: ${outputPath}`);
    return outputPath;
}

async function renderTweetShot(tweetHtml, keyword = '', outputFileName = 'tweet_shot.png', customOutputDir = null) {
    const today = new Date().toISOString().split('T')[0];
    const outputDir = customOutputDir || path.join(__dirname, `../media_output/${today}/default/images`);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    let template = fs.readFileSync(path.join(__dirname, 'templates', 'image', 'tweet_shot.html'), 'utf8');
    let fallbackAvatarImg = 'https://dummyimage.com/100/333/fff&text=Avatar';
    let avatarFallbackPath = path.join(__dirname, '../media-input/avatar.png');
    if (!fs.existsSync(avatarFallbackPath)) avatarFallbackPath = path.join(__dirname, '../media-input/avatar.jpg');
    if (fs.existsSync(avatarFallbackPath)) fallbackAvatarImg = `data:image/png;base64,${fs.readFileSync(avatarFallbackPath, 'base64')}`;

    const avatarUrl = fallbackAvatarImg;

    let html = injectBrandTheme(template, brandConfig)
        .replace('{{tweetHtml}}', parseMarkdownToHtml(tweetHtml))
        .replace('{{avatarUrl}}', avatarUrl);

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'load' });
    // Chờ tí cho avatar load
    await new Promise(r => setTimeout(r, 1000));
    
    const outputPath = path.join(outputDir, outputFileName);
    await page.screenshot({ path: outputPath });
    await browser.close();
    console.log(`✅ [Thành Công] Đã xuất ảnh Tweet Shot: ${outputPath}`);
    return outputPath;
}

// Chạy chế độ CLI
if (require.main === module) {
    (async () => {
        const args = process.argv.slice(2);
        
        // HỖ TRỢ CHẠY THEO TICKET ID (Industrialized Workflow)
        if (args.includes('--id')) {
            const idIndex = args.indexOf('--id');
            const ticketId = args[idIndex + 1];
            
            const dbPath = path.join(__dirname, '../database/ideation_pipeline.json');
            const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            const ticketIndex = db.findIndex(t => t.id === ticketId);
            const ticket = db[ticketIndex];
            
            if (!ticket) {
                console.error(`[Lỗi] Không tìm thấy Ticket ID: ${ticketId}`);
                process.exit(1);
            }
            
            // Xây dựng Kiến trúc Bundle Storage Khép kín
            const payload = ticket.media_payload;
            const today = new Date().toISOString().split('T')[0];
            const channel = ticket.target_page || 'default';
            const bundleDir = path.join(__dirname, `../media_output/${today}/${channel}/${ticketId}`);
            
            if (!fs.existsSync(bundleDir)) fs.mkdirSync(bundleDir, { recursive: true });
            
            // --- KIẾN TRÚC FOLDER V3 CÁCH LY ---
            // BỎ QUA DOING CAPTION Ở ENGINE (AI SẼ TỰ GHI CAPTION BẰNG TAY)
            const renderDir = path.join(bundleDir, 'image');
            if (!fs.existsSync(renderDir)) {
                fs.mkdirSync(renderDir, { recursive: true });
            }
            
            let outputPath = null;
            if (payload.template === 'success_quote') {
                outputPath = await renderSuccessQuote(
                    payload.visual_content.quote,
                    payload.visual_content.author || ticket.target_handle || '@rainmaker',
                    payload.visual_content.headline,
                    ticket.target_handle || '@rainmaker',
                    payload.visual_content.keyword,
                    `media.png`,
                    renderDir
                );
            } else if (payload.template === 'personal_quote') {
                outputPath = await renderPersonalQuote(
                    payload.visual_content.quote,
                    payload.visual_content.author,     
                    payload.visual_content.headline,   
                    payload.visual_content.keyword,
                    `media.png`,
                    renderDir
                );
            } else if (payload.template === 'step_by_step') {
                outputPath = await renderStepByStep(
                    payload.visual_content.headline,
                    payload.visual_content.content,
                    `media.png`,
                    renderDir
                );
            } else if (payload.template === 'comparison') {
                outputPath = await renderComparison(
                    payload.visual_content.headline,
                    payload.visual_content.left_title,
                    payload.visual_content.right_title,
                    payload.visual_content.left_points,
                    payload.visual_content.right_points,
                    `media.png`,
                    renderDir
                );
            } else if (payload.template === 'tweet_shot') {
                outputPath = await renderTweetShot(
                    payload.visual_content.quote,
                    payload.visual_content.keyword,
                    `media.png`,
                    renderDir
                );
            } else {
                console.error(`[Lỗi] Template ${payload.template} không được hỗ trợ qua CLI ID.`);
                process.exit(1);
            }
            
            // 2. PRUNING: Xoá Ticket khỏi Active Queue sau khi hoàn tất
            if (outputPath && ticketIndex > -1) {
                db.splice(ticketIndex, 1);
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
                console.log(`🧹 [Zero-Garbage] Đã dọn dẹp (Prune) Ticket ${ticketId} khỏi ideation_pipeline.json`);
                
                // 3. Cập nhật Idea Bank (Master Index)
                const ideaBankPath = path.join(__dirname, '../database/idea_bank.json');
                if (fs.existsSync(ideaBankPath)) {
                    const ideaBank = JSON.parse(fs.readFileSync(ideaBankPath, 'utf8'));
                    // Truy vết IDEA gốc (Mã bài thường có định dạng post_XYZ, Idea là idea_XYZ)
                    // Ở đây chúng ta tìm Idea đang IN_PIPELINE khớp với ID bài
                    const matchedIdea = ideaBank.find(i => i.lifecycle?.status === 'IN_PIPELINE' && ticketId.includes(i.id.split('_').pop()));
                    if (matchedIdea) {
                        matchedIdea.lifecycle.publish_bundle_path = bundleDir;
                        matchedIdea.lifecycle.status = 'COMPLETED';
                        fs.writeFileSync(ideaBankPath, JSON.stringify(ideaBank, null, 2), 'utf8');
                        console.log(`🔗 [Zero-Garbage] Đã cập nhật Bundle Path cho Idea: ${matchedIdea.id}`);
                    }
                }
            }
        } else {
            // Cũ: Chạy tay tham số lẻ
            const type = args[0];
            if (type === 'quote') {
                await renderPersonalQuote(args[1], args[2], args[3], args[4]);
            } else if (type === 'success') {
                await renderSuccessQuote(args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
            } else {
                console.log("Usage: node image_engine.js --id <TICKET_ID>");
                console.log("Or: node image_engine.js <type> <params...>");
                process.exit(1);
            }
        }
    })().catch(console.error);
}

async function renderToolSpotlight(headline, strongPoint, bulletsHtml, suitableFor, footerHandle, outputFileName, customOutputDir = null) {
    const outputDir = customOutputDir || path.join(__dirname, '../media_output/single_images');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    console.log(`[Image Engine] Đang kết xuất ảnh Flat Design Tool Spotlight: ${headline}`);

    const templatePath = path.join(__dirname, 'templates', 'carousel', 'tool_spotlight.html');
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Gắn DNA Thương Hiệu (Handle & Màu Accent)
    let finalHandle = footerHandle;
    let accentColor = '#B6FF00'; // Default
    const brandConfigPath = path.join(__dirname, '../database/brand_config.json');
    if (fs.existsSync(brandConfigPath)) {
        const bd = JSON.parse(fs.readFileSync(brandConfigPath, 'utf8'));
        if (bd.brand_identity?.handle) finalHandle = bd.brand_identity.handle;
        if (bd.brand_identity?.colors?.accent) accentColor = bd.brand_identity.colors.accent;
    }
    
    // Nhúng Dữ liệu HTML
    let html = template
        .replace(/{{accentColor}}/g, accentColor)
        .replace('{{headline}}', headline)
        .replace('{{strong_point}}', strongPoint)
        .replace('{{bullets}}', bulletsHtml)
        .replace('{{suitable_for}}', suitableFor)
        .replace('{{footer_handle}}', finalHandle);
        
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
    
    await page.setContent(html, { waitUntil: 'load' });
    
    const outputPath = path.join(outputDir, outputFileName);
    await page.screenshot({ path: outputPath });
    
    await browser.close();
    console.log(`✅ [Thành Công] Đã xuất ảnh Tool Spotlight: ${outputPath}`);
    return outputPath;
}

async function renderCrossroadChoice(tag, headlineStart, headlineHighlight, headlineEnd, path1Text, path2Title, path2ItemsArr, footerHandle, outputFilename, outputDir) {
    console.log(`[Image Engine] Đang kết xuất ảnh Mẫu Ngã Rẽ: #${tag} - ${headlineHighlight}`);
    
    // Normalize dữ liệu trước khi render (Fix quy trình đồng bộ)
    const normalized = normalizeVisualContent({
        tag,
        headlineStart,
        headlineHighlight,
        headlineEnd,
        path1Text,
        path2Title
    });

    const templatePath = path.join(__dirname, 'templates', 'carousel', 'crossroad_choice.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Handlebars thay thế biến số
    htmlContent = htmlContent.replace(/{{tag}}/g, normalized.tag);
    htmlContent = htmlContent.replace(/{{headline_start}}/g, parseMarkdownToHtml(normalized.headlineStart));
    htmlContent = htmlContent.replace(/{{headline_highlight}}/g, parseMarkdownToHtml(normalized.headlineHighlight));
    htmlContent = htmlContent.replace(/{{headline_end}}/g, parseMarkdownToHtml(normalized.headlineEnd));
    htmlContent = htmlContent.replace(/{{path_1_text}}/g, parseMarkdownToHtml(normalized.path1Text));
    htmlContent = htmlContent.replace(/{{path_2_title}}/g, parseMarkdownToHtml(normalized.path2Title));
    
    // Tạo list mục
    const listItems = path2ItemsArr.map(item => `<li>${item}</li>`).join('');
    htmlContent = htmlContent.replace(/{{path_2_items}}/g, listItems);
    
    // Lấy màu accent từ config
    let accentColor = '#CAFF00';
    const brandConfigPath = path.join(__dirname, '../database/brand_config.json');
    if (fs.existsSync(brandConfigPath)) {
        const bd = JSON.parse(fs.readFileSync(brandConfigPath, 'utf8'));
        if (bd.brand_identity?.colors?.accent) accentColor = bd.brand_identity.colors.accent;
    }
    
    htmlContent = htmlContent.replace(/{{accentColor}}/g, accentColor);
    htmlContent = htmlContent.replace(/{{footer_handle}}/g, footerHandle);

    const outputPath = path.join(outputDir, outputFilename);
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    await page.screenshot({ path: outputPath, type: 'png' });
    
    await browser.close();
    console.log(`✅ [Thành Công] Đã xuất ảnh Crossroad Choice: ${outputPath}`);
    
    return outputPath;
}

module.exports = { renderPersonalQuote, renderSuccessQuote, renderToolSpotlight, renderCrossroadChoice };
