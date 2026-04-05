import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RichText } from '../../components/RichText';

export const SingleListCascade: React.FC<{ content: any }> = ({ content }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const slideUp = spring({ frame, fps, config: { damping: 12 } });

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 80px' }}>
            <h2 style={{ 
                fontSize: 80, 
                color: content.brand_accent || '#B6FF00', 
                fontWeight: 'bold',
                textAlign: 'center', 
                marginBottom: 80, 
                textTransform: 'capitalize',
                opacity: slideUp, 
                transform: `translateY(${interpolate(slideUp, [0, 1], [-50, 0])}px)`
            }}>
                <RichText text={content.headline || "TIÊU ĐỀ DANH SÁCH"} staggerDelay={2} brandAccent={content.brand_accent} themeType="headline" />
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
                {(content.bullets || content.list || []).map((item: string, idx: number) => {
                    const delay = idx * 60; // 2 seconds per item
                    const itemSlide = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12 } });
                    
                    // Dim effect: Current item is 1, past items dim to 0.4. Future items are 0.
                    let opacityVal = itemSlide;
                    if (frame > delay + 60) {
                        opacityVal = interpolate(frame, [delay + 60, delay + 90], [1, 0.4], { extrapolateRight: 'clamp' });
                    }

                    return (
                        <div key={idx} style={{ 
                            fontSize: 45, color: '#FFF',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            padding: '30px', borderRadius: 20,
                            borderLeft: `10px solid ${content.brand_accent || '#B6FF00'}`,
                            opacity: opacityVal, 
                            transform: `translateX(${interpolate(itemSlide, [0, 1], [-100, 0])}px)`,
                            whiteSpace: 'pre-wrap',
                            transition: 'opacity 0.3s'
                        }}>
                            <RichText text={item} staggerDelay={2} brandAccent={content.brand_accent} />
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};
