import { useState } from 'react'
import { Plus, Search, Edit, MapPin } from 'lucide-react'
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
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { demoGodowns, demoStockBalances } from '@/data/demoData'
import type { Godown } from '@/types'

export default function Godowns() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingGodown, setEditingGodown] = useState<Godown | null>(null)

  const filteredGodowns = demoGodowns.filter((godown) =>
    godown.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    godown.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    godown.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getGodownStockCount = (godownId: string) => {
    return demoStockBalances.filter(b => b.godownId === godownId).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Godowns / Locations</h1>
          <p className="text-muted-foreground mt-1">Manage warehouse and storage locations</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Godown
        </Button>
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
        {filteredGodowns.map((godown) => (
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

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Stock Items</p>
                  <p className="text-lg font-bold">{getGodownStockCount(godown.id)}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingGodown(godown)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
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
          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert('Godown save - This is a prototype action')
              setIsCreateOpen(false)
              setEditingGodown(null)
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  placeholder="GDN-MUM-01"
                  defaultValue={editingGodown?.code}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
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
                  placeholder="Mumbai"
                  defaultValue={editingGodown?.city}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="Maharashtra"
                  defaultValue={editingGodown?.state}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
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
                  placeholder="John Doe"
                  defaultValue={editingGodown?.contactPerson}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="+91 98765 43210"
                  defaultValue={editingGodown?.contactPhone}
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
              <Button type="submit">
                {editingGodown ? 'Update Godown' : 'Create Godown'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
