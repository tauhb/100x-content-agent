const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');
const { getAssetForImageEngine } = require('./utils/image_asset_pipeline');

function startMediaServer(port, roots) {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            const urlPath = req.url.split('?')[0];
            let targetPath = null;
            for (const root of roots) {
                if (urlPath.startsWith(root.prefix)) {
                    targetPath = path.join(root.path, decodeURIComponent(urlPath.slice(root.prefix.length)));
                    break;
                }
            }
            if (targetPath && fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
                const stat = fs.statSync(targetPath);
                const fileSize = stat.size;
                const range = req.headers.range;
                const ext = path.extname(targetPath).toLowerCase();
                const mimeTypes = { '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
                const contentType = mimeTypes[ext] || 'application/octet-stream';

                if (range) {
                    const parts = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                    const chunksize = (end - start) + 1;
                    const file = fs.createReadStream(targetPath, {start, end});
                    res.writeHead(206, {
                        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': contentType,
                        'Access-Control-Allow-Origin': '*'
                    });
                    file.pipe(res);
                } else {
                    res.writeHead(200, {
                        'Content-Length': fileSize,
                        'Content-Type': contentType,
                        'Access-Control-Allow-Origin': '*'
                    });
                    fs.createReadStream(targetPath).pipe(res);
                }
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });
        server.listen(port, () => resolve(server));
    });
}

/**
 * Cỗ máy Đúc Phim Tự Động (Reels Engine - Powered by Remotion)
 * Đọc file Timeline JSON -> Chọn B-Roll -> Lồng Voice -> Ốp CSS -> Render .mp4
 */
