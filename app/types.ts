export type ViewType = 
  | 'home' 
  | 'orders' 
  | 'products' 
  | 'collections' 
  | 'inventory' 
  | 'purchase_orders'
  | 'transfers'
  | 'gift_cards'
  | 'customers' 
  | 'growth'
  | 'discounts' 
  | 'content'
  | 'markets'
  | 'finance'
  | 'analytics' 
  | 'online_store'
  | 'agentic'
  | 'export_images'
  | 'settings';

export type ProductStatus = 'Active' | 'Draft' | 'Archived';

export interface VariationSizeItem {
  size: string;
  price?: number;
  inventory?: number;
}

export interface ProductVariation {
  id: string;
  color: string;
  colorHex?: string;
  sizes: VariationSizeItem[];
}

export interface Product {
  id: string;
  title: string; // Product Name
  shortDescription?: string;
  longDescription?: string;
  collection?: string;
  media?: string[];
  price: number; // Product Price (₹)
  compareAtPrice?: number;
  sku: string; // SKU ID (Auto generated & unique)
  inventory: number; // Inventory count
  variations?: ProductVariation[];
  isActive?: boolean; // Active Yes / No
  showInOnline?: boolean; // Show in Online
  showInOffline?: boolean; // Show in Offline
  gstPercentage?: number; // GST percentage
  discountRupees?: number; // Available discount in rupees
  vendor: string; // Vendor dropdown
  status: ProductStatus;
  category?: string;
  productType?: string;
  channels?: number;
  catalogs?: number;
  imageBgColor?: string;
  iconName?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  total: number;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  fulfillmentStatus: 'Fulfilled' | 'Unfulfilled' | 'In Progress';
  itemsCount: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  location: string;
  ordersCount: number;
  totalSpent: number;
  status: 'Subscribed' | 'Unsubscribed';
}

export interface OverviewMetrics {
  sellThroughRate: string;
  inventoryDays: string;
  abcAnalysis: {
    aGrade: string;
    bGrade: string;
    cGrade: string;
  };
}
