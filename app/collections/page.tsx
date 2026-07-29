'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { CollectionsView } from '../components/CollectionsView';
import { CollectionModal } from '../components/CollectionModal';

export default function CollectionsPage() {
  const {
    collections,
    isLoadingCollections,
    products,
    isCollectionModalOpen,
    editingCollection,
    setIsCollectionModalOpen,
    setEditingCollection,
    handleSaveCollection,
    handleDeleteCollection
  } = useApp();

  return (
    <>
      <CollectionsView
        collections={collections}
        products={products}
        isLoadingCollections={isLoadingCollections}
        onAddCollectionClick={() => {
          setEditingCollection(null);
          setIsCollectionModalOpen(true);
        }}
        onEditCollection={(collection) => {
          setEditingCollection(collection);
          setIsCollectionModalOpen(true);
        }}
        onDeleteCollection={handleDeleteCollection}
      />

      <CollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => {
          setIsCollectionModalOpen(false);
          setEditingCollection(null);
        }}
        onSave={handleSaveCollection}
        initialCollection={editingCollection}
        products={products}
      />
    </>
  );
}
