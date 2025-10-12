"use client";

import { useEffect, useRef, useState } from "react";

type Variant = "light" | "dark";
export type LogoVariant = "auto" | Variant;

function parseColor(input: string): [number, number, number] | null {
  if (!input) {
    return null;
  }
  const trimmed = input.trim().toLowerCase();
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    const normalized = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    if (normalized.length !== 6) {
      return null;
    }
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return [r, g, b];
  }

  const rgbMatch = trimmed.match(/rgba?\(([^)]+)\)/);
  if (rgbMatch) {
    const parts = rgbMatch[1]
      .split(",")
      .map((component) => component.trim())
      .map((component) => component.endsWith("%") ? Number(component.replace("%", "")) * 2.55 : Number(component));
    if (parts.length >= 3 && parts.every((value) => Number.isFinite(value))) {
      return [parts[0], parts[1], parts[2]] as [number, number, number];
    }
  }

  return null;
}

function relativeLuminance(color: string): number {
  const rgb = parseColor(color);
  if (!rgb) {
    return 1;
  }
  const [r, g, b] = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function useLogoVariant(preferred: LogoVariant) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [resolved, setResolved] = useState<Variant>(preferred === "dark" ? "dark" : "light");

  useEffect(() => {
    if (preferred !== "auto" || typeof window === "undefined") {
      setResolved(preferred === "dark" ? "dark" : "light");
      return;
    }

    const updateVariant = () => {
      const node = containerRef.current;
      if (!node) {
        return;
      }

      let current: HTMLElement | null = node;
      let background = "";
      while (current) {
        const style = window.getComputedStyle(current);
        const bg = style.backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          background = bg;
          break;
        }
        current = current.parentElement;
      }

      if (!background) {
        background = window.getComputedStyle(document.body).backgroundColor || "#ffffff";
      }

      const luminance = relativeLuminance(background);
      setResolved(luminance < 0.55 ? "dark" : "light");
    };

    updateVariant();

    const resizeListener = () => updateVariant();
    window.addEventListener("resize", resizeListener);

    const parent = containerRef.current?.parentElement;
    const observer = parent
      ? new MutationObserver(() => {
          updateVariant();
        })
      : null;

    if (parent && observer) {
      observer.observe(parent, { attributes: true, attributeFilter: ["class", "style"] });
    }

    return () => {
      window.removeEventListener("resize", resizeListener);
      observer?.disconnect();
    };
  }, [preferred]);

  return { containerRef, resolvedVariant: resolved };
}
