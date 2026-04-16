/**
 * html_carousel_engine.js V2 — JSON-Driven Architecture
 *
 * Luồng mới (tách biệt hoàn toàn fetch vs render):
 *   1. Đọc carousel.json do AI sinh ra
 *   2. Pre-fetch TẤT CẢ assets song song (Pexels, url_screenshot, vault local)
 *   3. Render từng slide dùng template JS cứng theo layout
 *   4. Puppeteer screenshot → slide_01.png ... slide_N.png
 *
 * Layouts hỗ trợ: HOOK-A, HOOK-B, BODY-A, BODY-B, BODY-C, BODY-D, CTA
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { saveDeliverableAndPrunePipeline } = require('./utils/inventory_manager');
const { getAssetForImageEngine, resolveAssetToBase64 } = require('./utils/image_asset_pipeline');

// ─────────────────────────────────────────────────────────────────────────────
// BRAND & AVATAR
// ─────────────────────────────────────────────────────────────────────────────

function loadBrandConfig() {
    const dbPath = path.join(__dirname, '..', 'database', 'my_accounts.json');
    const accounts = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const active = accounts.accounts.find(a => a.active) || accounts.accounts[0];
    return {
        founder:       active.founder || '',
        handle:        active.brand_identity?.handle || '',
        accent:        active.brand_identity?.colors?.accent || '#B6FF00',
        fontPrimary:   active.brand_identity?.fonts?.primary || 'Inter',
        fontSecondary: active.brand_identity?.fonts?.accent || 'Playfair Display',
    };
}

function loadAvatar() {
    for (const ext of ['jpg', 'png']) {
        const p = path.join(__dirname, '..', 'media-input', `avatar.${ext}`);
        if (fs.existsSync(p)) {
            return `data:image/${ext === 'jpg' ? 'jpeg' : 'png'};base64,${fs.readFileSync(p, 'base64')}`;
        }
    }
    return '';
}

function accentRgb(hex) {
    const h = hex.replace('#', '');
    return `${parseInt(h.slice(0,2),16)}, ${parseInt(h.slice(2,4),16)}, ${parseInt(h.slice(4,6),16)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSET PRE-FETCHER — fetch tất cả song song TRƯỚC khi render
// ─────────────────────────────────────────────────────────────────────────────

async function prefetchAssets(slides) {
    const requests = [];

    slides.forEach((slide, i) => {
        // Background image
        if (slide.bg?.keyword) {
            requests.push({
                key: `bg_${i}`,
                vault: slide.bg.vault || 'image_stock',
                keyword: slide.bg.keyword
            });
        }

        // Visual element
        const v = slide.visual;
        if (v) {
            if (v.type === 'url_screenshot' && v.url) {
                requests.push({ key: `visual_${i}`, vault: 'url_screenshot', keyword: v.url });
            } else if (v.type === 'vault' && v.keyword) {
                requests.push({ key: `visual_${i}`, vault: v.vault || 'image_stock', keyword: v.keyword });
            }
            // 'icon' và 'svg' không cần fetch
        }
    });

    console.log(`[Carousel Engine] Pre-fetching ${requests.length} assets in parallel...`);

    const results = await Promise.allSettled(
        requests.map(async req => {
            try {
                const raw = await getAssetForImageEngine(req.keyword, req.vault);
                const b64 = resolveAssetToBase64(raw);
                console.log(`  ✅ ${req.key} (${req.vault}): ${b64 ? 'OK' : 'empty'}`);
                return { key: req.key, b64: b64 || '' };
            } catch (e) {
                console.warn(`  ⚠️  ${req.key} thất bại: ${e.message}`);
                return { key: req.key, b64: '' };
            }
        })
    );

    const assetMap = {};
    results.forEach(r => {
        if (r.status === 'fulfilled') assetMap[r.value.key] = r.value.b64;
    });
    return assetMap;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function buildBgHtml(bgSrc) {
    if (!bgSrc) return '';
    return `
    <div style="position:absolute;inset:0;z-index:0;background-image:url('${bgSrc}');background-size:cover;background-position:center;"></div>
    <div style="position:absolute;inset:0;z-index:1;background:linear-gradient(to top,rgba(11,12,16,0.88) 20%,rgba(11,12,16,0.50) 55%,rgba(11,12,16,0.15) 100%);"></div>`;
}

function buildVisual(slide, assetMap, i, wrapStyle) {
    const v = slide.visual;
    if (!v) return '';

    const wrap = (inner) => `<div style="${wrapStyle}">${inner}</div>`;

    if (v.type === 'icon') {
        return wrap(`<i class="ph ${v.name}" style="font-size:140px;color:var(--brand-accent);"></i>`);
    }
    if (v.type === 'svg') {
        return wrap(v.code || '');
    }

    const b64 = assetMap[`visual_${i}`] || '';
    if (!b64) {
        return wrap(`<i class="ph ph-image" style="font-size:80px;color:rgba(255,255,255,0.18);"></i>`);
    }
    if (v.type === 'url_screenshot') {
        const chromeStyle = wrapStyle
            .replace('display:flex;', '')
            .replace('align-items:center;', '')
            .replace('justify-content:center;', '');
        return `
        <div style="${chromeStyle}display:flex;flex-direction:column;">
            <div style="background:#242529;padding:10px 16px;display:flex;align-items:center;gap:8px;flex-shrink:0;">
                <span style="width:11px;height:11px;border-radius:50%;background:#ff5f57;display:inline-block;flex-shrink:0;"></span>
                <span style="width:11px;height:11px;border-radius:50%;background:#febc2e;display:inline-block;flex-shrink:0;"></span>
                <span style="width:11px;height:11px;border-radius:50%;background:#28c840;display:inline-block;flex-shrink:0;"></span>
                <div style="flex:1;background:#1a1b1f;border-radius:6px;padding:5px 14px;font-size:15px;color:rgba(255,255,255,0.3);font-family:var(--font-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${v.url || ''}</div>
            </div>
            <div style="flex:1;min-height:0;background-image:url('${b64}');background-size:cover;background-position:top center;"></div>
        </div>`;
    }
    return `<div style="${wrapStyle}background-image:url('${b64}');background-size:cover;background-position:top center;"></div>`;
}

function buildItems(items = []) {
    return (items).map(item => `
        <div style="display:flex;align-items:flex-start;gap:16px;background:rgba(255,255,255,0.05);border-radius:14px;padding:16px 20px;border:1px solid rgba(255,255,255,0.08);">
            <i class="ph ${item.icon || 'ph-check'}" style="font-size:26px;color:var(--brand-accent);flex-shrink:0;margin-top:4px;"></i>
            <div style="display:flex;flex-direction:column;gap:5px;">
                <span style="font-size:23px;font-weight:700;color:#fff;line-height:1.3;">${item.text}</span>
                ${item.detail ? `<span style="font-size:19px;color:rgba(255,255,255,0.65);line-height:1.45;font-weight:400;">${item.detail}</span>` : ''}
            </div>
        </div>`).join('');
}

function stepBadge(step) {
    if (!step) return '';
    return `<div style="position:absolute;top:168px;right:55px;z-index:20;display:inline-flex;align-items:center;padding:8px 22px;border-radius:50px;background:rgba(255,255,255,0.07);border:1.5px solid var(--brand-accent);color:var(--brand-accent);font-size:22px;font-weight:800;">${step}</div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

function tplHookA(slide) {
    return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:60px;text-align:center;">
        ${slide.badge ? `<div style="display:inline-flex;align-items:center;padding:12px 34px;border-radius:50px;background:var(--brand-accent);color:#000;font-size:26px;font-weight:900;margin-bottom:28px;">${slide.badge}</div>` : ''}
        <h1 style="font-size:76px;font-weight:900;line-height:1.05;color:#fff;margin-bottom:22px;text-shadow:0 4px 30px rgba(0,0,0,0.8);">${slide.title}</h1>
        ${slide.subtitle ? `<p style="font-size:32px;color:rgba(255,255,255,0.75);line-height:1.4;font-weight:500;">${slide.subtitle}</p>` : ''}
    </div>`;
}

function tplHookB(slide, assetMap, i) {
    const portraitSrc = assetMap[`bg_${i}`] || '';
    return `
    <div style="position:absolute;top:0;left:0;width:100%;height:68%;z-index:2;overflow:hidden;">
        <div style="width:100%;height:100%;${portraitSrc ? `background-image:url('${portraitSrc}')` : 'background:rgba(255,255,255,0.05)'};background-size:cover;background-position:top center;"></div>
        <div style="position:absolute;bottom:0;left:0;width:100%;height:60%;background:linear-gradient(to top,#0b0c10 25%,transparent 100%);z-index:1;"></div>
    </div>
    <div style="position:absolute;bottom:90px;left:0;width:100%;padding:0 60px;text-align:center;z-index:12;">
        ${slide.badge ? `<div style="display:inline-flex;align-items:center;padding:10px 28px;border-radius:50px;background:var(--brand-accent);color:#000;font-size:24px;font-weight:900;margin-bottom:18px;">${slide.badge}</div>` : ''}
        <h1 style="font-size:66px;font-weight:900;line-height:1.05;color:#fff;text-shadow:0 4px 30px rgba(0,0,0,0.9);">${slide.title}</h1>
    </div>`;
}

function tplBodyA(slide, assetMap, i) {
    const isLargeVisual = slide.visual?.type === 'url_screenshot' || slide.visual?.type === 'vault';
    const visualHeight = isLargeVisual ? '360px' : '200px';
    const visualWrapStyle = `width:100%;height:${visualHeight};border-radius:16px;overflow:hidden;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;`;
    return `
    ${stepBadge(slide.step)}
    <div style="display:flex;flex-direction:column;padding:162px 65px 75px;height:100%;gap:12px;">
        <h2 style="font-size:44px;font-weight:900;line-height:1.15;color:#fff;margin-bottom:2px;">${slide.title}</h2>
        ${buildVisual(slide, assetMap, i, visualWrapStyle)}
        <div style="display:flex;flex-direction:column;gap:8px;">${buildItems(slide.items)}</div>
    </div>`;
}

function tplBodyB(slide, assetMap, i) {
    const visualWrapStyle = `height:100%;border-radius:20px;overflow:hidden;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;`;
    return `
    ${stepBadge(slide.step)}
    <div style="display:grid;grid-template-columns:1fr 2fr;gap:32px;padding:162px 60px 80px;height:100%;align-items:center;">
        ${buildVisual(slide, assetMap, i, visualWrapStyle)}
        <div style="display:flex;flex-direction:column;justify-content:center;gap:14px;">
            <h2 style="font-size:42px;font-weight:900;line-height:1.15;color:#fff;">${slide.title}</h2>
            <div style="display:flex;flex-direction:column;gap:10px;">${buildItems(slide.items)}</div>
        </div>
    </div>`;
}

function tplBodyC(slide, assetMap, i) {
    const visualWrapStyle = `height:100%;border-radius:20px;overflow:hidden;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;`;
    return `
    ${stepBadge(slide.step)}
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:32px;padding:162px 60px 80px;height:100%;align-items:center;">
        <div style="display:flex;flex-direction:column;justify-content:center;gap:14px;">
            <h2 style="font-size:42px;font-weight:900;line-height:1.15;color:#fff;">${slide.title}</h2>
            <div style="display:flex;flex-direction:column;gap:10px;">${buildItems(slide.items)}</div>
        </div>
        ${buildVisual(slide, assetMap, i, visualWrapStyle)}
    </div>`;
}

function tplBodyD(slide) {
    return `
    ${stepBadge(slide.step)}
    <div style="display:flex;flex-direction:column;padding:162px 65px 80px;height:100%;justify-content:center;gap:16px;">
        <h2 style="font-size:50px;font-weight:900;line-height:1.15;color:#fff;">${slide.title}</h2>
        ${slide.quote ? `<blockquote style="font-size:34px;font-style:italic;font-family:var(--font-secondary);color:rgba(255,255,255,0.90);line-height:1.5;border-left:4px solid var(--brand-accent);padding-left:28px;">${slide.quote}</blockquote>` : ''}
        ${slide.items?.length ? `<div style="display:flex;flex-direction:column;gap:10px;">${buildItems(slide.items)}</div>` : ''}
    </div>`;
}

function tplCTA(slide) {
    const actions = (slide.actions || []).map(a =>
        `<div style="display:flex;align-items:center;justify-content:center;gap:14px;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.12);border-radius:16px;padding:18px 28px;font-size:28px;font-weight:600;color:#fff;">
            <i class="ph ph-arrow-right" style="color:var(--brand-accent);font-size:28px;"></i>${a}
        </div>`
    ).join('');
    return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:60px;text-align:center;gap:20px;">
        ${slide.icon ? `<i class="ph ${slide.icon}" style="font-size:100px;color:var(--brand-accent);"></i>` : ''}
        <h2 style="font-size:58px;font-weight:900;line-height:1.1;color:#fff;">${slide.headline}</h2>
        ${slide.sub ? `<p style="font-size:28px;color:rgba(255,255,255,0.70);line-height:1.4;">${slide.sub}</p>` : ''}
        ${actions ? `<div style="display:flex;flex-direction:column;gap:14px;width:100%;">${actions}</div>` : ''}
    </div>`;
}

function renderTemplate(slide, assetMap, i) {
    switch (slide.layout) {
        case 'HOOK-A': return { content: tplHookA(slide),           bgSrc: assetMap[`bg_${i}`] || '' };
        case 'HOOK-B': return { content: tplHookB(slide,assetMap,i), bgSrc: '' }; // portrait handled inside template
        case 'BODY-A': return { content: tplBodyA(slide,assetMap,i), bgSrc: assetMap[`bg_${i}`] || '' };
        case 'BODY-B': return { content: tplBodyB(slide,assetMap,i), bgSrc: assetMap[`bg_${i}`] || '' };
        case 'BODY-C': return { content: tplBodyC(slide,assetMap,i), bgSrc: assetMap[`bg_${i}`] || '' };
        case 'BODY-D': return { content: tplBodyD(slide),            bgSrc: assetMap[`bg_${i}`] || '' };
        case 'CTA':    return { content: tplCTA(slide),              bgSrc: assetMap[`bg_${i}`] || '' };
        default:
            console.warn(`[Carousel Engine] Layout không rõ: "${slide.layout}", fallback BODY-D`);
            return { content: tplBodyD(slide), bgSrc: assetMap[`bg_${i}`] || '' };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE HTML WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

function buildSlideHtml({ brand, avatarSrc, slideContent, bgHtml, pageNum, total, fontUrlParams }) {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <link href="https://fonts.googleapis.com/css2?${fontUrlParams}&display=swap" rel="stylesheet">
    <style>
        :root {
            --brand-accent: ${brand.accent};
            --brand-accent-rgb: ${accentRgb(brand.accent)};
            --brand-main-bg: #0b0c10;
            --font-primary: '${brand.fontPrimary}', sans-serif;
            --font-secondary: '${brand.fontSecondary}', serif;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
        body { width: 1080px; height: 1080px; overflow: hidden; background: var(--brand-main-bg); font-family: var(--font-primary); color: #fff; position: relative; }
        em { font-family: var(--font-secondary); font-style: italic; color: var(--brand-accent); font-weight: inherit; }

        .sys-header { position: absolute; top: 0; left: 0; width: 100%; display: flex; align-items: center; padding: 28px 50px; background: linear-gradient(180deg, rgba(0,0,0,0.92) 0%, transparent 100%); z-index: 100; height: 155px; }
        .sys-avatar { width: 82px; height: 82px; border-radius: 50%; object-fit: cover; border: 3px solid var(--brand-accent); margin-right: 22px; flex-shrink: 0; }
        .sys-founder { font-size: 30px; font-weight: 900; color: #fff; line-height: 1.1; }
        .sys-handle { font-size: 20px; color: var(--brand-accent); font-weight: 600; margin-top: 5px; }
        .sys-footer { position: absolute; bottom: 0; left: 0; width: 100%; height: 72px; display: flex; align-items: center; justify-content: center; background: linear-gradient(0deg, rgba(0,0,0,0.75) 0%, transparent 100%); z-index: 100; font-size: 20px; color: rgba(255,255,255,0.45); font-weight: 600; letter-spacing: 2px; }
        .slide-area { position: absolute; inset: 0; z-index: 10; }
    </style>
</head>
<body>
    ${bgHtml}
    <div class="sys-header">
        ${avatarSrc ? `<img class="sys-avatar" src="${avatarSrc}">` : ''}
        <div>
            <div class="sys-founder">${brand.founder}</div>
            <div class="sys-handle">${brand.handle}</div>
        </div>
    </div>
    <div class="slide-area">
        ${slideContent}
    </div>
    <div class="sys-footer">${pageNum} / ${total}</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function renderCarousel(inputJsonPath) {
    if (!fs.existsSync(inputJsonPath)) {
        console.error(`[Lỗi] Không tìm thấy file: ${inputJsonPath}`);
        process.exit(1);
    }

    const carousel = JSON.parse(fs.readFileSync(inputJsonPath, 'utf8'));
    const slides = carousel.slides || [];
    if (slides.length === 0) {
        console.error('[Lỗi] carousel.json không có slides.');
        process.exit(1);
    }

    const brand       = loadBrandConfig();
    const avatarSrc   = loadAvatar();
    const outputDir   = path.dirname(inputJsonPath);

    const fpSafe = brand.fontPrimary.replace(/\s+/g, '+');
    const fsSafe = brand.fontSecondary.replace(/\s+/g, '+');
    const fontUrlParams = brand.fontPrimary === brand.fontSecondary
        ? `family=${fpSafe}:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900`
        : `family=${fpSafe}:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=${fsSafe}:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900`;

    // ── Phase 1: Pre-fetch tất cả assets ──────────────────────────────────
    const assetMap = await prefetchAssets(slides);

    // ── Phase 2: Launch single browser ────────────────────────────────────
    console.log('\n[Carousel Engine] Khởi động Puppeteer...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

    // Warm up fonts + icons một lần duy nhất
    await page.setContent(
        `<!DOCTYPE html><html><head>
        <link href="https://fonts.googleapis.com/css2?${fontUrlParams}&display=swap" rel="stylesheet">
        <script src="https://unpkg.com/@phosphor-icons/web"></script>
        </head><body style="background:#0b0c10;width:1080px;height:1080px;"></body></html>`,
        { waitUntil: 'networkidle0' }
    );
    await new Promise(r => setTimeout(r, 1500));

    // ── Phase 3: Render từng slide ─────────────────────────────────────────
    console.log(`\n[Carousel Engine] Bắt đầu render ${slides.length} slides...\n`);
    const outputPaths = [];

    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        console.log(`🎨 Slide ${i + 1}/${slides.length} — layout: ${slide.layout}`);

        const { content, bgSrc } = renderTemplate(slide, assetMap, i);
        const bgHtml = buildBgHtml(bgSrc);

        const html = buildSlideHtml({
            brand, avatarSrc, slideContent: content,
            bgHtml, pageNum: i + 1, total: slides.length, fontUrlParams
        });

        await page.setContent(html, { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1000)); // Đợi thêm 1s để font/icon render đủ

        const fileName  = `slide_${String(i + 1).padStart(2, '0')}.png`;
        const outPath   = path.join(outputDir, fileName);
        await page.screenshot({ path: outPath });
        outputPaths.push(outPath);
        console.log(`   ✅ ${fileName}`);
    }

    await browser.close();
    console.log(`\n🎯 [Thành công] ${slides.length} slides → ${outputDir}`);
    return outputDir;
}

// CLI
if (require.main === module) {
    (async () => {
        const args = process.argv.slice(2);
        const pathIndex = args.indexOf('--path');
        if (pathIndex > -1 && args[pathIndex + 1]) {
            const inputPath = path.isAbsolute(args[pathIndex + 1])
                ? args[pathIndex + 1]
                : path.join(process.cwd(), args[pathIndex + 1]);
            const outputDir = await renderCarousel(inputPath);
            const tidIdx = args.indexOf('--ticketId');
            if (tidIdx > -1 && args[tidIdx + 1]) {
                saveDeliverableAndPrunePipeline(args[tidIdx + 1], 'carousel', outputDir);
            }
        } else {
            console.log('Usage: node html_carousel_engine.js --path <carousel.json> [--ticketId <id>]');
            process.exit(1);
        }
    })().catch(console.error);
}

module.exports = { renderCarousel };
