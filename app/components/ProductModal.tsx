'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Package, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Check, 
  Globe, 
  Store, 
  Sparkles, 
  Tag, 
  Percent, 
  Building2, 
  Layers,
  Palette
} from 'lucide-react';
import { Product, ProductStatus, ProductVariation, VariationSizeItem } from '../types';
import { useApp } from '../context/AppContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void> | void;
  initialProduct?: Product | null;
}

const COLLECTIONS = [
  'Sarees',
  'Lehengas',
  'Salwar Suits',
  'Kurtis & Tunics',
  'Western Wear',
  'Indo-Western',
  'Bridal Wear',
  'Festive Collection',
  'Accessories',
  'New Arrivals',
  'Sale'
];

const VENDORS = [
  'RS Fashions In-House',
  'Royal Weaves',
  'Silk Paradise',
  'CraftVeda',
  'Apex Textiles',
  'Heritage Fabrics',
  'Kanjivaram Guild',
  'Chanderi Crafts'
];

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const GST_OPTIONS = [0, 5, 12, 18, 28];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct
}) => {
  const { collections: userCollections = [] } = useApp();

  const allCollectionOptions = Array.from(new Set([
    ...userCollections.map(c => c.name),
    ...COLLECTIONS
  ])).filter(Boolean);

  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'variations' | 'media' | 'settings'>('basic');
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [collectionName, setCollectionName] = useState('Sarees');
  const [vendor, setVendor] = useState('RS Fashions In-House');
  const [customVendor, setCustomVendor] = useState('');

  // Pricing & Tax & Discount
  const [price, setPrice] = useState('2499');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [discountRupees, setDiscountRupees] = useState('200');
  const [gstPercentage, setGstPercentage] = useState<number>(5);

  // Inventory & SKU
  const [inventory, setInventory] = useState('50');
  const [sku, setSku] = useState('');

  // Variations (Color & Respective Sizes & Prices)
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#b91c1c');

  // Media Uploads
  const [media, setMedia] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Settings & Status
  const [isActive, setIsActive] = useState(true);
  const [showInOnline, setShowInOnline] = useState(true);
  const [showInOffline, setShowInOffline] = useState(true);

  // Auto-generate SKU helper
  const generateNewSku = () => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RSF-${randomCode}`;
  };

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

  // Populate or reset form
  useEffect(() => {
    if (initialProduct) {
      setTitle(initialProduct.title || '');
      setShortDescription(initialProduct.shortDescription || '');
      setLongDescription(initialProduct.longDescription || '');
      setCollectionName(initialProduct.collection || 'Sarees');
      
      if (VENDORS.includes(initialProduct.vendor)) {
        setVendor(initialProduct.vendor);
        setCustomVendor('');
      } else {
        setVendor('Other');
        setCustomVendor(initialProduct.vendor || '');
      }

      setPrice(initialProduct.price ? initialProduct.price.toString() : '0');
      setCompareAtPrice(initialProduct.compareAtPrice ? initialProduct.compareAtPrice.toString() : '');
      setDiscountRupees(initialProduct.discountRupees ? initialProduct.discountRupees.toString() : '0');
      setGstPercentage(initialProduct.gstPercentage ?? 5);

      setInventory(initialProduct.inventory ? initialProduct.inventory.toString() : '0');
      setSku(initialProduct.sku || generateNewSku());

      setVariations(initialProduct.variations || []);
      setMedia(initialProduct.media || []);

      setIsActive(initialProduct.isActive ?? (initialProduct.status === 'Active'));
      setShowInOnline(initialProduct.showInOnline ?? true);
      setShowInOffline(initialProduct.showInOffline ?? true);
    } else {
      setTitle('');
      setShortDescription('');
      setLongDescription('');
      setCollectionName('Sarees');
      setVendor('RS Fashions In-House');
      setCustomVendor('');

      setPrice('2499');
      setCompareAtPrice('2999');
      setDiscountRupees('500');
      setGstPercentage(5);

      setInventory('25');
      setSku(generateNewSku());

      // Default sample variations for immediate demo convenience
      setVariations([
        {
          id: 'var-1',
          color: 'Crimson Red',
          colorHex: '#dc2626',
          sizes: [
            { size: 'S', price: 2499, inventory: 5 },
            { size: 'M', price: 2499, inventory: 10 },
            { size: 'L', price: 2499, inventory: 10 }
          ]
        },
        {
          id: 'var-2',
          color: 'Royal Blue',
          colorHex: '#2563eb',
          sizes: [
            { size: 'Free Size', price: 2499, inventory: 15 }
          ]
        }
      ]);

      setMedia([
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80'
      ]);

      setIsActive(true);
      setShowInOnline(true);
      setShowInOffline(true);
    }
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  // Media File Upload Handler (Base64 conversion)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setMedia(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Add Image URL Handler
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setMedia(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  // Remove Image
  const handleRemoveMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  // Variation Handlers
  const handleAddColorVariation = () => {
    if (!newColorName.trim()) return;
    const newVar: ProductVariation = {
      id: `var-${Date.now()}`,
      color: newColorName.trim(),
      colorHex: newColorHex,
      sizes: [
        { size: 'Free Size', price: parseFloat(price) || 0, inventory: 10 }
      ]
    };
    setVariations(prev => [...prev, newVar]);
    setNewColorName('');
  };

  const handleRemoveColorVariation = (varId: string) => {
    setVariations(prev => prev.filter(v => v.id !== varId));
  };

  const handleToggleSizeInVariation = (varId: string, sizeName: string) => {
    setVariations(prev => prev.map(v => {
      if (v.id !== varId) return v;
      const sizeExists = v.sizes.some(s => s.size === sizeName);
      let updatedSizes: VariationSizeItem[];
      if (sizeExists) {
        updatedSizes = v.sizes.filter(s => s.size !== sizeName);
      } else {
        updatedSizes = [
          ...v.sizes, 
          { size: sizeName, price: parseFloat(price) || 0, inventory: 5 }
        ];
      }
      return { ...v, sizes: updatedSizes };
    }));
  };

  const handleUpdateSizeDetails = (varId: string, sizeName: string, field: 'price' | 'inventory', val: number) => {
    setVariations(prev => prev.map(v => {
      if (v.id !== varId) return v;
      const updatedSizes = v.sizes.map(s => {
        if (s.size === sizeName) {
          return { ...s, [field]: val };
        }
        return s;
      });
      return { ...v, sizes: updatedSizes };
    }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    const finalVendor = vendor === 'Other' ? (customVendor.trim() || 'RS Fashions In-House') : vendor;
    const finalStatus: ProductStatus = isActive ? 'Active' : 'Draft';
    const parsedPrice = parseFloat(price) || 0;
    const parsedDiscount = parseFloat(discountRupees) || 0;

    let parsedInventory = parseInt(inventory, 10) || 0;
    if (variations && variations.length > 0) {
      let sum = 0;
      variations.forEach(v => {
        v.sizes.forEach(s => {
          sum += Number(s.inventory || 0);
        });
      });
      parsedInventory = sum;
    }

    const productPayload: Partial<Product> = {
      id: initialProduct?.id,
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      longDescription: longDescription.trim(),
      collection: collectionName,
      vendor: finalVendor,
      price: parsedPrice,
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      discountRupees: parsedDiscount,
      gstPercentage: gstPercentage,
      sku: sku.trim() || generateNewSku(),
      inventory: parsedInventory,
      variations,
      media,
      isActive,
      showInOnline,
      showInOffline,
      status: finalStatus,
      category: collectionName,
      productType: 'Fashion Apparel',
      channels: (showInOnline ? 1 : 0) + (showInOffline ? 1 : 0),
      catalogs: 1,
      imageBgColor: 'bg-emerald-500',
      iconName: 'package'
    };

    try {
      await onSave(productPayload);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150 cursor-default flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-[#fcfcfc]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <span>{initialProduct ? 'Edit Product' : 'Add New Product'}</span>
                {initialProduct && (
                  <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
                    ID: {initialProduct.id}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500">Configure product details, variations, media, pricing & inventory</p>
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

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50/70 px-6 flex items-center space-x-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'basic', label: 'Basic Details', icon: Package },
            { id: 'pricing', label: 'Pricing & Taxes', icon: Percent },
            { id: 'variations', label: `Variations (${variations.length})`, icon: Palette },
            { id: 'media', label: `Media (${media.length})`, icon: ImageIcon },
            { id: 'settings', label: 'Channels & Status', icon: Globe }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${
                  isSelected 
                    ? 'border-[#1a1a1a] text-gray-900 font-bold bg-white rounded-t-lg border-t border-x border-gray-200 -mb-px' 
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-gray-900' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Royal Silk Kanjivaram Saree"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition shadow-xs"
                />
              </div>

              {/* Vendor & Collection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-gray-500" />
                    <span>Vendor</span>
                  </label>
                  <select
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition cursor-pointer shadow-xs"
                  >
                    {VENDORS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                    <option value="Other">+ Add Custom Vendor...</option>
                  </select>

                  {vendor === 'Other' && (
                    <input
                      type="text"
                      value={customVendor}
                      onChange={(e) => setCustomVendor(e.target.value)}
                      placeholder="Enter Custom Vendor Name"
                      className="mt-2 w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-gray-500" />
                    <span>Collection</span>
                  </label>
                  <select
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition cursor-pointer shadow-xs"
                  >
                    {allCollectionOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief tagline for product cards (e.g. Handwoven pure silk with zari embroidery)"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition shadow-xs"
                />
              </div>

              {/* Long Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Long Description
                </label>
                <textarea
                  rows={4}
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  placeholder="Detailed product information, fabric specs, care instructions, origin, craftsmanship details..."
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition shadow-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRICING, TAXES & INVENTORY */}
          {activeTab === 'pricing' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Price & Compare At Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Product Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-500">₹</span>
                    <input
                      type="number"
                      step="1"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="2499"
                      className="w-full bg-white border border-gray-300 rounded-xl pl-7 pr-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Compare at Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-500">₹</span>
                    <input
                      type="number"
                      step="1"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      placeholder="2999"
                      className="w-full bg-white border border-gray-300 rounded-xl pl-7 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Available Discount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-emerald-600">₹</span>
                    <input
                      type="number"
                      step="1"
                      value={discountRupees}
                      onChange={(e) => setDiscountRupees(e.target.value)}
                      placeholder="500"
                      className="w-full bg-white border border-gray-300 rounded-xl pl-7 pr-3 py-2 text-xs font-semibold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* GST Percentage */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                <label className="block text-xs font-semibold text-gray-700">
                  GST Percentage (%)
                </label>
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  {GST_OPTIONS.map((rate) => (
                    <label
                      key={rate}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                        gstPercentage === rate
                          ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gstPercentage"
                        checked={gstPercentage === rate}
                        onChange={() => setGstPercentage(rate)}
                        className="sr-only"
                      />
                      <span>{rate}% GST</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Inventory & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                    <span>SKU ID (Auto generated & unique)</span>
                    <button
                      type="button"
                      onClick={() => setSku(generateNewSku())}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 font-medium cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-generate</span>
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="RSF-892102"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Inventory Stock Count
                  </label>
                  <input
                    type="number"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                    placeholder="25"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VARIATIONS (Color & Respective Sizes & Prices) */}
          {activeTab === 'variations' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-900 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Color & Respective Size Variations:</span> Add main color options (e.g. Crimson Red, Royal Blue). Under each color, select applicable sizes (S, M, L, XL, Free Size) and configure specific prices & inventory.
                </div>
              </div>

              {/* Add New Color Variation Control */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
                  <Palette className="w-3.5 h-3.5 text-gray-700" />
                  <span>Add New Color Variation</span>
                </h4>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="Color Name (e.g. Emerald Green, Dusty Pink)"
                      className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddColorVariation}
                    className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Color</span>
                  </button>
                </div>
              </div>

              {/* Variations List */}
              <div className="space-y-4">
                {variations.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-xl text-gray-500 text-xs">
                    No variations added yet. Add a color variation above to specify sizes & prices.
                  </div>
                ) : (
                  variations.map((v) => (
                    <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <div className="flex items-center space-x-2">
                          <span 
                            className="w-4 h-4 rounded-full border border-gray-300 shadow-xs inline-block" 
                            style={{ backgroundColor: v.colorHex || '#999' }}
                          />
                          <span className="font-bold text-xs text-gray-900">{v.color}</span>
                          <span className="text-[11px] text-gray-500 font-medium">
                            ({v.sizes.length} size{v.sizes.length === 1 ? '' : 's'})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveColorVariation(v.id)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded-lg text-xs transition cursor-pointer flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Color</span>
                        </button>
                      </div>

                      {/* Select Sizes */}
                      <div>
                        <span className="block text-[11px] font-semibold text-gray-600 mb-1">
                          Select Available Sizes for {v.color}:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {STANDARD_SIZES.map((sizeName) => {
                            const isSelected = v.sizes.some(s => s.size === sizeName);
                            return (
                              <button
                                key={sizeName}
                                type="button"
                                onClick={() => handleToggleSizeInVariation(v.id, sizeName)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                                  isSelected 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {sizeName}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Size Price & Inventory Matrix */}
                      {v.sizes.length > 0 && (
                        <div className="bg-gray-50/60 p-3 rounded-lg border border-gray-100 space-y-2">
                          <span className="block text-[11px] font-bold text-gray-700">
                            Size Prices & Stock Overrides:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {v.sizes.map((s) => (
                              <div key={s.size} className="bg-white border border-gray-200 p-2 rounded-lg flex items-center justify-between text-xs gap-2">
                                <span className="font-bold text-gray-800 w-16">{s.size}</span>

                                <div className="flex items-center space-x-1 flex-1">
                                  <span className="text-[11px] text-gray-400 font-bold">₹</span>
                                  <input
                                    type="number"
                                    value={s.price ?? price}
                                    onChange={(e) => handleUpdateSizeDetails(v.id, s.size, 'price', parseFloat(e.target.value) || 0)}
                                    placeholder="Price"
                                    className="w-full bg-white border border-gray-300 rounded-md px-2 py-0.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                                  />
                                </div>

                                <div className="flex items-center space-x-1 w-20">
                                  <span className="text-[10px] text-gray-400">Qty:</span>
                                  <input
                                    type="number"
                                    value={s.inventory ?? 5}
                                    onChange={(e) => handleUpdateSizeDetails(v.id, s.size, 'inventory', parseInt(e.target.value, 10) || 0)}
                                    className="w-full bg-white border border-gray-300 rounded-md px-1.5 py-0.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA UPLOAD */}
          {activeTab === 'media' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* File Upload Box */}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-gray-900 transition bg-gray-50/50 relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-semibold text-gray-800">
                    Click or drag & drop product images here to upload
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Supports PNG, JPG, WEBP, GIF (Multiple files allowed)
                  </div>
                </div>
              </div>

              {/* Add Image URL Option */}
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Or paste image URL (e.g. https://example.com/image.jpg)"
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Add URL
                </button>
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {media.map((imgSrc, idx) => (
                  <div 
                    key={idx} 
                    className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100 shadow-xs"
                  >
                    <img
                      src={imgSrc}
                      alt={`Product media ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-[#1a1a1a] text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        Main Thumbnail
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(idx)}
                      className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CHANNELS & STATUS */}
          {activeTab === 'settings' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Active Toggle (Yes / No) */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Product Active Status</h4>
                  <p className="text-[11px] text-gray-500">Set whether this product is Active or Draft in catalog</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {isActive ? 'Active (Yes)' : 'Draft (No)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                      isActive ? 'bg-emerald-600 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>

              {/* Show in Online / Offline Checkboxes */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-gray-900">Sales Channels Visibility</h4>

                <label className="flex items-center space-x-3 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInOnline}
                    onChange={(e) => setShowInOnline(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                  />
                  <Globe className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Show in Online Store</span>
                    <span className="text-[11px] text-gray-500">Make product available on e-commerce website & mobile app</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInOffline}
                    onChange={(e) => setShowInOffline(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                  />
                  <Store className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Show in Offline POS / Retail Store</span>
                    <span className="text-[11px] text-gray-500">Make product accessible in retail counter & POS inventory</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between bg-white sticky bottom-0">
            <div className="text-xs text-gray-500 font-medium hidden sm:block">
              {sku && <span>SKU: <strong className="font-mono">{sku}</strong></span>}
            </div>

            <div className="flex items-center space-x-2 ml-auto">
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
                <span>{isSaving ? 'Saving to Firebase...' : 'Save Product'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
