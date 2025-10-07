import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type AlertVariant = "info" | "accent" | "success" | "warn" | "danger";

const VARIANTS: Record<AlertVariant, string> = {
  info: "alert--info",
  accent: "alert--accent",
  success: "alert--success",
  warn: "alert--warn",
  danger: "alert--danger"
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

export function Alert({ className, variant = "info", title, children, role = "status", ...props }: AlertProps) {
  return (
    <div className={cn("alert", VARIANTS[variant], className)} role={role} {...props}>
      {title ? <h4 className="alert__title">{title}</h4> : null}
      <div className="alert__content">{children}</div>
    </div>
  );
}
