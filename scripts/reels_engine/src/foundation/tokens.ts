/**
 * DESIGN TOKENS — Nền tảng thống nhất cho toàn bộ hệ thống layout
 *
 * Mọi layout PHẢI dùng các giá trị từ file này.
 * KHÔNG được hardcode font-size, timing, spacing ở bất kỳ component nào.
 */

// ─────────────────────────────────────────────
// TYPOGRAPHY SCALE
// 5 cấp bậc — không được tạo thêm cấp trung gian
// ─────────────────────────────────────────────
export const TYPE = {
    /** 160px / w900 / -4px — Con số hero, từ hook đơn độc */
    display: { size: 160, weight: 900, tracking: -4, lineHeight: 0.88 },
    /** 120px / w900 / -2px — Headline chính của scene */
    hero:    { size: 120, weight: 900, tracking: -2, lineHeight: 0.92 },
    /** 72px  / w800 / -1px — Title card, section header */
    title:   { size: 72,  weight: 800, tracking: -1, lineHeight: 1.05 },
    /** 40px  / w500 /  0px — Body text, bullets, quote */
    body:    { size: 40,  weight: 500, tracking: 0,  lineHeight: 1.35 },
    /** 28px  / w400 / +1px — Metadata, author, tag, subtext */
    caption: { size: 28,  weight: 400, tracking: 1,  lineHeight: 1.4  },
} as const;

export type TypeLevel = keyof typeof TYPE;

// ─────────────────────────────────────────────
// ANIMATION TIMING (frames at 30 fps)
// Mọi duration/delay phải dùng các giá trị này
// ─────────────────────────────────────────────
export const TIMING = {
    /** 0 frame  — Xuất hiện ngay, không transition */
    instant: 0,
    /** 4 frame  — Rất nhanh 133ms, dùng cho accent dots, indicators */
    snap:    4,
    /** 8 frame  — Nhanh 267ms, entrance chữ tiêu đề */
    fast:    8,
    /** 16 frame — Vừa 533ms, slide card, fade scene */
    medium:  16,
    /** 24 frame — Chậm 800ms, pan background, mood shot */
    slow:    24,
    /** 6 frame  — Khoảng cách giữa các item trong stagger list */
    stagger: 6,
} as const;

// Spring configs — dùng với Remotion spring()
export const SPRING = {
    /** Nảy mạnh — dùng cho số hero, pop-in badge */
    bouncy:  { damping: 9,  stiffness: 280, mass: 0.8 },
    /** Tiêu chuẩn — dùng cho card, text block */
    normal:  { damping: 14, stiffness: 180, mass: 1.0 },
    /** Mềm mại — dùng cho transition nền, fade */
    gentle:  { damping: 22, stiffness: 120, mass: 1.2 },
    /** Cứng, nhanh — dùng cho chữ headline, CTA */
    snappy:  { damping: 10, stiffness: 320, mass: 0.75 },
} as const;

export type SpringPreset = keyof typeof SPRING;

// ─────────────────────────────────────────────
// SPACING
// ─────────────────────────────────────────────
export const SPACE = {
    /** Safe area top — tránh notch/status bar */
    safeTop:    100,
    /** Safe area bottom — clearance bên trên karaoke + platform UI (Instagram/TikTok che ~240px từ đáy) */
    safeBottom: 400,
    /** Horizontal padding nội dung — đủ xa viền trái/phải (safe zone Instagram/TikTok) */
    padH:       96,
    /** Vertical gap mặc định giữa các elements */
    gap:        20,
    /** Gap nhỏ — giữa label và value */
    gapSm:      10,
    /** Gap lớn — giữa các section */
    gapLg:      40,
} as const;

// ─────────────────────────────────────────────
// Z-INDEX LAYERS
// ─────────────────────────────────────────────
export const Z = {
    bg:        0,
    bgOverlay: 1,
    bgGrid:    2,
    content:   10,
    badge:     20,
    overlay:   50,
    karaoke:   100,
} as const;

// ─────────────────────────────────────────────
// COLORS (defaults — có thể override bằng brandAccent)
// ─────────────────────────────────────────────
export const COLOR = {
    black:       '#000000',
    darkBg:      '#080808',
    darkCard:    '#111111',
    white:       '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textMuted:   'rgba(255,255,255,0.35)',
    accentDefault: '#B6FF00',
} as const;

// ─────────────────────────────────────────────
// CANVAS (1080×1920 vertical video)
// ─────────────────────────────────────────────
export const CANVAS = {
    width:  1080,
    height: 1920,
    fps:    30,
    aspect: 9 / 16,
} as const;
