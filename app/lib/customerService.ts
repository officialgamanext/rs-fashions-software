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
import { Customer } from '../types';

const CUSTOMERS_COLLECTION = 'customers';

export function subscribeToCustomers(
  onData: (customers: Customer[]) => void,
  onError: (err: Error) => void
) {
  try {
    const q = query(collection(db, CUSTOMERS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const customers: Customer[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const firstName = data.firstName || '';
          const lastName = data.lastName || '';
          const fullName = data.name || `${firstName} ${lastName}`.trim() || 'Untitled Customer';
          
          let locationStr = data.location || '';
          if (!locationStr && Array.isArray(data.addresses) && data.addresses.length > 0) {
            const defAddr = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
            locationStr = [defAddr.city, defAddr.state, defAddr.country].filter(Boolean).join(', ');
          }

          customers.push({
            id: docSnap.id,
            firstName,
            lastName,
            name: fullName,
            email: data.email || '',
            phoneCode: data.phoneCode || '+91',
            phoneNumber: data.phoneNumber || '',
            country: data.country || 'India',
            countryIso: data.countryIso || 'in',
            countryFlag: data.countryFlag || '🇮🇳',
            language: data.language || 'English [Default]',
            marketingEmail: !!data.marketingEmail,
            marketingSMS: !!data.marketingSMS,
            marketingWhatsApp: !!data.marketingWhatsApp,
            notes: data.notes || '',
            addresses: Array.isArray(data.addresses) ? data.addresses : [],
            cartItems: Array.isArray(data.cartItems) ? data.cartItems : [],
            wishlistItems: Array.isArray(data.wishlistItems) ? data.wishlistItems : [],
            ordersCount: Number(data.ordersCount) || 0,
            totalSpent: Number(data.totalSpent) || 0,
            status: (data.marketingEmail || data.marketingSMS || data.marketingWhatsApp) ? 'Subscribed' : 'Unsubscribed',
            location: locationStr || 'India',
            createdAt: data.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
          });
        });
        customers.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onData(customers);
      },
      (err) => {
        console.error('Firestore customers subscription error:', err);
        onError(err);
      }
    );
  } catch (error: any) {
    console.error('Error setting up customers listener:', error);
    onError(error);
    return () => {};
  }
}

export async function saveCustomerToFirestore(customerData: Partial<Customer>): Promise<string> {
  const firstName = customerData.firstName || '';
  const lastName = customerData.lastName || '';
  const fullName = customerData.name || `${firstName} ${lastName}`.trim() || 'Untitled Customer';
  const isSubscribed = !!(customerData.marketingEmail || customerData.marketingSMS || customerData.marketingWhatsApp);

  let locationStr = customerData.location || '';
  if (!locationStr && customerData.addresses && customerData.addresses.length > 0) {
    const defAddr = customerData.addresses.find(a => a.isDefault) || customerData.addresses[0];
    locationStr = [defAddr.city, defAddr.state, defAddr.country].filter(Boolean).join(', ');
  }

  if (customerData.id) {
    const ref = doc(db, CUSTOMERS_COLLECTION, customerData.id);
    const updatePayload: any = {
      ...customerData,
      name: fullName,
      status: isSubscribed ? 'Subscribed' : 'Unsubscribed',
      location: locationStr || 'India',
      updatedAt: new Date().toISOString()
    };
    delete updatePayload.id;
    await updateDoc(ref, updatePayload);
    return customerData.id;
  } else {
    const newDocRef = doc(collection(db, CUSTOMERS_COLLECTION));
    const newCustomer: Customer = {
      id: newDocRef.id,
      firstName,
      lastName,
      name: fullName,
      email: customerData.email || '',
      phoneCode: customerData.phoneCode || '+91',
      phoneNumber: customerData.phoneNumber || '',
      country: customerData.country || 'India',
      countryFlag: customerData.countryFlag || '🇮🇳',
      language: customerData.language || 'English [Default]',
      marketingEmail: !!customerData.marketingEmail,
      marketingSMS: !!customerData.marketingSMS,
      marketingWhatsApp: !!customerData.marketingWhatsApp,
      notes: customerData.notes || '',
      addresses: customerData.addresses || [],
      cartItems: customerData.cartItems || [],
      wishlistItems: customerData.wishlistItems || [],
      ordersCount: customerData.ordersCount || 0,
      totalSpent: customerData.totalSpent || 0,
      status: isSubscribed ? 'Subscribed' : 'Unsubscribed',
      location: locationStr || 'India',
      createdAt: new Date().toISOString().split('T')[0]
    };
    await setDoc(newDocRef, newCustomer);
    return newDocRef.id;
  }
}

export async function deleteCustomersFromFirestore(ids: string[]): Promise<void> {
  const batch = writeBatch(db);
  ids.forEach((id) => {
    const ref = doc(db, CUSTOMERS_COLLECTION, id);
    batch.delete(ref);
  });
  await batch.commit();
}
