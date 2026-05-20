export type UserRole = 'Customer' | 'Staff' | 'Admin';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipping' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  categoryId: string;
  categoryName?: string;
  sku: string;
  isPublished: boolean;
  stock?: number;
  viewCount: number;
  clickCount: number;
  purchaseCount: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  image?: string;
  price: number;
  quantity: number;
  stockAvailable: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  discountAmount: number;
  couponCode?: string | null;
  shippingFee: number;
  total: number;
  note?: string;
  createdAt: string;
}

export type CouponDiscountType = 'Percent' | 'Fixed';

export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  value: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
}

export interface ValidateCouponResponse {
  valid: boolean;
  message?: string | null;
  discountAmount: number;
  code?: string | null;
}

export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userFullName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalCount: number;
  items: Review[];
}

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  stock?: number | null;
}

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  deliveredOrders: number;
  revenueByPeriod: { label: string; revenue: number; orderCount: number }[];
  topProducts: { productId: string; productName: string; quantitySold: number; revenue: number }[];
}

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  lowStockProducts: { productId: string; productName: string; quantityOnHand: number; lowStockThreshold: number }[];
  recentOrders: Order[];
}

export interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  quantityOnHand: number;
  lowStockThreshold: number;
  isLowStock: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface UserAdminSummary {
  total: number;
  customers: number;
  staff: number;
  admins: number;
  inactive: number;
}

export interface ProductAdminSummary {
  total: number;
  published: number;
  unpublished: number;
  lowStock: number;
  totalViews: number;
  totalClicks: number;
  totalPurchases: number;
}
