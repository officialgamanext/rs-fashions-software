import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  writeBatch,
  getDoc,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { SavedBill, Order } from '../types';
import { saveOrderToFirestore } from './orderService';

const SAVED_BILLS_COLLECTION = 'saved_bills';
const PRODUCTS_COLLECTION = 'products';

/**
 * Real-time subscription for saved draft bills from Firestore.
 */
export function subscribeToSavedBills(
  onData: (bills: SavedBill[]) => void,
  onError: (err: Error) => void
) {
  try {
    const q = query(collection(db, SAVED_BILLS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const bills: SavedBill[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          bills.push({
            id: docSnap.id,
            billNumber: data.billNumber || docSnap.id,
            date: data.date || new Date().toLocaleDateString(),
            customerName: data.customerName || 'Walk-in Customer',
            customerPhone: data.customerPhone || '',
            customerEmail: data.customerEmail || '',
            items: Array.isArray(data.items) ? data.items : [],
            itemsCount: Number(data.itemsCount) || 0,
            subtotal: Number(data.subtotal) || 0,
            discount: Number(data.discount) || 0,
            tax: Number(data.tax) || 0,
            total: Number(data.total) || 0,
            notes: data.notes || '',
            savedAt: data.savedAt || new Date().toISOString(),
            updatedAt: data.updatedAt
          });
        });
        bills.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
        onData(bills);
      },
      (err) => {
        console.error('Firestore saved bills subscription error:', err);
        onError(err);
      }
    );
  } catch (error: any) {
    console.error('Error setting up saved bills listener:', error);
    onError(error);
    return () => {};
  }
}

function removeUndefinedFields(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Save or update a draft bill in Firestore.
 */
export async function saveDraftBillToFirestore(billData: Partial<SavedBill>): Promise<string> {
  const billNumber = billData.billNumber || `BILL-${Math.floor(100000 + Math.random() * 900000)}`;

  if (billData.id) {
    const ref = doc(db, SAVED_BILLS_COLLECTION, billData.id);
    const updatePayload: any = removeUndefinedFields({
      ...billData,
      billNumber,
      updatedAt: new Date().toISOString()
    });
    delete updatePayload.id;
    await updateDoc(ref, updatePayload);
    return billData.id;
  } else {
    const newDocRef = doc(collection(db, SAVED_BILLS_COLLECTION));
    const newBill: SavedBill = {
      id: newDocRef.id,
      billNumber,
      date: billData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      customerName: billData.customerName || 'Walk-in Customer',
      customerPhone: billData.customerPhone || '',
      customerEmail: billData.customerEmail || '',
      items: billData.items || [],
      itemsCount: billData.itemsCount || 0,
      subtotal: billData.subtotal || 0,
      discount: billData.discount || 0,
      tax: billData.tax || 0,
      total: billData.total || 0,
      notes: billData.notes || '',
      savedAt: new Date().toISOString()
    };
    const cleanPayload = removeUndefinedFields(newBill);
    await setDoc(newDocRef, cleanPayload);
    return newDocRef.id;
  }
}

/**
 * Delete a draft bill from Firestore.
 */
export async function deleteDraftBillFromFirestore(id: string): Promise<void> {
  const ref = doc(db, SAVED_BILLS_COLLECTION, id);
  await deleteDoc(ref);
}

/**
 * Settle an offline bill:
 * 1. Save as completed Order in Firestore
 * 2. Deduct inventory stock for each item in the bill
 * 3. Delete from saved bills if it was previously saved
 */
export async function settleOfflineBill(
  orderPayload: Partial<Order>,
  savedBillIdToClear?: string
): Promise<string> {
  // 1. Save order to Firestore
  const orderId = await saveOrderToFirestore(orderPayload);

  // 2. Decrement inventory for items in Firestore
  if (orderPayload.items && orderPayload.items.length > 0) {
    const batch = writeBatch(db);
    for (const item of orderPayload.items) {
      if (item.productId) {
        const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
        const qtyToDeduct = item.quantity || 1;
        batch.update(productRef, {
          inventory: increment(-qtyToDeduct)
        });
      }
    }
    await batch.commit().catch(err => {
      console.warn('Inventory batch update note:', err);
    });
  }

  // 3. Delete draft bill if it was saved
  if (savedBillIdToClear) {
    try {
      await deleteDraftBillFromFirestore(savedBillIdToClear);
    } catch (e) {
      console.warn('Error clearing saved bill draft after settlement:', e);
    }
  }

  return orderId;
}
