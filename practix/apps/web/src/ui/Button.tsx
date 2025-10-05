"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "accent" | "ghost";
export type ButtonSize = "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "btn--primary",
  accent: "btn--accent",
  ghost: "btn--ghost"
};

const SIZES: Record<ButtonSize, string> = {
  md: "",
  lg: "btn--lg"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading = false, disabled, leftIcon, rightIcon, children, type, ...props },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn("btn", VARIANTS[variant], SIZES[size], loading && "btn--loading", className)}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {leftIcon ? <span className="btn__icon" aria-hidden>{leftIcon}</span> : null}
        <span className="btn__label">{children}</span>
        {loading ? (
          <span className="btn__spinner" aria-hidden />
        ) : rightIcon ? (
          <span className="btn__icon" aria-hidden>{rightIcon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";
