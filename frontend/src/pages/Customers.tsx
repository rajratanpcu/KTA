import { Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Customers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage customer information and balances</p>
        </div>
        <Button>Add Customer</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Customer Management</h3>
            <p className="text-muted-foreground mb-4">Customer list, contact details, transaction history, and outstanding balances</p>
            <Badge>Prototype</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
