import type { SVGProps } from "react";

/**
 * 自绘线性图标集。
 * 规格对齐 Lucide：24×24 网格、1.7 描边、round cap/join、纯描边无填充。
 * 不引第三方图标库，避免新增依赖；颜色一律跟随 currentColor。
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ── 记录项 ─────────────────────────────── */

/** 吃饭：碗 + 热气 */
export function BowlIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 12h18a9 9 0 0 1-9 8 9 9 0 0 1-9-8Z" />
      <path d="M12 8c0-1.2 1-1.6 1-2.6" />
      <path d="M8.6 8.4c0-1 .8-1.3.8-2.1" />
      <path d="M15.4 8.4c0-1 .8-1.3.8-2.1" />
    </Icon>
  );
}

/** 喝水：水滴 */
export function DropletIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.2c3.1 3.6 5.6 6.6 5.6 9.4a5.6 5.6 0 0 1-11.2 0c0-2.8 2.5-5.8 5.6-9.4Z" />
      <path d="M9.6 13.4a2.6 2.6 0 0 0 2.6 2.6" />
    </Icon>
  );
}

/** 便便：猫砂盆 + 沙面起伏 */
export function LitterIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="9" width="18" height="10" rx="3.4" />
      <path d="M6.6 13.4c1.2 1.3 2.4 1.3 3.6 0s2.4-1.3 3.6 0 2.4 1.3 3.6 0" />
    </Icon>
  );
}

/** 呕吐：起伏的波形（异常信号） */
export function WaveAlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.8 13.4c2.4 0 2.4-4.4 4.8-4.4s2.4 7.4 4.8 7.4 2.4-4.4 4.8-4.4 2.4 1.5 4 1.5" />
    </Icon>
  );
}

/** 体重：秤 + 指针 */
export function ScaleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.6" y="4.6" width="16.8" height="14.8" rx="4" />
      <path d="M8 10.4a4 4 0 0 1 8 0" />
      <path d="M12 10.6 14.2 8.4" />
    </Icon>
  );
}

/** 心情：笑脸 */
export function SmileIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M8.8 14.2a4.2 4.2 0 0 0 6.4 0" />
      <path d="M9.3 9.6h.01M14.7 9.6h.01" strokeWidth={2.1} />
    </Icon>
  );
}

/** 照片：相机 */
export function CameraIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.4 9.6a2.4 2.4 0 0 1 2.4-2.4h1.5l1.3-2h6.8l1.3 2h1.5a2.4 2.4 0 0 1 2.4 2.4v7.4a2.4 2.4 0 0 1-2.4 2.4H5.8a2.4 2.4 0 0 1-2.4-2.4Z" />
      <circle cx="12" cy="13.2" r="3.3" />
    </Icon>
  );
}

/* ── 航线与回看 ─────────────────────────── */

/** 航线：罗盘 */
export function CompassIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M15.4 8.6 13.7 13.7 8.6 15.4 10.3 10.3Z" />
    </Icon>
  );
}

/** 预算：单据 */
export function ReceiptIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 3.6h12v16.2l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4Z" />
      <path d="M9.2 8.4h5.6M9.2 12h5.6" />
    </Icon>
  );
}

/** 周报：云和太阳 */
export function SunCloudIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8.4 6.2a3.9 3.9 0 0 1 3.8 3" />
      <circle cx="9" cy="8.2" r="3.1" />
      <path d="M6.4 17.4h10.2a3.3 3.3 0 0 0 .3-6.6 4.6 4.6 0 0 0-8.8 1.1 3 3 0 0 0-1.7 5.5Z" />
    </Icon>
  );
}

/** 月报：日历 */
export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.6" y="5.4" width="16.8" height="15" rx="3.2" />
      <path d="M8.4 3.4v3.6M15.6 3.4v3.6M3.6 10.2h16.8" />
      <path d="M8.4 14h.01M12 14h.01M15.6 14h.01M8.4 17.2h.01M12 17.2h.01" strokeWidth={2} />
    </Icon>
  );
}

