import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { clsx } from 'clsx';

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = ToastPrimitive.Viewport;

export interface ToastProps extends ToastPrimitive.ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const Toast: React.FC<ToastProps> = ({ title, description, variant = 'default', ...props }) => (
  <ToastPrimitive.Root
    className={clsx(
      'grid w-[320px] gap-1 rounded-md border border-brand-muted/20 bg-white p-4 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out',
      variant === 'destructive' && 'border-rose-200 bg-rose-50'
    )}
    {...props}
  >
    {title ? <ToastPrimitive.Title className="text-sm font-semibold text-brand-text">{title}</ToastPrimitive.Title> : null}
    {description ? <ToastPrimitive.Description className="text-sm text-brand-muted">{description}</ToastPrimitive.Description> : null}
  </ToastPrimitive.Root>
);
