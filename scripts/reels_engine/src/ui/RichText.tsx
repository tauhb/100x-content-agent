import React from 'react';
import { spring, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

export const RichText: React.FC<{ text: string; staggerDelay?: number; brandAccent?: string; themeType?: 'headline' | 'body' }> = ({ text, staggerDelay = 2, brandAccent, themeType = 'body' }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const finalAccent = brandAccent || '#B6FF00';

    // --- v6.1: Load Font TRỰC TIẾP tại Component (Fix quy trình: Font luôn sẵn sàng) ---
    const { fontFamily: primaryFont } = loadInter();
    const { fontFamily: accentFont } = loadPlayfair();

    // --- v6.1: Xử lý \n thành mảng dòng, rồi parse từng dòng ---
    const lines = text.split('\n');

    let globalWordIndex = 0;

    const renderLine = (line: string, lineIdx: number) => {
        // Regex Tách Câu thành các phân mảnh hạt (Chỉ bắt 1 dấu sao * theo đúng chuẩn SSoT)
        const parts = line.split(/(\*[^*\n]+\*)/g);

        return parts.map((part, partIdx) => {
            if (!part) return null;

            let content = part;
            let styleToApply: React.CSSProperties = {
                fontFamily: primaryFont,
            };
            let isHighlight = false;

            // Parse Cú pháp SSoT: *Từ khóa*
            if (part.startsWith('*') && part.endsWith('*')) {
                content = part.slice(1, -1);
                isHighlight = true;
                
                if (themeType === 'headline') {
                    // Dành cho Tiêu Đề: Nền dạ quang chữ trắng
                    styleToApply = {
                        fontFamily: accentFont,
                        backgroundColor: `color-mix(in srgb, ${finalAccent} 80%, transparent)`,
                        color: '#FFFFFF',
                        padding: '2px 12px',
                        borderRadius: '8px',
                        fontWeight: '900',
                        margin: '0 4px',
                        display: 'inline',
                        verticalAlign: 'baseline',
                        lineHeight: 'inherit',
                    };
                } else {
                    // Dành cho Body Content: Viết thường, in nghiêng, màu accent
                    styleToApply = {
                        fontFamily: accentFont,
                        fontStyle: 'italic',
                        color: finalAccent,
                        fontWeight: '600',
                        textTransform: 'lowercase'
                    };
                }
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
                    <span key={`${lineIdx}-${partIdx}`} style={{
                        ...styleToApply,
                        opacity: pop,
                        transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])})`,
                        whiteSpace: 'pre-wrap',
                        display: 'inline',
                        verticalAlign: 'baseline',
                    }}>
                        {content}
                    </span>
                );
            }

            const words = content.split(/(\s+)/);
            return words.map((word, wIdx) => {
                if (!word.trim()) {
                    return <span key={`${lineIdx}-${partIdx}-${wIdx}`}>{word}</span>;
                }

                const delay = globalWordIndex * staggerDelay;
                globalWordIndex += 1;
                const pop = spring({
                    frame: Math.max(0, frame - delay),
                    fps,
                    config: { damping: 12, stiffness: 180 }
                });

                return (
                    <span key={`${lineIdx}-${partIdx}-${wIdx}`} style={{
                        ...styleToApply,
                        display: 'inline-block',
                        opacity: pop,
                        transform: `scale(${interpolate(pop, [0, 1], [0.9, 1])})`
                    }}>
                        {word}
                    </span>
                );
            });
        });
    };

    return (
        <React.Fragment>
            {lines.map((line, lineIdx) => (
                <React.Fragment key={lineIdx}>
                    {lineIdx > 0 && <br />}
                    {renderLine(line, lineIdx)}
                </React.Fragment>
            ))}
        </React.Fragment>
    );
};

