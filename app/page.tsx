'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './context/AppContext';
import { ProductsView } from './components/ProductsView';

export default function HomePage() {
  const router = useRouter();
  const {
    products,
    setIsModalOpen,
    setEditingProduct,
    setIsBulkUploadOpen,
    handleDeleteProducts,
    handleUpdateStatus
  } = useApp();

  return (
    <ProductsView
      products={products}
      onAddProductClick={() => router.push('/products/add')}
      onBulkUploadClick={() => setIsBulkUploadOpen(true)}
      onEditProduct={(product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
      }}
      onDeleteProducts={handleDeleteProducts}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}
