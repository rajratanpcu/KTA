import { useState } from 'react'
import { Plus, Search, Truck as TruckIcon, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { demoGodowns, demoProducts } from '@/data/demoData'

const demoTransfers = [
  {
    id: '1',
    transferNumber: 'TR-2024-008',
    sourceGodownId: '1',
    sourceGodownName: 'Mumbai Central Warehouse',
    destinationGodownId: '2',
    destinationGodownName: 'Delhi North Warehouse',
    status: 'DISPATCHED' as const,
    items: [
      { productName: '1121 Basmati Rice', sku: 'RICE-BAS-1121', orderedQuantity: 200, dispatchedQuantity: 200, receivedQuantity: 0, unit: 'kg' }
    ],
    dispatchedAt: '2024-10-18T14:20:00Z',
    createdBy: 'Admin User',
  },
  {
    id: '2',
    transferNumber: 'TR-2024-007',
    sourceGodownId: '2',
    sourceGodownName: 'Delhi North Warehouse',
    destinationGodownId: '3',
    destinationGodownName: 'Bangalore Tech Park',
    status: 'RECEIVED' as const,
    items: [
      { productName: 'Toor Dal 1kg', sku: 'DAL-TUR-1KG', orderedQuantity: 150, dispatchedQuantity: 150, receivedQuantity: 150, unit: 'kg' }
    ],
    dispatchedAt: '2024-10-15T10:00:00Z',
    receivedAt: '2024-10-17T16:30:00Z',
    createdBy: 'Manager User',
  },
  {
    id: '3',
    transferNumber: 'TR-2024-006',
    sourceGodownId: '1',
    sourceGodownName: 'Mumbai Central Warehouse',
    destinationGodownId: '4',
    destinationGodownName: 'Chennai Port Warehouse',
    status: 'DRAFT' as const,
    items: [
      { productName: 'Sunflower Oil 5L', sku: 'OIL-SUN-5L', orderedQuantity: 100, dispatchedQuantity: 0, receivedQuantity: 0, unit: 'litre' }
    ],
    createdBy: 'Admin User',
  },
]

export default function Transfers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filteredTransfers = demoTransfers.filter((transfer) => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'secondary'
      case 'DISPATCHED': return 'default'
      case 'IN_TRANSIT': return 'default'
      case 'PARTIALLY_RECEIVED': return 'warning'
      case 'RECEIVED': return 'success'
      case 'CANCELLED': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Transfers</h1>
          <p className="text-muted-foreground mt-1">Manage stock movement between godowns</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Transfer
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transfer number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="PARTIALLY_RECEIVED">Partially Received</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer #</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dispatched</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No transfers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-mono font-medium">{transfer.transferNumber}</TableCell>
                    <TableCell className="text-sm">{transfer.sourceGodownName}</TableCell>
                    <TableCell className="text-sm">{transfer.destinationGodownName}</TableCell>
                    <TableCell className="text-sm">
                      {transfer.items.length} item(s)
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(transfer.status)}>
                        {transfer.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {transfer.dispatchedAt
                        ? new Date(transfer.dispatchedAt).toLocaleDateString('en-IN')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-sm">{transfer.createdBy}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Transfer Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Stock Transfer</DialogTitle>
            <DialogClose onClick={() => setIsCreateOpen(false)} />
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert('Transfer create - This is a prototype action')
              setIsCreateOpen(false)
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source Godown *</Label>
                <Select id="source" required>
                  <option value="">Select source</option>
                  {demoGodowns.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination Godown *</Label>
                <Select id="destination" required>
                  <option value="">Select destination</option>
                  {demoGodowns.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Transfer Items</Label>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-6">
                    <Select required>
                      <option value="">Select product</option>
                      {demoProducts.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Input type="number" placeholder="Quantity" required />
                  </div>
                  <div className="col-span-3">
                    <Input placeholder="Unit" disabled value="kg" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Create Transfer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
