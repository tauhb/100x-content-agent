import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import {
    AnimateIn, CountUp, AccentBar, SceneBg,
    TYPE, TIMING, SPRING, SPACE, COLOR, Z,
} from '../../foundation';

/**
 * HOOK_STAT — Number-first hook layout
 *
 * Archetype: HOOK_STAT
 * Act: 1 — HOOK
 *
 * Mục đích: Mở màn bằng con số gây sốc — chiếm 60% màn hình, nảy ra
 * như bom. Pattern cực mạnh trên Reels khi hook bằng dữ liệu.
 *
 * Design rules:
 *   - Nền đen, radial glow màu accent phía sau số
 *   - Số to nhất có thể (display 160px hoặc lớn hơn custom)
 *   - Label nhỏ trên số (tag/context ngắn ≤ 20 ký tự)
 *   - Context line dưới số (giải thích ngắn ≤ 60 ký tự)
 *   - Optional accent bar wipe dưới cùng
 *   - Không có video/ảnh nền — focus hoàn toàn vào số
 *
 * Variants:
 *   impact — Số tĩnh, spring pop mạnh (dùng cho %, x, string số)
 *   count  — Đếm từ 0 → target với easing (dùng cho số nguyên lớn)
 *   split  — 2-3 chỉ số xếp dọc (dùng khi muốn so sánh 2-3 số cùng lúc)
 *
 * Ví dụ Director JSON (impact):
 * {
 *   "archetype": "HOOK_STAT",
 *   "scene_rhythm": "fast",
 *   "voice_text": "97% người dùng AI đang lãng phí 80% tiềm năng của nó.",
 *   "props": {
 *     "variant": "impact",
 *     "stat": "97%",
 *     "label": "Người dùng AI",
 *     "context": "đang dùng sai hoàn toàn",
 *     "show_bar": true
 *   }
 * }
 *
 * Ví dụ Director JSON (count):
 * {
 *   "archetype": "HOOK_STAT",
 *   "props": {
 *     "variant": "count",
 *     "from": 0,
 *     "to": 1200000,
 *     "suffix": "+",
 *     "format": "compact",
 *     "label": "Người mất việc",
 *     "context": "chỉ trong 6 tháng qua",
 *     "show_bar": false
 *   }
 * }
 *
 * Ví dụ Director JSON (split):
 * {
 *   "archetype": "HOOK_STAT",
 *   "props": {
 *     "variant": "split",
 *     "items": [
 *       { "stat": "97%",  "label": "Thất bại năm đầu" },
 *       { "stat": "3%",   "label": "Thành công" },
 *       { "stat": "0.1%", "label": "Trở thành tỷ phú" }
 *     ],
 *     "context": "Đây là sự thật về khởi nghiệp"
 *   }
 * }
 */

// ─── Types ────────────────────────────────────────────────────────────────────

type HookStatVariant = 'impact' | 'count' | 'split';

interface SplitItem {
    stat: string;
    label: string;
}

export interface HookStatProps {
    /** Kiểu hiển thị */
    variant?: HookStatVariant;

    // ── impact variant ──
    /** Chuỗi số hiển thị tĩnh — "97%", "$1.2B", "10x", "GPT-4" */
    stat?: string;

    // ── count variant ──
    /** Bắt đầu đếm từ */
    from?: number;
    /** Đếm đến */
    to?: number;
    /** Hậu tố: "%", "x", "K", "+" */
    suffix?: string;
    /** Tiền tố: "$", "+" */
    prefix?: string;
    /** Kiểu format số */
    format?: 'number' | 'compact';
    /** Easing cho count */
    easing?: 'ease-out' | 'expo' | 'spring-snap';

    // ── split variant ──
    /** Danh sách 2-3 chỉ số */
    items?: SplitItem[];

