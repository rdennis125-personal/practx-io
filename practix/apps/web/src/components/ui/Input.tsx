"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  wrapperClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, errorText, className, wrapperClassName, id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = errorText ? `${inputId}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("flex flex-col gap-2", wrapperClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
            {label}
            {required ? <span className="ml-1 text-danger">*</span> : null}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn("input-base", className, errorText && "border-danger text-danger")}
          aria-invalid={errorText ? "true" : undefined}
          aria-describedby={describedBy}
          required={required}
          {...props}
        />
        {helperText && !errorText && (
          <p id={helperId} className="helper-text">
            {helperText}
          </p>
        )}
        {errorText && (
          <p id={errorId} className="helper-text helper-text--error">
            {errorText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
