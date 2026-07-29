'use client';

import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Upload, 
  ChevronDown, 
  Trash2, 
  Edit2, 
  Loader2, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { Order } from '../types';

interface OrdersViewProps {
  orders: Order[];
  isLoadingOrders?: boolean;
  onAddOrderClick: () => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrders: (ids: string[]) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  isLoadingOrders = false,
  onAddOrderClick,
  onEditOrder,
  onDeleteOrders
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Calculate metrics
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const paidOrdersCount = orders.filter(o => o.paymentStatus === 'Paid').length;
  const unfulfilledCount = orders.filter(o => o.fulfillmentStatus === 'Unfulfilled' || o.fulfillmentStatus === 'In Progress').length;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      (order.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerEmail || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPayment = paymentFilter === 'All' || order.paymentStatus === paymentFilter;
    const matchesFulfillment = fulfillmentFilter === 'All' || order.fulfillmentStatus === fulfillmentFilter;

    return matchesSearch && matchesPayment && matchesFulfillment;
  });

  const isAllSelected = filteredOrders.length > 0 && selectedIds.length === filteredOrders.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto text-gray-900 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center shadow-sm">
            <ShoppingCart className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center space-x-2">
              <span>Orders</span>
              <span className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full font-semibold">
                {orders.length} Total
              </span>
            </h1>
            <p className="text-xs text-gray-500">Track online and offline sales orders, billing, and fulfillment</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => alert("Exporting orders list to CSV...")}
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-gray-500" />
            <span>Export</span>
          </button>

          <button 
            onClick={() => alert("Importing orders from CSV...")}
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-gray-500" />
            <span>Import</span>
          </button>

          <button
            onClick={onAddOrderClick}
            className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add order</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Revenue</span>
          <div className="text-lg font-extrabold text-gray-900 mt-1 font-mono">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Orders</span>
          <div className="text-lg font-extrabold text-gray-900 mt-1">
            {orders.length}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Paid Orders</span>
          <div className="text-lg font-extrabold text-emerald-700 mt-1">
            {paidOrdersCount}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">Pending / Unfulfilled</span>
          <div className="text-lg font-extrabold text-amber-700 mt-1">
            {unfulfilledCount}
          </div>
        </div>
      </div>

      {/* Main Orders Table Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-3.5 border-b border-gray-200 bg-[#fafafa] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, customer name, email..."
              className="w-full bg-white border border-gray-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 cursor-pointer"
            >
              <option value="All">All Payment</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>

            {/* Fulfillment Filter */}
            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 cursor-pointer"
            >
              <option value="All">All Fulfillment</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Unfulfilled">Unfulfilled</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-50/80 border-b border-indigo-200 px-4 py-2 flex items-center justify-between text-xs animate-in fade-in">
            <span className="font-bold text-indigo-950">
              {selectedIds.length} order{selectedIds.length > 1 ? 's' : ''} selected
            </span>

            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedIds.length} order(s)?`)) {
                  onDeleteOrders(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="bg-red-50 border border-red-300 text-red-700 px-3 py-1 rounded-lg font-semibold hover:bg-red-100 transition flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}

        {/* Content Body: Spinner vs Empty State vs Data Table */}
        {isLoadingOrders ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
            <Loader2 className="w-9 h-9 text-gray-900 animate-spin" />
            <p className="font-semibold text-xs text-gray-700">Fetching order records from Firebase...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-1">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No orders found</h3>
            <p className="text-xs text-gray-500 max-w-md">
              {searchQuery || paymentFilter !== 'All' || fulfillmentFilter !== 'All'
                ? 'No order matches your active search or status filters.' 
                : 'There are no orders created in your store database yet.'}
            </p>
            <button
              onClick={onAddOrderClick}
              className="mt-2 bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Order</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold text-[11px]">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-3">Order ID</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Customer</th>
                  <th className="py-3.5 px-3 text-center">Items</th>
                  <th className="py-3.5 px-3">Total Amount</th>
                  <th className="py-3.5 px-3">Payment</th>
                  <th className="py-3.5 px-3">Fulfillment</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((ord) => {
                  const isSelected = selectedIds.includes(ord.id);
                  const cleanNumericId = String(ord.orderNumber || '').replace(/\D/g, '') || ord.id.slice(0, 6);

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-gray-50/90 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(ord.id)}
                          className="rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Numeric Order ID */}
                      <td className="py-3 px-3" onClick={() => onEditOrder(ord)}>
                        <span className="font-mono font-bold text-gray-900 group-hover:text-indigo-600 transition">
                          #{cleanNumericId}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-gray-500 font-medium" onClick={() => onEditOrder(ord)}>
                        {ord.date}
                      </td>

                      {/* Customer Name */}
                      <td className="py-3 px-3" onClick={() => onEditOrder(ord)}>
                        <span className="font-bold text-gray-900 block">{ord.customerName}</span>
                        {ord.customerEmail && <span className="text-[11px] text-gray-500">{ord.customerEmail}</span>}
                      </td>

                      {/* Items Count */}
                      <td className="py-3 px-3 text-center font-bold text-gray-800" onClick={() => onEditOrder(ord)}>
                        {ord.itemsCount || (ord.items ? ord.items.length : 1)}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-3 font-bold text-gray-900 font-mono" onClick={() => onEditOrder(ord)}>
                        ₹{(ord.total || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-3 px-3" onClick={() => onEditOrder(ord)}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          ord.paymentStatus === 'Paid'
                            ? 'bg-[#d1f4e0] text-[#007a5a]'
                            : ord.paymentStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {ord.paymentStatus}
                        </span>
                      </td>

                      {/* Fulfillment Status Badge */}
                      <td className="py-3 px-3" onClick={() => onEditOrder(ord)}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          ord.fulfillmentStatus === 'Fulfilled'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.fulfillmentStatus === 'In Progress'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {ord.fulfillmentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onEditOrder(ord)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Edit Order"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete order #${cleanNumericId}?`)) {
                                onDeleteOrders([ord.id]);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Info */}
        <div className="p-3.5 border-t border-gray-200 bg-gray-50/70 flex items-center justify-between text-xs text-gray-500 font-medium">
          <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Synced with Firebase Firestore</span>
          </span>
        </div>
      </div>
    </div>
  );
};
