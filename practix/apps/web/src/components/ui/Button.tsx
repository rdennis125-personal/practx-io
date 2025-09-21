"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "subtle" | "ghost" | "destructive";
export type ButtonSize = "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn--primary",
  subtle: "btn--subtle",
  ghost: "btn--ghost",
  destructive: "btn--destructive"
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  md: "",
  lg: "btn--lg",
  icon: "btn--icon"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn("btn", VARIANT_CLASS[variant], SIZE_CLASS[size], className)}
      {...props}
    />
  )
);

Button.displayName = "Button";
