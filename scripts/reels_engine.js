const fs = require('fs');
const path = require('path');
process.env.PATH = `/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH}`;
const http = require('http');
const { execSync } = require('child_process');
const { exec } = require('child_process');
const execAsync = (cmd, opts) => new Promise((resolve, reject) => {
    const child = exec(cmd, { ...opts, maxBuffer: 1024 * 1024 * 512 }, (err, stdout, stderr) => {
        if (err) reject(err); else resolve({ stdout, stderr });
    });
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
});
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
                    const file = fs.createReadStream(targetPath, { start, end });
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
    const _myAccounts = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'database', 'my_accounts.json'), 'utf8'));
    const _activeAccount = _myAccounts.accounts.find(a => a.active) || _myAccounts.accounts[0];
    const brandConfig = { founder: _activeAccount.founder, brand_identity: _activeAccount.brand_identity };
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

    // Inject full brand profile vào từng cảnh (white-label: không hardcode trong component)
    const brandPrimaryFont = brandConfig.brand_identity?.fonts?.primary || 'Inter';
    const brandAccentFont = brandConfig.brand_identity?.fonts?.accent || 'Playfair Display';
    const brandHandle = brandConfig.brand_identity?.handle || '';
    const brandFounder = brandConfig.founder || '';
    const brandWatermark = brandConfig.brand_identity?.watermark || {};

    // Canonical brand label for quotes (e.g. "@rainmaker" or "Hoàng Bá Tầu")
    const brandLabel = brandHandle || brandFounder || 'Brand';

    timeline.forEach(scene => {
        scene.brand_avatar = avatarBase64;
        scene.brand_logo = logoBase64;
        scene.brand_accent = accentColor;
        scene.brand_primary_font = brandPrimaryFont;
        scene.brand_accent_font = brandAccentFont;
        scene.brand_handle = brandHandle;
        scene.brand_founder = brandFounder;
        scene.brand_watermark = brandWatermark;

        // Auto-fix BROLL_QUOTE author: replace missing / generic / wrong brand name
        if (scene.archetype === 'BROLL_QUOTE' && scene.props) {
            const author = (scene.props.author || '').trim();
            const genericPatterns = ['ANTIGRAVITY AI', 'ANTIGRAVITY', 'AI', 'BRAND', ''];
            if (!author || genericPatterns.includes(author.toUpperCase())) {
                scene.props.author = brandLabel;
            }
        }
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
    const { getPexelsBroll, getPexelsImage, getLocalImage, getLocalBroll, getElevenLabsVoice, getHeyGenAvatar, getLocalMusic } = require('./utils/reels_asset_pipeline');
    const { captureUrlScreenshot, captureUrlRecording, convertImageToVideo } = require('./utils/url_capture');
    // Helper đồng bộ với toTicketHttpUrl trong reels_asset_pipeline
    const toTicketHttpUrl = (absPath) => `http://localhost:9876/ticket-assets/${encodeURIComponent(path.basename(absPath))}`;

    // Quét nhạc nền Local và nạp vào Timeline Cảnh Đầu (Composition Root Router sẽ thầu việc Play xuyên suốt)
    const globalBgMusicPath = await getLocalMusic();
    if (globalBgMusicPath && timeline.length > 0) {
        timeline[0].bg_music = globalBgMusicPath;
    }

    // ── ElevenLabs Semaphore ─────────────────────────────────────────────────
    // Giới hạn tối đa 5 yêu cầu đồng thời → tránh rate limit 10 req/min của API
    const ELEVENLABS_CONCURRENCY = 5;
    let _elActive = 0;
    const _elQueue = [];
    const _elAcquire = () => new Promise(resolve => {
        if (_elActive < ELEVENLABS_CONCURRENCY) { _elActive++; resolve(); }
        else _elQueue.push(resolve);
    });
    const _elRelease = () => {
        _elActive--;
        if (_elQueue.length > 0) { _elActive++; _elQueue.shift()(); }
    };
    // ────────────────────────────────────────────────────────────────────────

    // Tải assets song song cho tất cả cảnh — Pexels song song, ElevenLabs tối đa 5 concurrent
    const processScene = async (scene, index) => {
        const sceneNum = index + 1;
        console.log(`\n▶️ Xử lý Tài nguyên Cảnh ${sceneNum}/${timeline.length}...`);

        const BROLL_ARCHETYPES = new Set([
            'ARCH_BROLL', 'MEDIA_TOP', 'MEDIA_MIDDLE', 'MEDIA_BOTTOM', 'MEDIA_LOWER_THIRD',
            'BROLL_LOWER_THIRD', 'CINEMATIC_HOOK',
            // Phase 1 Hook layouts that use video
            'HOOK_BROLL_TEXT',
            // Phase 3 Body layouts that use ambient video
            'BODY_STORY',
        ]);

        // --- Auto-inject ambient_broll for foundation archetypes that need background video ---
        // These archetypes render on black without video — AI often forgets to set ambient_broll
        const AMBIENT_BROLL_ARCHETYPES = new Set([
            // Hook
            'HOOK_QUESTION', 'HOOK_CONTRAST', 'HOOK_STAT', 'HOOK_GLITCH', 'HOOK_COUNTDOWN', 'HOOK_ZOOM_CRASH',
            // Setup
            'SETUP_STAT', 'SETUP_QUOTE', 'SETUP_STEPS', 'SETUP_PROBLEM',
            'SETUP_TIMELINE', 'SETUP_PYRAMID', 'SETUP_STAT_BURST',
            // Body
            'BODY_LIST', 'BODY_INSIGHT', 'BODY_COMPARE', 'BODY_CHECKLIST',
            'BODY_STORY', 'BODY_BEFORE_AFTER', 'BODY_HOTSPOT',
            // Landing
            'LANDING_SUMMARY', 'LANDING_PROOF', 'LANDING_OFFER',
            'LANDING_TRANSFORM', 'LANDING_TICKER',
            // CTA
            'CTA_BOLD', 'CTA_URGENCY',
        ]);
        if (AMBIENT_BROLL_ARCHETYPES.has(scene.archetype) && !scene.ambient_broll && !scene.url_screenshot && !scene.url_recording) {
            scene.ambient_broll = true;
            // Auto-generate b_roll_keywords from props if missing
            if (!scene.b_roll_keywords) {
                const p = scene.props || {};
                const vc = scene.visual_content || {};
                const textHint = vc.headline || p.headline || p.question || p.pull_quote || p.label || scene.voice_text || '';
                // Extract first 2-3 meaningful words as keyword
                const words = textHint.replace(/[^\w\sÀ-ỹ]/g, ' ').trim().split(/\s+/).filter(w => w.length > 2).slice(0, 3);
                scene.b_roll_keywords = words.length > 0 ? [words.join(' ')] : ['technology workspace'];
                console.log(`[Engine] 🎬 Auto-inject ambient_broll cho cảnh ${sceneNum} (${scene.archetype}): "${scene.b_roll_keywords[0]}"`);
            }
        }

        const needsBroll = BROLL_ARCHETYPES.has(scene.archetype)
            || (scene.archetype && scene.archetype.startsWith('BROLL_'))
            || scene.ambient_broll;

        // --- URL Capture (Hướng 1 + 3): Ưu tiên trước Pexels ---
        scene._url_capture_done = false;
        if (scene.url_recording) {
            const recordingPath = path.join(ticketAssetsDir, `scene_${sceneNum}_url_rec.mp4`);
            console.log(`[url_capture] 🎬 Cảnh ${sceneNum}: Ghi video từ URL...`);
            const ok = await captureUrlRecording(scene.url_recording, recordingPath, scene.duration_sec || 8);
            if (ok) {
                scene.bg_video = toTicketHttpUrl(recordingPath);
                scene.ambient_broll = true;
                scene._url_capture_done = true;
                console.log(`[url_capture] ✅ Cảnh ${sceneNum}: Đã gán bg_video từ url_recording.`);
            } else {
                console.warn(`[url_capture] ⚠️ Cảnh ${sceneNum}: url_recording thất bại, fallback sang Pexels.`);
            }
        } else if (scene.url_screenshot) {
            const screenshotPng = path.join(ticketAssetsDir, `scene_${sceneNum}_url_ss.png`);
            const screenshotMp4 = path.join(ticketAssetsDir, `scene_${sceneNum}_url_ss.mp4`);
            console.log(`[url_capture] 📸 Cảnh ${sceneNum}: Chụp màn hình URL...`);
            const ok = await captureUrlScreenshot(scene.url_screenshot, screenshotPng);
            if (ok) {
                const converted = convertImageToVideo(screenshotPng, screenshotMp4, scene.duration_sec || 5);
                if (converted) {
                    scene.bg_video = toTicketHttpUrl(screenshotMp4);
                    scene.ambient_broll = true;
                    scene._url_capture_done = true;
                    console.log(`[url_capture] ✅ Cảnh ${sceneNum}: Đã gán bg_video từ url_screenshot.`);
                }
            } else {
                console.warn(`[url_capture] ⚠️ Cảnh ${sceneNum}: url_screenshot thất bại, fallback sang Pexels.`);
                // Auto-generate fallback keywords from URL domain so Pexels fills the space
                if (!scene.b_roll_keywords) {
                    try {
                        const urlObj = new URL(scene.url_screenshot);
                        const domain = urlObj.hostname.replace(/^www\./, '').split('.')[0];
                        scene.b_roll_keywords = [domain + ' app interface'];
                        scene.ambient_broll = true;
                        console.log(`[url_capture] 🔁 Fallback keywords từ domain: "${scene.b_roll_keywords[0]}"`);
                    } catch (_) {
                        scene.b_roll_keywords = ['technology interface'];
                        scene.ambient_broll = true;
                    }
                }
            }
        }

        // Chạy song song: Pexels + ElevenLabs cùng lúc cho từng cảnh
        const [brollResult, voiceResult] = await Promise.all([
            // --- Pexels B-roll ---
            (async () => {
                if (scene._url_capture_done) return null; // URL capture đã xử lý — bỏ qua Pexels
                if (!((scene.bg_video || scene.b_roll_keywords) && needsBroll)) return null;
                let query = "";
                if (scene.b_roll_keywords) {
                    query = Array.isArray(scene.b_roll_keywords) ? scene.b_roll_keywords[0] : Object.values(scene.b_roll_keywords)[0];
                }
                if (scene.video_source_override === "pexels") {
                    return await getPexelsBroll(query, sceneNum, ticketAssetsDir);
                } else {
                    const local = await getLocalBroll(query, sceneNum);
                    if (local) return local;
                    return await getPexelsBroll(query, sceneNum, ticketAssetsDir);
                }
            })(),
            // --- ElevenLabs Voice (semaphore: tối đa ELEVENLABS_CONCURRENCY concurrent) ---
            (async () => {
                // Fallback: nếu voice_text trống/quá ngắn, lấy từ props hoặc headline
                if (!scene.voice_text || scene.voice_text.length <= 5) {
                    const p = scene.props || {};
                    const fallback = p.voice_text || p.headline || p.question || p.quote ||
                        p.pull_quote || (Array.isArray(p.lines) && p.lines[0]?.text) || '';
                    if (fallback && fallback.length > 5) {
                        scene.voice_text = fallback.replace(/\*/g, '').slice(0, 200);
                        console.log(`[Engine] 🔧 voice_text fallback cho cảnh ${sceneNum}: "${scene.voice_text.slice(0,40)}..."`);
                    } else {
                        return null;
                    }
                }
                // Chờ slot trống trong semaphore trước khi gọi API
                await _elAcquire();
                try {
                    return await getElevenLabsVoice(scene.voice_text, sceneNum, ticketAssetsDir);
                } finally {
                    _elRelease();
                }
            })(),
        ]);

        // Áp kết quả B-roll (bỏ qua nếu URL capture đã set bg_video)
        if (!scene._url_capture_done && brollResult) {
            scene.bg_video = brollResult;
        } else if (!scene._url_capture_done && needsBroll && !brollResult) {
            // Video không tìm được — thử Ken Burns image fallback cho Hook archetypes
            // Thứ tự: local image → Pexels image
            const HOOK_ARCHETYPES = new Set(['CINEMATIC_HOOK', 'HOOK_BROLL_TEXT']);
            if (HOOK_ARCHETYPES.has(scene.archetype)) {
                // Truyền query để keyword-match celebrity_image trước personal_image
                const imgQuery = Array.isArray(scene.b_roll_keywords)
                    ? scene.b_roll_keywords[0]
                    : (scene.b_roll_keywords || scene.voice_text?.split(' ').slice(0, 4).join(' ') || '');
                const localImg = await getLocalImage(sceneNum, imgQuery);
                if (localImg) {
                    if (!scene.props) scene.props = {};
                    scene.props.image_src = localImg;
                    console.log(`[Engine] 🖼️ Ken Burns local image cho Cảnh ${sceneNum} (${scene.archetype})`);
                } else {
                    const query = Array.isArray(scene.b_roll_keywords)
                        ? scene.b_roll_keywords[0]
                        : (scene.b_roll_keywords || scene.voice_text?.split(' ').slice(0, 3).join(' ') || 'nature landscape');
                    const pexelsImg = await getPexelsImage(query, sceneNum, ticketAssetsDir);
                    if (pexelsImg) {
                        if (!scene.props) scene.props = {};
                        scene.props.image_src = pexelsImg;
                        console.log(`[Engine] 🖼️ Ken Burns Pexels image cho Cảnh ${sceneNum} (${scene.archetype})`);
                    }
                }
            }
        }

        // Áp kết quả Voice
        if (voiceResult) {
            scene.voice_audio = voiceResult.audioPath;
            scene.karaoke_file = voiceResult.karaokePath;

            try {
                const absoluteVoicePath = voiceResult.absoluteAudioPath;
                const remotionBin = path.join(remotionEngineDir, 'node_modules/.bin/remotion');
                const durationCmd = `"${remotionBin}" ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${absoluteVoicePath}"`;
                const duration = parseFloat(execSync(durationCmd).toString().trim());
                scene.duration_sec = Number((duration + 0.1).toFixed(2));
            } catch (dErr) {
                console.warn("⚠️ Không thể tính độ dài âm thanh, dùng mặc định 15s:", dErr.message);
                scene.duration_sec = 15;
            }
        } else if (scene.voice_text && scene.voice_text.length > 5) {
            console.warn(`[Engine] ⚠️ ElevenLabs API Lỗi! Cảnh ${sceneNum} sẽ KHÔNG có tiếng MC.`);
            scene.duration_sec = 10;
        } else {
            console.log(`[Engine] 💡 Chế độ Minimalist (Không có Voice) — Cảnh ${sceneNum}.`);
            if (!scene.duration_sec) {
                // Archetype-specific duration hints (no voice fallback)
                const archetypeDurationHints = {
                    'HOOK_KINETIC': 3, 'HOOK_BROLL_TEXT': 4, 'HOOK_QUESTION': 5, 'HOOK_CONTRAST': 5,
                    'SETUP_STAT': 6, 'SETUP_QUOTE': 6, 'SETUP_STEPS': 7, 'SETUP_PROBLEM': 5,
                    'BODY_LIST': 7, 'BODY_INSIGHT': 5, 'BODY_COMPARE': 7, 'BODY_STORY': 6,
                    'LANDING_SUMMARY': 5, 'LANDING_PROOF': 7, 'LANDING_OFFER': 7,
                    'CTA_BOLD': 5,
                };
                const rhythmMap = { fast: 3, medium: 5, slow: 7 };
                scene.duration_sec = archetypeDurationHints[scene.archetype] || rhythmMap[scene.scene_rhythm] || 5;
            }
        }

        // HeyGen (hiếm dùng — chạy riêng nếu cần)
        if (scene.require_pip) {
            scene.pip_video = await getHeyGenAvatar(scene.voice_text, sceneNum, ticketAssetsDir);
        }
    };

    await Promise.all(timeline.map((scene, index) => processScene(scene, index)));

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
        // Nếu scene có archetype (từ video_director_specialist) → archetype_director
        if (!scene.template_core) {
            if (scene.archetype) {
                scene.template_core = 'archetype_director';
            } else {
                scene.template_core = 'single_scene_dark'; // Mặc định dùng Single Scene Template
            }
        }

        // --- Normalize keyword từ Director schema sang pipeline field ---
        // Director có thể xuất props.keyword (schema V1), chuẩn hóa sang b_roll_keywords
        if (!scene.b_roll_keywords && scene.props?.keyword) {
            scene.b_roll_keywords = [scene.props.keyword];
        }

        // --- Normalize data format cho ARCH_DATA ---
        // Director có thể xuất props.chart_data: { label: value } (object)
        // MetricChart.tsx kỳ vọng props.data: [{ label, value }] (array)
        if (scene.archetype === 'ARCH_DATA' && scene.props) {
            if (scene.props.chart_data && !Array.isArray(scene.props.data)) {
                scene.props.data = Object.entries(scene.props.chart_data).map(([label, value]) => ({
                    label,
                    value: Number(value)
                }));
                delete scene.props.chart_data;
            }
        }

        // --- Normalize code_lines → lines cho ARCH_TERMINAL ---
        // Director xuất props.code_lines, CodeTerminal.tsx đọc props.lines
        if (scene.archetype === 'ARCH_TERMINAL' && scene.props) {
            if (scene.props.code_lines && !scene.props.lines) {
                scene.props.lines = scene.props.code_lines;
                delete scene.props.code_lines;
            }
        }

        // --- Sanitize + normalize props cho Foundation archetypes (Phase 1–4) ---
        if (scene.props && typeof scene.props === 'object') {
            const p = scene.props;

            // Sanitize tất cả string fields trong props
            for (const key of Object.keys(p)) {
                if (typeof p[key] === 'string') p[key] = sanitizeText(p[key]);
            }

            // HOOK_KINETIC / HOOK_BROLL_TEXT: lines[].text sanitize
            if ((scene.archetype === 'HOOK_KINETIC' || scene.archetype === 'HOOK_BROLL_TEXT') && Array.isArray(p.lines)) {
                p.lines = p.lines.map(l => ({ ...l, text: sanitizeText(l.text) }));
            }

            // HOOK_QUESTION: question field
            if (scene.archetype === 'HOOK_QUESTION') {
                if (p.question) p.question = sanitizeText(p.question);
                if (p.sub) p.sub = sanitizeText(p.sub);
            }

            // HOOK_CONTRAST: left_text / right_text
            if (scene.archetype === 'HOOK_CONTRAST') {
                if (p.left_text) p.left_text = sanitizeText(p.left_text);
                if (p.right_text) p.right_text = sanitizeText(p.right_text);
            }

            // SETUP_STAT: label / context
            if (scene.archetype === 'SETUP_STAT') {
                if (p.label) p.label = sanitizeText(p.label);
                if (p.context) p.context = sanitizeText(p.context);
                // Ensure stat is a number
                if (p.stat !== undefined) p.stat = Number(p.stat) || 0;
            }

            // SETUP_QUOTE: quote / author / role
            if (scene.archetype === 'SETUP_QUOTE') {
                if (p.quote) p.quote = sanitizeText(p.quote);
                if (p.author) p.author = sanitizeText(p.author);
                if (p.role) p.role = sanitizeText(p.role);
            }

            // SETUP_STEPS: steps[].title + sub
            if (scene.archetype === 'SETUP_STEPS' && Array.isArray(p.steps)) {
                p.steps = p.steps.map(s => ({
                    ...s,
                    title: sanitizeText(s.title),
                    sub: s.sub ? sanitizeText(s.sub) : s.sub,
                }));
            }

            // SETUP_PROBLEM: pains[] strings
            if (scene.archetype === 'SETUP_PROBLEM' && Array.isArray(p.pains)) {
                p.pains = p.pains.map(sanitizeText);
            }

            // BODY_LIST: items[].text + sub (all styles incl. icon_right)
            if (scene.archetype === 'BODY_LIST' && Array.isArray(p.items)) {
                p.items = p.items.map(item => ({
                    ...item,
                    text: sanitizeText(item.text),
                    sub: item.sub ? sanitizeText(item.sub) : item.sub,
                }));
            }

            // BODY_COMPARE: rows[].left + right (table style)
            if (scene.archetype === 'BODY_COMPARE' && Array.isArray(p.rows)) {
                p.rows = p.rows.map(r => ({
                    left:  sanitizeText(r.left),
                    right: sanitizeText(r.right),
                }));
            }

            // BODY_COMPARE style:battery — batteries[].label + ensure value is number
            if (scene.archetype === 'BODY_COMPARE' && Array.isArray(p.batteries)) {
                p.batteries = p.batteries.map(b => ({
                    ...b,
                    label: sanitizeText(b.label),
                    value: Math.min(100, Math.max(0, Number(b.value) || 0)),
                }));
            }

            // NEON_CHART mode:donut — segments[].label + value
            if (scene.archetype === 'NEON_CHART' && Array.isArray(p.segments)) {
                p.segments = p.segments.map(s => ({
                    ...s,
                    label: sanitizeText(s.label),
                    value: Math.max(0, Number(s.value) || 0),
                }));
            }

            // BODY_STORY: pull_quote / body / chapter
            if (scene.archetype === 'BODY_STORY') {
                if (p.pull_quote) p.pull_quote = sanitizeText(p.pull_quote);
                if (p.body) p.body = sanitizeText(p.body);
                if (p.chapter) p.chapter = sanitizeText(p.chapter);
            }

            // BODY_INSIGHT: fallback headline from voice_text when AI omits props
            if (scene.archetype === 'BODY_INSIGHT') {
                if (!p.headline) {
                    const vc = scene.visual_content || {};
                    const raw = scene.voice_text || vc.headline || vc.quote || '';
                    if (raw) {
                        // Use the first sentence as the headline pull-quote
                        const first = raw.split(/[.!?]\s+/)[0] || raw;
                        p.headline = sanitizeText(first.slice(0, 120));
                        console.log(`[Engine] 🔧 BODY_INSIGHT headline fallback: "${p.headline.slice(0,40)}..."`);
                    }
                }
                if (p.headline) p.headline = sanitizeText(p.headline);
            }

            // LANDING_SUMMARY: fallback headline/sub from voice_text when AI omits props
            if (scene.archetype === 'LANDING_SUMMARY') {
                if (!p.headline) {
                    const vc = scene.visual_content || {};
                    const raw = scene.voice_text || vc.headline || vc.quote || '';
                    if (raw) {
                        // Split at sentence boundary: first part = headline, rest = sub
                        const parts = raw.split(/[.!?]\s+/);
                        p.headline = sanitizeText(parts[0] || raw);
                        if (!p.sub && parts[1]) p.sub = sanitizeText(parts.slice(1).join('. ').trim());
                    }
                }
                if (p.headline) p.headline = sanitizeText(p.headline);
                if (p.sub) p.sub = sanitizeText(p.sub);
            }

            // LANDING_PROOF: testimonials[].text
            if (scene.archetype === 'LANDING_PROOF' && Array.isArray(p.testimonials)) {
                p.testimonials = p.testimonials.map(t => ({
                    ...t,
                    text: sanitizeText(t.text),
                    name: sanitizeText(t.name),
                }));
            }

            // LANDING_OFFER: benefits[] strings
            if (scene.archetype === 'LANDING_OFFER' && Array.isArray(p.benefits)) {
                p.benefits = p.benefits.map(sanitizeText);
            }

            // CTA_BOLD / CtaWave: Action Card schema normalization
            // New props: variant, action, keyword, reason, brand_handle
            if (scene.archetype === 'CTA_BOLD') {
                // Sanitize text fields
                if (p.action)       p.action       = sanitizeText(p.action);
                if (p.keyword)      p.keyword      = sanitizeText(p.keyword);
                if (p.reason)       p.reason       = sanitizeText(p.reason);
                if (p.brand_handle) p.brand_handle = sanitizeText(p.brand_handle);
                // Validate variant
                if (p.variant && !['comment', 'share'].includes(p.variant)) {
                    p.variant = 'comment';
                }
                // Warn if neither new props nor old lines provided
                if (!p.action && !p.keyword && !p.variant) {
                    console.warn(`[Engine] ⚠️ CTA_BOLD thiếu props — cần ít nhất variant + action + keyword. Dùng preset mặc định.`);
                }
                // Clean up legacy props.lines if AI accidentally sends them
                delete p.lines;
                delete p.cta_sub;
                delete p.grid_color;
                delete p.bar_color;
            }

            // BROLL_LOWER_THIRD: headline / subtext / tag
            if (scene.archetype === 'BROLL_LOWER_THIRD') {
                if (p.headline) p.headline = sanitizeText(p.headline);
                if (p.subtext)  p.subtext  = sanitizeText(p.subtext);
                if (p.tag)      p.tag      = sanitizeText(p.tag);
            }
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
        if (isWin || isMac) {
            // --gl=angle ép dịch phần cứng sang DirectX (Windows) hoặc Metal (Mac).
            // Xuống --concurrency=1 để chống 100% OOM và tăng độ ổn định.
            hwFlag = '--gl=angle --concurrency=1';
        }

        console.log(`[Remotion Hook] Rendering frames to ${outputPath}...`);

        // Build & Render Video với bộ cờ tối ưu siêu tốc độ:
        // Đính kèm puppeteer-timeout=120000 để Cứu máy cùi bắp hay bị lỗi Timeout do Chrome Load lâu.
        const command = `npx remotion render src/index.ts MainComposition "${outputPath}" --props="${inputPropsPath}" --codec=${codec} --image-format=jpeg --jpeg-quality=80 --crf=28 --puppeteer-timeout=120000 --overwrite ${hwFlag}`;

        try {
            // Dùng execAsync (non-blocking) để micro-server vẫn xử lý HTTP request trong lúc Remotion render
            await execAsync(command, { cwd: remotionEngineDir, env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=8192" } });
        } finally {
            // CLEANUPS: Zero-Garbage Compliance
            if (fs.existsSync(inputPropsPath)) fs.unlinkSync(inputPropsPath);
            mediaServerApp.close();

            // ── Dọn toàn bộ thư mục assets/ sau khi render xong ────────────
            // Mọi file (voice, karaoke, broll, url_ss, url_rec, bg_img, ...) đã được
            // bake vào media.mp4 — không cần giữ lại bất kỳ file nào trong assets/
            try {
                if (fs.existsSync(ticketAssetsDir)) {
                    fs.rmSync(ticketAssetsDir, { recursive: true, force: true });
                    console.log(`🧹 [Cleanup] Đã xoá toàn bộ thư mục assets/`);
                }
            } catch (cleanupErr) {
                // Không throw — cleanup lỗi không được làm hỏng kết quả render
                console.warn(`⚠️ [Cleanup] Dọn assets/ thất bại (không nghiêm trọng):`, cleanupErr.message);
            }
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

        // ── SCAFFOLD MODE: node reels_engine.js --scaffold --id <ticketId> [--channel <ch>]
        // Gọi TRƯỚC khi AI ghi media_payload.json để đảm bảo folder tồn tại trên mọi OS
        if (args.includes('--scaffold')) {
            const idIndex = args.indexOf('--id');
            const chIndex = args.indexOf('--channel');
            const ticketId = idIndex !== -1 ? args[idIndex + 1] : null;
            const channel = chIndex !== -1 ? args[chIndex + 1] : 'default';
            if (!ticketId) {
                console.error('[Scaffold] Thiếu --id <ticketId>');
                process.exit(1);
            }
            const result = scaffoldReelsDir(ticketId, channel);
            // In đường dẫn ra stdout để AI đọc và dùng
            console.log(JSON.stringify({ ok: true, ...result }));
            process.exit(0);
        }

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
            let timelineData = Array.isArray(payload) ? payload : (payload.slides ||
                payload.script_segments ||
                (payload.visual_content && (payload.visual_content.slides || payload.visual_content.script_segments)));

            // Nếu không có mảng các cảnh, và đây là 1 cảnh đơn với voice_text, gói nó lại thành 1 phần tử
            if (!timelineData && payload.template_core) {
                timelineData = [payload];
            }
            let formattedData = timelineData;

            // ── ARCHETYPE REMAP v2.0 ──────────────────────────────────────────────────
            // Safety net: nếu AI Director dùng tên archetype cũ đã bị xóa,
            // tự động convert tên + normalize props cho component mới.
            // Thiếu prop normalization → component nhận {} → render SVG nặng với default → OOM crash.
            const ARCHETYPE_REMAP = {
                'BROLL_HOOK':       'CINEMATIC_HOOK',
                'BROLL_STAT':       'NEON_CHART',
                'ARCH_BROLL':       'BROLL_QUOTE',
                'KINETIC_WORD':     'WORD_SCROLL',
                'KINETIC_REVEAL':   'WORD_SCROLL',
                'KINETIC_COUNT':    'NEON_CHART',
                'ARCH_CARDS':       'STICKY_NOTE',
                'ARCH_DATA':        'NEON_CHART',
                'DATA_PROGRESS':    'NEON_CHART',
                'ARCH_TERMINAL':    'PHONE_MOCKUP',
                'ARCH_SPLIT':       'DUAL_PATH',
            };

            // Props normalizer: convert old props schema → new component's expected schema
            function normalizePropsForArchetype(oldArchetype, oldProps) {
                const p = oldProps || {};
                const stripStars = s => (s || '').replace(/\*/g, '');
                switch (oldArchetype) {
                    case 'BROLL_HOOK':
                        // BROLL_HOOK: props.headline → CINEMATIC_HOOK: props.lines[]
                        return {
                            lines: p.headline ? [
                                { text: stripStars(p.headline), size: 'large', color: 'white', style: 'normal' }
                            ] : [],
                            show_swoosh: false,
                            position: 'bottom',
                        };
                    case 'ARCH_SPLIT':
                        // ARCH_SPLIT: props.left/right → DUAL_PATH: props.path_a/path_b
                        return {
                            title: p.left?.label && p.right?.label ? `${p.left.label} vs ${p.right.label}` : 'Lựa Chọn',
                            path_a: { label_start: p.left?.label || '', label_end: stripStars(p.left?.text || ''), color: '#FF4444' },
                            path_b: { label_start: p.right?.label || '', label_end: stripStars(p.right?.text || ''), color: '#EEEEEE' },
                            show_figure: true,
                        };
                    case 'KINETIC_COUNT':
                        // KINETIC_COUNT: props.from/to/label → NEON_CHART: props.lines[]
                        return {
                            title: stripStars(p.label || 'GROWTH'),
                            mode: 'single',
                            lines: [{ color: '#FF3333', points: [0, 1, 2, 3, 5, 8, 12, p.to || 30] }],
                            show_grid: true,
                            show_reflection: false,
                        };
                    case 'ARCH_DATA':
                    case 'BROLL_STAT':
                    case 'DATA_PROGRESS':
                        // → NEON_CHART dual
                        const dataItems = p.data || p.items || [];
                        return {
                            title: stripStars(p.title || ''),
                            mode: dataItems.length >= 2 ? 'dual' : 'single',
                            lines: dataItems.slice(0, 2).map((item, i) => ({
                                label: item.label || '',
                                color: i === 0 ? '#22C55E' : '#EF4444',
                                points: [0, 1, 2, 3, 5, 8, Math.max(item.value || 10, 1)],
                            })),
                            show_grid: true,
                            show_reflection: false,
                        };
                    case 'KINETIC_WORD':
                    case 'KINETIC_REVEAL':
                        // → WORD_SCROLL: split text/lines into words[]
                        const rawText = stripStars(p.text || '');
                        const words = rawText.split(/[\s\n]+/).filter(w => w.length > 0).slice(0, 7);
                        return {
                            words: words.length > 0 ? words : ['Bắt đầu', 'ngay', 'hôm nay'],
                            focus_index: Math.floor(words.length / 2),
                            indicator: 'arrow',
                        };
                    case 'ARCH_CARDS':
                        // → STICKY_NOTE
                        return {
                            title: stripStars(p.headline || ''),
                            items: (p.items || []).map(item => stripStars(item.title || item.text || String(item))).slice(0, 7),
                            style: p.style === 'numbered' ? 'numbered' : 'bullet',
                            tilt_deg: -3,
                        };
                    case 'ARCH_TERMINAL':
                        // → PHONE_MOCKUP
                        return {
                            headline: stripStars(p.title || ''),
                            items: (p.lines || []).slice(0, 4).map((line, i) => ({
                                color: ['#4A90D9','#F5A623','#E74C3C','#2ECC71'][i % 4],
                                text: stripStars(String(line)).slice(0, 40),
                            })),
                        };
                    default:
                        return p; // ARCH_BROLL → BROLL_QUOTE keeps props as-is
                }
            }

            // Tương thích mảng script_segments — phân biệt format mới (archetype) và cũ (legacy)
            const activeSegments = payload.script_segments || (payload.visual_content && payload.visual_content.script_segments);
            if (activeSegments) {
                formattedData = activeSegments.map(seg => {
                    // FORMAT MỚI: scene có archetype field → remap tên + normalize props
                    if (seg.archetype) {
                        const remapped = ARCHETYPE_REMAP[seg.archetype];
                        if (remapped) {
                            console.log(`🔄 [Remap] Archetype "${seg.archetype}" → "${remapped}" (props normalized)`);
                            const normalizedProps = normalizePropsForArchetype(seg.archetype, seg.props);
                            seg = { ...seg, archetype: remapped, props: normalizedProps };
                        }
                        return {
                            ...seg,
                            voice_text: seg.voice_text || seg.text || '',
                            duration_sec: seg.duration_sec || seg.duration || 6,
                            template_core: 'archetype_director',
                        };
                    }
                    // FORMAT CŨ: legacy single_scene_dark
                    return {
                        voice_text: seg.text || seg.voice_text,
                        duration_sec: seg.duration || seg.duration_sec,
                        b_roll_keywords: seg.b_roll_keywords || (payload.visual_content?.keyword ? [payload.visual_content.keyword] : []),
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
                    };
                });
            }

            // FETCH AVATAR/CELEBRITY IMAGE IF KEYWORD EXIST
            let hookImageBase64 = '';
            if (payload.keyword || (payload.visual_content && payload.visual_content.keyword)) {
                const searchKeyword = payload.keyword || payload.visual_content.keyword;
                try {
                    console.log(`[Reels Engine] Đang móc Ảnh Avatar qua Keyword: ${searchKeyword}`);
                    const bgImageResult = await getAssetForImageEngine(searchKeyword);
                    if (bgImageResult && (bgImageResult.startsWith('/') || /^[A-Za-z]:[\\\/]/.test(bgImageResult))) {
                        // Local absolute path → convert to base64 (cross-platform, avoids file:// issues)
                        const ext = path.extname(bgImageResult).substring(1) || 'jpg';
                        const data = fs.readFileSync(bgImageResult, 'base64');
                        hookImageBase64 = `data:image/${ext};base64,${data}`;
                    } else if (bgImageResult && bgImageResult.startsWith('http')) {
                        hookImageBase64 = bgImageResult;
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

            // assets/ đã được dọn bởi generateReels() finally block

            if (outputPath && ticketIndex > -1) {
                // Cập nhật trạng thái ticket trong pipeline
                db[ticketIndex].status = 'completed';
                db[ticketIndex].deliverable = { type: 'reels', path: outputPath, rendered_at: new Date().toISOString() };
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
                console.log(`✅ [Pipeline] Ticket "${ticketId}" đã được đánh dấu completed.`);
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

/**
 * 📁 scaffoldReelsDir — Tạo cấu trúc thư mục + placeholder files TRƯỚC khi AI ghi dữ liệu
 * Gọi ngay khi ticket được tạo để tránh lỗi "file not found" trên Windows
 *
 * @param {string} ticketId   - ID của ticket (vd: "ticket_chatgpt_tips")
 * @param {string} channel    - Kênh đăng (vd: "Facebook", "TikTok", "content")
 * @param {string} [baseDate] - Ngày YYYY-MM-DD (mặc định: hôm nay)
 * @returns {{ reelsDir, assetsDir, payloadPath, captionPath }} — đường dẫn đã tạo
 */
function scaffoldReelsDir(ticketId, channel = 'default', baseDate = null) {
    const today = baseDate || new Date().toISOString().split('T')[0];
    const reelsDir = path.join(__dirname, '..', 'media_output', today, channel, ticketId, 'reels');
    const assetsDir = path.join(reelsDir, 'assets');

    // Tạo toàn bộ cây thư mục (mkdirSync recursive không lỗi nếu đã tồn tại)
    fs.mkdirSync(assetsDir, { recursive: true });

    // Tạo placeholder media_payload.json nếu chưa có (để AI có thể ghi đè)
    const payloadPath = path.join(reelsDir, 'media_payload.json');
    if (!fs.existsSync(payloadPath)) {
        fs.writeFileSync(payloadPath, JSON.stringify({ _scaffold: true, ticket_id: ticketId }, null, 2), 'utf8');
    }

    // Tạo placeholder caption.txt
    const captionPath = path.join(reelsDir, 'caption.txt');
    if (!fs.existsSync(captionPath)) {
        fs.writeFileSync(captionPath, '', 'utf8');
    }

    console.log(`📁 [Scaffold] Đã dựng cấu trúc thư mục: ${reelsDir}`);
    return { reelsDir, assetsDir, payloadPath, captionPath };
}

module.exports = { generateReels, scaffoldReelsDir };
