import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * LANDING_OFFER — Value offer / bạn sẽ nhận được gì
 *
 * Archetype: LANDING_OFFER
 * Act: 4 — LANDING
 *
 * Design rules:
 *   - Nền đen với accent border card
 *   - Label "BẠN SẼ NHẬN ĐƯỢC" ở trên
 *   - Card border accent chứa headline offer
 *   - Danh sách benefits ✓ stagger vào từ trái
 *   - Value highlight: "Miễn phí" / "Chỉ XXX" dạng badge accent
 *   - Tạo urgency nhẹ trước CTA
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "LANDING_OFFER",
 *   "scene_rhythm": "slow",
 *   "voice_text": "Follow để nhận ngay bộ template content miễn phí.",
 *   "props": {
 *     "label": "BẠN SẼ NHẬN ĐƯỢC",
 *     "headline": "Bộ Template Content\nMiễn Phí",
 *     "benefits": [
 *       "30 caption hook mạnh nhất 2024",
 *       "Khung lên ý tưởng trong 5 phút",
 *       "Checklist trước khi đăng bài"
 *     ],
 *     "value_tag": "MIỄN PHÍ 100%",
 *     "urgency": "Chỉ dành cho người theo dõi."
 *   }
 * }
 */

interface LandingOfferProps {
    label?:       string;
    headline?:    string;
    benefits?:    string[];
    value_tag?:   string;
    urgency?:     string;
    bg?:          'black' | 'dark';
    brandAccent?: string;
}

