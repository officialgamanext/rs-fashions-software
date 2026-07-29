import { Product, Order, Customer, OverviewMetrics } from './types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [
  { id: '1001', orderNumber: '#1001', date: 'Jul 25, 2026 06:12 PM', customerName: 'Jessica Miller', total: 129.99, paymentStatus: 'Paid', fulfillmentStatus: 'Fulfilled', itemsCount: 2 },
  { id: '1002', orderNumber: '#1002', date: 'Jul 25, 2026 04:45 PM', customerName: 'Amanda Vance', total: 89.99, paymentStatus: 'Paid', fulfillmentStatus: 'In Progress', itemsCount: 1 },
  { id: '1003', orderNumber: '#1003', date: 'Jul 24, 2026 11:30 AM', customerName: 'Sophia Reynolds', total: 214.50, paymentStatus: 'Paid', fulfillmentStatus: 'Unfulfilled', itemsCount: 4 },
  { id: '1004', orderNumber: '#1004', date: 'Jul 24, 2026 09:15 AM', customerName: 'Emily Watson', total: 34.50, paymentStatus: 'Pending', fulfillmentStatus: 'Unfulfilled', itemsCount: 1 },
  { id: '1005', orderNumber: '#1005', date: 'Jul 23, 2026 08:20 PM', customerName: 'Rachel Green', total: 149.00, paymentStatus: 'Paid', fulfillmentStatus: 'Fulfilled', itemsCount: 2 },
  { id: '1006', orderNumber: '#1006', date: 'Jul 23, 2026 02:10 PM', customerName: 'Claire Bennet', total: 64.99, paymentStatus: 'Refunded', fulfillmentStatus: 'Fulfilled', itemsCount: 1 },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Jessica Miller', email: 'jessica.m@example.com', location: 'Austin, TX', ordersCount: 5, totalSpent: 642.50, status: 'Subscribed' },
  { id: 'c2', name: 'Amanda Vance', email: 'amanda.vance@example.com', location: 'Seattle, WA', ordersCount: 3, totalSpent: 310.00, status: 'Subscribed' },
  { id: 'c3', name: 'Sophia Reynolds', email: 'sophia.r@example.com', location: 'Chicago, IL', ordersCount: 8, totalSpent: 1250.75, status: 'Subscribed' },
  { id: 'c4', name: 'Emily Watson', email: 'emily.w@example.com', location: 'New York, NY', ordersCount: 1, totalSpent: 34.50, status: 'Unsubscribed' },
  { id: 'c5', name: 'Rachel Green', email: 'rachel.g@example.com', location: 'Los Angeles, CA', ordersCount: 4, totalSpent: 520.00, status: 'Subscribed' },
];

export const INITIAL_METRICS: OverviewMetrics = {
  sellThroughRate: '2.48%',
  inventoryDays: 'No data',
  abcAnalysis: {
    aGrade: '$0.00 A',
    bGrade: '$0.00 B',
    cGrade: '$0.00 C'
  }
};
