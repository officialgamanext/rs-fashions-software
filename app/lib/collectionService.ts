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
import { Collection } from '../types';

const COLLECTIONS_PATH = 'collections';
const PRODUCTS_PATH = 'products';

export function subscribeToCollections(
  onData: (collections: Collection[]) => void,
  onError: (err: Error) => void
) {
  try {
    const q = query(collection(db, COLLECTIONS_PATH));
    return onSnapshot(
      q,
      (snapshot) => {
        const collections: Collection[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          collections.push({
            id: docSnap.id,
            name: data.name || '',
            description: data.description || '',
            image: data.image || '',
            productIds: Array.isArray(data.productIds) ? data.productIds : [],
            status: data.status || 'Active',
            createdAt: data.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
          });
        });
        collections.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        onData(collections);
      },
      (err) => {
        console.error('Firestore collections subscription error:', err);
        onError(err);
      }
    );
  } catch (error: any) {
    console.error('Error setting up collections listener:', error);
    onError(error);
    return () => {};
  }
}

export async function saveCollectionToFirestore(
  collectionData: Partial<Collection>,
  selectedProductIds: string[]
): Promise<string> {
  const collectionName = collectionData.name || 'Untitled Collection';

  if (collectionData.id) {
    const ref = doc(db, COLLECTIONS_PATH, collectionData.id);
    const updatePayload: any = {
      ...collectionData,
      name: collectionName,
      productIds: selectedProductIds,
      updatedAt: new Date().toISOString()
    };
    delete updatePayload.id;
    await updateDoc(ref, updatePayload);

    // Sync selected products to belong to this collection name
    if (selectedProductIds.length > 0) {
      const batch = writeBatch(db);
      selectedProductIds.forEach((pid) => {
        const pRef = doc(db, PRODUCTS_PATH, pid);
        batch.update(pRef, { collection: collectionName });
      });
      await batch.commit();
    }

    return collectionData.id;
  } else {
    const newDocRef = doc(collection(db, COLLECTIONS_PATH));
    const newCollection: Collection = {
      id: newDocRef.id,
      name: collectionName,
      description: collectionData.description || '',
      image: collectionData.image || '',
      productIds: selectedProductIds,
      status: collectionData.status || 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    await setDoc(newDocRef, newCollection);

    // Sync selected products to belong to this collection name
    if (selectedProductIds.length > 0) {
      const batch = writeBatch(db);
      selectedProductIds.forEach((pid) => {
        const pRef = doc(db, PRODUCTS_PATH, pid);
        batch.update(pRef, { collection: collectionName });
      });
      await batch.commit();
    }

    return newDocRef.id;
  }
}

export async function deleteCollectionFromFirestore(id: string): Promise<void> {
  const ref = doc(db, COLLECTIONS_PATH, id);
  await deleteDoc(ref);
}
