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
 * Chuyển đường dẫn tuyệt đối → HTTP URL qua micro-server ticket-assets
 * Dùng thay cho file:// để tương thích Windows + Remotion
 */
function toTicketHttpUrl(filename) {
    return `${MICRO_SERVER_URL}/ticket-assets/${encodeURIComponent(path.basename(filename))}`;
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
            return toTicketHttpUrl(dest);
        }
    } catch (err) {
        console.error(`[Pexels Lỗi] Cảnh ${sceneIndex}:`, err.message);
    }
    return null;
}

/**
 * 📂 1.5. LOCAL VIDEO: Trích xuất nền Video Cá nhân (Ưu tiên SSoT)
 */
async function getLocalBroll(query, sceneIndex) {
    const dir = path.join(__dirname, '..', '..', 'media-input', 'background-video');
    
    // Tạo folder nếu chưa có để tránh lỗi crash nhưng báo cáo là không thấy file
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        return null;
    }

    // Lấy toàn bộ file mp4/webm/mov (Remotion hỗ trợ tốt mp4)
    let files = fs.readdirSync(dir);
    const validFiles = files.filter(f => f.match(/\.(mp4|webm|mov)$/i));

    if (validFiles.length === 0) {
        return null;
    }

    let matches = validFiles;
    if (query && query !== 'business' && query !== 'office') {
        const keywordMatches = validFiles.filter(f => f.toLowerCase().includes(query.toLowerCase()));
        if (keywordMatches.length > 0) {
            matches = keywordMatches;
        }
    }

    const randomFile = matches[Math.floor(Math.random() * matches.length)];
    // Trả HTTP URL qua micro-server (port 9876) — tương thích mọi OS, Remotion không nhận file:// URL
    const httpUrl = `http://localhost:9876/media-input/background-video/${encodeURIComponent(randomFile)}`;
    console.log(`\n📂 [Smart Sourcing] 🎯 Đã bốc video từ kho cá nhân: "${randomFile}" (Cảnh ${sceneIndex})`);

    return httpUrl;
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
            audioPath: toTicketHttpUrl(destAudio),
            karaokePath: toTicketHttpUrl(destAlign),
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
        return toTicketHttpUrl(destVid);

    } catch (err) {
        console.error(`[HeyGen Lỗi]`, err.response?.data || err.message);
    }
    return null;
}

/**
 * 🎵 SMART MUSIC: Tải nhạc từ kho Local
 */
async function getLocalMusic(vibe = 'lofi') {
    const musicDir = path.join(__dirname, '..', '..', 'media-input', 'background-music');
    if (!fs.existsSync(musicDir)) {
        fs.mkdirSync(musicDir, { recursive: true });
        return null;
    }

    const files = fs.readdirSync(musicDir).filter(f => 
        !f.startsWith('.') && (f.toLowerCase().endsWith('.mp3') || f.toLowerCase().endsWith('.wav'))
    );
    
    if (files.length === 0) return null;

    // Logic lọc theo vibe (nếu tên file có chứa vibe)
    let matches = files;
    if (vibe) {
        const vibeMatches = files.filter(f => f.toLowerCase().includes(vibe.toLowerCase()));
        if (vibeMatches.length > 0) matches = vibeMatches;
    }

    const randomFile = matches[Math.floor(Math.random() * matches.length)];
    console.log(`🎵 [Music] Đã chọn nhạc nền (${vibe || 'random'}): ${randomFile}`);
    // Trả HTTP URL qua micro-server (port 9876) — tương thích mọi OS
    return `http://localhost:9876/media-input/background-music/${encodeURIComponent(randomFile)}`;
}

module.exports = {
    getPexelsBroll,
    getLocalBroll,
    getElevenLabsVoice,
    getHeyGenAvatar,
    getLocalMusic
};
