import apiClient from '../lib/api-client';

export interface DashboardSummary {
  totalSales: number;
  totalCollections: number;
  totalReceivables: number;
  totalInvoices: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalProducts: number;
  totalGodowns: number;
  monthlySales: {
    month: string;
    sales: number;
    collections: number;
  }[];
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  topCustomers: {
    name: string;
    amount: number;
    invoiceCount: number;
  }[];
  recentInvoices: {
    invoiceNo: string;
    date: string;
    customer: string;
    amount: number;
    status: string;
  }[];
}

export interface ExcelSheetSummary {
  sheetName: string;
  detectedHeaderRow: number;
  totalRows: number;
  validRecords: number;
  skippedSummaryRows: number;
  headers: string[];
  previewRows: Record<string, unknown>[];
}

export interface ExcelRowValidation {
  sheetName: string;
  rowNumber: number;
  field: string;
  value?: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface ExcelImportPreviewResponse {
  fileName: string;
  fileSize: number;
  detectedSheets: string[];
  sheetSummaries: Record<string, ExcelSheetSummary>;
  kpiSummary: Record<string, unknown>;
  validationErrors: ExcelRowValidation[];
  warnings: ExcelRowValidation[];
  canProceed: boolean;
  expectedSalesTotal: number;
  expectedReceiptsTotal: number;
  expectedInvoiceCount: number;
  expectedPartyCount: number;
  expectedProductCount: number;
}

export interface ExcelImportResultResponse {
  status: 'SUCCESS' | 'FAILED';
  message: string;
  importMode: 'IMPORT_NEW' | 'REPLACE_DEMO';
  invoicesImported: number;
  lineItemsImported: number;
  paymentsImported: number;
  partiesImported: number;
  productsImported: number;
  transactionsImported: number;
  totalSalesAmount: number;
  totalReceiptsAmount: number;
  errors: string[];
  warnings: string[];
  reconciliationNotes: string[];
}

export interface SalesInvoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: string;
  paymentMode: string;
  notes?: string;
}

export interface InvoiceLineItem {
  id: number;
  invoiceNumber: string;
  lineNumber: number;
  itemDate?: string;
  customerName?: string;
  itemName: string;
  category?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount?: number;
  tax?: number;
  lineTotal: number;
}

export const excelService = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get<DashboardSummary>('/api/dashboard/summary');
    return res.data;
  },

  getAllInvoices: async (page = 0, size = 200): Promise<SalesInvoice[]> => {
    const res = await apiClient.get<SalesInvoice[]>('/api/invoices', { params: { page, size } });
    return res.data;
  },

  getInvoiceItems: async (id: number): Promise<InvoiceLineItem[]> => {
    const res = await apiClient.get<InvoiceLineItem[]>(`/api/invoices/${id}/items`);
    return res.data;
  },

  previewExcel: async (file: File): Promise<ExcelImportPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
    const baseUrl = viteEnv?.VITE_API_BASE_URL || 'http://localhost:8080';
    const username = sessionStorage.getItem('kta_auth_username') || '';
    const password = sessionStorage.getItem('kta_auth_password') || '';
    const authHeader = username && password ? 'Basic ' + btoa(`${username}:${password}`) : '';

    const response = await fetch(`${baseUrl}/api/import/excel/preview`, {
      method: 'POST',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to preview Excel file');
    }

    return response.json();
  },

  executeImport: async (file: File, mode: 'IMPORT_NEW' | 'REPLACE_DEMO'): Promise<ExcelImportResultResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
    const baseUrl = viteEnv?.VITE_API_BASE_URL || 'http://localhost:8080';
    const username = sessionStorage.getItem('kta_auth_username') || '';
    const password = sessionStorage.getItem('kta_auth_password') || '';
    const authHeader = username && password ? 'Basic ' + btoa(`${username}:${password}`) : '';

    const response = await fetch(`${baseUrl}/api/import/excel/execute?mode=${mode}`, {
      method: 'POST',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to execute Excel import');
    }

    return response.json();
  },
};
