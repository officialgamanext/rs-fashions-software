'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  FolderPlus, 
  Search, 
  Check, 
  Upload, 
  Package, 
  Image as ImageIcon, 
  Layers 
} from 'lucide-react';
import { Collection, Product } from '../types';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collection: Partial<Collection>, selectedProductIds: string[]) => Promise<void> | void;
  initialCollection?: Collection | null;
  products: Product[];
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCollection,
  products
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (initialCollection) {
      setName(initialCollection.name || '');
      setDescription(initialCollection.description || '');
      setImage(initialCollection.image || '');
      setSelectedProductIds(initialCollection.productIds || []);
    } else {
      setName('');
      setDescription('');
      setImage('');
      // Auto-preselect products that currently have collection matching title if any
      setSelectedProductIds([]);
    }
  }, [initialCollection, isOpen]);

  if (!isOpen) return null;

  // Filter products by search query
  const filteredProducts = products.filter(p =>
    (p.title || '').toLowerCase().includes(searchProductQuery.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(searchProductQuery.toLowerCase())
  );

  const toggleSelectProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    } else {
      setSelectedProductIds(prev => [...prev, productId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  // Image Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave(
        {
          id: initialCollection?.id,
          name: name.trim(),
          description: description.trim(),
          image,
          status: 'Active'
        },
        selectedProductIds
      );
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 cursor-pointer overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150 cursor-default flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-[#fcfcfc]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center shadow-sm">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {initialCollection ? 'Edit Collection' : 'Create New Collection'}
              </h2>
              <p className="text-xs text-gray-500">Group products together into a catalog collection</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Collection Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Collection Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Festival Silk Sarees 2026, Festive Lehengas, Designer Kurtis..."
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition shadow-xs font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description summarizing this collection for customers..."
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition shadow-xs"
            />
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Collection Image / Banner
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {image ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0 shadow-xs">
                  <img src={image} alt="Collection preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md text-xs cursor-pointer shadow-xs"
                    title="Remove Image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 text-center flex-1 hover:border-gray-900 transition bg-gray-50/50 relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-gray-700">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>Upload Collection Image</span>
                  </div>
                </div>
              )}

              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Or paste image URL"
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (imageUrlInput.trim()) {
                      setImage(imageUrlInput.trim());
                      setImageUrlInput('');
                    }
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0"
                >
                  Set URL
                </button>
              </div>
            </div>
          </div>

          {/* Product Selection List Section */}
          <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Assign Products to Collection ({selectedProductIds.length} Selected)</span>
                </h4>
                <p className="text-[11px] text-gray-500">Select the products you want to include in this collection</p>
              </div>

              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold bg-white border border-indigo-200 px-3 py-1 rounded-lg transition cursor-pointer self-start sm:self-auto shadow-2xs"
              >
                {selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0
                  ? 'Deselect All'
                  : 'Select All Filtered'}
              </button>
            </div>

            {/* Product Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchProductQuery}
                onChange={(e) => setSearchProductQuery(e.target.value)}
                placeholder="Search products by title or SKU..."
                className="w-full bg-white border border-gray-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
              />
            </div>

            {/* Products List Checklist */}
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl bg-white divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  {products.length === 0 ? 'No products available in database.' : 'No products match your search.'}
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  return (
                    <label
                      key={product.id}
                      className={`flex items-center justify-between p-2.5 hover:bg-gray-50 transition cursor-pointer select-none ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(product.id)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                        />
                        {product.media && product.media.length > 0 ? (
                          <img
                            src={product.media[0]}
                            alt={product.title}
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0 bg-gray-100"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-semibold text-gray-900 block">{product.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono">SKU: {product.sku || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="text-xs font-bold text-gray-800">
                        ₹{product.price ? product.price.toLocaleString('en-IN') : '0'}
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-2 bg-white sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-6 py-2 rounded-xl transition flex items-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saving Collection...' : 'Save Collection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
