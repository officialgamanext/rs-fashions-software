'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { CustomersView } from '../components/CustomersView';
import { CustomerModal } from '../components/CustomerModal';

export default function CustomersPage() {
  const {
    customers,
    isLoadingCustomers,
    products,
    isCustomerModalOpen,
    editingCustomer,
    setIsCustomerModalOpen,
    setEditingCustomer,
    handleSaveCustomer,
    handleDeleteCustomers
  } = useApp();

  return (
    <>
      <CustomersView
        customers={customers}
        isLoadingCustomers={isLoadingCustomers}
        onAddCustomerClick={() => {
          setEditingCustomer(null);
          setIsCustomerModalOpen(true);
        }}
        onEditCustomer={(customer) => {
          setEditingCustomer(customer);
          setIsCustomerModalOpen(true);
        }}
        onDeleteCustomers={handleDeleteCustomers}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
        initialCustomer={editingCustomer}
        products={products}
      />
    </>
  );
}
