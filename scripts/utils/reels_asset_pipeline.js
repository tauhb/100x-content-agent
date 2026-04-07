const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Môi trường API
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY;
const HEYGEN_KEY = process.env.HEYGEN_API_KEY;
// Base URL cho Micro-Server Express
const MICRO_SERVER_URL = "http://localhost:9876";

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
 */
async function getPexelsBroll(query, sceneIndex, destDir) {
    if (!PEXELS_KEY) return console.log(`[Pexels] Thiếu API KEY, giả lập bỏ qua tải B-Roll cho Cảnh ${sceneIndex}`);

    console.log(`[Pexels] Dò tìm B-Roll: "${query}"...`);
    try {
        const res = await axios.get(`https://api.pexels.com/videos/search?query=${query}&orientation=portrait&size=large`, {
            headers: { Authorization: PEXELS_KEY }
        });

        if (res.data.videos.length > 0) {
            // Random trong Top 3 để không bị trùng lặp
            const randomVid = res.data.videos[Math.floor(Math.random() * Math.min(3, res.data.videos.length))];

            // Lọc file gốc 720p (Cấm 4K siêu nặng)
            const safeFiles = randomVid.video_files
                .filter(f => f.file_type === 'video/mp4' && f.height <= 1080)
                .sort((a, b) => Math.abs(a.height - 720) - Math.abs(b.height - 720));
            const hdFile = safeFiles.length > 0 ? safeFiles[0] : (randomVid.video_files.find(f => f.quality === 'hd') || randomVid.video_files[0]);

            const dest = path.join(destDir, `scene_${sceneIndex}_bg.mp4`);
            await downloadFile(hdFile.link, dest);
            console.log(`[Pexels] Đã tải xong nền cho Cảnh ${sceneIndex}`);
            return `file://${dest}`;
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
        console.log(`[Cảnh báo Local Video] Đã tìm thấy file .MOV...`);
    }

    if (validFiles.length === 0) {
        console.log(`[Local Video] Thư mục trống! Fallback sang Pexels.`);
        return null;
    }

    let matches = validFiles;
    if (query) {
        const keywordMatches = validFiles.filter(f => f.toLowerCase().includes(query.toLowerCase()));
        if (keywordMatches.length > 0) {
            matches = keywordMatches;
        } else {
            console.log(`[Local Video] Không tìm thấy khớp cho "${query}", chọn ngẫu nhiên một file...`);
            matches = validFiles;
        }
    }

    const randomFile = matches[Math.floor(Math.random() * matches.length)];
    const absolutePath = `file://${path.join(dir, randomFile)}`;
    console.log(`\n📂 [Local Media Found] 🎯 Đã bốc video từ kho cá nhân: "${randomFile}"`);
    console.log(`🔗 [Path] ${absolutePath}`);

    return absolutePath;
}

/**
 * 🎙️ 2. ELEVENLABS API: Ép Giọng & Timestamps Karaoke
 */
async function getElevenLabsVoice(text, sceneIndex, destDir, defaultVoiceId = "pNInz6obbf5AWCGqeXbU") {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || defaultVoiceId;
    if (!ELEVENLABS_KEY || !text) return console.log(`[ElevenLabs] Thiếu KEY/Text tại Cảnh ${sceneIndex}`);

    console.log(`[ElevenLabs] Dùng VoiceID "${voiceId}" chuyển Text thành Voice Cảnh ${sceneIndex}...`);
    try {
        const destAudio = path.join(destDir, `scene_${sceneIndex}_voice.mp3`);

        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
            { text, model_id: "eleven_turbo_v2_5" },
            { headers: { 'xi-api-key': ELEVENLABS_KEY } }
        );

        const audioBuffer = Buffer.from(response.data.audio_base64, 'base64');
        fs.writeFileSync(destAudio, audioBuffer);

        const alignment = response.data.alignment;
        const destAlign = path.join(destDir, `scene_${sceneIndex}_karaoke.json`);
        fs.writeFileSync(destAlign, JSON.stringify(alignment, null, 2));

        console.log(`[ElevenLabs] Đã bóc băng Karaoke cho Cảnh ${sceneIndex}`);
        return {
            audioPath: `file://${destAudio}`,
            karaokePath: `file://${destAlign}`,
            absoluteAudioPath: destAudio
        };
    } catch (err) {
        console.error(`[ElevenLabs Lỗi]`, err.response?.data || err.message);
    }
    return null;
}

/**
 * 👨‍💼 3. HEYGEN API: MC Ảo
 */
async function getHeyGenAvatar(text, sceneIndex, destDir) {
    if (!HEYGEN_KEY || !text) return console.log(`[HeyGen] Thiếu KEY/Text tại Cảnh ${sceneIndex}`);

    console.log(`[HeyGen] Gọi MC Ảo cho Cảnh ${sceneIndex}...`);
    try {
        const genRes = await axios.post(
            'https://api.heygen.com/v2/video/generate',
            {
                video_inputs: [{
                    character: { type: "avatar", avatar_id: "default_avatar_id", avatar_style: "normal" },
                    voice: { type: "text", input_text: text, voice_id: "default_elevenlabs_voice_map" },
                    background: { type: "color", value: "#00FF00" }
                }]
            },
            { headers: { "X-Api-Key": HEYGEN_KEY, "Content-Type": "application/json" } }
        );

        const videoId = genRes.data.data.video_id;
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

        const destVid = path.join(destDir, `scene_${sceneIndex}_pip.mp4`);
        await downloadFile(videoUrl, destVid);

        console.log(`[HeyGen] Thu hoạch khoai xong! Nền xanh Cảnh ${sceneIndex} đã tải về.`);
        return `file://${destVid}`;

    } catch (err) {
        console.error(`[HeyGen Lỗi]`, err.response?.data || err.message);
    }
    return null;
}

async function getLocalMusic() {
    const musicDir = path.join(__dirname, '../../media-input/background-music');
    if (!fs.existsSync(musicDir)) return null;

    const files = fs.readdirSync(musicDir).filter(f => !f.startsWith('.') && (f.toLowerCase().endsWith('.mp3') || f.toLowerCase().endsWith('.wav') || f.toLowerCase().endsWith('.m4a')));
    if (files.length === 0) return null;

    const randomFile = files[Math.floor(Math.random() * files.length)];
    
    console.log(`[Music] Đã nạp nhạc nền Local: ${randomFile}`);
    return `file://${path.join(musicDir, randomFile)}`;
}

module.exports = {
    getPexelsBroll,
    getLocalBroll,
    getElevenLabsVoice,
    getHeyGenAvatar,
    getLocalMusic
};
