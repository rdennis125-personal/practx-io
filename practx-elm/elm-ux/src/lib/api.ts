import axios from 'axios';
import type {
  DeviceDetail,
  DeviceListItem,
  Lookup,
  ServiceEvent,
  ServiceEventCreate,
  WarrantyActive,
  WarrantyContract,
  WarrantyContractCreate
} from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5080',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const data = error.response.data as { message?: string } | undefined;
      error.message = data?.message ?? error.message;
    }
    return Promise.reject(error);
  }
);

export const ApiClient = {
  listDevices: async (clinicId: string, params: { typeId?: string; status?: string; search?: string }) => {
    const response = await api.get<DeviceListItem[]>(`/clinics/${clinicId}/devices`, { params });
    return response.data;
  },
  getDeviceDetail: async (deviceId: string) => {
    const response = await api.get<DeviceDetail>(`/devices/${deviceId}`);
    return response.data;
  },
  getActiveWarranty: async (deviceId: string, date: string) => {
    const response = await api.get<WarrantyActive>(`/devices/${deviceId}/warranty/active`, {
      params: { on: date }
    });
    return response.data;
  },
  createWarrantyContract: async (payload: WarrantyContractCreate) => {
    const response = await api.post<WarrantyContract>('/warranties/contracts', payload);
    return response.data;
  },
  createServiceEvent: async (payload: ServiceEventCreate) => {
    const response = await api.post<ServiceEvent>('/service-events', payload);
    return response.data;
  },
  listServiceTypes: async () => {
    const response = await api.get<Lookup[]>('/lookups/service-types');
    return response.data;
  },
  listDeviceTypes: async () => {
    const response = await api.get<Lookup[]>('/lookups/device-types');
    return response.data;
  },
  listProviders: async () => {
    const response = await api.get<Lookup[]>('/lookups/providers');
    return response.data;
  }
};

export default api;
