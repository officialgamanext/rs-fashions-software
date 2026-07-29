'use client';

import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Scale, 
  Package, 
  Trash2, 
  Edit2, 
  Loader2, 
  CheckCircle2, 
  Sliders,
  DollarSign
} from 'lucide-react';
import { ShippingMethod } from '../types';

interface ShippingDeliveryViewProps {
  shippingMethods: ShippingMethod[];
  isLoadingShipping?: boolean;
  onAddMethodClick: () => void;
  onEditMethod: (method: ShippingMethod) => void;
  onDeleteMethods: (ids: string[]) => void;
}

export const ShippingDeliveryView: React.FC<ShippingDeliveryViewProps> = ({
  shippingMethods,
  isLoadingShipping = false,
  onAddMethodClick,
  onEditMethod,
  onDeleteMethods
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Calculate metrics
  const activeCount = shippingMethods.filter(m => m.status === 'Active').length;
  const weightCount = shippingMethods.filter(m => m.type === 'weight').length;
  const quantityCount = shippingMethods.filter(m => m.type === 'quantity').length;

  const filteredMethods = shippingMethods.filter((method) => {
    const matchesSearch = (method.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || method.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const isAllSelected = filteredMethods.length > 0 && selectedIds.length === filteredMethods.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMethods.map(m => m.id));
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center shadow-sm">
            <Truck className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center space-x-2">
              <span>Shipping & Delivery</span>
              <span className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full font-semibold">
                {shippingMethods.length} Methods
              </span>
            </h1>
            <p className="text-xs text-gray-500">Configure delivery rates based on weight ranges, item quantities, or flat rates</p>
          </div>
        </div>

        <button
          onClick={onAddMethodClick}
          className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Shipping Method</span>
        </button>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Rates</span>
          <div className="text-lg font-extrabold text-gray-900 mt-1 font-mono">
            {shippingMethods.length}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Active Rates</span>
          <div className="text-lg font-extrabold text-emerald-700 mt-1 font-mono">
            {activeCount}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">Weight-Based</span>
          <div className="text-lg font-extrabold text-indigo-700 mt-1 font-mono">
            {weightCount}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">Quantity-Based</span>
          <div className="text-lg font-extrabold text-purple-700 mt-1 font-mono">
            {quantityCount}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Search & Filter bar */}
        <div className="p-3.5 border-b border-gray-200 bg-[#fafafa] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shipping methods by title..."
              className="w-full bg-white border border-gray-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 cursor-pointer"
            >
              <option value="All">All Calculation Types</option>
              <option value="weight">Weight-Based</option>
              <option value="quantity">Quantity-Based</option>
              <option value="flat">Flat Rate</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-50/80 border-b border-indigo-200 px-4 py-2 flex items-center justify-between text-xs animate-in fade-in">
            <span className="font-bold text-indigo-950">
              {selectedIds.length} method{selectedIds.length > 1 ? 's' : ''} selected
            </span>

            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedIds.length} method(s)?`)) {
                  onDeleteMethods(selectedIds);
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

        {/* Table Body */}
        {isLoadingShipping ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
            <Loader2 className="w-9 h-9 text-gray-900 animate-spin" />
            <p className="font-semibold text-xs text-gray-700">Fetching shipping rates from Firebase...</p>
          </div>
        ) : filteredMethods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-1">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No shipping methods found</h3>
            <p className="text-xs text-gray-500 max-w-md">
              {searchQuery || typeFilter !== 'All' 
                ? 'No shipping rate matches your search or rule filters.' 
                : 'There are no shipping methods created in your store yet.'}
            </p>
            <button
              onClick={onAddMethodClick}
              className="mt-2 bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Shipping Method</span>
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
                  <th className="py-3.5 px-3">Method Title</th>
                  <th className="py-3.5 px-3">Rule Type</th>
                  <th className="py-3.5 px-3">Condition Range</th>
                  <th className="py-3.5 px-3">Shipping Charge</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMethods.map((m) => {
                  const isSelected = selectedIds.includes(m.id);

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-gray-50/90 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(m.id)}
                          className="rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Title */}
                      <td className="py-3 px-3" onClick={() => onEditMethod(m)}>
                        <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition">
                          {m.title}
                        </span>
                      </td>

                      {/* Rule Type Badge */}
                      <td className="py-3 px-3" onClick={() => onEditMethod(m)}>
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          m.type === 'weight'
                            ? 'bg-indigo-100 text-indigo-800'
                            : m.type === 'quantity'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {m.type === 'weight' && <Scale className="w-3 h-3 mr-1" />}
                          {m.type === 'quantity' && <Package className="w-3 h-3 mr-1" />}
                          {m.type === 'flat' && <Truck className="w-3 h-3 mr-1" />}
                          <span>
                            {m.type === 'weight' ? 'Based on Weight' : m.type === 'quantity' ? 'Based on Quantity' : 'Flat Rate'}
                          </span>
                        </span>
                      </td>

                      {/* Condition Range */}
                      <td className="py-3 px-3 text-gray-700 font-mono" onClick={() => onEditMethod(m)}>
                        {m.type === 'weight' ? (
                          <span>{m.minWeight ?? 0} kg – {m.maxWeight ?? '∞'} kg</span>
                        ) : m.type === 'quantity' ? (
                          <span>{m.minQuantity ?? 1} – {m.maxQuantity ?? '∞'} items</span>
                        ) : (
                          <span className="text-gray-400 font-sans">All Orders</span>
                        )}
                      </td>

                      {/* Shipping Charge Amount */}
                      <td className="py-3 px-3 font-bold text-gray-900 font-mono" onClick={() => onEditMethod(m)}>
                        {m.amount === 0 ? (
                          <span className="text-emerald-600 font-sans font-extrabold uppercase text-[11px]">Free Shipping</span>
                        ) : (
                          <span>₹{m.amount.toLocaleString('en-IN')}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3" onClick={() => onEditMethod(m)}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          m.status === 'Active'
                            ? 'bg-[#d1f4e0] text-[#007a5a]'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {m.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onEditMethod(m)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Edit Method"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete shipping rate "${m.title}"?`)) {
                                onDeleteMethods([m.id]);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Method"
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

        {/* Footer info */}
        <div className="p-3.5 border-t border-gray-200 bg-gray-50/70 flex items-center justify-between text-xs text-gray-500 font-medium">
          <span>Showing {filteredMethods.length} of {shippingMethods.length} methods</span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Synced with Firebase Firestore</span>
          </span>
        </div>
      </div>
    </div>
  );
};
