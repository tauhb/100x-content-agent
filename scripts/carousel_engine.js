const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const { getAssetForImageEngine } = require('./utils/image_asset_pipeline');
const { normalizeVisualContent, parseMarkdownToHtml } = require('./utils/content_sanitizer');

/**
 * Cỗ máy Báo Trí (Carousel Engine)
 * Render Text -> PNG 1080x1350 hoặc vuông tuỳ template
 */

function injectBrandTheme(html, brandConfig) {
    const accent = brandConfig.brand_identity?.colors?.accent || '#B6FF00';
    const primaryFont = brandConfig.brand_identity?.fonts?.primary || 'Inter';
    const secondaryFont = brandConfig.brand_identity?.fonts?.accent || 'Playfair Display';
    const handle = brandConfig.brand_identity?.handle || '@rainmaker';
    
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
            }
            body { font-family: var(--brand-font-primary) !important; }
            .accent, .highlight, .tag, .swipe { color: var(--brand-accent) !important; }
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
async function generateCarousel(slides, outputDirName = 'latest_carousel', templateName = 'default.html', customOutputBaseDir = null, keyword = null) {
    const today = new Date().toISOString().split('T')[0];
    const defaultBaseDir = path.join(__dirname, `../media_output/${today}/default/carousels`);
    const baseDir = customOutputBaseDir || defaultBaseDir;
    const outputDir = path.join(baseDir, outputDirName);
    
    // Tự động tạo thư mục nếu chưa có
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const templatePath = path.join(__dirname, 'templates', 'carousel', templateName);
    let rawTemplate = fs.readFileSync(templatePath, 'utf8');
    
    const brandConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/brand_config.json'), 'utf8'));
    let template = injectBrandTheme(rawTemplate, brandConfig);
    
    console.log(`[Carousel Engine] Mở trình duyệt giả lập... Đang nạp template: ${templateName}`);
    
    // FETCH AVATAR/CELEBRITY IMAGE IF KEYWORD EXIST
    let hookImageBase64 = '';
    if (keyword) {
        try {
            console.log(`[Carousel Engine] Đang móc Ảnh Hook qua Keyword: ${keyword}`);
            const bgImageUrl = await getAssetForImageEngine(keyword);
            if (bgImageUrl && bgImageUrl.startsWith('file://')) {
                const localPath = decodeURI(bgImageUrl.slice(7));
                const ext = path.extname(localPath).substring(1) || 'jpg';
                const data = fs.readFileSync(localPath, 'base64');
                hookImageBase64 = `data:image/${ext};base64,${data}`;
            } else if (bgImageUrl) {
                hookImageBase64 = bgImageUrl; // If it's http
            }
        } catch (err) {
            console.error(`[Carousel Engine] Lỗi load Hook Image:`, err);
        }
    }
    
    // Chạy ẩn giấu UI
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Cài đặt độ phân giải Instagram (vuông hoặc dọc phụ thuộc nội dung web)
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 }); 

    console.log(`[Carousel Engine] Bắt đầu "rửa ảnh" ${slides.length} slides...`);

    for (let i = 0; i < slides.length; i++) {
        // Normalize slide dữ liệu (Fix quy trình đồng bộ)
        const slide = normalizeVisualContent(slides[i]);
        
        // Cú pháp đặc biệt cho Slide cuối
        let swipeText = "Lướt sang ➡️";
        if (i === slides.length - 1) swipeText = "Lưu lại bài viết 📥";
        
        let contentHtml = slide.text || '';
        
        // Sử dụng parser chuẩn từ content_sanitizer
        const md2html = parseMarkdownToHtml;

        // --- NEW: Tự động lắp ghép HTML từ JSON Payload chuẩn (Tương thích với Data cấu trúc mới) ---
        if (!contentHtml && (slide.headline || slide.content || slide.subheadline || slide.quote)) {
            let parts = [];
            if (slide.type === 'title' || slide.sequence === 1) slide.isTitle = true;

            // Headline
            if (slide.headline) {
                // Wrap headline in <b> so it's accent-colored if not already title
                const hl = md2html(slide.headline);
                parts.push(slide.isTitle ? hl : `<b>${hl}</b>`);
            }
            // Subheadline
            if (slide.subheadline) {
                parts.push(`<span style="opacity: 0.8; font-size: 0.75em; display: block; margin-top: 15px; font-weight: 500">${md2html(slide.subheadline)}</span>`);
            }
            // Content List
            if (slide.content && Array.isArray(slide.content)) {
                parts.push(`<div style="font-weight: 500; font-size: 0.75em; margin-top: 40px; line-height: 1.6; color: #FFFFFF;">`);
                slide.content.forEach((line, idx) => {
                    const prefix = slide.type === 'cta' ? '👉 ' : '';
                    parts.push(`<p style="margin: 0 0 25px 0;">${prefix}${md2html(line)}</p>`);
                });
                parts.push(`</div>`);
            }
            
            contentHtml = parts.join('');
        }
        // --------------------------------------------------------------------------

        // Wrap with styled divs if it doesn't contain any HTML tags (backwards compat)
        if (slide.text && !contentHtml.includes('<div') && !contentHtml.includes('<span') && !contentHtml.includes('<b')) {
            contentHtml = slide.isTitle
                ? `<div class="title">${contentHtml.replace(/\n/g, '<br>')}</div>`
                : `<div class="body-text">${contentHtml.replace(/\n/g, '<br>')}</div>`;
        }
        
        // --- KÍCH HOẠT DYNAMIC LAYOUTS MỚI (L1-L5) ---
        let html;
        if (templateName === 'twitter_thread.html') {
            let fallbackAvatarImg = 'https://dummyimage.com/150/333/fff&text=Avatar';
            let avatarFallbackPath = path.join(__dirname, '../media-input/avatar.png');
            if (!fs.existsSync(avatarFallbackPath)) avatarFallbackPath = path.join(__dirname, '../media-input/avatar.jpg');
            if (fs.existsSync(avatarFallbackPath)) fallbackAvatarImg = `data:image/png;base64,${fs.readFileSync(avatarFallbackPath, 'base64')}`;

            html = template
                .replace(/\{\{tweetContent\}\}/g, md2html(slide.content?.[0] || slide.headline || ''))
                .replace(/\{\{pageInfo\}\}/g, `${i + 1} / ${slides.length}`)
                .replace(/\{\{avatarUrl\}\}/g, fallbackAvatarImg);
                
        } else if (templateName === 'framework_breakdown.html') {
            let contentLinesHtml = (slide.content || []).map(line => `<div class="framework-item">${md2html(line)}</div>`).join('');
            html = template
                .replace(/\{\{headline\}\}/g, md2html(slide.headline || ''))
                .replace(/\{\{contentHtml\}\}/g, contentLinesHtml)
                .replace(/\{\{pageInfo\}\}/g, `${i + 1} / ${slides.length}`)
                .replace(/\{\{swipeText\}\}/g, swipeText)
                .replace(/\{\{hookImageBase64\}\}/g, slide.isTitle && hookImageBase64 ? `<img src="${hookImageBase64}" class="celeb-avatar">` : '')
                .replace(/\{\{isTitle\}\}/g, slide.isTitle ? 'is-title-slide' : '');
                
        } else if (templateName === 'visual_listicle.html') {
            let contentLinesHtml = (slide.content || []).map(line => `<p class="listicle-point">${md2html(line)}</p>`).join('');
            html = template
                .replace(/\{\{headline\}\}/g, md2html(slide.headline || ''))
                .replace(/\{\{contentHtml\}\}/g, contentLinesHtml)
                .replace(/\{\{hugeNumber\}\}/g, slide.isTitle ? '' : (i))
                .replace(/\{\{pageInfo\}\}/g, `${i + 1} / ${slides.length}`)
                .replace(/\{\{swipeText\}\}/g, swipeText)
                .replace(/\{\{hookImageBase64\}\}/g, slide.isTitle && hookImageBase64 ? `<div class="celeb-avatar-bg" style="background-image: url('${hookImageBase64}')"></div>` : '');
                
        } else if (templateName === 'contrast_shift.html') {
            let leftPointsHtml = (slide.left_points || []).map(p => `<li>${md2html(p)}</li>`).join('');
            let rightPointsHtml = (slide.right_points || []).map(p => `<li>${md2html(p)}</li>`).join('');
            html = template
                .replace(/\{\{headline\}\}/g, md2html(slide.headline || ''))
                .replace(/\{\{left_title\}\}/g, md2html(slide.left_title || 'Tư Duy Cũ'))
                .replace(/\{\{right_title\}\}/g, md2html(slide.right_title || 'Tư Duy Mới'))
                .replace(/\{\{left_points\}\}/g, leftPointsHtml)
                .replace(/\{\{right_points\}\}/g, rightPointsHtml)
                .replace(/\{\{pageInfo\}\}/g, `${i + 1} / ${slides.length}`)
                .replace(/\{\{swipeText\}\}/g, swipeText);
                
        } else if (templateName === 'case_study.html') {
            html = template
                .replace(/\{\{headline\}\}/g, md2html(slide.headline || ''))
                .replace(/\{\{bigData\}\}/g, slide.big_data ? md2html(slide.big_data) : '')
                .replace(/\{\{contentHtml\}\}/g, (slide.content || []).map(line => `<p>${md2html(line)}</p>`).join(''))
                .replace(/\{\{pageInfo\}\}/g, `${i + 1} / ${slides.length}`)
                .replace(/\{\{swipeText\}\}/g, swipeText);
                
        } else if (templateName === 'crossroad_choice.html') {
            // --- Crossroad Choice: inject biến đặc thù của template cũ ---
            const path2ItemsHtml = (slide.path_2_items || []).map(item => `<li>${md2html(item)}</li>`).join('');
            html = template
                .replace(/\{\{tag\}\}/g, slide.tag || '')
                .replace(/\{\{headline_start\}\}/g, md2html(slide.headline_start || ''))
                .replace(/\{\{headline_highlight\}\}/g, md2html(slide.headline_highlight || ''))
                .replace(/\{\{headline_end\}\}/g, md2html(slide.headline_end || ''))
                .replace(/\{\{path_1_text\}\}/g, md2html(slide.path_1_text || ''))
                .replace(/\{\{path_2_title\}\}/g, md2html(slide.path_2_title || ''))
                .replace(/\{\{path_2_items\}\}/g, path2ItemsHtml)
                .replace(/\{\{pageInfo\}\}/g, `${i + 1} / ${slides.length}`)
                .replace(/\{\{swipeText\}\}/g, swipeText);
        } else {
            // Default & other templates (Backward Compatibility)
            html = template
                .replace(/\{\{content\}\}/g, contentHtml)
                .replace(/\{\{fontSize\}\}/g, slide.isTitle ? '90' : '65')
                .replace(/\{\{textColor\}\}/g, slide.isTitle ? 'var(--brand-accent)' : '#FFFFFF')
                .replace(/\{\{pageInfo\}\}/g, `${i + 1} / ${slides.length}`)
                .replace(/\{\{swipeText\}\}/g, swipeText);
        }
            
        // --- NEW: Kích hoạt Dynamic Replacement cho mọi biến custom ---
        // ---------------------------------------------------------------
            
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
                <div style="position: absolute; bottom: ${wm.bottom_margin}; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 15px; opacity: ${wm.opacity}; z-index: 9999;">
                    <img src="${logoBase64}" style="width: 40px; height: 40px; object-fit: contain;">
                    <span style="color: white; font-family: 'Inter', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 2px;">${wm.text}</span>
                </div>
            `;
        }
            
        // Bơm mã HTML vào trang
        await page.setContent(html, { waitUntil: 'load' });
        
        // Đợi 0.5s để font chữ Google load hoàn toàn trong lần đầu tiên
        if (i === 0) {
            await new Promise(r => setTimeout(r, 1000));
        } else {
            await new Promise(r => setTimeout(r, 200));
        }
        
        // Chụp màn hình (Lưu đuôi PNG)
        const fileName = `slide_${(i + 1).toString().padStart(2, '0')}.png`;
        const outputPath = path.join(outputDir, fileName);
        
        await page.screenshot({ path: outputPath });
        console.log(`✅ Đã xuất: ${fileName}`);
    }

    await browser.close();
    console.log(`🎯 [Thành Công] Toàn bộ file thiết kế đã nằm gọn trong: ${outputDir}`);
    return outputDir;
}

// Chạy chế độ CLI
if (require.main === module) {
    (async () => {
        const args = process.argv.slice(2);
        
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
            
            const payload = ticket.media_payload;
            const today = new Date().toISOString().split('T')[0];
            const channel = ticket.target_page || 'default';
            const bundleDir = path.join(__dirname, `../media_output/${today}/${channel}/${ticketId}`);
            
            if (!fs.existsSync(bundleDir)) fs.mkdirSync(bundleDir, { recursive: true });
            
            // --- KIẾN TRÚC FOLDER V3 CÁCH LY ---
            // BỎ QUA DOING CAPTION Ở ENGINE (AI SẼ TỰ GHI CAPTION BẰNG TAY TỪ TRƯỚC VÀO CAROUSEL/)
            const renderDir = path.join(bundleDir, 'carousel');
            if (!fs.existsSync(renderDir)) {
                fs.mkdirSync(renderDir, { recursive: true });
            }
            
            // Xử lý xác định template tương ứng
            let templateName = payload.template ? payload.template + '.html' : 'default.html';
            
            const slidesData = payload.slides || (payload.visual_content && (payload.visual_content.slides || payload.visual_content.content));
            if (!slidesData) {
                console.error(`[Lỗi] Không tìm thấy mảng 'slides' trong media_payload của Ticket ID: ${ticketId}`);
                process.exit(1);
            }
            
            const outputPath = await generateCarousel(slidesData, '', templateName, renderDir, payload.keyword);
            
            if (outputPath && ticketIndex > -1) {
                db.splice(ticketIndex, 1);
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
                console.log(`🧹 [Zero-Garbage] Đã dọn dẹp (Prune) Ticket ${ticketId} khỏi ideation_pipeline.json`);
                
                const ideaBankPath = path.join(__dirname, '../database/idea_bank.json');
                if (fs.existsSync(ideaBankPath)) {
                    const ideaBank = JSON.parse(fs.readFileSync(ideaBankPath, 'utf8'));
                    const matchedIdea = ideaBank.find(i => i.lifecycle?.status === 'IN_PIPELINE' && ticketId.includes(i.id.split('_').pop()));
                    if (matchedIdea) {
                        matchedIdea.lifecycle.publish_bundle_path = renderDir;
                        matchedIdea.lifecycle.status = 'COMPLETED';
                        fs.writeFileSync(ideaBankPath, JSON.stringify(ideaBank, null, 2), 'utf8');
                        console.log(`🔗 [Zero-Garbage] Đã cập nhật Bundle Path cho Idea: ${matchedIdea.id}`);
                    }
                }
            }
        } else {
            if (args.length < 1) {
                console.log("Usage: node carousel_engine.js <slides_json_path> <output_dir_name> <template_name> <custom_base_dir>");
                process.exit(1);
            }
            const slidesPath = path.isAbsolute(args[0]) ? args[0] : path.join(process.cwd(), args[0]);
            const slides = JSON.parse(fs.readFileSync(slidesPath, 'utf8'));
            await generateCarousel(slides, args[1] || 'latest_carousel', args[2] || 'default.html', args[3] || null);
        }
    })().catch(console.error);
}

module.exports = { generateCarousel };
