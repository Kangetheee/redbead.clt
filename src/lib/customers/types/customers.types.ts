/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Customer base interface matching API response
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Customers list API response structure
 * From GET /v1/customers
 */
export interface CustomersListResponse {
  data: Customer[];
  meta: {
    page: number;
    limit: number;
    total: number;
    lastPage: number;
  };
  links: {
    first: string;
    next?: string;
    prev?: string;
    last?: string;
  };
}

/**
 * Top customer information for dashboard
 */
export interface TopCustomer {
  id: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  avatar?: string;
}

/**
 * Customer activity information for dashboard
 */
export interface CustomerActivity {
  customerId: string;
  customerName: string;
  action: string;
  timestamp: string;
  details: string;
}

/**
 * Monthly statistics for customer dashboard
 */
export interface CustomerMonthlyStats {
  newCustomers: number[]; // Array of 12 months
  customerGrowth: number; // Percentage growth
}

/**
 * Customer dashboard data structure
 * From GET /v1/customers/dashboard
 */
export interface CustomerDashboard {
  totalCustomers: number;
  newThisMonth: number;
  activeCustomers: number;
  topCustomers: TopCustomer[];
  recentActivity: CustomerActivity[];
  monthlyStats: CustomerMonthlyStats;
}

/**
 * Customer order information
 * Used in various customer order endpoints
 */
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

/**
 * Customer saved design information
 * From GET /v1/customers/{id}/saved-designs
 */
export interface CustomerDesign {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  lastModified: string;
  isTemplate: boolean;
}

/**
 * Customer quick action information
 * From GET /v1/customers/{id}/quick-actions
 */
export interface CustomerQuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
  metadata?: {
    lastOrderId?: string;
    lastOrderDate?: string;
    [key: string]: any;
  };
}

/**
 * Order tracking timeline event
 */
export interface OrderTrackingEvent {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
}

/**
 * Shipping address information
 */
export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Enhanced order tracking information
 * From GET /v1/customers/{id}/orders/{orderId}/tracking
 */
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

/**
 * Customer filter options
 */
export interface CustomerFilters {
  search?: string;
  page?: number;
  limit?: number;
}

// Type guards for runtime type checking
export const isCustomer = (obj: any): obj is Customer => {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.email === "string"
  );
};

export const isCustomerDashboard = (obj: any): obj is CustomerDashboard => {
  return (
    obj &&
    typeof obj.totalCustomers === "number" &&
    typeof obj.newThisMonth === "number" &&
    Array.isArray(obj.topCustomers)
  );
};

export const isCustomerOrder = (obj: any): obj is CustomerOrder => {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.orderNumber === "string" &&
    typeof obj.status === "string"
  );
};

export const isCustomerOrderTracking = (
  obj: any
): obj is CustomerOrderTracking => {
  return (
    obj &&
    typeof obj.orderId === "string" &&
    typeof obj.orderNumber === "string" &&
    Array.isArray(obj.timeline)
  );
};

// Utility types
export type CustomerStatus = "active" | "inactive" | "blocked";
export type CustomerOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type CustomerSortField =
  | "name"
  | "email"
  | "company"
  | "createdAt"
  | "updatedAt";
