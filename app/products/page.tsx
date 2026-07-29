'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductsView } from '../components/ProductsView';

export default function ProductsPage() {
  const {
    products,
    isLoadingProducts,
    setIsModalOpen,
    setEditingProduct,
    handleDeleteProducts,
    handleUpdateStatus
  } = useApp();

  return (
    <ProductsView
      products={products}
      isLoadingProducts={isLoadingProducts}
      onAddProductClick={() => {
        setEditingProduct(null);
        setIsModalOpen(true);
      }}
      onEditProduct={(product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
      }}
      onDeleteProducts={handleDeleteProducts}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}
