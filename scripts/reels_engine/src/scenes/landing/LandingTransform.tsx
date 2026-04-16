import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * LANDING_TRANSFORM — Text morph dramatic: before state → after state
 *
 * Archetype: LANDING_TRANSFORM
 * Act: 4 — LANDING
 *
 * Design rules:
 *   - Phase 1: "before" text spring in từ trên, màu muted
 *   - Phase 2: Transition explosion — scale up + fade out, particle burst, white flash
 *   - Phase 3: "after" text spring in từ dưới, màu brandAccent với glow mạnh
 *   - Before và after cùng vị trí (absolute stack), transition giữa chúng
 *   - 8 particles nổ ra từ center theo 8 hướng
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "LANDING_TRANSFORM",
 *   "scene_rhythm": "medium",
 *   "voice_text": "Từ người bình thường, trở thành phiên bản tốt hơn.",
 *   "props": {
 *     "before_text": "Người bình thường",
 *     "after_text": "Phiên bản tốt hơn",
 *     "before_sub": "Mắc kẹt trong vòng lặp cũ",
 *     "after_sub": "Bứt phá. Tự do. Thành công.",
 *     "transform_frame": 45,
 *     "brandAccent": "#B6FF00"
 *   }
 * }
 */

interface LandingTransformProps {
    before_text?:     string;
    after_text?:      string;
    before_sub?:      string;
    after_sub?:       string;
    transform_frame?: number;
    brandAccent?:     string;
}

