import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RichText } from '../../components/RichText';

export const SingleQuoteBox: React.FC<{ content: any }> = ({ content }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const slideUp = spring({ frame, fps, config: { damping: 12 } });

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 80 }}>
            <div style={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                border: '4px solid #333',
                borderRadius: 40, padding: '100px 80px', width: '100%',
                position: 'relative',
                opacity: slideUp, 
                transform: `scale(${interpolate(slideUp, [0, 1], [0.8, 1])})`
            }}>
                <div style={{ position: 'absolute', top: -140, left: 60, fontSize: 250, color: content.brand_accent || '#B6FF00', lineHeight: 1 }}>"</div>
                <div style={{ 
                    fontSize: 45, 
                    fontWeight: 'bold', 
                    color: '#FFF', 
                    lineHeight: 1.5, 
                    textAlign: 'left',
                    whiteSpace: 'pre-wrap'
                }}>
                    <RichText text={content.headline || content.quote || "Nội dung trích dẫn"} />
                </div>
                {content.author && (
                    <div style={{ fontSize: 45, color: '#aaa', marginTop: 60, textAlign: 'right', fontStyle: 'italic' }}>
                        - {content.author}
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};
