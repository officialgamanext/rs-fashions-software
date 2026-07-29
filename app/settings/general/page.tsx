'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Store, MapPin, MoreHorizontal, ChevronRight } from 'lucide-react';

export default function GeneralSettingsPage() {
  const [currency, setCurrency] = useState('US Dollar (USD $)');
  const [backupRegion, setBackupRegion] = useState('United States');
  const [unitSystem, setUnitSystem] = useState('Imperial system');
  const [weightUnit, setWeightUnit] = useState('Pound (lb)');
  const [timezone, setTimezone] = useState('(GMT-05:00) Eastern Time (US & Canada)');

  return (
    <div className="space-y-6 animate-fadeIn select-none">
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

      {/* Section 2: Store Contact Details */}
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

      {/* Section 3: Store Defaults */}
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
  );
}
