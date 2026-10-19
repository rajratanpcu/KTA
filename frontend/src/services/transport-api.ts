import apiClient from '../lib/api-client';

// ===== Types =====

export interface TransporterResponse {
  id: number;
  code: string;
  companyName: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransporterRequest {
  code: string;
  companyName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  notes?: string;
  active?: boolean;
}

export interface TransportBillItemResponse {
  id: number;
  billId: number;
  itemName: string;
  productCode: string | null;
  productId: number | null;
  productName: string | null;
  quantity: number;
  unit: string;
  packageCount: number | null;
  weight: number | null;
  rate: number | null;
  amount: number | null;
  needsReview: boolean;
  createdAt: string;
}

export interface TransportBillItemRequest {
  itemName: string;
  productCode?: string;
  productId?: number;
  quantity: number;
  unit: string;
  packageCount?: number;
  weight?: number;
  rate?: number;
  amount?: number;
  needsReview?: boolean;
}

export interface TransportBillResponse {
  id: number;
  billNumber: string;
  billDate: string;
  dueDate: string | null;
  transporterId: number;
  transporterName: string;
  consignmentNumber: string | null;
  lrNumber: string | null;
  invoiceReference: string | null;
  vehicleNumber: string | null;
  supplierName: string | null;
  destination: string | null;
  purchaseReference: string | null;
  paymentTerms: string | null;
  description: string | null;
  remarks: string | null;
  freightCharges: number;
  loadingCharges: number;
  unloadingCharges: number;
  otherCharges: number;
  taxableAmount: number;
  gstAmount: number;
  gstRate: number | null;
  discount: number;
  roundOff: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  status: string;
  scannedDocumentId: number | null;
  extractionConfidence: number | null;
  needsReview: boolean;
  items: TransportBillItemResponse[];
  createdById: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransportBillRequest {
  billNumber: string;
  billDate: string;
  dueDate?: string;
  transporterId: number;
  consignmentNumber?: string;
  lrNumber?: string;
  invoiceReference?: string;
  vehicleNumber?: string;
  supplierName?: string;
  destination?: string;
  purchaseReference?: string;
  paymentTerms?: string;
  description?: string;
  remarks?: string;
  freightCharges: number;
  loadingCharges?: number;
  unloadingCharges?: number;
  otherCharges?: number;
  gstAmount?: number;
  gstRate?: number;
  discount?: number;
  roundOff?: number;
  status?: string;
  scannedDocumentId?: number;
  extractionConfidence?: number;
  needsReview?: boolean;
  items?: TransportBillItemRequest[];
}

export interface PaymentAllocationRequest {
  billId: number;
  allocatedAmount: number;
}

export interface PaymentAllocationResponse {
  id: number;
  paymentId: number;
  billId: number;
  billNumber: string;
  allocatedAmount: number;
  allocationDate: string;
}

export interface TransportPaymentResponse {
  id: number;
  paymentNumber: string;
  paymentDate: string;
  transporterId: number;
  transporterName: string;
  amount: number;
  paymentMethod: string;
  transactionReference: string | null;
  notes: string | null;
  allocations: PaymentAllocationResponse[];
  createdById: number;
  createdByName: string;
  createdAt: string;
}

export interface TransportPaymentRequest {
  paymentNumber: string;
  paymentDate: string;
  transporterId: number;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  notes?: string;
  allocations?: PaymentAllocationRequest[];
}

export interface DocumentUploadResponse {
  documentId: number;
  originalFilename: string;
  fileUrl: string;
  fileSize: number;
  message: string;
}

// ===== Transporter API =====

export const transporterApi = {
  getAll: () =>
    apiClient.get<TransporterResponse[]>('/transport/transporters').then((r) => r.data),

  getActive: () =>
    apiClient.get<TransporterResponse[]>('/transport/transporters/active').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<TransporterResponse>(`/transport/transporters/${id}`).then((r) => r.data),

  create: (data: TransporterRequest) =>
    apiClient.post<TransporterResponse>('/transport/transporters', data).then((r) => r.data),

  update: (id: number, data: TransporterRequest) =>
    apiClient.put<TransporterResponse>(`/transport/transporters/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/transport/transporters/${id}`).then((r) => r.data),
};

// ===== Transport Bill API =====

export const transportBillApi = {
  getAll: () =>
    apiClient.get<TransportBillResponse[]>('/transport/bills').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<TransportBillResponse>(`/transport/bills/${id}`).then((r) => r.data),

  getByTransporter: (transporterId: number) =>
    apiClient.get<TransportBillResponse[]>(`/transport/bills/transporter/${transporterId}`).then((r) => r.data),

  getByStatus: (status: string) =>
    apiClient.get<TransportBillResponse[]>(`/transport/bills/status/${status}`).then((r) => r.data),

  getNeedsReview: () =>
    apiClient.get<TransportBillResponse[]>('/transport/bills/needs-review').then((r) => r.data),

  getOverdue: () =>
    apiClient.get<TransportBillResponse[]>('/transport/bills/overdue').then((r) => r.data),

  getOutstandingBalance: (transporterId: number) =>
    apiClient.get<number>(`/transport/bills/outstanding/${transporterId}`).then((r) => r.data),

  create: (data: TransportBillRequest) =>
    apiClient.post<TransportBillResponse>('/transport/bills', data).then((r) => r.data),

  update: (id: number, data: TransportBillRequest) =>
    apiClient.put<TransportBillResponse>(`/transport/bills/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/transport/bills/${id}`).then((r) => r.data),
};

// ===== Transport Payment API =====

export const transportPaymentApi = {
  getAll: () =>
    apiClient.get<TransportPaymentResponse[]>('/transport/payments').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<TransportPaymentResponse>(`/transport/payments/${id}`).then((r) => r.data),

  getByTransporter: (transporterId: number) =>
    apiClient.get<TransportPaymentResponse[]>(`/transport/payments/transporter/${transporterId}`).then((r) => r.data),

  getByDateRange: (startDate: string, endDate: string) =>
    apiClient.get<TransportPaymentResponse[]>('/transport/payments/date-range', {
      params: { startDate, endDate },
    }).then((r) => r.data),

  getTotalPaid: (transporterId: number) =>
    apiClient.get<number>(`/transport/payments/total-paid/${transporterId}`).then((r) => r.data),

  create: (data: TransportPaymentRequest) =>
    apiClient.post<TransportPaymentResponse>('/transport/payments', data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/transport/payments/${id}`).then((r) => r.data),
};

export const transportDocumentApi = {
  upload: (file: File, documentType = 'TRANSPORT_BILL') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return apiClient.post<DocumentUploadResponse>('/transport/documents/upload', formData).then((r) => r.data);
  },
};
