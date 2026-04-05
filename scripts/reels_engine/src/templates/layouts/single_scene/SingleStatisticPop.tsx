import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RichText } from '../../components/RichText';

export const SingleStatisticPop: React.FC<{ content: any }> = ({ content }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    
    // Đập to con số
    const popNumber = spring({ frame, fps, config: { damping: 10, stiffness: 150 } });
    // Trượt text lên
    const slideText = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 12 } });

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 80px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                {/* Con số Siêu to khổng lồ */}
                <span style={{
                    fontSize: 250,
                    fontWeight: '900',
                    color: content.brand_accent || '#B6FF00',
                    textShadow: `0 0 80px ${content.brand_accent || '#B6FF00'}66`,
                    transform: `scale(${popNumber})`,
                    opacity: popNumber,
                    lineHeight: 1
                }}>
                    {content.stat_number || "99%"}
                </span>

                {/* Dòng Headline Giải thích */}
                <h1 style={{ 
                    fontSize: 55, 
                    color: '#FFFFFF', 
                    fontWeight: 'bold',
                    textAlign: 'center', 
                    textTransform: 'capitalize',
                    transform: `translateY(${interpolate(slideText, [0, 1], [50, 0])}px)`,
                    opacity: slideText,
                    lineHeight: 1.3,
                    whiteSpace: 'pre-wrap'
                }}>
                    <RichText text={content.headline || "Người khởi nghiệp bỏ cuộc năm đầu"} staggerDelay={2} />
                </h1>
            </div>
        </AbsoluteFill>
    );
};
