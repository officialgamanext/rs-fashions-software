export type ViewType = 
  | 'home' 
  | 'orders' 
  | 'products' 
  | 'collections' 
  | 'inventory' 
  | 'gift_cards'
  | 'customers' 
  | 'shipping'
  | 'discounts' 
  | 'offline-billing'
  | 'offline-sales'
  | 'analytics';

export interface SavedBillItem {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  color?: string;
  size?: string;
  productImage?: string;
  price: number;
  quantity: number;
  total: number;
  gstPercentage?: number;
  gstAmount?: number;
}

export interface SavedBill {
  id: string;
  billNumber: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: SavedBillItem[];
  itemsCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  savedAt: string;
  updatedAt?: string;
}

export type ProductStatus = 'Active' | 'Draft' | 'Archived';

export interface VariationSizeItem {
  size: string;
  sku?: string;       // Unique SKU for this specific size (e.g. RSF-ABC12-RED-M)
  productId?: string; // Unique product ID for this size variant
  price?: number;
  inventory?: number;
  barcode?: string;
  barcodeUrl?: string;
}

export interface ProductVariation {
  id: string;
  sku?: string;       // Unique SKU for this color variant (e.g. RSF-ABC12-RED)
  productId?: string; // Unique product ID for this color variant
  color: string;
  colorHex?: string;
  sizes: VariationSizeItem[];
  barcode?: string;
  barcodeUrl?: string;
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

export interface Collection {
  id: string;
  name: string; // Collection Name
  description?: string;
  image?: string;
  productIds: string[]; // Assigned product IDs
  status?: 'Active' | 'Draft';
  createdAt: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  color?: string;
  size?: string;
  quantity: number;
  price: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  price: number;
}

export interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string; // Combined full name
  email?: string;
  phoneCode?: string; // e.g. "+91"
  phoneNumber?: string;
  country?: string; // e.g. "India"
  countryIso?: string; // e.g. "in"
  countryFlag?: string; // e.g. "🇮🇳"
  language?: string; // e.g. "English [Default]"
  marketingEmail?: boolean;
  marketingSMS?: boolean;
  marketingWhatsApp?: boolean;
  notes?: string;
  addresses?: Address[];
  cartItems?: CartItem[];
  wishlistItems?: WishlistItem[];
  ordersCount: number;
  totalSpent: number;
  status: 'Subscribed' | 'Unsubscribed';
  location: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  color?: string;
  size?: string;
  quantity: number;
  price: number;
  total: number;
  gstPercentage?: number;
  gstAmount?: number;
}

export interface OrderAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string; // Numeric-only ID e.g. "108429"
  date: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items?: OrderItem[];
  itemsCount: number;
  subtotal?: number;
  discount?: number;
  deliveryCharges?: number;
  taxes?: number;
  taxPercentage?: number;
  total: number; // Grand Total
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  fulfillmentStatus: 'Fulfilled' | 'Unfulfilled' | 'In Progress';
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  isBillingSameAsShipping?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ShippingRuleType = 'weight' | 'quantity' | 'flat';

export interface ShippingMethod {
  id: string;
  title: string;
  type: ShippingRuleType;
  minWeight?: number; // In kg
  maxWeight?: number; // In kg
  minQuantity?: number;
  maxQuantity?: number;
  amount: number; // Shipping rate in ₹
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
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
