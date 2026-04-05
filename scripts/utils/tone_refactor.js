const fs = require('fs');
const path = require('path');

const targetDirs = [
  '/Users/hoangbatau/Desktop/Vibe Coding/100X Content Agent/.agents/workflows',
  '/Users/hoangbatau/Desktop/Vibe Coding/100X Content Agent/skills/media'
];

const replacements = [
  [/\bMày\b/g, 'Hệ thống'],
  [/\bmày\b/g, 'hệ thống'],
  [/\bTao\b/g, 'Người dùng'],
  [/\btao\b/g, 'người dùng'],
  [/\bSếp\b/g, 'Quản trị viên'],
  [/\bThằng\b/g, 'Trợ lý'],
  [/\bthằng\b/g, 'trợ lý'],
  [/\bThọc tay\b/g, 'Truy cập'],
  [/\bthọc tay\b/g, 'truy cập'],
  [/\bThọc\b/g, 'Truy vấn'],
  [/\bthọc\b/g, 'truy vấn'],
  [/\bPhi tang\b/g, 'Xóa bỏ'],
  [/\bphi tang\b/g, 'xóa bỏ'],
  [/\bXẻ thịt\b/g, 'Phân đoạn'],
  [/\bxẻ thịt\b/g, 'phân đoạn'],
  [/\bBăm nát\b/g, 'Chia nhỏ'],
  [/\bbăm nát\b/g, 'chia nhỏ'],
  [/\bBăm\b/g, 'Phân tách'],
  [/\bbăm\b/g, 'phân tách'],
  [/\bRác rưởi\b/g, 'Dữ liệu thừa'],
  [/\brác rưởi\b/g, 'dữ liệu thừa'],
  [/\bRác\b/g, 'Dữ liệu thừa/chưa đạt'],
  [/\brác\b/g, 'dữ liệu thừa/chưa đạt'],
  [/\bĐẻ ra\b/g, 'Tạo ra'],
  [/\bđẻ ra\b/g, 'tạo ra'],
  [/\bĐẻ\b/g, 'Khởi tạo'],
  [/\bđẻ\b/g, 'khởi tạo'],
  [/\bTống\b/g, 'Chuyển'],
  [/\btống\b/g, 'chuyển'],
  [/\bNhét\b/g, 'Thêm vào'],
  [/\bnhét\b/g, 'thêm vào'],
  [/\bTrét\b/g, 'Gắn vào'],
  [/\btrét\b/g, 'gắn vào'],
  [/\bĐập\b/g, 'Cấu trúc lại'],
  [/\bđập\b/g, 'cấu trúc lại'],
  [/\bPhá\b/g, 'Hủy'],
  [/\bphá\b/g, 'hủy'],
  [/\bMúc\b/g, 'Truy xuất'],
  [/\bmúc\b/g, 'truy xuất'],
  [/\bBốc\b/g, 'Trích xuất'],
  [/\bbốc\b/g, 'trích xuất'],
  [/\bLù lù\b/g, 'Trực quan'],
  [/\blù lù\b/g, 'trực quan'],
  [/\bVác\b/g, 'Đem'],
  [/\bvác\b/g, 'đem'],
  [/\bPhang\b/g, 'Gán'],
  [/\bphang\b/g, 'gán'],
  [/\bGầm lên\b/g, 'Ra lệnh'],
  [/\bgầm lên\b/g, 'ra lệnh'],
  [/\bChui vào\b/g, 'Truy cập vào'],
  [/\bchui vào\b/g, 'truy cập vào']
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${file}`);
      }
    }
  }
}

targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
});
console.log('Done refactoring tone.');
