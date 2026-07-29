'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { OrdersView } from '../components/OrdersView';

export default function OrdersPage() {
  const { orders } = useApp();
  return <OrdersView orders={orders} />;
}
