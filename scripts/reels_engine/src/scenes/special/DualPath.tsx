import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { COLOR } from '../../foundation';

/**
 * DualPath — Hai con đường đối lập với nhân vật stickman
 *
 * Archetype: DUAL_PATH
 * Style: Nền đen, 2 đường cong SVG được vẽ dần, nhân vật stickman trên mỗi đường
 *
 * Ý tưởng: "Choose Your Hard" — đường khó bây giờ → dễ sau, đường dễ bây giờ → khó sau
 *
 * Props: title, path_a{label_start, label_end, color}, path_b{...}, show_figure
 */

interface PathConfig {
    label_start?: string;
    label_end?: string;
    color?: string;
}

interface DualPathProps {
    title?: string;
    path_a?: PathConfig;
    path_b?: PathConfig;
    show_figure?: boolean;
    brandAccent?: string;
}

// Simple stickman SVG group
const Stickman: React.FC<{ color: string; glow?: boolean }> = ({ color, glow = false }) => (
    <g>
        {/* Head */}
        <circle cx="0" cy="-30" r="11" fill={color} />
        {/* Body */}
        <line x1="0" y1="-19" x2="0" y2="4" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
        {/* Arms */}
        <line x1="0" y1="-10" x2="-14" y2="-1" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
        <line x1="0" y1="-10" x2="14" y2="-3" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
        {/* Legs — walking pose */}
        <line x1="0" y1="4" x2="-11" y2="20" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
        <line x1="0" y1="4" x2="11" y2="18" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
    </g>
);

