/**
 * Foundation — Public API
 *
 * Mọi layout import từ đây, không import trực tiếp từng file.
 *
 * import { AnimateIn, Headline, AccentBar, CountUp, StaggerList, SceneBg, TYPE, TIMING } from '../../foundation';
 */

// Tokens
export * from './tokens';

// Primitives
export { AnimateIn, useAnimateIn } from './AnimateIn';
export type { AnimateInProps, AnimateType } from './AnimateIn';

export { Headline } from './Headline';
export type { HeadlineProps } from './Headline';

export { AccentBar, QuoteBar } from './AccentBar';
export type { AccentBarProps } from './AccentBar';

export { CountUp } from './CountUp';
export type { CountUpProps, CountEasing } from './CountUp';

export { StaggerList, BulletList, RevealList, PopList } from './StaggerList';
export type { StaggerListProps } from './StaggerList';

export { SceneBg } from './SceneBg';
