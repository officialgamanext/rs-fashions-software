'use client';

import React, { useState, useEffect } from 'react';
import { 
  ScanBarcode, 
  ShoppingBag, 
  Search, 
  Filter, 
  Trash2, 
  Plus, 
  Minus, 
  BookmarkCheck, 
  CreditCard, 
  RotateCcw, 
  Printer, 
  CheckCircle2, 
  User, 
  Phone, 
  X, 
  Clock, 
  ArrowRight,
  Sparkles,
  QrCode,
  Banknote,
  DollarSign,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, SavedBill, SavedBillItem, OrderItem } from '../types';
import { BarcodeScanner } from './BarcodeScanner';
import { 
  subscribeToSavedBills, 
  saveDraftBillToFirestore, 
  deleteDraftBillFromFirestore, 
  settleOfflineBill 
} from '../lib/billingService';

export const OfflineBillingView: React.FC = () => {
  const { products, showToast, handleSaveOrder } = useApp();

  // Active Billing Tab: 'barcode' | 'item'
  const [activeTab, setActiveTab] = useState<'barcode' | 'item'>('barcode');

  // Active Bill State
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const [billNumber, setBillNumber] = useState<string>('BILL-100001');
  const [billDateStr, setBillDateStr] = useState<string>('Today');
  const [cartItems, setCartItems] = useState<SavedBillItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [discountRupees, setDiscountRupees] = useState<number>(0);
  const [taxPercentage, setTaxPercentage] = useState<number>(5); // default 5% GST
  const [billNotes, setBillNotes] = useState('');

  // Client-side initialization to avoid SSR hydration mismatch
  useEffect(() => {
    if (billNumber === 'BILL-100001') {
      setBillNumber(`BILL-${Math.floor(100000 + Math.random() * 900000)}`);
    }
    setBillDateStr(new Date().toLocaleDateString());
  }, []);

  // Item Billing Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Saved Bills Drawer / State
  const [savedBills, setSavedBills] = useState<SavedBill[]>([]);
  const [isSavedBillsOpen, setIsSavedBillsOpen] = useState(false);
  const [isSavingBill, setIsSavingBill] = useState(false);

  // Settlement Modal State
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [isSettling, setIsSettling] = useState(false);

  // Receipt Modal State
  const [settledReceipt, setSettledReceipt] = useState<any | null>(null);

  // Variant Picker Modal State
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);

  // Real-time listener for Saved Bills
  useEffect(() => {
    const unsubscribe = subscribeToSavedBills(
      (bills) => setSavedBills(bills),
      (err) => console.error('Saved bills error:', err)
    );
    return () => unsubscribe();
  }, []);

  // Compute Categories from products
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category || p.collection || 'General').filter(Boolean)))];

  // Filter products for Item Billing tab
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      (product.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || (product.category || product.collection) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Subtotal, Item-Wise Tax, Total
  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const calculatedTax = cartItems.reduce((sum, item) => {
    const itemGst = item.gstAmount !== undefined 
      ? item.gstAmount 
      : Math.round(item.total * ((item.gstPercentage ?? 5) / 100));
    return sum + itemGst;
  }, 0);
  const grandTotal = Math.max(0, subtotal - discountRupees + calculatedTax);
  const itemsCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  // Helper: Find product by Barcode or SKU
  const findProductByBarcodeOrSku = (code: string): { product: Product; variant?: any } | null => {
    const cleanCode = code.trim().toLowerCase();
    for (const p of products) {
      if ((p.sku || '').toLowerCase() === cleanCode || (p.id || '').toLowerCase() === cleanCode) {
        return { product: p };
      }
      if (p.variations && p.variations.length > 0) {
        for (const v of p.variations) {
          if ((v.sku || '').toLowerCase() === cleanCode || (v.barcode || '').toLowerCase() === cleanCode) {
            return { product: p, variant: v };
          }
          if (v.sizes && v.sizes.length > 0) {
            for (const s of v.sizes) {
              if ((s.sku || '').toLowerCase() === cleanCode || (s.barcode || '').toLowerCase() === cleanCode) {
                return { product: p, variant: { ...v, selectedSize: s.size, price: s.price || p.price } };
              }
            }
          }
        }
      }
    }
    return null;
  };

  // Add Item to Bill (inherits product.gstPercentage or defaults to 5%)
  const addItemToBill = (product: Product, variant?: { color?: string; size?: string; price?: number; sku?: string }) => {
    const price = variant?.price || product.price || 0;
    const sku = variant?.sku || product.sku || product.id;
    const color = variant?.color;
    const size = variant?.size;
    const gstPct = product.gstPercentage !== undefined ? product.gstPercentage : 5;
    const itemTotal = price * 1;
    const itemGstAmt = Math.round(itemTotal * (gstPct / 100));

    setCartItems(prevItems => {
      const existingIndex = prevItems.findIndex(i => 
        i.productId === product.id && i.color === color && i.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const currentItem = updated[existingIndex];
        const newQty = currentItem.quantity + 1;
        const newTotal = currentItem.price * newQty;
        const currentGstPct = currentItem.gstPercentage !== undefined ? currentItem.gstPercentage : gstPct;
        const newGstAmt = Math.round(newTotal * (currentGstPct / 100));
        updated[existingIndex] = {
          ...currentItem,
          quantity: newQty,
          total: newTotal,
          gstPercentage: currentGstPct,
          gstAmount: newGstAmt
        };
        return updated;
      } else {
        const newItem: SavedBillItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          productId: product.id,
          productTitle: product.title,
          sku: sku,
          color: color,
          size: size,
          productImage: (product.media && product.media.length > 0) ? product.media[0] : undefined,
          price: price,
          quantity: 1,
          total: itemTotal,
          gstPercentage: gstPct,
          gstAmount: itemGstAmt
        };
        return [...prevItems, newItem];
      }
    });

    showToast(`Added "${product.title}" to bill`);
  };

  // Barcode Scan Handler
  const handleBarcodeScan = (code: string) => {
    const match = findProductByBarcodeOrSku(code);
    if (match) {
      addItemToBill(match.product, match.variant);
    } else {
      showToast(`No product found matching barcode "${code}"`);
    }
  };

  // Update Item Quantity (recalculates item-wise GST)
  const updateQuantity = (itemId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        const newTotal = item.price * newQty;
        const gstPct = item.gstPercentage !== undefined ? item.gstPercentage : 5;
        const newGstAmt = Math.round(newTotal * (gstPct / 100));
        return {
          ...item,
          quantity: newQty,
          total: newTotal,
          gstAmount: newGstAmt
        };
      }
      return item;
    }).filter(Boolean) as SavedBillItem[]);
  };

  // Update Item GST percentage
  const updateItemGst = (itemId: string, newGstPct: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newGstAmt = Math.round(item.total * (newGstPct / 100));
        return {
          ...item,
          gstPercentage: newGstPct,
          gstAmount: newGstAmt
        };
      }
      return item;
    }));
  };

  // Remove Item
  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  // Clear / Reset Bill
  const handleResetBill = () => {
    setActiveBillId(null);
    setBillNumber(`BILL-${Math.floor(100000 + Math.random() * 900000)}`);
    setCartItems([]);
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setCustomerEmail('');
    setDiscountRupees(0);
    setTaxPercentage(5);
    setBillNotes('');
  };

  // Save Draft Bill to Saved Bills
  const handleSaveBill = async () => {
    if (cartItems.length === 0) {
      showToast('Cannot save an empty bill. Please add items.');
      return;
    }
    setIsSavingBill(true);
    try {
      const savedId = await saveDraftBillToFirestore({
        id: activeBillId || undefined,
        billNumber,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        customerName,
        customerPhone,
        customerEmail,
        items: cartItems,
        itemsCount,
        subtotal,
        discount: discountRupees,
        tax: calculatedTax,
        total: grandTotal,
        notes: billNotes
      });

      setActiveBillId(savedId);
      showToast(`Bill #${billNumber} saved in Saved Bills`);
      handleResetBill();
    } catch (err: any) {
      showToast(`Failed to save bill: ${err.message}`);
    } finally {
      setIsSavingBill(false);
    }
  };

  // Select a Saved Bill to Edit/Settle
  const handleSelectSavedBill = (bill: SavedBill) => {
    setActiveBillId(bill.id);
    setBillNumber(bill.billNumber);
    setCartItems(bill.items || []);
    setCustomerName(bill.customerName || 'Walk-in Customer');
    setCustomerPhone(bill.customerPhone || '');
    setCustomerEmail(bill.customerEmail || '');
    setDiscountRupees(bill.discount || 0);
    setTaxPercentage(bill.subtotal ? Math.round((bill.tax / bill.subtotal) * 100) || 5 : 5);
    setBillNotes(bill.notes || '');
    setIsSavedBillsOpen(false);
    showToast(`Loaded Bill #${bill.billNumber} into editor`);
  };

  // Delete a Saved Bill
  const handleDeleteSavedBill = async (e: React.MouseEvent, billId: string) => {
    e.stopPropagation();
    try {
      await deleteDraftBillFromFirestore(billId);
      showToast('Deleted draft bill');
      if (activeBillId === billId) {
        handleResetBill();
      }
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    }
  };

  // Handle Complete Settlement
  const handleCompleteSettlement = async () => {
    if (cartItems.length === 0) {
      showToast('No items to settle');
      return;
    }
    setIsSettling(true);

    try {
      const cleanNumericOrderId = billNumber.replace(/\D/g, '') || `${100000 + Math.floor(Math.random() * 900000)}`;

      const orderItems: OrderItem[] = JSON.parse(JSON.stringify(cartItems.map(item => {
        const gstPct = item.gstPercentage !== undefined ? item.gstPercentage : 5;
        const gstAmt = item.gstAmount !== undefined ? item.gstAmount : Math.round(item.total * (gstPct / 100));
        return {
          id: item.id,
          productId: item.productId,
          productTitle: item.productTitle,
          productImage: item.productImage || '',
          color: item.color || '',
          size: item.size || '',
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          gstPercentage: gstPct,
          gstAmount: gstAmt
        };
      })));

      const settledPayload = {
        orderNumber: cleanNumericOrderId,
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
        customerEmail,
        items: orderItems,
        itemsCount,
        subtotal,
        discount: discountRupees,
        taxes: calculatedTax,
        taxPercentage,
        total: grandTotal,
        paymentStatus: 'Paid' as const,
        fulfillmentStatus: 'Fulfilled' as const,
        notes: `Offline POS Settlement (${paymentMethod})`
      };

      const newOrderId = await settleOfflineBill(settledPayload, activeBillId || undefined);

      // Set receipt data
      setSettledReceipt({
        orderId: newOrderId,
        orderNumber: cleanNumericOrderId,
        billNumber,
        date: new Date().toLocaleString(),
        customerName,
        customerPhone,
        items: cartItems,
        subtotal,
        discount: discountRupees,
        tax: calculatedTax,
        total: grandTotal,
        paymentMethod,
        cashTendered: Number(cashTendered) || grandTotal,
        changeDue: Math.max(0, (Number(cashTendered) || grandTotal) - grandTotal)
      });

      setIsSettleModalOpen(false);
      showToast(`Bill #${billNumber} settled successfully!`);
    } catch (err: any) {
      showToast(`Settlement error: ${err.message}`);
    } finally {
      setIsSettling(false);
    }
  };

  const cashTenderedVal = Number(cashTendered) || 0;
  const changeDue = Math.max(0, cashTenderedVal - grandTotal);

  // Global Hardware USB & Bluetooth Barcode Scanner Listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      // Reset buffer if gap between keypresses > 60ms (human typing)
      if (timeDiff > 60) {
        buffer = '';
      }

      if (e.key === 'Enter') {
        if (buffer.trim().length >= 3) {
          e.preventDefault();
          const scannedCode = buffer.trim();
          handleBarcodeScan(scannedCode);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [products, cartItems]);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto select-none font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <ScanBarcode className="w-6 h-6 text-emerald-600" />
            <span>Offline POS Billing</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">High-speed camera & USB/Bluetooth hardware barcode scanner point-of-sale</p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Hardware Scanner Ready Badge */}
          <span className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>USB & Bluetooth Scanner Ready</span>
          </span>

          {/* Saved Bills Drawer Button */}
          <button
            onClick={() => setIsSavedBillsOpen(true)}
            className="px-3 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-100 transition flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <BookmarkCheck className="w-4 h-4 text-amber-600" />
            <span>Saved Bills</span>
            {savedBills.length > 0 && (
              <span className="bg-amber-600 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold animate-pulse">
                {savedBills.length}
              </span>
            )}
          </button>

          {/* Reset / New Bill */}
          <button
            onClick={handleResetBill}
            title="Start New Bill"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Billing Workspace: Left Billing Tabs vs Right Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column (7/12): Barcode Billing or Item Billing */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Billing Type Selector Tabs */}
          <div className="flex bg-gray-200 p-1 rounded-xl border border-gray-300 shadow-inner">
            <button
              onClick={() => setActiveTab('barcode')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'barcode'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ScanBarcode className="w-4 h-4 text-emerald-600" />
              <span>Barcode Billing</span>
            </button>

            <button
              onClick={() => setActiveTab('item')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'item'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Item Catalog Billing</span>
            </button>
          </div>

          {/* TAB 1: Barcode Billing */}
          {activeTab === 'barcode' && (
            <div className="space-y-4">
              <BarcodeScanner 
                onScan={handleBarcodeScan}
                isActive={activeTab === 'barcode'}
                products={products}
              />

              {/* Quick Barcode Hints */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Scan any product barcode or SKU code. Matched item will instantly add to right order summary!</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Item Billing Catalog */}
          {activeTab === 'item' && (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 space-y-4">
              {/* Search & Category Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by product name, SKU, category..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Category Pills Slider */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 custom-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition ${
                        selectedCategory === cat
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-medium">No products found matching filters</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const hasMedia = product.media && product.media.length > 0;
                    const hasVariations = product.variations && product.variations.length > 0;

                    return (
                      <div
                        key={product.id}
                        onClick={() => {
                          if (hasVariations) {
                            setSelectedProductForVariant(product);
                          } else {
                            addItemToBill(product);
                          }
                        }}
                        className="bg-gray-50 hover:bg-emerald-50/40 border border-gray-200 hover:border-emerald-300 rounded-xl p-2.5 transition group cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          {/* Image Thumbnail */}
                          <div className="w-full h-28 rounded-lg bg-gray-200 overflow-hidden mb-2 relative">
                            {hasMedia ? (
                              <img
                                src={product.media![0]}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                                No Image
                              </div>
                            )}

                            {/* Stock Badge */}
                            <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                              product.inventory > 0 ? 'bg-black/70 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition">
                            {product.title}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{product.sku}</p>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-gray-900">₹{product.price}</span>
                          <button
                            type="button"
                            className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Column (5/12): Order Summary & Settlement Panel */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-xs border border-gray-200 p-4 space-y-4 sticky top-20">
          
          {/* Order Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active Bill</span>
              <h2 className="text-sm font-extrabold text-gray-900 font-mono">{billNumber}</h2>
            </div>
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold">
              {billDateStr}
            </span>
          </div>

          {/* Customer Details Compact Bar */}
          <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Customer Name</label>
              <div className="flex items-center space-x-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in Customer"
                  className="w-full bg-transparent text-xs font-semibold text-gray-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Phone Number</label>
              <div className="flex items-center space-x-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full bg-transparent text-xs font-semibold text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
            {cartItems.length === 0 ? (
              <div className="py-8 text-center text-gray-400 space-y-1">
                <ShoppingBag className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-semibold">Bill is empty</p>
                <p className="text-[11px] text-gray-400">Scan barcodes or click items from catalog to add</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200 text-xs"
                >
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-2">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productTitle} className="w-9 h-9 rounded object-cover border border-gray-200 shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-bold shrink-0">
                        Item
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 truncate">{item.productTitle}</h4>
                      <div className="text-[10px] text-gray-500 font-mono flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span>₹{item.price}</span>
                        {item.color && <span>• {item.color}</span>}
                        {item.size && <span>• {item.size}</span>}
                        <span className="text-gray-300">|</span>
                        <div className="inline-flex items-center space-x-1 bg-gray-100 px-1 py-0.5 rounded text-[10px]">
                          <span className="text-gray-600 font-medium">GST:</span>
                          <select
                            value={item.gstPercentage ?? 5}
                            onChange={(e) => updateItemGst(item.id, Number(e.target.value))}
                            className="bg-white border border-gray-300 rounded text-[9px] font-bold px-1 py-0"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                          <span className="text-emerald-700 font-bold">
                            (+₹{item.gstAmount ?? Math.round(item.total * ((item.gstPercentage ?? 5) / 100))})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Line Total */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex items-center border border-gray-300 rounded-md bg-white overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-1.5 py-0.5 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold text-xs text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-1.5 py-0.5 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-extrabold text-gray-900 w-14 text-right">₹{item.total}</span>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({itemsCount} items)</span>
              <span className="font-bold text-gray-900">₹{subtotal}</span>
            </div>

            {/* Extra Discount Row */}
            <div className="flex justify-between items-center text-gray-600">
              <span>Discount (₹)</span>
              <input
                type="number"
                min="0"
                value={discountRupees || ''}
                onChange={(e) => setDiscountRupees(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-20 bg-white border border-gray-300 rounded px-2 py-0.5 text-right font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Item-Wise Tax / GST Row */}
            <div className="flex justify-between items-center text-gray-600">
              <div className="flex items-center space-x-1">
                <span>Total Tax (Item-Wise GST)</span>
              </div>
              <span className="font-bold text-emerald-700">₹{calculatedTax}</span>
            </div>

            <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm font-extrabold text-gray-900">
              <span>Grand Total</span>
              <span className="text-lg text-emerald-700 font-black">₹{grandTotal}</span>
            </div>
          </div>

          {/* Action Buttons: Save Bill & Settle Bill */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleSaveBill}
              disabled={cartItems.length === 0 || isSavingBill}
              className="w-full py-2.5 px-3 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{isSavingBill ? 'Saving...' : 'Save Bill'}</span>
            </button>

            <button
              onClick={() => setIsSettleModalOpen(true)}
              disabled={cartItems.length === 0}
              className="w-full py-2.5 px-3 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Settle Bill</span>
            </button>
          </div>

        </div>

      </div>

      {/* SAVED BILLS SLIDE-OVER DRAWER */}
      {isSavedBillsOpen && (
        <div 
          onClick={() => setIsSavedBillsOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between cursor-default"
          >
            <div>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-amber-50">
                <div className="flex items-center space-x-2">
                  <BookmarkCheck className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm">Saved Draft Bills</h3>
                    <p className="text-[11px] text-gray-500">{savedBills.length} saved bill(s) available</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSavedBillsOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Saved Bills List */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
                {savedBills.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 space-y-2">
                    <BookmarkCheck className="w-10 h-10 mx-auto opacity-40 text-amber-500" />
                    <p className="text-xs font-semibold">No saved draft bills yet</p>
                    <p className="text-[11px] text-gray-400">Click "Save Bill" on active bill to keep draft here</p>
                  </div>
                ) : (
                  savedBills.map((bill) => (
                    <div
                      key={bill.id}
                      onClick={() => handleSelectSavedBill(bill)}
                      className="p-3.5 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50/30 transition cursor-pointer group space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-extrabold text-xs text-gray-900 group-hover:text-amber-700 transition">
                          #{bill.billNumber}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center space-x-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{bill.date}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-gray-800">{bill.customerName}</p>
                          <p className="text-[11px] text-gray-500">{bill.itemsCount} item(s)</p>
                        </div>
                        <span className="text-sm font-extrabold text-emerald-700">₹{bill.total}</span>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] text-amber-700 font-bold group-hover:underline flex items-center space-x-1">
                          <span>Load & Edit Bill</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>

                        <button
                          onClick={(e) => handleDeleteSavedBill(e, bill.id)}
                          title="Delete saved draft"
                          className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTLE BILL INLINE MODAL */}
      {isSettleModalOpen && (
        <div 
          onClick={() => setIsSettleModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-150 cursor-default"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-emerald-600 text-white">
              <div>
                <h3 className="font-extrabold text-base">Settle Bill #{billNumber}</h3>
                <p className="text-xs text-emerald-100">Select payment method & complete checkout</p>
              </div>
              <button
                onClick={() => setIsSettleModalOpen(false)}
                className="text-emerald-100 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Grand Total Highlight */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center">
                <span className="text-[11px] uppercase font-bold text-emerald-700 tracking-wider">Amount To Collect</span>
                <div className="text-3xl font-black text-emerald-800 font-mono mt-0.5">₹{grandTotal}</div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                      paymentMethod === 'Cash'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span>Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                      paymentMethod === 'UPI'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                      paymentMethod === 'Card'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Card</span>
                  </button>
                </div>
              </div>

              {/* Cash Change Calculation Panel */}
              {paymentMethod === 'Cash' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600">Cash Received from Customer (₹)</label>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder={`e.g. ${grandTotal}`}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
                    />
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Quick:</span>
                    {[grandTotal, 500, 1000, 2000].filter(v => v >= grandTotal).map((val, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCashTendered(String(val))}
                        className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-[11px] font-bold text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>

                  {/* Change to Return */}
                  {cashTenderedVal > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs">
                      <span className="font-bold text-gray-700">Change To Return:</span>
                      <span className={`text-base font-black ${changeDue >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        ₹{changeDue}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Complete Settlement Action */}
              <button
                onClick={handleCompleteSettlement}
                disabled={isSettling}
                className="w-full py-3 bg-emerald-600 text-white font-extrabold text-sm rounded-xl hover:bg-emerald-700 transition shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSettling ? 'Processing Settlement...' : `Complete Settlement (₹${grandTotal})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {settledReceipt && (
        <div 
          onClick={() => setSettledReceipt(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-150 cursor-default"
          >
            {/* Header */}
            <div className="p-4 bg-emerald-700 text-white text-center space-y-1">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-300 animate-bounce" />
              <h3 className="text-base font-extrabold">Bill Settled Successfully!</h3>
              <p className="text-xs text-emerald-100">Order #{settledReceipt.orderNumber} created & inventory updated</p>
            </div>

            {/* Printable Receipt Preview */}
            <div id="printable-receipt" className="p-5 space-y-4 text-xs font-mono bg-white border-b border-gray-200">
              <div className="text-center space-y-0.5 border-b border-dashed border-gray-300 pb-3">
                <h2 className="font-sans font-black text-lg text-gray-900 tracking-wider">RS FASHIONS</h2>
                <p className="text-[10px] text-gray-500 font-sans">Official Retail Invoice • Offline Store</p>
                <p className="text-[10px] text-gray-400">{settledReceipt.date}</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bill #:</span>
                  <span className="font-bold">{settledReceipt.billNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-bold">{settledReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment:</span>
                  <span className="font-bold">{settledReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="border-t border-b border-dashed border-gray-300 py-2 space-y-1.5 text-[11px]">
                {settledReceipt.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="truncate pr-2">
                      <div className="font-bold">{item.quantity}x {item.productTitle}</div>
                      <div className="text-[9px] text-gray-500 font-mono">
                        GST ({item.gstPercentage ?? 5}%): +₹{item.gstAmount ?? Math.round(item.total * ((item.gstPercentage ?? 5) / 100))}
                      </div>
                    </div>
                    <span className="font-bold shrink-0">₹{item.total}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{settledReceipt.subtotal}</span>
                </div>
                {settledReceipt.discount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount:</span>
                    <span>-₹{settledReceipt.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>GST Tax:</span>
                  <span>₹{settledReceipt.tax}</span>
                </div>
                <div className="flex justify-between text-sm font-sans font-black text-gray-900 border-t border-gray-200 pt-1">
                  <span>GRAND TOTAL:</span>
                  <span>₹{settledReceipt.total}</span>
                </div>
                {settledReceipt.paymentMethod === 'Cash' && (
                  <div className="flex justify-between text-[10px] text-gray-500 pt-1">
                    <span>Cash Tendered: ₹{settledReceipt.cashTendered}</span>
                    <span>Change Returned: ₹{settledReceipt.changeDue}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-gray-50 flex items-center justify-between gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={() => {
                  setSettledReceipt(null);
                  handleResetBill();
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition cursor-pointer"
              >
                Start New Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VARIANT PICKER MODAL (If clicked item in Catalog has variations) */}
      {selectedProductForVariant && (
        <div 
          onClick={() => setSelectedProductForVariant(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 cursor-default"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{selectedProductForVariant.title}</h3>
                <p className="text-[11px] text-gray-500">Select product variant to add to bill</p>
              </div>
              <button
                onClick={() => setSelectedProductForVariant(null)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
              {selectedProductForVariant.variations?.map((variant) => (
                <div key={variant.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: variant.colorHex || '#ccc' }} />
                    <span className="font-bold text-xs text-gray-900">{variant.color}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {variant.sizes.map((sizeObj, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => {
                          addItemToBill(selectedProductForVariant, {
                            color: variant.color,
                            size: sizeObj.size,
                            price: sizeObj.price || selectedProductForVariant.price,
                            sku: sizeObj.sku || variant.sku || selectedProductForVariant.sku
                          });
                          setSelectedProductForVariant(null);
                        }}
                        className="px-3 py-1 bg-white border border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 rounded-lg text-xs font-bold text-gray-800 transition cursor-pointer"
                      >
                        {sizeObj.size} (₹{sizeObj.price || selectedProductForVariant.price})
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
