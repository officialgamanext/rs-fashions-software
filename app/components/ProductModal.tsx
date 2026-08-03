'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Palette,
  QrCode,
  ExternalLink,
  Loader2,
  Barcode,
  Copy,
  Hash,
  CheckCheck
} from 'lucide-react';
import { Product, ProductStatus, ProductVariation, VariationSizeItem } from '../types';
import { useApp } from '../context/AppContext';
import { generateBarcodeDataUrl, generateRSFNumericBarcode, extractUsedBarcodes } from '../lib/barcodeService';
import { uploadImageToImageKit } from '../lib/imagekitService';

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

// ─── ID & SKU Generators ──────────────────────────────────────────────────────

/** Generate a parent product SKU: RSF-XXXXXX (6 alphanum chars) */
function generateProductSku(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `RSF-${code}`;
}

/** Generate a pre-determined Firestore-safe Product ID: PROD-xxxxxxxxxxxxxxxx (16 hex chars) */
function generateProductId(): string {
  const hex = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `PROD-${hex}`;
}

/** Generate a variant-level SKU from parent SKU + color */
function generateVariantSku(parentSku: string, colorName: string): string {
  const cleanColor = colorName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 5);
  return `${parentSku}-${cleanColor || 'VAR'}`;
}

/** Generate a variant Product ID: VAR-xxxxxxxx */
function generateVariantProductId(): string {
  const hex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `VAR-${hex}`;
}

/** Generate a size-level SKU from variant SKU + size */
function generateSizeSku(variantSku: string, sizeName: string): string {
  const cleanSize = sizeName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
  return `${variantSku}-${cleanSize || 'SZ'}`;
}

/** Generate a size Product ID: SZE-xxxxxxxx */
function generateSizeProductId(): string {
  const hex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `SZE-${hex}`;
}

// ─── CopyBadge helper ─────────────────────────────────────────────────────────

