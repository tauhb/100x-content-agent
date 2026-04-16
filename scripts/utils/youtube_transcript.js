/**
 * YouTube Transcript Extractor
 *
 * Lấy transcript từ YouTube mà không cần API key.
 * Sử dụng YouTube InnerTube API (method 1) và Web scrape (method 2) làm fallback.
 *
 * Hỗ trợ:
 *   - URL đầy đủ: https://www.youtube.com/watch?v=xxxxx
 *   - Short URL: https://youtu.be/xxxxx
 *   - Video ID: xxxxx (11 ký tự)
 *   - Shorts: https://www.youtube.com/shorts/xxxxx
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ─── Regex ─────────────────────────────────────────────────────────────────────

const VIDEO_ID_REGEX = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const INNERTUBE_CLIENT = {
    clientName: 'ANDROID',
    clientVersion: '20.10.38',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractVideoId(urlOrId) {
    if (!urlOrId) throw new Error('[YT] URL hoặc Video ID không được để trống');
    // Nếu đúng 11 ký tự → coi là Video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId.trim())) return urlOrId.trim();
    const match = urlOrId.match(VIDEO_ID_REGEX);
    if (!match) throw new Error(`[YT] Không thể trích xuất Video ID từ: ${urlOrId}`);
    return match[1];
}

function decodeHtmlEntities(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

function parseTranscriptXml(xml) {
    const segments = [];
    // Format mới: <p t="..." d="..."><s ...>word</s></p>
    const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
    let pMatch;
    while ((pMatch = pRegex.exec(xml)) !== null) {
        const offset = parseInt(pMatch[1], 10);
        const duration = parseInt(pMatch[2], 10);
        let text = '';
        const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
        let sMatch;
        while ((sMatch = sRegex.exec(pMatch[3])) !== null) text += sMatch[1];
        if (!text) text = pMatch[3].replace(/<[^>]+>/g, '');
        text = decodeHtmlEntities(text).trim();
        if (text) segments.push({ text, offset, duration });
    }
    if (segments.length > 0) return segments;

    // Format cũ: <text start="..." dur="...">...</text>
    const textRegex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
    let tMatch;
    while ((tMatch = textRegex.exec(xml)) !== null) {
        const text = decodeHtmlEntities(tMatch[3]).trim();
        if (text) segments.push({
            text,
            offset: Math.round(parseFloat(tMatch[1]) * 1000),
            duration: Math.round(parseFloat(tMatch[2]) * 1000),
        });
    }
    return segments;
}

function segmentsToText(segments) {
    return segments.map(s => s.text).join(' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

// ─── Method 1: InnerTube API ──────────────────────────────────────────────────

async function fetchViaInnerTube(videoId, langCode) {
    try {
        const res = await axios.post(
            'https://www.youtube.com/youtubei/v1/player?prettyPrint=false',
            {
                context: { client: INNERTUBE_CLIENT },
                videoId,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': `com.google.android.youtube/20.10.38 (Linux; U; Android 14)`,
                },
                timeout: 10000,
            }
        );

        const tracks = res.data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (!Array.isArray(tracks) || tracks.length === 0) return null;

        // Chọn ngôn ngữ ưu tiên
        let track = langCode
            ? tracks.find(t => t.languageCode === langCode)
            : null;
        track = track || tracks.find(t => !t.kind || t.kind !== 'asr') || tracks[0];

        const xmlRes = await axios.get(track.baseUrl, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: 10000,
        });

        return {
            segments: parseTranscriptXml(xmlRes.data),
            lang: track.languageCode,
            title: res.data?.videoDetails?.title || '',
            author: res.data?.videoDetails?.author || '',
            description: res.data?.videoDetails?.shortDescription || '',
        };
    } catch (err) {
        console.warn('[YT] InnerTube thất bại:', err.message);
        return null;
    }
}

// ─── Method 2: Web Page Scrape ────────────────────────────────────────────────

async function fetchViaWebPage(videoId, langCode) {
    try {
        const pageRes = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept-Language': langCode ? `${langCode},en;q=0.9` : 'en-US,en;q=0.9',
            },
            timeout: 15000,
        });

        const html = pageRes.data;

        // Lấy ytInitialPlayerResponse
        const jsonMatch = html.match(/var ytInitialPlayerResponse\s*=\s*(\{.+?\});(?:\s*var|\s*<\/script>)/s)
            || html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;/s);
        if (!jsonMatch) throw new Error('Không tìm thấy ytInitialPlayerResponse');

        let playerData;
        try { playerData = JSON.parse(jsonMatch[1]); }
        catch { throw new Error('Parse ytInitialPlayerResponse thất bại'); }

        const tracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (!Array.isArray(tracks) || tracks.length === 0) {
            throw new Error('Video này không có transcript/caption');
        }

        let track = langCode ? tracks.find(t => t.languageCode === langCode) : null;
        track = track || tracks.find(t => !t.kind || t.kind !== 'asr') || tracks[0];

        const xmlRes = await axios.get(track.baseUrl, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: 10000,
        });

        const videoDetails = playerData?.videoDetails || {};

        return {
            segments: parseTranscriptXml(xmlRes.data),
            lang: track.languageCode,
            title: videoDetails.title || '',
            author: videoDetails.author || '',
            description: videoDetails.shortDescription || '',
        };
    } catch (err) {
        console.warn('[YT] Web scrape thất bại:', err.message);
        return null;
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Lấy transcript từ YouTube URL hoặc Video ID.
 *
 * @param {string} urlOrId - YouTube URL hoặc Video ID
 * @param {object} [opts]
 * @param {string} [opts.lang]     - Mã ngôn ngữ ưu tiên ('vi', 'en', ...)
 * @param {string} [opts.saveDir]  - Thư mục lưu transcript (nếu muốn save file)
 * @returns {Promise<{
 *   videoId: string,
 *   title: string,
 *   author: string,
 *   description: string,
 *   lang: string,
 *   segments: Array<{text, offset, duration}>,
 *   fullText: string,
 *   wordCount: number,
 *   durationSec: number,
 * }>}
 */
