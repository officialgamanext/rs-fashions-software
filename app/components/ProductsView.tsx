'use client';

import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Columns, 
  ArrowUpDown, 
  Calendar, 
  ChevronDown, 
  Package, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  FileSpreadsheet,
  Upload,
  Globe,
  Store,
  Loader2,
  Percent,
  Layers,
  Edit2
} from 'lucide-react';
import { Product, ProductStatus } from '../types';

interface ProductsViewProps {
  products: Product[];
  isLoadingProducts?: boolean;
  onAddProductClick: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProducts: (ids: string[]) => void;
  onUpdateStatus: (ids: string[], status: ProductStatus) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  isLoadingProducts = false,
  onAddProductClick,
  onEditProduct,
  onDeleteProducts,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'All' | 'Active' | 'Draft' | 'Archived'>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('All');

  // Filter products by tab, search query, and collection
  const filteredProducts = products.filter((product) => {
    const matchesTab = selectedTab === 'All' || product.status === selectedTab;
    const matchesCollection = selectedCollection === 'All' || product.collection === selectedCollection;
    const matchesSearch = 
      (product.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.collection || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.vendor || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesCollection && matchesSearch;
  });

  // Calculate quick analytics from live Firebase data
  const totalStock = products.reduce((acc, p) => acc + (p.inventory || 0), 0);
  const activeCount = products.filter(p => p.isActive || p.status === 'Active').length;
  const totalValue = products.reduce((acc, p) => acc + ((p.price || 0) * (p.inventory || 0)), 0);

  // Handle select all
  const isAllSelected = filteredProducts.length > 0 && selectedIds.length === filteredProducts.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Helper for dynamic product image thumbnail
  const renderProductMedia = (product: Product) => {
    if (product.media && product.media.length > 0) {
      return (
        <img
          src={product.media[0]}
          alt={product.title}
          className="w-10 h-10 rounded-xl object-cover border border-gray-200 shadow-xs shrink-0 bg-gray-100"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
        <Package className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto text-gray-900 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center shadow-sm">
            <Tag className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center space-x-2">
              <span>Products Catalog</span>
              <span className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full font-semibold">
                {products.length} Items
              </span>
            </h1>
            <p className="text-xs text-gray-500">Manage apparel inventory, variations, prices & Firebase sync</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => alert(`Exporting ${products.length} products to CSV...`)}
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-gray-500" />
            <span>Export</span>
          </button>

          <button
            onClick={onAddProductClick}
            className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add product</span>
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Total Products</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">
              {isLoadingProducts ? '...' : `${products.length} Products`}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {activeCount} Active in Store
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Total Stock Quantity</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">
              {isLoadingProducts ? '...' : `${totalStock} Units`}
            </div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">Across all color & size variations</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Estimated Inventory Valuation</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">
              {isLoadingProducts ? '...' : `₹${totalValue.toLocaleString('en-IN')}`}
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Real-time valuation</div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Tab & Filter Bar */}
        <div className="p-3.5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#fafafa]">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 border-b md:border-b-0 pb-2 md:pb-0 overflow-x-auto">
            {(['All', 'Active', 'Draft', 'Archived'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedTab === tab 
                    ? 'bg-white text-gray-900 font-bold shadow-xs border border-gray-200' 
                    : 'text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search and Collection Filters */}
          <div className="flex items-center space-x-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, SKU, vendor or collection..."
                className="w-full bg-white border border-gray-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-50/80 border-b border-indigo-200 px-4 py-2 flex items-center justify-between text-xs animate-in fade-in">
            <span className="font-bold text-indigo-950">
              {selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onUpdateStatus(selectedIds, 'Active');
                  setSelectedIds([]);
                }}
                className="bg-white border border-indigo-300 text-indigo-700 px-3 py-1 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center space-x-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Set as Active</span>
              </button>

              <button
                onClick={() => {
                  onUpdateStatus(selectedIds, 'Draft');
                  setSelectedIds([]);
                }}
                className="bg-white border border-indigo-300 text-indigo-700 px-3 py-1 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center space-x-1 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Set as Draft</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedIds.length} product(s)?`)) {
                    onDeleteProducts(selectedIds);
                    setSelectedIds([]);
                  }
                }}
                className="bg-red-50 border border-red-300 text-red-700 px-3 py-1 rounded-lg font-semibold hover:bg-red-100 transition flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body: Spinner vs Empty State vs Data Table */}
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
            <Loader2 className="w-9 h-9 text-gray-900 animate-spin" />
            <p className="font-semibold text-xs text-gray-700">Fetching products from Firebase...</p>
            <p className="text-[11px] text-gray-400">Please wait a moment</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-1">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No products found</h3>
            <p className="text-xs text-gray-500 max-w-md">
              {searchQuery || selectedTab !== 'All' 
                ? 'No products match your search query or tab filters.' 
                : 'There are no products in your Firebase database yet. Click below to add your first product.'}
            </p>
            <button
              onClick={onAddProductClick}
              className="mt-2 bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Product</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-3">Product</th>
                  <th className="py-3.5 px-3">Collection & Vendor</th>
                  <th className="py-3.5 px-3">Price (₹)</th>
                  <th className="py-3.5 px-3">GST %</th>
                  <th className="py-3.5 px-3">Variations</th>
                  <th className="py-3.5 px-3">Inventory</th>
                  <th className="py-3.5 px-3">Channels</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const isOutOfStock = (product.inventory || 0) === 0;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50/90 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(product.id)}
                          className="rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Product Media & Title & SKU */}
                      <td className="py-3 px-3" onClick={() => onEditProduct(product)}>
                        <div className="flex items-center space-x-3">
                          {renderProductMedia(product)}
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition flex items-center space-x-1.5">
                              <span>{product.title}</span>
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono flex items-center space-x-1 mt-0.5">
                              <span>SKU: {product.sku || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Collection & Vendor */}
                      <td className="py-3 px-3" onClick={() => onEditProduct(product)}>
                        <div className="font-semibold text-gray-900">{product.collection || 'General'}</div>
                        <div className="text-[11px] text-gray-500">{product.vendor || 'RS Fashions'}</div>
                      </td>

