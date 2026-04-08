const fs = require('fs');
const path = require('path');

/**
 * Hàm điều phối vòng đời của dữ liệu sau khi sản xuất Media.
 * @param {string} ticketId Bắt buộc có dạng post_XXXXX
 * @param {string} deliveryFormat Tên loại media: image, carousel, reels, broll, infographic
 * @param {string|null} mediaLink Đường dẫn media tĩnh từ thư mục render. Nếu null, hàm tự suy luận dựa vào deliveryFormat.
 */
function saveDeliverableAndPrunePipeline(ticketId, deliveryFormat, mediaLink = null) {
    if (!ticketId) return;

    const pipelinePath = path.join(__dirname, '..', '..', 'database', 'ideation_pipeline.json');
    const inventoryPath = path.join(__dirname, '..', '..', 'database', 'post_inventory.json');
    const ideaBankPath = path.join(__dirname, '..', '..', 'database', 'idea_bank.json');

    // Make sure JSON DBs exist
    if (!fs.existsSync(inventoryPath)) fs.writeFileSync(inventoryPath, '[]');
    
    // 1. Phân Tích Pipeline và Bóc Tách Nhổ Rễ
    let sourceIdeaId = "unknown";
    let targetChannels = ["facebook"]; // Default
    let captionLink = "";
    let bundlePath = "";

    if (fs.existsSync(pipelinePath)) {
        let pipeline = JSON.parse(fs.readFileSync(pipelinePath, 'utf8'));
        const tIndex = pipeline.findIndex(t => t.id === ticketId);
        if (tIndex > -1) {
            const ticket = pipeline[tIndex];
            
            // Lấy thông tin nguồn
            if (ticket.source_idea_id) sourceIdeaId = ticket.source_idea_id;
            if (ticket.target_page) targetChannels = [ticket.target_page.toLowerCase()];
            bundlePath = ticket.bundle_path || path.join('media_output', 'unknown_date', 'unknown_channel', ticketId);
            
            // Xóa rác khỏi Băng chuyền Zero-Garbage
            pipeline.splice(tIndex, 1);
            fs.writeFileSync(pipelinePath, JSON.stringify(pipeline, null, 2), 'utf8');
            console.log(`🧹 [Zero-Garbage] Đã xóa dọn sạch sẽ Ticket ${ticketId} khỏi ideation_pipeline.`);
        }
    }

    // 2. Chốt lại Đường dẫn Nội dung & Media
    // Fallback detection if engine didn't provide exact paths
    captionLink = path.join(bundlePath, deliveryFormat, 'caption.txt');
    
    if (!mediaLink) {
        if (deliveryFormat === 'reels' || deliveryFormat === 'broll') {
            mediaLink = path.join(bundlePath, deliveryFormat, 'media.mp4');
        } else {
            mediaLink = path.join(bundlePath, deliveryFormat, 'media.png'); // or images for carousel?
        }
    }
    
    // 3. Đúc khối và Ném vào Nhà Kho (post_inventory.json)
    let inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
    
    // Cấp phát ID nội bộ cho Media: <ticket_id>_<format> (Để 1 ticket có thể có nhiều format)
    const newDeliverableId = `${ticketId}_${deliveryFormat}`;
    
    // Nếu bị Engine lặp lại thì cập nhật thay vì nhân bản Duplicate
    const existingIndex = inventory.findIndex(p => p.post_id === newDeliverableId);
    
    const deliverableObj = {
        post_id: newDeliverableId,
        source_idea_id: sourceIdeaId,
        delivery_format: deliveryFormat,
        target_channels: targetChannels,
        media_link: mediaLink,
        caption_link: captionLink,
        status: "pending_publish",
        created_at: new Date().toISOString(),
        published_data: {
            live_url: null,
            published_at: null
        }
    };

    if (existingIndex > -1) {
        inventory[existingIndex] = { ...inventory[existingIndex], ...deliverableObj };
    } else {
        inventory.push(deliverableObj);
    }
    
    fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2), 'utf8');
    console.log(`📦 [Warehouse Manager] Đã nhập rổ kho Thành phẩn (Post Asset: ${newDeliverableId}) sẵn sàng Publish.`);

    // 4. Update Trạng thái Báo Cáo về Kho Mẹ (Idea Bank) -> Completed
    if (fs.existsSync(ideaBankPath)) {
        let ideaBank = JSON.parse(fs.readFileSync(ideaBankPath, 'utf8'));
        // Tìm ý tưởng nếu nó tồn tại
        const matchedIdea = ideaBank.find(i => i.id === sourceIdeaId || ticketId.includes(i.id.split('_').pop()));
        if (matchedIdea && matchedIdea.lifecycle) {
            matchedIdea.lifecycle.publish_bundle_path = bundlePath; // Lưu path
            matchedIdea.lifecycle.status = 'COMPLETED';
            fs.writeFileSync(ideaBankPath, JSON.stringify(ideaBank, null, 2), 'utf8');
        }
    }
}

module.exports = { saveDeliverableAndPrunePipeline };
