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
    setIsBulkUploadOpen,
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
