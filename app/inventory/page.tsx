'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { InventoryView } from '../components/InventoryView';

export default function InventoryPage() {
  const {
    products,
    isLoadingProducts,
    handleSaveProduct
  } = useApp();

  return (
    <InventoryView
      products={products}
      isLoadingProducts={isLoadingProducts}
      onSaveProduct={handleSaveProduct}
    />
  );
}
