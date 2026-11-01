/**
 * 空状态线稿插画。
 * 与 icons.tsx 同一套语言：24 网格比例、描边无填充、跟随 currentColor。
 */
type ArtProps = { className?: string };

/** 空日记：小岛、海面、探出头的猫耳朵 */
export function EmptyDiaryArt({ className }: ArtProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* 太阳 */}
      <circle cx="92" cy="24" r="9" opacity="0.45" />
      <path d="M92 9v4M92 35v4M107 24h-4M81 24h-4" opacity="0.3" />

      {/* 岛 */}
      <path d="M28 66c0-9 14-16 32-16s32 7 32 16" />
      <path d="M28 66h64" opacity="0.5" />

      {/* 猫耳探出头 */}
      <path d="M52 66v-9a8 8 0 0 1 16 0v9" />
      <path d="M53.5 57.5 51 51l6 3.4M66.5 57.5 69 51l-6 3.4" />

      {/* 海面 */}
      <path d="M20 78c4 0 4 3 8 3s4-3 8-3 4 3 8 3 4-3 8-3 4 3 8 3 4-3 8-3 4 3 8 3 4-3 8-3" opacity="0.55" />
      <path d="M32 88c4 0 4 3 8 3s4-3 8-3 4 3 8 3 4-3 8-3 4 3 8 3" opacity="0.28" />
    </svg>
  );
}

/** 空报告：还没长高的柱子和一条虚线趋势 */
export function EmptyReportArt({ className }: ArtProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M24 78h72" opacity="0.5" />
      <rect x="32" y="58" width="13" height="20" rx="4" opacity="0.55" />
      <rect x="54" y="46" width="13" height="32" rx="4" opacity="0.4" />
      <rect x="76" y="62" width="13" height="16" rx="4" opacity="0.28" />
      <path d="M20 38c10-2 18-8 28-8s16 6 26 4 18-8 26-10" strokeDasharray="4 6" opacity="0.55" />
      <circle cx="100" cy="24" r="3" opacity="0.5" />
    </svg>
  );
}