const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export const LandingTransform: React.FC<LandingTransformProps> = ({
    before_text     = 'Người bình thường',
    after_text      = 'Phiên bản tốt hơn',
    before_sub      = 'Mắc kẹt trong vòng lặp cũ',
    after_sub       = 'Bứt phá. Tự do. Thành công.',
    transform_frame = 45,
    brandAccent     = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    // ── Phase gates ───────────────────────────────────────────
    const transStart = transform_frame - 5;
    const transEnd   = transform_frame + 5;

    // ── PHASE 1: Before text ──────────────────────────────────
    // Spring in from above (frame 0)
    const beforeSp  = spring({ frame: Math.max(0, frame), fps, config: SPRING.snappy });
    const beforeTy  = interpolate(beforeSp, [0, 1], [-60, 0]);
    const beforeSubSp = spring({ frame: Math.max(0, frame - TIMING.fast), fps, config: SPRING.gentle });
    const beforeSubOp = interpolate(beforeSubSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const beforeSubTy = interpolate(beforeSubSp, [0, 1], [20, 0]);

    // Phase 1→2 transition: scale up + fade out for before text
    const beforeScaleOut = interpolate(
        frame,
        [transStart, transStart + 8],
        [1, 1.5],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const beforeOpOut = interpolate(
        frame,
        [transStart, transStart + 6],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Before is shown only in phase 1
    const beforeMainOp = frame < transStart
        ? interpolate(beforeSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' }) * beforeOpOut
        : beforeOpOut;

    // ── PHASE 2: Flash + Particles ────────────────────────────
    const flashOpacity = interpolate(
        frame,
        [transform_frame - 2, transform_frame, transform_frame + 2],
        [0, 0.4, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Particles: active during transform_frame - 2 → transform_frame + 15
    const particleStart   = transform_frame - 2;
    const particleEnd     = transform_frame + 15;
    const particleProgress = interpolate(
        frame,
        [particleStart, particleEnd],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const particleDistance = interpolate(particleProgress, [0, 1], [0, 180]);
    const particleOpacity  = interpolate(particleProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const showParticles    = frame >= particleStart && frame <= particleEnd;

    // ── PHASE 3: After text ───────────────────────────────────
    const afterDelay  = transEnd;
    const afterSp     = spring({ frame: Math.max(0, frame - afterDelay), fps, config: SPRING.bouncy });
    const afterTy     = interpolate(afterSp, [0, 1], [60, 0]);
    const afterSc     = interpolate(afterSp, [0, 1], [0.7, 1]);
    const afterOp     = interpolate(afterSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

    const afterSubDelay = afterDelay + TIMING.fast;
    const afterSubSp    = spring({ frame: Math.max(0, frame - afterSubDelay), fps, config: SPRING.gentle });
    const afterSubOp    = interpolate(afterSubSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const afterSubTy    = interpolate(afterSubSp, [0, 1], [24, 0]);

    const barDelay = afterDelay + TIMING.fast + TIMING.fast;

    return (
        <AbsoluteFill>
            <SceneBg.Black />

            {/* Ambient glow center */}
            <AbsoluteFill style={{
                background:    `radial-gradient(ellipse at 50% 50%, ${brandAccent}0a 0%, transparent 55%)`,
                pointerEvents: 'none',
            }} />

            {/* ── White flash on transition ── */}
            <AbsoluteFill style={{
                background:    `rgba(255,255,255,${flashOpacity})`,
                pointerEvents: 'none',
                zIndex:        Z.overlay,
            }} />

            {/* ── Particle burst ── */}
            {showParticles && (
                <AbsoluteFill style={{ pointerEvents: 'none', zIndex: Z.overlay - 1 }}>
                    {PARTICLE_ANGLES.map((angle, i) => {
                        const rad = (angle * Math.PI) / 180;
                        const dx  = Math.cos(rad) * particleDistance;
                        const dy  = Math.sin(rad) * particleDistance;
                        return (
                            <div
                                key={i}
                                style={{
                                    position:     'absolute',
                                    top:          '50%',
                                    left:         '50%',
                                    width:        '8px',
                                    height:       '8px',
                                    borderRadius: '50%',
                                    background:   brandAccent,
                                    opacity:      particleOpacity,
                                    transform:    `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`,
                                    boxShadow:    `0 0 8px ${brandAccent}`,
                                }}
                            />
                        );
                    })}
                </AbsoluteFill>
            )}

            {/* ── Content stack (centered) ── */}
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

                {/* Before + After share the same vertical slot via absolute stacking */}
                <div style={{
                    position: 'relative',
                    width:    '100%',
                    display:  'flex',
                    flexDirection: 'column',
                    alignItems:   'center',
                }}>

                    {/* ── BEFORE ── */}
                    <div style={{
                        position:       'absolute',
                        top:            0,
                        left:           0,
                        right:          0,
                        textAlign:      'center',
                        opacity:        beforeMainOp,
                        transform:      `translateY(${beforeTy}px) scale(${beforeScaleOut})`,
                        transformOrigin:'center center',
                        pointerEvents:  frame >= transStart ? 'none' : 'auto',
                    }}>
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${TYPE.hero.size}px`,
                            fontWeight:    TYPE.hero.weight,
                            letterSpacing: `${TYPE.hero.tracking}px`,
                            lineHeight:    TYPE.hero.lineHeight,
                            color:         COLOR.textSecondary,
                            display:       'block',
                        }}>
                            {before_text}
                        </span>
                        {before_sub && (
                            <div style={{
                                marginTop: `${SPACE.gap}px`,
                                transform: `translateY(${beforeSubTy}px)`,
                                opacity:   beforeSubOp * beforeOpOut,
                            }}>
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${TYPE.body.size}px`,
                                    fontWeight:    400,
                                    letterSpacing: `${TYPE.body.tracking}px`,
                                    lineHeight:    TYPE.body.lineHeight,
                                    color:         COLOR.textMuted,
                                    display:       'block',
                                }}>
                                    {before_sub}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ── AFTER ── */}
                    <div style={{
                        position:       'absolute',
                        top:            0,
                        left:           0,
                        right:          0,
                        textAlign:      'center',
                        opacity:        afterOp,
                        transform:      `translateY(${afterTy}px) scale(${afterSc})`,
                        transformOrigin:'center center',
                    }}>
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${TYPE.hero.size}px`,
                            fontWeight:    900,
                            letterSpacing: `${TYPE.hero.tracking}px`,
                            lineHeight:    TYPE.hero.lineHeight,
                            color:         brandAccent,
                            display:       'block',
                            textShadow:    `0 0 40px ${brandAccent}88, 0 0 80px ${brandAccent}44`,
                        }}>
                            {after_text}
                        </span>
                        {after_sub && (
                            <div style={{
                                marginTop: `${SPACE.gap}px`,
                                transform: `translateY(${afterSubTy}px)`,
                                opacity:   afterSubOp,
                            }}>
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${TYPE.body.size}px`,
                                    fontWeight:    400,
                                    letterSpacing: `${TYPE.body.tracking}px`,
                                    lineHeight:    TYPE.body.lineHeight,
                                    color:         COLOR.textSecondary,
                                    display:       'block',
                                }}>
                                    {after_sub}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Spacer to give the absolute-positioned children room */}
                    <div style={{ height: `${TYPE.hero.size * 1.2 + TYPE.body.size * 2 + SPACE.gap}px` }} />
                </div>

                {/* ── AccentBar wipe after "after" appears ── */}
                <div style={{ marginTop: `${SPACE.gap}px` }}>
                    <AccentBar
                        direction="horizontal"
                        width="140px"
                        thickness={4}
                        color={brandAccent}
                        animate
                        delay={barDelay}
                        duration={TIMING.medium}
                        glow
                        radius={2}
                    />
                </div>

            </AbsoluteFill>
        </AbsoluteFill>
    );
};