    // ── shared ──
    /** Nhãn nhỏ phía trên số — context ngắn, tối đa 20 ký tự */
    label?: string;
    /** Dòng giải thích phía dưới số */
    context?: string;
    /** Hiện accent bar dưới context */
    show_bar?: boolean;
    /** Màu accent */
    brandAccent?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Frame mà số bắt đầu xuất hiện */
const STAT_ENTER = 0;
/** Frame mà label xuất hiện (trước số nhẹ) */
const LABEL_ENTER = TIMING.snap;
/** Frame mà context xuất hiện (sau số) */
const CONTEXT_ENTER_OFFSET = TIMING.fast + TIMING.snap;
/** Frame bar wipe bắt đầu */
const BAR_ENTER_OFFSET = TIMING.fast + TIMING.medium;

// ─── Component ────────────────────────────────────────────────────────────────

export const HookStat: React.FC<HookStatProps> = ({
    variant = 'impact',
    stat = '97%',
    from = 0,
    to = 100,
    suffix = '',
    prefix = '',
    format = 'number',
    easing = 'expo',
    items = [],
    label,
    context,
    show_bar = true,
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    // Radial glow opacity — fade in theo TIMING.medium
    const glowOpacity = interpolate(frame, [0, TIMING.medium], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });

    const contextDelay = variant === 'impact'
        ? CONTEXT_ENTER_OFFSET
        : TIMING.slow + TIMING.fast; // count cần thời gian đếm xong

    return (
        <AbsoluteFill>
            {/* Nền đen tuyền */}
            <SceneBg.Black />

            {/* Radial glow phía sau số — tạo depth */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${brandAccent}18 0%, transparent 70%)`,
                opacity: glowOpacity,
                zIndex: Z.bgOverlay,
            }} />

            {/* Particle glow rings — subtlety depth */}
            <AbsoluteFill style={{ zIndex: Z.bgGrid, pointerEvents: 'none' }}>
                <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ opacity: 0.06 }}>
                    <circle cx="540" cy="960" r="280" fill="none" stroke={brandAccent} strokeWidth="1" />
                    <circle cx="540" cy="960" r="400" fill="none" stroke={brandAccent} strokeWidth="0.5" />
                </svg>
            </AbsoluteFill>

            {/* Content zone */}
            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: SPACE.safeTop,
                paddingBottom: SPACE.safeBottom,
                paddingLeft: SPACE.padH,
                paddingRight: SPACE.padH,
                flexDirection: 'column',
                gap: 0,
                zIndex: Z.content,
            }}>

                {/* ── Label phía trên ── */}
                {label && (
                    <AnimateIn type="slide-down" delay={LABEL_ENTER} spring="snappy" style={{ marginBottom: 20 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: `${brandAccent}18`,
                            border: `1px solid ${brandAccent}44`,
                            borderRadius: 100,
                            paddingLeft: 24,
                            paddingRight: 24,
                            paddingTop: 8,
                            paddingBottom: 8,
                        }}>
                            {/* Dot indicator */}
                            <div style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: brandAccent,
                                boxShadow: `0 0 8px ${brandAccent}`,
                            }} />
                            <span style={{
                                fontFamily: sansFont,
                                fontSize: TYPE.caption.size,
                                fontWeight: 600,
                                letterSpacing: 2,
                                textTransform: 'none',
                                color: brandAccent,
                            }}>
                                {label}
                            </span>
                        </div>
                    </AnimateIn>
                )}

                {/* ── Số chính ── */}
                {variant === 'impact' && (
                    <ImpactNumber
                        stat={stat}
                        brandAccent={brandAccent}
                        sansFont={sansFont}
                        delay={STAT_ENTER}
                        frame={frame}
                        fps={fps}
                    />
                )}

                {variant === 'count' && (
                    <AnimateIn type="scale-pop" delay={STAT_ENTER} spring="bouncy">
                        <CountUp
                            from={from}
                            to={to}
                            prefix={prefix}
                            suffix={suffix}
                            format={format}
                            easing={easing}
                            duration={TIMING.slow * 2}
                            delay={STAT_ENTER}
                            level="display"
                            color={brandAccent}
                            glow
                            separator
                        />
                    </AnimateIn>
                )}

                {variant === 'split' && (
                    <SplitStats
                        items={items}
                        brandAccent={brandAccent}
                        sansFont={sansFont}
                        frame={frame}
                        fps={fps}
                    />
                )}

                {/* ── Context dưới số ── */}
                {context && (
                    <AnimateIn
                        type="slide-up"
                        delay={contextDelay}
                        spring="normal"
                        style={{ marginTop: variant === 'split' ? 32 : 24, textAlign: 'center' }}
                    >
                        <span style={{
                            fontFamily: sansFont,
                            fontSize: TYPE.title.size,
                            fontWeight: TYPE.title.weight,
                            letterSpacing: TYPE.title.tracking,
                            lineHeight: TYPE.title.lineHeight,
                            color: COLOR.white,
                            textAlign: 'center',
                        }}>
                            {context}
                        </span>
                    </AnimateIn>
                )}

                {/* ── Accent bar wipe ── */}
                {show_bar && (
                    <div style={{ marginTop: 28, width: '100%' }}>
                        <AccentBar
                            direction="horizontal"
                            width="100%"
                            thickness={4}
                            color={brandAccent}
                            animate
                            delay={BAR_ENTER_OFFSET}
                            duration={TIMING.medium}
                            glow
                            radius={2}
                        />
                    </div>
                )}

            </AbsoluteFill>
        </AbsoluteFill>
    );
};

// ─── Impact Number ─────────────────────────────────────────────────────────────

/**
 * Số tĩnh, siêu to — spring bouncy pop.
 * Hỗ trợ chuỗi dài → tự thu nhỏ font để không bị tràn.
 */
const ImpactNumber: React.FC<{
    stat: string;
    brandAccent: string;
    sansFont: string;
    delay: number;
    frame: number;
    fps: number;
}> = ({ stat, brandAccent, sansFont, delay, frame, fps }) => {

    const sp = spring({
        frame: Math.max(0, frame - delay),
        fps,
        config: SPRING.bouncy,
    });

    const scale = interpolate(sp, [0, 1], [0.5, 1]);
    const opacity = interpolate(sp, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });

    // Số ký tự nhiều → thu nhỏ font tự động
    const charCount = stat.length;
    const fontSize = charCount <= 4  ? 200
                   : charCount <= 6  ? 160
                   : charCount <= 8  ? 130
                   : 100;

    return (
        <div style={{
            transform: `scale(${scale})`,
            opacity,
            textAlign: 'center',
            lineHeight: 0.88,
        }}>
            <span style={{
                fontFamily: sansFont,
                fontSize,
                fontWeight: 900,
                letterSpacing: -4,
                color: brandAccent,
                textShadow: `0 0 60px ${brandAccent}66, 0 0 120px ${brandAccent}33`,
                fontVariantNumeric: 'tabular-nums',
                display: 'block',
            }}>
                {stat}
            </span>
        </div>
    );
};

// ─── Split Stats ──────────────────────────────────────────────────────────────

/**
 * 2-3 chỉ số xếp dọc với separator line.
 */
const SplitStats: React.FC<{
    items: SplitItem[];
    brandAccent: string;
    sansFont: string;
    frame: number;
    fps: number;
}> = ({ items, brandAccent, sansFont, frame, fps }) => {

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
            width: '100%',
        }}>
            {items.slice(0, 3).map((item, i) => {
                const delay = i * TIMING.fast;
                const sp = spring({
                    frame: Math.max(0, frame - delay),
                    fps,
                    config: SPRING.bouncy,
                });

                const scale = interpolate(sp, [0, 1], [0.6, 1]);
                const opacity = interpolate(sp, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });

                const charCount = item.stat.length;
                const fontSize = charCount <= 4 ? 160 : charCount <= 6 ? 130 : 100;

                return (
                    <React.Fragment key={i}>
                        <div style={{
                            transform: `scale(${scale})`,
                            opacity,
                            textAlign: 'center',
                            paddingTop: i === 0 ? 0 : 20,
                            paddingBottom: 20,
                        }}>
                            <span style={{
                                fontFamily: sansFont,
                                fontSize,
                                fontWeight: 900,
                                letterSpacing: -3,
                                lineHeight: 0.88,
                                color: i === 0 ? brandAccent : COLOR.white,
                                textShadow: i === 0
                                    ? `0 0 40px ${brandAccent}55`
                                    : 'none',
                                display: 'block',
                                fontVariantNumeric: 'tabular-nums',
                            }}>
                                {item.stat}
                            </span>
                            <span style={{
                                fontFamily: sansFont,
                                fontSize: TYPE.body.size,
                                fontWeight: 500,
                                letterSpacing: 1,
                                color: i === 0 ? `${brandAccent}CC` : COLOR.textSecondary,
                                marginTop: 4,
                                display: 'block',
                                textTransform: 'none',
                            }}>
                                {item.label}
                            </span>
                        </div>

                        {/* Separator giữa các item — trừ cái cuối */}
                        {i < items.length - 1 && (
                            <div style={{
                                width: 48,
                                height: 1,
                                background: `${brandAccent}33`,
                                marginBottom: 4,
                            }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};
