'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { ShippingDeliveryView } from '../components/ShippingDeliveryView';
import { ShippingModal } from '../components/ShippingModal';

export default function ShippingAndDeliveryPage() {
  const {
    shippingMethods,
    isLoadingShipping,
    isShippingModalOpen,
    editingShippingMethod,
    setIsShippingModalOpen,
    setEditingShippingMethod,
    handleSaveShippingMethod,
    handleDeleteShippingMethods
  } = useApp();

  return (
    <>
      <ShippingDeliveryView
        shippingMethods={shippingMethods}
        isLoadingShipping={isLoadingShipping}
        onAddMethodClick={() => {
          setEditingShippingMethod(null);
          setIsShippingModalOpen(true);
        }}
        onEditMethod={(method) => {
          setEditingShippingMethod(method);
          setIsShippingModalOpen(true);
        }}
        onDeleteMethods={handleDeleteShippingMethods}
      />

      <ShippingModal
        isOpen={isShippingModalOpen}
        onClose={() => {
          setIsShippingModalOpen(false);
          setEditingShippingMethod(null);
        }}
        onSave={handleSaveShippingMethod}
        initialMethod={editingShippingMethod}
      />
    </>
  );
}
