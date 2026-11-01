type IslandMarkProps = {
  className?: string;
};

/**
 * 茸屿的品牌标记：一只蹲在小岛上的猫。
 * 纯 SVG 内联，不依赖图片资源与网络。
 */
export function IslandMark({ className }: IslandMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 108"
      role="img"
      aria-label="茸屿：一只蹲在小岛上的猫"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="pawisle-halo" cx="50%" cy="46%" r="56%">
          <stop offset="0%" stopColor="#F6EAF7" stopOpacity="0.95" />
          <stop offset="62%" stopColor="#FDF0E4" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FDF0E4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pawisle-cat" x1="30%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#8FB89A" />
          <stop offset="100%" stopColor="#5E8A6D" />
        </linearGradient>
        <linearGradient id="pawisle-island" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F7DFC9" />
          <stop offset="100%" stopColor="#EFCDB4" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="52" rx="50" ry="44" fill="url(#pawisle-halo)" />

      <circle cx="93" cy="30" r="7" fill="#F2C6AE" opacity="0.55" />
      <circle cx="24" cy="26" r="4.4" fill="#DCCCEE" opacity="0.7" />
      <circle cx="33" cy="70" r="3.2" fill="#DCCCEE" opacity="0.5" />

      <ellipse cx="60" cy="86" rx="43" ry="13" fill="url(#pawisle-island)" />

      <path
        d="M47.5 87c0-19 4.5-25 12.5-25s12.5 6 12.5 25z"
        fill="url(#pawisle-cat)"
      />
      <circle cx="60" cy="53" r="13.2" fill="url(#pawisle-cat)" />
      <path d="M49.2 46.3 45.1 31.2 59.4 40.1z" fill="url(#pawisle-cat)" />
      <path d="M70.8 46.3 74.9 31.2 60.6 40.1z" fill="url(#pawisle-cat)" />

      <circle cx="55" cy="52.4" r="1.75" fill="#FFFCF7" />
      <circle cx="65" cy="52.4" r="1.75" fill="#FFFCF7" />
      <path
        d="M57.4 57.6q2.6 2.2 5.2 0"
        stroke="#FFFCF7"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />

      <path
        d="M71.5 82c12-1.6 14-12.5 5.5-17.5"
        stroke="#577F66"
        strokeWidth="4.6"
        strokeLinecap="round"
        fill="none"
      />

      <circle cx="45" cy="90" r="2.1" fill="#E7A98C" opacity="0.55" />
      <circle cx="74" cy="91" r="1.7" fill="#E7A98C" opacity="0.45" />
    </svg>
  );
}
