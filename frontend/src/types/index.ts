export interface Product {
  id: string
  sku: string
  barcode?: string
  name: string
  description?: string
  category: string
  unit: string
  purchasePrice: number
  sellingPrice: number
  gstRate: number
  minStockLevel?: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Unit {
  id: string
  name: string
  abbreviation: string
}

export interface Godown {
  id: string
  code: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  contactPerson?: string
  contactPhone?: string
  active: boolean
}

export interface StockBalance {
  productId: string
  productName: string
  sku: string
  godownId: string
  godownName: string
  availableQuantity: number
  reservedQuantity: number
  inTransitQuantity: number
  unit: string
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  sku: string
  movementType: 'PURCHASE_RECEIPT' | 'SALE' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'ADJUSTMENT' | 'RETURN'
  quantity: number
  unit: string
  sourceGodownId?: string
  sourceGodownName?: string
  destinationGodownId?: string
  destinationGodownName?: string
  referenceType?: string
  referenceId?: string
  notes?: string
  performedBy: string
  performedAt: string
}

export interface Transfer {
  id: string
  transferNumber: string
  sourceGodownId: string
  sourceGodownName: string
  destinationGodownId: string
  destinationGodownName: string
  status: 'DRAFT' | 'DISPATCHED' | 'IN_TRANSIT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED'
  items: TransferItem[]
  notes?: string
  createdBy: string
  createdAt: string
  dispatchedAt?: string
  dispatchedBy?: string
  receivedAt?: string
  receivedBy?: string
}

export interface TransferItem {
  id: string
  productId: string
  productName: string
  sku: string
  unit: string
  orderedQuantity: number
  dispatchedQuantity: number
  receivedQuantity: number
}

export interface Supplier {
  id: string
  code: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address: string
  city: string
  state: string
  pincode: string
  gstNumber?: string
  balance: number
  active: boolean
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  supplierName: string
  orderDate: string
  expectedDate?: string
  status: 'DRAFT' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED'
  items: PurchaseOrderItem[]
  subtotal: number
  taxAmount: number
  total: number
  notes?: string
  createdBy: string
}

export interface PurchaseOrderItem {
  id: string
  productId: string
  productName: string
  sku: string
  unit: string
  orderedQuantity: number
  receivedQuantity: number
  unitPrice: number
  gstRate: number
  amount: number
}

export interface Customer {
  id: string
  code: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address: string
  city: string
  state: string
  pincode: string
  gstNumber?: string
  balance: number
  active: boolean
}

export interface Sale {
  id: string
  saleNumber: string
  customerId?: string
  customerName?: string
  saleDate: string
  godownId: string
  godownName: string
  items: SaleItem[]
  subtotal: number
  discount: number
  taxAmount: number
  total: number
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'CREDIT'
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID'
  notes?: string
  createdBy: string
}

export interface SaleItem {
  id: string
  productId: string
  productName: string
  sku: string
  unit: string
  quantity: number
  unitPrice: number
  discount: number
  gstRate: number
  amount: number
}

export interface Transporter {
  id: string
  code: string
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  address: string
  active: boolean
}

export interface Vehicle {
  id: string
  registrationNumber: string
  vehicleType: string
  transporterId?: string
  transporterName?: string
  active: boolean
}

export interface Shipment {
  id: string
  shipmentNumber: string
  transferId?: string
  transferNumber?: string
  transporterId: string
  transporterName: string
  vehicleId?: string
  vehicleNumber?: string
  driverName?: string
  driverPhone?: string
  sourceGodownId: string
  sourceGodownName: string
  destinationGodownId: string
  destinationGodownName: string
  dispatchDate: string
  expectedDeliveryDate?: string
  actualDeliveryDate?: string
  status: 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'
  trackingNotes?: string
}

export interface Expense {
  id: string
  expenseNumber: string
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE'
  reference?: string
  notes?: string
  attachmentUrl?: string
  godownId?: string
  godownName?: string
  createdBy: string
  createdAt: string
}

export interface User {
  id: string
  username: string
  fullName: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER'
  active: boolean
  lastLogin?: string
}
