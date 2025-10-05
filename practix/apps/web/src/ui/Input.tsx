"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BaseInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

type BaseTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows" | "cols">;

export type InputProps = BaseInputProps &
  BaseTextareaProps & {
    label?: string;
    helperText?: string;
    errorText?: string;
    multiline?: boolean;
  };

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ id, label, helperText, errorText, multiline = false, className, required, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const helperId = helperText ? `${fieldId}-helper` : undefined;
    const errorId = errorText ? `${fieldId}-error` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;
    const hasError = Boolean(errorText);

    const sharedProps = {
      id: fieldId,
      ref,
      required,
      "aria-invalid": hasError || undefined,
      "aria-describedby": describedBy,
      className: cn("input", hasError && "input--error", className)
    };

    return (
      <div className="input-field">
        {label ? (
          <label className="input-field__label" htmlFor={fieldId}>
            {label}
            {required ? <span aria-hidden className="input-field__required">*</span> : null}
          </label>
        ) : null}
        {multiline ? (
          <textarea {...(props as BaseTextareaProps)} {...sharedProps} />
        ) : (
          <input {...(props as BaseInputProps)} {...sharedProps} />
        )}
        {errorText ? (
          <p id={errorId} className="input-field__message input-field__message--error">
            {errorText}
          </p>
        ) : null}
        {helperText ? (
          <p id={helperId} className="input-field__message">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
