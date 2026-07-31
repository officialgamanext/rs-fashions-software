'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppProvider, useApp } from '../context/AppContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ProgressBar } from './ProgressBar';
import { ProductModal } from './ProductModal';
import { BulkUploadModal } from './BulkUploadModal';
import { QuickSearchModal } from './QuickSearchModal';

const InnerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const {
    products,
    isModalOpen,
    editingProduct,
    isSearchOpen,
    isBulkUploadOpen,
    toastMessage,
    setIsModalOpen,
    setEditingProduct,
    setIsSearchOpen,
    setIsBulkUploadOpen,
    handleSaveProduct
  } = useApp();

  return (
    <div className="min-h-screen bg-[#f1f1f1] flex flex-col font-sans">
      {/* Top Persistent Navigation */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        unreadNotifications={3}
      />

      {/* Navigation Redirection Loading Progress Bar (Just below top header) */}
      <ProgressBar />

      <div className="flex-1 flex">
        {/* Left Persistent Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Route Page Content */}
        <main className="flex-1 overflow-y-auto pb-12">
          {children}
        </main>
      </div>

      {/* Product Create/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />

      {/* Bulk Product Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onImportComplete={() => setIsBulkUploadOpen(false)}
      />

      {/* Quick Search Ctrl+K Modal */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectView={(href) => {
          router.push(href.startsWith('/') ? href : `/${href}`);
          setIsSearchOpen(false);
        }}
        onEditProduct={(p) => {
          setEditingProduct(p);
          setIsModalOpen(true);
          setIsSearchOpen(false);
        }}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1a1a1a] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center space-x-2 border border-gray-800 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export const ClientLayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <InnerLayout>{children}</InnerLayout>
    </AppProvider>
  );
};
