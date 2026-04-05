import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RichText } from '../../components/RichText';

export const SingleTitleHook: React.FC<{ content: any }> = ({ content }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const slideUp = spring({ frame, fps, config: { damping: 12 } });

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <h1 style={{ 
                fontSize: 65, 
                color: '#FFFFFF', 
                fontWeight: 'bold',
                textAlign: 'center', 
                zIndex: 1, 
                textTransform: 'capitalize',
                padding: '0 80px', 
                transform: `translateY(${interpolate(slideUp, [0, 1], [100, 0])}px)`,
                opacity: slideUp,
                lineHeight: 1.3,
                whiteSpace: 'pre-wrap'
            }}>
                <RichText text={content.headline || "Tiêu đề Tò mò"} staggerDelay={4} brandAccent={content.brand_accent} themeType="headline" />
            </h1>
        </AbsoluteFill>
    );
};
