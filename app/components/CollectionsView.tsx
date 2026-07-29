'use client';

import React, { useState } from 'react';
import { 
  FolderPlus, 
  Plus, 
  Search, 
  Layers, 
  Package, 
  Trash2, 
  Edit2, 
  Loader2, 
  Folder,
  ArrowRight
} from 'lucide-react';
import { Collection, Product } from '../types';

interface CollectionsViewProps {
  collections: Collection[];
  products: Product[];
  isLoadingCollections?: boolean;
  onAddCollectionClick: () => void;
  onEditCollection: (collection: Collection) => void;
  onDeleteCollection: (id: string) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  products,
  isLoadingCollections = false,
  onAddCollectionClick,
  onEditCollection,
  onDeleteCollection
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCollections = collections.filter(c =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAssignedProducts = collections.reduce((acc, c) => acc + (c.productIds ? c.productIds.length : 0), 0);

  // Helper to resolve product thumbnail images for collection preview
  const getProductPreviews = (productIds: string[]) => {
    const assignedProds = products.filter(p => productIds.includes(p.id));
    return assignedProds.slice(0, 4);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-gray-900 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center shadow-sm">
            <Layers className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center space-x-2">
              <span>Collections</span>
              <span className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full font-semibold">
                {collections.length} Collections
              </span>
            </h1>
            <p className="text-xs text-gray-500">Organize and group products into catalog collections</p>
          </div>
        </div>

        <button
          onClick={onAddCollectionClick}
          className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Collection</span>
        </button>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Total Collections</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">
              {isLoadingCollections ? '...' : `${collections.length} Collections`}
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">Active in online store</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Assigned Products</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">
              {isLoadingCollections ? '...' : `${totalAssignedProducts} Products Linked`}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Grouped under collections</div>
          </div>
        </div>
      </div>

      {/* Collections Content Section */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-3.5 border-b border-gray-200 bg-[#fafafa] flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collections..."
              className="w-full bg-white border border-gray-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
            />
          </div>
        </div>

        {/* Loading Spinner vs Empty State vs Grid */}
        {isLoadingCollections ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
            <Loader2 className="w-9 h-9 text-gray-900 animate-spin" />
            <p className="font-semibold text-xs text-gray-700">Fetching collections from Firebase...</p>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-1">
              <FolderPlus className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No collections found</h3>
            <p className="text-xs text-gray-500 max-w-md">
              {searchQuery 
                ? 'No collections match your search filter.' 
                : 'Create your first product collection to organize your catalog.'}
            </p>
            <button
              onClick={onAddCollectionClick}
              className="mt-2 bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Collection</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredCollections.map((col) => {
              const previewProducts = getProductPreviews(col.productIds || []);
              const count = col.productIds ? col.productIds.length : 0;

              return (
                <div 
                  key={col.id} 
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    {/* Banner Image or Icon Header */}
                    <div className="relative h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                      {col.image ? (
                        <img src={col.image} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white">
                          <Folder className="w-10 h-10 opacity-80" />
                        </div>
                      )}

                      <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-gray-200 shadow-2xs">
                        <button
                          onClick={() => onEditCollection(col)}
                          className="p-1 text-gray-700 hover:text-indigo-600 transition cursor-pointer"
                          title="Edit Collection"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete collection "${col.name}"?`)) {
                              onDeleteCollection(col.id);
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                          title="Delete Collection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Collection Title & Description */}
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition flex items-center justify-between">
                        <span>{col.name}</span>
                        <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                          {count} Product{count === 1 ? '' : 's'}
                        </span>
                      </h3>
                      {col.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{col.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Assigned Products Thumbnails Preview */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      {previewProducts.length > 0 ? (
                        previewProducts.map((p) => (
                          <img
                            key={p.id}
                            src={p.media && p.media.length > 0 ? p.media[0] : ''}
                            alt={p.title}
                            title={p.title}
                            className="w-7 h-7 rounded-lg object-cover border border-gray-200 bg-gray-100 shadow-2xs"
                          />
                        ))
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">No products assigned</span>
                      )}
                    </div>

                    <button
                      onClick={() => onEditCollection(col)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
