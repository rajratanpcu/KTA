import { useState } from 'react'
import { Truck, MapPin, Package, Edit, Eye, Search, Plus } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const demoShipments = [
  {
    id: '1',
    shipmentNumber: 'SHP-2024-001',
    transferNumber: 'TR-2024-008',
    transporterName: 'Express Logistics Ltd',
    vehicleNumber: 'MH-01-AB-1234',
    driverName: 'Vijay Kumar',
    driverPhone: '+91 98765 77771',
    sourceGodown: 'Mumbai Central Warehouse',
    destinationGodown: 'Delhi North Warehouse',
    status: 'IN_TRANSIT' as const,
    dispatchDate: '2024-10-18T14:20:00Z',
    expectedDeliveryDate: '2024-10-20T18:00:00Z',
    items: [
      { productName: '1121 Basmati Rice', sku: 'RICE-BAS-1121', quantity: 200, unit: 'kg' },
      { productName: 'Toor Dal 1kg', sku: 'DAL-TUR-1KG', quantity: 150, unit: 'kg' },
    ],
    totalWeight: '350 kg',
    trackingNotes: 'Shipment crossed Maharashtra border at 10:30 AM',
  },
  {
    id: '2',
    shipmentNumber: 'SHP-2024-002',
    transferNumber: 'TR-2024-009',
    transporterName: 'Swift Freight Services',
    vehicleNumber: 'DL-02-CD-5678',
    driverName: 'Arjun Singh',
    driverPhone: '+91 98765 77772',
    sourceGodown: 'Delhi North Warehouse',
    destinationGodown: 'Bangalore Tech Park',
    status: 'DISPATCHED' as const,
    dispatchDate: '2024-10-19T09:00:00Z',
    expectedDeliveryDate: '2024-10-21T15:00:00Z',
    items: [
      { productName: 'Sunflower Oil 5L', sku: 'OIL-SUN-5L', quantity: 100, unit: 'litre' },
      { productName: 'White Sugar 1kg', sku: 'SUGAR-WHT-1KG', quantity: 500, unit: 'kg' },
    ],
    totalWeight: '1000 kg',
    trackingNotes: 'Left warehouse, on route to highway',
  },
  {
    id: '3',
    shipmentNumber: 'SHP-2024-003',
    transferNumber: 'TR-2024-007',
    transporterName: 'Express Logistics Ltd',
    vehicleNumber: 'MH-01-AB-1234',
    driverName: 'Vijay Kumar',
    driverPhone: '+91 98765 77771',
    sourceGodown: 'Mumbai Central Warehouse',
    destinationGodown: 'Chennai Port Warehouse',
    status: 'DELIVERED' as const,
    dispatchDate: '2024-10-15T10:00:00Z',
    expectedDeliveryDate: '2024-10-17T16:00:00Z',
    actualDeliveryDate: '2024-10-17T15:30:00Z',
    items: [
      { productName: 'Premium Black Tea 250g', sku: 'TEA-BRK-250G', quantity: 200, unit: 'pack' },
    ],
    totalWeight: '50 kg',
    trackingNotes: 'Delivered successfully, signed by warehouse manager',
  },
]

const demoTransporters = [
  { id: '1', name: 'Express Logistics Ltd', contactPerson: 'Vijay Kumar', phone: '+91 98765 77771', activeShipments: 5 },
  { id: '2', name: 'Swift Freight Services', contactPerson: 'Arjun Singh', phone: '+91 98765 77772', activeShipments: 3 },
]

