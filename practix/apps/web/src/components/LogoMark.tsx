"use client";

import { HTMLAttributes, useId } from "react";
import type { CSSProperties } from "react";
import { LogoVariant, useLogoVariant } from "./useLogoVariant";

type LogoMarkProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: LogoVariant;
  size?: number;
  title?: string;
};

const LIGHT_PALETTE = {
  ringStart: "#80D4FA",
  ringEnd: "#2F7CC4",
  fill: "#64B5F6",
  spark: "#6F9FF4"
};

const DARK_PALETTE = {
  ringStart: "rgba(255, 255, 255, 0.78)",
  ringEnd: "rgba(255, 255, 255, 0.56)",
  fill: "#FFFFFF",
  spark: "rgba(255, 255, 255, 0.85)"
};

const CLEAR_SPACE_RATIO = 0.28;

export function LogoMark({
  variant = "auto",
  size = 48,
  title = "Practx logomark",
  className,
  style,
  ...rest
}: LogoMarkProps) {
  const { containerRef, resolvedVariant } = useLogoVariant(variant);
  const palette = resolvedVariant === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
  const gradientId = useId();
  const clearSpace = Math.round(size * CLEAR_SPACE_RATIO);
  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `${clearSpace}px`,
    minWidth: size + clearSpace * 2,
    minHeight: size + clearSpace * 2
  };

  return (
    <span
      ref={containerRef}
      className={["practx-logo-mark", className].filter(Boolean).join(" ")}
      style={{ ...baseStyle, ...style }}
      {...rest}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 96 96"
        role="img"
        aria-label={title}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${gradientId}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.ringStart} />
            <stop offset="100%" stopColor={palette.ringEnd} />
          </linearGradient>
        </defs>
        <circle
          cx="48"
          cy="48"
          r="34"
          fill="none"
          stroke={`url(#${gradientId}-ring)`}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M36 24h18c13.255 0 24 10.745 24 24S67.255 72 54 72h-6v12H36V24zm12 14v20h6c5.523 0 10-4.477 10-10s-4.477-10-10-10h-6z"
          fill={palette.fill}
        />
        <circle cx="70" cy="24" r="6" fill={palette.spark} />
      </svg>
    </span>
  );
}
