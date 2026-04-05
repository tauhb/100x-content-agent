const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const url = process.argv[2];

if (!url) {
  console.error("Vui lòng cung cấp URL Fanpage! (vd: node scripts/fb_scraper.js https://www.facebook.com/thanhexpert.official)");
  process.exit(1);
}

(async () => {
  console.log(`\n🚀 Đang khởi động Đặc nhiệm Scraper (Playwright)...`);
  console.log(`Mục tiêu: ${url}\n`);
  
  const browser = await chromium.launch({ headless: false }); 
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'vi-VN'
  });
  const page = await context.newPage();
  
  try {
    console.log("⏳ Đang tải trang (Đợi render 5 giây)...");
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // Tắt hộp đăng nhập
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log("📜 Đang cuộn thâm nhập sâu vào Cơ sở dữ liệu cũ (Chạy 30 vòng)...");
    for (let i = 0; i < 30; i++) {
        await page.mouse.wheel(0, 5000);
        await page.waitForTimeout(1500); 
    }
    
    console.log("🔍 Đang phẫu thuật DOM (Tìm bài viết)...");
    
    const articles = page.locator('div[role="article"]');
    const count = await articles.count();
    console.log(`Tìm thấy: ${count} khối bài viết.\n`);
    
    const scrapedData = [];
    
    for (let i = 0; i < count; i++) {
        try {
            const articleLoc = articles.nth(i);
            const rawText = await articleLoc.innerText();
            if (!rawText || rawText.length < 30) continue; 
            
            // Cào URL
            let postUrl = "Không xác định (Thuộc Page URL gốc)";
            const links = await articleLoc.locator('a').all();
            for (const link of links) {
                const href = await link.getAttribute('href').catch(() => null);
                if (href && (href.includes('/posts/') || href.includes('/videos/') || href.includes('/photo'))) {
                    postUrl = href.split('?')[0]; 
                    break;
                }
            }

            const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
            let engagementScore = 0;
            let engagementSummary = "";
            let contentLines = [];
            
            for (let j = 0; j < lines.length; j++) {
                const lowerLine = lines[j].toLowerCase();
                
                // Nâng cấp bộ nhận diện chỉ số Viral
                if (lowerLine.includes('thích') || lowerLine.includes('bình luận') || lowerLine.includes('chia sẻ') || lowerLine.includes('lượt xem') || lowerLine.includes('comments') || lowerLine.includes('shares')) {
                    engagementSummary += lines[j] + " | ";
                    
                    const match = lines[j].match(/(\d+[.,]?\d*[KkMm]?)/);
                    if (match) {
                        let numStr = match[1].replace(',', '.').toUpperCase(); 
                        let multiplier = 1;
                        if (numStr.includes('K')) { multiplier = 1000; numStr = numStr.replace('K', ''); }
                        if (numStr.includes('M')) { multiplier = 1000000; numStr = numStr.replace('M', ''); }
                        let val = parseFloat(numStr) || 0;
                        
                        // Trọng số Viral: Chia sẻ (x5), Bình luận (x2), Thích (x1)
                        if (lowerLine.includes('chia sẻ') || lowerLine.includes('shares')) val *= 5;
                        else if (lowerLine.includes('bình luận') || lowerLine.includes('comments')) val *= 2;
                        
                        engagementScore += val;
                    }
                } else {
                    if (!['Like', 'Comment', 'Share', 'Gửi tin nhắn', 'Theo dõi'].includes(lines[j])) {
                        contentLines.push(lines[j]);
                    }
                }
            }
            
            const finalContent = contentLines.slice(2).join('\n');
            const hookText = contentLines.slice(2, 4).join(' '); 
            
            if (finalContent.length > 50) { 
                scrapedData.push({
                    url: postUrl,
                    hook_pattern: hookText,
                    engagement: engagementSummary.slice(0, -3), 
                    score: engagementScore,
                    raw_content: finalContent.substring(0, 3000)
                });
            }
            
        } catch (e) { }
    }
    
    scrapedData.sort((a, b) => b.score - a.score);
    
    // Lọc trùng lặp bài chia sẻ chéo
    const uniquePosts = [];
    const seenContent = new Set();
    
    for (const post of scrapedData) {
        if (!seenContent.has(post.raw_content)) {
            uniquePosts.push(post);
            seenContent.add(post.raw_content);
        }
    }

    const top10 = uniquePosts.slice(0, 10);
    
    // Ghi đè thông minh vào raw_data_lake (Cộng dồn nếu file đã tồn tại)
    const dbDir = path.join(__dirname, '..', 'database');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
    const outputPath = path.join(dbDir, 'raw_data_lake.json');
    
    let existingData = [];
    if (fs.existsSync(outputPath)) {
        try {
            existingData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        } catch (e) {}
    }
    
    // Gộp data mới và cũ
    existingData = existingData.concat(top10);
    fs.writeFileSync(outputPath, JSON.stringify(existingData, null, 2));
    
    console.log(`\n🎉 HOÀN TẤT! Đã bắt được ${top10.length} bài Viral nhất (Ưu tiên Lượt Chia Sẻ).`);
    console.log(`💾 Dữ liệu Thô đã được lưu và cộng dồn vào Hồ Dữ Liệu Hồ Lớn: ${outputPath}\n`);
    
  } catch (error) {
    console.error("❌ HỆ THỐNG GẶP LỖI:", error);
  } finally {
    console.log("Đóng băng trình duyệt...");
    await browser.close();
  }
})();
