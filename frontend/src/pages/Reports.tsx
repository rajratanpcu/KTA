import { FileText, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

const reportTypes = [
  { name: 'Sales Report', description: 'Daily, weekly, monthly sales analysis' },
  { name: 'Purchase Report', description: 'Purchase orders and receipts summary' },
  { name: 'Stock Report', description: 'Current stock levels by product and godown' },
  { name: 'Stock Movement', description: 'All stock movements with audit trail' },
  { name: 'Valuation Report', description: 'Stock valuation at cost and selling price' },
  { name: 'Low Stock Report', description: 'Products below minimum stock level' },
  { name: 'Transfer Status', description: 'All transfers with dispatch/receipt status' },
  { name: 'Outstanding Balances', description: 'Customer and supplier balances' },
]

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate business reports and analytics</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Custom date range</option>
            </Select>
            <Select>
              <option>All Godowns</option>
              <option>Mumbai Central</option>
              <option>Delhi North</option>
              <option>Bangalore Tech Park</option>
            </Select>
            <Select>
              <option>All Categories</option>
              <option>Grains</option>
              <option>Oils</option>
              <option>Pulses</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{report.name}</h3>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
