'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Clock, ArrowLeft } from 'lucide-react';

export default function SettingsSubtabPage() {
  const params = useParams();
  const rawSubtab = (params?.subtab as string) || 'settings';
  
  const formattedTitle = rawSubtab
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-xs space-y-4 max-w-xl mx-auto my-6 animate-fadeIn select-none">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
        <Clock className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-[11px] font-bold border border-amber-200">
          Settings Sub-module Coming Soon
        </span>
        <h2 className="text-lg font-extrabold text-gray-900 pt-2">
          {formattedTitle} Settings
        </h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
          The configuration settings for {formattedTitle.toLowerCase()} will be enabled in an upcoming release.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/settings/general"
          className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center space-x-1.5 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to General Settings</span>
        </Link>
      </div>
    </div>
  );
}
