const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Môi trường API
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY;
const HEYGEN_KEY = process.env.HEYGEN_API_KEY;

// Thư mục lưu trữ nguyên liệu
const ASSET_DIR = path.join(__dirname, '../reels_engine/public/assets');

if (!fs.existsSync(ASSET_DIR)) {
    fs.mkdirSync(ASSET_DIR, { recursive: true });
}

/**
 * 📥 Hàm Tải File Chung
 */
async function downloadFile(fileUrl, outputPath) {
    const writer = fs.createWriteStream(outputPath);
    const response = await axios({ url: fileUrl, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

/**
 * 🎥 1. PEXELS API: Tìm và Tải Video B-Roll
 * @param {string} query - Từ khóa (VD: "dark office")
 * @param {number} sceneIndex - Để lưu tên file (VD: scene_1_bg.mp4)
 */
async function getPexelsBroll(query, sceneIndex) {
    if (!PEXELS_KEY) return console.log(`[Pexels] Thiếu API KEY, giả lập bỏ qua tải B-Roll cho Cảnh ${sceneIndex}`);

    console.log(`[Pexels] Dò tìm B-Roll: "${query}"...`);
    try {
        const res = await axios.get(`https://api.pexels.com/videos/search?query=${query}&orientation=portrait&size=large`, {
            headers: { Authorization: PEXELS_KEY }
        });

        if (res.data.videos.length > 0) {
            // Random trong Top 3 để không bị trùng lặp
            const randomVid = res.data.videos[Math.floor(Math.random() * Math.min(3, res.data.videos.length))];

            // Tìm file HD MP4
            const hdFile = randomVid.video_files.find(f => f.quality === 'hd' && f.file_type === 'video/mp4') || randomVid.video_files[0];

            const dest = path.join(ASSET_DIR, `scene_${sceneIndex}_bg.mp4`);
            await downloadFile(hdFile.link, dest);
            console.log(`[Pexels] Đã tải xong nền cho Cảnh ${sceneIndex}`);
            return `assets/scene_${sceneIndex}_bg.mp4`; // Trả về Relative path cho Remotion
        }
    } catch (err) {
        console.error(`[Pexels Lỗi] Cảnh ${sceneIndex}:`, err.message);
    }
    return null;
}

/**
 * 📂 1.5. LOCAL VIDEO: Trích xuất nền Video Cá nhân
 */
async function getLocalBroll(query, sceneIndex) {
    const dir = path.join(__dirname, '../../media-input/background-video');
    if (!fs.existsSync(dir)) {
        console.log(`[Local Video] Thư mục media-input/background-video chưa tồn tại.`);
        return null;
    }
    
    // Lấy toàn bộ file mp4/webm (Cấm .mov vì Chromium không hỗ trợ HEVC/H.265)
    let files = fs.readdirSync(dir);
    const validFiles = files.filter(f => f.match(/\.(mp4|webm)$/i));
    const movFiles = files.filter(f => f.match(/\.mov$/i));
    
    if (movFiles.length > 0 && validFiles.length === 0) {
        console.log(`[Cảnh báo Local Video] Đã tìm thấy file .MOV nhưng Trình duyệt Đúc Phim không hỗ trợ định dạng này của Apple. Vui lòng chuyển sang .MP4!`);
    }

    if (validFiles.length === 0) {
        console.log(`[Local Video] Thư mục trồng (hoặc chỉ có file ko hợp lệ)! Fallback sang Pexels.`);
        return null; 
    }

    let matches = validFiles;
    if (query) {
        // Khớp mờ theo Tên File (Tìm kiếm từ khóa trong tên file)
        const keywordMatches = validFiles.filter(f => f.toLowerCase().includes(query.toLowerCase()));
        if (keywordMatches.length > 0) {
            matches = keywordMatches;
        } else {
            console.log(`[Local Video] Không tìm thấy khớp cho "${query}", chọn ngẫu nhiên một file bất kỳ để tránh Render lỗi.`);
            matches = validFiles;
        }
    }
    
    const randomFile = matches[Math.floor(Math.random() * matches.length)];
    const relativePath = `media-input/background-video/${randomFile}`;
    console.log(`\n📂 [Local Media Found] 🎯 Đã bốc video từ kho cá nhân: "${randomFile}"`);
    console.log(`🔗 [Path] ${relativePath}`);
    
    // v7.6: Không copy nữa, trả về đường dẫn tương đối thông qua Symlink media-input trong public
    return relativePath;
}

/**
 * 🎙️ 2. ELEVENLABS API: Ép Giọng & Timestamps Karaoke
 */
async function getElevenLabsVoice(text, sceneIndex, defaultVoiceId = "pNInz6obbf5AWCGqeXbU") {
    // Ưu tiên dùng Voice ID được chỉ định trong .env, nếu không có mới dùng default
    const voiceId = process.env.ELEVENLABS_VOICE_ID || defaultVoiceId;

    if (!ELEVENLABS_KEY || !text) return console.log(`[ElevenLabs] Thiếu KEY/Text tại Cảnh ${sceneIndex}`);

    console.log(`[ElevenLabs] Dùng VoiceID "${voiceId}" chuyển Text thành Voice Cảnh ${sceneIndex}...`);
    try {
        const destAudio = path.join(ASSET_DIR, `scene_${sceneIndex}_voice.mp3`);

        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
            { text, model_id: "eleven_turbo_v2_5" },
            { headers: { 'xi-api-key': ELEVENLABS_KEY } }
        );

        // API này (với with-timestamps) sẽ trả về dạng JSON có base64 audio
        const audioBuffer = Buffer.from(response.data.audio_base64, 'base64');
        fs.writeFileSync(destAudio, audioBuffer);

        // Trích xuất Timestamps của từng Kí Tự -> Mảng Chữ (Words)
        const alignment = response.data.alignment;
        const destAlign = path.join(ASSET_DIR, `scene_${sceneIndex}_karaoke.json`);
        fs.writeFileSync(destAlign, JSON.stringify(alignment, null, 2));

        console.log(`[ElevenLabs] Đã bóc băng Karaoke cho Cảnh ${sceneIndex}`);
        return {
            audioPath: `assets/scene_${sceneIndex}_voice.mp3`,
            karaokePath: `assets/scene_${sceneIndex}_karaoke.json`
        };
    } catch (err) {
        console.error(`[ElevenLabs Lỗi]`, err.response?.data || err.message);
    }
    return null;
}

/**
 * 🙎🏻‍♂️ 3. HEYGEN API: Tạo Avatar PiP Đọc Thoại
 */
async function getHeyGenAvatar(text, sceneIndex) {
    if (!HEYGEN_KEY || !text) return console.log(`[HeyGen] Thiếu KEY tại Cảnh ${sceneIndex}`);

    console.log(`[HeyGen] Đúc Avatar MC cho Cảnh ${sceneIndex}... (Sẽ mất thời gian chờ)`);
    try {
        // Bắn Lệnh Tạo Video
        const genRes = await axios.post(
            'https://api.heygen.com/v2/video/generate',
            {
                video_inputs: [{
                    character: {
                        type: "avatar",
                        avatar_id: "default_avatar_id", // Đổi ID theo cấu hình của User
                        avatar_style: "normal"
                    },
                    voice: {
                        type: "text",
                        input_text: text,
                        voice_id: "default_elevenlabs_voice_map"
                    },
                    background: { type: "color", value: "#00FF00" } // Phông xanh lục để lọc màu bên Remotion
                }]
            },
            { headers: { "X-Api-Key": HEYGEN_KEY, "Content-Type": "application/json" } }
        );

        const videoId = genRes.data.data.video_id;

        // Cơ chế Polling (Hỏi thăm liên tục 10s/lần)
        let videoUrl = null;
        while (!videoUrl) {
            await new Promise(r => setTimeout(r, 10000));
            const statusRes = await axios.get(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
                headers: { "X-Api-Key": HEYGEN_KEY }
            });
            const status = statusRes.data.data.status;
            if (status === "completed") {
                videoUrl = statusRes.data.data.video_url;
            } else if (status === "failed") {
                throw new Error("Render Failed in HeyGen.");
            } else {
                console.log(`[HeyGen] Cảnh ${sceneIndex} đang Render... (${status})`);
            }
        }

        const destVid = path.join(ASSET_DIR, `scene_${sceneIndex}_pip.mp4`);
        await downloadFile(videoUrl, destVid);

        console.log(`[HeyGen] Thu hoạch khoai xong! Nền xanh Cảnh ${sceneIndex} đã tải về.`);
        return `assets/scene_${sceneIndex}_pip.mp4`;

    } catch (err) {
        console.error(`[HeyGen Lỗi]`, err.response?.data || err.message);
    }
    return null;
}

async function getLocalMusic(destDir) {
    const musicDir = path.join(__dirname, '../../media-input/background-music');
    if (!fs.existsSync(musicDir)) return null;

    const files = fs.readdirSync(musicDir).filter(f => !f.startsWith('.') && (f.toLowerCase().endsWith('.mp3') || f.toLowerCase().endsWith('.wav') || f.toLowerCase().endsWith('.m4a')));
    if (files.length === 0) return null;

    // Lựa chọn ngẫu nhiên
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const sourcePath = path.join(musicDir, randomFile);
    
    // Tên an toàn
    const safeName = randomFile.replace(/[^a-zA-Z0-9.-]/g, '_');
    const destPath = path.join(destDir, safeName);
    
    fs.copyFileSync(sourcePath, destPath);
    console.log(`[Music] Đã nạp nhạc nền Local: ${randomFile}`);
    return `music/${safeName}`; // Relative path
}

module.exports = {
    getPexelsBroll,
    getLocalBroll,
    getElevenLabsVoice,
    getHeyGenAvatar,
    getLocalMusic
};
