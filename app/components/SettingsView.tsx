'use client';

import React, { useState } from 'react';
import { 
  Store, 
  Search, 
  CreditCard, 
  Users as UsersIcon, 
  Shield, 
  Truck, 
  Receipt, 
  MapPin, 
  Smartphone, 
  Globe, 
  Bell, 
  Lock, 
  FileText, 
  ChevronRight, 
  MoreHorizontal,
  Briefcase,
  Layers,
  Sparkles,
  Clock,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editable store defaults state
  const [currency, setCurrency] = useState('US Dollar (USD $)');
  const [backupRegion, setBackupRegion] = useState('United States');
  const [unitSystem, setUnitSystem] = useState('Imperial system');
  const [weightUnit, setWeightUnit] = useState('Pound (lb)');
  const [timezone, setTimezone] = useState('(GMT-05:00) Eastern Time (US & Canada)');

  const settingsNavItems = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'plan', label: 'Plan', icon: Briefcase },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'checkout', label: 'Checkout', icon: ShoppingCartIcon },
    { id: 'customer_accounts', label: 'Customer accounts', icon: UsersIcon },
    { id: 'shipping', label: 'Shipping and delivery', icon: Truck },
    { id: 'taxes', label: 'Taxes and duties', icon: Receipt },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'apps', label: 'Apps', icon: Smartphone },
    { id: 'sales_channels', label: 'Sales channels', icon: Store },
    { id: 'domains', label: 'Domains', icon: Globe },
    { id: 'customer_events', label: 'Customer events', icon: Layers },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'metafields', label: 'Metafields and metaobjects', icon: Layers },
    { id: 'languages', label: 'Languages', icon: Globe },
    { id: 'privacy', label: 'Customer privacy', icon: Lock },
    { id: 'policies', label: 'Policies', icon: FileText },
  ];

  const filteredNavItems = settingsNavItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto text-gray-900 select-none">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Settings Sidebar */}
        <div className="w-full lg:w-72 bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden shrink-0">
          {/* Header Store Profile Card */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 font-bold text-white text-xs flex items-center justify-center shadow-xs">
              MFU
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-gray-900 text-xs truncate">Mommy First USA</h3>
              <p className="text-[11px] text-gray-400 truncate">mommy-first.myshopify.com</p>
            </div>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition"
              />
            </div>
          </div>

          {/* Settings Nav Menu List */}
          <div className="p-2 space-y-0.5 max-h-[600px] overflow-y-auto custom-scrollbar">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-gray-100 text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer User Card */}
          <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 font-bold text-white text-[11px] flex items-center justify-center shadow-xs shrink-0">
              CN
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-gray-900 text-xs truncate">CLICK NOVA</h4>
              <p className="text-[10px] text-gray-400 truncate">connect.clicknova@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Main Right Settings Panel */}
        <div className="flex-1 w-full space-y-6">
          {activeTab === 'general' ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Page Title */}
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-gray-700 stroke-[2]" />
                <h1 className="text-xl font-bold tracking-tight text-gray-900">General</h1>
              </div>

              {/* Section 1: Business Details */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Business details</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Business entity used for financial products, markets, apps, and taxes in this shop
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-white hover:bg-gray-50/50 transition">
                  <div className="flex items-center space-x-3">
                    {/* US Flag SVG */}
                    <div className="w-7 h-5 rounded overflow-hidden border border-gray-200 shadow-xs shrink-0 flex items-center justify-center bg-blue-900 relative">
                      <div className="w-full h-full flex flex-col justify-between">
                        <div className="h-1 bg-red-600"></div>
                        <div className="h-1 bg-white"></div>
                        <div className="h-1 bg-red-600"></div>
                        <div className="h-1 bg-white"></div>
                        <div className="h-1 bg-red-600"></div>
                      </div>
                      <div className="absolute top-0 left-0 w-3 h-2.5 bg-blue-900"></div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">Neomed USA LLC</h3>
                      <p className="text-xs text-gray-500">
                        Multi-member LLC • 9 Preakness Ln, New City, NY 10956, United States
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert("Business details options")}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section 2: Store contact details */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-gray-900">Store contact details</h2>

                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {/* Store Name & Email */}
                  <div 
                    onClick={() => alert("Edit store contact details")}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <Store className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-xs font-bold text-gray-900">Mommy First USA</div>
                        <div className="text-xs text-gray-500">corporate@neomedusa.com · 9143490222</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition" />
                  </div>

                  {/* Store Address */}
                  <div 
                    onClick={() => alert("Edit store address")}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-xs font-bold text-gray-900">Store address</div>
                        <div className="text-xs text-gray-500">9 Preakness Ln, New City New York 10956, United States</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition" />
                  </div>
                </div>
              </div>

              {/* Section 3: Store defaults */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
                <h2 className="text-sm font-bold text-gray-900">Store defaults</h2>

                {/* Currency display */}
                <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-gray-900">Currency display</div>
                    <div className="text-xs text-gray-500">
                      To manage the currencies customers see, go to{' '}
                      <Link href="/markets" className="underline text-gray-800 font-semibold hover:text-black">
                        Markets
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-gray-100 border border-gray-300 text-gray-800 px-3 py-1 rounded-lg text-xs font-semibold">
                      {currency}
                    </span>
                    <button 
                      onClick={() => alert("Currency settings")}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Backup Region Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Backup Region
                  </label>
                  <select
                    value={backupRegion}
                    onChange={(e) => setBackupRegion(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer shadow-2xs"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="European Union">European Union</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">Determines settings for customers outside of your markets</p>
                </div>

                {/* Unit system & Default weight unit grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Unit system
                    </label>
                    <select
                      value={unitSystem}
                      onChange={(e) => setUnitSystem(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer shadow-2xs"
                    >
                      <option value="Imperial system">Imperial system</option>
                      <option value="Metric system">Metric system</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Default weight unit
                    </label>
                    <select
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer shadow-2xs"
                    >
                      <option value="Pound (lb)">Pound (lb)</option>
                      <option value="Ounce (oz)">Ounce (oz)</option>
                      <option value="Kilogram (kg)">Kilogram (kg)</option>
                      <option value="Gram (g)">Gram (g)</option>
                    </select>
                  </div>
                </div>

                {/* Time zone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Time zone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer shadow-2xs"
                  >
                    <option value="(GMT-05:00) Eastern Time (US & Canada)">(GMT-05:00) Eastern Time (US & Canada)</option>
                    <option value="(GMT-06:00) Central Time (US & Canada)">(GMT-06:00) Central Time (US & Canada)</option>
                    <option value="(GMT-07:00) Mountain Time (US & Canada)">(GMT-07:00) Mountain Time (US & Canada)</option>
                    <option value="(GMT-08:00) Pacific Time (US & Canada)">(GMT-08:00) Pacific Time (US & Canada)</option>
                    <option value="(GMT+00:00) London (GMT)">(GMT+00:00) London (GMT)</option>
                    <option value="(GMT+05:30) India Standard Time (IST)">(GMT+05:30) India Standard Time (IST)</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">Sets the time for when orders and analytics are recorded</p>
                </div>

                <div className="pt-2 text-xs text-gray-500 border-t border-gray-100">
                  To change your user level time zone and language visit your{' '}
                  <button onClick={() => alert("Account settings")} className="underline font-semibold text-gray-800 hover:text-black cursor-pointer">
                    account settings
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Sub-tab Coming Soon Placeholder */
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-xs space-y-4 max-w-xl mx-auto my-10 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-[11px] font-bold border border-amber-200">
                  Settings Sub-module Coming Soon
                </span>
                <h2 className="text-base font-bold text-gray-900 pt-2 capitalize">
                  {activeTab.replace('_', ' ')} Settings
                </h2>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  The configuration options for {activeTab.replace('_', ' ')} will be available in an upcoming update.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('general')}
                  className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to General Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper icon component for checkout
function ShoppingCartIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
