export interface CustomerResponse {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  avatar?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopCustomer {
  id: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  avatar?: string;
}

export interface CustomerActivity {
  customerId: string;
  customerName: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface MonthlyStats {
  newCustomers: number[];
  customerGrowth: number;
}

export interface CustomerDashboard {
  totalCustomers: number;
  newThisMonth: number;
  activeCustomers: number;
  topCustomers: TopCustomer[];
  recentActivity: CustomerActivity[];
  monthlyStats: MonthlyStats;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: number;
  orderDate: string;
  deliveryDate?: string;
  estimatedDelivery?: string;
}

export interface CustomerDesign {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  lastModified: string;
  isTemplate: boolean;
}

export interface CustomerQuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
  metadata?: object;
}

export interface OrderTrackingEvent {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CustomerOrderTracking {
  orderId: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  timeline: OrderTrackingEvent[];
  shippingAddress?: ShippingAddress;
}

export interface CustomerFilters {
  search?: string;
}
