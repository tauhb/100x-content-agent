import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RichText } from '../../components/RichText';

// @ts-ignore
import brandConfig from '../../../brand_config.json';

export const SingleTweetOverlay: React.FC<{ scene: any }> = ({ scene }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const content = scene.visual_content;
    const brandHandle = scene.brand_handle || brandConfig.brand_identity?.handle || '@hoangbatau';
    const brandName = scene.brand_name || brandConfig.founder || 'Hoàng Bá Tầu';
    
    // Nảy Box lên
    const popBox = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
    const translateY = interpolate(popBox, [0, 1], [50, 0]);

    // Lấy Avatar từ props (Base64) hoặc fallback
    const avatarImg = scene.brand_avatar || scene.brand_logo || '';

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 80px' }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 40,
                padding: '60px',
                width: '100%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                transform: `scale(${popBox}) translateY(${translateY}px)`,
                opacity: popBox,
                display: 'flex',
                flexDirection: 'column',
                gap: '40px'
            }}>
                {/* Header: Avatar & Tên */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    <div style={{ width: 100, height: 100, backgroundColor: '#333', borderRadius: '50%', overflow: 'hidden' }}>
                        {/* Logo lấy từ Props Base64 để tránh CORS */}
                        {avatarImg ? (
                            <img 
                                src={avatarImg} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                        ) : null}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 45, fontWeight: 'bold', color: '#000' }}>
                            {content.author || brandName}
                        </span>
                        <span style={{ fontSize: 35, color: '#666' }}>
                            {content.handle || brandHandle}
                        </span>
                    </div>
                </div>

                {/* Body: Tweet Text */}
                <div style={{ fontSize: 45, color: '#000', lineHeight: 1.4, fontWeight: '500', whiteSpace: 'pre-wrap' }}>
                    {/* Reverse màu dạ quang cho hợp nền trắng */}
                    <div style={{ color: '#000' }}>
                        <RichText text={content.headline || "Nội dung Tweet mặc định."} staggerDelay={3} brandAccent={scene.brand_accent} />
                    </div>
                </div>

                {/* Footer: Stats giả lập */}
                <div style={{ display: 'flex', gap: '50px', borderTop: '2px solid #EEE', paddingTop: '25px', color: '#888', fontSize: 30 }}>
                    <span>10:45 AM</span>
                    <span>14.2K Lượt xem</span>
                </div>
            </div>
        </AbsoluteFill>
    );
};
