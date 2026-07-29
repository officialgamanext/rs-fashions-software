import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Order } from '../types';

const ORDERS_COLLECTION = 'orders';

export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  onError: (err: Error) => void
) {
  try {
    const q = query(collection(db, ORDERS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const itemsList = Array.isArray(data.items) ? data.items : [];
          const calculatedCount = itemsList.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);

          orders.push({
            id: docSnap.id,
            orderNumber: String(data.orderNumber || docSnap.id).replace(/\D/g, '') || `${1000 + Math.floor(Math.random() * 9000)}`,
            date: data.date || (data.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : new Date(data.createdAt.seconds * 1000).toLocaleDateString()) : new Date().toLocaleDateString()),
            customerId: data.customerId || '',
            customerName: data.customerName || 'Walk-in Customer',
            customerEmail: data.customerEmail || '',
            customerPhone: data.customerPhone || '',
            items: itemsList,
            itemsCount: data.itemsCount ?? calculatedCount,
            subtotal: Number(data.subtotal) || Number(data.total) || 0,
            discount: Number(data.discount) || 0,
            deliveryCharges: Number(data.deliveryCharges) || 0,
            taxes: Number(data.taxes) || 0,
            taxPercentage: Number(data.taxPercentage) || 0,
            total: Number(data.total) || 0,
            paymentStatus: data.paymentStatus || 'Paid',
            fulfillmentStatus: data.fulfillmentStatus || 'Fulfilled',
            shippingAddress: data.shippingAddress || undefined,
            billingAddress: data.billingAddress || undefined,
            isBillingSameAsShipping: data.isBillingSameAsShipping ?? true,
            notes: data.notes || '',
            createdAt: data.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : new Date(data.createdAt.seconds * 1000).toISOString()) : new Date().toISOString()
          });
        });
        orders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onData(orders);
      },
      (err) => {
        console.error('Firestore orders subscription error:', err);
        onError(err);
      }
    );
  } catch (error: any) {
    console.error('Error setting up orders listener:', error);
    onError(error);
    return () => {};
  }
}

export async function saveOrderToFirestore(orderData: Partial<Order>): Promise<string> {
  const cleanNumericOrderId = String(orderData.orderNumber || '').replace(/\D/g, '') || `${100000 + Math.floor(Math.random() * 900000)}`;

  if (orderData.id) {
    const ref = doc(db, ORDERS_COLLECTION, orderData.id);
    const updatePayload: any = {
      ...orderData,
      orderNumber: cleanNumericOrderId,
      updatedAt: new Date().toISOString()
    };
    delete updatePayload.id;
    await updateDoc(ref, updatePayload);
    return orderData.id;
  } else {
    const newDocRef = doc(collection(db, ORDERS_COLLECTION));
    const newOrder: Order = {
      id: newDocRef.id,
      orderNumber: cleanNumericOrderId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      customerId: orderData.customerId || '',
      customerName: orderData.customerName || 'Walk-in Customer',
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone || '',
      items: orderData.items || [],
      itemsCount: orderData.itemsCount || 0,
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      deliveryCharges: orderData.deliveryCharges || 0,
      taxes: orderData.taxes || 0,
      taxPercentage: orderData.taxPercentage || 0,
      total: orderData.total || 0,
      paymentStatus: orderData.paymentStatus || 'Paid',
      fulfillmentStatus: orderData.fulfillmentStatus || 'Fulfilled',
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      isBillingSameAsShipping: orderData.isBillingSameAsShipping ?? true,
      notes: orderData.notes || '',
      createdAt: new Date().toISOString()
    };
    await setDoc(newDocRef, newOrder);
    return newDocRef.id;
  }
}

export async function deleteOrdersFromFirestore(ids: string[]): Promise<void> {
  const batch = writeBatch(db);
  ids.forEach((id) => {
    const ref = doc(db, ORDERS_COLLECTION, id);
    batch.delete(ref);
  });
  await batch.commit();
}
