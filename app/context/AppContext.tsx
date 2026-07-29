'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, Customer, ProductStatus } from '../types';
import { INITIAL_ORDERS, INITIAL_CUSTOMERS } from '../mockData';
import { 
  subscribeToProducts, 
  saveProductToFirestore, 
  deleteProductsFromFirestore, 
  updateProductsStatusInFirestore 
} from '../lib/productService';

interface AppContextType {
  products: Product[];
  isLoadingProducts: boolean;
  orders: Order[];
  customers: Customer[];
  isModalOpen: boolean;
  editingProduct: Product | null;
  isSearchOpen: boolean;
  toastMessage: string | null;
  setIsModalOpen: (open: boolean) => void;
  setEditingProduct: (product: Product | null) => void;
  setIsSearchOpen: (open: boolean) => void;
  showToast: (msg: string) => void;
  handleSaveProduct: (productData: Partial<Product>) => Promise<void>;
  handleDeleteProducts: (ids: string[]) => Promise<void>;
  handleUpdateStatus: (ids: string[], status: ProductStatus) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
        showToast('Error loading products from Firebase');
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
      const savedId = await saveProductToFirestore(productData);
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

  return (
    <AppContext.Provider
      value={{
        products,
        isLoadingProducts,
        orders,
        customers,
        isModalOpen,
        editingProduct,
        isSearchOpen,
        toastMessage,
        setIsModalOpen,
        setEditingProduct,
        setIsSearchOpen,
        showToast,
        handleSaveProduct,
        handleDeleteProducts,
        handleUpdateStatus
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
