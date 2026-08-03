import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, ProductStatus } from '../types';

const PRODUCTS_COLLECTION = 'products';

export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError: (err: Error) => void
) {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const products: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          products.push({
            id: docSnap.id,
            title: data.title || '',
            shortDescription: data.shortDescription || '',
            longDescription: data.longDescription || '',
            collection: data.collection || 'General',
            media: data.media || [],
            price: Number(data.price) || 0,
            compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
            sku: data.sku || '',
            inventory: Number(data.inventory) || 0,
            variations: data.variations || [],
            isActive: typeof data.isActive === 'boolean' ? data.isActive : data.status === 'Active',
            showInOnline: typeof data.showInOnline === 'boolean' ? data.showInOnline : true,
            showInOffline: typeof data.showInOffline === 'boolean' ? data.showInOffline : true,
            gstPercentage: Number(data.gstPercentage) || 0,
            discountRupees: Number(data.discountRupees) || 0,
            vendor: data.vendor || 'RS Fashions',
            status: data.status || 'Active',
            category: data.category || data.collection || 'Apparel',
            productType: data.productType || 'Fashion Wear',
            channels: data.channels ?? 2,
            catalogs: data.catalogs ?? 1,
            imageBgColor: data.imageBgColor || 'bg-amber-500',
            iconName: data.iconName || 'package',
            tags: data.tags || [],
            createdAt: data.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
          });
        });
        // Sort manually by createdAt or title if needed
        products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        onData(products);
      },
      (err) => {
        console.error('Firestore products subscription error:', err);
        onError(err);
      }
    );
  } catch (error: any) {
    console.error('Error setting up products listener:', error);
    onError(error);
    return () => {};
  }
}

export async function saveProductToFirestore(productData: Partial<Product>): Promise<string> {
  if (productData.id) {
    // Both updates to existing products AND new products with a pre-generated ID use this path
    const ref = doc(db, PRODUCTS_COLLECTION, productData.id);
    const existingDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(ref));

    if (existingDoc.exists()) {
      // Update existing product
      const updatePayload: any = {
        ...productData,
        updatedAt: new Date().toISOString()
      };
      delete updatePayload.id;
      await updateDoc(ref, updatePayload);
    } else {
      // New product with pre-generated ID — create it
      const newProduct: Product = {
        id: productData.id,
        title: productData.title || 'Untitled Product',
        shortDescription: productData.shortDescription || '',
        longDescription: productData.longDescription || '',
        collection: productData.collection || 'Sarees',
        media: productData.media || [],
        price: productData.price || 0,
        compareAtPrice: productData.compareAtPrice,
        sku: productData.sku || `RSF-${Math.floor(100000 + Math.random() * 900000)}`,
        inventory: productData.inventory ?? 0,
        variations: productData.variations || [],
        isActive: productData.isActive ?? true,
        showInOnline: productData.showInOnline ?? true,
        showInOffline: productData.showInOffline ?? true,
        gstPercentage: productData.gstPercentage ?? 5,
        discountRupees: productData.discountRupees ?? 0,
        vendor: productData.vendor || 'RS Fashions In-House',
        status: productData.status || (productData.isActive ? 'Active' : 'Draft'),
        category: productData.collection || 'Ethnic Wear',
        productType: productData.productType || 'Fashion Wear',
        channels: productData.channels ?? (productData.showInOnline ? 2 : 1),
        catalogs: productData.catalogs ?? 1,
        createdAt: new Date().toISOString().split('T')[0]
      };
      await setDoc(ref, newProduct);
    }
    return productData.id;
  } else {
    // Fallback: auto-generate Firestore doc ID (should rarely happen with new flow)
    const newDocRef = doc(collection(db, PRODUCTS_COLLECTION));
    const newProduct: Product = {
      id: newDocRef.id,
      title: productData.title || 'Untitled Product',
      shortDescription: productData.shortDescription || '',
      longDescription: productData.longDescription || '',
      collection: productData.collection || 'Sarees',
      media: productData.media || [],
      price: productData.price || 0,
      compareAtPrice: productData.compareAtPrice,
      sku: productData.sku || `RSF-${Math.floor(100000 + Math.random() * 900000)}`,
      inventory: productData.inventory ?? 0,
      variations: productData.variations || [],
      isActive: productData.isActive ?? true,
      showInOnline: productData.showInOnline ?? true,
      showInOffline: productData.showInOffline ?? true,
      gstPercentage: productData.gstPercentage ?? 5,
      discountRupees: productData.discountRupees ?? 0,
      vendor: productData.vendor || 'RS Fashions In-House',
      status: productData.status || (productData.isActive ? 'Active' : 'Draft'),
      category: productData.collection || 'Ethnic Wear',
      productType: productData.productType || 'Fashion Wear',
      channels: productData.channels ?? (productData.showInOnline ? 2 : 1),
      catalogs: productData.catalogs ?? 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    await setDoc(newDocRef, newProduct);
    return newDocRef.id;
  }
}


export async function deleteProductsFromFirestore(ids: string[]): Promise<void> {
  const batch = writeBatch(db);
  ids.forEach((id) => {
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    batch.delete(ref);
  });
  await batch.commit();
}

export async function updateProductsStatusInFirestore(ids: string[], status: ProductStatus): Promise<void> {
  const batch = writeBatch(db);
  const isActive = status === 'Active';
  ids.forEach((id) => {
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    batch.update(ref, { status, isActive });
  });
  await batch.commit();
}

export async function getProductsFromFirestore(): Promise<Product[]> {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION));
    const snapshot = await getDocs(q);
    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      products.push({
        id: docSnap.id,
        title: data.title || '',
        shortDescription: data.shortDescription || '',
        longDescription: data.longDescription || '',
        collection: data.collection || 'General',
        media: data.media || [],
        price: Number(data.price) || 0,
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
        sku: data.sku || '',
        inventory: Number(data.inventory) || 0,
        variations: data.variations || [],
        isActive: typeof data.isActive === 'boolean' ? data.isActive : data.status === 'Active',
        showInOnline: typeof data.showInOnline === 'boolean' ? data.showInOnline : true,
        showInOffline: typeof data.showInOffline === 'boolean' ? data.showInOffline : true,
        gstPercentage: Number(data.gstPercentage) || 0,
        discountRupees: Number(data.discountRupees) || 0,
        vendor: data.vendor || 'RS Fashions',
        status: data.status || 'Active',
        category: data.category || data.collection || 'Apparel',
        productType: data.productType || 'Fashion Wear',
        channels: data.channels ?? 2,
        catalogs: data.catalogs ?? 1,
        imageBgColor: data.imageBgColor || 'bg-amber-500',
        iconName: data.iconName || 'package',
        tags: data.tags || [],
        createdAt: data.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
      });
    });
    return products;
  } catch (err) {
    console.error('Error fetching products from Firestore:', err);
    return [];
  }
}