export default function Transport() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedShipment, setSelectedShipment] = useState<typeof demoShipments[0] | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const filteredShipments = demoShipments.filter((shipment) => {
    const matchesSearch =
      shipment.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'DISPATCHED': return 'secondary'
      case 'IN_TRANSIT': return 'default'
      case 'DELIVERED': return 'success'
      case 'CANCELLED': return 'destructive'
      default: return 'secondary'
    }
  }

  const getTotalStockInTransit = () => {
    return demoShipments
      .filter(s => s.status === 'IN_TRANSIT' || s.status === 'DISPATCHED')
      .reduce((total, s) => total + s.items.length, 0)
  }

  const handleEditShipment = (shipment: typeof demoShipments[0]) => {
    setSelectedShipment(shipment)
    setIsEditOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transport & Deliveries</h1>
          <p className="text-muted-foreground mt-1">Track shipments, stock in transit, and delivery status</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Shipment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {demoShipments.filter(s => s.status === 'IN_TRANSIT').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active shipments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock in Transit</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalStockInTransit()}</div>
            <p className="text-xs text-muted-foreground mt-1">Product items moving</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transporters</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoTransporters.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active partners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {demoShipments.filter(s => s.status === 'DELIVERED').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by shipment number or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment #</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Weight</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No shipments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono font-medium">{shipment.shipmentNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{shipment.vehicleNumber}</p>
                        <p className="text-xs text-muted-foreground">{shipment.driverName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{shipment.sourceGodown}</p>
                        <p className="text-muted-foreground">↓</p>
                        <p className="font-medium">{shipment.destinationGodown}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{shipment.items.length} item(s)</p>
                        <p className="text-xs text-muted-foreground">
                          {shipment.items.map(i => i.productName).join(', ').substring(0, 30)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{shipment.totalWeight}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(shipment.status)}>
                        {shipment.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(shipment.expectedDeliveryDate).toLocaleDateString('en-IN')}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {new Date(shipment.expectedDeliveryDate).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedShipment(shipment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditShipment(shipment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transporters List */}
      <Card>
        <CardHeader>
          <CardTitle>Transporter Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoTransporters.map((transporter) => (
              <div key={transporter.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{transporter.name}</p>
                    <p className="text-sm text-muted-foreground">{transporter.contactPerson}</p>
                    <p className="text-xs text-muted-foreground">{transporter.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{transporter.activeShipments}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Shipment Details Dialog */}
      <Dialog open={selectedShipment !== null && !isEditOpen} onOpenChange={(open) => {
        if (!open) setSelectedShipment(null)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
            <DialogClose onClick={() => setSelectedShipment(null)} />
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Shipment Number</Label>
                  <p className="font-mono font-semibold">{selectedShipment.shipmentNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Transfer Reference</Label>
                  <p className="font-mono">{selectedShipment.transferNumber}</p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Transport Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Transporter</Label>
                    <p>{selectedShipment.transporterName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Vehicle</Label>
                    <p>{selectedShipment.vehicleNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Driver</Label>
                    <p>{selectedShipment.driverName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Driver Phone</Label>
                    <p>{selectedShipment.driverPhone}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Route</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <div>
                      <Label className="text-muted-foreground">From</Label>
                      <p className="font-medium">{selectedShipment.sourceGodown}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <div>
                      <Label className="text-muted-foreground">To</Label>
                      <p className="font-medium">{selectedShipment.destinationGodown}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Items in Transit ({selectedShipment.items.length})</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedShipment.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell className="text-right font-semibold">{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-3 pt-3 border-t flex justify-between">
                  <span className="font-medium">Total Weight:</span>
                  <span className="font-bold">{selectedShipment.totalWeight}</span>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant={getStatusVariant(selectedShipment.status)}>
                    {selectedShipment.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Tracking Notes</Label>
                <p className="mt-1 text-sm">{selectedShipment.trackingNotes}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Dispatched</Label>
                  <p className="text-sm">
                    {new Date(selectedShipment.dispatchDate).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expected Delivery</Label>
                  <p className="text-sm">
                    {new Date(selectedShipment.expectedDeliveryDate).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Shipment Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Shipment</DialogTitle>
            <DialogClose onClick={() => {
              setIsEditOpen(false)
              setSelectedShipment(null)
            }} />
          </DialogHeader>
          {selectedShipment && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                alert('Shipment update - This is a prototype action')
                setIsEditOpen(false)
                setSelectedShipment(null)
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select id="status" defaultValue={selectedShipment.status} required>
                    <option value="DISPATCHED">Dispatched</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle Number</Label>
                  <Input
                    id="vehicle"
                    defaultValue={selectedShipment.vehicleNumber}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driver">Driver Name</Label>
                  <Input
                    id="driver"
                    defaultValue={selectedShipment.driverName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverPhone">Driver Phone</Label>
                  <Input
                    id="driverPhone"
                    defaultValue={selectedShipment.driverPhone}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDelivery">Expected Delivery Date</Label>
                <Input
                  id="expectedDelivery"
                  type="datetime-local"
                  defaultValue={new Date(selectedShipment.expectedDeliveryDate).toISOString().slice(0, 16)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingNotes">Tracking Notes</Label>
                <Textarea
                  id="trackingNotes"
                  defaultValue={selectedShipment.trackingNotes}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false)
                    setSelectedShipment(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update Shipment
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
