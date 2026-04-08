/**
 * GOOGLE APPS SCRIPT FOR 100X CONTENT AGENT V2 (HYBRID SYNC)
 * Tác giả: Antigravity AI
 */

const TAB_IDEA_HUB = "💡 IDEA HUB";
const TAB_PIPELINE = "🚀 CONTENT PIPELINE";

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 100X AGENT')
    .addItem('🛠️ Khởi tạo Hệ thống (Setup)', 'setupSystem')
    .addItem('🔄 Kiểm tra kết nối', 'checkConnection')
    .addToUi();
}

function setupSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Tạo Tab IDEA HUB
  let sheetIdea = ss.getSheetByName(TAB_IDEA_HUB);
  if (sheetIdea) ss.deleteSheet(sheetIdea); // Reset nếu đã có
  sheetIdea = ss.insertSheet(TAB_IDEA_HUB);
  
  const headersIdea = ["ID", "Nguồn (Source)", "Nội dung/Link", "Mẫu Mở Đầu (Hook Pattern)", "Góc nhìn AI", "Trụ Cột (Pillar)", "Phễu (Funnel)", "Agent (Media Type)", "TRẠNG THÁI (Status)", "Timestamp"];
  sheetIdea.getRange(1, 1, 1, headersIdea.length).setValues([headersIdea])
    .setBackground("#f3f3f3").setFontWeight("bold").setHorizontalAlignment("center");
  sheetIdea.setFrozenRows(1);
  
  // Cài đặt Dropdown cho Trạng thái Idea (Cột I)
  const ruleIdea = SpreadsheetApp.newDataValidation().requireValueInList([
    "📥 Hộp thư ý tưởng", "✅ DUYỆT - LÀM NGAY", "⚙️ Đang thực hiện...", "📦 Sẵn sàng sản xuất", "🗑️ Lưu trữ"
  ]).build();
  sheetIdea.getRange("I2:I1000").setDataValidation(ruleIdea);

  // Cài đặt Dropdown cho Agent (Cột H)
  const ruleAgent = SpreadsheetApp.newDataValidation().requireValueInList([
    "🎨 Image Specialist", "🎠 Carousel Specialist", "🎥 B-Roll Specialist (Reels)", "📊 Infographic Specialist"
  ]).build();
  sheetIdea.getRange("H2:H1000").setDataValidation(ruleAgent);

  // 2. Tạo Tab CONTENT PIPELINE
  let sheetPipeline = ss.getSheetByName(TAB_PIPELINE);
  if (sheetPipeline) ss.deleteSheet(sheetPipeline); // Reset nếu đã có
  sheetPipeline = ss.insertSheet(TAB_PIPELINE);
  
  const headersPipeline = ["Ticket ID", "Format", "Caption (Final)", "Media Path (Local)", "Kênh (Channel)", "Hẹn giờ (Post Time)", "BỆ PHÓNG (Publish)"];
  sheetPipeline.getRange(1, 1, 1, headersPipeline.length).setValues([headersPipeline])
    .setBackground("#d9ead3").setFontWeight("bold").setHorizontalAlignment("center");
  sheetPipeline.setFrozenRows(1);

  // Cài đặt Dropdown cho Trạng thái Pipeline (Cột G)
  const rulePipeline = SpreadsheetApp.newDataValidation().requireValueInList([
    "📝 Đang kiểm duyệt", "🚀 ĐĂNG BÀI NGAY", "✅ HOÀN THÀNH"
  ]).build();
  sheetPipeline.getRange("G2:G1000").setDataValidation(rulePipeline);

  SpreadsheetApp.getUi().alert("Hệ thống đã Reset thành công! Sẵn sàng đón dữ liệu từ dòng số 2.");
}

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === "get_pending_ideas") {
    const sheet = ss.getSheetByName(TAB_IDEA_HUB);
    const data = sheet.getDataRange().getValues();
    const limit = parseInt(e.parameter.limit) || 10;
    const pending = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][8] === "📥 Hộp thư ý tưởng") {
        pending.push({
          row: i + 1,
          id: data[i][0],
          source: data[i][1],
          content: data[i][2],
          hook: data[i][3],
          angle: data[i][4],
          pillar: data[i][5],
          funnel: data[i][6],
          agent: data[i][7]
        });
        if (pending.length >= limit) break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify(pending)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "get_approved_ideas") {
    const sheet = ss.getSheetByName(TAB_IDEA_HUB);
    const data = sheet.getDataRange().getValues();
    const approved = [];
    
    // Bỏ qua header
    for (let i = 1; i < data.length; i++) {
      if (data[i][8] === "✅ DUYỆT - LÀM NGAY") { // Cột Status giờ là I (index 8)
        approved.push({
          row: i + 1,
          id: data[i][0],
          source: data[i][1],
          content: data[i][2],
          hook: data[i][3],
          angle: data[i][4],
          pillar: data[i][5],
          funnel: data[i][6],
          agent: data[i][7]
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify(approved)).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const payload = JSON.parse(e.postData.contents);
  const action = payload.action;

  if (action === "add_research_ideas") {
    const sheet = ss.getSheetByName(TAB_IDEA_HUB);
    payload.ideas.forEach(idea => {
      // Nối thẳng vào dòng trống tiếp theo
      sheet.appendRow([
        idea.id || "ID_" + new Date().getTime(),
        idea.source || "Research",
        idea.content || "",
        idea.hook || "",
        idea.angle || "",
        idea.pillar || "",
        idea.funnel || "",
        idea.agent || "",
        "📥 Hộp thư ý tưởng",
        new Date().toISOString()
      ]);
    });
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  }

  if (action === "push_to_pipeline") {
    const sheet = ss.getSheetByName(TAB_PIPELINE);
    sheet.appendRow([
      payload.ticketId,
      payload.format,
      payload.caption,
      payload.mediaPath,
      payload.channel || "",
      payload.postTime || "",
      "📝 Đang kiểm duyệt"
    ]);
    
    // Cập nhật trạng thái ở Idea Hub sang Ready
    const ideaSheet = ss.getSheetByName(TAB_IDEA_HUB);
    const ideaData = ideaSheet.getDataRange().getValues();
    for (let i = 1; i < ideaData.length; i++) {
        if (ideaData[i][0] === payload.sourceIdeaId) {
            ideaSheet.getRange(i + 1, 9).setValue("📦 Sẵn sàng sản xuất"); // Cột I là index 9 (Range 1-indexed)
            break;
        }
    }
    
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  }
  
  if (action === "sync_settings") {
    const sheetPipeline = ss.getSheetByName(TAB_PIPELINE);
    if(sheetPipeline && payload.channels && payload.channels.length > 0) {
      const ruleChannel = SpreadsheetApp.newDataValidation().requireValueInList(payload.channels).build();
      sheetPipeline.getRange("E2:E1000").setDataValidation(ruleChannel); // Cột E (Kênh)
    }
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  }
}

function checkConnection() {
  SpreadsheetApp.getUi().alert("Kết nối ổn định! Sẵn sàng nhận lệnh từ Antigravity.");
}
