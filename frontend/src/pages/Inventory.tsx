import { useState } from 'react'
import { Search, Package, TrendingUp } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { useStockBalances, useStockMovements } from '@/hooks/use-stock-queries'
import { useGodowns } from '@/hooks/use-core-queries'
import { demoStockBalances, demoStockMovements } from '@/data/demoData'

interface BalanceRow {
  sku: string
  productName: string
  godownName: string
  godownId: string | number
  availableQuantity: number
  reservedQuantity: number
  inTransitQuantity: number
  unit: string
}

interface MovementRow {
  id: string | number
  performedAt: string
  movementType: string
  productName: string
  sku: string
  quantity: number
  unit: string
  sourceGodownName?: string
  destinationGodownName?: string
  referenceId?: string
  performedBy: string
}

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [godownFilter, setGodownFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'balances' | 'movements'>('balances')

  const { data: apiBalances, isLoading: balancesLoading } = useStockBalances()
  const { data: apiMovements, isLoading: movementsLoading } = useStockMovements()
  const { data: apiGodowns } = useGodowns()

  const balances: BalanceRow[] = apiBalances
    ? apiBalances.map((b) => ({
        sku: b.productSku,
        productName: b.productName,
        godownName: b.godownName,
        godownId: b.godownId,
        availableQuantity: b.availableQuantity,
        reservedQuantity: b.reservedQuantity,
        inTransitQuantity: b.inTransitQuantity,
        unit: b.unit,
      }))
    : demoStockBalances

  const movements: MovementRow[] = apiMovements
    ? apiMovements.map((m) => ({
        id: m.id,
        performedAt: m.movementDate,
        movementType: m.movementType,
        productName: m.productName,
        sku: m.productSku,
        quantity: m.quantity,
        unit: m.unit,
        sourceGodownName: m.direction === 'OUT' ? m.godownName : undefined,
        destinationGodownName: m.direction === 'IN' ? m.godownName : undefined,
        referenceId: m.referenceNumber || m.movementNumber,
        performedBy: m.createdByName,
      }))
    : demoStockMovements

  const filteredBalances = balances.filter((balance) => {
    const matchesSearch =
      balance.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      balance.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGodown = godownFilter === 'all' || String(balance.godownId) === godownFilter
    return matchesSearch && matchesGodown
  })

  const filteredMovements = movements.filter((movement) => {
    return (
      movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const totalStockValue = filteredBalances.reduce((sum, b) => sum + b.availableQuantity * 100, 0)
  const totalItems = filteredBalances.length
  const totalInTransit = filteredBalances.reduce((sum, b) => sum + b.inTransitQuantity, 0)

  if (viewMode === 'balances' && balancesLoading) {
    return <LoadingSpinner message="Loading stock balances..." />
  }

  if (viewMode === 'movements' && movementsLoading) {
    return <LoadingSpinner message="Loading stock movements..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Track stock levels across all locations
            {!apiBalances && (
              <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Demo Data
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stock Value
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalStockValue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all godowns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique product-location pairs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Transit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInTransit}</div>
            <p className="text-xs text-muted-foreground mt-1">Units being transferred</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {viewMode === 'balances' && (
              <Select value={godownFilter} onChange={(e) => setGodownFilter(e.target.value)}>
                <option value="all">All Godowns</option>
                {apiGodowns
                  ? apiGodowns.map((g) => (
                      <option key={g.id} value={String(g.id)}>
                        {g.name}
                      </option>
                    ))
                  : [
                      { id: '1', name: 'Mumbai Central Warehouse' },
                      { id: '2', name: 'Delhi North Warehouse' },
                      { id: '3', name: 'Bangalore Tech Park' },
                      { id: '4', name: 'Chennai Port Warehouse' },
                    ].map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
              </Select>
            )}
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'balances'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setViewMode('balances')}
              >
                Stock Balances
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'movements'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setViewMode('movements')}
              >
                Stock Movements
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Balances Table */}
      {viewMode === 'balances' && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Godown</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Reserved</TableHead>
                  <TableHead className="text-right">In Transit</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBalances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No inventory found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBalances.map((balance, idx) => {
                    const total =
                      balance.availableQuantity +
                      balance.reservedQuantity +
                      balance.inTransitQuantity
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-sm">{balance.sku}</TableCell>
                        <TableCell className="font-medium">{balance.productName}</TableCell>
                        <TableCell className="text-sm">{balance.godownName}</TableCell>
                        <TableCell className="text-right font-medium">
                          {balance.availableQuantity}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {balance.reservedQuantity}
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          {balance.inTransitQuantity}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{total}</TableCell>
                        <TableCell>{balance.unit}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Stock Movements Table */}
      {viewMode === 'movements' && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Performed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No movements found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="text-sm">
                        {new Date(movement.performedAt).toLocaleDateString('en-IN')}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {new Date(movement.performedAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            movement.movementType === 'PURCHASE_RECEIPT' ||
                            movement.movementType === 'PURCHASE_IN' ||
                            movement.movementType === 'TRANSFER_IN'
                              ? 'success'
                              : movement.movementType === 'SALE' ||
                                movement.movementType === 'SALES_OUT' ||
                                movement.movementType === 'DAMAGE'
                              ? 'destructive'
                              : 'default'
                          }
                        >
                          {movement.movementType.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{movement.productName}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {movement.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {movement.movementType.includes('OUT') ||
                        movement.movementType === 'SALE' ||
                        movement.movementType === 'DAMAGE' ? (
                          <span className="text-red-600">-{movement.quantity}</span>
                        ) : (
                          <span className="text-green-600">+{movement.quantity}</span>
                        )}{' '}
                        {movement.unit}
                      </TableCell>
                      <TableCell className="text-sm">
                        {movement.sourceGodownName || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {movement.destinationGodownName || '-'}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {movement.referenceId || '-'}
                      </TableCell>
                      <TableCell className="text-sm">{movement.performedBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