/** 年度：新芽 */
export function SproutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 20.4v-7.6" />
      <path d="M12 12.8C12 9.4 9.4 7 6 7c0 3.4 2.6 5.8 6 5.8Z" />
      <path d="M12 12.8c0-2.8 2.2-4.8 5-4.8 0 2.8-2.2 4.8-5 4.8Z" />
    </Icon>
  );
}

/** 小岛：海浪 */
export function WavesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 8.6c1.8 0 1.8 1.6 3.6 1.6s1.8-1.6 3.6-1.6 1.8 1.6 3.6 1.6 1.8-1.6 3.6-1.6 1.2.7 1.8 1.1" />
      <path d="M3 13.4c1.8 0 1.8 1.6 3.6 1.6s1.8-1.6 3.6-1.6 1.8 1.6 3.6 1.6 1.8-1.6 3.6-1.6 1.2.7 1.8 1.1" />
      <path d="M3 18.2c1.8 0 1.8 1.6 3.6 1.6s1.8-1.6 3.6-1.6 1.8 1.6 3.6 1.6 1.8-1.6 3.6-1.6 1.2.7 1.8 1.1" />
    </Icon>
  );
}

/* ── 天气 ───────────────────────────────── */

export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.8v2.2M12 19v2.2M4.6 12H2.4M21.6 12h-2.2M6.7 6.7 5.2 5.2M18.8 18.8l-1.5-1.5M17.3 6.7l1.5-1.5M5.2 18.8l1.5-1.5" />
    </Icon>
  );
}

export function CloudIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.6 18.2h10.2a3.4 3.4 0 0 0 .3-6.8 4.7 4.7 0 0 0-9 1.1 3.1 3.1 0 0 0-1.5 5.7Z" />
    </Icon>
  );
}

export function RainIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.6 14.6h10.2a3.4 3.4 0 0 0 .3-6.8 4.7 4.7 0 0 0-9 1.1 3.1 3.1 0 0 0-1.5 5.7Z" />
      <path d="M9 18v1.8M13 18v1.8M17 18v1.8" />
    </Icon>
  );
}

/* ── 通用 ───────────────────────────────── */

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4.8 12.6 4.4 4.4 9.8-9.8" strokeWidth={2.2} />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 12H5M11 5.5 4.8 12l6.2 6.5" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.6 6.8h14.8M9.4 6.8V4.6h5.2v2.2" />
      <path d="M6.6 6.8 7.5 19a1.6 1.6 0 0 0 1.6 1.5h5.8A1.6 1.6 0 0 0 16.5 19l.9-12.2" />
    </Icon>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 15.4V3.8M8.2 7.4 12 3.6l3.8 3.8" />
      <path d="M5.2 13.4v5.4a1.8 1.8 0 0 0 1.8 1.8h10a1.8 1.8 0 0 0 1.8-1.8v-5.4" />
    </Icon>
  );
}

/** 按记录项取图标 */
export function EntryIcon({ kind, size = 24 }: { kind: string; size?: number }) {
  switch (kind) {
    case "meal":
      return <BowlIcon size={size} />;
    case "water":
      return <DropletIcon size={size} />;
    case "poop":
      return <LitterIcon size={size} />;
    case "vomit":
      return <WaveAlertIcon size={size} />;
    case "weight":
      return <ScaleIcon size={size} />;
    case "mood":
      return <SmileIcon size={size} />;
    case "photo":
      return <CameraIcon size={size} />;
    default:
      return <WavesIcon size={size} />;
  }
}

/** 按天气色调取图标 */
export function WeatherIcon({ tone, size = 24 }: { tone: string; size?: number }) {
  if (tone === "sun") return <SunIcon size={size} />;
  if (tone === "rain") return <RainIcon size={size} />;
  return <CloudIcon size={size} />;
}
