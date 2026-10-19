import apiClient from '../lib/api-client';

export interface SupplierResponse {
  id: number;
  code: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string | null;
  balance: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierRequest {
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  balance?: number;
  active?: boolean;
}

export interface CustomerResponse {
  id: number;
  code: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string | null;
  balance: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequest {
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  balance?: number;
  active?: boolean;
}

export const supplierApi = {
  getAll: () => apiClient.get<SupplierResponse[]>('/suppliers').then((r) => r.data),
  getActive: () => apiClient.get<SupplierResponse[]>('/suppliers/active').then((r) => r.data),
  getById: (id: number) => apiClient.get<SupplierResponse>(`/suppliers/${id}`).then((r) => r.data),
  create: (data: SupplierRequest) => apiClient.post<SupplierResponse>('/suppliers', data).then((r) => r.data),
  update: (id: number, data: SupplierRequest) => apiClient.put<SupplierResponse>(`/suppliers/${id}`, data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/suppliers/${id}`).then((r) => r.data),
};

export const customerApi = {
  getAll: () => apiClient.get<CustomerResponse[]>('/customers').then((r) => r.data),
  getActive: () => apiClient.get<CustomerResponse[]>('/customers/active').then((r) => r.data),
  getById: (id: number) => apiClient.get<CustomerResponse>(`/customers/${id}`).then((r) => r.data),
  create: (data: CustomerRequest) => apiClient.post<CustomerResponse>('/customers', data).then((r) => r.data),
  update: (id: number, data: CustomerRequest) => apiClient.put<CustomerResponse>(`/customers/${id}`, data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/customers/${id}`).then((r) => r.data),
};
