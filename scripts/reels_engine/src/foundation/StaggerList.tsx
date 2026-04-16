import React from 'react';
import { TIMING, type SpringPreset } from './tokens';
import { AnimateIn, type AnimateType } from './AnimateIn';

/**
 * StaggerList — Auto-stagger children wrapper
 *
 * Bọc danh sách items, tự động tính delay cho từng item theo thứ tự.
 * Không cần tự viết animation loop trong mỗi layout.
 *
 * Usage:
 *   <StaggerList startDelay={16} staggerDelay={6}>
 *     <ListItem>Bước 1</ListItem>
 *     <ListItem>Bước 2</ListItem>
 *     <ListItem>Bước 3</ListItem>
 *   </StaggerList>
 *
 * Với custom render (item style per-item):
 *   <StaggerList items={myItems} renderItem={(item, i) => (
 *     <div key={i}>{item.text}</div>
 *   )} />
 */

export interface StaggerListProps<T = React.ReactNode> {
    /** Items để render — dùng kèm renderItem */
    items?: T[];
    /** Render function nhận (item, index) → ReactNode */
    renderItem?: (item: T, index: number) => React.ReactNode;
    /** Hoặc dùng children trực tiếp (không cần items + renderItem) */
    children?: React.ReactNode;
    /** Frame delay trước khi item đầu tiên xuất hiện */
    startDelay?: number;
    /** Frame delay giữa mỗi item */
    staggerDelay?: number;
    /** Loại animation cho mỗi item */
    animType?: AnimateType;
    /** Spring preset */
    spring?: SpringPreset;
    /** Travel distance (px) cho slide variants */
    distance?: number;
    /** Container style */
    style?: React.CSSProperties;
    /** Style cho từng item wrapper */
    itemStyle?: React.CSSProperties;
}

export function StaggerList<T = React.ReactNode>({
    items,
    renderItem,
    children,
    startDelay = 0,
    staggerDelay = TIMING.stagger,
    animType = 'slide-up',
    spring: springPreset = 'normal',
    distance,
    style,
    itemStyle,
}: StaggerListProps<T>): React.ReactElement {

    // Mode 1: items + renderItem
    if (items && renderItem) {
        return (
            <div style={style}>
                {items.map((item, i) => (
                    <AnimateIn
                        key={i}
                        type={animType}
                        delay={startDelay + i * staggerDelay}
                        spring={springPreset}
                        distance={distance}
                        style={itemStyle}
                    >
                        {renderItem(item, i)}
                    </AnimateIn>
                ))}
            </div>
        );
    }

    // Mode 2: children
    const childArray = React.Children.toArray(children);

    return (
        <div style={style}>
            {childArray.map((child, i) => (
                <AnimateIn
                    key={i}
                    type={animType}
                    delay={startDelay + i * staggerDelay}
                    spring={springPreset}
                    distance={distance}
                    style={itemStyle}
                >
                    {child}
                </AnimateIn>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// PRESET VARIANTS — common stagger patterns
// ─────────────────────────────────────────────────────────────

/**
 * BulletList — Stagger slide-left cho danh sách bullet
 * Items slide vào từ phải, delay 6 frame mỗi item
 */
export const BulletList: React.FC<{
    children: React.ReactNode;
    startDelay?: number;
    style?: React.CSSProperties;
}> = ({ children, startDelay = 0, style }) => (
    <StaggerList
        animType="slide-left"
        spring="normal"
        staggerDelay={TIMING.stagger}
        startDelay={startDelay}
        distance={50}
        style={style}
    >
        {children}
    </StaggerList>
);

/**
 * RevealList — Items fade-in từ dưới lên, dùng cho steps/checklist
 */
export const RevealList: React.FC<{
    children: React.ReactNode;
    startDelay?: number;
    staggerDelay?: number;
    style?: React.CSSProperties;
}> = ({ children, startDelay = 0, staggerDelay = TIMING.stagger, style }) => (
    <StaggerList
        animType="slide-up"
        spring="normal"
        staggerDelay={staggerDelay}
        startDelay={startDelay}
        distance={30}
        style={style}
    >
        {children}
    </StaggerList>
);

/**
 * PopList — Scale-pop bounce cho badges, tags, icons
 */
export const PopList: React.FC<{
    children: React.ReactNode;
    startDelay?: number;
    staggerDelay?: number;
    style?: React.CSSProperties;
}> = ({ children, startDelay = 0, staggerDelay = TIMING.snap, style }) => (
    <StaggerList
        animType="scale-pop"
        spring="bouncy"
        staggerDelay={staggerDelay}
        startDelay={startDelay}
        style={style}
    >
        {children}
    </StaggerList>
);
