import { useState, useRef } from 'react'
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  RefreshCw,
  Eye,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  excelService,
  ExcelImportPreviewResponse,
  ExcelImportResultResponse
} from '@/services/excel-api'

export default function ExcelImport() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [previewData, setPreviewData] = useState<ExcelImportPreviewResponse | null>(null)
  const [importResult, setImportResult] = useState<ExcelImportResultResponse | null>(null)
  const [importMode, setImportMode] = useState<'IMPORT_NEW' | 'REPLACE_DEMO'>('IMPORT_NEW')
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setErrorMessage('Only Excel workbooks (.xlsx, .xls) are supported.')
        return
      }
      setFile(selectedFile)
      setErrorMessage(null)
      setImportResult(null)
      await handlePreview(selectedFile)
    }
  }

  const handlePreview = async (targetFile: File) => {
    setIsLoadingPreview(true)
    setErrorMessage(null)
    try {
      const preview = await excelService.previewExcel(targetFile)
      setPreviewData(preview)
      if (preview.detectedSheets.length > 0) {
        setSelectedSheet(preview.detectedSheets[0])
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error previewing Excel workbook.'
      setErrorMessage(msg)
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleExecuteImport = async () => {
    if (!file) return

    if (importMode === 'REPLACE_DEMO') {
      const confirmed = window.confirm(
        'WARNING: You have selected "Replace Demo Dataset".\n\n' +
        'This will clear demo sales invoices, line items, and transaction history, and replace them with real data from Kushwaha Tent Agency.\n\n' +
        'Do you want to proceed?'
      )
      if (!confirmed) return
    }

    setIsExecuting(true)
    setErrorMessage(null)
    try {
      const res = await excelService.executeImport(file, importMode)
      setImportResult(res)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed.'
      setErrorMessage(msg)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            Vyapar Excel Import
          </h1>
          <p className="text-muted-foreground mt-1">
            Import real business data from Vyapar workbooks into KTA ERP PostgreSQL
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Transactional Pipeline
          </Badge>
        </div>
      </div>

      {/* Upload Box */}
      <Card>
        <CardHeader>
          <CardTitle>Select Excel Workbook</CardTitle>
          <CardDescription>
            Upload <code>Kushwaha_Tent_Agency_Vyapar_Data.xlsx</code> containing all 7 sheets (Sales, Items, Parties, Payments, Transactions).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors bg-gray-50/50"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-800">
              {file ? file.name : 'Click to select or drag and drop Excel workbook'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports .xlsx workbooks up to 50MB
            </p>
            {file && (
              <p className="text-xs font-mono text-green-600 mt-2">
                File size: {(file.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Import Error</p>
                <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {isLoadingPreview && (
            <div className="text-center py-6 text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span>Parsing 7 workbook sheets, headers, and formulas...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Execution Result */}
      {importResult && (
        <Card className={importResult.status === 'SUCCESS' ? 'border-green-300 bg-green-50/30' : 'border-red-300 bg-red-50/30'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.status === 'SUCCESS' ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="text-green-900">Import Completed Successfully</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="text-red-900">Import Transaction Failed</span>
                </>
              )}
            </CardTitle>
            <CardDescription>{importResult.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-muted-foreground">Invoices</p>
                <p className="text-lg font-bold text-gray-900">{importResult.invoicesImported}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-muted-foreground">Line Items</p>
                <p className="text-lg font-bold text-gray-900">{importResult.lineItemsImported}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-muted-foreground">Parties</p>
                <p className="text-lg font-bold text-gray-900">{importResult.partiesImported}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-muted-foreground">Products</p>
                <p className="text-lg font-bold text-gray-900">{importResult.productsImported}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-muted-foreground">Payments</p>
                <p className="text-lg font-bold text-gray-900">{importResult.paymentsImported}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="text-lg font-bold text-gray-900">{importResult.transactionsImported}</p>
              </div>
            </div>

            {importResult.reconciliationNotes.length > 0 && (
              <div className="p-3 bg-white rounded-lg border space-y-1">
                <p className="text-xs font-semibold text-gray-700">Reconciliation Notes:</p>
                {importResult.reconciliationNotes.map((note, idx) => (
                  <p key={idx} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                    {note}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Section */}
      {previewData && (
        <div className="space-y-6">
          {/* Reconciliation Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Total Sales (Vyapar)</p>
                <p className="text-xl font-bold text-gray-900">
                  ₹{Number(previewData.expectedSalesTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{previewData.expectedInvoiceCount} Invoices</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Total Collections</p>
                <p className="text-xl font-bold text-green-700">
                  ₹{Number(previewData.expectedReceiptsTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Payment In Vouchers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Parties & Customers</p>
                <p className="text-xl font-bold text-gray-900">{previewData.expectedPartyCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Vyapar Ledger Accounts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Product Items</p>
                <p className="text-xl font-bold text-gray-900">{previewData.expectedProductCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Item Master Records</p>
              </CardContent>
            </Card>
          </div>

          {/* Validation Warnings */}
          {previewData.warnings.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Source Data Warnings & Preservations ({previewData.warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-y-auto space-y-1 text-xs text-amber-800">
                  {previewData.warnings.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-amber-600 shrink-0">Row {w.rowNumber}:</span>
                      <span>{w.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mode Selector & Execute Button */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">Choose Import Mode</p>
                <div className="flex items-center gap-4 text-sm mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="IMPORT_NEW"
                      checked={importMode === 'IMPORT_NEW'}
                      onChange={() => setImportMode('IMPORT_NEW')}
                      className="text-primary"
                    />
                    <span>Import New Records (Upsert / Skip duplicates)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-amber-900 font-medium">
                    <input
                      type="radio"
                      name="importMode"
                      value="REPLACE_DEMO"
                      checked={importMode === 'REPLACE_DEMO'}
                      onChange={() => setImportMode('REPLACE_DEMO')}
                      className="text-amber-600"
                    />
                    <span>Replace Demo Dataset (Clear mock records first)</span>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleExecuteImport}
                disabled={isExecuting || !previewData.canProceed}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white min-w-[200px]"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Executing Import...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Commit Import to Database
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Sheet Preview Tabs */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  Detected Sheets Preview
                </CardTitle>
                <div className="flex flex-wrap gap-1">
                  {previewData.detectedSheets.map((sName) => (
                    <Button
                      key={sName}
                      variant={selectedSheet === sName ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSheet(sName)}
                      className="text-xs"
                    >
                      {sName}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedSheet && previewData.sheetSummaries[selectedSheet] && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Detected Header Row: <strong>{previewData.sheetSummaries[selectedSheet].detectedHeaderRow}</strong>
                    </span>
                    <span>
                      Valid Records: <strong>{previewData.sheetSummaries[selectedSheet].validRecords}</strong> | Skipped Summary Rows: <strong>{previewData.sheetSummaries[selectedSheet].skippedSummaryRows}</strong>
                    </span>
                  </div>

                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {previewData.sheetSummaries[selectedSheet].headers.map((h, i) => (
                            <TableHead key={i} className="text-xs font-semibold whitespace-nowrap">
                              {h}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.sheetSummaries[selectedSheet].previewRows.map((row, rIdx) => (
                          <TableRow key={rIdx}>
                            {Object.values(row).map((val, cIdx) => (
                              <TableCell key={cIdx} className="text-xs whitespace-nowrap">
                                {String(val !== null && val !== undefined ? val : '-')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
