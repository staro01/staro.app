type IconProps = { size?: number; color?: string; strokeWidth?: number };

const base = (size: number, color: string, strokeWidth: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: color,
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function PhoneIcon({ size = 20, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <path d="M5 4h3.4l1.2 4.4-2 1.6a12.5 12.5 0 0 0 6.4 6.4l1.6-2 4.4 1.2V19a2 2 0 0 1-2 2C10.6 21 3 13.4 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function ClipboardIcon({ size = 20, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4a1 1 0 0 1 1-2h4a1 1 0 0 1 1 2v1H9V4Z" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

export function ChartIcon({ size = 20, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M3 20h18" />
    </svg>
  );
}

export function MessageIcon({ size = 20, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <path d="M4 5h16v11H9l-4 4V5Z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  );
}

export function BoltIcon({ size = 24, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" />
    </svg>
  );
}

export function CheckBadgeIcon({ size = 24, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <path d="m9 12 2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function ClockIcon({ size = 24, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function CoinIcon({ size = 24, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.3c0-1.3 1.1-2.3 2.5-2.3s2.5.8 2.5 2-1 1.7-2.5 2-2.5.8-2.5 2 1.1 2 2.5 2 2.5-1 2.5-2.3" />
    </svg>
  );
}

export function TargetIcon({ size = 24, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill={color} />
    </svg>
  );
}

export function TrendingUpIcon({ size = 24, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <path d="M4 16l5-5 4 4 7-8" />
      <path d="M15 7h5v5" />
    </svg>
  );
}

export function ReceiptIcon({ size = 16, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

export function ListIcon({ size = 16, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" fill={color} stroke="none" />
      <circle cx="4.5" cy="12" r="1" fill={color} stroke="none" />
      <circle cx="4.5" cy="18" r="1" fill={color} stroke="none" />
    </svg>
  );
}

export function CalendarIcon({ size = 16, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function InfoIcon({ size = 16, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="8" r="0.9" fill={color} stroke="none" />
    </svg>
  );
}

export function CarIcon({ size = 24, color = "#fff", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, color, strokeWidth)}>
      <path d="M5 16V12l1.8-4.5A2 2 0 0 1 8.65 6h6.7a2 2 0 0 1 1.85 1.5L19 12v4" />
      <path d="M4 16h16v2.5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1V17H7.5v1.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V16Z" />
      <circle cx="7.5" cy="16" r="1.4" fill={color} stroke="none" />
      <circle cx="16.5" cy="16" r="1.4" fill={color} stroke="none" />
    </svg>
  );
}

export function StarIcon({ size = 16, color = "#f5a623" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2.5l2.9 6.4 6.9.7-5.2 4.8 1.5 6.9L12 17.9 5.9 21.3l1.5-6.9-5.2-4.8 6.9-.7L12 2.5Z" />
    </svg>
  );
}
