import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { clsx } from 'clsx';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectPrimitive.SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={clsx(
        'flex h-10 w-full items-center justify-between rounded-md border border-brand-muted/30 bg-white px-3 py-2 text-sm text-brand-text shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="ml-2 text-brand-muted">
        <ChevronDownIcon className="h-4 w-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
);

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<HTMLDivElement, SelectPrimitive.SelectContentProps>(
  ({ className, children, position = 'popper', ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={clsx(
          'z-50 min-w-[8rem] overflow-hidden rounded-md border border-brand-muted/20 bg-white text-brand-text shadow-lg',
          position === 'popper' && 'translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);

SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = React.forwardRef<HTMLDivElement, SelectPrimitive.SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={clsx(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-brand-text outline-none focus:bg-brand-surface focus:text-brand-primary',
        className
      )}
      {...props}
    >
      <span className="flex h-3.5 w-3.5 items-center justify-center text-brand-primary">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
);

SelectItem.displayName = SelectPrimitive.Item.displayName;
