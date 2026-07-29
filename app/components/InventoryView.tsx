'use client';

import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Save, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Palette,
  RefreshCw
} from 'lucide-react';
import { Product, ProductVariation, VariationSizeItem } from '../types';

interface InventoryViewProps {
  products: Product[];
  isLoadingProducts?: boolean;
  onSaveProduct: (product: Partial<Product>) => Promise<void> | void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  isLoadingProducts = false,
  onSaveProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>([]);
  
  // Local state for tracking unsaved stock changes per product
  // Format: { [productId]: { inventory: number, variations: ProductVariation[] } }
  const [editedStockMap, setEditedStockMap] = useState<{
    [productId: string]: {
      inventory: number;
      variations: ProductVariation[];
      isSaving?: boolean;
    };
  }>({});

  const toggleExpand = (productId: string) => {
    if (expandedProductIds.includes(productId)) {
      setExpandedProductIds(prev => prev.filter(id => id !== productId));
    } else {
      setExpandedProductIds(prev => [...prev, productId]);
    }
  };

  // Helper to get or initialize draft stock state for a product
  const getDraftProductStock = (product: Product) => {
    if (editedStockMap[product.id]) {
      return editedStockMap[product.id];
    }
    return {
      inventory: product.inventory ?? 0,
      variations: product.variations || []
    };
  };

  // Handler for editing main inventory count of simple products
  const handleMainInventoryChange = (product: Product, newInventory: number) => {
    const safeInv = Math.max(0, newInventory);
    setEditedStockMap(prev => ({
      ...prev,
      [product.id]: {
        ...(prev[product.id] || { variations: product.variations || [] }),
        inventory: safeInv
      }
    }));
  };

  // Handler for editing specific size stock inside a variation
  const handleVariationSizeStockChange = (
    product: Product,
    varId: string,
    sizeName: string,
    newSizeStock: number
  ) => {
    const safeStock = Math.max(0, newSizeStock);
    const currentDraft = getDraftProductStock(product);

    // Update size stock inside variations array
    const updatedVariations = currentDraft.variations.map(v => {
      if (v.id !== varId) return v;
      const updatedSizes = v.sizes.map(s => {
        if (s.size === sizeName) {
          return { ...s, inventory: safeStock };
        }
        return s;
      });
      return { ...v, sizes: updatedSizes };
    });

    // Recalculate total product inventory from all variation sizes
    let newTotalInventory = 0;
    updatedVariations.forEach(v => {
      v.sizes.forEach(s => {
        newTotalInventory += Number(s.inventory || 0);
      });
    });

    setEditedStockMap(prev => ({
      ...prev,
      [product.id]: {
        inventory: newTotalInventory,
        variations: updatedVariations
      }
    }));
  };