export const LandingOffer: React.FC<LandingOfferProps> = ({
    label       = 'BẠN SẼ NHẬN ĐƯỢC',
    headline    = 'Bộ Template Content\nMiễn Phí',
    benefits    = [
        '30 caption hook mạnh nhất 2024',
        'Khung lên ý tưởng trong 5 phút',
        'Checklist trước khi đăng bài',
    ],
    value_tag   = 'MIỄN PHÍ 100%',
    urgency     = 'Chỉ dành cho người theo dõi.',
    bg          = 'black',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    const headlineLines = headline.split('\n').filter(Boolean);

    // ── Timing ────────────────────────────────────────────────
    const labelDelay    = 0;
    const cardDelay     = TIMING.snap;
    const benefitStart  = TIMING.fast + TIMING.snap;
    const benefitStagger = TIMING.fast;
    const urgencyDelay  = benefitStart + benefits.length * benefitStagger + TIMING.medium;

    // ── Label ─────────────────────────────────────────────────
    const labelSp = spring({ frame: Math.max(0, frame - labelDelay), fps, config: SPRING.snappy });
    const labelOp = interpolate(labelSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const labelTy = interpolate(labelSp, [0, 1], [-20, 0]);

    // ── Card entrance ─────────────────────────────────────────
    const cardSp = spring({ frame: Math.max(0, frame - cardDelay), fps, config: SPRING.normal });
    const cardOp = interpolate(cardSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const cardSc = interpolate(cardSp, [0, 1], [0.96, 1]);

    // ── Urgency ───────────────────────────────────────────────
    const urgSp = spring({ frame: Math.max(0, frame - urgencyDelay), fps, config: SPRING.bouncy });
    const urgOp = interpolate(urgSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const urgSc = interpolate(urgSp, [0, 1], [0.85, 1]);

    return (
        <AbsoluteFill>
            {bg === 'dark' ? <SceneBg.Dark /> : <SceneBg.Black />}

            {/* Corner glow */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at 80% 20%, ${brandAccent}0c 0%, transparent 50%)`,
                pointerEvents: 'none',
            }} />

            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems:     'flex-start',
                paddingTop:     SPACE.safeTop,
                paddingBottom:  SPACE.safeBottom,
                zIndex:         Z.content,
                paddingLeft:    SPACE.padH,
                paddingRight:   SPACE.padH,
                flexDirection:  'column',
            }}>

                {/* ── Label ── */}
                <div style={{
                    transform:    `translateY(${labelTy}px)`,
                    opacity:      labelOp,
                    marginBottom: `${SPACE.gap}px`,
                    display:      'flex',
                    alignItems:   'center',
                    gap:          `${SPACE.gapSm}px`,
                }}>
                    <div style={{ width: '20px', height: '2px', background: `${brandAccent}88` }} />
                    <span style={{
                        fontFamily:    sansFont,
                        fontSize:      `${TYPE.caption.size}px`,
                        fontWeight:    700,
                        letterSpacing: '2.5px',
                        color:         `${brandAccent}cc`,
                        textTransform: 'none',
                    }}>
                        {label}
                    </span>
                </div>

                {/* ── Offer card ── */}
                <div style={{
                    transform:    `scale(${cardSc})`,
                    opacity:      cardOp,
                    width:        '100%',
                    padding:      `${SPACE.gapLg}px`,
                    background:   `${brandAccent}0c`,
                    border:       `1.5px solid ${brandAccent}44`,
                    borderRadius: '16px',
                    marginBottom: `${SPACE.gapLg}px`,
                    transformOrigin: 'left center',
                }}>
                    {/* Value badge */}
                    {value_tag && (
                        <div style={{
                            display:      'inline-flex',
                            alignItems:   'center',
                            padding:      '6px 16px',
                            background:   brandAccent,
                            borderRadius: '20px',
                            marginBottom: `${SPACE.gap}px`,
                        }}>
                            <span style={{
                                fontFamily:    sansFont,
                                fontSize:      `${TYPE.caption.size * 0.85}px`,
                                fontWeight:    900,
                                letterSpacing: '2px',
                                color:         COLOR.black,
                                textTransform: 'none',
                            }}>
                                {value_tag}
                            </span>
                        </div>
                    )}

                    {/* Headline */}
                    <div style={{ marginBottom: `${SPACE.gapLg}px` }}>
                        {headlineLines.map((line, i) => {
                            const delay = cardDelay + i * TIMING.stagger;
                            const sp = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.snappy });
                            const ty = interpolate(sp, [0, 1], [30, 0]);
                            const op = interpolate(sp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

                            return (
                                <div key={i} style={{ transform: `translateY(${ty}px)`, opacity: op }}>
                                    <span style={{
                                        fontFamily:    sansFont,
                                        fontSize:      `${TYPE.title.size}px`,
                                        fontWeight:    TYPE.title.weight,
                                        letterSpacing: `${TYPE.title.tracking}px`,
                                        lineHeight:    TYPE.title.lineHeight,
                                        color:         COLOR.white,
                                        display:       'block',
                                    }}>
                                        {line}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* AccentBar */}
                    <div style={{ marginBottom: `${SPACE.gapLg}px` }}>
                        <AccentBar
                            direction="horizontal"
                            width="56px"
                            thickness={3}
                            color={brandAccent}
                            animate
                            delay={benefitStart - TIMING.snap}
                            duration={TIMING.fast}
                            radius={2}
                        />
                    </div>

                    {/* Benefits list */}
                    <div style={{
                        display:       'flex',
                        flexDirection: 'column',
                        gap:           `${SPACE.gapSm}px`,
                    }}>
                        {benefits.map((benefit, i) => {
                            const delay = benefitStart + i * benefitStagger;
                            const sp = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.normal });
                            const tx = interpolate(sp, [0, 1], [-36, 0]);
                            const op = interpolate(sp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

                            return (
                                <div key={i} style={{
                                    transform:     `translateX(${tx}px)`,
                                    opacity:       op,
                                    display:       'flex',
                                    flexDirection: 'row',
                                    alignItems:    'center',
                                    gap:           `${SPACE.gap}px`,
                                }}>
                                    <div style={{
                                        width:        '28px',
                                        height:       '28px',
                                        borderRadius: '50%',
                                        background:   `${brandAccent}22`,
                                        border:       `1.5px solid ${brandAccent}66`,
                                        display:      'flex',
                                        alignItems:   'center',
                                        justifyContent: 'center',
                                        flexShrink:   0,
                                    }}>
                                        <span style={{
                                            fontFamily: sansFont,
                                            fontSize:   '14px',
                                            fontWeight: 700,
                                            color:      brandAccent,
                                            lineHeight: 1,
                                        }}>
                                            ✓
                                        </span>
                                    </div>
                                    <span style={{
                                        fontFamily:    sansFont,
                                        fontSize:      `${TYPE.body.size}px`,
                                        fontWeight:    500,
                                        letterSpacing: '0px',
                                        lineHeight:    1.3,
                                        color:         COLOR.textSecondary,
                                    }}>
                                        {benefit}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Urgency line ── */}
                {urgency && (
                    <div style={{
                        transform:  `scale(${urgSc})`,
                        opacity:    urgOp,
                        width:      '100%',
                        textAlign:  'center',
                        transformOrigin: 'center center',
                    }}>
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${TYPE.caption.size}px`,
                            fontWeight:    600,
                            letterSpacing: '1px',
                            color:         COLOR.textMuted,
                            fontStyle:     'italic',
                        }}>
                            {urgency}
                        </span>
                    </div>
                )}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
