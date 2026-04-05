import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img } from 'remotion';
import { RichText } from '../../components/RichText';

// @ts-ignore
import brandConfig from '../../../brand_config.json';

export const SinglePodcastWave: React.FC<{ content: any; scene?: any }> = ({ content, scene }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const slideUp = spring({ frame, fps, config: { damping: 15 } });

    // Podcast waveform generation
    const numBars = 12;
    const bars = new Array(numBars).fill(0).map((_, i) => {
        // Pseudo-random height varying over time
        const baseHeight = 30 + Math.sin(frame / (5 + i)) * 20;
        const height = baseHeight + Math.cos(frame / (4 + i%3)) * 30;
        return Math.max(10, height);
    });

    const fallbackAvatar = 'https://dummyimage.com/300x300/333/fff&text=Avatar';
    // Đảm bảo chỉ dùng Avatar cá nhân của người dùng (từ media-input), BỎ QUA các ảnh liên quan tới keyword!
    const avatarUrl = scene?.brand_avatar || fallbackAvatar;
    const brandFounder = brandConfig.brand_identity?.founder || 'Podcast Host';

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 80px' }}>
            
            {/* Cụm Avatar & Waveform */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                transform: `translateY(${interpolate(slideUp, [0, 1], [-100, 0])}px)`,
                opacity: slideUp,
                marginBottom: 80
            }}>
                <div style={{
                    width: 300, height: 300, borderRadius: '50%',
                    border: `10px solid ${content.brand_accent || '#B6FF00'}`,
                    overflow: 'hidden',
                    boxShadow: `0 0 50px rgba(182, 255, 0, 0.3)`,
                    marginBottom: 50
                }}>
                    <Img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {/* Waveform */}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', height: '100px' }}>
                    {bars.map((h, i) => (
                        <div key={i} style={{
                            width: 15,
                            height: h,
                            backgroundColor: content.brand_accent || '#B6FF00',
                            borderRadius: 10,
                            opacity: 0.8
                        }} />
                    ))}
                </div>

                <div style={{ marginTop: 30, fontSize: 35, color: '#AAA', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 }}>
                    {brandFounder}
                </div>
            </div>

            {/* Nội dung Podcast / Trích dẫn */}
            <h1 style={{ 
                fontSize: 60, 
                color: '#FFFFFF', 
                fontWeight: 'bold',
                textAlign: 'center', 
                zIndex: 1, 
                lineHeight: 1.4,
                opacity: slideUp,
                whiteSpace: 'pre-wrap'
            }}>
                <RichText text={content.headline || "Tiêu đề Podcast"} staggerDelay={3} brandAccent={content.brand_accent} themeType="headline" />
            </h1>

        </AbsoluteFill>
    );
};
