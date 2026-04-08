import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { RichText } from '../components/RichText';

interface LogicDiagramProps {
    type: 'loop' | 'flow' | 'pyramid';
    nodes: string[];
    brandAccent?: string;
}

export const LogicDiagram: React.FC<LogicDiagramProps> = ({ type, nodes, brandAccent = '#B6FF00' }) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const { fontFamily: primaryFont } = loadInter();
    const { fontFamily: accentFont } = loadPlayfair();

    const renderLoop = () => {
        const radius = 250;
        const centerX = width / 2;
        const centerY = height / 2 - 50;

        return (
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* Đường tròn chính (Dưới các node) */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke={brandAccent}
                    strokeWidth="4"
                    strokeDasharray="10 10"
                    opacity={0.3}
                />

                {nodes.map((node, i) => {
                    const angle = (i * 2 * Math.PI) / nodes.length - Math.PI / 2;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);

                    // Animation xuất hiện từng Node
                    const nodeDelay = i * 15;
                    const nodeScale = spring({
                        frame: Math.max(0, frame - nodeDelay),
                        fps,
                        config: { damping: 12, stiffness: 200 }
                    });

                    return (
                        <g key={i}>
                            {/* Circle cho Node */}
                            <circle
                                cx={x}
                                cy={y}
                                r="80"
                                fill="#111"
                                stroke={brandAccent}
                                strokeWidth="3"
                                style={{ transform: `scale(${nodeScale})`, transformOrigin: `${x}px ${y}px` }}
                            />
                            {/* Text cho Node */}
                            <text
                                x={x}
                                y={y}
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fill="white"
                                fontSize="28"
                                fontWeight="bold"
                                fontFamily={primaryFont}
                                style={{ opacity: nodeScale, transform: `scale(${nodeScale})`, transformOrigin: `${x}px ${y}px` }}
                            >
                                {node}
                            </text>
                            
                            {/* Mũi tên cong nối các node */}
                            {i < nodes.length && (() => {
                                const nextAngle = ((i + 1) * 2 * Math.PI) / nodes.length - Math.PI / 2;
                                const startX = centerX + (radius + 20) * Math.cos(angle + 0.3);
                                const startY = centerY + (radius + 20) * Math.sin(angle + 0.3);
                                const endX = centerX + (radius + 20) * Math.cos(nextAngle - 0.3);
                                const endY = centerY + (radius + 20) * Math.sin(nextAngle - 0.3);
                                
                                const pathProgress = interpolate(frame - nodeDelay - 10, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
                                
                                return (
                                    <path
                                        d={`M ${startX} ${startY} A ${radius + 20} ${radius + 20} 0 0 1 ${endX} ${endY}`}
                                        fill="none"
                                        stroke={brandAccent}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeDasharray="1000"
                                        strokeDashoffset={1000 * (1 - pathProgress)}
                                        opacity={0.6}
                                    />
                                );
                            })()}
                        </g>
                    );
                })}
            </svg>
        );
    };

    const renderFlow = () => {

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '40px' }}>
                {nodes.map((node, i) => {
                    const delay = i * 20;
                    const scale = spring({
                        frame: Math.max(0, frame - delay),
                        fps,
                    });

                    return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                            <div style={{
                                padding: '30px 60px',
                                background: 'rgba(255,255,255,0.05)',
                                border: `2px solid ${brandAccent}`,
                                borderRadius: '20px',
                                fontSize: '40px',
                                fontWeight: 'bold',
                                color: 'white',
                                fontFamily: primaryFont,
                                transform: `scale(${scale})`,
                                opacity: scale
                            }}>
                                <RichText text={node} brandAccent={brandAccent} themeType="body" staggerDelay={2} />
                            </div>
                            {i < nodes.length - 1 && (
                                <div style={{ 
                                    height: '40px', 
                                    width: '4px', 
                                    background: brandAccent, 
                                    opacity: interpolate(frame - delay - 10, [0, 10], [0, 1]) 
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderPyramid = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', padding: '120px 80px' }}>
                {nodes.map((node, i) => {
                    const delay = i * 18;
                    const scale = spring({
                        frame: Math.max(0, frame - delay),
                        fps,
                        config: { damping: 14, stiffness: 160 },
                    });
                    // Tầng dưới cùng (i=0) rộng nhất, tầng trên (i=n-1) hẹp nhất
                    const widthPct = 40 + (i / Math.max(nodes.length - 1, 1)) * 55;

                    return (
                        <div
                            key={i}
                            style={{
                                width: `${widthPct}%`,
                                padding: '28px 20px',
                                background: i === nodes.length - 1
                                    ? brandAccent
                                    : `rgba(255,255,255,${0.04 + i * 0.03})`,
                                border: `2px solid ${i === nodes.length - 1 ? brandAccent : brandAccent + '55'}`,
                                borderRadius: '14px',
                                textAlign: 'center',
                                fontSize: `${44 - i * 3}px`,
                                fontWeight: 'bold',
                                color: i === nodes.length - 1 ? '#000' : 'white',
                                fontFamily: i === nodes.length - 1 ? accentFont : primaryFont,
                                opacity: scale,
                                transform: `scaleX(${scale})`,
                                boxShadow: i === nodes.length - 1 ? `0 0 40px ${brandAccent}66` : 'none',
                            }}
                        >
                            <RichText text={node} brandAccent={i === nodes.length - 1 ? '#000' : brandAccent} themeType="body" staggerDelay={2} />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            {type === 'loop' && renderLoop()}
            {type === 'flow' && renderFlow()}
            {type === 'pyramid' && renderPyramid()}
        </AbsoluteFill>
    );
};
