
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
  Plus,
  Search,
  Edit,
  Trash2,
  Folder,
  Tag,
  MoreVertical,
  GripVertical
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Category {
  id: string
  name: string
  description?: string
  productCount: number
  parentId?: string
  children?: Category[]
}

const dummyCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    productCount: 45,
    children: [
      { id: '1-1', name: 'Computers', productCount: 15, parentId: '1' },
      { id: '1-2', name: 'Mobile Phones', productCount: 20, parentId: '1' },
      { id: '1-3', name: 'Audio Equipment', productCount: 10, parentId: '1' },
    ]
  },
  {
    id: '2',
    name: 'Furniture',
    description: 'Office and home furniture',
    productCount: 32,
    children: [
      { id: '2-1', name: 'Office Chairs', productCount: 12, parentId: '2' },
      { id: '2-2', name: 'Desks', productCount: 8, parentId: '2' },
      { id: '2-3', name: 'Storage', productCount: 12, parentId: '2' },
    ]
  },
  {
    id: '3',
    name: 'Accessories',
    productCount: 28,
  },
  {
    id: '4',
    name: 'Lighting',
    productCount: 15,
  },
  {
    id: '5',
    name: 'Appliances',
    productCount: 22,
  },
]

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['1', '2']))

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const renderCategoryRow = (category: Category, level = 0) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children && category.children.length > 0

    return (
      <>
        <TableRow key={category.id} className="group">
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move opacity-0 group-hover:opacity-100" />
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleCategory(category.id)}
                >
                  <Folder className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </Button>
              ) : (
                <Tag className="h-4 w-4 text-muted-foreground ml-6" />
              )}
              <span className="font-medium">{category.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <span className="text-muted-foreground">{category.description}</span>
          </TableCell>
          <TableCell>
            <Badge variant="secondary">{category.productCount} products</Badge>
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subcategory
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        
        {hasChildren && isExpanded && category.children?.map(child => 
          renderCategoryRow(child, level + 1)
        )}
      </>
    )
  }

  const filteredCategories = dummyCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalCategories = dummyCategories.length
  const totalProducts = dummyCategories.reduce((sum, cat) => sum + cat.productCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Organize your products with categories and subcategories</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Categorized</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Products per Category</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalProducts / totalCategories)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Management */}
      <Card>
        <CardHeader>
          <CardTitle>Category Structure</CardTitle>
          <CardDescription>Manage your product categories and hierarchy</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Categories Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map(category => renderCategoryRow(category))}
              </TableBody>
            </Table>
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No categories found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
