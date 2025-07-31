
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { AuthRoute } from "@/components/AuthRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductCreate from "./pages/ProductCreate";
import Categories from "./pages/Categories";
import StockManagement from "./pages/StockManagement";
import Invoices from "./pages/Invoices";
import InvoiceCreate from "./pages/InvoiceCreate";
import Payments from "./pages/Payments";
import SalesOrders from "./pages/SalesOrders";
import Customers from "./pages/Customers";
import Vendors from "./pages/Vendors";
import CustomerGroups from "./pages/CustomerGroups";
import FinancialReports from "./pages/FinancialReports";
import TaxReports from "./pages/TaxReports";
import InventoryReports from "./pages/InventoryReports";
import CompanySettings from "./pages/CompanySettings";
import UserManagement from "./pages/UserManagement";
import Integrations from "./pages/Integrations";
import GeneralSettings from "./pages/GeneralSettings";
import NotFound from "./pages/NotFound";
import PurchaseOrders from "./pages/PurchaseOrders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="invenbill-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <AuthRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <Header />
                      <main className="flex-1 p-6">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/products/create" element={<ProductCreate />} />
                          <Route path="/products/add" element={<ProductCreate />} />
                          <Route path="/categories" element={<Categories />} />
                          <Route path="/inventory/stock" element={<StockManagement />} />
                          <Route path="/purchase-orders" element={<PurchaseOrders />} />
                          <Route path="/invoices" element={<Invoices />} />
                          <Route path="/invoices/create" element={<InvoiceCreate />} />
                          <Route path="/payments" element={<Payments />} />
                          <Route path="/sales-orders" element={<SalesOrders />} />
                          <Route path="/customers" element={<Customers />} />
                          <Route path="/vendors" element={<Vendors />} />
                          <Route path="/customer-groups" element={<CustomerGroups />} />
                          <Route path="/reports/financial" element={<FinancialReports />} />
                          <Route path="/reports/tax" element={<TaxReports />} />
                          <Route path="/reports/inventory" element={<InventoryReports />} />
                          <Route path="/settings/company" element={<CompanySettings />} />
                          <Route path="/settings/users" element={<UserManagement />} />
                          <Route path="/settings/integrations" element={<Integrations />} />
                          <Route path="/settings/general" element={<GeneralSettings />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </AuthRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
