import apiClient from '../lib/api-client';

// ===== Stock Balance =====

export interface StockBalanceResponse {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  godownId: number;
  godownName: string;
  godownCode: string;
  availableQuantity: number;
  reservedQuantity: number;
  inTransitQuantity: number;
  totalQuantity: number;
  reorderLevel: number | null;
  lowStock: boolean;
  unit: string;
  lastCountedAt: string | null;
  updatedAt: string;
}

// ===== Stock Movement =====

export interface StockMovementResponse {
  id: number;
  movementNumber: string;
  movementType: string;
  productId: number;
  productName: string;
  productSku: string;
  godownId: number;
  godownName: string;
  quantity: number;
  unit: string;
  direction: 'IN' | 'OUT';
  referenceType: string | null;
  referenceId: number | null;
  referenceNumber: string | null;
  batchNumber: string | null;
  notes: string | null;
  movementDate: string;
  createdById: number;
  createdByName: string;
  createdAt: string;
}

export interface StockMovementRequest {
  movementType: string;
  productId: number;
  godownId: number;
  quantity: number;
  unit: string;
  referenceType?: string;
  referenceId?: number;
  referenceNumber?: string;
  batchNumber?: string;
  notes?: string;
}

// ===== Stock Transfer =====

export interface StockTransferItemResponse {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  receivedQuantity: number;
  unit: string;
  notes: string | null;
}

export interface StockTransferItemRequest {
  productId: number;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface StockTransferResponse {
  id: number;
  transferNumber: string;
  fromGodownId: number;
  fromGodownName: string;
  toGodownId: number;
  toGodownName: string;
  status: string;
  transferDate: string;
  expectedDelivery: string | null;
  receivedDate: string | null;
  notes: string | null;
  items: StockTransferItemResponse[];
  createdById: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransferRequest {
  fromGodownId: number;
  toGodownId: number;
  transferDate?: string;
  expectedDelivery?: string;
  notes?: string;
  items: StockTransferItemRequest[];
}

// ===== API Object =====

export const stockApi = {
  // Balances
  getAllBalances: () =>
    apiClient.get<StockBalanceResponse[]>('/stock/balances').then((r) => r.data),

  getBalancesByGodown: (godownId: number) =>
    apiClient.get<StockBalanceResponse[]>(`/stock/balances/godown/${godownId}`).then((r) => r.data),

  getBalancesByProduct: (productId: number) =>
    apiClient.get<StockBalanceResponse[]>(`/stock/balances/product/${productId}`).then((r) => r.data),

  getLowStockAlerts: () =>
    apiClient.get<StockBalanceResponse[]>('/stock/balances/low-stock').then((r) => r.data),

  // Movements
  getRecentMovements: () =>
    apiClient.get<StockMovementResponse[]>('/stock/movements').then((r) => r.data),

  getMovementsByProduct: (productId: number) =>
    apiClient.get<StockMovementResponse[]>(`/stock/movements/product/${productId}`).then((r) => r.data),

  getMovementsByGodown: (godownId: number) =>
    apiClient.get<StockMovementResponse[]>(`/stock/movements/godown/${godownId}`).then((r) => r.data),

  recordMovement: (data: StockMovementRequest) =>
    apiClient.post<StockMovementResponse>('/stock/movements', data).then((r) => r.data),

  // Transfers
  getAllTransfers: () =>
    apiClient.get<StockTransferResponse[]>('/stock/transfers').then((r) => r.data),

  getTransferById: (id: number) =>
    apiClient.get<StockTransferResponse>(`/stock/transfers/${id}`).then((r) => r.data),

  createTransfer: (data: StockTransferRequest) =>
    apiClient.post<StockTransferResponse>('/stock/transfers', data).then((r) => r.data),

  receiveTransfer: (id: number) =>
    apiClient.post<StockTransferResponse>(`/stock/transfers/${id}/receive`).then((r) => r.data),
};
