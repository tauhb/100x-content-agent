import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RichText } from '../../components/RichText';

export const SingleSplitCompare: React.FC<{ content: any }> = ({ content }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Slide half screens from top and bottom
    const slideTop = spring({ frame, fps, config: { damping: 15 } });
    const slideBottom = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 12 } });

    return (
        <AbsoluteFill style={{ flexDirection: 'column' }}>
            
            {/* TOP HALF: Vấn Đề (Vùng Tối) */}
            <div style={{
                flex: 1, backgroundColor: '#111111',
                transform: `translateY(${interpolate(slideTop, [0, 1], [-500, 0])}px)`,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', padding: '0 80px',
                borderBottom: '4px solid #333'
            }}>
                <div style={{ color: '#888', fontSize: 35, fontWeight: '800', marginBottom: 30, textTransform: 'uppercase', letterSpacing: 2 }}>
                    {content.left_title || 'Cách Làm Cũ'}
                </div>
                <h2 style={{ 
                    fontSize: 55, color: '#CCC', fontWeight: 'bold',
                    textAlign: 'center', margin: 0, lineHeight: 1.4, whiteSpace: 'pre-wrap'
                }}>
                    <RichText text={content.headline || "Nội dung cũ"} staggerDelay={0} />
                </h2>
            </div>
            
            {/* BOTTOM HALF: Giải Pháp (Vùng Sáng Accent) */}
            <div style={{
                flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
                transform: `translateY(${interpolate(slideBottom, [0, 1], [500, 0])}px)`,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', padding: '0 80px'
            }}>
                <div style={{ color: content.brand_accent || '#B6FF00', fontSize: 35, fontWeight: '900', marginBottom: 30, textTransform: 'uppercase', letterSpacing: 2 }}>
                    {content.right_title || 'Tư Duy Mới'}
                </div>
                <h2 style={{ 
                    fontSize: 65, color: '#FFF', fontWeight: '900',
                    textAlign: 'center', margin: 0, lineHeight: 1.4, whiteSpace: 'pre-wrap'
                }}>
                    {/* Bắt buộc phải gắn themeType="headline" cho nửa dưới để giật Accent mạnh */}
                    <RichText text={content.content?.[0] || "Nội dung giải pháp đột phá"} staggerDelay={3} brandAccent={content.brand_accent} themeType="headline" />
                </h2>
            </div>

            {/* Chữ VS chính giữa */}
            <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: `translate(-50%, -50%) scale(${slideBottom})`,
                backgroundColor: content.brand_accent || '#B6FF00',
                color: '#000',
                fontSize: 50, fontWeight: '900',
                width: 120, height: 120, borderRadius: '50%',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '8px solid #000'
            }}>
                VS
            </div>

        </AbsoluteFill>
    );
};
