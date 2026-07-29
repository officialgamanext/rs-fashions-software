'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { CustomersView } from '../components/CustomersView';

export default function CustomersPage() {
  const { customers } = useApp();
  return <CustomersView customers={customers} />;
}
