'use client';

import React from 'react';
import { ShoppingCart, Filter, ArrowUpDown, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Order } from '../types';

interface OrdersViewProps {
  orders: Order[];
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders }) => {
  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto text-gray-900 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-6 h-6 text-gray-700" />
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Orders</h1>
          <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">
            {orders.length}
          </span>
        </div>

        <button 
          onClick={() => alert("Creating custom draft order...")}
          className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs transition"
        >
          Create order
        </button>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[11px]">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Fulfillment</th>
                <th className="py-3 px-3 text-center">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition cursor-pointer">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-3 text-gray-500">
                    {order.date}
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-800">
                    {order.customerName}
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.paymentStatus === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      <span>{order.paymentStatus}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      order.fulfillmentStatus === 'Fulfilled'
                        ? 'bg-blue-100 text-blue-800'
                        : order.fulfillmentStatus === 'In Progress'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <span>{order.fulfillmentStatus}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-gray-600">
                    {order.itemsCount}
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
