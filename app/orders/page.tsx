'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { OrdersView } from '../components/OrdersView';
import { OrderModal } from '../components/OrderModal';

export default function OrdersPage() {
  const {
    orders,
    isLoadingOrders,
    products,
    customers,
    isOrderModalOpen,
    editingOrder,
    setIsOrderModalOpen,
    setEditingOrder,
    handleSaveOrder,
    handleDeleteOrders
  } = useApp();

  return (
    <>
      <OrdersView
        orders={orders}
        isLoadingOrders={isLoadingOrders}
        onAddOrderClick={() => {
          setEditingOrder(null);
          setIsOrderModalOpen(true);
        }}
        onEditOrder={(order) => {
          setEditingOrder(order);
          setIsOrderModalOpen(true);
        }}
        onDeleteOrders={handleDeleteOrders}
      />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleSaveOrder}
        initialOrder={editingOrder}
        products={products}
        customers={customers}
      />
    </>
  );
}
