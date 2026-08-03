'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Save,
  Package,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  RefreshCw,
  Globe,
  Store,
  Sparkles,
  Tag,
  Percent,
  Building2,
  Palette,
  ExternalLink,
  Loader2,
  Barcode,
  Copy,
  Hash,
  CheckCheck,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { Product, ProductStatus, ProductVariation, VariationSizeItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateBarcodeDataUrl, generateRSFNumericBarcode, extractUsedBarcodes } from '../../lib/barcodeService';
import { uploadImageToImageKit } from '../../lib/imagekitService';

const COLLECTIONS = [
  'Formal Shirts', 'Casual Shirts', 'T-Shirts & Polos', 'Trousers & Chinos', 'Jeans & Denim',
  'Suits & Blazers', 'Kurtas & Ethnic Wear', 'Sherwanis & Indo-Western', 'Jackets & Outerwear', 'Sweaters & Hoodies',
  'Sarees', 'Lehengas', 'Salwar Suits', 'Kurtis & Tunics', 'Western Wear',
  'Indo-Western', 'Bridal Wear', 'Festive Collection', 'Accessories', 'New Arrivals', 'Sale'
];
const VENDORS = [
  'RS Fashions In-House', 'Royal Weaves', 'Silk Paradise', 'CraftVeda',
  'Apex Textiles', 'Heritage Fabrics', 'Kanjivaram Guild', 'Chanderi Crafts'
];
const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const GST_OPTIONS = [0, 5, 12, 18, 28];

// ─── Generators ───────────────────────────────────────────────────────────────

function generateProductSku(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `RSF-${code}`;
}
function generateProductId(): string {
  const hex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `PROD-${hex}`;
}
function generateVariantSku(parentSku: string, colorName: string): string {
  const c = colorName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5);
  return `${parentSku}-${c || 'VAR'}`;
}
function generateVariantProductId(): string {
  const hex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `VAR-${hex}`;
}
function generateSizeSku(variantSku: string, sizeName: string): string {
  const s = sizeName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
  return `${variantSku}-${s || 'SZ'}`;
}
function generateSizeProductId(): string {
  const hex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `SZE-${hex}`;
}

// ─── CopyBadge ────────────────────────────────────────────────────────────────

