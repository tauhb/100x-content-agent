import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RichText } from '../../components/RichText';

export const SingleMinimalWarning: React.FC<{ content: any }> = ({ content }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    
    // Nảy khung cảnh báo
    const popAlert = spring({ frame, fps, config: { damping: 10, stiffness: 200 } });
    
    // Tim đập khung cảnh báo (Pulse effect)
    const pulsate = Math.sin(frame / 6) * 10 + 20;

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 80px' }}>
            <div style={{
                backgroundColor: 'rgba(255, 0, 0, 0.15)',
                border: '8px solid #FF3366',
                borderRadius: 30,
                padding: '60px 50px',
                width: '100%',
                boxShadow: `0 0 ${pulsate}px rgba(255, 51, 102, 0.6), inset 0 0 ${pulsate}px rgba(255, 51, 102, 0.3)`,
                transform: `scale(${popAlert})`,
                opacity: popAlert,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '30px'
            }}>
                {/* Icon Cảnh báo */}
                <div style={{ 
                    backgroundColor: '#FF3366', 
                    color: '#FFF', 
                    padding: '10px 40px', 
                    borderRadius: 20, 
                    fontSize: 40, 
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: 3
                }}>
                    CẢNH BÁO
                </div>

                {/* Nội dung Cảnh báo */}
                <h1 style={{ 
                    fontSize: 60, 
                    color: '#FFFFFF', 
                    fontWeight: 'bold',
                    textAlign: 'center', 
                    lineHeight: 1.4,
                    margin: 0,
                    whiteSpace: 'pre-wrap'
                }}>
                    <RichText text={content.headline || "Đừng bao giờ làm điều này!"} staggerDelay={4} brandAccent={content.brand_accent} themeType="headline" />
                </h1>
            </div>
        </AbsoluteFill>
    );
};
