import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

interface CodeTerminalProps {
    lines: string[];
    brandAccent?: string;
    title?: string;
}

// Render inline *keyword* emphasis cho terminal (không animation — giữ monospace feel)
const renderTerminalLine = (text: string, brandAccent: string, accentFont: string) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('*') && part.endsWith('*')) {
            return (
                <span key={idx} style={{
                    color: brandAccent,
                    fontStyle: 'italic',
                    fontFamily: accentFont,
                    fontWeight: '700',
                }}>
                    {part.slice(1, -1)}
                </span>
            );
        }
        return <span key={idx}>{part}</span>;
    });
};

export const CodeTerminal: React.FC<CodeTerminalProps> = ({ lines, brandAccent = '#B6FF00', title = "TERMINAL v1.0" }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: primaryFont } = loadInter();
    const { fontFamily: accentFont } = loadPlayfair();

    const renderLines = () => {
        return lines.map((line, i) => {
            const delay = i * 15;
            // Dùng text thuần (strip markers) để tính chiều dài typing
            const cleanLine = line.replace(/\*([^*]+)\*/g, '$1');
            const charsToShow = Math.floor(interpolate(frame - delay, [0, 20], [0, cleanLine.length], { extrapolateRight: 'clamp' }));
            const isFullyTyped = charsToShow >= cleanLine.length;

            if (charsToShow <= 0) return null;

            const isOutput = line.startsWith('>');
            const lineColor = isOutput ? brandAccent : 'white';

            return (
                <div key={i} style={{
                    fontFamily: 'monospace',
                    fontSize: '32px',
                    color: lineColor,
                    marginBottom: '15px',
                    lineHeight: '1.4',
                    display: 'flex',
                    gap: '20px'
                }}>
                    <span style={{ opacity: 0.3, minWidth: '30px' }}>{i + 1}</span>
                    <span>
                        {isFullyTyped
                            ? renderTerminalLine(line, brandAccent, accentFont)
                            : cleanLine.substring(0, charsToShow)
                        }
                    </span>
                    {!isFullyTyped && (
                        <span style={{ width: '15px', height: '35px', background: brandAccent, display: 'inline-block', verticalAlign: 'middle', animation: 'blink 0.5s infinite' }} />
                    )}
                </div>
            );
        });
    };

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '100px' }}>
            <div style={{ 
                width: '90%', 
                background: 'rgba(0,0,0,0.85)', 
                backdropFilter: 'blur(20px)',
                borderRadius: '25px',
                border: `1px solid rgba(255,255,255,0.1)`,
                overflow: 'hidden',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
            }}>
                {/* Header Terminal */}
                <div style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '20px 40px', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#FF5F56' }} />
                        <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#FFBD2E' }} />
                        <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#27C93F' }} />
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px', fontFamily: primaryFont }}>{title}</span>
                </div>
                
                {/* Body Content */}
                <div style={{ padding: '50px', minHeight: '400px' }}>
                    {renderLines()}
                </div>
            </div>
            
            <style>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </AbsoluteFill>
    );
};
