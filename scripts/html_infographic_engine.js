/**
 * html_infographic_engine.js — Minimal Variable Injector + Screenshot (V2)
 *
 * Engine làm đúng 4 việc:
 *   1. Đọc brand data từ my_accounts.json
 *   2. Replace 6 placeholder tĩnh (avatar, tên, handle, màu, font chính, font phụ)
 *   3. Fetch & replace mọi {{BG_IMAGE:keyword}} động trong HTML
 *   4. Chụp screenshot 1080×1350
 *
 * Placeholders AI dùng:
 *   {{AVATAR_SRC}}      — base64 avatar
 *   {{FOUNDER_NAME}}    — tên founder
 *   {{BRAND_HANDLE}}    — @handle
 *   {{ACCENT_COLOR}}    — màu accent (#B6FF00)
 *   {{FONT_PRIMARY}}    — font chính (Inter)
 *   {{FONT_SECONDARY}}  — font nhấn mạnh (Playfair Display)
 *   {{BG_IMAGE:keyword}} — ảnh động: engine tự fetch theo keyword, replace bằng base64
 */

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

    // ── 1. Brand config ──
    const _myAccounts = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'database', 'my_accounts.json'), 'utf8'));
    const _active = _myAccounts.accounts.find(a => a.active) || _myAccounts.accounts[0];
    const brand = _active.brand_identity;

    const founderName   = _active.founder || '';
    const brandHandle   = brand?.handle || '';
    const accentColor   = brand?.colors?.accent || '#B6FF00';
    const fontPrimary   = brand?.fonts?.primary || 'Inter';
    const fontSecondary = brand?.fonts?.accent || 'Playfair Display';

    // ── 2. Avatar → base64 ──
    let avatarSrc = '';
    try {
        let avatarPath = path.join(__dirname, '..', 'media-input', 'avatar.png');
        if (!fs.existsSync(avatarPath)) avatarPath = path.join(__dirname, '..', 'media-input', 'avatar.jpg');
        if (fs.existsSync(avatarPath)) {
            const ext = path.extname(avatarPath).substring(1);
            avatarSrc = `data:image/${ext};base64,${fs.readFileSync(avatarPath, 'base64')}`;
            console.log(`[Engine] Avatar: ${path.basename(avatarPath)}`);
        } else {
            console.warn('[Engine] Không tìm thấy avatar trong media-input/');
        }
    } catch (e) {
        console.warn('[Engine] Lỗi đọc avatar:', e.message);
    }

    // ── 3. Replace 6 placeholder tĩnh ──
    let html = fs.readFileSync(inputHtmlPath, 'utf8');
    html = html
        .replace(/\{\{AVATAR_SRC\}\}/g,      avatarSrc)
        .replace(/\{\{FOUNDER_NAME\}\}/g,    founderName)
        .replace(/\{\{BRAND_HANDLE\}\}/g,    brandHandle)
        .replace(/\{\{ACCENT_COLOR\}\}/g,    accentColor)
        .replace(/\{\{FONT_PRIMARY\}\}/g,    fontPrimary)
        .replace(/\{\{FONT_SECONDARY\}\}/g,  fontSecondary);

    // ── 4. Parse & fetch mọi {{BG_IMAGE:keyword}} ──
    const BG_PATTERN = /\{\{BG_IMAGE:([^}]+)\}\}/g;
    const bgMatches = [...html.matchAll(BG_PATTERN)];

    if (bgMatches.length > 0) {
        console.log(`[Engine] Tìm thấy ${bgMatches.length} {{BG_IMAGE}} — đang fetch...`);

        // Fetch song song tất cả ảnh
        const fetchResults = await Promise.all(
            bgMatches.map(async ([fullMatch, keyword]) => {
                try {
                    const keyword_clean = keyword.trim();
                    // Phân loại: nếu keyword có chứa tên người → celebrity_image, còn lại → image_stock
                    const vault = /person|people|portrait|face|man|woman|celebrity|cá nhân|vĩ nhân|người/.test(keyword_clean.toLowerCase())
                        ? 'celebrity_image'
                        : 'image_stock';
                    const asset = await getAssetForImageEngine(keyword_clean, vault);
                    const base64 = resolveAssetToBase64(asset);
                    console.log(`[Engine] ✅ BG_IMAGE "${keyword_clean}" (${vault}): ${base64 ? 'OK' : 'FAILED'}`);
                    return { fullMatch, base64: base64 || '' };
                } catch (e) {
                    console.warn(`[Engine] ⚠️ BG_IMAGE "${keyword}" thất bại:`, e.message);
                    return { fullMatch, base64: '' };
                }
            })
        );

        // Replace từng match (deduplicate: cùng keyword dùng lại cùng base64)
        for (const { fullMatch, base64 } of fetchResults) {
            html = html.split(fullMatch).join(base64);
        }
    }

    console.log('[Engine] Khởi động Puppeteer...');

    // ── 5. Chụp screenshot ──
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500)); // chờ font + SVG load

    const outputPath = path.join(path.dirname(inputHtmlPath), 'media.png');
    await page.screenshot({ path: outputPath });
    await browser.close();

    console.log(`✅ [Thành công] ${outputPath}`);
    return outputPath;
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

            const outputPath = await renderDynamicInfographic(inputPath);

            const ticketIdIndex = args.indexOf('--ticketId');
            if (ticketIdIndex > -1 && args[ticketIdIndex + 1]) {
                saveDeliverableAndPrunePipeline(args[ticketIdIndex + 1], 'infographic', outputPath);
            }
        } else {
            console.log('Usage: node html_infographic_engine.js --path <path_to_html> [--ticketId <id>]');
            process.exit(1);
        }
    })().catch(console.error);
}

module.exports = { renderDynamicInfographic };