                      {/* Price & Discount */}
                      <td className="py-3 px-3 font-semibold" onClick={() => onEditProduct(product)}>
                        <div className="text-gray-900 font-bold text-xs">
                          ₹{product.price ? product.price.toLocaleString('en-IN') : '0'}
                        </div>
                        {Boolean(product.discountRupees && product.discountRupees > 0) && (
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            ₹{product.discountRupees} Off
                          </div>
                        )}
                      </td>

                      {/* GST % */}
                      <td className="py-3 px-3 font-medium text-gray-700" onClick={() => onEditProduct(product)}>
                        <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md font-mono text-[11px]">
                          {product.gstPercentage ?? 5}% GST
                        </span>
                      </td>

                      {/* Variations Summary */}
                      <td className="py-3 px-3" onClick={() => onEditProduct(product)}>
                        {product.variations && product.variations.length > 0 ? (
                          <div className="flex items-center space-x-1">
                            {product.variations.map((v) => (
                              <span
                                key={v.id}
                                className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-xs inline-block"
                                style={{ backgroundColor: v.colorHex || '#666' }}
                                title={`${v.color} (${v.sizes.length} sizes)`}
                              />
                            ))}
                            <span className="text-[11px] text-gray-500 font-medium ml-1">
                              {product.variations.length} color{product.variations.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">No variations</span>
                        )}
                      </td>

                      {/* Inventory Stock */}
                      <td className="py-3 px-3 font-medium" onClick={() => onEditProduct(product)}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          isOutOfStock
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {product.inventory} in stock
                        </span>
                      </td>

                      {/* Channels (Online / Offline) */}
                      <td className="py-3 px-3" onClick={() => onEditProduct(product)}>
                        <div className="flex items-center space-x-1.5">
                          {product.showInOnline && (
                            <span title="Show in Online Store" className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                              <Globe className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {product.showInOffline && (
                            <span title="Show in Offline Store" className="p-1 rounded-md bg-purple-50 text-purple-600 border border-purple-200">
                              <Store className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3" onClick={() => onEditProduct(product)}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          product.status === 'Active' || product.isActive
                            ? 'bg-[#d1f4e0] text-[#007a5a]'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {product.isActive || product.status === 'Active' ? 'Active' : 'Draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete "${product.title}"?`)) {
                                onDeleteProducts([product.id]);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Product"
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
          <span>Showing {filteredProducts.length} of {products.length} products</span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Synced with Firebase Firestore</span>
          </span>
        </div>
      </div>
    </div>
  );
};