async function getTranscript(urlOrId, opts = {}) {
    const videoId = extractVideoId(urlOrId);
    const { lang, saveDir } = opts;

    console.log(`\n[YT Transcript] 🎬 Video ID: ${videoId}`);
    console.log(`[YT Transcript] 🌐 Thử InnerTube API...`);

    let result = await fetchViaInnerTube(videoId, lang);

    if (!result || result.segments.length === 0) {
        console.log(`[YT Transcript] 🔄 Fallback → Web scrape...`);
        result = await fetchViaWebPage(videoId, lang);
    }

    if (!result || result.segments.length === 0) {
        throw new Error(`[YT] Không thể lấy transcript cho video: ${videoId}. Video có thể không có caption.`);
    }

    const fullText = segmentsToText(result.segments);
    const lastSeg = result.segments[result.segments.length - 1];
    const durationSec = lastSeg
        ? Math.round((lastSeg.offset + lastSeg.duration) / 1000)
        : 0;

    const transcript = {
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: result.title,
        author: result.author,
        description: result.description.slice(0, 500),
        lang: result.lang,
        segments: result.segments,
        fullText,
        wordCount: fullText.split(/\s+/).length,
        durationSec,
        fetchedAt: new Date().toISOString(),
    };

    console.log(`[YT Transcript] ✅ Lấy thành công: "${transcript.title}"`);
    console.log(`[YT Transcript] 📊 ${transcript.segments.length} segments | ~${transcript.wordCount} từ | ${Math.round(transcript.durationSec / 60)} phút`);

    // Lưu file nếu có saveDir
    if (saveDir) {
        if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
        const jsonPath = path.join(saveDir, 'yt_transcript.json');
        const txtPath = path.join(saveDir, 'yt_transcript.txt');
        fs.writeFileSync(jsonPath, JSON.stringify(transcript, null, 2));
        fs.writeFileSync(txtPath, fullText);
        console.log(`[YT Transcript] 💾 Đã lưu transcript → ${saveDir}`);
    }

    return transcript;
}

/**
 * CLI shortcut: node youtube_transcript.js <url>
 */
if (require.main === module) {
    const url = process.argv[2];
    const lang = process.argv[3];
    if (!url) {
        console.error('Usage: node youtube_transcript.js <youtube-url> [lang]');
        process.exit(1);
    }
    getTranscript(url, { lang, saveDir: 'database/scraped_temp/latest' })
        .then(t => {
            console.log('\n─── TRANSCRIPT ───────────────────────────────────────');
            console.log(t.fullText.slice(0, 1000) + (t.fullText.length > 1000 ? '...' : ''));
        })
        .catch(err => {
            console.error('❌ Lỗi:', err.message);
            process.exit(1);
        });
}

module.exports = { getTranscript, extractVideoId };
