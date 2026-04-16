#!/usr/bin/env node
/**
 * Clone Video Engine
 *
 * Pipeline:
 *   YouTube URL → Transcript → Analyse/Remix (Claude) → master_content.md → /tao_video
 *
 * Cách dùng:
 *   node scripts/clone_video_engine.js --url "https://youtube.com/watch?v=xxx"
 *   node scripts/clone_video_engine.js --url "https://youtu.be/xxx" --channel "100x" --lang vi
 *   node scripts/clone_video_engine.js --url "..." --transcript-only   (chỉ extract transcript)
 */

const fs   = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { getTranscript } = require('./utils/youtube_transcript');

// ─── Parse CLI Args ───────────────────────────────────────────────────────────

function parseArgs() {
    const args = process.argv.slice(2);
    const opts = {
        url: null,
        channel: 'default',
        lang: null,
        transcriptOnly: false,
        ticketId: null,
    };
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--url')              opts.url = args[++i];
        if (args[i] === '--channel')          opts.channel = args[++i];
        if (args[i] === '--lang')             opts.lang = args[++i];
        if (args[i] === '--ticket')           opts.ticketId = args[++i];
        if (args[i] === '--transcript-only')  opts.transcriptOnly = true;
    }
    return opts;
}

// ─── Ticket & Scaffold ────────────────────────────────────────────────────────

