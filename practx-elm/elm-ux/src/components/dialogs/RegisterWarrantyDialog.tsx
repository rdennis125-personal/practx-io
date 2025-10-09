import { useState } from 'react';
import { z } from 'zod';
import type { WarrantyContract } from '../../lib/types';
import { ApiClient } from '../../lib/api';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';

const formSchema = z.object({
  manufacturerId: z.string().uuid('Enter a valid manufacturer ID.'),
  warrantyDefId: z.string().uuid('Enter a valid warranty definition ID.'),
  registeredOn: z.string().min(1, 'Select a registration date.'),
  deviceId: z.string().uuid()
});

type FormState = z.infer<typeof formSchema>;

interface RegisterWarrantyDialogProps {
  deviceId: string;
  triggerLabel?: string;
  onRegistered?: (warranty: WarrantyContract) => void;
}

const RegisterWarrantyDialog = ({ deviceId, triggerLabel = 'Register warranty', onRegistered }: RegisterWarrantyDialogProps) => {
  const { publish } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState<FormState>({
    deviceId,
    manufacturerId: '33333333-3333-3333-3333-333333333333',
    warrantyDefId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    registeredOn: new Date().toISOString().slice(0, 10)
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      setFieldErrors(Object.fromEntries(Object.entries(issues).map(([key, value]) => [key, value ?? []])));
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = parsed.data;
      const result = await ApiClient.createWarrantyContract(payload);
      publish({ title: 'Warranty registered', description: 'Warranty contract saved successfully.' });
      setOpen(false);
      onRegistered?.(result);
    } catch (error) {
      const err = error as { message?: string; response?: { data?: Record<string, unknown> } };
      const serverFieldErrors = (err.response?.data?.fieldErrors ?? err.response?.data?.errors) as
        | Record<string, string[]>
        | undefined;
      if (serverFieldErrors) {
        setFieldErrors(serverFieldErrors);
      }
      publish({
        title: 'Unable to register warranty',
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register warranty</DialogTitle>
          <DialogDescription>Provide the manufacturer and warranty definition IDs from the contract.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="manufacturerId">Manufacturer ID</Label>
            <Input
              id="manufacturerId"
              value={form.manufacturerId}
              onChange={(event) => updateField('manufacturerId', event.target.value)}
              placeholder="33333333-3333-3333-3333-333333333333"
            />
            {fieldErrors.manufacturerId?.map((message) => (
              <p key={message} className="text-xs text-rose-600">
                {message}
              </p>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="warrantyDefId">Warranty definition ID</Label>
            <Input
              id="warrantyDefId"
              value={form.warrantyDefId}
              onChange={(event) => updateField('warrantyDefId', event.target.value)}
              placeholder="ffffffff-ffff-ffff-ffff-ffffffffffff"
            />
            {fieldErrors.warrantyDefId?.map((message) => (
              <p key={message} className="text-xs text-rose-600">
                {message}
              </p>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="registeredOn">Registered on</Label>
            <Input
              id="registeredOn"
              type="date"
              value={form.registeredOn}
              onChange={(event) => updateField('registeredOn', event.target.value)}
            />
            {fieldErrors.registeredOn?.map((message) => (
              <p key={message} className="text-xs text-rose-600">
                {message}
              </p>
            ))}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Register warranty'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterWarrantyDialog;
