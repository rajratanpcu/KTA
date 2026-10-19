import { useState } from 'react'
import { Plus, Search, Edit, MapPin, Package, Eye, TrendingUp, Warehouse } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading'
import { useToast } from '@/components/ui/toast'
import { useGodowns, useCreateGodown, useUpdateGodown } from '@/hooks/use-core-queries'
import { demoGodowns, demoStockBalances } from '@/data/demoData'
import type { GodownRequest } from '@/services/core-api'

interface GodownRow {
  id: string | number
  code: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  contactPerson?: string | null
  contactPhone?: string | null
  active: boolean
}

export default function Godowns() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingGodown, setEditingGodown] = useState<GodownRow | null>(null)
  const [viewingGodown, setViewingGodown] = useState<GodownRow | null>(null)

  const { addToast } = useToast()
  const { data: apiGodowns, isLoading } = useGodowns()
  const createMutation = useCreateGodown()
  const updateMutation = useUpdateGodown()

  const godowns: GodownRow[] = apiGodowns
    ? apiGodowns.map((g) => ({
        id: g.id,
        code: g.code,
        name: g.name,
        address: g.address,
        city: g.city,
        state: g.state,
        pincode: g.pincode,
        contactPerson: g.contactPerson,
        contactPhone: g.contactPhone,
        active: g.active,
      }))
    : demoGodowns

  const usingDemoData = !apiGodowns && !isLoading

  const filteredGodowns = godowns.filter((godown) =>
    godown.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    godown.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    godown.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getGodownStock = (godownId: string | number) => {
    const stock = demoStockBalances.filter(b => b.godownId === String(godownId))
    const totalItems = stock.length
    const totalQuantity = stock.reduce((sum, b) => sum + b.availableQuantity, 0)
    const totalValue = stock.reduce((sum, b) => sum + (b.availableQuantity * 100), 0)
    return { totalItems, totalQuantity, totalValue, items: stock }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const data: GodownRequest = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      pincode: formData.get('pincode') as string,
      contactPerson: (formData.get('contactPerson') as string) || undefined,
      contactPhone: (formData.get('contactPhone') as string) || undefined,
      active: true,
    }

    try {
      if (apiGodowns) {
        if (editingGodown) {
          await updateMutation.mutateAsync({ id: Number(editingGodown.id), data })
          addToast(`Godown "${data.name}" updated successfully`, 'success')
        } else {
          await createMutation.mutateAsync(data)
          addToast(`Godown "${data.name}" created successfully`, 'success')
        }
      } else {
        addToast('Godown saved (demo mode — connect backend for persistence)', 'info')
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to save godown', 'error')
    }

    setIsCreateOpen(false)
    setEditingGodown(null)
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading godowns..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Godowns / Locations</h1>
          <p className="text-muted-foreground mt-1">
            Manage warehouses with detailed stock tracking
            {usingDemoData && (
              <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Demo Data
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Godown
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Godowns</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{godowns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {godowns.filter(g => g.active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoStockBalances.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Quantity</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {demoStockBalances.reduce((sum, b) => sum + b.availableQuantity, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Units in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(demoStockBalances.reduce((sum, b) => sum + (b.availableQuantity * 100), 0)).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Estimated inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Godowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGodowns.map((godown) => {
          const stockInfo = getGodownStock(godown.id)
          return (
            <Card key={godown.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{godown.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{godown.code}</p>
                    </div>
                  </div>
                  <Badge variant={godown.active ? 'success' : 'secondary'}>
                    {godown.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <p className="text-muted-foreground">{godown.address}</p>
                  <p className="text-muted-foreground">
                    {godown.city}, {godown.state} - {godown.pincode}
                  </p>
                  {godown.contactPerson && (
                    <div className="pt-2 border-t">
                      <p className="font-medium">{godown.contactPerson}</p>
                      <p className="text-muted-foreground">{godown.contactPhone}</p>
                    </div>
                  )}
                </div>

                {/* Stock Summary */}
                <div className="border rounded-lg p-3 bg-gray-50 mb-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">STOCK SUMMARY</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{stockInfo.totalItems}</p>
                      <p className="text-xs text-muted-foreground">Items</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{stockInfo.totalQuantity}</p>
                      <p className="text-xs text-muted-foreground">Units</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">₹{(stockInfo.totalValue / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">Value</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewingGodown(godown)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Stock
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditingGodown(godown)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* View Godown Stock Dialog */}
      <Dialog open={viewingGodown !== null} onOpenChange={(open) => {
        if (!open) setViewingGodown(null)
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Stock Details - {viewingGodown?.name}</DialogTitle>
            <DialogClose onClick={() => setViewingGodown(null)} />
          </DialogHeader>
          {viewingGodown && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">{viewingGodown.city}, {viewingGodown.state}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Contact</Label>
                  <p className="font-medium">{viewingGodown.contactPerson || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={viewingGodown.active ? 'success' : 'secondary'}>
                    {viewingGodown.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {(() => {
                const stockInfo = getGodownStock(viewingGodown.id)
                return (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">{stockInfo.totalItems}</p>
                            <p className="text-sm text-muted-foreground">Product Types</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">{stockInfo.totalQuantity}</p>
                            <p className="text-sm text-muted-foreground">Total Units</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-purple-600">₹{stockInfo.totalValue.toLocaleString('en-IN')}</p>
                            <p className="text-sm text-muted-foreground">Estimated Value</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Stock Items ({stockInfo.items.length})</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead className="text-right">Available</TableHead>
                              <TableHead className="text-right">Reserved</TableHead>
                              <TableHead className="text-right">In Transit</TableHead>
                              <TableHead>Unit</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stockInfo.items.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                  No stock in this godown
                                </TableCell>
                              </TableRow>
                            ) : (
                              stockInfo.items.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">{item.productName}</TableCell>
                                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                                  <TableCell className="text-right font-semibold text-green-600">
                                    {item.availableQuantity}
                                  </TableCell>
                                  <TableCell className="text-right text-orange-600">
                                    {item.reservedQuantity}
                                  </TableCell>
                                  <TableCell className="text-right text-blue-600">
                                    {item.inTransitQuantity}
                                  </TableCell>
                                  <TableCell>{item.unit}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Godown Dialog */}
      <Dialog open={isCreateOpen || editingGodown !== null} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false)
          setEditingGodown(null)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingGodown ? 'Edit Godown' : 'Add Godown'}
            </DialogTitle>
            <DialogClose onClick={() => {
              setIsCreateOpen(false)
              setEditingGodown(null)
            }} />
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="GDN-MUM-01"
                  defaultValue={editingGodown?.code}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Mumbai Central Warehouse"
                  defaultValue={editingGodown?.name}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                placeholder="Plot 45, Industrial Area"
                defaultValue={editingGodown?.address}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Mumbai"
                  defaultValue={editingGodown?.city}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="Maharashtra"
                  defaultValue={editingGodown?.state}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  placeholder="400001"
                  defaultValue={editingGodown?.pincode}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  placeholder="John Doe"
                  defaultValue={editingGodown?.contactPerson || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  placeholder="+91 98765 43210"
                  defaultValue={editingGodown?.contactPhone || ''}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingGodown(null)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending)
                  ? 'Saving...'
                  : editingGodown ? 'Update Godown' : 'Create Godown'
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
