export interface Transporter {
  id: string
  code: string
  companyName: string
  contactPerson?: string
  phone?: string
  email?: string
  address: string
  city: string
  state: string
  pincode: string
  gstin?: string
  notes?: string
  active: boolean
  totalBills: number
  totalAmount: number
  totalPaid: number
  outstandingBalance: number
}

export interface TransportBill {
  id: string
  billNumber: string
  billDate: string
  dueDate?: string
  transporterId: string
  transporterName: string
  consignmentNumber?: string
  lrNumber?: string
  invoiceReference?: string
  vehicleNumber?: string
  supplierName?: string
  destination?: string
  purchaseReference?: string
  paymentTerms?: string
  description?: string
  remarks?: string
  items: TransportBillItem[]
  freightCharges: number
  loadingCharges: number
  unloadingCharges: number
  otherCharges: number
  taxableAmount: number
  gstAmount: number
  gstRate?: number
  discount: number
  roundOff: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  currency: string
  status: 'DRAFT' | 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE'
  scannedDocumentUrl?: string
  extractionConfidence?: number
  needsReview: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface TransportBillItem {
  id: string
  itemName: string
  productCode?: string
  productId?: string
  productName?: string
  quantity: number
  unit: string
  packageCount?: number
  weight?: number
  rate?: number
  amount?: number
  needsReview: boolean
}

export interface TransportPayment {
  id: string
  paymentNumber: string
  paymentDate: string
  transporterId: string
  transporterName: string
  amount: number
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'OTHER'
  transactionReference?: string
  notes?: string
  allocations: TransportPaymentAllocation[]
  createdBy: string
  createdAt: string
}

export interface TransportPaymentAllocation {
  id: string
  paymentId: string
  billId: string
  billNumber: string
  allocatedAmount: number
  allocationDate: string
}

export interface ScannedDocument {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadDate: string
  url: string
  thumbnailUrl?: string
}

export interface OCRExtraction {
  confidence: number
  extractedData: Partial<TransportBill>
  uncertainFields: string[]
  missingFields: string[]
  warnings: string[]
}
