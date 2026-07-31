'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { ProductsView } from '../components/ProductsView';

export default function ProductsPage() {
  const router = useRouter();
  const {
    products,
    isLoadingProducts,
    setEditingProduct,
    setIsModalOpen,
    handleDeleteProducts,
    handleUpdateStatus
  } = useApp();

  return (
    <ProductsView
      products={products}
      isLoadingProducts={isLoadingProducts}
      onAddProductClick={() => {
        router.push('/products/add');
      }}
      onEditProduct={(product) => {
        // Edit still uses the modal (full data loaded from Firebase)
        setEditingProduct(product);
        setIsModalOpen(true);
      }}
      onDeleteProducts={handleDeleteProducts}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}
