import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * SETUP_PYRAMID — Kim tự tháp xây từng tầng từ đáy lên
 *
 * Archetype: SETUP_PYRAMID
 * Act: 2 — SETUP
 *
 * Design rules:
 *   - Các tầng xây từ đáy lên (animation reverse order)
 *   - Mỗi tầng là hình thang SVG trapezoid
 *   - Tầng đỉnh màu đậm nhất (brandAccent), xuống dưới mờ dần
 *   - Label text centered trong mỗi tầng
 *   - Tối đa 4 tầng
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "SETUP_PYRAMID",
 *   "scene_rhythm": "slow",
 *   "voice_text": "Kim tự tháp tự do tài chính — bạn đang ở tầng nào?",
 *   "props": {
 *     "headline": "Kim Tự Tháp Tài Chính",
 *     "layers": [
 *       { "label": "Tự do tài chính", "sub": "Passive income ≥ Chi phí" },
 *       { "label": "Đầu tư", "sub": "Tài sản sinh lời" },
 *       { "label": "Tiết kiệm", "sub": "20% thu nhập" },
 *       { "label": "Thu nhập", "sub": "Nền tảng đầu tiên" }
 *     ],
 *     "brandAccent": "#B6FF00"
 *   }
 * }
 */

interface PyramidLayer {
    label: string;
    sub?: string;
}

interface SetupPyramidProps {
    headline?: string;
    layers?: PyramidLayer[];
    brandAccent?: string;
}

