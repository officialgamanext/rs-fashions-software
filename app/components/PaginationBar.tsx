'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 45,
  onPageChange,
  itemLabel = 'items'
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="p-3.5 border-t border-gray-200 bg-gray-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 font-medium select-none">
      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
        <span>
          Showing <strong className="font-semibold text-gray-900">{startItem}</strong> to{' '}
          <strong className="font-semibold text-gray-900">{endItem}</strong> of{' '}
          <strong className="font-semibold text-gray-900">{totalItems}</strong> {itemLabel}
        </span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500 font-medium">45 per page</span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2.5 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-gray-700 transition flex items-center space-x-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs font-semibold"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-gray-800 font-bold shadow-2xs">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-gray-700 transition flex items-center space-x-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs font-semibold"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
