import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Warehouse,
  MapPin,
  ArrowLeftRight,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Users,
  Building2,
  FileText,
  Receipt,
  Settings,
  Bell,
  User,
  Search,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Inventory', href: '/inventory', icon: Warehouse },
  { name: 'Godowns', href: '/godowns', icon: MapPin },
  { name: 'Stock Transfers', href: '/transfers', icon: ArrowLeftRight },
  { name: 'Purchasing', href: '/purchasing', icon: ShoppingCart },
  { name: 'Sales / POS', href: '/sales', icon: ShoppingBag },
  { name: 'Transport', href: '/transport', icon: Truck },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Suppliers', href: '/suppliers', icon: Building2 },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary">KTA ERP</h1>
          <p className="text-xs text-muted-foreground mt-1">Retail & Wholesale</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">admin@kta.local</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products, orders, customers..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Prototype Notice */}
        <div className="bg-yellow-50 border-t border-yellow-200 px-6 py-2">
          <p className="text-xs text-yellow-800">
            <strong>UI Prototype:</strong> This interface uses simulated demo data.
            No real transactions are processed.
          </p>
        </div>
      </div>
    </div>
  )
}
