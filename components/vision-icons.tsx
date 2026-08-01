import type { SVGProps } from "react";

type IconProps = { className?: string };

function IconBase({ className, children }: IconProps & Pick<SVGProps<SVGSVGElement>, "children">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Minh bạch trên hết */
export function IconTransparency({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="10" cy="10" r="6" />
      <path d="M20 20l-5.5-5.5" />
    </IconBase>
  );
}

/** An toàn là sức mạnh */
export function IconShield({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
    </IconBase>
  );
}

/** Trao quyền qua thấu hiểu */
export function IconLightbulb({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3a6 6 0 0 0-3 11.2c.6.4 1 1 1 1.8h4c0-.8.4-1.4 1-1.8A6 6 0 0 0 12 3z" />
      <path d="M9 18h6M10 21h4" />
    </IconBase>
  );
}

/** Chính trực mọi lúc */
export function IconIntegrity({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 2l2.2 1.3 2.5-.3 1 2.3 2.3 1-.3 2.5L21 12l-1.3 2.2.3 2.5-2.3 1-1 2.3-2.5-.3L12 22l-2.2-1.3-2.5.3-1-2.3-2.3-1 .3-2.5L3 12l1.3-2.2-.3-2.5 2.3-1 1-2.3 2.5.3L12 2z" />
      <path d="M9 12l2 2 4-4" />
    </IconBase>
  );
}

/** Bền vững */
export function IconSustain({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 20c8 0 14-6 14-14V4h-2C8 4 4 10 4 18v2z" />
      <path d="M4 20c3-5 7-9 12-12" />
    </IconBase>
  );
}

/** Tiến hoá */
export function IconEvolve({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 12a8 8 0 0 1 13.9-5.4M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.9 5.4M4 20v-4h4" />
    </IconBase>
  );
}

/** Đi nhanh — nhưng không bao giờ mù mờ */
export function IconTrendingUp({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 17l5-5 4 4 7-8" />
      <path d="M15 8h5v5" />
    </IconBase>
  );
}

/** Quan tâm người dùng, không chỉ chỉ số */
export function IconTarget({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

/** Hành động như người chủ */
export function IconRocket({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 2c2.5 2 4 6 3 12l-3 3-3-3c-1-6 .5-10 3-12z" />
      <circle cx="12" cy="9" r="1.3" fill="currentColor" stroke="none" />
      <path d="M8 15l-2 4 4-2M16 15l2 4-4-2" />
    </IconBase>
  );
}
