'use client';

import React from 'react';
import { Users, Mail, MapPin, Plus } from 'lucide-react';
import { Customer } from '../types';

interface CustomersViewProps {
  customers: Customer[];
}

export const CustomersView: React.FC<CustomersViewProps> = ({ customers }) => {
  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto text-gray-900 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-gray-700" />
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Customers</h1>
        </div>

        <button 
          onClick={() => alert("Adding customer modal...")}
          className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs transition flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add customer</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[11px]">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3 text-center">Orders</th>
                <th className="py-3 px-3">Total Spent</th>
                <th className="py-3 px-3">Subscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition cursor-pointer">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {c.name}
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {c.email}
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {c.location}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-gray-800">
                    {c.ordersCount}
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-900">
                    ${c.totalSpent.toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      c.status === 'Subscribed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
