
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  lastOrder?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  image?: string;
  description?: string;
  supplier?: string;
  lastRestocked?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

// Dummy data
export const dashboardStats: DashboardStats = {
  totalRevenue: 124567.89,
  totalOrders: 1234,
  totalCustomers: 456,
  totalProducts: 789,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.2,
  productsGrowth: 3.1,
};

export const recentInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    customerName: 'Acme Corporation',
    customerId: 'cust_1',
    date: '2024-06-01',
    dueDate: '2024-06-15',
    amount: 2500.00,
    status: 'paid',
    items: 5,
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    customerName: 'Tech Solutions Ltd',
    customerId: 'cust_2',
    date: '2024-06-05',
    dueDate: '2024-06-20',
    amount: 1750.50,
    status: 'sent',
    items: 3,
  },
  {
    id: '3',
    invoiceNumber: 'INV-003',
    customerName: 'Global Enterprises',
    customerId: 'cust_3',
    date: '2024-06-08',
    dueDate: '2024-06-22',
    amount: 3200.75,
    status: 'overdue',
    items: 8,
  },
  {
    id: '4',
    invoiceNumber: 'INV-004',
    customerName: 'StartUp Inc',
    customerId: 'cust_4',
    date: '2024-06-10',
    dueDate: '2024-06-25',
    amount: 980.25,
    status: 'draft',
    items: 2,
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    sku: 'WBH-001',
    category: 'Electronics',
    price: 99.99,
    cost: 45.00,
    stock: 150,
    lowStockThreshold: 20,
    status: 'active',
    description: 'High-quality wireless headphones with noise cancellation',
    supplier: 'AudioTech Ltd',
    lastRestocked: '2024-05-15',
  },
  {
    id: '2',
    name: 'Ergonomic Office Chair',
    sku: 'EOC-002',
    category: 'Furniture',
    price: 299.99,
    cost: 150.00,
    stock: 45,
    lowStockThreshold: 10,
    status: 'active',
    description: 'Comfortable ergonomic chair for office use',
    supplier: 'Office Furniture Co',
    lastRestocked: '2024-05-20',
  },
  {
    id: '3',
    name: 'Smartphone Case',
    sku: 'SPC-003',
    category: 'Accessories',
    price: 24.99,
    cost: 8.00,
    stock: 5,
    lowStockThreshold: 25,
    status: 'active',
    description: 'Protective case for latest smartphone models',
    supplier: 'Mobile Accessories Inc',
    lastRestocked: '2024-04-30',
  },
  {
    id: '4',
    name: 'LED Desk Lamp',
    sku: 'LDL-004',
    category: 'Lighting',
    price: 79.99,
    cost: 35.00,
    stock: 0,
    lowStockThreshold: 15,
    status: 'out_of_stock',
    description: 'Adjustable LED desk lamp with USB charging port',
    supplier: 'Lighting Solutions',
    lastRestocked: '2024-03-15',
  },
  {
    id: '5',
    name: 'Coffee Maker',
    sku: 'CM-005',
    category: 'Appliances',
    price: 149.99,
    cost: 75.00,
    stock: 32,
    lowStockThreshold: 8,
    status: 'active',
    description: 'Programmable coffee maker with thermal carafe',
    supplier: 'Kitchen Appliances Ltd',
    lastRestocked: '2024-05-25',
  },
  {
    id: '6',
    name: 'Wireless Mouse',
    sku: 'WM-006',
    category: 'Electronics',
    price: 39.99,
    cost: 18.00,
    stock: 85,
    lowStockThreshold: 30,
    status: 'active',
    description: 'Ergonomic wireless mouse with long battery life',
    supplier: 'Computer Peripherals Inc',
    lastRestocked: '2024-06-01',
  },
];

export const customers: Customer[] = [
  {
    id: 'cust_1',
    name: 'John Smith',
    email: 'john.smith@acme.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    totalOrders: 25,
    totalSpent: 12750.00,
    status: 'active',
    lastOrder: '2024-06-01',
  },
  {
    id: 'cust_2',
    name: 'Sarah Johnson',
    email: 'sarah@techsolutions.com',
    phone: '+1 (555) 987-6543',
    company: 'Tech Solutions Ltd',
    totalOrders: 18,
    totalSpent: 8900.50,
    status: 'active',
    lastOrder: '2024-06-05',
  },
  {
    id: 'cust_3',
    name: 'Michael Chen',
    email: 'm.chen@globalent.com',
    phone: '+1 (555) 456-7890',
    company: 'Global Enterprises',
    totalOrders: 42,
    totalSpent: 23450.75,
    status: 'active',
    lastOrder: '2024-06-08',
  },
  {
    id: 'cust_4',
    name: 'Emily Davis',
    email: 'emily@startup.com',
    phone: '+1 (555) 321-0987',
    company: 'StartUp Inc',
    totalOrders: 8,
    totalSpent: 3200.25,
    status: 'active',
    lastOrder: '2024-06-10',
  },
];

export const lowStockProducts = products.filter(
  product => product.stock <= product.lowStockThreshold
);

export const monthlyRevenue = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
];
