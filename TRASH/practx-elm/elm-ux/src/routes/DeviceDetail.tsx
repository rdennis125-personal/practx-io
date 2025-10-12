import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiClient } from '../lib/api';
import type { DeviceDetail as DeviceDetailType, Lookup, ServiceEvent, WarrantyActive } from '../lib/types';
import WarrantyBadge from '../components/WarrantyBadge';
import RegisterWarrantyDialog from '../components/dialogs/RegisterWarrantyDialog';
import LogServiceEventDialog from '../components/dialogs/LogServiceEventDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const DeviceDetail = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [detail, setDetail] = useState<DeviceDetailType | null>(null);
  const [warranty, setWarranty] = useState<WarrantyActive | null>(null);
  const [warrantyDate, setWarrantyDate] = useState(new Date().toISOString().slice(0, 10));
  const [serviceTypes, setServiceTypes] = useState<Lookup[]>([]);
  const [providers, setProviders] = useState<Lookup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiClient.listServiceTypes().then(setServiceTypes).catch(() => setServiceTypes([]));
    ApiClient.listProviders().then(setProviders).catch(() => setProviders([]));
  }, []);

  useEffect(() => {
    if (!deviceId) {
      return;
    }
    setIsLoading(true);
    setError(null);
    ApiClient.getDeviceDetail(deviceId)
      .then((data) => {
        setDetail(data);
      })
      .catch((err: Error) => setError(err.message ?? 'Unable to load device'))
      .finally(() => setIsLoading(false));
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) {
      return;
    }
    ApiClient.getActiveWarranty(deviceId, warrantyDate)
      .then(setWarranty)
      .catch(() => setWarranty(null));
  }, [deviceId, warrantyDate]);

  const spaces: Lookup[] = useMemo(
    () => detail?.spaces.map((space) => ({ id: space.spaceId, name: `${space.name} (${space.kind})` })) ?? [],
    [detail]
  );

  const handleServiceLogged = (event: ServiceEvent) => {
    setDetail((current) =>
      current
        ? {
            ...current,
            serviceEvents: [event, ...current.serviceEvents]
          }
        : current
    );
  };

  const handleWarrantyRegistered = () => {
    if (deviceId) {
      ApiClient.getActiveWarranty(deviceId, warrantyDate).then(setWarranty);
    }
  };

  if (isLoading) {
    return <p className="p-6 text-sm text-brand-muted">Loading device…</p>;
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 w-full max-w-4xl rounded-md border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!detail || !deviceId) {
    return null;
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-6 rounded-xl border border-brand-muted/20 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-brand-text">{detail.deviceModelName}</h1>
              <p className="text-sm text-brand-muted">{detail.deviceTypeName}</p>
            </div>
            <WarrantyBadge state={warranty?.status ?? detail.warrantyBadge} />
          </div>
          <div className="grid gap-4 text-sm text-brand-muted sm:grid-cols-2">
            <div>
              <span className="font-semibold text-brand-text">Serial:</span> {detail.serialNumber ?? '—'}
            </div>
            <div>
              <span className="font-semibold text-brand-text">Status:</span> {detail.status.replace('_', ' ')}
            </div>
            <div>
              <span className="font-semibold text-brand-text">Installed:</span>{' '}
              {detail.installedAt ? new Date(detail.installedAt).toLocaleDateString() : '—'}
            </div>
            <div>
              <span className="font-semibold text-brand-text">Spaces:</span>{' '}
              {detail.spaces.length ? detail.spaces.map((space) => space.name).join(', ') : '—'}
            </div>
          </div>
          {detail.notes ? <p className="rounded-md bg-brand-surface p-4 text-sm text-brand-muted">{detail.notes}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RegisterWarrantyDialog deviceId={deviceId} onRegistered={handleWarrantyRegistered} />
          <LogServiceEventDialog
            deviceId={deviceId}
            providers={providers}
            serviceTypes={serviceTypes}
            spaces={spaces}
            onLogged={handleServiceLogged}
          />
        </div>
      </div>

      <div className="rounded-xl border border-brand-muted/20 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-brand-text">Warranty coverage</h2>
            <p className="text-sm text-brand-muted">
              Review warranty status for a specific date to confirm coverage and service eligibility.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input type="date" value={warrantyDate} onChange={(event) => setWarrantyDate(event.target.value)} />
            <Button variant="ghost" onClick={() => setWarrantyDate(new Date().toISOString().slice(0, 10))}>
              Today
            </Button>
          </div>
        </div>
        <div className="mt-4 grid gap-4 rounded-lg border border-dashed border-brand-muted/30 p-4 text-sm text-brand-muted md:grid-cols-2">
          <div>
            <p className="font-semibold text-brand-text">Status</p>
            <p className="mt-1 capitalize">{warranty?.status ?? 'none'}</p>
          </div>
          <div>
            <p className="font-semibold text-brand-text">Contract</p>
            <p className="mt-1 break-all">{warranty?.warrantyContractId ?? '—'}</p>
          </div>
          <div>
            <p className="font-semibold text-brand-text">Effective</p>
            <p className="mt-1">{warranty?.effectiveOn ?? '—'}</p>
          </div>
          <div>
            <p className="font-semibold text-brand-text">Expires</p>
            <p className="mt-1">{warranty?.expiresOn ?? '—'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="font-semibold text-brand-text">Covered service types</p>
            {warranty?.coveredServiceTypeIds?.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {warranty.coveredServiceTypeIds.map((id) => (
                  <li key={id} className="break-all">
                    {id}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1">No services covered.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-brand-muted/20 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-text">Service history</h2>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-brand-muted/20">
          <table className="min-w-full divide-y divide-brand-muted/10 text-sm">
            <thead className="bg-brand-surface">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-brand-muted">Event ID</th>
                <th className="px-4 py-2 text-left font-semibold text-brand-muted">Provider</th>
                <th className="px-4 py-2 text-left font-semibold text-brand-muted">Service type</th>
                <th className="px-4 py-2 text-left font-semibold text-brand-muted">Occurred</th>
                <th className="px-4 py-2 text-left font-semibold text-brand-muted">Warranty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-muted/10">
              {detail.serviceEvents.length ? (
                detail.serviceEvents.map((event) => (
                  <tr key={event.eventId} className="hover:bg-brand-surface/60">
                    <td className="px-4 py-2 font-mono text-xs text-brand-muted">{event.eventId}</td>
                    <td className="px-4 py-2 text-brand-text">{event.providerId}</td>
                    <td className="px-4 py-2 text-brand-text">{event.serviceTypeId}</td>
                    <td className="px-4 py-2 text-brand-text">{new Date(event.occurredAt).toLocaleString()}</td>
                    <td className="px-4 py-2 text-brand-text">{event.warrantyContractId ?? '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-brand-muted">
                    No service events recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default DeviceDetail;
