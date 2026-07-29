'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Collection, Customer, Order, ProductStatus } from '../types';
import { INITIAL_CUSTOMERS } from '../mockData';
import { 
  subscribeToProducts, 
  saveProductToFirestore, 
  deleteProductsFromFirestore, 
  updateProductsStatusInFirestore 
} from '../lib/productService';
import { 
  subscribeToCollections, 
  saveCollectionToFirestore, 
  deleteCollectionFromFirestore 
} from '../lib/collectionService';
import {
  subscribeToCustomers,
  saveCustomerToFirestore,
  deleteCustomersFromFirestore
} from '../lib/customerService';
import {
  subscribeToOrders,
  saveOrderToFirestore,
  deleteOrdersFromFirestore
} from '../lib/orderService';

interface AppContextType {
  products: Product[];
  isLoadingProducts: boolean;
  collections: Collection[];
  isLoadingCollections: boolean;
  customers: Customer[];
  isLoadingCustomers: boolean;
  orders: Order[];
  isLoadingOrders: boolean;
  isModalOpen: boolean;
  editingProduct: Product | null;
  isCollectionModalOpen: boolean;
  editingCollection: Collection | null;
  isCustomerModalOpen: boolean;
  editingCustomer: Customer | null;
  isOrderModalOpen: boolean;
  editingOrder: Order | null;
  isSearchOpen: boolean;
  toastMessage: string | null;
  setIsModalOpen: (open: boolean) => void;
  setEditingProduct: (product: Product | null) => void;
  setIsCollectionModalOpen: (open: boolean) => void;
  setEditingCollection: (collection: Collection | null) => void;
  setIsCustomerModalOpen: (open: boolean) => void;
  setEditingCustomer: (customer: Customer | null) => void;
  setIsOrderModalOpen: (open: boolean) => void;
  setEditingOrder: (order: Order | null) => void;
  setIsSearchOpen: (open: boolean) => void;
  showToast: (msg: string) => void;
  handleSaveProduct: (productData: Partial<Product>) => Promise<void>;
  handleDeleteProducts: (ids: string[]) => Promise<void>;
  handleUpdateStatus: (ids: string[], status: ProductStatus) => Promise<void>;
  handleSaveCollection: (collectionData: Partial<Collection>, selectedProductIds: string[]) => Promise<void>;
  handleDeleteCollection: (id: string) => Promise<void>;
  handleSaveCustomer: (customerData: Partial<Customer>) => Promise<void>;
  handleDeleteCustomers: (ids: string[]) => Promise<void>;
  handleSaveOrder: (orderData: Partial<Order>) => Promise<void>;
  handleDeleteOrders: (ids: string[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState<boolean>(true);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState<boolean>(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to real-time products from Firebase Firestore
  useEffect(() => {
    setIsLoadingProducts(true);
    const unsubscribe = subscribeToProducts(
      (fetchedProducts) => {
        setProducts(fetchedProducts);
        setIsLoadingProducts(false);
      },
      (err) => {
        console.error('Error fetching products from Firebase:', err);
        setIsLoadingProducts(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time collections from Firebase Firestore
  useEffect(() => {
    setIsLoadingCollections(true);
    const unsubscribe = subscribeToCollections(
      (fetchedCollections) => {
        setCollections(fetchedCollections);
        setIsLoadingCollections(false);
      },
      (err) => {
        console.error('Error fetching collections from Firebase:', err);
        setIsLoadingCollections(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time customers from Firebase Firestore
  useEffect(() => {
    setIsLoadingCustomers(true);
    const unsubscribe = subscribeToCustomers(
      (fetchedCustomers) => {
        setCustomers(fetchedCustomers);
        setIsLoadingCustomers(false);
      },
      (err) => {
        console.error('Error fetching customers from Firebase:', err);
        setIsLoadingCustomers(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time orders from Firebase Firestore
  useEffect(() => {
    setIsLoadingOrders(true);
    const unsubscribe = subscribeToOrders(
      (fetchedOrders) => {
        setOrders(fetchedOrders);
        setIsLoadingOrders(false);
      },
      (err) => {
        console.error('Error fetching orders from Firebase:', err);
        setIsLoadingOrders(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Global Ctrl+K listener for Quick Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      await saveProductToFirestore(productData);
      showToast(
        productData.id 
          ? `Updated "${productData.title || 'Product'}" successfully.` 
          : `Saved "${productData.title || 'Product'}" to Firebase.`
      );
      setEditingProduct(null);
    } catch (err: any) {
      console.error('Failed to save product to Firebase:', err);
      showToast(`Failed to save: ${err.message || 'Firebase error'}`);
    }
  };

  const handleDeleteProducts = async (ids: string[]) => {
    try {
      await deleteProductsFromFirestore(ids);
      showToast(`Deleted ${ids.length} product(s) from Firebase.`);
    } catch (err: any) {
      console.error('Failed to delete products from Firebase:', err);
      showToast(`Failed to delete: ${err.message || 'Firebase error'}`);
    }
  };

  const handleUpdateStatus = async (ids: string[], status: ProductStatus) => {
    try {
      await updateProductsStatusInFirestore(ids, status);
      showToast(`Updated status of ${ids.length} product(s) to "${status}".`);
    } catch (err: any) {
      console.error('Failed to update product status in Firebase:', err);
      showToast(`Failed to update status: ${err.message || 'Firebase error'}`);
    }
  };

  const handleSaveCollection = async (collectionData: Partial<Collection>, selectedProductIds: string[]) => {
    try {
      await saveCollectionToFirestore(collectionData, selectedProductIds);
      showToast(
        collectionData.id 
          ? `Updated collection "${collectionData.name || 'Collection'}" successfully.` 
          : `Created collection "${collectionData.name || 'Collection'}".`
      );
      setEditingCollection(null);
    } catch (err: any) {
      console.error('Failed to save collection:', err);
      showToast(`Failed to save collection: ${err.message || 'Firebase error'}`);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      await deleteCollectionFromFirestore(id);
      showToast(`Deleted collection successfully.`);
    } catch (err: any) {
      console.error('Failed to delete collection:', err);
      showToast(`Failed to delete: ${err.message || 'Firebase error'}`);
    }
  };

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    try {
      await saveCustomerToFirestore(customerData);
      showToast(
        customerData.id 
          ? `Updated customer "${customerData.name || customerData.firstName || 'Customer'}" successfully.` 
          : `Added new customer "${customerData.firstName || 'Customer'}".`
      );
      setEditingCustomer(null);
    } catch (err: any) {
      console.error('Failed to save customer:', err);
      showToast(`Failed to save customer: ${err.message || 'Firebase error'}`);
    }
  };

  const handleDeleteCustomers = async (ids: string[]) => {
    try {
      await deleteCustomersFromFirestore(ids);
      showToast(`Deleted ${ids.length} customer(s) from Firebase.`);
    } catch (err: any) {
      console.error('Failed to delete customers:', err);
      showToast(`Failed to delete customers: ${err.message || 'Firebase error'}`);
    }
  };

  const handleSaveOrder = async (orderData: Partial<Order>) => {
    try {
      const savedId = await saveOrderToFirestore(orderData);
      showToast(
        orderData.id 
          ? `Updated order #${orderData.orderNumber || ''} successfully.` 
          : `Saved order #${orderData.orderNumber || ''} to Firebase.`
      );
      setEditingOrder(null);
    } catch (err: any) {
      console.error('Failed to save order to Firebase:', err);
      showToast(`Failed to save order: ${err.message || 'Firebase error'}`);
    }
  };

  const handleDeleteOrders = async (ids: string[]) => {
    try {
      await deleteOrdersFromFirestore(ids);
      showToast(`Deleted ${ids.length} order(s) from Firebase.`);
    } catch (err: any) {
      console.error('Failed to delete orders from Firebase:', err);
      showToast(`Failed to delete orders: ${err.message || 'Firebase error'}`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        isLoadingProducts,
        collections,
        isLoadingCollections,
        customers,
        isLoadingCustomers,
        orders,
        isLoadingOrders,
        isModalOpen,
        editingProduct,
        isCollectionModalOpen,
        editingCollection,
        isCustomerModalOpen,
        editingCustomer,
        isOrderModalOpen,
        editingOrder,
        isSearchOpen,
        toastMessage,
        setIsModalOpen,
        setEditingProduct,
        setIsCollectionModalOpen,
        setEditingCollection,
        setIsCustomerModalOpen,
        setEditingCustomer,
        setIsOrderModalOpen,
        setEditingOrder,
        setIsSearchOpen,
        showToast,
        handleSaveProduct,
        handleDeleteProducts,
        handleUpdateStatus,
        handleSaveCollection,
        handleDeleteCollection,
        handleSaveCustomer,
        handleDeleteCustomers,
        handleSaveOrder,
        handleDeleteOrders
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