function CopyBadge({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${label}`}
      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[10px] font-mono text-gray-700 font-semibold hover:bg-gray-200 transition cursor-pointer"
    >
      {copied ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
      <span className={copied ? 'text-emerald-600' : ''}>{value}</span>
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct
}) => {
  const { collections: userCollections = [], products = [] } = useApp();

  const { usedBarcodes, maxCounter } = extractUsedBarcodes(products);
  const barcodeCounterRef = useRef({ value: maxCounter });

  useEffect(() => {
    if (maxCounter > barcodeCounterRef.current.value) {
      barcodeCounterRef.current.value = maxCounter;
    }
  }, [maxCounter]);

  const allCollectionOptions = Array.from(new Set([
    ...userCollections.map(c => c.name),
    ...COLLECTIONS
  ])).filter(Boolean);

  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'variations' | 'media' | 'settings'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [savingStatusText, setSavingStatusText] = useState('');

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

  // Inventory & SKU & Product ID
  const [inventory, setInventory] = useState('50');
  const [sku, setSku] = useState('');
  const [productId, setProductId] = useState(''); // pre-generated Firestore doc ID

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
      setSku(initialProduct.sku || generateProductSku());
      setProductId(initialProduct.id); // existing product uses its real Firestore ID

      setVariations(initialProduct.variations || []);
      setMedia(initialProduct.media || []);

      setIsActive(initialProduct.isActive ?? (initialProduct.status === 'Active'));
      setShowInOnline(initialProduct.showInOnline ?? true);
      setShowInOffline(initialProduct.showInOffline ?? true);
    } else {
      // NEW product — pre-generate IDs
      const newSku = generateProductSku();
      const newProdId = generateProductId();

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
      setSku(newSku);
      setProductId(newProdId);

      // Default sample variations — each gets unique IDs up-front
      const var1Sku = generateVariantSku(newSku, 'Crimson Red');
      const var2Sku = generateVariantSku(newSku, 'Royal Blue');

      setVariations([
        {
          id: 'var-1',
          sku: var1Sku,
          productId: generateVariantProductId(),
          color: 'Crimson Red',
          colorHex: '#dc2626',
          sizes: [
            { size: 'S', sku: generateSizeSku(var1Sku, 'S'), productId: generateSizeProductId(), price: 2499, inventory: 5 },
            { size: 'M', sku: generateSizeSku(var1Sku, 'M'), productId: generateSizeProductId(), price: 2499, inventory: 10 },
            { size: 'L', sku: generateSizeSku(var1Sku, 'L'), productId: generateSizeProductId(), price: 2499, inventory: 10 }
          ]
        },
        {
          id: 'var-2',
          sku: var2Sku,
          productId: generateVariantProductId(),
          color: 'Royal Blue',
          colorHex: '#2563eb',
          sizes: [
            { size: 'Free Size', sku: generateSizeSku(var2Sku, 'Free Size'), productId: generateSizeProductId(), price: 2499, inventory: 15 }
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

  // ─── Media Handlers ─────────────────────────────────────────────────────────

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

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setMedia(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Variation Handlers ─────────────────────────────────────────────────────

  const handleAddColorVariation = () => {
    if (!newColorName.trim()) return;
    const currentSku = sku.trim() || generateProductSku();
    const varSku = generateVariantSku(currentSku, newColorName.trim());
    const varBarcode = generateRSFNumericBarcode(usedBarcodes, barcodeCounterRef.current);
    const sizeBarcode = generateRSFNumericBarcode(usedBarcodes, barcodeCounterRef.current);
    const newVar: ProductVariation = {
      id: `var-${Date.now()}`,
      sku: varSku,
      productId: generateVariantProductId(),
      color: newColorName.trim(),
      colorHex: newColorHex,
      barcode: varBarcode,
      sizes: [
        {
          size: 'Free Size',
          sku: generateSizeSku(varSku, 'Free Size'),
          productId: generateSizeProductId(),
          barcode: sizeBarcode,
          price: parseFloat(price) || 0,
          inventory: 10
        }
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
        const varSku = v.sku || generateVariantSku(sku, v.color);
        updatedSizes = [
          ...v.sizes,
          {
            size: sizeName,
            sku: generateSizeSku(varSku, sizeName),
            productId: generateSizeProductId(),
            barcode: generateRSFNumericBarcode(usedBarcodes, barcodeCounterRef.current),
            price: parseFloat(price) || 0,
            inventory: 5
          }
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

  // ─── Submit Handler ──────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    setSavingStatusText('');

    const finalVendor = vendor === 'Other' ? (customVendor.trim() || 'RS Fashions In-House') : vendor;
    const finalStatus: ProductStatus = isActive ? 'Active' : 'Draft';
    const parsedPrice = parseFloat(price) || 0;
    const parsedDiscount = parseFloat(discountRupees) || 0;

    // Total inventory = sum of all variant sizes (or manual if no variants)
    let parsedInventory = parseInt(inventory, 10) || 0;
    if (variations && variations.length > 0) {
      parsedInventory = variations.reduce((sum, v) =>
        sum + v.sizes.reduce((s2, s) => s2 + Number(s.inventory || 0), 0), 0
      );
    }

    const currentSku = sku.trim() || generateProductSku();
    const currentProductId = productId.trim() || generateProductId();
    let finalMedia = [...media];
    let finalVariations = [...variations];

    // ── Upload product images to ImageKit (always — both create & edit) ──────
    if (media.length > 0) {
      setSavingStatusText('Uploading product images to ImageKit...');
      const uploadedMedia: string[] = [];
      for (let i = 0; i < media.length; i++) {
        const item = media[i];
        const fileName = `product-${currentProductId}-img-${i + 1}.jpg`;
        const ikUrl = await uploadImageToImageKit(item, fileName, '/product-images');
        uploadedMedia.push(ikUrl);
      }
      finalMedia = uploadedMedia;
    }

    // ── Generate per-variant & per-size barcodes and upload to ImageKit ──────
    if (variations.length > 0) {
      setSavingStatusText('Generating & uploading variant barcodes...');
      const updatedVars: ProductVariation[] = [];

      for (let i = 0; i < variations.length; i++) {
        const v = variations[i];

        // Ensure variant has SKU & productId
        const varSku = v.sku || generateVariantSku(currentSku, v.color);
        const varProductId = v.productId || generateVariantProductId();
        const varBarcodeCode = (v.barcode && /^RSF-\d+$/i.test(v.barcode)) ? v.barcode : generateRSFNumericBarcode(usedBarcodes, barcodeCounterRef.current);

        // Generate & upload variant-level barcode
        const varBarcodeDataUrl = generateBarcodeDataUrl(varBarcodeCode);
        let varBarcodeUrl = v.barcodeUrl || '';
        if (varBarcodeDataUrl) {
          const barcodeFileName = `barcode-${currentProductId}-var-${i + 1}.png`;
          varBarcodeUrl = await uploadImageToImageKit(varBarcodeDataUrl, barcodeFileName, '/barcodes');
        }

        // Per-size barcodes
        const updatedSizes: VariationSizeItem[] = [];
        for (const s of v.sizes) {
          const sizeSku = s.sku || generateSizeSku(varSku, s.size);
          const sizeProductId = s.productId || generateSizeProductId();
          const sizeBarcodeCode = (s.barcode && /^RSF-\d+$/i.test(s.barcode)) ? s.barcode : generateRSFNumericBarcode(usedBarcodes, barcodeCounterRef.current);

          const sizeBarcodeDataUrl = generateBarcodeDataUrl(sizeBarcodeCode);
          let sizeBarcodeUrl = s.barcodeUrl || '';
          if (sizeBarcodeDataUrl) {
            const cleanSize = s.size.toUpperCase().replace(/[^A-Z0-9]/g, '');
            const sizeBarcodeFileName = `barcode-${currentProductId}-var-${i + 1}-${cleanSize}.png`;
            sizeBarcodeUrl = await uploadImageToImageKit(sizeBarcodeDataUrl, sizeBarcodeFileName, '/barcodes');
          }

          updatedSizes.push({
            ...s,
            sku: sizeSku,
            productId: sizeProductId,
            barcode: sizeBarcodeCode,
            barcodeUrl: sizeBarcodeUrl
          });
        }

        updatedVars.push({
          ...v,
          sku: varSku,
          productId: varProductId,
          barcode: varBarcodeCode,
          barcodeUrl: varBarcodeUrl,
          sizes: updatedSizes
        });
      }
      finalVariations = updatedVars;
    }

    setSavingStatusText('Saving product to Firebase...');

    const productPayload: Partial<Product> = {
      id: currentProductId,
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      longDescription: longDescription.trim(),
      collection: collectionName,
      vendor: finalVendor,
      price: parsedPrice,
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      discountRupees: parsedDiscount,
      gstPercentage: gstPercentage,
      sku: currentSku,
      inventory: parsedInventory,
      variations: finalVariations,
      media: finalMedia,
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
      console.error('Error saving product:', err);
    } finally {
      setIsSaving(false);
      setSavingStatusText('');
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

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
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                <span>{initialProduct ? 'Edit Product' : 'Add New Product'}</span>
                {/* Product ID badge */}
                <span className="inline-flex items-center space-x-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  <Hash className="w-2.5 h-2.5" />
                  <span>{productId || '—'}</span>
                </span>
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
          
          {/* ── TAB 1: BASIC DETAILS ── */}
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

          {/* ── TAB 2: PRICING, TAXES & INVENTORY ── */}
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

              {/* Product ID, SKU & Inventory */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-4">
                {/* Product ID row */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Hash className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Product ID (Firestore Document ID)</span>
                    </span>
                    {!initialProduct && (
                      <button
                        type="button"
                        onClick={() => setProductId(generateProductId())}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 font-medium cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Re-generate</span>
                      </button>
                    )}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly={!!initialProduct}
                      value={productId}
                      onChange={(e) => !initialProduct && setProductId(e.target.value)}
                      placeholder="PROD-xxxxxxxxxxxxxxxx"
                      className="flex-1 bg-indigo-50 border border-indigo-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(productId)}
                      className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                      title="Copy Product ID"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SKU */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                      <span>SKU ID (Auto generated & unique)</span>
                      <button
                        type="button"
                        onClick={() => setSku(generateProductSku())}
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
                      placeholder="RSF-ABC123"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-xs uppercase"
                    />
                  </div>

                  {/* Inventory */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Inventory Stock Count
                      {variations.length > 0 && (
                        <span className="ml-1 text-[10px] font-normal text-gray-400">(auto-sum from variants)</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={inventory}
                      onChange={(e) => setInventory(e.target.value)}
                      readOnly={variations.length > 0}
                      placeholder="25"
                      className={`w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-xs ${
                        variations.length > 0 ? 'bg-gray-100 text-gray-500' : 'bg-white'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: VARIATIONS ── */}
          {activeTab === 'variations' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-900 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Color & Size Variations with Auto IDs:</span> Each color variant and each size gets a unique <strong>SKU</strong>, <strong>Product ID</strong>, and <strong>Barcode</strong> — all auto-generated and uploaded to ImageKit on save.
                </div>
              </div>

              {/* Add New Color Variation */}
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
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColorVariation())}
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
                  variations.map((v, vi) => (
                    <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
                      {/* Variant Header */}
                      <div className="flex items-start justify-between border-b border-gray-100 pb-3 gap-2">
                        <div className="flex flex-col gap-1.5 min-w-0">
                          {/* Color name + swatch */}
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span 
                              className="w-4 h-4 rounded-full border border-gray-300 shadow-xs inline-block shrink-0" 
                              style={{ backgroundColor: v.colorHex || '#999' }}
                            />
                            <span className="font-bold text-xs text-gray-900">{v.color}</span>
                            <span className="text-[11px] text-gray-500 font-medium">
                              ({v.sizes.length} size{v.sizes.length === 1 ? '' : 's'})
                            </span>
                          </div>

                          {/* Variant IDs row */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Variant SKU */}
                            {v.sku && (
                              <CopyBadge label="Variant SKU" value={v.sku} />
                            )}
                            {/* Variant Product ID */}
                            {v.productId && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-mono text-indigo-700 font-semibold">
                                <Hash className="w-2.5 h-2.5" />
                                <span>{v.productId}</span>
                              </span>
                            )}
                            {/* Barcode code */}
                            {v.barcode && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[10px] font-mono text-gray-700 font-semibold">
                                <Barcode className="w-3 h-3 text-gray-500" />
                                <span>{v.barcode}</span>
                              </span>
                            )}
                            {/* ImageKit barcode link */}
                            {v.barcodeUrl && (
                              <a 
                                href={v.barcodeUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-medium text-blue-700 hover:bg-blue-100 transition"
                                title="View Barcode Image on ImageKit"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Barcode on ImageKit</span>
                              </a>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveColorVariation(v.id)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded-lg text-xs transition cursor-pointer flex items-center space-x-1 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
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

                      {/* Size Price & Inventory Matrix with IDs */}
                      {v.sizes.length > 0 && (
                        <div className="bg-gray-50/60 p-3 rounded-lg border border-gray-100 space-y-2">
                          <span className="block text-[11px] font-bold text-gray-700">
                            Size Details (SKU · Product ID · Price · Stock):
                          </span>
                          <div className="space-y-2">
                            {v.sizes.map((s) => (
                              <div key={s.size} className="bg-white border border-gray-200 p-2.5 rounded-lg space-y-1.5">
                                {/* Size header: name + IDs */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-bold text-xs text-gray-800 w-14 shrink-0">{s.size}</span>
                                  {s.sku && <CopyBadge label="Size SKU" value={s.sku} />}
                                  {s.productId && (
                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-[10px] font-mono text-purple-700 font-semibold">
                                      <Hash className="w-2.5 h-2.5" />
                                      <span>{s.productId}</span>
                                    </span>
                                  )}
                                  {s.barcodeUrl && (
                                    <a
                                      href={s.barcodeUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-medium text-blue-700 hover:bg-blue-100 transition"
                                    >
                                      <ExternalLink className="w-2.5 h-2.5" />
                                      <span>Barcode</span>
                                    </a>
                                  )}
                                </div>

                                {/* Price & Qty row */}
                                <div className="flex items-center gap-2">
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

                                  <div className="flex items-center space-x-1 w-24">
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">Qty:</span>
                                    <input
                                      type="number"
                                      value={s.inventory ?? 5}
                                      onChange={(e) => handleUpdateSizeDetails(v.id, s.size, 'inventory', parseInt(e.target.value, 10) || 0)}
                                      className="w-full bg-white border border-gray-300 rounded-md px-1.5 py-0.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                                    />
                                  </div>
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

          {/* ── TAB 4: MEDIA UPLOAD ── */}
          {activeTab === 'media' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Upload info banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-start space-x-2">
                <Upload className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Images are uploaded to <strong>ImageKit</strong> automatically when you save. Only the final ImageKit URL is stored in Firebase.
                </span>
              </div>

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
                    {/* ImageKit uploaded badge */}
                    {imgSrc.includes('ik.imagekit.io') && (
                      <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                        ✓ ImageKit
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

          {/* ── TAB 5: CHANNELS & STATUS ── */}
          {activeTab === 'settings' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Active Toggle */}
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

              {/* Show in Online / Offline */}
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
              {isSaving && savingStatusText ? (
                <span className="text-indigo-600 font-semibold flex items-center space-x-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{savingStatusText}</span>
                </span>
              ) : (
                <span className="flex items-center gap-2 flex-wrap">
                  {sku && <span>SKU: <strong className="font-mono">{sku}</strong></span>}
                  {productId && <span className="text-indigo-500">ID: <strong className="font-mono">{productId}</strong></span>}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
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
                <span>{isSaving ? (savingStatusText || 'Processing...') : 'Save Product'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
