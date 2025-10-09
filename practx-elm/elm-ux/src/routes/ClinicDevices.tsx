import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import DeviceTable from '../components/DeviceTable';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ApiClient } from '../lib/api';
import type { DeviceListItem, Lookup } from '../lib/types';

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'In repair', value: 'in_repair' },
  { label: 'Retired', value: 'retired' }
];

const ClinicDevices = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deviceTypes, setDeviceTypes] = useState<Lookup[]>([]);

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') ?? '',
      typeId: searchParams.get('typeId') ?? '',
      status: searchParams.get('status') ?? ''
    }),
    [searchParams]
  );

  useEffect(() => {
    ApiClient.listDeviceTypes()
      .then(setDeviceTypes)
      .catch(() => setDeviceTypes([]));
  }, []);

  useEffect(() => {
    if (!clinicId) {
      return;
    }
    setIsLoading(true);
    setError(null);
    ApiClient.listDevices(clinicId, {
      search: filters.search || undefined,
      typeId: filters.typeId || undefined,
      status: filters.status || undefined
    })
      .then(setDevices)
      .catch((err: Error) => {
        setError(err.message ?? 'Unable to load devices');
      })
      .finally(() => setIsLoading(false));
  }, [clinicId, filters.search, filters.status, filters.typeId]);

  const handleFilterChange = (key: 'search' | 'typeId' | 'status', value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">Clinic devices</h1>
          <p className="text-sm text-brand-muted">
            Review equipment inventory, filter by type or status, and drill into device detail.
          </p>
        </div>
      </header>

      <div className="mb-6 grid gap-4 rounded-lg border border-brand-muted/20 bg-white p-4 shadow-card md:grid-cols-4">
        <div className="md:col-span-2">
          <Label htmlFor="search">Search serial</Label>
          <Input
            id="search"
            placeholder="Search by serial number"
            value={filters.search}
            onChange={(event) => handleFilterChange('search', event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="typeId">Device type</Label>
          <Select value={filters.typeId} onValueChange={(value) => handleFilterChange('typeId', value)}>
            <SelectTrigger id="typeId">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {deviceTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value || 'all'} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : null}

      <DeviceTable devices={devices} isLoading={isLoading} />

      <div className="mt-8 flex justify-end">
        <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} variant="ghost">
          Back to top
        </Button>
      </div>
    </section>
  );
};

export default ClinicDevices;
