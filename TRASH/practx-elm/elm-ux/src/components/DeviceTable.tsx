import { Link } from 'react-router-dom';
import type { DeviceListItem } from '../lib/types';
import WarrantyBadge from './WarrantyBadge';

interface DeviceTableProps {
  devices: DeviceListItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const DeviceTable = ({ devices, isLoading = false, emptyMessage = 'No devices found.' }: DeviceTableProps) => {
  if (isLoading) {
    return <p className="p-6 text-sm text-brand-muted">Loading devices…</p>;
  }

  if (!devices.length) {
    return <p className="p-6 text-sm text-brand-muted">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-brand-muted/20 bg-white shadow-card">
      <table className="min-w-full divide-y divide-brand-muted/10">
        <thead className="bg-brand-surface">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">Model</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">Serial</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-muted">Warranty</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-brand-muted">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-muted/10">
          {devices.map((device) => (
            <tr key={device.deviceId} className="hover:bg-brand-surface/60">
              <td className="px-4 py-3 text-sm font-medium text-brand-text">{device.deviceTypeName}</td>
              <td className="px-4 py-3 text-sm text-brand-muted">{device.deviceModelName}</td>
              <td className="px-4 py-3 text-sm text-brand-muted">{device.serialNumber ?? '—'}</td>
              <td className="px-4 py-3 text-sm capitalize text-brand-muted">{device.status.replace('_', ' ')}</td>
              <td className="px-4 py-3 text-sm">
                <WarrantyBadge state={device.warrantyBadge} />
              </td>
              <td className="px-4 py-3 text-right text-sm">
                <Link to={`/devices/${device.deviceId}`} className="font-medium text-brand-primary hover:underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeviceTable;
