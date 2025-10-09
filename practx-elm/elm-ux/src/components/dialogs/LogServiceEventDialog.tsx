import { useEffect, useState } from 'react';
import { z } from 'zod';
import type { Lookup, ServiceEvent } from '../../lib/types';
import { ApiClient } from '../../lib/api';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';

const partSchema = z.object({
  partId: z.string().uuid('Enter a valid part ID.'),
  qty: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  lineCost: z
    .union([z.string().length(0), z.coerce.number().nonnegative('Cost must be zero or greater.')])
    .transform((value) => (typeof value === 'number' ? value : undefined))
    .optional()
});

const formSchema = z.object({
  deviceId: z.string().uuid(),
  providerId: z.string().uuid('Select a provider.'),
  serviceTypeId: z.string().uuid('Select a service type.'),
  occurredAt: z.string().min(1, 'Specify the occurrence date and time.'),
  spaceId: z.union([z.string().uuid(), z.literal('')]).optional(),
  warrantyContractId: z.union([z.string().uuid(), z.literal('')]).optional(),
  parts: z.array(partSchema)
});

type PartInput = z.input<typeof partSchema>;
type FormInput = z.input<typeof formSchema>;
type FormState = Omit<FormInput, 'parts'>;

interface LogServiceEventDialogProps {
  deviceId: string;
  providers: Lookup[];
  serviceTypes: Lookup[];
  spaces: Lookup[];
  triggerLabel?: string;
  onLogged?: (event: ServiceEvent) => void;
}

