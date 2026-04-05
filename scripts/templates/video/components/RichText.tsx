import React from 'react';
import { spring, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

// @ts-ignore
import brandConfig from '../../../../database/brand_config.json';

export const RichText: React.FC<{ text: string; staggerDelay?: number; brandAccent?: string }> = ({ text, staggerDelay = 2, brandAccent }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const colors = brandConfig.brand_identity?.colors || {};
    const finalAccent = brandAccent || colors.accent || '#B6FF00';
    const fonts = brandConfig.brand_identity?.fonts || { primary: 'Inter', accent: 'Playfair Display' };
    
    // 3. Regex Tách Câu thành các phân mảnh hạt: Chữ thường, **Highlight**, *Nghiêng*
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

    let globalWordIndex = 0;

    return (
        <React.Fragment>
            {parts.map((part, partIdx) => {
                if (!part) return null;
                
                let content = part;
                let styleToApply: React.CSSProperties = {
                    fontFamily: fonts.primary,
                };
                let isHighlight = false;

                // Parse Cú pháp Xung nhịp (Highlight Dạ Quang)
                if (part.startsWith('**') && part.endsWith('**')) {
                    content = part.slice(2, -2);
                    styleToApply = { 
                        fontFamily: fonts.accent,
                        backgroundColor: finalAccent, 
                        color: '#000', 
                        padding: '2px 10px', 
                        borderRadius: '8px',
                        fontStyle: 'italic',
                        fontWeight: '900',
                        margin: '0 4px',
                        display: 'inline-block',
                        lineHeight: '1.2'
                    };
                    isHighlight = true;
                } 
                // Parse Cú pháp Chữ Nghiêng (Italic Accent)
                else if (part.startsWith('*') && part.endsWith('*')) {
                    content = part.slice(1, -1);
                    styleToApply = {
                        fontFamily: fonts.accent,
                        fontStyle: 'italic',
                        color: finalAccent,
                        fontWeight: '600'
                    };
                }

                if (isHighlight) {
                    const delay = globalWordIndex * staggerDelay;
                    globalWordIndex += 1;
                    const pop = spring({ 
                        frame: Math.max(0, frame - delay), 
                        fps, 
                        config: { damping: 12, stiffness: 200 } 
                    });

                    return (
                        <span key={partIdx} style={{ 
                            ...styleToApply, 
                            opacity: pop,
                            transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])})`,
                            whiteSpace: 'pre-wrap',
                            verticalAlign: 'middle'
                        }}>
                            {content}
                        </span>
                    );
                }

                const words = content.split(/(\s+)/);
                return words.map((word, wIdx) => {
                    if (!word.trim()) {
                        return <span key={`${partIdx}-${wIdx}`}>{word}</span>;
                    }

                    const delay = globalWordIndex * staggerDelay;
                    globalWordIndex += 1;
                    const pop = spring({ 
                        frame: Math.max(0, frame - delay), 
                        fps, 
                        config: { damping: 12, stiffness: 180 } 
                    });

                    return (
                        <span key={`${partIdx}-${wIdx}`} style={{ 
                            ...styleToApply, 
                            display: 'inline-block',
                            opacity: pop,
                            transform: `scale(${interpolate(pop, [0, 1], [0.9, 1])})`
                        }}>
                            {word}
                        </span>
                    );
                });
            })}
        </React.Fragment>
    );
};
