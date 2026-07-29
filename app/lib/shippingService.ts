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
import { ShippingMethod } from '../types';

const SHIPPING_COLLECTION = 'shipping_methods';

function cleanUndefined(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
}

export function subscribeToShippingMethods(
  onData: (methods: ShippingMethod[]) => void,
  onError: (err: Error) => void
) {
  try {
    const q = query(collection(db, SHIPPING_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const methods: ShippingMethod[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          methods.push({
            id: docSnap.id,
            title: data.title || 'Standard Shipping',
            type: data.type || 'flat',
            minWeight: data.minWeight !== undefined ? Number(data.minWeight) : undefined,
            maxWeight: data.maxWeight !== undefined ? Number(data.maxWeight) : undefined,
            minQuantity: data.minQuantity !== undefined ? Number(data.minQuantity) : undefined,
            maxQuantity: data.maxQuantity !== undefined ? Number(data.maxQuantity) : undefined,
            amount: Number(data.amount) || 0,
            status: data.status || 'Active',
            createdAt: data.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : new Date(data.createdAt.seconds * 1000).toISOString()) : new Date().toISOString()
          });
        });
        methods.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onData(methods);
      },
      (err) => {
        console.error('Firestore shipping subscription error:', err);
        onError(err);
      }
    );
  } catch (error: any) {
    console.error('Error setting up shipping listener:', error);
    onError(error);
    return () => {};
  }
}

export async function saveShippingMethodToFirestore(methodData: Partial<ShippingMethod>): Promise<string> {
  if (methodData.id) {
    const ref = doc(db, SHIPPING_COLLECTION, methodData.id);
    const updatePayload: any = cleanUndefined({
      ...methodData,
      updatedAt: new Date().toISOString()
    });
    delete updatePayload.id;
    await updateDoc(ref, updatePayload);
    return methodData.id;
  } else {
    const newDocRef = doc(collection(db, SHIPPING_COLLECTION));
    const rawMethod: any = {
      id: newDocRef.id,
      title: methodData.title || 'Standard Express Delivery',
      type: methodData.type || 'flat',
      amount: methodData.amount || 0,
      status: methodData.status || 'Active',
      createdAt: new Date().toISOString()
    };

    if (methodData.type === 'weight') {
      rawMethod.minWeight = methodData.minWeight ?? 0;
      rawMethod.maxWeight = methodData.maxWeight ?? 5;
    } else if (methodData.type === 'quantity') {
      rawMethod.minQuantity = methodData.minQuantity ?? 1;
      rawMethod.maxQuantity = methodData.maxQuantity ?? 10;
    }

    const cleanedMethod = cleanUndefined(rawMethod);
    await setDoc(newDocRef, cleanedMethod);
    return newDocRef.id;
  }
}

export async function deleteShippingMethodFromFirestore(ids: string[]): Promise<void> {
  const batch = writeBatch(db);
  ids.forEach((id) => {
    const ref = doc(db, SHIPPING_COLLECTION, id);
    batch.delete(ref);
  });
  await batch.commit();
}
