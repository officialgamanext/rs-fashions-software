'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  Plus, 
  Trash2, 
  MapPin, 
  ShoppingCart, 
  Heart, 
  Package, 
  Globe, 
  Check, 
  ChevronDown,
  ChevronsUpDown,
  MessageSquare,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { Customer, Address, CartItem, WishlistItem, Product, Order } from '../types';
import { useApp } from '../context/AppContext';

export interface CountryOption {
  name: string;
  code: string;
  iso: string;
  flag: string;
}

const COUNTRIES: CountryOption[] = [
  { name: 'India', code: '+91', iso: 'in', flag: '🇮🇳' },
  { name: 'United States', code: '+1', iso: 'us', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', iso: 'gb', flag: '🇬🇧' },
  { name: 'United Arab Emirates', code: '+971', iso: 'ae', flag: '🇦🇪' },
  { name: 'Canada', code: '+1', iso: 'ca', flag: '🇨🇦' },
  { name: 'Australia', code: '+61', iso: 'au', flag: '🇦🇺' },
  { name: 'Singapore', code: '+65', iso: 'sg', flag: '🇸🇬' },
  { name: 'Saudi Arabia', code: '+966', iso: 'sa', flag: '🇸🇦' },
  { name: 'Qatar', code: '+974', iso: 'qa', flag: '🇶🇦' },
  { name: 'Malaysia', code: '+60', iso: 'my', flag: '🇲🇾' },
  { name: 'Nepal', code: '+977', iso: 'np', flag: '🇳🇵' },
  { name: 'Sri Lanka', code: '+94', iso: 'lk', flag: '🇱🇰' }
];

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Partial<Customer>) => Promise<void> | void;
  initialCustomer?: Customer | null;
  products: Product[];
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCustomer,
  products
}) => {
  const { orders: globalOrders = [] } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [language, setLanguage] = useState('English [Default]');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRIES[0]); // Default India 🇮🇳 +91
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Marketing permissions
  const [marketingEmail, setMarketingEmail] = useState(false);
  const [marketingSMS, setMarketingSMS] = useState(false);
  const [marketingWhatsApp, setMarketingWhatsApp] = useState(false);

  // Address Management
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrCountry, setAddrCountry] = useState('India');

  // Cart Management
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCartForm, setShowCartForm] = useState(false);
  const [selectedCartProductId, setSelectedCartProductId] = useState('');
  const [cartQuantity, setCartQuantity] = useState(1);

  // Wishlist Management
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [showWishlistForm, setShowWishlistForm] = useState(false);
  const [selectedWishlistProductId, setSelectedWishlistProductId] = useState('');

  // Orders Management
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [orderTotalInput, setOrderTotalInput] = useState('2499');
  const [orderPaymentStatus, setOrderPaymentStatus] = useState<'Paid' | 'Pending' | 'Refunded'>('Paid');
  const [orderFulfillmentStatus, setOrderFulfillmentStatus] = useState<'Fulfilled' | 'Unfulfilled' | 'In Progress'>('Fulfilled');

  const [isSaving, setIsSaving] = useState(false);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isCountryDropdownOpen) {
          setIsCountryDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCountryDropdownOpen, onClose]);

  useEffect(() => {
    if (initialCustomer) {
      setFirstName(initialCustomer.firstName || '');
      setLastName(initialCustomer.lastName || '');
      setLanguage(initialCustomer.language || 'English [Default]');
      setEmail(initialCustomer.email || '');

      const foundCountry = COUNTRIES.find(c => c.iso === initialCustomer.countryIso || c.code === initialCustomer.phoneCode || c.name === initialCustomer.country) || COUNTRIES[0];
      setSelectedCountry(foundCountry);

      setPhoneNumber(initialCustomer.phoneNumber || '');

      setMarketingEmail(!!initialCustomer.marketingEmail);
      setMarketingSMS(!!initialCustomer.marketingSMS);
      setMarketingWhatsApp(!!initialCustomer.marketingWhatsApp);

      setAddresses(initialCustomer.addresses || []);
      setCartItems(initialCustomer.cartItems || []);
      setWishlistItems(initialCustomer.wishlistItems || []);

      // Filter customer orders from global orders or mock
      const matchedOrders = globalOrders.filter(o => o.customerName === initialCustomer.name);
      if (matchedOrders.length > 0) {
        setCustomerOrders(matchedOrders);
      } else if (initialCustomer.ordersCount > 0) {
        setCustomerOrders([
          {
            id: `ord-demo-${initialCustomer.id}`,
            orderNumber: `#${1000 + Math.floor(Math.random() * 900)}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            customerName: initialCustomer.name,
            total: initialCustomer.totalSpent || 2499,
            paymentStatus: 'Paid',
            fulfillmentStatus: 'Fulfilled',
            itemsCount: 2
          }
        ]);
      } else {
        setCustomerOrders([]);
      }
    } else {
      setFirstName('');
      setLastName('');
      setLanguage('English [Default]');
      setEmail('');
      setSelectedCountry(COUNTRIES[0]); // India default
      setPhoneNumber('');

      setMarketingEmail(false);
      setMarketingSMS(false);
      setMarketingWhatsApp(true); // Default check for WhatsApp

      setAddresses([]);
      setCartItems([]);
      setWishlistItems([]);
      setCustomerOrders([]);
    }
  }, [initialCustomer, isOpen, globalOrders]);

  if (!isOpen) return null;

  // Add Address Handler
  const handleAddAddress = () => {
    if (!addrLine1.trim() || !addrCity.trim()) return;
    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      addressLine1: addrLine1.trim(),
      addressLine2: addrLine2.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      pincode: addrPincode.trim(),
      country: addrCountry,
      isDefault: addresses.length === 0
    };
    setAddresses(prev => [...prev, newAddr]);
    setAddrLine1('');
    setAddrLine2('');
    setAddrCity('');
    setAddrState('');
    setAddrPincode('');
    setShowAddressForm(false);
  };

  const handleRemoveAddress = (addrId: string) => {
    setAddresses(prev => prev.filter(a => a.id !== addrId));
  };

  // Add Cart Item Handler
  const handleAddCartItem = () => {
    if (!selectedCartProductId) return;
    const targetProd = products.find(p => p.id === selectedCartProductId);
    if (!targetProd) return;

    const newItem: CartItem = {
      id: `cart-${Date.now()}`,
      productId: targetProd.id,
      productTitle: targetProd.title,
      productImage: targetProd.media && targetProd.media.length > 0 ? targetProd.media[0] : '',
      quantity: cartQuantity,
      price: targetProd.price || 0
    };
    setCartItems(prev => [...prev, newItem]);
    setSelectedCartProductId('');
    setCartQuantity(1);
    setShowCartForm(false);
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  // Add Wishlist Item Handler
  const handleAddWishlistItem = () => {
    if (!selectedWishlistProductId) return;
    const targetProd = products.find(p => p.id === selectedWishlistProductId);
    if (!targetProd) return;

    const newItem: WishlistItem = {
      id: `wish-${Date.now()}`,
      productId: targetProd.id,
      productTitle: targetProd.title,
      productImage: targetProd.media && targetProd.media.length > 0 ? targetProd.media[0] : '',
      price: targetProd.price || 0
    };
    setWishlistItems(prev => [...prev, newItem]);
    setSelectedWishlistProductId('');
    setShowWishlistForm(false);
  };

  const handleRemoveWishlistItem = (itemId: string) => {
    setWishlistItems(prev => prev.filter(i => i.id !== itemId));
  };

  // Add Order Handler
  const handleAddOrder = () => {
    const num = orderNumberInput.trim() || `#${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedTotal = parseFloat(orderTotalInput) || 0;
    const newOrd: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: num.startsWith('#') ? num : `#${num}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      customerName: `${firstName} ${lastName}`.trim() || 'Customer',
      total: parsedTotal,
      paymentStatus: orderPaymentStatus,
      fulfillmentStatus: orderFulfillmentStatus,
      itemsCount: 1
    };

    setCustomerOrders(prev => [newOrd, ...prev]);
    setOrderNumberInput('');
    setOrderTotalInput('2499');
    setShowOrderForm(false);
  };

  const handleRemoveOrder = (orderId: string) => {
    setCustomerOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() && !lastName.trim()) return;

    setIsSaving(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    
    let locationStr = selectedCountry.name;
    if (addresses.length > 0) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      locationStr = [def.city, def.state, def.country].filter(Boolean).join(', ');
    }

    const calculatedTotalSpent = customerOrders.reduce((acc, o) => acc + (o.total || 0), 0);

    const payload: Partial<Customer> = {
      id: initialCustomer?.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: fullName,
      email: email.trim(),
      phoneCode: selectedCountry.code,
      phoneNumber: phoneNumber.trim(),
      country: selectedCountry.name,
      countryIso: selectedCountry.iso,
      countryFlag: selectedCountry.flag,
      language,
      marketingEmail,
      marketingSMS,
      marketingWhatsApp,
      addresses,
      cartItems,
      wishlistItems,
      ordersCount: customerOrders.length,
      totalSpent: calculatedTotalSpent,
      status: (marketingEmail || marketingSMS || marketingWhatsApp) ? 'Subscribed' : 'Unsubscribed',
      location: locationStr
    };

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      onClick={() => {
        setIsCountryDropdownOpen(false);
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 cursor-pointer overflow-y-auto"
    >
      <div 
        onClick={(e) => {
          e.stopPropagation();
        }} 
        className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150 cursor-default flex flex-col my-auto max-h-[94vh]"
      >
        {/* Header matching screenshot breadcrumb */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400">&rsaquo;</span>
            <span className="font-bold text-gray-900">
              {initialCustomer ? `Edit customer: ${initialCustomer.name}` : 'New customer'}
            </span>
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

        {/* Form Body matching screenshot cards */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Card 1: Customer Overview */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Customer overview</h3>

            {/* First Name & Last Name Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Ananya"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Sharma"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
              >
                <option value="English [Default]">English [Default]</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
                <option value="Tamil">Tamil</option>
                <option value="Marathi">Marathi</option>
                <option value="Gujarati">Gujarati</option>
              </select>
              <p className="text-[11px] text-gray-500 mt-1">This customer will receive notifications in this language.</p>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                <span>Email</span>
                <span className="text-[11px] text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Phone Number with Mobile-Optimized Crisp Flag Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone number
              </label>
              <div className="flex items-center space-x-2 relative">
                {/* Custom Crisp Flag Dropdown Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="bg-white border border-gray-300 hover:bg-gray-50 rounded-lg px-2.5 py-2 text-xs font-bold text-gray-900 flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer shadow-2xs shrink-0"
                  >
                    <img
                      src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`}
                      alt={selectedCountry.name}
                      className="w-5 h-3.5 object-cover rounded-xs border border-gray-200 shrink-0"
                    />
                    <span className="text-gray-700 font-mono text-xs">{selectedCountry.code}</span>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
                  </button>

                  {/* Mobile-Friendly Dropdown Popover */}
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 z-40 bg-white border border-gray-200 rounded-xl shadow-xl py-1 max-h-56 overflow-y-auto w-64 animate-in fade-in zoom-in-95">
                      {COUNTRIES.map((cnt) => (
                        <button
                          key={cnt.name}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(cnt);
                            setIsCountryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 cursor-pointer transition ${
                            selectedCountry.name === cnt.name ? 'bg-indigo-50/70 text-indigo-900 font-bold' : 'text-gray-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={`https://flagcdn.com/w40/${cnt.iso}.png`}
                              alt={cnt.name}
                              className="w-5 h-3.5 object-cover rounded-xs border border-gray-200 shrink-0"
                            />
                            <span className="font-semibold text-xs">{cnt.name}</span>
                          </div>
                          <span className="text-gray-500 font-mono text-[11px] font-bold">{cnt.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="9876543210"
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Marketing Checkboxes matching screenshot */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="flex items-center space-x-2.5 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingEmail}
                  onChange={(e) => setMarketingEmail(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                />
                <span>Customer agreed to receive marketing emails.</span>
              </label>

              <label className="flex items-center space-x-2.5 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingSMS}
                  onChange={(e) => setMarketingSMS(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                />
                <span>Customer agreed to receive SMS marketing text messages.</span>
              </label>

              <label className="flex items-center space-x-2.5 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingWhatsApp}
                  onChange={(e) => setMarketingWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                />
                <span className="flex items-center space-x-1 font-semibold text-emerald-800">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Customer agreed to receive WhatsApp marketing messages.</span>
                </span>
              </label>
            </div>

            {/* Notice Footer Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[11px] text-gray-600">
              You should ask your customers for permission before you subscribe them to your marketing emails, SMS, or WhatsApp messages.
            </div>
          </div>

          {/* Card 2: Default Address matching screenshot */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Default address</h3>
              <p className="text-xs text-gray-500">The primary address of this customer</p>
            </div>

            {/* Display Saved Addresses */}
            {addresses.length > 0 && (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">
                        {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                      </span>
                      <span className="text-gray-600 block">
                        {addr.city}, {addr.state} - {addr.pincode}, {addr.country}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAddress(addr.id)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Address Button & Sub-Form */}
            {showAddressForm ? (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-gray-900">Add New Address</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Address Line 1 *"
                    value={addrLine1}
                    onChange={(e) => setAddrLine1(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2 (Optional)"
                    value={addrLine2}
                    onChange={(e) => setAddrLine2(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="City *"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="State *"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="PIN Code *"
                      value={addrPincode}
                      onChange={(e) => setAddrPincode(e.target.value)}
                      className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="text-xs text-gray-600 hover:text-gray-900 font-semibold px-3 py-1.5 rounded-lg border bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="text-xs text-white bg-[#1a1a1a] hover:bg-[#333] font-semibold px-4 py-1.5 rounded-lg"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="w-full border border-gray-300 hover:border-gray-900 rounded-xl p-3 text-xs font-semibold text-gray-800 flex items-center justify-between transition cursor-pointer bg-white"
              >
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-gray-600" />
                  <span>Add address</span>
                </div>
                <span className="text-gray-400">&rsaquo;</span>
              </button>
            )}
          </div>

          {/* Card 3: Orders List & Add Order Section */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Orders History ({customerOrders.length})</span>
                </h3>
                <p className="text-xs text-gray-500">Orders placed by or assigned to this customer</p>
              </div>

              {!showOrderForm && (
                <button
                  type="button"
                  onClick={() => setShowOrderForm(true)}
                  className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg hover:bg-emerald-100 transition cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Order</span>
                </button>
              )}
            </div>

            {/* Display Customer Orders List */}
            {customerOrders.length > 0 ? (
              <div className="space-y-2">
                {customerOrders.map((ord) => (
                  <div key={ord.id} className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">{ord.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.paymentStatus}
                        </span>
                        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          {ord.fulfillmentStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center space-x-2">
                        <span>{ord.date}</span>
                        <span>&bull;</span>
                        <span className="font-bold text-gray-800">₹{(ord.total || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveOrder(ord.id)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                      title="Unlink Order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                No order history for this customer yet.
              </div>
            )}

            {/* Add Order Sub-Form */}
            {showOrderForm && (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-gray-900">Add Order Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Order Number</label>
                    <input
                      type="text"
                      placeholder="e.g. #1008"
                      value={orderNumberInput}
                      onChange={(e) => setOrderNumberInput(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Total Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="2499"
                      value={orderTotalInput}
                      onChange={(e) => setOrderTotalInput(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Payment Status</label>
                    <select
                      value={orderPaymentStatus}
                      onChange={(e) => setOrderPaymentStatus(e.target.value as any)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 cursor-pointer"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Fulfillment Status</label>
                    <select
                      value={orderFulfillmentStatus}
                      onChange={(e) => setOrderFulfillmentStatus(e.target.value as any)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 cursor-pointer"
                    >
                      <option value="Fulfilled">Fulfilled</option>
                      <option value="Unfulfilled">Unfulfilled</option>
                      <option value="In Progress">In Progress</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowOrderForm(false)}
                    className="text-xs text-gray-600 font-semibold px-3 py-1.5 rounded-lg border bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddOrder}
                    className="text-xs text-white bg-[#1a1a1a] hover:bg-[#333] font-semibold px-4 py-1.5 rounded-lg"
                  >
                    Save Order
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Cart Items List */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                  <ShoppingCart className="w-4 h-4 text-indigo-600" />
                  <span>Cart Items ({cartItems.length})</span>
                </h3>
                <p className="text-xs text-gray-500">Items currently in customer's cart</p>
              </div>

              {!showCartForm && (
                <button
                  type="button"
                  onClick={() => setShowCartForm(true)}
                  className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-100 transition cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Cart Item</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cartItems.length > 0 && (
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productTitle} className="w-8 h-8 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-gray-900 block">{item.productTitle}</span>
                        <span className="text-[10px] text-gray-500">Qty: {item.quantity} &bull; ₹{item.price}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCartItem(item.id)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Cart Picker Form */}
            {showCartForm && (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl space-y-2">
                <select
                  value={selectedCartProductId}
                  onChange={(e) => setSelectedCartProductId(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                >
                  <option value="">Select a Product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} - ₹{p.price}</option>
                  ))}
                </select>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCartForm(false)}
                    className="text-xs text-gray-600 font-semibold px-3 py-1 rounded-lg border bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCartItem}
                    className="text-xs text-white bg-[#1a1a1a] font-semibold px-3 py-1 rounded-lg"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 5: Wishlist Items List */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                  <Heart className="w-4 h-4 text-rose-600" />
                  <span>Wishlist Items ({wishlistItems.length})</span>
                </h3>
                <p className="text-xs text-gray-500">Items saved in customer's wishlist</p>
              </div>

              {!showWishlistForm && (
                <button
                  type="button"
                  onClick={() => setShowWishlistForm(true)}
                  className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg hover:bg-rose-100 transition cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Wishlist Item</span>
                </button>
              )}
            </div>

            {/* Wishlist Items List */}
            {wishlistItems.length > 0 && (
              <div className="space-y-2">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productTitle} className="w-8 h-8 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-gray-900 block">{item.productTitle}</span>
                        <span className="text-[10px] text-gray-500">₹{item.price}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveWishlistItem(item.id)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Wishlist Picker Form */}
            {showWishlistForm && (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl space-y-2">
                <select
                  value={selectedWishlistProductId}
                  onChange={(e) => setSelectedWishlistProductId(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                >
                  <option value="">Select a Product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} - ₹{p.price}</option>
                  ))}
                </select>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowWishlistForm(false)}
                    className="text-xs text-gray-600 font-semibold px-3 py-1 rounded-lg border bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddWishlistItem}
                    className="text-xs text-white bg-[#1a1a1a] font-semibold px-3 py-1 rounded-lg"
                  >
                    Add to Wishlist
                  </button>
                </div>
              </div>
            )}
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
              <span>{isSaving ? 'Saving Customer...' : 'Save Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
