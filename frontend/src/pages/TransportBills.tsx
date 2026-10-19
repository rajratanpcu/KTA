import { FormEvent, useState } from 'react'
import {
  FileText,
  Upload,
  Eye,
  DollarSign,
  Search,
  AlertCircle,
  CheckCircle,
  Camera,
  IndianRupee,
  Building2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import {
  demoTransportBills,
  demoTransporters,
  demoTransportPayments,
} from '@/data/transportData'
import type { TransportBill } from '@/types/transport'
import { useCreateTransportBill, useCreateTransportPayment, useTransportBills, useTransporters, useTransportPayments, useUploadTransportDocument } from '@/hooks/use-transport-queries'
import type { TransportBillResponse, TransportPaymentResponse, TransporterResponse } from '@/services/transport-api'
import type { TransportPayment, Transporter } from '@/types/transport'

function toTransportBill(response: TransportBillResponse): TransportBill {
  return {
    ...response,
    id: String(response.id),
    transporterId: String(response.transporterId),
    status: response.status as TransportBill['status'],
    createdBy: String(response.createdById),
    items: response.items.map((item) => ({
      ...item,
      id: String(item.id),
      productId: item.productId == null ? undefined : String(item.productId),
    })),
  }
}

function toTransportPayment(response: TransportPaymentResponse): TransportPayment {
  return {
    ...response,
    id: String(response.id),
    transporterId: String(response.transporterId),
    createdBy: String(response.createdById),
    paymentMethod: response.paymentMethod as TransportPayment['paymentMethod'],
    allocations: response.allocations.map((allocation) => ({
      ...allocation,
      id: String(allocation.id),
      paymentId: String(allocation.paymentId),
      billId: String(allocation.billId),
    })),
  }
}

export default function TransportBills() {
  const transportBillsQuery = useTransportBills()
  const transportersQuery = useTransporters()
  const transportPaymentsQuery = useTransportPayments()
  const uploadDocumentMutation = useUploadTransportDocument()
  const createBillMutation = useCreateTransportBill()
  const createPaymentMutation = useCreateTransportPayment()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [transporterFilter, setTransporterFilter] = useState('all')
  const [isScanOpen, setIsScanOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<TransportBill | null>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [viewMode, setViewMode] = useState<'bills' | 'transporters' | 'payments'>('bills')
  const [, setSelectedFile] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [uploadedDocumentId, setUploadedDocumentId] = useState<number | null>(null)
  const [billError, setBillError] = useState('')

  const bills = transportBillsQuery.isError
    ? demoTransportBills
    : (transportBillsQuery.data ?? []).map(toTransportBill)
  const summary = bills.reduce(
    (result, bill) => {
      result.total += 1
      result.totalAmount += bill.totalAmount
      result.totalPaid += bill.amountPaid
      result.outstanding += bill.balanceDue
      if (bill.status === 'PENDING') result.unpaid += 1
      if (bill.status === 'PARTIALLY_PAID') result.partiallyPaid += 1
      if (bill.status === 'PAID') result.paid += 1
      return result
    },
    { total: 0, totalAmount: 0, totalPaid: 0, outstanding: 0, unpaid: 0, partiallyPaid: 0, paid: 0 },
  )
  const transporters: Transporter[] = transportersQuery.isError
    ? demoTransporters
    : (transportersQuery.data ?? []).map((transporter: TransporterResponse) => {
      const transporterBills = bills.filter((bill) => bill.transporterId === String(transporter.id))
      return {
        ...transporter,
        id: String(transporter.id),
        totalBills: transporterBills.length,
        totalAmount: transporterBills.reduce((total, bill) => total + bill.totalAmount, 0),
        totalPaid: transporterBills.reduce((total, bill) => total + bill.amountPaid, 0),
        outstandingBalance: transporterBills.reduce((total, bill) => total + bill.balanceDue, 0),
      }
    })
  const payments: TransportPayment[] = transportPaymentsQuery.isError
    ? demoTransportPayments
    : (transportPaymentsQuery.data ?? []).map(toTransportPayment)

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.transporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.purchaseReference && bill.purchaseReference.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter
    const matchesTransporter = transporterFilter === 'all' || bill.transporterId === transporterFilter
    return matchesSearch && matchesStatus && matchesTransporter
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID': return 'success'
      case 'PARTIALLY_PAID': return 'warning'
      case 'PENDING': return 'secondary'
      case 'OVERDUE': return 'destructive'
      case 'DRAFT': return 'secondary'
      default: return 'secondary'
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setIsExtracting(true)
      try {
        const uploadedDocument = await uploadDocumentMutation.mutateAsync(file)
        setUploadedDocumentId(uploadedDocument.documentId)
        setBillError('')
      } finally {
        setIsExtracting(false)
        setIsScanOpen(false)
        setIsReviewOpen(true)
      }
    }
  }

  const handleBillReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    try {
      await createBillMutation.mutateAsync({
        billNumber: String(formData.get('billNumber')),
        billDate: String(formData.get('billDate')),
        transporterId: Number(formData.get('transporterId')),
        freightCharges: Number(formData.get('freightCharges')),
        loadingCharges: Number(formData.get('loadingCharges') || 0),
        unloadingCharges: Number(formData.get('unloadingCharges') || 0),
        otherCharges: Number(formData.get('otherCharges') || 0),
        gstAmount: Number(formData.get('gstAmount') || 0),
        status: 'DRAFT',
        scannedDocumentId: uploadedDocumentId ?? undefined,
        needsReview: true,
      })
      setIsReviewOpen(false)
      setUploadedDocumentId(null)
    } catch (error) {
      setBillError(error instanceof Error ? error.message : 'Unable to save the transport bill.')
    }
  }

  const handleRecordPayment = (bill: TransportBill) => {
    setSelectedBill(bill)
    setPaymentError('')
    setIsPaymentOpen(true)
  }

  const handlePaymentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedBill) return
    const formData = new FormData(event.currentTarget)
    const amount = Number(formData.get('amount'))
    if (!Number.isFinite(amount) || amount <= 0 || amount > selectedBill.balanceDue) {
      setPaymentError('Enter a payment amount greater than zero and no more than the outstanding balance.')
      return
    }

    try {
      await createPaymentMutation.mutateAsync({
        paymentNumber: String(formData.get('paymentNumber')),
        paymentDate: String(formData.get('paymentDate')),
        transporterId: Number(selectedBill.transporterId),
        amount,
        paymentMethod: String(formData.get('paymentMethod')),
        transactionReference: String(formData.get('transactionReference') || '') || undefined,
        allocations: [{ billId: Number(selectedBill.id), allocatedAmount: amount }],
      })
      setIsPaymentOpen(false)
      setSelectedBill(null)
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Unable to record payment.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transport Bills</h1>
          <p className="text-muted-foreground mt-1">Scan, manage, and track transport bill payments</p>
        </div>
        <Button onClick={() => setIsScanOpen(true)} size="lg" className="gap-2">
          <Camera className="h-5 w-5" />
          Scan Transport Bill
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.unpaid} pending, {summary.partiallyPaid} partial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Charges</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalAmount.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">All transport bills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Amount Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{summary.totalPaid.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary.paid} bills paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{summary.outstanding.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">Payable amount</p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'bills'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setViewMode('bills')}
        >
          Bills
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'transporters'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setViewMode('transporters')}
        >
          Transporters
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'payments'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setViewMode('payments')}
        >
          Payments
        </button>
      </div>

      {/* Bills View */}
      {viewMode === 'bills' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by bill number, transporter, or purchase reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </Select>
                <Select value={transporterFilter} onChange={(e) => setTransporterFilter(e.target.value)}>
                  <option value="all">All Transporters</option>
                  {transporters.map(t => (
                    <option key={t.id} value={t.id}>{t.companyName}</option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bills Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transport Bill Register</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill No.</TableHead>
                    <TableHead>Bill Date</TableHead>
                    <TableHead>Transporter</TableHead>
                    <TableHead>Purchase Ref</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No transport bills found. Click "Scan Transport Bill" to add one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-mono font-medium">
                          {bill.billNumber}
                          {bill.needsReview && (
                            <AlertCircle className="h-3 w-3 text-yellow-600 inline ml-1" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(bill.billDate).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell className="text-sm">{bill.transporterName}</TableCell>
                        <TableCell className="text-sm font-mono">{bill.purchaseReference || '-'}</TableCell>
                        <TableCell className="text-right font-semibold">₹{bill.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-green-600">₹{bill.amountPaid.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-orange-600 font-medium">
                          ₹{bill.balanceDue.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(bill.status)}>
                            {bill.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {bill.balanceDue > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRecordPayment(bill)}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Transporters View */}
      {viewMode === 'transporters' && (
        <Card>
          <CardHeader>
            <CardTitle>Transporter Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transporters.map((transporter) => (
                <div key={transporter.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{transporter.companyName}</h3>
                        <p className="text-sm text-muted-foreground">{transporter.code}</p>
                      </div>
                    </div>
                    <Badge variant={transporter.active ? 'success' : 'secondary'}>
                      {transporter.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-medium">{transporter.contactPerson}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{transporter.phone}</span>
                    </div>
                    {transporter.gstin && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GSTIN:</span>
                        <span className="font-mono text-xs">{transporter.gstin}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Bills</p>
                      <p className="text-lg font-bold">{transporter.totalBills}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-bold">₹{(transporter.totalAmount / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Outstanding</p>
                      <p className="text-lg font-bold text-orange-600">
                        ₹{(transporter.outstandingBalance / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments View */}
      {viewMode === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Transporter</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Bills Allocated</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono">{payment.paymentNumber}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(payment.paymentDate).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell className="text-sm">{payment.transporterName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.paymentMethod.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      ₹{payment.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.allocations.map(a => a.billNumber).join(', ')}
                    </TableCell>
                    <TableCell className="text-sm font-mono">{payment.transactionReference || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Scan/Upload Dialog */}
      <Dialog open={isScanOpen} onOpenChange={setIsScanOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scan or Upload Transport Bill</DialogTitle>
            <DialogClose onClick={() => setIsScanOpen(false)} />
          </DialogHeader>
          <div className="space-y-6">
            {!isExtracting ? (
              <>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Upload Transport Bill</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports JPG, PNG, PDF (including multi-page)
                  </p>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" onClick={() => document.getElementById('file-upload')?.click()}>
                      <span>Choose File</span>
                    </Button>
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="border rounded-lg p-6 text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Capture with Camera</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use your device camera to capture the bill
                  </p>
                  <Button variant="outline" onClick={() => document.getElementById('transport-bill-file')?.click()}>
                    <Camera className="h-4 w-4 mr-2" />
                    Open Camera
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="font-semibold mb-2">Extracting Bill Information...</h3>
                <p className="text-sm text-muted-foreground">
                  OCR is pending. Review the uploaded document and enter values manually if extraction is unavailable.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual review dialog: OCR is intentionally not treated as verified data. */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Extracted Bill Data</DialogTitle>
            <DialogClose onClick={() => setIsReviewOpen(false)} />
          </DialogHeader>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleBillReviewSubmit}>
            <Input name="billNumber" placeholder="Bill or invoice number" required />
            <Input name="billDate" type="date" required />
            <Select name="transporterId" required defaultValue="">
              <option value="" disabled>Select transporter</option>
              {transporters.map((transporter) => (
                <option key={transporter.id} value={transporter.id}>{transporter.companyName}</option>
              ))}
            </Select>
            <Input name="freightCharges" type="number" min="0" step="0.01" placeholder="Freight charges" required />
            <Input name="loadingCharges" type="number" min="0" step="0.01" placeholder="Loading charges" />
            <Input name="unloadingCharges" type="number" min="0" step="0.01" placeholder="Unloading charges" />
            <Input name="otherCharges" type="number" min="0" step="0.01" placeholder="Other charges" />
            <Input name="gstAmount" type="number" min="0" step="0.01" placeholder="GST amount" />
            <div className="md:col-span-2 space-y-3">
              <p className="text-sm text-muted-foreground">OCR is not configured. Review these values manually before saving the draft.</p>
              {billError && <p className="text-sm text-destructive" role="alert">{billError}</p>}
              <Button type="submit" disabled={createBillMutation.isPending}>
                {createBillMutation.isPending ? 'Saving draft...' : 'Save reviewed draft'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record payment for {selectedBill?.billNumber}</DialogTitle>
            <DialogClose onClick={() => setIsPaymentOpen(false)} />
          </DialogHeader>
          <form className="space-y-4" onSubmit={handlePaymentSubmit}>
            <Input name="paymentNumber" placeholder="Payment number" required />
            <Input name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            <Input
              name="amount"
              type="number"
              min="0.01"
              max={selectedBill?.balanceDue}
              step="0.01"
              placeholder={`Outstanding: ${selectedBill?.balanceDue ?? 0}`}
              required
            />
            <Select name="paymentMethod" defaultValue="BANK_TRANSFER">
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="OTHER">Other</option>
            </Select>
            <Input name="transactionReference" placeholder="Transaction reference (optional)" />
            {paymentError && <p className="text-sm text-destructive" role="alert">{paymentError}</p>}
            <Button type="submit" disabled={createPaymentMutation.isPending}>
              {createPaymentMutation.isPending ? 'Saving...' : 'Save payment'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