export const SetupPyramid: React.FC<SetupPyramidProps> = ({
    headline    = 'Kim Tự Tháp Tài Chính',
    layers      = [
        { label: 'Tự do tài chính', sub: 'Passive income ≥ Chi phí' },
        { label: 'Đầu tư', sub: 'Tài sản sinh lời' },
        { label: 'Tiết kiệm', sub: '20% thu nhập' },
        { label: 'Thu nhập', sub: 'Nền tảng đầu tiên' },
    ],
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    const safeLayers = layers.slice(0, 4);
    const count = safeLayers.length;

    // ── Headline ─────────────────────────────────────────────
    const hlSp = spring({ frame: Math.max(0, frame), fps, config: SPRING.snappy });
    const hlTy = interpolate(hlSp, [0, 1], [-40, 0]);
    const hlOp = interpolate(hlSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

    // Pyramid geometry
    const totalW = 800;
    const layerH = 110;
    const narrowStep = Math.floor(((totalW - 460) / 2) / Math.max(count - 1, 1));
    const gapBetween = 4;

    // Layer opacity by position (index 0 = top/peak = most opaque)
    const layerOpacities = [1.0, 0.75, 0.5, 0.3];

    return (
        <AbsoluteFill>
            <SceneBg.Dark />

            {/* Ambient glow bottom */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at 50% 80%, ${brandAccent}0a 0%, transparent 60%)`,
                pointerEvents: 'none',
            }} />

            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems:     'center',
                paddingTop:     SPACE.safeTop,
                paddingBottom:  SPACE.safeBottom,
                paddingLeft:    SPACE.padH,
                paddingRight:   SPACE.padH,
                flexDirection:  'column',
                zIndex:         Z.content,
            }}>

                {/* ── Headline ── */}
                <div style={{
                    transform:    `translateY(${hlTy}px)`,
                    opacity:      hlOp,
                    marginBottom: `${SPACE.gapLg}px`,
                    width:        '100%',
                    textAlign:    'center',
                }}>
                    <span style={{
                        fontFamily:    sansFont,
                        fontSize:      `${TYPE.title.size}px`,
                        fontWeight:    TYPE.title.weight,
                        letterSpacing: `${TYPE.title.tracking}px`,
                        lineHeight:    TYPE.title.lineHeight,
                        color:         COLOR.white,
                        display:       'block',
                        marginBottom:  `${SPACE.gap}px`,
                    }}>
                        {headline}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <AccentBar
                            direction="horizontal"
                            width="80px"
                            thickness={4}
                            color={brandAccent}
                            animate
                            delay={TIMING.snap}
                            duration={TIMING.fast}
                            glow
                            radius={2}
                        />
                    </div>
                </div>

                {/* ── Pyramid layers ── */}
                <div style={{
                    display:       'flex',
                    flexDirection: 'column',
                    alignItems:    'center',
                    gap:           `${gapBetween}px`,
                    width:         '100%',
                }}>
                    {safeLayers.map((layer, i) => {
                        // i=0 is top/peak. Render top-to-bottom in display.
                        // Animation: bottom layers appear first (i = count-1 first)
                        const appearOrder = count - 1 - i; // 0 = bottom, count-1 = top
                        const delay = 10 + appearOrder * 12;
                        const sp = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.normal });
                        const sc = interpolate(sp, [0, 1], [0.3, 1]);
                        const op = interpolate(sp, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

                        // Trapezoid geometry: i=0 narrowest (top), i=count-1 widest (bottom)
                        // leftOffset = (count-1-i) * narrowStep → top is smallest → widest at bottom
                        const leftOffset = (count - 1 - i) * narrowStep;
                        const layerW = totalW - leftOffset * 2;
                        const halfW = layerW / 2;

                        // SVG polygon points for trapezoid (this layer vs next narrower layer above)
                        // top edge is narrower than bottom edge
                        const topHalfW = Math.max(halfW - narrowStep, 60);
                        // points: bottom-left, top-left, top-right, bottom-right
                        const pts = [
                            `0,${layerH}`,
                            `${halfW - topHalfW},0`,
                            `${halfW + topHalfW},0`,
                            `${layerW},${layerH}`,
                        ].join(' ');

                        const fillOpacity = layerOpacities[i] ?? 0.25;

                        return (
                            <div
                                key={i}
                                style={{
                                    position:       'relative',
                                    width:          `${layerW}px`,
                                    height:         `${layerH}px`,
                                    transform:      `scale(${sc})`,
                                    opacity:        op,
                                    transformOrigin: 'center bottom',
                                }}
                            >
                                {/* SVG trapezoid */}
                                <svg
                                    width={layerW}
                                    height={layerH}
                                    style={{ position: 'absolute', top: 0, left: 0 }}
                                    viewBox={`0 0 ${layerW} ${layerH}`}
                                >
                                    <defs>
                                        <filter id={`glow-${i}`}>
                                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <polygon
                                        points={pts}
                                        fill={brandAccent}
                                        fillOpacity={fillOpacity}
                                        stroke={brandAccent}
                                        strokeOpacity={fillOpacity + 0.2}
                                        strokeWidth="1.5"
                                        filter={i === 0 ? `url(#glow-${i})` : undefined}
                                    />
                                </svg>

                                {/* Layer text content */}
                                <div style={{
                                    position:       'absolute',
                                    inset:          0,
                                    display:        'flex',
                                    flexDirection:  'column',
                                    justifyContent: 'center',
                                    alignItems:     'center',
                                    paddingTop:     '8px',
                                }}>
                                    <span style={{
                                        fontFamily:    sansFont,
                                        fontSize:      `${TYPE.body.size * 0.85}px`,
                                        fontWeight:    700,
                                        color:         i === 0 ? COLOR.black : COLOR.white,
                                        letterSpacing: '-0.5px',
                                        lineHeight:    1.1,
                                        textAlign:     'center',
                                    }}>
                                        {layer.label}
                                    </span>
                                    {layer.sub && (
                                        <span style={{
                                            fontFamily:  sansFont,
                                            fontSize:    `${TYPE.caption.size * 0.78}px`,
                                            fontWeight:  400,
                                            color:       i === 0 ? `${COLOR.black}bb` : COLOR.textMuted,
                                            lineHeight:  1.3,
                                            textAlign:   'center',
                                            marginTop:   '4px',
                                        }}>
                                            {layer.sub}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
