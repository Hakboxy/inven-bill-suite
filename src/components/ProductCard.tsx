
import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Edit, 
  Copy, 
  Eye, 
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle 
} from "lucide-react"
import { Link } from "react-router-dom"
import type { Product } from "@/constants/dummyData"

interface ProductCardProps {
  product: Product
  onEdit?: (product: Product) => void
  onDuplicate?: (product: Product) => void
}

export function ProductCard({ product, onEdit, onDuplicate }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStockStatus = () => {
    if (product.stock === 0) {
      return { 
        status: 'out-of-stock', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        icon: XCircle,
        label: 'Out of Stock'
      }
    }
    if (product.stock <= product.lowStockThreshold) {
      return { 
        status: 'low-stock', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        icon: AlertTriangle,
        label: 'Low Stock'
      }
    }
    return { 
      status: 'in-stock', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      icon: CheckCircle,
      label: 'In Stock'
    }
  }

  const stockStatus = getStockStatus()
  const StockIcon = stockStatus.icon

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 h-full flex flex-col">
      <CardContent className="p-4 flex-1">
        {/* Product Image */}
        <div className="relative mb-4 bg-muted rounded-lg overflow-hidden aspect-square">
          {!imageError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          
          {/* Stock Level Indicator */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${stockStatus.bgColor} ${stockStatus.color}`}>
            <StockIcon className="h-3 w-3" />
            <span className="sr-only">{stockStatus.label}</span>
            {product.stock}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2" title={product.description}>
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-lg font-bold text-primary">
                {formatCurrency(product.price)}
              </p>
              <p className="text-xs text-muted-foreground">
                SKU: {product.sku}
              </p>
            </div>
          </div>

          {/* Category and Status */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
            <Badge 
              variant={product.status === 'active' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {product.status}
            </Badge>
          </div>
        </div>
      </CardContent>

      {/* Quick Actions */}
      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(product)}
            aria-label={`Edit ${product.name}`}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate?.(product)}
            aria-label={`Duplicate ${product.name}`}
          >
            <Copy className="h-3 w-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            asChild
            aria-label={`View details for ${product.name}`}
          >
            <Link to={`/products/${product.id}`}>
              <Eye className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