async function generateReels(timelineJsonPath, outputFileName = 'final_reels.mp4', customOutputDir = null) {
    console.log(`[Reels Engine] Khởi động Dây chuyền Đúc Phim Tự Động...`);

    // 1. Nạp Timeline
    if (!fs.existsSync(timelineJsonPath)) {
        throw new Error(`[Lỗi] Không tìm thấy Kịch bản Phân cảnh (Timeline) tại: ${timelineJsonPath}`);
    }
    const timeline = JSON.parse(fs.readFileSync(timelineJsonPath, 'utf8'));
    console.log(`✅ [1/4] Đã nạp thành công ${timeline.length} phân cảnh (Scenes).`);

    // --- NEW: Fix CORS by converting branding to Base64 ---
    const brandConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'database', 'brand_config.json'), 'utf8'));
    const accentColor = brandConfig.brand_identity?.colors?.accent || '#B6FF00';
    let avatarBase64 = null;
    let logoBase64 = null;

    try {
        let avatarPath = path.join(__dirname, '..', 'media-input', 'avatar.png');
        if (!fs.existsSync(avatarPath)) avatarPath = path.join(__dirname, '..', 'media-input', 'avatar.jpg');
        if (fs.existsSync(avatarPath)) {
            const avatarData = fs.readFileSync(avatarPath);
            avatarBase64 = `data:image/png;base64,${avatarData.toString('base64')}`;
        }

        if (brandConfig.brand_identity?.watermark?.enabled) {
            const logoPath = brandConfig.brand_identity.watermark.logo_url;
            if (fs.existsSync(logoPath)) {
                const logoData = fs.readFileSync(logoPath);
                logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
            }
        }
    } catch (e) {
        console.warn("⚠️ Không thể chuyển đổi branding sang Base64:", e.message);
    }

    // Inject branding vào từng cảnh (hoặc Global Props) cho Remotion đọc
    timeline.forEach(scene => {
        scene.brand_avatar = avatarBase64;
        scene.brand_logo = logoBase64;
        scene.brand_accent = accentColor;
    });
    // ------------------------------------------------------

    // Ghi Pipeline tạm vào thư mục Remotion để React app đọc
    const remotionEngineDir = path.join(__dirname, 'reels_engine');
    const inputPropsPath = path.join(remotionEngineDir, 'public', 'current_timeline.json');
    fs.writeFileSync(inputPropsPath, JSON.stringify(timeline, null, 2));

    // 1.5 Khởi động Trạm Phát Sóng Micro-Server thay thế Symlink độc hại
    const today = new Date().toISOString().split('T')[0];
    const defaultDir = path.join(__dirname, '..', 'media_output', today, 'default', 'reels');
    const outputDir = customOutputDir || defaultDir;

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, outputFileName);

    // Thư mục chứa tài nguyên Download của API
    const ticketAssetsDir = path.join(outputDir, 'assets');
    if (!fs.existsSync(ticketAssetsDir)) fs.mkdirSync(ticketAssetsDir, { recursive: true });

    console.log(`📡 [Micro-Server] Khởi động Trạm Phát Sóng nội bộ tại cổng 9876...`);
    const mediaServerApp = await startMediaServer(9876, [
        { prefix: '/media-input/', path: path.join(__dirname, '..', 'media-input') },
        { prefix: '/ticket-assets/', path: ticketAssetsDir }
    ]);

    // 2 & 3. Tiền kỳ: Thu hoạch Nguyên Liệu
    console.log(`⏳ [2/4] Chạy Asset Pipeline: Gọi 3 API Đồng loạt (Pexels, ElevenLabs, HeyGen)...`);
    const { getPexelsBroll, getLocalBroll, getElevenLabsVoice, getHeyGenAvatar, getLocalMusic } = require('./utils/reels_asset_pipeline');

    // Quét nhạc nền Local và nạp vào Timeline Cảnh Đầu (Composition Root Router sẽ thầu việc Play xuyên suốt)
    const globalBgMusicPath = await getLocalMusic();
    if (globalBgMusicPath && timeline.length > 0) {
        timeline[0].bg_music = globalBgMusicPath;
    }

    // Tải assets tuần tự cho từng Cảnh để tránh thắt cổ chai Network
    for (const [index, scene] of timeline.entries()) {
        const sceneNum = index + 1;
        console.log(`\n▶️ Xử lý Tài nguyên Cảnh ${sceneNum}/${timeline.length}...`);

        // --- NEW: Asset Pipeline v5.4 (Speed & Clean Handling) ---
        if (scene.bg_video || scene.b_roll_keywords) {
            let sourceFile = null;
            let query = "";
            if (scene.b_roll_keywords) {
                query = Array.isArray(scene.b_roll_keywords) ? scene.b_roll_keywords[0] : Object.values(scene.b_roll_keywords)[0];
            }

            if (scene.video_source_override === "pexels") {
                sourceFile = await getPexelsBroll(query, sceneNum, ticketAssetsDir);
            } else {
                sourceFile = await getLocalBroll(query, sceneNum);
                if (!sourceFile) sourceFile = await getPexelsBroll(query, sceneNum, ticketAssetsDir);
            }

            let finalVideoPath = sourceFile;
            scene.bg_video = finalVideoPath || "assets/scene_1_bg.mp4"; // Fallback nếu fail toàn bộ
        }

        // Cắm API 2: Tải Voice & Karaoke Subtitle (ElevenLabs)
        if (scene.voice_text && scene.voice_text.length > 5) {
            const voiceData = await getElevenLabsVoice(scene.voice_text, sceneNum, ticketAssetsDir);
            if (voiceData) {
                scene.voice_audio = voiceData.audioPath;
                scene.karaoke_file = voiceData.karaokePath;

                try {
                    const absoluteVoicePath = voiceData.absoluteAudioPath;
                    console.log(`[Engine] Đang tính toán độ dài âm thanh...`);
                    const remotionBin = path.join(remotionEngineDir, 'node_modules/.bin/remotion');
                    const durationCmd = `"${remotionBin}" ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${absoluteVoicePath}"`;
                    const duration = parseFloat(execSync(durationCmd).toString().trim());
                    scene.duration_sec = Number((duration + 0.1).toFixed(2));
                } catch (dErr) {
                    console.warn("⚠️ Không thể tính độ dài âm thanh, dùng mặc định 15s:", dErr.message);
                    scene.duration_sec = 15;
                }
            } else {
                // FALLBACK NẾU ELEVENLABS BỊ LỖI KEY/MISSING PERMISSION
                console.warn(`[Engine] ⚠️ ElevenLabs API Lỗi! Cảnh này sẽ KHÔNG có tiếng MC.`);
                scene.duration_sec = 10; // Cứu cánh vòng lặp B-roll
            }
        } else {
            console.log(`[Engine] 💡 Chế độ Minimalist (Không có Voice).`);
            if (!scene.duration_sec) {
                scene.duration_sec = 8; // Mặc định 8s cho B-Roll Loop
                console.log(`✅ [Duration] Set mặc định 8s cho Reel Minimalist.`);
            }
        }


        // Cắm API 3: Tải MC Ảo (HeyGen)
        if (scene.require_pip) {
            scene.pip_video = await getHeyGenAvatar(scene.voice_text, sceneNum, ticketAssetsDir);
        }
    }

    // --- NEW: Data Normalization v6.0 (Stable Process) ---
    // Ép mọi kịch bản về chuẩn React Component có thể hiểu:
    // - Headline: Luôn là headline
    // - List/Bullets: Luôn là bullets
    // - Quote: Chuyển headline sang quote nếu là layout quote

    // --- v6.1: HTML Sanitizer (Fix quy trình: Loại bỏ HTML thô khỏi nội dung) ---
    const sanitizeText = (str) => {
        if (!str || typeof str !== 'string') return str;
        return str
            .replace(/<br\s*\/?>/gi, '\n')  // Chuyển <br/>, <br>, <br /> thành newline
            .replace(/<b>(.*?)<\/b>/gi, '**$1**')  // Chuyển <b>text</b> thành **text**
            .replace(/<i>(.*?)<\/i>/gi, '*$1*')    // Chuyển <i>text</i> thành *text*
            .replace(/<[^>]+>/g, '');               // Xóa mọi thẻ HTML còn sót lại
    };

    timeline.forEach(scene => {
        if (!scene.visual_content) scene.visual_content = {};
        const vc = scene.visual_content;

        // Sanitize tất cả các trường text
        if (vc.headline) vc.headline = sanitizeText(vc.headline);
        if (vc.quote) vc.quote = sanitizeText(vc.quote);
        if (vc.subheadline) vc.subheadline = sanitizeText(vc.subheadline);
        if (vc.bullets && Array.isArray(vc.bullets)) {
            vc.bullets = vc.bullets.map(b => sanitizeText(b));
        }
        if (vc.list && Array.isArray(vc.list)) {
            vc.list = vc.list.map(l => sanitizeText(l));
        }

        // 1. Chuẩn hóa List
        if (vc.list && !vc.bullets) vc.bullets = vc.list;
        if (vc.bullets && !vc.list) vc.list = vc.bullets;

        // 2. Chuẩn hóa Quote/Headline
        if (vc.quote && !vc.headline) vc.headline = vc.quote;
        if (vc.headline && !vc.quote) vc.quote = vc.headline;

        // --- NEW: Tự động gán Template Core nếu thiếu ---
        if (!scene.template_core) {
            scene.template_core = 'single_scene_dark'; // Mặc định dùng Single Scene Template
        }

        // 3. Fallback cho List Cascade (Nếu kịch bản chỉ có Headline mà layout là List)
        if ((scene.layout_skin === 'list_cascade' || scene.layout_skin === 'headline_list') && (!vc.bullets || vc.bullets.length === 0)) {
            if (scene.voice_text) {
                // Băm tạm voice_text thành bullets nếu thiếu (Fail-safe)
                vc.bullets = scene.voice_text.split(/[.!?]/).filter(t => t.trim().length > 5).slice(0, 3);
            }
        }
    });

    // Ghi ĐÈ lại File JSON Timeline cho Remotion đọc đường dẫn Asset mới và Data đã chuẩn hóa
    fs.writeFileSync(inputPropsPath, JSON.stringify(timeline, null, 2));
    console.log(`\n✅ [2/4] Asset Pipeline & Data Normalization Hoàn tất.`);

    console.log(`⏳ [3/4] Cấp lệnh cho Đạo diễn Remotion (Headless Browser) bắt đầu thu hình...`);

    /**
     * Lệnh gọi Remotion Renderer thực tế.
     * Tối ưu hóa v5.0: Tự động nhận diện OS để băm Hardware Acceleration
     */
    try {
        const isMac = process.platform === 'darwin';
        const isWin = process.platform === 'win32';

        // Mặc thầu h264 cực kỳ ổn định cho mọi máy (v5.1 Fix Stability)
        let codec = 'h264';

        let hwFlag = '';
        if (isWin) {
            // --gl=angle ép dịch phần cứng sang DirectX.
            // Sửa V6 Cứu Win: Xuống --concurrency=1 để chống 100% OOM.
            hwFlag = '--gl=angle --concurrency=1';
        }

        console.log(`[Remotion Hook] Rendering frames to ${outputPath}...`);

        // Build & Render Video với bộ cờ tối ưu siêu tốc độ:
        // Đính kèm puppeteer-timeout=120000 để Cứu máy cùi bắp hay bị lỗi Timeout do Chrome Load lâu.
        const command = `npx remotion render src/index.ts MainComposition "${outputPath}" --props="${inputPropsPath}" --codec=${codec} --image-format=jpeg --jpeg-quality=80 --crf=28 --puppeteer-timeout=120000 --overwrite ${hwFlag}`;

        try {
            // Bơm 4GB RAM cho tiến trình chạy lệnh để diệt tận gốc OOM
            execSync(command, { cwd: remotionEngineDir, stdio: 'inherit', env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=4096" } });
        } finally {
            // CLEANUPS: Zero-Garbage Compliance
            if (fs.existsSync(inputPropsPath)) fs.unlinkSync(inputPropsPath);
            mediaServerApp.close();
        }

        console.log(`✅ [4/4] BUM! Video đã được nén thành công.`);
        console.log(`🎯 [Hoàn Thành] Thành phẩm nằm tại: ${outputPath}`);
        return outputPath;

    } catch (error) {
        console.error(`[Reels Engine Error] Lỗi trong quá trình kết xuất (Render):`, error);
        throw error;
    }
}

// Chạy chế độ CLI
if (require.main === module) {
    (async () => {
        const args = process.argv.slice(2);

        if (args.includes('--id')) {
            const idIndex = args.indexOf('--id');
            const ticketId = args[idIndex + 1];

            const dbPath = path.join(__dirname, '..', 'database', 'ideation_pipeline.json');
            const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            const ticketIndex = db.findIndex(t => t.id === ticketId);
            const ticket = db[ticketIndex];

            if (!ticket) {
                console.error(`[Lỗi] Không tìm thấy Ticket ID: ${ticketId}`);
                process.exit(1);
            }

            const today = new Date().toISOString().split('T')[0];
            const channel = ticket.target_page || 'default';
            const bundleDir = ticket.bundle_path ? path.join(__dirname, '..', ticket.bundle_path) : path.join(__dirname, '..', 'media_output', today, channel, ticketId);

            if (!fs.existsSync(bundleDir)) fs.mkdirSync(bundleDir, { recursive: true });

            // --- KIẾN TRÚC FOLDER V3 CÁCH LY ---
            // BỎ QUA DOING CAPTION Ở ENGINE (AI SẼ TỰ GHI CAPTION BẰNG TAY)
            const renderDir = path.join(bundleDir, 'reels');
            if (!fs.existsSync(renderDir)) {
                fs.mkdirSync(renderDir, { recursive: true });
            }
            
            const payloadPath = path.join(renderDir, 'media_payload.json');
            let payload = ticket.media_payload; // Fallback
            if (fs.existsSync(payloadPath)) {
                payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
            }
            if (!payload) {
                console.error(`[Lỗi] Không tìm thấy Media Payload ở DB hay file local.`);
                process.exit(1);
            }

            // Ghi tạm dữ liệu ra JSON để generateReels nạp vào Remotion
            let timelineData = payload.slides ||
                payload.script_segments ||
                (payload.visual_content && (payload.visual_content.slides || payload.visual_content.script_segments));

            // Nếu không có mảng các cảnh, và đây là 1 cảnh đơn với voice_text, gói nó lại thành 1 phần tử
            if (!timelineData && payload.template_core) {
                timelineData = [payload];
            }
            let formattedData = timelineData;

            // Tương thích mảng mới script_segments nếu có (Tự chuẩn hóa thành chuẩn Timeline)
            const activeSegments = payload.script_segments || (payload.visual_content && payload.visual_content.script_segments);
            if (activeSegments) {
                formattedData = activeSegments.map(seg => ({
                    voice_text: seg.text || seg.voice_text,
                    duration_sec: seg.duration,
                    b_roll_keywords: seg.b_roll_keywords || [payload.visual_content.keyword || 'business'],
                    require_pip: payload.template === 'ai_spokesperson',
                    video_source_override: seg.video_source_override,
                    bg_video: seg.bg_video || null,
                    visual_content: {
                        ...seg,
                        headline: seg.headline || '',
                        list: seg.list || seg.bullets || []
                    },
                    layout_skin: seg.layout_skin || 'title_hook',
                    template_core: seg.template_core || 'single_scene_dark'
                }));
            }

            // FETCH AVATAR/CELEBRITY IMAGE IF KEYWORD EXIST
            let hookImageBase64 = '';
            if (payload.keyword || (payload.visual_content && payload.visual_content.keyword)) {
                const searchKeyword = payload.keyword || payload.visual_content.keyword;
                try {
                    console.log(`[Reels Engine] Đang móc Ảnh Avatar qua Keyword: ${searchKeyword}`);
                    const bgImageUrl = await getAssetForImageEngine(searchKeyword);
                    if (bgImageUrl && bgImageUrl.startsWith('file://')) {
                        const localPath = decodeURI(bgImageUrl.slice(7));
                        const ext = path.extname(localPath).substring(1) || 'jpg';
                        const data = fs.readFileSync(localPath, 'base64');
                        hookImageBase64 = `data:image/${ext};base64,${data}`;
                    } else if (bgImageUrl) {
                        hookImageBase64 = bgImageUrl; // If it's http
                    }
                } catch (err) {
                    console.error(`[Reels Engine] Lỗi load Hook Image:`, err);
                }
            }

            // Inject avatarUrl into scenes
            if (hookImageBase64) {
                formattedData = formattedData.map(scene => ({
                    ...scene,
                    avatarUrl: hookImageBase64
                }));
            }

            const tmpTimelinePath = path.join(renderDir, 'timeline_tmp.json');
            fs.writeFileSync(tmpTimelinePath, JSON.stringify(formattedData, null, 2), 'utf8');

            const outputPath = await generateReels(tmpTimelinePath, 'media.mp4', renderDir);

            // Dọn dẹp file tạm
            if (fs.existsSync(tmpTimelinePath)) fs.unlinkSync(tmpTimelinePath);

            if (outputPath && ticketIndex > -1) {
                saveDeliverableAndPrunePipeline(ticketId, 'reels', outputPath);
            }
        } else {
            if (args.length < 1) {
                console.log("Usage: node reels_engine.js <timeline_json_path> <output_name> <custom_output_dir>");
                process.exit(1);
            }
            const timelinePath = path.isAbsolute(args[0]) ? args[0] : path.join(process.cwd(), args[0]);
            await generateReels(timelinePath, args[1] || 'final_reels.mp4', args[2] || null);
        }
    })().catch(console.error);
}

module.exports = { generateReels };
