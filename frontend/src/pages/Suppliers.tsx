import { Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Suppliers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-muted-foreground mt-1">Manage supplier information and balances</p>
        </div>
        <Button>Add Supplier</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Supplier Management</h3>
            <p className="text-muted-foreground mb-4">Supplier list, contact details, purchase history, and payment balances</p>
            <Badge>Prototype</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
