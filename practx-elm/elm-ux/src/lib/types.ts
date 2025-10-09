export type DeviceStatus = 'active' | 'in_repair' | 'retired';
export type WarrantyBadgeState = 'active' | 'expired' | 'none';

export interface Lookup {
  id: string;
  name: string;
}

export interface DeviceListItem {
  deviceId: string;
  deviceTypeId: string;
  deviceTypeName: string;
  deviceModelId: string;
  deviceModelName: string;
  status: DeviceStatus;
  installedAt?: string | null;
  serialNumber?: string | null;
  warrantyBadge: WarrantyBadgeState;
}

export interface DeviceDetail extends DeviceListItem {
  notes?: string | null;
  spaces: Array<{
    spaceId: string;
    name: string;
    kind: string;
  }>;
  serviceEvents: ServiceEvent[];
}

export interface WarrantyActive {
  warrantyContractId?: string | null;
  warrantyDefId?: string | null;
  name?: string | null;
  effectiveOn?: string | null;
  expiresOn?: string | null;
  coveredServiceTypeIds: string[];
  status: WarrantyBadgeState;
}

export interface WarrantyContractCreate {
  deviceId: string;
  manufacturerId: string;
  warrantyDefId: string;
  registeredOn: string;
}

export interface WarrantyContract {
  warrantyContractId: string;
  deviceId: string;
  manufacturerId: string;
  warrantyDefId: string;
  effectiveOn: string;
  expiresOn: string;
  status: string;
}

export interface ServiceEventPart {
  partId: string;
  qty: number;
  lineCost?: number;
}

export interface ServiceEventCreate {
  deviceId: string;
  providerId: string;
  serviceTypeId: string;
  occurredAt: string;
  spaceId?: string | null;
  warrantyContractId?: string | null;
  parts?: ServiceEventPart[];
}

export interface ServiceEvent {
  eventId: string;
  deviceId: string;
  providerId: string;
  serviceTypeId: string;
  occurredAt: string;
  warrantyContractId?: string | null;
}

export interface ApiValidationError {
  message: string;
  fieldErrors?: Record<string, string[]>;
}