export const DualPath: React.FC<DualPathProps> = ({
    title = 'Lựa Chọn Của Bạn',
    path_a = { label_start: 'Khó Hôm Nay', label_end: 'Dễ Về Sau', color: '#FF4444' },
    path_b = { label_start: 'Dễ Hôm Nay', label_end: 'Khó Về Sau', color: '#EEEEEE' },
    show_figure = true,
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const { fontFamily } = loadInter();

    const W = 900;
    const H = 680;

    const colorA = path_a.color || '#FF4444';
    const colorB = path_b.color || '#EEEEEE';

    // Draw animation: paths draw themselves progressively
    const drawProgress = interpolate(frame, [8, durationInFrames - 10], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });

    const titleOpacity  = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
    const startLabelOp  = interpolate(frame, [5, 22], [0, 1], { extrapolateRight: 'clamp' });
    const endLabelOp    = interpolate(drawProgress, [0.72, 0.95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const figureOpacity = interpolate(frame, [18, 32], [0, 1], { extrapolateRight: 'clamp' });

    // Path A: "Hard Now → Easy Later"
    // Starts mid-left, climbs to a peak around 35%, then slopes gently down to right
    const PA = `M 30 ${H * 0.46} C 120 ${H * 0.46}, 200 ${H * 0.13}, 340 ${H * 0.18} C 480 ${H * 0.23}, 600 ${H * 0.3}, ${W - 30} ${H * 0.28}`;
    const PA_LEN = 1280; // estimated

    // Path B: "Easy Now → Hard Later"
    // Starts mid-left, slopes slightly down/flat for first half, then steep climb right
    const PB = `M 30 ${H * 0.54} C 150 ${H * 0.54}, 280 ${H * 0.68}, 430 ${H * 0.74} C 560 ${H * 0.79}, 720 ${H * 0.7}, ${W - 30} ${H * 0.62}`;
    const PB_LEN = 1200; // estimated

    // Stickman A position: along path A, around t=0.3 segment
    // Approximate: at x≈220, y follows the curve
    const figAX = 230;
    const figAY = interpolate(230, [30, 340], [H * 0.46, H * 0.18]);

    // Stickman B position: along path B, around t=0.3 segment
    const figBX = 230;
    const figBY = interpolate(230, [30, 430], [H * 0.54, H * 0.74]);

    return (
        <AbsoluteFill style={{
            background: '#050505',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '100px',
            paddingBottom: '400px',
            flexDirection: 'column',
        }}>

            {/* Title */}
            {title && (
                <div style={{
                    fontFamily,
                    fontSize: '54px',
                    fontWeight: '700',
                    color: 'white',
                    letterSpacing: '2px',
                    opacity: titleOpacity,
                    marginBottom: '16px',
                    textAlign: 'center',
                }}>
                    {title}
                </div>
            )}

            <svg viewBox={`0 0 ${W} ${H}`} width="92%" overflow="visible">
                <defs>
                    <filter id="dpGlowA" x="-60%" y="-60%" width="220%" height="220%">
                        <feDropShadow dx="0" dy="0" stdDeviation="5"  floodColor={colorA} floodOpacity="0.9" />
                        <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor={colorA} floodOpacity="0.4" />
                    </filter>
                    <filter id="dpGlowB" x="-60%" y="-60%" width="220%" height="220%">
                        <feDropShadow dx="0" dy="0" stdDeviation="5"  floodColor={colorB} floodOpacity="0.7" />
                        <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor={colorB} floodOpacity="0.3" />
                    </filter>
                    <filter id="dpGlowFA" x="-100%" y="-100%" width="300%" height="300%">
                        <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={colorA} floodOpacity="0.95" />
                    </filter>
                    <filter id="dpGlowFB" x="-100%" y="-100%" width="300%" height="300%">
                        <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={colorB} floodOpacity="0.75" />
                    </filter>
                </defs>

                {/* === PATH A === */}
                {/* Glow behind */}
                <path d={PA} fill="none" stroke={colorA} strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={PA_LEN} strokeDashoffset={PA_LEN * (1 - drawProgress)}
                    filter="url(#dpGlowA)" opacity={0.45}
                />
                {/* Main */}
                <path d={PA} fill="none" stroke={colorA} strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={PA_LEN} strokeDashoffset={PA_LEN * (1 - drawProgress)}
                />

                {/* === PATH B === */}
                <path d={PB} fill="none" stroke={colorB} strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={PB_LEN} strokeDashoffset={PB_LEN * (1 - drawProgress)}
                    filter="url(#dpGlowB)" opacity={0.35}
                />
                <path d={PB} fill="none" stroke={colorB} strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={PB_LEN} strokeDashoffset={PB_LEN * (1 - drawProgress)}
                />

                {/* === STICKMEN === */}
                {show_figure && drawProgress > 0.18 && (
                    <>
                        <g
                            transform={`translate(${figAX}, ${figAY})`}
                            opacity={figureOpacity}
                            filter="url(#dpGlowFA)"
                        >
                            <Stickman color={colorA} />
                        </g>
                        <g
                            transform={`translate(${figBX}, ${figBY})`}
                            opacity={figureOpacity}
                            filter="url(#dpGlowFB)"
                        >
                            <Stickman color={colorB} />
                        </g>
                    </>
                )}

                {/* === START LABELS === */}
                {path_a.label_start && (
                    <text x="30" y={H * 0.39} fill={colorA}
                        fontSize="28" fontFamily={fontFamily} fontWeight="700"
                        opacity={startLabelOp}
                    >
                        {path_a.label_start}
                    </text>
                )}
                {path_b.label_start && (
                    <text x="30" y={H * 0.51} fill={colorB}
                        fontSize="28" fontFamily={fontFamily} fontWeight="700"
                        opacity={startLabelOp}
                    >
                        {path_b.label_start}
                    </text>
                )}

                {/* === END LABELS === */}
                {path_a.label_end && (
                    <text x={W - 240} y={H * 0.22} fill={colorA}
                        fontSize="26" fontFamily={fontFamily} fontWeight="600"
                        opacity={endLabelOp}
                    >
                        {path_a.label_end}
                    </text>
                )}
                {path_b.label_end && (
                    <text x={W - 240} y={H * 0.61} fill={colorB}
                        fontSize="26" fontFamily={fontFamily} fontWeight="600"
                        opacity={endLabelOp}
                    >
                        {path_b.label_end}
                    </text>
                )}
            </svg>
        </AbsoluteFill>
    );
};
