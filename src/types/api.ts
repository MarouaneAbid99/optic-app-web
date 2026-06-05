export type Role = 'ADMIN' | 'OPTICIEN' | 'EMPLOYE';
export type ProductType = 'MONTURE' | 'VERRE' | 'ACCESSOIRE';
export type OrderStatus = 'EN_COURS' | 'PRETE' | 'LIVREE' | 'ANNULEE';
export type PaymentMethod = 'ESPECE' | 'CARTE' | 'CHEQUE' | 'VIREMENT';
export type InsuranceProvider = 'AMO' | 'CNSS' | 'CNOPS' | 'MUTUELLE';
export type InsuranceStatus = 'EN_ATTENTE' | 'DEPOSE' | 'REMBOURSE' | 'REFUSE';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  prescriptions?: Prescription[];
  orders?: Order[];
  insuranceFiles?: InsuranceFile[];
}

export interface Prescription {
  id: number;
  clientId: number;
  date: string;
  doctor?: string;
  odSphere?: number;
  odCylinder?: number;
  odAxis?: number;
  odAddition?: number;
  ogSphere?: number;
  ogCylinder?: number;
  ogAxis?: number;
  ogAddition?: number;
  pd?: number;
  notes?: string;
  createdAt: string;
  client?: { firstName: string; lastName: string };
}

export interface Product {
  id: number;
  type: ProductType;
  name: string;
  brand?: string;
  description?: string;
  costPrice: number;
  sellPrice: number;
  stockQuantity: number;
  minStock: number;
  supplierId?: number;
  supplier?: { name: string };
  createdAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId?: number;
  label: string;
  quantity: number;
  unitPrice: number;
  product?: { name: string; type: string };
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
}

export interface Order {
  id: number;
  reference: string;
  clientId: number;
  status: OrderStatus;
  totalAmount: number;
  paidAmount: number;
  remaining?: number;
  notes?: string;
  deliveryAt?: string;
  createdAt: string;
  updatedAt: string;
  client?: { firstName: string; lastName: string; phone?: string };
  items?: OrderItem[];
  payments?: Payment[];
  _count?: { items: number; payments: number };
}

export interface InsuranceFile {
  id: number;
  clientId: number;
  orderId?: number;
  provider: InsuranceProvider;
  status: InsuranceStatus;
  reference?: string;
  claimedAmount?: number;
  reimbursedAmount?: number;
  submittedAt?: string;
  reimbursedAt?: string;
  notes?: string;
  createdAt: string;
  client?: { firstName: string; lastName: string };
  order?: { reference: string };
}

export interface DashboardStats {
  totalRevenue: number;
  ordersCount: number;
  openOrders: number;
  clientsCount: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
