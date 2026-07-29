'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ShoppingCart, 
  Tag, 
  Users, 
  TrendingUp, 
  Percent, 
  FileText, 
  Globe, 
  Landmark, 
  BarChart3, 
  Store, 
  Bot, 
  Image as ImageIcon, 
  Settings, 
  ChevronDown, 
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { orders } = useApp();
  const [productsExpanded, setProductsExpanded] = useState(true);

  const mainNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/orders', label: 'Orders', icon: ShoppingCart, badge: orders.length },
    { 
      href: '/products', 
      label: 'Products', 
      icon: Tag, 
      hasSubNav: true,
      subItems: [
        { href: '/collections', label: 'Collections' },
        { href: '/inventory', label: 'Inventory' },
        { href: '/gift-cards', label: 'Gift cards' }
      ]
    },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/growth', label: 'Growth', icon: TrendingUp },
    { href: '/discounts', label: 'Discounts', icon: Percent },
    { href: '/content', label: 'Content', icon: FileText },
    { href: '/markets', label: 'Markets', icon: Globe },
    { href: '/finance', label: 'Finance', icon: Landmark },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <aside className="w-60 bg-[#ebebeb] border-r border-[#dcdcdc] flex flex-col justify-between h-[calc(100vh-3.5rem)] text-gray-800 select-none text-xs font-medium sticky top-14">
      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar">
        {/* Main Items */}
        <div className="space-y-0.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isProductsRoute = ['/products', '/collections', '/inventory', '/gift-cards'].includes(pathname);
            const isSelected = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            if (item.hasSubNav) {
              return (
                <div key={item.href} className="space-y-0.5">
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                        isProductsRoute 
                          ? 'bg-white text-gray-900 shadow-sm font-semibold' 
                          : 'hover:bg-[#e1e1e1] text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => setProductsExpanded(!productsExpanded)}
                      className="p-1.5 hover:bg-[#e1e1e1] rounded-md text-gray-500 cursor-pointer"
                    >
                      {productsExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Sub-items */}
                  {productsExpanded && (
                    <div className="pl-9 pr-1 space-y-0.5">
                      {item.subItems?.map((sub) => {
                        const isSubSelected = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`block w-full text-left px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                              isSubSelected 
                                ? 'bg-white text-gray-900 font-semibold shadow-sm' 
                                : 'hover:bg-[#e1e1e1] text-gray-600'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-white text-gray-900 font-semibold shadow-sm' 
                    : 'hover:bg-[#e1e1e1] text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-[#e3e3e3] text-gray-700 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border border-gray-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sales Channels */}
        <div className="pt-2 border-t border-[#d5d5d5]">
          <div className="flex items-center justify-between px-2.5 pb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            <span>Sales channels</span>
            <button className="hover:bg-gray-300 p-0.5 rounded transition cursor-pointer">
              <ChevronRight className="w-3 h-3 text-gray-500" />
            </button>
          </div>
          <div className="space-y-0.5">
            <Link 
              href="/online-store"
              className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                pathname === '/online-store'
                  ? 'bg-white text-gray-900 font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-[#e1e1e1]'
              }`}
            >
              <Store className="w-4 h-4 text-gray-600" />
              <span>Online Store</span>
            </Link>

            <Link 
              href="/agentic"
              className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                pathname === '/agentic'
                  ? 'bg-white text-gray-900 font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-[#e1e1e1]'
              }`}
            >
              <Bot className="w-4 h-4 text-gray-600" />
              <span>Agentic</span>
            </Link>
          </div>
        </div>

        {/* Apps */}
        <div className="pt-2 border-t border-[#d5d5d5]">
          <div className="flex items-center justify-between px-2.5 pb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            <span>Apps</span>
            <button className="hover:bg-gray-300 p-0.5 rounded transition cursor-pointer">
              <ChevronRight className="w-3 h-3 text-gray-500" />
            </button>
          </div>
          <div className="space-y-0.5">
            <Link 
              href="/export-images"
              className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                pathname === '/export-images'
                  ? 'bg-white text-gray-900 font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-[#e1e1e1]'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-gray-600" />
              <span className="truncate">CS - Export Images</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-auto"></span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Settings */}
      <div className="p-2 border-t border-[#dcdcdc] bg-[#e6e6e6]">
        <Link 
          href="/settings"
          className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-lg transition cursor-pointer ${
            pathname.startsWith('/settings') 
              ? 'bg-white text-gray-900 font-semibold shadow-sm' 
              : 'hover:bg-[#dcdcdc] text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4 text-gray-600" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};
