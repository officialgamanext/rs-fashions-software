'use client';

import React, { useState, useEffect } from 'react';
import { Search, Tag, ShoppingCart, Users, Truck, ScanBarcode, Receipt, ArrowRight, X } from 'lucide-react';
import { ViewType, Product } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectView: (view: ViewType) => void;
  onEditProduct: (product: Product) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectView,
  onEditProduct
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedProducts = products.filter(p => 
    (p.title || '').toLowerCase().includes(query.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(query.toLowerCase()) ||
    (p.collection || '').toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const quickNav = [
    { label: 'Products', view: 'products' as ViewType, icon: Tag },
    { label: 'Orders', view: 'orders' as ViewType, icon: ShoppingCart },
    { label: 'Customers', view: 'customers' as ViewType, icon: Users },
    { label: 'Shipping & Delivery', view: 'shipping' as ViewType, icon: Truck },
    { label: 'Offline Billing', view: 'offline-billing' as ViewType, icon: ScanBarcode },
    { label: 'Offline Sales', view: 'offline-sales' as ViewType, icon: Receipt },
  ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150 select-none cursor-default"
      >
        {/* Search input bar with close icon */}
        <div className="p-3 border-b border-gray-200 flex items-center space-x-3 bg-gray-50">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, orders, shipping rates, or pages..."
            className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 text-xs font-semibold px-1"
            >
              Clear
            </button>
          )}
          <kbd className="bg-gray-200 border border-gray-300 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-mono hidden sm:inline-block">
            ESC
          </kbd>
          <button
            onClick={onClose}
            title="Close search (Esc)"
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded-lg transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results / Navigation suggestions */}
        <div className="p-3 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
          {/* Quick Navigation links */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Quick Navigation
            </div>
            <div className="space-y-1">
              {quickNav.map((nav) => {
                const Icon = nav.icon;
                return (
                  <button
                    key={nav.view}
                    onClick={() => {
                      onSelectView(nav.view);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800 font-semibold transition group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
                      <span>{nav.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matched Products */}
          {query.trim().length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                Products ({matchedProducts.length})
              </div>
              <div className="space-y-1">
                {matchedProducts.length === 0 ? (
                  <div className="text-gray-400 px-2 py-1">No matching products found</div>
                ) : (
                  matchedProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        onEditProduct(product);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 text-left transition cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-gray-900">{product.title}</div>
                        <div className="text-[11px] text-gray-500">{product.category} • ₹{product.price}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        product.inventory === 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {product.inventory} in stock
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
