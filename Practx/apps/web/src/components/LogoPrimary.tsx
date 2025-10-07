"use client";

import { HTMLAttributes, useId } from "react";
import type { CSSProperties } from "react";
import { LogoVariant, useLogoVariant } from "./useLogoVariant";

type LogoPrimaryProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: LogoVariant;
  width?: number;
  title?: string;
};

const LIGHT_PALETTE = {
  wordmark: "#2F7CC4",
  ringStart: "#80D4FA",
  ringEnd: "#2F7CC4",
  glyph: "#64B5F6",
  spark: "#6F9FF4"
};

const DARK_PALETTE = {
  wordmark: "#FFFFFF",
  ringStart: "rgba(255, 255, 255, 0.78)",
  ringEnd: "rgba(255, 255, 255, 0.56)",
  glyph: "#FFFFFF",
  spark: "rgba(255, 255, 255, 0.85)"
};

const ASPECT_RATIO = 320 / 120;
const CLEAR_SPACE_RATIO = 0.32;
const MIN_WIDTH = 140;

export function LogoPrimary({
  variant = "auto",
  width = 220,
  title = "Practx logo",
  className,
  style,
  ...rest
}: LogoPrimaryProps) {
  const { containerRef, resolvedVariant } = useLogoVariant(variant);
  const palette = resolvedVariant === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
  const gradientId = useId();
  const computedWidth = Math.max(width, MIN_WIDTH);
  const computedHeight = Math.round((computedWidth / ASPECT_RATIO) * 100) / 100;
  const clearSpace = Math.round(computedHeight * CLEAR_SPACE_RATIO);
  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `${clearSpace}px`,
    minWidth: computedWidth,
    minHeight: computedHeight + clearSpace * 2
  };

  return (
    <span
      ref={containerRef}
      className={["practx-logo", className].filter(Boolean).join(" ")}
      style={{ ...baseStyle, ...style }}
      {...rest}
    >
      <svg
        width={computedWidth}
        height={computedHeight}
        viewBox="0 0 320 120"
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
        <g>
          <circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke={`url(#${gradientId}-ring)`}
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M36 28h22c16.569 0 30 13.431 30 30s-13.431 30-30 30h-8v22H36V28zm14 16v28h8c8.837 0 16-7.163 16-16s-7.163-16-16-16h-8z"
            fill={palette.glyph}
          />
          <circle cx="90" cy="28" r="7" fill={palette.spark} />
        </g>
        <text
          x="140"
          y="78"
          fontFamily="DM Sans, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          fontSize="56"
          fontWeight="700"
          letterSpacing="2"
          fill={palette.wordmark}
        >
          Practx
        </text>
      </svg>
    </span>
  );
}
