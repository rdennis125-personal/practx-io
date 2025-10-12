import type { WarrantyBadgeState } from '../lib/types';
import { clsx } from 'clsx';

interface WarrantyBadgeProps {
  state: WarrantyBadgeState;
}

const badgeStyles: Record<WarrantyBadgeState, string> = {
  active: 'bg-emerald-100 text-emerald-700 ring-emerald-400/40',
  expired: 'bg-rose-100 text-rose-700 ring-rose-400/40',
  none: 'bg-brand-surface text-brand-muted ring-brand-muted/30'
};

const labelMap: Record<WarrantyBadgeState, string> = {
  active: 'Active warranty',
  expired: 'Warranty expired',
  none: 'No warranty'
};

const WarrantyBadge = ({ state }: WarrantyBadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        badgeStyles[state]
      )}
    >
      {labelMap[state]}
    </span>
  );
};

export default WarrantyBadge;
