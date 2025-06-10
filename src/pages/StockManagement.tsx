
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Minus
} from "lucide-react"
import { products } from "@/constants/dummyData"

interface StockMovement {
  id: string
  productId: string
  productName: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  date: string
  user: string
}

const stockMovements: StockMovement[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Wireless Bluetooth Headphones',
    type: 'in',
    quantity: 50,
    previousStock: 150,
    newStock: 200,
    reason: 'Restock from supplier',
    date: '2024-06-08',
    user: 'John Doe'
  },
  {
    id: '2',
    productId: '2',
    productName: 'Ergonomic Office Chair',
    type: 'out',
    quantity: 5,
    previousStock: 50,
    newStock: 45,
    reason: 'Sale order #INV-001',
    date: '2024-06-07',
    user: 'System'
  },
  {
    id: '3',
    productId: '3',
    productName: 'Smartphone Case',
    type: 'adjustment',
    quantity: -2,
    previousStock: 7,
    newStock: 5,
    reason: 'Damaged items',
    date: '2024-06-06',
    user: 'Sarah Johnson'
  },
]

export default function StockManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [movementTypeFilter, setMovementTypeFilter] = useState("all")
  const [activeTab, setActiveTab] = useState<'overview' | 'movements'>('overview')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'adjustment':
        return <Minus className="h-4 w-4 text-yellow-600" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'in':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Stock In</Badge>
      case 'out':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Stock Out</Badge>
      case 'adjustment':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Adjustment</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const filteredMovements = stockMovements.filter((movement) => {
    const matchesSearch = movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = movementTypeFilter === "all" || movement.type === movementTypeFilter
    
    return matchesSearch && matchesType
  })

  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold)
  const outOfStockProducts = products.filter(p => p.stock === 0)
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">Monitor inventory levels and track stock movements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Stock Adjustment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalStockValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockProducts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Movements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockMovements.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
        >
          Stock Overview
        </Button>
        <Button
          variant={activeTab === 'movements' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('movements')}
        >
          Stock Movements
        </Button>
      </div>

      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Current Stock Levels</CardTitle>
            <CardDescription>Monitor your product inventory levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Low Stock Alert */}
              {lowStockProducts.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Low Stock Alert</h3>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    The following products are running low on stock:
                  </p>
                  <div className="space-y-2">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex justify-between items-center bg-white dark:bg-gray-800 rounded p-2">
                        <span className="font-medium">{product.name}</span>
                        <Badge variant="outline">
                          {product.stock} left (min: {product.lowStockThreshold})
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Overview Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min Level</TableHead>
                      <TableHead>Stock Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            product.stock === 0 ? "text-red-600" :
                            product.stock <= product.lowStockThreshold ? "text-yellow-600" :
                            "text-green-600"
                          }`}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>{product.lowStockThreshold}</TableCell>
                        <TableCell>${(product.stock * product.cost).toLocaleString()}</TableCell>
                        <TableCell>
                          {product.stock === 0 ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : product.stock <= product.lowStockThreshold ? (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Low Stock</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">In Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'movements' && (
        <Card>
          <CardHeader>
            <CardTitle>Stock Movement History</CardTitle>
            <CardDescription>Track all inventory changes and adjustments</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search movements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="in">Stock In</SelectItem>
                  <SelectItem value="out">Stock Out</SelectItem>
                  <SelectItem value="adjustment">Adjustments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Movements Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Previous Stock</TableHead>
                    <TableHead>New Stock</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{formatDate(movement.date)}</TableCell>
                      <TableCell className="font-medium">{movement.productName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.type)}
                          {getMovementBadge(movement.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          movement.type === 'in' ? 'text-green-600' : 
                          movement.type === 'out' ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>
                          {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}
                          {Math.abs(movement.quantity)}
                        </span>
                      </TableCell>
                      <TableCell>{movement.previousStock}</TableCell>
                      <TableCell className="font-medium">{movement.newStock}</TableCell>
                      <TableCell>{movement.reason}</TableCell>
                      <TableCell>{movement.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredMovements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No stock movements found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