  // Save updated stock to Firebase Firestore
  const handleSaveStock = async (product: Product) => {
    const draft = editedStockMap[product.id];
    if (!draft) return;

    setEditedStockMap(prev => ({
      ...prev,
      [product.id]: { ...prev[product.id], isSaving: true }
    }));

    try {
      await onSaveProduct({
        id: product.id,
        inventory: draft.inventory,
        variations: draft.variations
      });
      // Clear edited state on success
      setEditedStockMap(prev => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
    } catch (err) {
      console.error(err);
      setEditedStockMap(prev => ({
        ...prev,
        [product.id]: { ...prev[product.id], isSaving: false }
      }));
    }
  };

  // Filter products by tab and search
  const filteredProducts = products.filter((product) => {
    const draft = getDraftProductStock(product);
    const inv = draft.inventory;

    let matchesTab = true;
    if (selectedTab === 'In Stock') matchesTab = inv > 0;
    if (selectedTab === 'Low Stock') matchesTab = inv > 0 && inv <= 10;
    if (selectedTab === 'Out of Stock') matchesTab = inv === 0;

    const matchesSearch = 
      (product.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.collection || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Calculate quick metrics
  const totalProductsCount = products.length;
  const inStockCount = products.filter(p => (getDraftProductStock(p).inventory) > 0).length;
  const lowStockCount = products.filter(p => {
    const inv = getDraftProductStock(p).inventory;
    return inv > 0 && inv <= 10;
  }).length;
  const outOfStockCount = products.filter(p => (getDraftProductStock(p).inventory) === 0).length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-gray-900 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center shadow-sm">
            <Package className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center space-x-2">
              <span>Inventory Management</span>
              <span className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full font-semibold">
                {products.length} Products
              </span>
            </h1>
            <p className="text-xs text-gray-500">Track and update stock counts for products & variation sizes in real-time</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Total Products</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{totalProductsCount}</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">In Stock</div>
            <div className="text-lg font-bold text-emerald-700 mt-0.5">{inStockCount}</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Low Stock (&le; 10)</div>
            <div className="text-lg font-bold text-amber-700 mt-0.5">{lowStockCount}</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Out of Stock</div>
            <div className="text-lg font-bold text-red-700 mt-0.5">{outOfStockCount}</div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-3.5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#fafafa]">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 border-b md:border-b-0 pb-2 md:pb-0 overflow-x-auto">
            {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map((tab) => (
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

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name, SKU, or collection..."
              className="w-full bg-white border border-gray-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
            />
          </div>
        </div>

        {/* Loading Spinner vs Empty State vs Data Table */}
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
            <Loader2 className="w-9 h-9 text-gray-900 animate-spin" />
            <p className="font-semibold text-xs text-gray-700">Fetching inventory from Firebase...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-1">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No products found</h3>
            <p className="text-xs text-gray-500 max-w-md">
              {searchQuery || selectedTab !== 'All' 
                ? 'No inventory matches your search filter.' 
                : 'There are no products in your Firebase database.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-3.5 w-10 text-center"></th>
                  <th className="py-3.5 px-3">Product Info</th>
                  <th className="py-3.5 px-3">SKU</th>
                  <th className="py-3.5 px-3">Collection</th>
                  <th className="py-3.5 px-3">Variations Breakdown</th>
                  <th className="py-3.5 px-3">Inventory Stock Count</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const isExpanded = expandedProductIds.includes(product.id);
                  const draft = getDraftProductStock(product);
                  const hasVariations = draft.variations && draft.variations.length > 0;
                  const isModified = !!editedStockMap[product.id];
                  const isSaving = editedStockMap[product.id]?.isSaving;

                  const isOutOfStock = draft.inventory === 0;
                  const isLowStock = draft.inventory > 0 && draft.inventory <= 10;

                  return (
                    <React.Fragment key={product.id}>
                      {/* Main Product Row */}
                      <tr className={`hover:bg-gray-50/90 transition-colors ${isModified ? 'bg-amber-50/30' : ''}`}>
                        {/* Expand Button */}
                        <td className="p-3.5 text-center">
                          {hasVariations ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(product.id)}
                              className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition cursor-pointer"
                              title={isExpanded ? "Collapse Variations" : "Expand Variations"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-indigo-600 font-bold" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-300">•</span>
                          )}
                        </td>

                        {/* Product Thumbnail & Title */}
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-3">
                            {product.media && product.media.length > 0 ? (
                              <img
                                src={product.media[0]}
                                alt={product.title}
                                className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0 bg-gray-100 shadow-xs"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-gray-900 block">{product.title}</span>
                              <span className="text-[11px] text-gray-400">
                                ₹{product.price ? product.price.toLocaleString('en-IN') : '0'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3 px-3 font-mono font-bold text-gray-700 text-xs">
                          {product.sku || 'N/A'}
                        </td>

                        {/* Collection */}
                        <td className="py-3 px-3 text-gray-700 font-medium">
                          {product.collection || 'General'}
                        </td>

                        {/* Variations Breakdown Summary */}
                        <td className="py-3 px-3">
                          {hasVariations ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(product.id)}
                              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
                            >
                              <Palette className="w-3.5 h-3.5" />
                              <span>{draft.variations.length} Colors & Respective Sizes</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Simple product</span>
                          )}
                        </td>

                        {/* Inventory Input (Editable) */}
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              disabled={hasVariations} // Auto-calculated from variations if present
                              value={draft.inventory}
                              onChange={(e) => handleMainInventoryChange(product, parseInt(e.target.value, 10) || 0)}
                              className={`w-24 bg-white border rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-xs ${
                                isModified ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-300'
                              } ${hasVariations ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''}`}
                              title={hasVariations ? "Stock is calculated automatically from variation size counts below" : "Edit stock count"}
                            />
                            {hasVariations && (
                              <span className="text-[10px] text-gray-400 font-medium">Auto-sum</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>

                        {/* Save Action */}
                        <td className="py-3 px-3 text-right">
                          {isModified && (
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleSaveStock(product)}
                              className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 ml-auto shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                              <span>{isSaving ? 'Saving...' : 'Save Stock'}</span>
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Sub-Rows for Variation Color & Sizes */}
                      {isExpanded && hasVariations && (
                        <tr className="bg-indigo-50/30 border-b border-indigo-100">
                          <td colSpan={8} className="p-4 pl-12">
                            <div className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-2xs space-y-4">
                              <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-100 pb-2">
                                <Palette className="w-4 h-4 text-indigo-600" />
                                <span>Sub Variations & Size Counts for "{product.title}"</span>
                              </h4>

                              <div className="space-y-3">
                                {draft.variations.map((v) => (
                                  <div key={v.id} className="bg-gray-50/70 border border-gray-200 rounded-xl p-3 space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <span 
                                        className="w-4 h-4 rounded-full border border-gray-300 inline-block shadow-2xs" 
                                        style={{ backgroundColor: v.colorHex || '#888' }}
                                      />
                                      <span className="font-bold text-xs text-gray-900">{v.color}</span>
                                      <span className="text-[11px] text-gray-400">({v.sizes.length} sizes)</span>
                                    </div>

                                    {/* Size Items Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                                      {v.sizes.map((s) => (
                                        <div key={s.size} className="bg-white border border-gray-200 p-2 rounded-lg flex flex-col justify-between space-y-1 shadow-2xs">
                                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                                            <span>Size: {s.size}</span>
                                            {s.price && <span className="text-gray-400 font-normal">₹{s.price}</span>}
                                          </div>

                                          <div className="flex items-center space-x-1">
                                            <span className="text-[10px] text-gray-400 font-medium">Qty:</span>
                                            <input
                                              type="number"
                                              min="0"
                                              value={s.inventory ?? 0}
                                              onChange={(e) => handleVariationSizeStockChange(
                                                product,
                                                v.id,
                                                s.size,
                                                parseInt(e.target.value, 10) || 0
                                              )}
                                              className="w-full bg-white border border-gray-300 rounded-md px-1.5 py-0.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {isModified && (
                                <div className="pt-2 flex items-center justify-end">
                                  <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => handleSaveStock(product)}
                                    className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                                  >
                                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    <span>Save All Variation Counts</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
