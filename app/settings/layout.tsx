'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Store, 
  Search, 
  CreditCard, 
  Users as UsersIcon, 
  Truck, 
  Receipt, 
  MapPin, 
  Smartphone, 
  Globe, 
  Bell, 
  Lock, 
  FileText, 
  Briefcase,
  Layers,
  ShoppingCart
} from 'lucide-react';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const settingsNavItems = [
    { href: '/settings/general', label: 'General', icon: Store },
    { href: '/settings/plan', label: 'Plan', icon: Briefcase },
    { href: '/settings/billing', label: 'Billing', icon: CreditCard },
    { href: '/settings/users', label: 'Users', icon: UsersIcon },
    { href: '/settings/payments', label: 'Payments', icon: CreditCard },
    { href: '/settings/checkout', label: 'Checkout', icon: ShoppingCart },
    { href: '/settings/customer-accounts', label: 'Customer accounts', icon: UsersIcon },
    { href: '/settings/shipping', label: 'Shipping and delivery', icon: Truck },
    { href: '/settings/taxes', label: 'Taxes and duties', icon: Receipt },
    { href: '/settings/locations', label: 'Locations', icon: MapPin },
    { href: '/settings/apps', label: 'Apps', icon: Smartphone },
    { href: '/settings/sales-channels', label: 'Sales channels', icon: Store },
    { href: '/settings/domains', label: 'Domains', icon: Globe },
    { href: '/settings/customer-events', label: 'Customer events', icon: Layers },
    { href: '/settings/notifications', label: 'Notifications', icon: Bell },
    { href: '/settings/metafields', label: 'Metafields and metaobjects', icon: Layers },
    { href: '/settings/languages', label: 'Languages', icon: Globe },
    { href: '/settings/privacy', label: 'Customer privacy', icon: Lock },
    { href: '/settings/policies', label: 'Policies', icon: FileText },
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
              const isSelected = pathname === item.href || (item.href === '/settings/general' && (pathname === '/settings' || pathname === '/settings/'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-gray-100 text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
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

        {/* Main Right Settings Pane */}
        <div className="flex-1 w-full space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
