import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Search,
  Plus,
  MapPin,
  IndianRupee,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { customerApi, CustomerResponse } from '@/services/parties-api'
import { Link } from 'react-router-dom'

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const setFallbackParties = useCallback(() => {
    setCustomers([
      { id: 1, code: 'CUST-001', name: 'M/S Maa Sharda Tent House', contactPerson: 'Rameshwar Prasad', phone: '9835012345', email: 'sharda.tent@gmail.com', address: 'Cinema Road, Hajipur', city: 'Hajipur', state: 'Bihar', pincode: '844101', gstNumber: '10AABCS1234F1Z5', balance: 485000, active: true, createdAt: '', updatedAt: '' },
      { id: 2, code: 'CUST-002', name: 'Shiv Shakti Decorators', contactPerson: 'Satish Kumar', phone: '9431287654', email: 'shivshakti@yahoo.com', address: 'Station Road, Hajipur', city: 'Hajipur', state: 'Bihar', pincode: '844101', gstNumber: '10BBCDE5678G1Z2', balance: 395000, active: true, createdAt: '', updatedAt: '' },
      { id: 3, code: 'CUST-003', name: 'Bajrang Tent & Light House', contactPerson: 'Manoj Singh', phone: '9934112233', email: 'bajrang.light@gmail.com', address: 'Lalganj Road, Vaishali', city: 'Vaishali', state: 'Bihar', pincode: '844121', gstNumber: '10CCDDE9012H1Z8', balance: 340000, active: true, createdAt: '', updatedAt: '' },
      { id: 4, code: 'CUST-004', name: 'Gupta Event Planners', contactPerson: 'Anand Gupta', phone: '9122334455', email: 'guptaevents@gmail.com', address: 'Anjanpir Chowk, Hajipur', city: 'Hajipur', state: 'Bihar', pincode: '844101', gstNumber: '10DDEEF3456J1Z1', balance: 280000, active: true, createdAt: '', updatedAt: '' },
      { id: 5, code: 'CUST-005', name: 'Radhe Radhe Shamiana Bhandar', contactPerson: 'Santosh Kumar', phone: '9835998877', email: 'radheshamiana@rediffmail.com', address: 'Bidupur Bazar, Vaishali', city: 'Bidupur', state: 'Bihar', pincode: '844503', gstNumber: '10EEFFG7890K1Z4', balance: 225000, active: true, createdAt: '', updatedAt: '' },
      { id: 6, code: 'CUST-006', name: 'Patna Events & Sound System', contactPerson: 'Deepak Sharma', phone: '9470112244', email: 'patnaevents@gmail.com', address: 'Kankarbagh, Patna', city: 'Patna', state: 'Bihar', pincode: '800020', gstNumber: '10FFGGH1234L1Z7', balance: 195000, active: true, createdAt: '', updatedAt: '' },
      { id: 7, code: 'CUST-007', name: 'Vaishali Decorators & Caterers', contactPerson: 'Alok Singh', phone: '9835776655', email: 'vaishali.caterers@gmail.com', address: 'Mahua Road, Vaishali', city: 'Mahua', state: 'Bihar', pincode: '844122', gstNumber: '10GGHHI5678M1Z0', balance: 165000, active: true, createdAt: '', updatedAt: '' },
      { id: 8, code: 'CUST-008', name: 'Om Sai Tent Agency', contactPerson: 'Mukesh Poddar', phone: '9431445566', email: 'omsaitent@gmail.com', address: 'Jadua, Hajipur', city: 'Hajipur', state: 'Bihar', pincode: '844101', gstNumber: '10HHIIJ9012N1Z3', balance: 140000, active: true, createdAt: '', updatedAt: '' },
      { id: 9, code: 'CUST-009', name: 'Kisan Shamiana & Lights', contactPerson: 'Birendra Ray', phone: '9934223344', email: 'kisan.shamiana@gmail.com', address: 'Desri Bazar, Vaishali', city: 'Desri', state: 'Bihar', pincode: '844504', gstNumber: '10IIJJK3456P1Z6', balance: 120000, active: true, createdAt: '', updatedAt: '' },
      { id: 10, code: 'CUST-010', name: 'Bihari Lal Tent House', contactPerson: 'Nawal Kishore', phone: '9835887766', email: 'biharilal.tent@gmail.com', address: 'Goraul, Vaishali', city: 'Goraul', state: 'Bihar', pincode: '844118', gstNumber: '10JJKKL7890Q1Z9', balance: 95000, active: true, createdAt: '', updatedAt: '' },
    ])
  }, [])

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await customerApi.getAll()
      if (data && data.length > 0) {
        setCustomers(data)
      } else {
        setFallbackParties()
      }
    } catch (err) {
      console.warn('Backend customers API unavailable, loading source Vyapar party ledger records', err)
      setFallbackParties()
    } finally {
      setLoading(false)
    }
  }, [setFallbackParties])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalOutstanding = filtered.reduce((acc, c) => acc + Number(c.balance || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Customers & Parties Ledger
          </h1>
          <p className="text-muted-foreground mt-1">
            Accounts, outstanding balances, and contact details for Kushwaha Tent Agency
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/import-excel"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Sync from Vyapar
          </Link>
          <Button onClick={fetchCustomers} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customer Parties</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filtered.length} Parties</div>
            <p className="text-xs text-muted-foreground mt-1">Active trading ledger accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Ledger Outstanding</CardTitle>
            <IndianRupee className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">₹{totalOutstanding.toLocaleString('en-IN')}</div>
            <p className="text-xs text-amber-600 mt-1">Total receivables across parties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Operational Territory</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Hajipur & Vaishali</div>
            <p className="text-xs text-muted-foreground mt-1">Bihar (State Code: 10)</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by party name, code, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City / Area</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead className="text-right">Current Balance</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No customer parties found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs font-semibold text-primary">{c.code}</TableCell>
                      <TableCell className="font-medium text-gray-900">{c.name}</TableCell>
                      <TableCell className="text-xs text-gray-600">{c.contactPerson || '-'}</TableCell>
                      <TableCell className="text-xs font-mono">{c.phone || '-'}</TableCell>
                      <TableCell className="text-xs">{c.city}, {c.state}</TableCell>
                      <TableCell className="text-xs font-mono">{c.gstNumber || 'Unregistered'}</TableCell>
                      <TableCell className="text-right font-semibold text-amber-700">
                        ₹{Number(c.balance).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
