import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { RichText } from '../../ui/RichText';
import {
    TYPE, SPRING, TIMING, SPACE, COLOR, Z, SceneBg,
} from '../../foundation';

interface LogicDiagramProps {
    type: 'loop' | 'flow' | 'pyramid';
    nodes: string[];
    brandAccent?: string;
}

export const LogicDiagram: React.FC<LogicDiagramProps> = ({
    type,
    nodes,
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const { fontFamily: sansFont }  = loadInter();
    const { fontFamily: serifFont } = loadPlayfair();

    const renderLoop = () => {
        const radius  = 250;
        const centerX = width / 2;
        const centerY = height / 2 - 50;

        return (
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <circle cx={centerX} cy={centerY} r={radius}
                    fill="none" stroke={brandAccent} strokeWidth="4"
                    strokeDasharray="10 10" opacity={0.3}
                />

                {nodes.map((node, i) => {
                    const angle = (i * 2 * Math.PI) / nodes.length - Math.PI / 2;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);

                    const nodeDelay = i * TIMING.slow / 2;
                    const nodeScale = spring({ frame: Math.max(0, frame - nodeDelay), fps, config: SPRING.snappy });

                    const pathProgress = interpolate(
                        frame - nodeDelay - TIMING.stagger * 2,
                        [0, TIMING.fast * 2.5], [0, 1],
                        { extrapolateRight: 'clamp' }
                    );

                    const nextAngle = ((i + 1) * 2 * Math.PI) / nodes.length - Math.PI / 2;
                    const startX = centerX + (radius + 20) * Math.cos(angle + 0.3);
                    const startY = centerY + (radius + 20) * Math.sin(angle + 0.3);
                    const endX   = centerX + (radius + 20) * Math.cos(nextAngle - 0.3);
                    const endY   = centerY + (radius + 20) * Math.sin(nextAngle - 0.3);

                    return (
                        <g key={i}>
                            <circle cx={x} cy={y} r="80"
                                fill={COLOR.darkCard} stroke={brandAccent} strokeWidth="3"
                                style={{ transform: `scale(${nodeScale})`, transformOrigin: `${x}px ${y}px` }}
                            />
                            <text
                                x={x} y={y}
                                textAnchor="middle" alignmentBaseline="middle"
                                fill={COLOR.white}
                                fontSize={TYPE.caption.size + 2}
                                fontWeight="bold"
                                fontFamily={sansFont}
                                style={{ opacity: nodeScale, transform: `scale(${nodeScale})`, transformOrigin: `${x}px ${y}px` }}
                            >
                                {node}
                            </text>

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
                        </g>
                    );
                })}
            </svg>
        );
    };

    const renderFlow = () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: `${SPACE.gapLg}px`, width: '100%' }}>
            {nodes.map((node, i) => {
                const delay = i * TIMING.medium + TIMING.fast;
                const scale = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.normal });

                return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${SPACE.gap}px` }}>
                        <div style={{
                            padding: `30px 60px`,
                            background: 'rgba(255,255,255,0.05)',
                            border: `2px solid ${brandAccent}`,
                            borderRadius: '20px',
                            fontSize: `${TYPE.body.size}px`,
                            fontWeight: TYPE.body.weight + 300,
                            color: COLOR.white,
                            fontFamily: sansFont,
                            transform: `scale(${scale})`,
                            opacity: scale,
                        }}>
                            <RichText text={node} brandAccent={brandAccent} themeType="body" staggerDelay={2} />
                        </div>
                        {i < nodes.length - 1 && (
                            <div style={{
                                height: '40px',
                                width: '4px',
                                background: brandAccent,
                                opacity: interpolate(frame - delay - TIMING.stagger * 2, [0, TIMING.fast], [0, 1], { extrapolateRight: 'clamp' }),
                            }} />
                        )}
                    </div>
                );
            })}
        </div>
    );

    const renderPyramid = () => (
        <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: `0 ${SPACE.padH}px`, width: '100%' }}>
            {nodes.map((node, i) => {
                const delay = i * (TIMING.medium + 2);
                const scale = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.normal });

                const widthPct  = 40 + (i / Math.max(nodes.length - 1, 1)) * 55;
                const isTop     = i === nodes.length - 1;
                const fontSize  = Math.max(TYPE.caption.size + 6, TYPE.body.size + 4 - i * 3);

                return (
                    <div key={i} style={{
                        width: `${widthPct}%`,
                        padding: `28px 20px`,
                        background: isTop ? brandAccent : `rgba(255,255,255,${0.04 + i * 0.03})`,
                        border: `2px solid ${isTop ? brandAccent : brandAccent + '55'}`,
                        borderRadius: '14px',
                        textAlign: 'center',
                        fontSize: `${fontSize}px`,
                        fontWeight: 'bold',
                        color: isTop ? COLOR.black : COLOR.white,
                        fontFamily: isTop ? serifFont : sansFont,
                        opacity: scale,
                        transform: `scaleX(${scale})`,
                        boxShadow: isTop ? `0 0 40px ${brandAccent}66` : 'none',
                    }}>
                        <RichText text={node} brandAccent={isTop ? COLOR.black : brandAccent} themeType="body" staggerDelay={2} />
                    </div>
                );
            })}
        </div>
    );

    return (
        <AbsoluteFill>
            <SceneBg.Dark />
            {/* Accent glow at top */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at 50% 0%, ${brandAccent}0A 0%, transparent 60%)`,
            }} />
            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop:    `${SPACE.safeTop}px`,
                paddingBottom: `${SPACE.safeBottom}px`,
                zIndex:        Z.content,
            }}>
                {type === 'loop'    && renderLoop()}
                {type === 'flow'    && renderFlow()}
                {type === 'pyramid' && renderPyramid()}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
