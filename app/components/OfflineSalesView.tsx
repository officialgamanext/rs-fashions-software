'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Calendar, 
  Banknote, 
  QrCode, 
  CreditCard, 
  Printer, 
  Eye, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  X, 
  ArrowUpRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';

export const OfflineSalesView: React.FC = () => {
  const { orders, isLoadingOrders } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'Cash' | 'UPI' | 'Card'>('all');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Filter settled bills (offline orders / completed bills)
  const settledBills = orders.filter(order => {
    // Search query match
    const matchesSearch = 
      (order.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerPhone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.id || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter match
    let matchesDate = true;
    if (dateFilter !== 'all' && order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      if (dateFilter === 'today') {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = orderDate >= oneWeekAgo;
      } else if (dateFilter === 'month') {
        matchesDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
    }

    // Payment method match
    let matchesPayment = true;
    if (paymentFilter !== 'all') {
      const notes = (order.notes || '').toLowerCase();
      if (paymentFilter === 'Cash') {
        matchesPayment = notes.includes('cash') || !notes.includes('upi') && !notes.includes('card');
      } else if (paymentFilter === 'UPI') {
        matchesPayment = notes.includes('upi') || notes.includes('qr');
      } else if (paymentFilter === 'Card') {
        matchesPayment = notes.includes('card');
      }
    }

    return matchesSearch && matchesDate && matchesPayment;
  });

  // Calculate Metrics
  const totalRevenue = settledBills.reduce((acc, order) => acc + (order.total || 0), 0);
  const totalBillsCount = settledBills.length;
  const cashSales = settledBills
    .filter(o => (o.notes || '').toLowerCase().includes('cash'))
    .reduce((acc, o) => acc + (o.total || 0), 0);
  const digitalSales = totalRevenue - cashSales;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto select-none font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <span>Offline Sales & Settled Bills</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Complete history of completed point-of-sale bills and offline store revenue</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{totalBillsCount} Settled Bill(s)</span>
          </span>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Settled Revenue</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">₹{totalRevenue.toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Settled Bills</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{totalBillsCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Cash Sales</span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">₹{cashSales.toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">UPI & Card Sales</span>
            <div className="text-2xl font-black text-purple-700 mt-0.5">₹{digitalSales.toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <QrCode className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Bill #, Customer Name, Phone..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Date Filters */}
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            {(['all', 'today', 'week', 'month'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase transition cursor-pointer ${
                  dateFilter === filter
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filter === 'all' ? 'All Time' : filter}
              </button>
            ))}
          </div>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e: any) => setPaymentFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 font-medium focus:outline-none"
          >
            <option value="all">All Payment Modes</option>
            <option value="Cash">Cash Payments</option>
            <option value="UPI">UPI / QR Code</option>
            <option value="Card">Credit/Debit Card</option>
          </select>
        </div>
      </div>

      {/* Settled Bills Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Bill / Order #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoadingOrders ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-emerald-600" />
                    <span>Loading settled bills from database...</span>
                  </td>
                </tr>
              ) : settledBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-600" />
                    <p className="text-xs font-semibold">No settled bills found</p>
                    <p className="text-[11px] text-gray-400">Settle offline bills in Offline Billing tab to see them here</p>
                  </td>
                </tr>
              ) : (
                settledBills.map((order) => {
                  const notes = (order.notes || '').toLowerCase();
                  let methodBadge = { label: 'Cash', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
                  if (notes.includes('upi') || notes.includes('qr')) {
                    methodBadge = { label: 'UPI / QR', color: 'bg-purple-100 text-purple-800 border-purple-200' };
                  } else if (notes.includes('card')) {
                    methodBadge = { label: 'Card', color: 'bg-blue-100 text-blue-800 border-blue-200' };
                  }

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-extrabold text-gray-900">
                        #{order.orderNumber}
                      </td>

                      <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px]">
                        {order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today')}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{order.customerName || 'Walk-in Customer'}</div>
                        {order.customerPhone && (
                          <div className="text-[11px] text-gray-500 font-mono">{order.customerPhone}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-gray-700">
                        {order.itemsCount || (order.items ? order.items.length : 1)} item(s)
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${methodBadge.color}`}>
                          {methodBadge.label} • Paid
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-sm text-gray-900">
                        ₹{order.total}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE / DETAILED INVOICE MODAL */}
      {selectedOrderForInvoice && (
        <div 
          onClick={() => setSelectedOrderForInvoice(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-150 cursor-default"
          >
            {/* Header */}
            <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm">Settled Bill Invoice</h3>
                <p className="text-[11px] text-gray-300 font-mono">Bill #{selectedOrderForInvoice.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Content */}
            <div className="p-5 space-y-4 text-xs font-mono bg-white border-b border-gray-200">
              <div className="text-center space-y-0.5 border-b border-dashed border-gray-300 pb-3">
                <h2 className="font-sans font-black text-lg text-gray-900 tracking-wider">RS FASHIONS</h2>
                <p className="text-[10px] text-gray-500 font-sans">Retail Store Receipt</p>
                <p className="text-[10px] text-gray-400">{selectedOrderForInvoice.date}</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bill #:</span>
                  <span className="font-bold">{selectedOrderForInvoice.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-bold">{selectedOrderForInvoice.customerName}</span>
                </div>
                {selectedOrderForInvoice.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-bold">{selectedOrderForInvoice.customerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment:</span>
                  <span className="font-bold">{selectedOrderForInvoice.notes || 'Paid'}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="border-t border-b border-dashed border-gray-300 py-2 space-y-1 text-[11px]">
                {selectedOrderForInvoice.items && selectedOrderForInvoice.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate pr-2">{item.quantity}x {item.productTitle}</span>
                    <span className="font-bold shrink-0">₹{item.total || item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrderForInvoice.subtotal || selectedOrderForInvoice.total}</span>
                </div>
                {selectedOrderForInvoice.discount ? (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount:</span>
                    <span>-₹{selectedOrderForInvoice.discount}</span>
                  </div>
                ) : null}
                {selectedOrderForInvoice.taxes ? (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (GST):</span>
                    <span>₹{selectedOrderForInvoice.taxes}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm font-sans font-black text-gray-900 border-t border-gray-200 pt-1">
                  <span>GRAND TOTAL:</span>
                  <span>₹{selectedOrderForInvoice.total}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-gray-50 flex items-center justify-between gap-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Re-print Receipt</span>
              </button>

              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-xl font-bold text-xs hover:bg-gray-300 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
