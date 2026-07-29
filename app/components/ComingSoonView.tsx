'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Construction, ArrowLeft, Clock } from 'lucide-react';

interface ComingSoonViewProps {
  title: string;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({ title }) => {
  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto text-gray-900 select-none animate-fadeIn">
      {/* Top Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage and configure {title.toLowerCase()} for your store</p>
        </div>

        <Link
          href="/products"
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Main Coming Soon Banner Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-xs space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <Construction className="w-8 h-8 stroke-[1.8]" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Coming Soon</span>
          </div>
          <h2 className="text-lg font-extrabold text-gray-900 pt-2">
            {title} Module Under Development
          </h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            We are actively expanding this feature for your store. The interface for {title.toLowerCase()} will be enabled in an upcoming release.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center space-x-3">
          <Link
            href="/products"
            className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-xs cursor-pointer flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>View Products Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
