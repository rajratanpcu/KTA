import apiClient from '../lib/api-client';

// ===== Types =====

export interface ProductResponse {
  id: number;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  categoryId: number | null;
  categoryName: string | null;
  unitId: number | null;
  unitName: string | null;
  unitAbbreviation: string | null;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  minStockLevel: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId?: number;
  unitId?: number;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  minStockLevel?: number;
  active?: boolean;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  active?: boolean;
}

export interface GodownResponse {
  id: number;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string | null;
  contactPhone: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GodownRequest {
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson?: string;
  contactPhone?: string;
  active?: boolean;
}

// ===== Product API =====

export const productApi = {
  getAll: () =>
    apiClient.get<ProductResponse[]>('/products').then((r) => r.data),

  getActive: () =>
    apiClient.get<ProductResponse[]>('/products/active').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<ProductResponse>(`/products/${id}`).then((r) => r.data),

  search: (query: string) =>
    apiClient.get<ProductResponse[]>('/products/search', { params: { query } }).then((r) => r.data),

  create: (data: ProductRequest) =>
    apiClient.post<ProductResponse>('/products', data).then((r) => r.data),

  update: (id: number, data: ProductRequest) =>
    apiClient.put<ProductResponse>(`/products/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/products/${id}`).then((r) => r.data),
};

// ===== Category API =====

export const categoryApi = {
  getAll: () =>
    apiClient.get<CategoryResponse[]>('/categories').then((r) => r.data),

  getActive: () =>
    apiClient.get<CategoryResponse[]>('/categories/active').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<CategoryResponse>(`/categories/${id}`).then((r) => r.data),

  create: (data: CategoryRequest) =>
    apiClient.post<CategoryResponse>('/categories', data).then((r) => r.data),

  update: (id: number, data: CategoryRequest) =>
    apiClient.put<CategoryResponse>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/categories/${id}`).then((r) => r.data),
};

// ===== Godown API =====

export const godownApi = {
  getAll: () =>
    apiClient.get<GodownResponse[]>('/godowns').then((r) => r.data),

  getActive: () =>
    apiClient.get<GodownResponse[]>('/godowns/active').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<GodownResponse>(`/godowns/${id}`).then((r) => r.data),

  create: (data: GodownRequest) =>
    apiClient.post<GodownResponse>('/godowns', data).then((r) => r.data),

  update: (id: number, data: GodownRequest) =>
    apiClient.put<GodownResponse>(`/godowns/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/godowns/${id}`).then((r) => r.data),
};
