'use client';

import React from 'react';
import { Search, Eye, Bell, ChevronDown, Store } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  unreadNotifications: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, unreadNotifications }) => {
  return (
    <header className="h-14 bg-[#1a1a1a] text-white px-3 flex items-center justify-between border-b border-[#2b2b2b] sticky top-0 z-30 select-none">
      {/* Left logo section */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 cursor-pointer hover:opacity-90 transition-opacity">
          {/* Shopify SVG Icon */}
          <div className="w-7 h-7 bg-[#95bf47] rounded flex items-center justify-center font-bold text-black text-xs shadow-sm">
            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.4 6.7c-.1-.3-.4-.5-.7-.5-.2 0-3.3.4-3.3.4s-2.3-2.3-2.5-2.5c-.3-.3-.7-.2-.9.1l-.8 1.4-1.6.4s-.5.1-.6.4c-.1.2-.1.5.1.7l1.2 1.3-.3 1.8c0 .3.1.6.4.7.1.1.3.1.4.1.1 0 .2 0 .3-.1l1.6-.9 1.6.9c.1.1.3.1.4.1.1 0 .3 0 .4-.1.3-.1.4-.4.4-.7l-.3-1.8 1.2-1.3c.2-.2.3-.5.2-.7zm-4.7 1.8l-1.3-.7-1.3.7.3-1.5-.9-1 1.4-.2.6-1.3.6 1.3 1.4.2-.9 1 .3 1.5z"/>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/>
            </svg>
          </div>
          <span className="font-semibold tracking-tight text-white text-base">shopify</span>
          <span className="text-[11px] bg-[#333333] text-gray-300 font-medium px-2 py-0.5 rounded-full border border-gray-700">
            Spring '26
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-xl mx-4 flex items-center space-x-2">
        <button
          onClick={onOpenSearch}
          className="flex-1 bg-[#262626] hover:bg-[#303030] border border-[#3b3b3b] rounded-lg h-9 px-3 flex items-center justify-between text-gray-300 text-xs transition-all shadow-inner group"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400 group-hover:text-white" />
            <span className="text-gray-400 group-hover:text-gray-200">Search</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="bg-[#181818] border border-gray-700 text-gray-400 text-[10px] px-1.5 py-0.5 rounded font-mono">CTRL</kbd>
            <kbd className="bg-[#181818] border border-gray-700 text-gray-400 text-[10px] px-1.5 py-0.5 rounded font-mono">K</kbd>
          </div>
        </button>

        <button 
          onClick={() => alert("Preview store feature enabled: Viewing live storefront.")}
          className="bg-[#262626] hover:bg-[#333333] border border-[#3b3b3b] text-gray-200 text-xs font-medium px-3 h-9 rounded-lg flex items-center space-x-1.5 transition"
        >
          <Eye className="w-4 h-4 text-gray-300" />
          <span>View as</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Incognito / Developer icon */}
        <button className="text-gray-400 hover:text-white transition p-1.5 rounded-md hover:bg-[#2b2b2b]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457-.337-2.836-.935-4.062"/>
          </svg>
        </button>

        {/* Notifications bell */}
        <div className="relative cursor-pointer hover:bg-[#2b2b2b] p-1.5 rounded-md transition">
          <Bell className="w-4 h-4 text-gray-300" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1a1a1a]">
              {unreadNotifications}
            </span>
          )}
        </div>

        {/* Store badge profile menu */}
        <div className="flex items-center space-x-1.5 bg-[#262626] hover:bg-[#333333] border border-[#3b3b3b] rounded-lg px-2.5 py-1 cursor-pointer transition">
          <span className="w-5 h-5 rounded bg-pink-600 font-bold text-[10px] text-white flex items-center justify-center">
            MFU
          </span>
          <span className="text-xs font-medium text-gray-200 hidden sm:inline">Mommy First USA</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>
    </header>
  );
};
