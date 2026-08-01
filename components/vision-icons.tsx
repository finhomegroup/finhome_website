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

function IconBaseFilled({ className, children }: IconProps & Pick<SVGProps<SVGSVGElement>, "children">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Minh bạch */
export function IconVerifiedBadge({ className }: IconProps) {
  return (
    <IconBaseFilled className={className}>
      <path d="M12 2l2.2 1.3 2.5-.3 1 2.3 2.3 1-.3 2.5L21 12l-1.3 2.2.3 2.5-2.3 1-1 2.3-2.5-.3L12 22l-2.2-1.3-2.5.3-1-2.3-2.3-1 .3-2.5L3 12l1.3-2.2-.3-2.5 2.3-1 1-2.3 2.5.3L12 2z" />
      <path
        d="M9 12.2l1.8 1.8 3.7-4"
        fill="none"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBaseFilled>
  );
}

/** An toàn */
export function IconShieldFilled({ className }: IconProps) {
  return (
    <IconBaseFilled className={className}>
      <path d="M12 2.5l7.5 3v6c0 5.2-3.7 8.3-7.5 9.5-3.8-1.2-7.5-4.3-7.5-9.5v-6l7.5-3z" />
      <circle cx="12" cy="12" r="1.6" fill="white" />
    </IconBaseFilled>
  );
}

/** Thấu hiểu */
export function IconChatDots({ className }: IconProps) {
  return (
    <IconBaseFilled className={className}>
      <path d="M12 3C6.9 3 3 6.4 3 10.6c0 2.1 1 4 2.6 5.4-.1.9-.4 2-1.1 3.1a.5.5 0 0 0 .6.7c1.5-.5 2.7-1.1 3.5-1.7 1 .3 2.2.5 3.4.5 5.1 0 9-3.4 9-7.6S17.1 3 12 3z" />
      <circle cx="8.5" cy="10.6" r="1.1" fill="white" />
      <circle cx="12" cy="10.6" r="1.1" fill="white" />
      <circle cx="15.5" cy="10.6" r="1.1" fill="white" />
    </IconBaseFilled>
  );
}

/** Chuẩn mực */
export function IconCompassFilled({ className }: IconProps) {
  return (
    <IconBaseFilled className={className}>
      <circle cx="12" cy="12" r="9.5" />
      <path
        d="M15 9l-4.5 1.5L9 15l4.5-1.5L15 9z"
        fill="white"
      />
    </IconBaseFilled>
  );
}

/** Cải tiến */
export function IconSparkle({ className }: IconProps) {
  return (
    <IconBaseFilled className={className}>
      <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" />
      <path d="M19 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
    </IconBaseFilled>
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
