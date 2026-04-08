/**
 * GOOGLE SYNC ENGINE (WHITE-LABEL V1)
 * 100X Content Agent - Bridge between Local and Google Sheets
 * Tác giả: Antigravity AI
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GOOGLE_SHEET_APP_URL = process.env.GOOGLE_SHEET_APP_URL;

if (!GOOGLE_SHEET_APP_URL) {
  console.error('❌ LỖI: Chưa cấu hình GOOGLE_SHEET_APP_URL trong file .env');
  process.exit(1);
}

const DATABASE_PATHS = {
  ideation: path.join(__dirname, '..', 'database', 'ideation_pipeline.json'),
  ideas: path.join(__dirname, '..', 'database', 'idea_bank.json')
};

/**
 * 1. Đẩy ý tưởng mới cào được lên Google Sheets (Tab Idea Hub)
 */
async function syncIdeasUp() {
  console.log('🔄 Đang đồng bộ Ý tưởng mới lên Cloud...');
  try {
    const ideas = JSON.parse(fs.readFileSync(DATABASE_PATHS.ideas, 'utf8'));
    // Lọc những ý tưởng chưa có trên Cloud (giả sử flag cloud_synced)
    const newIdeas = ideas.filter(i => !i.cloud_synced && i.status === 'pending');

    if (newIdeas.length === 0) {
      console.log('✅ Không có ý tưởng mới cần đẩy.');
      return;
    }

    const payload = {
      action: "add_research_ideas",
      ideas: newIdeas.map(i => ({
        id: i.id,
        source: i.source || "Scraped",
        content: i.content,
        hook: i.hook_pattern || "",
        angle: i.angle || "AI Brainstorm",
        pillar: i.topic_pillar || "",
        funnel: i.funnel_stage || "",
        agent: "", // Chờ sếp chọn trên sheet
        status: "📥 Hộp thư ý tưởng"
      }))
    };

    const response = await axios.post(GOOGLE_SHEET_APP_URL, payload);
    if (response.data === "Success") {
      // Đánh dấu đã đồng bộ
      newIdeas.forEach(i => i.cloud_synced = true);
      fs.writeFileSync(DATABASE_PATHS.ideas, JSON.stringify(ideas, null, 2));
      console.log(`✅ Đã đẩy thành công ${newIdeas.length} ý tưởng lên Google Sheets.`);
    }
  } catch (error) {
    console.error('❌ Lỗi syncIdeasUp:', error.message);
  }
}

/**
 * 2. Kéo các Ý tưởng đã được Sếp Duyệt về máy (Tab Idea Hub -> Local Pipeline)
 */
async function syncApprovedIdeasDown() {
  console.log('🔄 Đang kiểm tra lệnh Duyệt từ Sếp trên Cloud...');
  try {
    const response = await axios.get(`${GOOGLE_SHEET_APP_URL}?action=get_approved_ideas`);
    const approvedIdeas = response.data;

    if (!Array.isArray(approvedIdeas) || approvedIdeas.length === 0) {
      console.log('ℹ️ Chưa có lệnh duyêt mới trên Google Sheets.');
      return;
    }

    const pipeline = JSON.parse(fs.readFileSync(DATABASE_PATHS.ideation, 'utf8'));
    let newTicketsCount = 0;

    for (const remoteIdea of approvedIdeas) {
      // Kiểm tra xem ticket này đã tồn tại trong local pipeline chưa
      const exists = pipeline.find(p => p.source_idea_id === remoteIdea.id);
      if (!exists) {
        const ticketId = `post_${Date.now()}_${remoteIdea.id.split('_').pop()}`;
        pipeline.push({
          id: ticketId,
          source_idea_id: remoteIdea.id,
          target_page: "facebook",
          format: "WAITING_FOR_COMMAND", // Will be updated based on 'agent' from sheet
          status: "pending",
          meta_from_cloud: {
            agent: remoteIdea.agent,
            angle: remoteIdea.angle
          }
        });
        newTicketsCount++;
      }
    }

    if (newTicketsCount > 0) {
      fs.writeFileSync(DATABASE_PATHS.ideation, JSON.stringify(pipeline, null, 2));
      console.log(`✅ Đã kéo thành công ${newTicketsCount} lệnh sản xuất mới về máy.`);
    } else {
      console.log('✅ Mọi lệnh trên Cloud đã được đồng bộ.');
    }
  } catch (error) {
    console.error('❌ Lỗi syncApprovedIdeasDown:', error.message);
  }
}

/**
 * 3. Đẩy thành phẩm (Caption/Media) lên Cloud (Tab Content Pipeline)
 */
async function pushResultToPipeline(ticketId, format, caption, mediaPath, sourceIdeaId, channel = '', postTime = '') {
  console.log(`🔄 Đang nộp thành phẩm [${ticketId}] lên Cloud...`);
  try {
    const payload = {
      action: "push_to_pipeline",
      ticketId,
      format,
      caption,
      mediaPath,
      sourceIdeaId,
      channel,
      postTime
    };
    const response = await axios.post(GOOGLE_SHEET_APP_URL, payload);
    if (response.data === "Success") {
      console.log(`✅ Thành phẩm [${ticketId}] đã hiển thị trên Google Sheets để đợi Duyệt Đăng.`);
    }
  } catch (error) {
    console.error('❌ Lỗi pushResultToPipeline:', error.message);
  }
}

/**
 * 5. Kéo ý tưởng pending từ Idea Hub (dùng cho Schedule Autopilot)
 */
async function getPendingIdeas(limit = 10) {
  try {
    const response = await axios.get(`${GOOGLE_SHEET_APP_URL}?action=get_pending_ideas&limit=${limit}`);
    const data = response.data;
    if (!Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error('❌ Lỗi getPendingIdeas:', error.message);
    return [];
  }
}

// Export để các script khác sử dụng
module.exports = {
  syncIdeasUp,
  syncApprovedIdeasDown,
  pushResultToPipeline,
  getPendingIdeas,
  syncSettingsUp
};

/**
 * 4. Đẩy cấu hình Kênh từ my_accounts.json lên Google Sheets
 */
async function syncSettingsUp() {
  console.log('🔄 Đang đồng bộ Cấu hình (Kênh Đăng) lên Cloud...');
  try {
    const accPath = path.join(__dirname, '..', 'database', 'my_accounts.json');
    if (!fs.existsSync(accPath)) return;
    const accData = JSON.parse(fs.readFileSync(accPath, 'utf8'));
    if (!accData.channels || accData.channels.length === 0) return;
    
    const payload = {
      action: "sync_settings",
      channels: accData.channels
    };
    await axios.post(GOOGLE_SHEET_APP_URL, payload);
    console.log('✅ Đã cập nhật Menu Kênh Đăng trên Google Sheets.');
  } catch (error) {
    console.error('❌ Lỗi syncSettingsUp:', error.message);
  }
}

// Nếu chạy trực tiếp từ CLI
if (require.main === module) {
  const arg = process.argv[2];
  if (arg === '--up') syncIdeasUp();
  else if (arg === '--down') syncApprovedIdeasDown();
  else if (arg === '--settings') syncSettingsUp();
  else {
    // Chạy tất cả nếu không có tham số
    (async () => {
      await syncSettingsUp();
      await syncIdeasUp();
      await syncApprovedIdeasDown();
    })();
  }
}
