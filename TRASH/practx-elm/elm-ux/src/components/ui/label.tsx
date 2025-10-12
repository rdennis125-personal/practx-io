import * as React from 'react';
import { clsx } from 'clsx';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={clsx('text-sm font-medium text-brand-text', className)} {...props} />
  )
);

Label.displayName = 'Label';