const LogServiceEventDialog = ({
  deviceId,
  providers,
  serviceTypes,
  spaces,
  triggerLabel = 'Log service event',
  onLogged
}: LogServiceEventDialogProps) => {
  const { publish } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [parts, setParts] = useState<PartInput[]>([]);
  const [form, setForm] = useState<FormState>({
    deviceId,
    providerId: '',
    serviceTypeId: '',
    occurredAt: new Date().toISOString().slice(0, 16),
    spaceId: '',
    warrantyContractId: ''
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      providerId: prev.providerId || providers[0]?.id || '',
      serviceTypeId: prev.serviceTypeId || serviceTypes[0]?.id || '',
      spaceId: prev.spaceId || spaces[0]?.id || ''
    }));
  }, [providers, serviceTypes, spaces]);

  const addPartRow = () => {
    setParts((current) => [...current, { partId: '', qty: 1, lineCost: '' }]);
  };

  const removePartRow = (index: number) => {
    setParts((current) => current.filter((_, idx) => idx !== index));
  };

  const updatePart = (index: number, key: keyof PartInput, value: string) => {
    setParts((current) =>
      current.map((part, idx) =>
        idx === index
          ? {
              ...part,
              [key]: key === 'qty' ? (value === '' ? value : Number(value)) : value
            }
          : part
      )
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    const payload: FormInput = {
      ...form,
      spaceId: form.spaceId && form.spaceId.length > 0 ? form.spaceId : '',
      warrantyContractId: form.warrantyContractId && form.warrantyContractId.length > 0 ? form.warrantyContractId : '',
      parts
    };

    const parsed = formSchema.safeParse(payload);
    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      setFieldErrors(Object.fromEntries(Object.entries(issues).map(([key, value]) => [key, value ?? []])));
      return;
    }

    const partsPayload = parsed.data.parts.length
      ? parsed.data.parts.map((part) => ({
          partId: part.partId,
          qty: part.qty,
          lineCost: part.lineCost
        }))
      : undefined;

    setIsSubmitting(true);
    try {
      const result = await ApiClient.createServiceEvent({
        deviceId: parsed.data.deviceId,
        providerId: parsed.data.providerId,
        serviceTypeId: parsed.data.serviceTypeId,
        occurredAt: new Date(parsed.data.occurredAt).toISOString(),
        spaceId: parsed.data.spaceId ? parsed.data.spaceId : undefined,
        warrantyContractId: parsed.data.warrantyContractId ? parsed.data.warrantyContractId : undefined,
        parts: partsPayload
      });
      publish({ title: 'Service logged', description: 'Service event recorded successfully.' });
      setOpen(false);
      onLogged?.(result);
      setParts([]);
    } catch (error) {
      const err = error as { message?: string; response?: { data?: Record<string, unknown> } };
      const serverFieldErrors = (err.response?.data?.fieldErrors ?? err.response?.data?.errors) as
        | Record<string, string[]>
        | undefined;
      if (serverFieldErrors) {
        setFieldErrors(serverFieldErrors);
      }
      publish({
        title: 'Unable to log service event',
        description: err.message ?? 'Validation failed.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isSubmitDisabled = isSubmitting || !form.providerId || !form.serviceTypeId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log service event</DialogTitle>
          <DialogDescription>Capture key service details and parts used for auditing.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="providerId">Provider</Label>
              <Select value={form.providerId} onValueChange={(value) => updateField('providerId', value)}>
                <SelectTrigger id="providerId">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select provider</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.providerId?.map((message) => (
                <p key={message} className="text-xs text-rose-600">
                  {message}
                </p>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceTypeId">Service type</Label>
              <Select value={form.serviceTypeId} onValueChange={(value) => updateField('serviceTypeId', value)}>
                <SelectTrigger id="serviceTypeId">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select service type</SelectItem>
                  {serviceTypes.map((serviceType) => (
                    <SelectItem key={serviceType.id} value={serviceType.id}>
                      {serviceType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.serviceTypeId?.map((message) => (
                <p key={message} className="text-xs text-rose-600">
                  {message}
                </p>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="occurredAt">Occurred at</Label>
              <Input
                id="occurredAt"
                type="datetime-local"
                value={form.occurredAt}
                onChange={(event) => updateField('occurredAt', event.target.value)}
              />
              {fieldErrors.occurredAt?.map((message) => (
                <p key={message} className="text-xs text-rose-600">
                  {message}
                </p>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="spaceId">Space</Label>
              <Select value={form.spaceId ?? ''} onValueChange={(value) => updateField('spaceId', value)}>
                <SelectTrigger id="spaceId">
                  <SelectValue placeholder="Select space" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  {spaces.map((space) => (
                    <SelectItem key={space.id} value={space.id}>
                      {space.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="warrantyContractId">Warranty contract ID</Label>
            <Input
              id="warrantyContractId"
              value={form.warrantyContractId ?? ''}
              onChange={(event) => updateField('warrantyContractId', event.target.value)}
              placeholder="Optional warranty contract ID"
            />
            {fieldErrors.warrantyContractId?.map((message) => (
              <p key={message} className="text-xs text-rose-600">
                {message}
              </p>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-brand-text">Parts used</h3>
              <Button type="button" variant="ghost" onClick={addPartRow}>
                Add part
              </Button>
            </div>
            <div className="space-y-3">
              {parts.length === 0 ? <p className="text-xs text-brand-muted">No parts added.</p> : null}
              {parts.map((part, index) => {
                const partIdErrors = fieldErrors[`parts.${index}.partId`] ?? [];
                const qtyErrors = fieldErrors[`parts.${index}.qty`] ?? [];
                const lineCostErrors = fieldErrors[`parts.${index}.lineCost`] ?? [];
                return (
                  <div key={index} className="grid gap-3 rounded-md border border-brand-muted/20 p-3 md:grid-cols-[2fr,1fr,1fr,auto]">
                    <div className="space-y-2">
                      <Label>Part ID</Label>
                      <Input
                        value={part.partId}
                        onChange={(event) => updatePart(index, 'partId', event.target.value)}
                        placeholder="Part UUID"
                      />
                      {partIdErrors.map((message) => (
                        <p key={message} className="text-xs text-rose-600">
                          {message}
                        </p>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min={1}
                        value={String(part.qty ?? '')}
                        onChange={(event) => updatePart(index, 'qty', event.target.value)}
                      />
                      {qtyErrors.map((message) => (
                        <p key={message} className="text-xs text-rose-600">
                          {message}
                        </p>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>Line cost</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={part.lineCost === undefined ? '' : String(part.lineCost)}
                        onChange={(event) => updatePart(index, 'lineCost', event.target.value)}
                      />
                      {lineCostErrors.map((message) => (
                        <p key={message} className="text-xs text-rose-600">
                          {message}
                        </p>
                      ))}
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="ghost" onClick={() => removePartRow(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
            {isSubmitting ? 'Saving…' : 'Log service event'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LogServiceEventDialog;