function generateTicketId() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `CLN-${ts}-${rand}`;
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function scaffoldDirs(ticketId, channel) {
    const today = getToday();
    const base = path.join(__dirname, '..', 'media_output', today, channel, ticketId);
    const reelsDir = path.join(base, 'reels');
    const assetsDir = path.join(reelsDir, 'assets');
    [base, reelsDir, assetsDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
    return { base, reelsDir, assetsDir };
}

function saveToIdeationPipeline(ticketId, channel, topic, bundlePath) {
    const dbPath = path.join(__dirname, '..', 'database', 'ideation_pipeline.json');
    let pipeline = [];
    try { pipeline = JSON.parse(fs.readFileSync(dbPath, 'utf8')); } catch {}
    pipeline.push({
        ticket_id: ticketId,
        target_page: channel,
        topic,
        source: 'clone_video',
        bundle_path: bundlePath,
        status: 'transcript_ready',
        created_at: new Date().toISOString(),
    });
    fs.writeFileSync(dbPath, JSON.stringify(pipeline, null, 2));
}

// ─── Format transcript thành văn bản dễ đọc cho Claude ────────────────────────

function formatTranscriptForClaude(transcript) {
    const meta = [
        `TIÊU ĐỀ VIDEO GỐC: ${transcript.title}`,
        `KÊNH: ${transcript.author}`,
        `URL: ${transcript.url}`,
        `THỜI LƯỢNG: ${Math.round(transcript.durationSec / 60)} phút`,
        `NGÔN NGỮ: ${transcript.lang}`,
        transcript.description ? `MÔ TẢ: ${transcript.description}` : '',
        '',
        '─── NỘI DUNG TRANSCRIPT ───',
        '',
    ].filter(Boolean).join('\n');

    // Gom segments thành đoạn theo thời gian (mỗi 30s = 1 đoạn)
    const CHUNK_MS = 30_000;
    const chunks = [];
    let chunk = [];
    let chunkStart = 0;

    for (const seg of transcript.segments) {
        if (seg.offset - chunkStart > CHUNK_MS && chunk.length > 0) {
            const minutes = Math.floor(chunkStart / 60000);
            const seconds = Math.floor((chunkStart % 60000) / 1000);
            chunks.push(`[${minutes}:${String(seconds).padStart(2, '0')}] ${chunk.join(' ')}`);
            chunk = [];
            chunkStart = seg.offset;
        }
        chunk.push(seg.text);
    }
    if (chunk.length > 0) {
        const minutes = Math.floor(chunkStart / 60000);
        const seconds = Math.floor((chunkStart % 60000) / 1000);
        chunks.push(`[${minutes}:${String(seconds).padStart(2, '0')}] ${chunk.join(' ')}`);
    }

    return meta + chunks.join('\n');
}

// ─── Save transcript files ────────────────────────────────────────────────────

function saveTranscriptFiles(transcript, bundlePath) {
    const formatted = formatTranscriptForClaude(transcript);
    const jsonPath = path.join(bundlePath, 'yt_transcript.json');
    const txtPath  = path.join(bundlePath, 'yt_transcript.txt');
    const fmtPath  = path.join(bundlePath, 'yt_transcript_formatted.txt');

    fs.writeFileSync(jsonPath, JSON.stringify(transcript, null, 2));
    fs.writeFileSync(txtPath,  transcript.fullText);
    fs.writeFileSync(fmtPath,  formatted);

    return { jsonPath, txtPath, fmtPath };
}

// ─── Generate Remix Prompt ────────────────────────────────────────────────────

/**
 * Tạo prompt cho Claude để phân tích + remix transcript thành master_content.md
 * Claude Code (người dùng đang chat) sẽ đọc prompt này và thực thi.
 */
function generateRemixPrompt(transcript, ticketId, bundlePath) {
    const fmtPath = path.join(bundlePath, 'yt_transcript_formatted.txt');
    const masterPath = path.join(bundlePath, 'master_content.md');

    return `
═══════════════════════════════════════════════════════════════
  CLONE VIDEO ENGINE — BƯỚC 2: ANALYSE & REMIX
  Ticket: ${ticketId}
═══════════════════════════════════════════════════════════════

Transcript đã được extract xong:
📄 Formatted transcript: ${fmtPath}
📝 Output sẽ lưu vào:    ${masterPath}

─── NHIỆM VỤ ────────────────────────────────────────────────

Đọc transcript tại: ${fmtPath}

Sau đó phân tích và REMIX thành master_content.md theo đúng format
chuẩn của hệ thống (xem bên dưới).

─── PHÂN TÍCH CẦN LÀM ──────────────────────────────────────

1. TOPIC CORE: Chủ đề cốt lõi video nói về gì?
2. HOOK STYLE: Hook gốc dùng kiểu nào? (số liệu / câu hỏi / controversy / story)
3. NARRATIVE: Cấu trúc (listicle / comparison / story arc / how-to)
4. TONE: Tone of voice (serious / motivational / analytical / hài hước)
5. KEY CLAIMS: 3-5 luận điểm chính với data/ví dụ cụ thể
6. GAPS: Góc nhìn nào video chưa đề cập hoặc có thể khai thác thêm?

─── QUY TẮC REMIX ──────────────────────────────────────────

✅ GIỮ: Topic cốt lõi, các fact/số liệu (verify nếu cần)
✅ THAY: Hook hoàn toàn mới, ví dụ khác, góc nhìn khác
✅ THÊM: Insight mà video gốc bỏ qua hoặc chưa khai thác
❌ CẤM: Copy bất kỳ câu nào từ transcript gốc
❌ CẤM: Giữ nguyên cấu trúc bài gốc

Nếu hook gốc dùng SỐ LIỆU → dùng hook CÂU HỎI hoặc CONTROVERSY
Nếu hook gốc dùng CÂU HỎI → dùng hook SỐ LIỆU gây sốc
Nếu hook gốc dùng STORY → dùng hook COMPARISON (trước/sau, người A vs người B)

─── FORMAT master_content.md CẦN XUẤT ─────────────────────

# [TIÊU ĐỀ BÀI VIẾT MỚI — KHÔNG DÙNG TIÊU ĐỀ GỐC]

## HOOK
[1-2 câu mở đầu cực mạnh — khác hoàn toàn với hook gốc]

## SETUP
[2-3 câu bối cảnh — vấn đề đang xảy ra là gì, tại sao cần biết]

## NỘI DUNG CHÍNH
[3-5 luận điểm, mỗi luận điểm có: tiêu đề + giải thích + ví dụ/data cụ thể]

### Luận điểm 1: ...
### Luận điểm 2: ...
### Luận điểm 3: ...

## KẾT LUẬN
[Tóm gọn insight cốt lõi — 2-3 câu]

## CTA
[Kêu gọi hành động phù hợp với tone bài]

## MEDIA KEYWORDS
[Gợi ý 5-8 từ khoá tìm kiếm ảnh/video cho Pexels — KHÁC với video gốc]
- keyword 1
- keyword 2
...

## META
- source_url: ${transcript.url}
- source_title: ${transcript.title}
- hook_style_used: [kiểu hook bạn chọn]
- tone: [tone bạn chọn]
- ticket_id: ${ticketId}

─── THỰC THI ───────────────────────────────────────────────

Đọc file transcript, phân tích, viết master_content.md và lưu vào:
${masterPath}

Sau khi lưu xong, chạy /tao_video với ticket ID: ${ticketId}
═══════════════════════════════════════════════════════════════
`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    const opts = parseArgs();

    if (!opts.url) {
        console.error('❌ Thiếu --url. Ví dụ: node scripts/clone_video_engine.js --url "https://youtu.be/xxx"');
        process.exit(1);
    }

    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║        CLONE VIDEO ENGINE — START            ║');
    console.log('╚══════════════════════════════════════════════╝\n');
    console.log(`🎯 URL: ${opts.url}`);
    console.log(`📺 Channel: ${opts.channel}`);

    // ── Bước 1: Extract transcript ──────────────────────────────────────────
    console.log('\n─── BƯỚC 1: EXTRACT TRANSCRIPT ─────────────────────────────');
    const transcript = await getTranscript(opts.url, { lang: opts.lang });

    // ── Bước 2: Scaffold & lưu files ───────────────────────────────────────
    console.log('\n─── BƯỚC 2: SCAFFOLD & LƯU FILES ───────────────────────────');
    const ticketId = opts.ticketId || generateTicketId();
    const { base: bundlePath, reelsDir } = scaffoldDirs(ticketId, opts.channel);

    const { fmtPath } = saveTranscriptFiles(transcript, bundlePath);
    console.log(`✅ Ticket ID: ${ticketId}`);
    console.log(`✅ Bundle path: ${bundlePath}`);
    console.log(`✅ Transcript đã lưu: ${fmtPath}`);

    // Lưu placeholder media_payload.json
    const payloadPath = path.join(reelsDir, 'media_payload.json');
    if (!fs.existsSync(payloadPath)) {
        fs.writeFileSync(payloadPath, JSON.stringify([], null, 2));
    }

    // Cập nhật ideation_pipeline
    saveToIdeationPipeline(ticketId, opts.channel, transcript.title, bundlePath);

    // Nếu chỉ cần transcript
    if (opts.transcriptOnly) {
        console.log('\n✅ [Transcript Only Mode] Hoàn tất.');
        console.log(`📄 Transcript: ${fmtPath}`);
        return;
    }

    // ── Bước 3: In remix prompt cho Claude ─────────────────────────────────
    console.log('\n─── BƯỚC 3: REMIX PROMPT ────────────────────────────────────');
    const remixPrompt = generateRemixPrompt(transcript, ticketId, bundlePath);

    // Lưu prompt vào file để Claude đọc
    const promptPath = path.join(bundlePath, 'clone_remix_prompt.txt');
    fs.writeFileSync(promptPath, remixPrompt);

    // In ra màn hình để Claude Code thấy và thực thi
    console.log(remixPrompt);

    // Lưu summary cho Claude
    const summaryPath = path.join(bundlePath, 'clone_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
        ticketId,
        channel: opts.channel,
        sourceUrl: transcript.url,
        sourceTitle: transcript.title,
        sourceAuthor: transcript.author,
        durationSec: transcript.durationSec,
        wordCount: transcript.wordCount,
        lang: transcript.lang,
        bundlePath,
        reelsDir,
        transcriptPath: fmtPath,
        masterContentPath: path.join(bundlePath, 'master_content.md'),
        status: 'transcript_ready',
        createdAt: new Date().toISOString(),
    }, null, 2));

    console.log(`\n📋 Summary: ${summaryPath}`);
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║  CLONE ENGINE XONG — CHỜ CLAUDE REMIX        ║');
    console.log('╚══════════════════════════════════════════════╝');
}

main().catch(err => {
    console.error('\n❌ Clone Engine lỗi:', err.message);
    process.exit(1);
});
