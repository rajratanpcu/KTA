import { useState } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
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
import { LoadingSpinner, ErrorDisplay } from '@/components/ui/loading'
import { useToast } from '@/components/ui/toast'
import { useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/use-core-queries'
import { demoProducts } from '@/data/demoData'
import type { ProductRequest } from '@/services/core-api'

interface ProductRow {
  id: string | number
  sku: string
  barcode?: string | null
  name: string
  description?: string | null
  category: string
  categoryId?: number | null
  unit: string
  unitId?: number | null
  purchasePrice: number
  sellingPrice: number
  gstRate: number
  minStockLevel?: number | null
  active: boolean
}

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<ProductRow | null>(null)

  const { addToast } = useToast()

  // Fetch from API with fallback to demo data
  const { data: apiProducts, isLoading, isError, error, refetch } = useProducts()
  const { data: apiCategories } = useCategories()

  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()

  // Map API products to display format, or fall back to demo data
  const products: ProductRow[] = apiProducts
    ? apiProducts.map((p) => ({
        id: p.id,
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        description: p.description,
        category: p.categoryName || 'Uncategorized',
        categoryId: p.categoryId,
        unit: p.unitAbbreviation || p.unitName || '-',
        unitId: p.unitId,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        gstRate: p.gstRate,
        minStockLevel: p.minStockLevel,
        active: p.active,
      }))
    : demoProducts.map((p) => ({
        ...p,
        category: p.category || 'Uncategorized',
        unit: p.unit || '-',
      }))

  const usingDemoData = !apiProducts && !isLoading

  const categories = apiCategories
    ? ['all', ...apiCategories.map((c) => c.name)]
    : ['all', 'Grains', 'Oils', 'Pulses', 'Sugar & Salt', 'Beverages']

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm))
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleEdit = (product: ProductRow) => {
    setEditingProduct(product)
  }

  const handleDelete = (product: ProductRow) => {
    setDeleteConfirm(product)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      if (apiProducts) {
        await deleteMutation.mutateAsync(Number(deleteConfirm.id))
      }
      addToast(`Product "${deleteConfirm.name}" deleted successfully`, 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to delete product', 'error')
    }
    setDeleteConfirm(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const data: ProductRequest = {
      sku: formData.get('sku') as string,
      barcode: (formData.get('barcode') as string) || undefined,
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || undefined,
      categoryId: formData.get('categoryId') ? Number(formData.get('categoryId')) : undefined,
      unitId: formData.get('unitId') ? Number(formData.get('unitId')) : undefined,
      purchasePrice: Number(formData.get('purchasePrice')),
      sellingPrice: Number(formData.get('sellingPrice')),
      gstRate: Number(formData.get('gstRate')),
      minStockLevel: formData.get('minStock') ? Number(formData.get('minStock')) : undefined,
      active: true,
    }

    try {
      if (apiProducts) {
        if (editingProduct) {
          await updateMutation.mutateAsync({ id: Number(editingProduct.id), data })
          addToast(`Product "${data.name}" updated successfully`, 'success')
        } else {
          await createMutation.mutateAsync(data)
          addToast(`Product "${data.name}" created successfully`, 'success')
        }
      } else {
        addToast('Product saved (demo mode — connect backend for persistence)', 'info')
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to save product', 'error')
    }

    setIsCreateOpen(false)
    setEditingProduct(null)
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading products..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog
            {usingDemoData && (
              <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Demo Data — Start backend to see live data
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} disabled={createMutation.isPending}>
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

      {/* Error display */}
      {isError && (
        <ErrorDisplay
          message={error?.message || 'Failed to load products'}
          onRetry={() => refetch()}
        />
      )}

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
                          onClick={() => handleDelete(product)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => {
        if (!open) setDeleteConfirm(null)
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogClose onClick={() => setDeleteConfirm(null)} />
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  placeholder="PROD-001"
                  defaultValue={editingProduct?.sku}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  placeholder="8901234567890"
                  defaultValue={editingProduct?.barcode || ''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter product name"
                defaultValue={editingProduct?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Product description"
                defaultValue={editingProduct?.description || ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                {apiCategories ? (
                  <Select
                    id="categoryId"
                    name="categoryId"
                    defaultValue={editingProduct?.categoryId?.toString() || ''}
                  >
                    <option value="">Select category</option>
                    {apiCategories.map((cat) => (
                      <option key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Select
                    id="categoryId"
                    name="categoryId"
                    defaultValue={editingProduct?.category}
                  >
                    <option value="">Select category</option>
                    {categories.filter(c => c !== 'all').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitId">Unit *</Label>
                <Select
                  id="unitId"
                  name="unitId"
                  defaultValue={editingProduct?.unitId?.toString() || ''}
                  required
                >
                  <option value="">Select unit</option>
                  <option value="1">Kilogram (kg)</option>
                  <option value="2">Litre (L)</option>
                  <option value="3">Pack</option>
                  <option value="4">Piece (pcs)</option>
                  <option value="5">Box</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price *</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
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
                  name="sellingPrice"
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
                  name="gstRate"
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
                name="minStock"
                type="number"
                placeholder="0"
                defaultValue={editingProduct?.minStockLevel || ''}
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
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending)
                  ? 'Saving...'
                  : editingProduct ? 'Update Product' : 'Create Product'
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
