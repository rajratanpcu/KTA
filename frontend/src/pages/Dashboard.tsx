import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  ArrowLeftRight,
  Clock,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const salesData = [
  { month: 'Apr', sales: 285000, purchases: 195000 },
  { month: 'May', sales: 320000, purchases: 215000 },
  { month: 'Jun', sales: 298000, purchases: 202000 },
  { month: 'Jul', sales: 345000, purchases: 235000 },
  { month: 'Aug', sales: 380000, purchases: 248000 },
  { month: 'Sep', sales: 415000, purchases: 275000 },
  { month: 'Oct', sales: 195000, purchases: 128000 },
]

const categoryData = [
  { name: 'Grains', value: 35, color: '#3b82f6' },
  { name: 'Oils', value: 25, color: '#8b5cf6' },
  { name: 'Pulses', value: 20, color: '#10b981' },
  { name: 'Sugar & Salt', value: 12, color: '#f59e0b' },
  { name: 'Others', value: 8, color: '#6b7280' },
]

const lowStockProducts = [
  { name: 'Toor Dal 1kg', current: 180, minimum: 300, unit: 'kg' },
  { name: 'Premium Black Tea 250g', current: 145, minimum: 150, unit: 'pack' },
  { name: 'Chana Dal 1kg', current: 95, minimum: 200, unit: 'kg' },
]

const recentActivity = [
  { action: 'Sale completed', detail: 'SALE-2024-156 - ₹12,450', time: '2 hours ago', type: 'sale' },
  { action: 'Transfer dispatched', detail: 'TR-2024-008 - Mumbai to Delhi', time: '3 hours ago', type: 'transfer' },
  { action: 'Purchase received', detail: 'PO-2024-045 - 500kg Rice', time: '5 hours ago', type: 'purchase' },
  { action: 'Low stock alert', detail: 'Toor Dal below minimum level', time: '6 hours ago', type: 'alert' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your business operations</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30days">
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="12months">Last 12 months</option>
          </Select>
          <Select defaultValue="all">
            <option value="all">All Godowns</option>
            <option value="1">Mumbai Central</option>
            <option value="2">Delhi North</option>
            <option value="3">Bangalore Tech Park</option>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹4,15,000</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Purchases
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,75,000</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock Value
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹18,45,000</div>
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3" />
              -3.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3" />
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Purchases */}
        <Card>
          <CardHeader>
            <CardTitle>Sales vs Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} name="Sales" />
                <Line type="monotone" dataKey="purchases" stroke="#8b5cf6" strokeWidth={2} name="Purchases" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Stock by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Current: {product.current} {product.unit} | Min: {product.minimum} {product.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                      {product.minimum - product.current} {product.unit} short
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activity.type === 'sale' ? 'bg-green-100' :
                    activity.type === 'transfer' ? 'bg-blue-100' :
                    activity.type === 'purchase' ? 'bg-purple-100' :
                    'bg-yellow-100'
                  }`}>
                    {activity.type === 'sale' ? <IndianRupee className="h-4 w-4 text-green-600" /> :
                     activity.type === 'transfer' ? <ArrowLeftRight className="h-4 w-4 text-blue-600" /> :
                     activity.type === 'purchase' ? <Package className="h-4 w-4 text-purple-600" /> :
                     <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
