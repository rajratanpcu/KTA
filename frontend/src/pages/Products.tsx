import { useState } from 'react'
import { Plus, Search, Edit, Trash2, MoreVertical } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { demoProducts } from '@/data/demoData'
import type { Product } from '@/types'

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const categories = ['all', 'Grains', 'Oils', 'Pulses', 'Sugar & Salt', 'Beverages']

  const filteredProducts = demoProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm))
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  const handleDelete = (productId: string) => {
    // Prototype - would show confirmation dialog and call API
    alert(`Delete product ${productId} - This is a prototype action`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Purchase Price</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
                <TableHead className="text-right">GST %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.barcode && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {product.barcode}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell className="text-right">₹{product.purchasePrice}</TableCell>
                    <TableCell className="text-right">₹{product.sellingPrice}</TableCell>
                    <TableCell className="text-right">{product.gstRate}%</TableCell>
                    <TableCell>
                      <Badge variant={product.active ? 'success' : 'secondary'}>
                        {product.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Create/Edit Product Dialog */}
      <Dialog open={isCreateOpen || editingProduct !== null} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false)
          setEditingProduct(null)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Create Product'}
            </DialogTitle>
            <DialogClose onClick={() => {
              setIsCreateOpen(false)
              setEditingProduct(null)
            }} />
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert('Product save - This is a prototype action')
              setIsCreateOpen(false)
              setEditingProduct(null)
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  placeholder="PROD-001"
                  defaultValue={editingProduct?.sku}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  placeholder="8901234567890"
                  defaultValue={editingProduct?.barcode}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                defaultValue={editingProduct?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Product description"
                defaultValue={editingProduct?.description}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  id="category"
                  defaultValue={editingProduct?.category}
                  required
                >
                  <option value="">Select category</option>
                  {categories.filter(c => c !== 'all').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  id="unit"
                  defaultValue={editingProduct?.unit}
                  required
                >
                  <option value="">Select unit</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="litre">Litre (L)</option>
                  <option value="pack">Pack</option>
                  <option value="piece">Piece</option>
                  <option value="box">Box</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={editingProduct?.purchasePrice}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={editingProduct?.sellingPrice}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstRate">GST Rate % *</Label>
                <Select
                  id="gstRate"
                  defaultValue={editingProduct?.gstRate?.toString()}
                  required
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stock Level</Label>
              <Input
                id="minStock"
                type="number"
                placeholder="0"
                defaultValue={editingProduct?.minStockLevel}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingProduct(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
