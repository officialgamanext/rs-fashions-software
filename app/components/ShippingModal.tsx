'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Truck, Scale, Package, DollarSign, Check, Info } from 'lucide-react';
import { ShippingMethod, ShippingRuleType } from '../types';

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (method: Partial<ShippingMethod>) => Promise<void> | void;
  initialMethod?: ShippingMethod | null;
}

export const ShippingModal: React.FC<ShippingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMethod
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ShippingRuleType>('weight');
  const [minWeight, setMinWeight] = useState('0');
  const [maxWeight, setMaxWeight] = useState('5');
  const [minQuantity, setMinQuantity] = useState('1');
  const [maxQuantity, setMaxQuantity] = useState('10');
  const [amount, setAmount] = useState('99');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const [isSaving, setIsSaving] = useState(false);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (initialMethod) {
      setTitle(initialMethod.title || '');
      setType(initialMethod.type || 'weight');
      setMinWeight(initialMethod.minWeight !== undefined ? String(initialMethod.minWeight) : '0');
      setMaxWeight(initialMethod.maxWeight !== undefined ? String(initialMethod.maxWeight) : '5');
      setMinQuantity(initialMethod.minQuantity !== undefined ? String(initialMethod.minQuantity) : '1');
      setMaxQuantity(initialMethod.maxQuantity !== undefined ? String(initialMethod.maxQuantity) : '10');
      setAmount(initialMethod.amount !== undefined ? String(initialMethod.amount) : '99');
      setStatus(initialMethod.status || 'Active');
    } else {
      setTitle('Standard Express Delivery');
      setType('weight');
      setMinWeight('0');
      setMaxWeight('5');
      setMinQuantity('1');
      setMaxQuantity('10');
      setAmount('99');
      setStatus('Active');
    }
  }, [initialMethod, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);

    const payload: Partial<ShippingMethod> = {
      id: initialMethod?.id,
      title: title.trim(),
      type,
      amount: parseFloat(amount) || 0,
      status,
      ...(type === 'weight' ? {
        minWeight: parseFloat(minWeight) || 0,
        maxWeight: parseFloat(maxWeight) || 0
      } : {}),
      ...(type === 'quantity' ? {
        minQuantity: parseInt(minQuantity, 10) || 1,
        maxQuantity: parseInt(maxQuantity, 10) || 1
      } : {})
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
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 cursor-pointer overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150 cursor-default flex flex-col my-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {initialMethod ? 'Edit Shipping Method' : 'Add Shipping Method'}
              </h2>
              <p className="text-xs text-gray-500">Configure delivery charges based on weight, quantity, or flat rate</p>
            </div>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Method Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Method Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Standard Express Delivery, Heavy Freight Rate"
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-2xs"
            />
          </div>

          {/* Shipping Calculation Rule Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Rate Calculation Rule
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('weight')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  type === 'weight'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Based on Weight</span>
              </button>

              <button
                type="button"
                onClick={() => setType('quantity')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  type === 'quantity'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Based on Quantity</span>
              </button>

              <button
                type="button"
                onClick={() => setType('flat')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  type === 'flat'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Flat Rate</span>
              </button>
            </div>
          </div>

          {/* Dynamic Threshold Fields */}
          {type === 'weight' && (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2 animate-in fade-in">
              <span className="block text-xs font-bold text-gray-800 flex items-center space-x-1">
                <Scale className="w-3.5 h-3.5 text-indigo-600" />
                <span>Weight Range Thresholds (in kg)</span>
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Min Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={minWeight}
                    onChange={(e) => setMinWeight(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Max Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={maxWeight}
                    onChange={(e) => setMaxWeight(e.target.value)}
                    placeholder="5"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'quantity' && (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2 animate-in fade-in">
              <span className="block text-xs font-bold text-gray-800 flex items-center space-x-1">
                <Package className="w-3.5 h-3.5 text-indigo-600" />
                <span>Item Quantity Range Thresholds</span>
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Min Quantity (items)</label>
                  <input
                    type="number"
                    min="1"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    placeholder="1"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Max Quantity (items)</label>
                  <input
                    type="number"
                    min="1"
                    value={maxQuantity}
                    onChange={(e) => setMaxQuantity(e.target.value)}
                    placeholder="10"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Amount (₹) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Shipping Rate Amount (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-gray-500">₹</span>
              <input
                type="number"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="99"
                className="w-full bg-white border border-gray-300 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-2xs"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Enter 0 for Free Shipping.</p>
          </div>

          {/* Status Toggle */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Status</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setStatus('Active')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  status === 'Active'
                    ? 'bg-[#d1f4e0] text-[#007a5a] border border-emerald-300'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus('Inactive')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  status === 'Inactive'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-2">
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
              <span>{isSaving ? 'Saving Rate...' : 'Save Method'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
