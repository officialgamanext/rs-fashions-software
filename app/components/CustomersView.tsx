'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Upload, 
  ChevronDown, 
  Trash2, 
  Edit2, 
  Loader2, 
  MapPin, 
  ShoppingBag, 
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { Customer } from '../types';
import { PaginationBar } from './PaginationBar';

interface CustomersViewProps {
  customers: Customer[];
  isLoadingCustomers?: boolean;
  onAddCustomerClick: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomers: (ids: string[]) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  isLoadingCustomers = false,
  onAddCustomerClick,
  onEditCustomer,
  onDeleteCustomers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [segmentInput, setSegmentInput] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 45;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch = 
        (customer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phoneNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.location || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length);
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const isAllSelected = filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map(c => c.id));
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
      {/* Top Header Bar matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center space-x-2">
              <span>Customers</span>
              <span className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full font-semibold">
                {customers.length} Total
              </span>
            </h1>
            <p className="text-xs text-gray-500">Manage buyer profiles, addresses, cart/wishlist items & marketing status</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => alert("Exporting customer database to CSV...")}
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-gray-500" />
            <span>Export</span>
          </button>

          <button 
            onClick={() => alert("Import customer CSV drop ready.")}
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-gray-500" />
            <span>Import</span>
          </button>

          <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs transition flex items-center space-x-1 cursor-pointer">
            <span>More actions</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          <button
            onClick={onAddCustomerClick}
            className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add customer</span>
          </button>
        </div>
      </div>

      {/* Describe your segment bar matching Screenshot 2 */}
      <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-2xs flex items-center space-x-2">
        <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          value={segmentInput}
          onChange={(e) => setSegmentInput(e.target.value)}
          placeholder="Describe your segment (e.g. Customers in India who ordered in last 30 days)"
          className="w-full text-xs text-gray-800 focus:outline-none bg-transparent"
        />
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 cursor-pointer" />
      </div>

      {/* Main Customers Table Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-3.5 border-b border-gray-200 bg-[#fafafa] flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers by name, phone, email or location..."
              className="w-full bg-white border border-gray-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-50/80 border-b border-indigo-200 px-4 py-2 flex items-center justify-between text-xs animate-in fade-in">
            <span className="font-bold text-indigo-950">
              {selectedIds.length} customer{selectedIds.length > 1 ? 's' : ''} selected
            </span>

            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedIds.length} customer(s)?`)) {
                  onDeleteCustomers(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="bg-red-50 border border-red-300 text-red-700 px-3 py-1 rounded-lg font-semibold hover:bg-red-100 transition flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Delete</span>
            </button>
          </div>
        )}

        {/* Content Body: Spinner vs Empty State vs Data Table */}
        {isLoadingCustomers ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
            <Loader2 className="w-9 h-9 text-gray-900 animate-spin" />
            <p className="font-semibold text-xs text-gray-700">Fetching customer profiles from Firebase...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-1">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No customers found</h3>
            <p className="text-xs text-gray-500 max-w-md">
              {searchQuery 
                ? 'No customer matches your search filter.' 
                : 'There are no customers registered in your database yet.'}
            </p>
            <button
              onClick={onAddCustomerClick}
              className="mt-2 bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Customer</span>
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
                  <th className="py-3.5 px-3">Customer Name</th>
                  <th className="py-3.5 px-3">Email Subscription</th>
                  <th className="py-3.5 px-3">Location</th>
                  <th className="py-3.5 px-3 text-center">Orders</th>
                  <th className="py-3.5 px-3">Amount Spent</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCustomers.map((c) => {
                  const isSelected = selectedIds.includes(c.id);

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-gray-50/90 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(c.id)}
                          className="rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-3 px-3" onClick={() => onEditCustomer(c)}>
                        <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition flex items-center space-x-2">
                          <img
                            src={`https://flagcdn.com/w40/${c.countryIso || 'in'}.png`}
                            alt={c.country || 'India'}
                            className="w-4 h-3 rounded-xs object-cover border border-gray-200 shrink-0"
                          />
                          <span>{c.name || 'Untitled Customer'}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono flex items-center space-x-2 mt-0.5">
                          <span>{c.phoneCode} {c.phoneNumber}</span>
                          {c.email && <span>&bull; {c.email}</span>}
                        </div>
                      </td>

                      {/* Marketing / Email Subscription Badge matching screenshot 2 */}
                      <td className="py-3 px-3" onClick={() => onEditCustomer(c)}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          c.status === 'Subscribed'
                            ? 'bg-[#d1f4e0] text-[#007a5a]'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {c.status === 'Subscribed' ? 'Subscribed' : 'Not subscribed'}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-gray-700" onClick={() => onEditCustomer(c)}>
                        {c.location || 'India'}
                      </td>

                      {/* Orders Count */}
                      <td className="py-3 px-3 text-center font-bold text-gray-800" onClick={() => onEditCustomer(c)}>
                        {c.ordersCount || 0}
                      </td>

                      {/* Amount Spent */}
                      <td className="py-3 px-3 font-bold text-gray-900" onClick={() => onEditCustomer(c)}>
                        ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onEditCustomer(c)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete customer "${c.name}"?`)) {
                                onDeleteCustomers([c.id]);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Customer"
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

        {/* Pagination Controls */}
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCustomers.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
          itemLabel="customers"
        />
      </div>
    </div>
  );
};