function CopyBadge({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      title={`Copy ${label}`}
      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[10px] font-mono text-gray-700 font-semibold hover:bg-gray-200 transition cursor-pointer"
    >
      {copied ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
      <span className={copied ? 'text-emerald-600' : ''}>{value}</span>
    </button>
  );
}

// ─── BarcodePreview ───────────────────────────────────────────────────────────

function BarcodePreview({ code }: { code: string }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!code) { setDataUrl(''); return; }
    // generateBarcodeDataUrl is browser-only
    const url = generateBarcodeDataUrl(code);
    setDataUrl(url);
  }, [code]);

  if (!dataUrl) return null;

  return (
    <img
      src={dataUrl}
      alt={`Barcode: ${code}`}
      className="max-w-[180px] rounded border border-gray-200 shadow-xs bg-white"
    />
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function AddProductPage() {
  const router = useRouter();
  const { collections: userCollections = [], products = [], handleSaveProduct } = useApp();

  const allCollectionOptions = Array.from(new Set([
    ...userCollections.map(c => c.name),
    ...COLLECTIONS
  ])).filter(Boolean);

  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'variations' | 'media' | 'settings'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [savingStatusText, setSavingStatusText] = useState('');

  // Basic
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [collectionName, setCollectionName] = useState('Sarees');
  const [vendor, setVendor] = useState('RS Fashions In-House');
  const [customVendor, setCustomVendor] = useState('');

  // Pricing
  const [price, setPrice] = useState('2499');
  const [compareAtPrice, setCompareAtPrice] = useState('2999');
  const [discountRupees, setDiscountRupees] = useState('500');
  const [gstPercentage, setGstPercentage] = useState<number>(5);

  // IDs & inventory
  const initSku = generateProductSku();
  const initProdId = generateProductId();
  const [sku, setSku] = useState(initSku);
  const [productId, setProductId] = useState(initProdId);
  const [inventory, setInventory] = useState('25');

  // Variations
  const [variations, setVariations] = useState<ProductVariation[]>(() => {
    const s1 = initSku;
    const var1Sku = generateVariantSku(s1, 'Crimson Red');
    const var2Sku = generateVariantSku(s1, 'Royal Blue');
    return [
      {
        id: 'var-1', sku: var1Sku, productId: generateVariantProductId(),
        color: 'Crimson Red', colorHex: '#dc2626',
        sizes: [
          { size: 'S', sku: generateSizeSku(var1Sku, 'S'), productId: generateSizeProductId(), price: 2499, inventory: 5 },
          { size: 'M', sku: generateSizeSku(var1Sku, 'M'), productId: generateSizeProductId(), price: 2499, inventory: 10 },
          { size: 'L', sku: generateSizeSku(var1Sku, 'L'), productId: generateSizeProductId(), price: 2499, inventory: 10 },
        ]
      },
      {
        id: 'var-2', sku: var2Sku, productId: generateVariantProductId(),
        color: 'Royal Blue', colorHex: '#2563eb',
        sizes: [
          { size: 'Free Size', sku: generateSizeSku(var2Sku, 'Free Size'), productId: generateSizeProductId(), price: 2499, inventory: 15 }
        ]
      }
    ];
  });
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#b91c1c');

  // Media
  const [media, setMedia] = useState<string[]>([
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80'
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Settings
  const [isActive, setIsActive] = useState(true);
  const [showInOnline, setShowInOnline] = useState(true);
  const [showInOffline, setShowInOffline] = useState(true);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setMedia(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setMedia(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleAddColorVariation = () => {
    if (!newColorName.trim()) return;
    const currentSku = sku.trim() || generateProductSku();
    const varSku = generateVariantSku(currentSku, newColorName.trim());
    const newVar: ProductVariation = {
      id: `var-${Date.now()}`,
      sku: varSku,
      productId: generateVariantProductId(),
      color: newColorName.trim(),
      colorHex: newColorHex,
      sizes: [{
        size: 'Free Size',
        sku: generateSizeSku(varSku, 'Free Size'),
        productId: generateSizeProductId(),
        price: parseFloat(price) || 0,
        inventory: 10
      }]
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
      const varSku = v.sku || generateVariantSku(sku, v.color);
      const updatedSizes = sizeExists
        ? v.sizes.filter(s => s.size !== sizeName)
        : [...v.sizes, {
            size: sizeName,
            sku: generateSizeSku(varSku, sizeName),
            productId: generateSizeProductId(),
            price: parseFloat(price) || 0,
            inventory: 5
          }];
      return { ...v, sizes: updatedSizes };
    }));
  };

  const handleUpdateSizeDetails = (varId: string, sizeName: string, field: 'price' | 'inventory', val: number) => {
    setVariations(prev => prev.map(v => {
      if (v.id !== varId) return v;
      return { ...v, sizes: v.sizes.map(s => s.size === sizeName ? { ...s, [field]: val } : s) };
    }));
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    setSavingStatusText('Preparing product...');

    const finalVendor = vendor === 'Other' ? (customVendor.trim() || 'RS Fashions In-House') : vendor;
    const finalStatus: ProductStatus = isActive ? 'Active' : 'Draft';
    const parsedPrice = parseFloat(price) || 0;
    const parsedDiscount = parseFloat(discountRupees) || 0;
    const parsedInventory = variations.length > 0
      ? variations.reduce((sum, v) => sum + v.sizes.reduce((s2, s) => s2 + Number(s.inventory || 0), 0), 0)
      : parseInt(inventory, 10) || 0;

    const currentSku = sku.trim() || generateProductSku();
    const currentProductId = productId.trim() || generateProductId();
    let finalMedia = [...media];
    let finalVariations = [...variations];

    // Upload product images → ImageKit
    if (media.length > 0) {
      setSavingStatusText('Uploading product images to ImageKit...');
      const uploaded: string[] = [];
      for (let i = 0; i < media.length; i++) {
        const ikUrl = await uploadImageToImageKit(media[i], `product-${currentProductId}-img-${i + 1}.jpg`, '/product-images');
        uploaded.push(ikUrl);
      }
      finalMedia = uploaded;
    }

    // Generate & upload per-variant and per-size barcodes → ImageKit
    if (variations.length > 0) {
      setSavingStatusText('Generating & uploading barcodes to ImageKit...');
      const { usedBarcodes, maxCounter } = extractUsedBarcodes(products);
      const barcodeCounterRef = { value: maxCounter };
      const updatedVars: ProductVariation[] = [];

      for (let i = 0; i < variations.length; i++) {
        const v = variations[i];
        const varSku = v.sku || generateVariantSku(currentSku, v.color);
        const varProductId = v.productId || generateVariantProductId();
        const varBarcodeCode = (v.barcode && /^RSF-\d+$/i.test(v.barcode)) ? v.barcode : generateRSFNumericBarcode(usedBarcodes, barcodeCounterRef);

        const varBarcodeDataUrl = generateBarcodeDataUrl(varBarcodeCode);
        let varBarcodeUrl = v.barcodeUrl || '';
        if (varBarcodeDataUrl) {
          varBarcodeUrl = await uploadImageToImageKit(varBarcodeDataUrl, `barcode-${currentProductId}-var-${i + 1}.png`, '/barcodes');
        }

        const updatedSizes: VariationSizeItem[] = [];
        for (const s of v.sizes) {
          const sizeSku = s.sku || generateSizeSku(varSku, s.size);
          const sizeProductId = s.productId || generateSizeProductId();
          const sizeBarcodeCode = (s.barcode && /^RSF-\d+$/i.test(s.barcode)) ? s.barcode : generateRSFNumericBarcode(usedBarcodes, barcodeCounterRef);
          const sizeBarcodeDataUrl = generateBarcodeDataUrl(sizeBarcodeCode);
          let sizeBarcodeUrl = s.barcodeUrl || '';
          if (sizeBarcodeDataUrl) {
            const cleanSize = s.size.toUpperCase().replace(/[^A-Z0-9]/g, '');
            sizeBarcodeUrl = await uploadImageToImageKit(sizeBarcodeDataUrl, `barcode-${currentProductId}-var-${i + 1}-${cleanSize}.png`, '/barcodes');
          }
          updatedSizes.push({ ...s, sku: sizeSku, productId: sizeProductId, barcode: sizeBarcodeCode, barcodeUrl: sizeBarcodeUrl });
        }

        updatedVars.push({ ...v, sku: varSku, productId: varProductId, barcode: varBarcodeCode, barcodeUrl: varBarcodeUrl, sizes: updatedSizes });
      }
      finalVariations = updatedVars;
    }

    setSavingStatusText('Saving to Firebase...');
    try {
      await handleSaveProduct({
        id: currentProductId,
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        longDescription: longDescription.trim(),
        collection: collectionName,
        vendor: finalVendor,
        price: parsedPrice,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        discountRupees: parsedDiscount,
        gstPercentage,
        sku: currentSku,
        inventory: parsedInventory,
        variations: finalVariations,
        media: finalMedia,
        isActive, showInOnline, showInOffline,
        status: finalStatus,
        category: collectionName,
        productType: 'Fashion Apparel',
        channels: (showInOnline ? 1 : 0) + (showInOffline ? 1 : 0),
        catalogs: 1,
        imageBgColor: 'bg-emerald-500',
        iconName: 'package'
      });
      router.push('/products');
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setIsSaving(false);
      setSavingStatusText('');
    }
  };

  // ─── Computed ────────────────────────────────────────────────────────────────

  const totalInventory = variations.length > 0
    ? variations.reduce((sum, v) => sum + v.sizes.reduce((s2, s) => s2 + Number(s.inventory || 0), 0), 0)
    : parseInt(inventory, 10) || 0;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-0">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition cursor-pointer"
            title="Back to Products"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className="hover:text-gray-800 cursor-pointer" onClick={() => router.push('/products')}>Products</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-gray-900">Add New Product</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Live SKU + ID display */}
          <div className="hidden sm:flex items-center gap-2 text-[11px]">
            {sku && (
              <span className="font-mono font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                SKU: {sku}
              </span>
            )}
            {productId && (
              <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center space-x-1">
                <Hash className="w-3 h-3" />
                <span>{productId}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.push('/products')}
            disabled={isSaving}
            className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit as any}
            disabled={isSaving || !title.trim()}
            className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-5 py-2 rounded-xl transition flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSaving
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>{savingStatusText || 'Saving...'}</span></>
              : <><Save className="w-4 h-4" /><span>Save Product</span></>
            }
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 bg-[#f1f1f1] min-h-[calc(100vh-120px)]">

        {/* Saving progress banner */}
        {isSaving && savingStatusText && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center space-x-3 text-xs text-indigo-800 font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>{savingStatusText}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Tab Navigation ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50/70 px-4 flex items-center space-x-1 overflow-x-auto text-xs font-semibold">
              {[
                { id: 'basic', label: 'Basic Details', icon: Package },
                { id: 'pricing', label: 'Pricing & Taxes', icon: Percent },
                { id: 'variations', label: `Variations (${variations.length})`, icon: Palette },
                { id: 'media', label: `Media (${media.length})`, icon: ImageIcon },
                { id: 'settings', label: 'Channels & Status', icon: Globe }
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3.5 px-4 border-b-2 flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'border-[#1a1a1a] text-gray-900 font-bold bg-white -mb-px rounded-t-lg border-t border-x border-gray-200'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-gray-900' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6 space-y-5">

              {/* ── TAB: BASIC DETAILS ── */}
              {activeTab === 'basic' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" required value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Royal Silk Kanjivaram Saree"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition shadow-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-500" /><span>Vendor</span>
                      </label>
                      <select value={vendor} onChange={e => setVendor(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition cursor-pointer shadow-xs"
                      >
                        {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
                        <option value="Other">+ Add Custom Vendor...</option>
                      </select>
                      {vendor === 'Other' && (
                        <input type="text" value={customVendor} onChange={e => setCustomVendor(e.target.value)}
                          placeholder="Enter Custom Vendor Name"
                          className="mt-2 w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                        <Tag className="w-3.5 h-3.5 text-gray-500" /><span>Collection</span>
                      </label>
                      <select value={collectionName} onChange={e => setCollectionName(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition cursor-pointer shadow-xs"
                      >
                        {allCollectionOptions.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Short Description</label>
                    <input type="text" value={shortDescription} onChange={e => setShortDescription(e.target.value)}
                      placeholder="Brief tagline for product cards"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Long Description</label>
                    <textarea rows={5} value={longDescription} onChange={e => setLongDescription(e.target.value)}
                      placeholder="Detailed product information, fabric specs, care instructions..."
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* ── TAB: PRICING ── */}
              {activeTab === 'pricing' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
                    {[
                      { label: 'Product Price (₹)', value: price, setter: setPrice, color: 'text-gray-500', required: true },
                      { label: 'Compare at Price (₹)', value: compareAtPrice, setter: setCompareAtPrice, color: 'text-gray-500', required: false },
                      { label: 'Available Discount (₹)', value: discountRupees, setter: setDiscountRupees, color: 'text-emerald-600', required: false }
                    ].map(({ label, value, setter, color, required }) => (
                      <div key={label}>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">{label}{required && <span className="text-red-500"> *</span>}</label>
                        <div className="relative">
                          <span className={`absolute left-3 top-2.5 text-xs font-bold ${color}`}>₹</span>
                          <input type="number" step="1" value={value} onChange={e => setter(e.target.value)} required={required}
                            className="w-full bg-white border border-gray-300 rounded-xl pl-7 pr-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">GST Percentage (%)</label>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                      {GST_OPTIONS.map(rate => (
                        <label key={rate} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                          gstPercentage === rate ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}>
                          <input type="radio" name="gst" checked={gstPercentage === rate} onChange={() => setGstPercentage(rate)} className="sr-only" />
                          <span>{rate}% GST</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Product ID, SKU & Inventory */}
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-4">
                    {/* Product ID */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                          <Hash className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Product ID (Firestore Document ID)</span>
                        </span>
                        <button type="button" onClick={() => setProductId(generateProductId())}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 font-medium cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /><span>Re-generate</span>
                        </button>
                      </label>
                      <div className="flex items-center space-x-2">
                        <input type="text" value={productId} onChange={e => setProductId(e.target.value)}
                          className="flex-1 bg-indigo-50 border border-indigo-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-xs"
                        />
                        <button type="button" onClick={() => navigator.clipboard.writeText(productId)}
                          className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition cursor-pointer" title="Copy Product ID"
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                          <span>SKU ID</span>
                          <button type="button" onClick={() => setSku(generateProductSku())}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 font-medium cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" /><span>Re-generate</span>
                          </button>
                        </label>
                        <input type="text" required value={sku} onChange={e => setSku(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Inventory Stock Count
                          {variations.length > 0 && <span className="ml-1 text-[10px] font-normal text-gray-400">(auto-sum: {totalInventory})</span>}
                        </label>
                        <input type="number" value={variations.length > 0 ? totalInventory : inventory}
                          readOnly={variations.length > 0}
                          onChange={e => setInventory(e.target.value)}
                          className={`w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-xs ${variations.length > 0 ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: VARIATIONS ── */}
              {activeTab === 'variations' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-900 flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Auto-IDs & Barcodes:</span> Each color variant and size gets a unique <strong>SKU</strong>, <strong>Product ID</strong>, and <strong>Barcode</strong> — previewed here and uploaded to ImageKit on Save.
                    </div>
                  </div>

                  {/* Add New Color */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
                      <Palette className="w-3.5 h-3.5 text-gray-700" /><span>Add New Color Variation</span>
                    </h4>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex items-center space-x-2 flex-1">
                        <input type="color" value={newColorHex} onChange={e => setNewColorHex(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                        />
                        <input type="text" value={newColorName} onChange={e => setNewColorName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddColorVariation())}
                          placeholder="Color Name (e.g. Emerald Green)"
                          className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                      <button type="button" onClick={handleAddColorVariation}
                        className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" /><span>Add Color</span>
                      </button>
                    </div>
                  </div>

                  {/* Variants List */}
                  <div className="space-y-5">
                    {variations.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-xs">
                        No variations added yet. Add a color variation above.
                      </div>
                    ) : (
                      variations.map((v, vi) => {
                        const varBarcodeCode = v.barcode || v.sku || generateVariantSku(sku, v.color);
                        return (
                          <div key={v.id} className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
                            {/* Variant header */}
                            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-start justify-between gap-2">
                              <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <span className="w-4 h-4 rounded-full border border-gray-300 shadow-xs shrink-0"
                                    style={{ backgroundColor: v.colorHex || '#999' }}
                                  />
                                  <span className="font-bold text-sm text-gray-900">{v.color}</span>
                                  <span className="text-[11px] text-gray-500">({v.sizes.length} size{v.sizes.length !== 1 ? 's' : ''})</span>
                                </div>
                                {/* IDs */}
                                <div className="flex flex-wrap gap-1.5">
                                  {v.sku && <CopyBadge label="Variant SKU" value={v.sku} />}
                                  {v.productId && (
                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-mono text-indigo-700 font-semibold">
                                      <Hash className="w-2.5 h-2.5" /><span>{v.productId}</span>
                                    </span>
                                  )}
                                  {v.barcodeUrl && (
                                    <a href={v.barcodeUrl} target="_blank" rel="noreferrer"
                                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-medium text-blue-700 hover:bg-blue-100 transition"
                                    >
                                      <ExternalLink className="w-3 h-3" /><span>ImageKit Barcode</span>
                                    </a>
                                  )}
                                </div>
                                {/* Barcode Preview */}
                                <div className="mt-1">
                                  <span className="block text-[10px] text-gray-500 mb-1 flex items-center space-x-1">
                                    <Barcode className="w-3 h-3" />
                                    <span>Barcode: <strong className="font-mono text-gray-700">{varBarcodeCode}</strong></span>
                                  </span>
                                  <BarcodePreview code={varBarcodeCode} />
                                </div>
                              </div>
                              <button type="button" onClick={() => handleRemoveColorVariation(v.id)}
                                className="text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg text-xs transition cursor-pointer flex items-center space-x-1 shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" /><span>Remove</span>
                              </button>
                            </div>

                            {/* Sizes section */}
                            <div className="p-4 space-y-3">
                              <div>
                                <span className="block text-[11px] font-semibold text-gray-600 mb-2">Select Sizes for {v.color}:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {STANDARD_SIZES.map(sizeName => {
                                    const isSelected = v.sizes.some(s => s.size === sizeName);
                                    return (
                                      <button key={sizeName} type="button" onClick={() => handleToggleSizeInVariation(v.id, sizeName)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                        }`}
                                      >
                                        {sizeName}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Size matrix */}
                              {v.sizes.length > 0 && (
                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 space-y-2">
                                  <span className="block text-[11px] font-bold text-gray-700">Size Details (SKU · Product ID · Barcode · Price · Stock):</span>
                                  <div className="space-y-2">
                                    {v.sizes.map(s => {
                                      const sizeBarcodeCode = s.barcode || s.sku || generateSizeSku(v.sku || '', s.size);
                                      return (
                                        <div key={s.size} className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
                                          {/* Size header row */}
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="font-bold text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{s.size}</span>
                                            {s.sku && <CopyBadge label="Size SKU" value={s.sku} />}
                                            {s.productId && (
                                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-[10px] font-mono text-purple-700 font-semibold">
                                                <Hash className="w-2.5 h-2.5" /><span>{s.productId}</span>
                                              </span>
                                            )}
                                            {s.barcodeUrl && (
                                              <a href={s.barcodeUrl} target="_blank" rel="noreferrer"
                                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] text-blue-700 hover:bg-blue-100 transition"
                                              >
                                                <ExternalLink className="w-2.5 h-2.5" /><span>Barcode</span>
                                              </a>
                                            )}
                                          </div>

                                          {/* Barcode preview for this size */}
                                          <div>
                                            <span className="text-[10px] text-gray-500 flex items-center space-x-1 mb-1">
                                              <Barcode className="w-3 h-3" />
                                              <span className="font-mono font-semibold text-gray-600">{sizeBarcodeCode}</span>
                                            </span>
                                            <BarcodePreview code={sizeBarcodeCode} />
                                          </div>

                                          {/* Price & Qty inputs */}
                                          <div className="flex items-center gap-3">
                                            <div className="flex items-center space-x-1 flex-1">
                                              <span className="text-xs text-gray-400 font-bold">₹</span>
                                              <input type="number" value={s.price ?? price}
                                                onChange={e => handleUpdateSizeDetails(v.id, s.size, 'price', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                                              />
                                            </div>
                                            <div className="flex items-center space-x-1 w-28">
                                              <span className="text-[10px] text-gray-400 whitespace-nowrap">Qty:</span>
                                              <input type="number" value={s.inventory ?? 5}
                                                onChange={e => handleUpdateSizeDetails(v.id, s.size, 'inventory', parseInt(e.target.value, 10) || 0)}
                                                className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB: MEDIA ── */}
              {activeTab === 'media' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-start space-x-2">
                    <Upload className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Images are uploaded to <strong>ImageKit</strong> automatically on save. Only the returned CDN URL is stored in Firebase.</span>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-900 transition bg-gray-50/50 relative cursor-pointer">
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div className="text-sm font-semibold text-gray-800">Click or drag & drop product images</div>
                      <div className="text-xs text-gray-400">PNG, JPG, WEBP, GIF — Multiple files allowed</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="url" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)}
                      placeholder="Or paste image URL..."
                      className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <button type="button" onClick={handleAddImageUrl}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {media.map((imgSrc, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100 shadow-xs">
                        <img src={imgSrc} alt={`Product media ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-[#1a1a1a] text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">Main</span>
                        )}
                        {imgSrc.includes('ik.imagekit.io') && (
                          <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">✓ ImageKit</span>
                        )}
                        <button type="button" onClick={() => setMedia(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB: SETTINGS ── */}
              {activeTab === 'settings' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Product Active Status</h4>
                      <p className="text-[11px] text-gray-500">Active products are live in the catalog</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {isActive ? 'Active' : 'Draft'}
                      </span>
                      <button type="button" onClick={() => setIsActive(!isActive)}
                        className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${isActive ? 'bg-emerald-600 justify-end' : 'bg-gray-300 justify-start'}`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-xs">
                    <h4 className="text-xs font-bold text-gray-900">Sales Channels Visibility</h4>
                    {[
                      { label: 'Show in Online Store', desc: 'Available on e-commerce website & mobile app', icon: Globe, iconClass: 'text-blue-600', checked: showInOnline, setter: setShowInOnline },
                      { label: 'Show in Offline POS / Retail Store', desc: 'Accessible in retail counter & POS inventory', icon: Store, iconClass: 'text-purple-600', checked: showInOffline, setter: setShowInOffline }
                    ].map(({ label, desc, icon: Icon, iconClass, checked, setter }) => (
                      <label key={label} className="flex items-center space-x-3 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer">
                        <input type="checkbox" checked={checked} onChange={e => setter(e.target.checked)} className="w-4 h-4 rounded border-gray-300 cursor-pointer" />
                        <Icon className={`w-4 h-4 ${iconClass}`} />
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{label}</span>
                          <span className="text-[11px] text-gray-500">{desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── Bottom Save Bar ── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xs px-6 py-4 flex items-center justify-between">
            <div className="hidden sm:flex items-center gap-3 text-[11px]">
              <span className="text-gray-500">
                {variations.length} variation{variations.length !== 1 ? 's' : ''} · {totalInventory} total units
              </span>
              {sku && <span className="font-mono font-bold text-gray-700">SKU: {sku}</span>}
            </div>
            <div className="flex items-center space-x-2 ml-auto">
              <button type="button" onClick={() => router.push('/products')} disabled={isSaving}
                className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button type="submit" disabled={isSaving || !title.trim()}
                className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-6 py-2 rounded-xl transition flex items-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSaving
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>{savingStatusText || 'Saving...'}</span></>
                  : <><Save className="w-4 h-4" /><span>Save Product</span></>
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
