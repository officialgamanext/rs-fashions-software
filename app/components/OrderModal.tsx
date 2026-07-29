'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  ShoppingCart, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Package, 
  User, 
  MapPin, 
  Check, 
  Percent, 
  Truck, 
  Tag, 
  DollarSign,
  Calculator
} from 'lucide-react';
import { Order, OrderItem, OrderAddress, Product, Customer } from '../types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Partial<Order>) => Promise<void> | void;
  initialOrder?: Order | null;
  products: Product[];
  customers: Customer[];
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialOrder,
  products,
  customers
}) => {
  // Numeric Order ID helper (Digits ONLY)
  const generateNumericOrderId = () => {
    return `${100000 + Math.floor(Math.random() * 900000)}`;
  };

  const [orderNumber, setOrderNumber] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Order Items
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  // Financial Calculations
  const [discountRupees, setDiscountRupees] = useState('0');
  const [deliveryCharges, setDeliveryCharges] = useState('0');
  const [gstPercentage, setGstPercentage] = useState<number>(5);

  // Statuses
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Refunded'>('Paid');
  const [fulfillmentStatus, setFulfillmentStatus] = useState<'Fulfilled' | 'Unfulfilled' | 'In Progress'>('Fulfilled');

  // Shipping & Billing Address
  const [shippingLine1, setShippingLine1] = useState('');
  const [shippingLine2, setShippingLine2] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');
  const [shippingCountry, setShippingCountry] = useState('India');

  const [isBillingSame, setIsBillingSame] = useState(true);
  const [billingLine1, setBillingLine1] = useState('');
  const [billingLine2, setBillingLine2] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingPincode, setBillingPincode] = useState('');
  const [billingCountry, setBillingCountry] = useState('India');

  const [notes, setNotes] = useState('');
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

  // Populate or reset form
  useEffect(() => {
    if (initialOrder) {
      setOrderNumber(String(initialOrder.orderNumber || '').replace(/\D/g, '') || generateNumericOrderId());
      setSelectedCustomerId(initialOrder.customerId || '');
      setCustomerName(initialOrder.customerName || 'Walk-in Customer');
      setCustomerEmail(initialOrder.customerEmail || '');
      setCustomerPhone(initialOrder.customerPhone || '');
      setItems(initialOrder.items || []);

      setDiscountRupees(initialOrder.discount ? initialOrder.discount.toString() : '0');
      setDeliveryCharges(initialOrder.deliveryCharges ? initialOrder.deliveryCharges.toString() : '0');
      setGstPercentage(initialOrder.taxPercentage ?? 5);

      setPaymentStatus(initialOrder.paymentStatus || 'Paid');
      setFulfillmentStatus(initialOrder.fulfillmentStatus || 'Fulfilled');

      if (initialOrder.shippingAddress) {
        setShippingLine1(initialOrder.shippingAddress.addressLine1 || '');
        setShippingLine2(initialOrder.shippingAddress.addressLine2 || '');
        setShippingCity(initialOrder.shippingAddress.city || '');
        setShippingState(initialOrder.shippingAddress.state || '');
        setShippingPincode(initialOrder.shippingAddress.pincode || '');
        setShippingCountry(initialOrder.shippingAddress.country || 'India');
      }

      setIsBillingSame(initialOrder.isBillingSameAsShipping ?? true);

      if (initialOrder.billingAddress) {
        setBillingLine1(initialOrder.billingAddress.addressLine1 || '');
        setBillingLine2(initialOrder.billingAddress.addressLine2 || '');
        setBillingCity(initialOrder.billingAddress.city || '');
        setBillingState(initialOrder.billingAddress.state || '');
        setBillingPincode(initialOrder.billingAddress.pincode || '');
        setBillingCountry(initialOrder.billingAddress.country || 'India');
      }

      setNotes(initialOrder.notes || '');
    } else {
      setOrderNumber(generateNumericOrderId());
      setSelectedCustomerId('');
      setCustomerName('Walk-in Customer');
      setCustomerEmail('');
      setCustomerPhone('');
      setItems([]);

      setDiscountRupees('0');
      setDeliveryCharges('100');
      setGstPercentage(5);

      setPaymentStatus('Paid');
      setFulfillmentStatus('Fulfilled');

      setShippingLine1('');
      setShippingLine2('');
      setShippingCity('');
      setShippingState('');
      setShippingPincode('');
      setShippingCountry('India');

      setIsBillingSame(true);
      setBillingLine1('');
      setBillingLine2('');
      setBillingCity('');
      setBillingState('');
      setBillingPincode('');
      setBillingCountry('India');

      setNotes('');
    }
  }, [initialOrder, isOpen]);

  if (!isOpen) return null;

  // Handle Customer Selection & Auto Address Pre-fill
  const handleSelectCustomer = (cId: string) => {
    setSelectedCustomerId(cId);
    if (!cId) return;

    const foundCust = customers.find(c => c.id === cId);
    if (foundCust) {
      setCustomerName(foundCust.name);
      setCustomerEmail(foundCust.email || '');
      setCustomerPhone(`${foundCust.phoneCode || '+91'} ${foundCust.phoneNumber || ''}`);

      if (foundCust.addresses && foundCust.addresses.length > 0) {
        const def = foundCust.addresses.find(a => a.isDefault) || foundCust.addresses[0];
        setShippingLine1(def.addressLine1 || '');
        setShippingLine2(def.addressLine2 || '');
        setShippingCity(def.city || '');
        setShippingState(def.state || '');
        setShippingPincode(def.pincode || '');
        setShippingCountry(def.country || 'India');
      }
    }
  };

  // Add Item to Order
  const handleAddItemToOrder = () => {
    if (!selectedProductId) return;
    const targetProd = products.find(p => p.id === selectedProductId);
    if (!targetProd) return;

    let unitPrice = targetProd.price || 0;
    // Check variation price override if available
    if (selectedColor && selectedSize && targetProd.variations) {
      const v = targetProd.variations.find(varItem => varItem.color === selectedColor);
      if (v) {
        const s = v.sizes.find(sz => sz.size === selectedSize);
        if (s && s.price) unitPrice = s.price;
      }
    }

    const newItem: OrderItem = {
      id: `ord-item-${Date.now()}`,
      productId: targetProd.id,
      productTitle: targetProd.title,
      productImage: targetProd.media && targetProd.media.length > 0 ? targetProd.media[0] : '',
      color: selectedColor,
      size: selectedSize,
      quantity: itemQuantity,
      price: unitPrice,
      total: unitPrice * itemQuantity
    };

    setItems(prev => [...prev, newItem]);
    setSelectedProductId('');
    setSelectedColor('');
    setSelectedSize('');
    setItemQuantity(1);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  // Calculations Engine
  const subtotal = items.reduce((acc, i) => acc + (i.total || (i.price * i.quantity)), 0);
  const parsedDiscount = parseFloat(discountRupees) || 0;
  const parsedDelivery = parseFloat(deliveryCharges) || 0;
  const netSubtotal = Math.max(0, subtotal - parsedDiscount);
  const calculatedTaxes = (netSubtotal * gstPercentage) / 100;
  const grandTotal = netSubtotal + parsedDelivery + calculatedTaxes;
  const totalItemsCount = items.reduce((acc, i) => acc + (i.quantity || 1), 0);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce numeric-only Order ID
    const cleanNumericOrderId = orderNumber.replace(/\D/g, '') || generateNumericOrderId();

    setIsSaving(true);

    const shippingAddr: OrderAddress = {
      addressLine1: shippingLine1.trim(),
      addressLine2: shippingLine2.trim(),
      city: shippingCity.trim(),
      state: shippingState.trim(),
      pincode: shippingPincode.trim(),
      country: shippingCountry
    };

    const billingAddr: OrderAddress = isBillingSame 
      ? shippingAddr 
      : {
          addressLine1: billingLine1.trim(),
          addressLine2: billingLine2.trim(),
          city: billingCity.trim(),
          state: billingState.trim(),
          pincode: billingPincode.trim(),
          country: billingCountry
        };

    const orderPayload: Partial<Order> = {
      id: initialOrder?.id,
      orderNumber: cleanNumericOrderId,
      customerId: selectedCustomerId,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      items,
      itemsCount: totalItemsCount,
      subtotal,
      discount: parsedDiscount,
      deliveryCharges: parsedDelivery,
      taxes: calculatedTaxes,
      taxPercentage: gstPercentage,
      total: grandTotal,
      paymentStatus,
      fulfillmentStatus,
      shippingAddress: shippingAddr,
      billingAddress: billingAddr,
      isBillingSameAsShipping: isBillingSame,
      notes: notes.trim()
    };

    try {
      await onSave(orderPayload);
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
        className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150 cursor-default flex flex-col my-auto max-h-[94vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center shadow-sm">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <span>{initialOrder ? `Edit Order #${orderNumber}` : 'Create New Order'}</span>
              </h2>
              <p className="text-xs text-gray-500">Auto-calculated subtotal, taxes, delivery, addresses & customer assignment</p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Card 1: Order ID & Customer Assignment */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Order Identification & Customer</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Numeric-Only Order ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Numeric Order ID <span className="text-red-500">*</span></span>
                  <button
                    type="button"
                    onClick={() => setOrderNumber(generateNumericOrderId())}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 font-medium cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-generate</span>
                  </button>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">#</span>
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => {
                      // Restrict input to digits ONLY
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      setOrderNumber(digitsOnly);
                    }}
                    placeholder="108429"
                    className="w-full bg-white border border-gray-300 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-2xs"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Order ID contains numbers only (e.g. 1001, 108429).</p>
              </div>

              {/* Assign Customer */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <span>Assign Customer</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer shadow-2xs"
                >
                  <option value="">Walk-in Customer / Direct Order</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.countryFlag} {c.name} ({c.phoneNumber || c.email || 'Registered'})
                    </option>
                  ))}
                </select>

                {!selectedCustomerId && (
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name (e.g. Priyanshu Varma)"
                    className="mt-2 w-full bg-white border border-gray-300 rounded-xl px-3.5 py-1.5 text-xs text-gray-900"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Items Selection & Live Calculation Engine */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Order Items & Product Selection</span>
            </h3>

            {/* Product Item Picker */}
            <div className="bg-gray-50/80 border border-gray-200 p-3.5 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Select Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      setSelectedColor('');
                      setSelectedSize('');
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  >
                    <option value="">Choose a product from catalog...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.title} — ₹{p.price}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                </div>
              </div>

              {/* Variation Selectors if Selected Product has Variations */}
              {selectedProductId && (() => {
                const targetProd = products.find(p => p.id === selectedProductId);
                if (!targetProd || !targetProd.variations || targetProd.variations.length === 0) return null;
                const colors = targetProd.variations.map(v => v.color);
                const currentVar = targetProd.variations.find(v => v.color === selectedColor);
                const availableSizes = currentVar ? currentVar.sizes.map(s => s.size) : [];

                return (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Variation Color</label>
                      <select
                        value={selectedColor}
                        onChange={(e) => {
                          setSelectedColor(e.target.value);
                          setSelectedSize('');
                        }}
                        className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-800"
                      >
                        <option value="">Select Color...</option>
                        {colors.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Variation Size</label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-800"
                      >
                        <option value="">Select Size...</option>
                        {availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={handleAddItemToOrder}
                className="bg-[#1a1a1a] hover:bg-[#333] text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition flex items-center space-x-1 ml-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item to Order</span>
              </button>
            </div>

            {/* Added Items Table */}
            {items.length > 0 ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50/50 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productTitle} className="w-9 h-9 rounded-lg object-cover border border-gray-200 bg-gray-100" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-gray-900 block">{item.productTitle}</span>
                        <div className="text-[11px] text-gray-500 flex items-center space-x-2">
                          {item.color && <span className="bg-gray-100 px-1.5 py-0.5 rounded border">{item.color}</span>}
                          {item.size && <span className="bg-gray-100 px-1.5 py-0.5 rounded border">{item.size}</span>}
                          <span>Qty: {item.quantity} &bull; ₹{item.price} each</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-xs text-gray-900">₹{(item.total || item.price * item.quantity).toLocaleString('en-IN')}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                No items added to order yet. Add items above to calculate totals.
              </div>
            )}

            {/* Calculations Engine Summary Box */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-gray-700">
                <span>Subtotal ({totalItemsCount} items)</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-gray-200">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountRupees}
                    onChange={(e) => setDiscountRupees(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Delivery Charges (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={deliveryCharges}
                    onChange={(e) => setDeliveryCharges(e.target.value)}
                    placeholder="100"
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">GST Rate (%)</label>
                  <select
                    value={gstPercentage}
                    onChange={(e) => setGstPercentage(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-900 cursor-pointer"
                  >
                    <option value={0}>0% GST</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>
              </div>

              {/* Grand Total Display */}
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Grand Total</span>
                <span className="text-base font-extrabold text-indigo-700 font-mono">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Shipping & Billing Address */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-700" />
              <span>Shipping & Billing Address</span>
            </h3>

            {/* Shipping Address Inputs */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-gray-800">Shipping Address</span>
              <input
                type="text"
                placeholder="Address Line 1 *"
                value={shippingLine1}
                onChange={(e) => setShippingLine1(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={shippingLine2}
                onChange={(e) => setShippingLine2(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City *"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                />
                <input
                  type="text"
                  placeholder="State *"
                  value={shippingState}
                  onChange={(e) => setShippingState(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                />
                <input
                  type="text"
                  placeholder="PIN Code *"
                  value={shippingPincode}
                  onChange={(e) => setShippingPincode(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                />
              </div>
            </div>

            {/* Checkbox for Billing Address */}
            <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer pt-2 border-t border-gray-100">
              <input
                type="checkbox"
                checked={isBillingSame}
                onChange={(e) => setIsBillingSame(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
              />
              <span>Billing address is same as shipping address.</span>
            </label>

            {!isBillingSame && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="block text-xs font-bold text-gray-800">Billing Address</span>
                <input
                  type="text"
                  placeholder="Address Line 1 *"
                  value={billingLine1}
                  onChange={(e) => setBillingLine1(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="City *"
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                  <input
                    type="text"
                    placeholder="State *"
                    value={billingState}
                    onChange={(e) => setBillingState(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                  <input
                    type="text"
                    placeholder="PIN Code *"
                    value={billingPincode}
                    onChange={(e) => setBillingPincode(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Payment & Fulfillment Status */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 cursor-pointer"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Fulfillment Status</label>
              <select
                value={fulfillmentStatus}
                onChange={(e) => setFulfillmentStatus(e.target.value as any)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 cursor-pointer"
              >
                <option value="Fulfilled">Fulfilled</option>
                <option value="Unfulfilled">Unfulfilled</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between bg-white sticky bottom-0">
            <div className="text-xs text-gray-500 font-medium">
              Grand Total: <strong className="font-bold text-gray-900">₹{grandTotal.toLocaleString('en-IN')}</strong>
            </div>

            <div className="flex items-center space-x-2">
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
                <span>{isSaving ? 'Saving Order...' : 'Save Order'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
