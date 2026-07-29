'use client';

import React from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, ArrowUpRight } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto text-gray-900 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-gray-700" />
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Analytics Overview</h1>
        </div>
        <span className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-medium">
          Last 30 days
        </span>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">$18,429.50</div>
          <div className="flex items-center space-x-1 text-xs text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% vs previous period</span>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Online Store Sessions</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">14,280</div>
          <div className="flex items-center space-x-1 text-xs text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+8.7% vs previous period</span>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">3.82%</div>
          <div className="flex items-center space-x-1 text-xs text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+0.5% vs previous period</span>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Average Order Value</span>
            <ShoppingBag className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">$87.40</div>
          <div className="flex items-center space-x-1 text-xs text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+3.1% vs previous period</span>
          </div>
        </div>
      </div>

      {/* Visual Chart Placeholder Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Total Sales Over Time</h3>
        <div className="h-64 bg-gradient-to-t from-emerald-50 to-white rounded-lg border border-dashed border-gray-300 flex items-end justify-between p-4 space-x-2">
          {[40, 65, 45, 80, 95, 60, 85, 110, 90, 125, 140, 130, 160].map((h, i) => (
            <div key={i} className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all group relative" style={{ height: `${h}%` }}>
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded font-bold pointer-events-none transition whitespace-nowrap shadow-md">
                ${(h * 120).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
