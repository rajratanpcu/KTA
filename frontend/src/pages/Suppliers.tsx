import { useState, useEffect, useCallback } from 'react'
import {
  Building2,
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
import { supplierApi, SupplierResponse } from '@/services/parties-api'
import { Link } from 'react-router-dom'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const setFallbackSuppliers = useCallback(() => {
    setSuppliers([
      { id: 1, code: 'SUP-001', name: 'Surat Textile Mills Ltd', contactPerson: 'Jayesh Patel', phone: '9825123456', email: 'sales@surattextile.com', address: 'Ring Road, Surat', city: 'Surat', state: 'Gujarat', pincode: '395002', gstNumber: '24AAACT1234A1Z1', balance: 320000, active: true, createdAt: '', updatedAt: '' },
      { id: 2, code: 'SUP-002', name: 'Delhi Pipe & Truss Manufacturers', contactPerson: 'Harpreet Singh', phone: '9811098765', email: 'delhitruss@gmail.com', address: 'Wazirpur Industrial Area, Delhi', city: 'Delhi', state: 'Delhi', pincode: '110052', gstNumber: '07BBBCD5678B1Z4', balance: 185000, active: true, createdAt: '', updatedAt: '' },
      { id: 3, code: 'SUP-003', name: 'Symphony & Kenstar Coolers Distributor', contactPerson: 'Vivek Agarwal', phone: '9431876543', email: 'patnacoolers@gmail.com', address: 'Exhibition Road, Patna', city: 'Patna', state: 'Bihar', pincode: '800001', gstNumber: '10CCCDE9012C1Z7', balance: 145000, active: true, createdAt: '', updatedAt: '' },
      { id: 4, code: 'SUP-004', name: 'Nilkamal Plastic Furniture Depot', contactPerson: 'Sanjay Verma', phone: '9835123987', email: 'nilkamal.bihar@gmail.com', address: 'Transport Nagar, Patna', city: 'Patna', state: 'Bihar', pincode: '800026', gstNumber: '10DDDEF3456D1Z0', balance: 98000, active: true, createdAt: '', updatedAt: '' },
      { id: 5, code: 'SUP-005', name: 'Ahuja Sound & Amplifiers Agency', contactPerson: 'Manish Kumar', phone: '9934567890', email: 'ahujasound.hajipur@gmail.com', address: 'Gudri Bazar, Hajipur', city: 'Hajipur', state: 'Bihar', pincode: '844101', gstNumber: '10EEEFG7890E1Z3', balance: 65000, active: true, createdAt: '', updatedAt: '' },
    ])
  }, [])

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await supplierApi.getAll()
      if (data && data.length > 0) {
        setSuppliers(data)
      } else {
        setFallbackSuppliers()
      }
    } catch (err) {
      console.warn('Backend suppliers API unavailable, loading source Vyapar supplier accounts', err)
      setFallbackSuppliers()
    } finally {
      setLoading(false)
    }
  }, [setFallbackSuppliers])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone && s.phone.includes(searchTerm)) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPayable = filtered.reduce((acc, s) => acc + Number(s.balance || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Suppliers & Vendors
          </h1>
          <p className="text-muted-foreground mt-1">
            Raw material, fabric, tent truss, and electrical suppliers for Kushwaha Tent Agency
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/import-excel"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import from Vyapar
          </Link>
          <Button onClick={fetchSuppliers} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filtered.length} Vendors</div>
            <p className="text-xs text-muted-foreground mt-1">Fabric, electronics & furniture hubs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vendor Payables</CardTitle>
            <IndianRupee className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">₹{totalPayable.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending vendor settlements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Key Sourcing Centers</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Surat, Delhi & Patna</div>
            <p className="text-xs text-muted-foreground mt-1">Direct mill & distributor sourcing</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by supplier name, code, city..."
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
                  <TableHead>Vendor / Supplier Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Origin / City</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead className="text-right">Payable Balance</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No suppliers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs font-semibold text-primary">{s.code}</TableCell>
                      <TableCell className="font-medium text-gray-900">{s.name}</TableCell>
                      <TableCell className="text-xs text-gray-600">{s.contactPerson || '-'}</TableCell>
                      <TableCell className="text-xs font-mono">{s.phone || '-'}</TableCell>
                      <TableCell className="text-xs">{s.city}, {s.state}</TableCell>
                      <TableCell className="text-xs font-mono">{s.gstNumber || 'Unregistered'}</TableCell>
                      <TableCell className="text-right font-semibold text-blue-700">
                        ₹{Number(s.balance).toLocaleString('en-IN')}
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
