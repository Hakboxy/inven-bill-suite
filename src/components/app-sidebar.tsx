import {
  BookPlus,
  LayoutDashboard,
  Package,
  FileText,
  Users,
  TrendingUp,
  Settings,
  HelpCircle,
  CreditCard,
  ShoppingCart,
  BarChart3,
  UserCheck,
  Building2,
  Archive,
  Receipt,
  Calculator,
  Globe,
  Shield
} from "lucide-react"
import { useLocation, Link } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const menuGroups = [
  {
    label: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: TrendingUp,
      },
    ],
  },
  {
    label: "Sales & Billing",
    items: [
      {
        title: "Invoices",
        url: "/invoices",
        icon: FileText,
      },
      {
        title: "Create Invoice",
        url: "/invoices/create",
        icon: BookPlus,
      },
      {
        title: "Payments",
        url: "/payments",
        icon: CreditCard,
      },
      {
        title: "Sales Orders",
        url: "/sales-orders",
        icon: ShoppingCart,
      },
    ],
  },
  {
    label: "Inventory",
    items: [
      {
        title: "Products",
        url: "/products",
        icon: Package,
      },
      {
        title: "Categories",
        url: "/categories",
        icon: Archive,
      },
      {
        title: "Stock Management",
        url: "/inventory/stock",
        icon: Package,
      },
      {
        title: "Purchase Orders",
        url: "/purchase-orders",
        icon: Receipt,
      },
    ],
  },
  {
    label: "Customers & Vendors",
    items: [
      {
        title: "Customers",
        url: "/customers",
        icon: Users,
      },
      {
        title: "Vendors",
        url: "/vendors",
        icon: Building2,
      },
      {
        title: "Customer Groups",
        url: "/customer-groups",
        icon: UserCheck,
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        title: "Financial Reports",
        url: "/reports/financial",
        icon: BarChart3,
      },
      {
        title: "Tax Reports",
        url: "/reports/tax",
        icon: Calculator,
      },
      {
        title: "Inventory Reports",
        url: "/reports/inventory",
        icon: Package,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Company Settings",
        url: "/settings/company",
        icon: Building2,
      },
      {
        title: "User Management",
        url: "/settings/users",
        icon: Shield,
      },
      {
        title: "Integrations",
        url: "/settings/integrations",
        icon: Globe,
      },
      {
        title: "General Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="border-r bg-sidebar">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">InvenBill</h1>
            <p className="text-xs text-muted-foreground">Business Suite</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="sidebar-scroll">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-6 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      className={cn(
                        "mx-2 rounded-md",
                        location.pathname === item.url && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className="h-4 w-4" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/help" className="flex items-center gap-3 px-3 py-2">
                <HelpCircle className="h-4 w-4" />
                <span>Help & Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
