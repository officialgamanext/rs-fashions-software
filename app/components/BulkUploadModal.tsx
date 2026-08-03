'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Package,
  Barcode,
  Image as ImageIcon,
  Flame,
  TriangleAlert
} from 'lucide-react';
import {
  downloadSampleExcel,
  importProductsFromExcel,
  BulkImportProgress
} from '../lib/bulkProductService';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

type ModalStep = 'idle' | 'importing' | 'done';

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [step, setStep] = useState<ModalStep>('idle');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<BulkImportProgress | null>(null);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetModal = () => {
    setStep('idle');
    setSelectedFile(null);
    setProgress(null);
    setResult(null);
    setIsDragOver(false);
  };

  const handleClose = () => {
    if (step === 'importing') return; // block close during import
    resetModal();
    onClose();
  };

  // File selection
  const handleFileSelected = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Please select a valid Excel file (.xlsx, .xls) or CSV.');
      return;
    }
    setSelectedFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  // Start Import
  const handleStartImport = async () => {
    if (!selectedFile) return;
    setStep('importing');
    setResult(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const res = await importProductsFromExcel(buffer, (p) => {
        setProgress({ ...p });
      });
      setResult(res);
      setStep('done');
      if (res.imported > 0) onImportComplete();
    } catch (err: any) {
      setResult({ imported: 0, errors: [`Fatal error: ${err?.message || 'Unknown error'}`] });
      setStep('done');
    }
  };

  if (!isOpen) return null;

  const progressPercent = progress
    ? Math.round((progress.current / Math.max(progress.total, 1)) * 100)
    : 0;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 cursor-default overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Bulk Product Import</h2>
              <p className="text-[11px] text-gray-400">Upload Excel → Auto-generate IDs, barcodes → Save to Firebase</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={step === 'importing'}
            className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition cursor-pointer disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* ── STEP: IDLE / FILE SELECT ── */}
          {step === 'idle' && (
            <>
              {/* Feature badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { icon: Package, label: 'Auto Product IDs', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
                  { icon: Barcode, label: 'Auto Barcodes', color: 'text-purple-600 bg-purple-50 border-purple-200' },
                  { icon: Upload, label: 'ImageKit Upload', color: 'text-blue-600 bg-blue-50 border-blue-200' },
                  { icon: ImageIcon, label: 'Default Images', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className={`flex items-center space-x-1.5 px-2.5 py-2 rounded-xl border text-[11px] font-semibold ${color}`}>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Download Sample */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-900">Download Sample Excel Template</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    Includes <strong>600 Men's Wear sample products</strong> with color and size variations across 10 fashion categories.
                  </p>
                </div>
                <button
                  onClick={downloadSampleExcel}
                  className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>

              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-50'
                    : selectedFile
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-300 bg-gray-50/50 hover:border-gray-900 hover:bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileInput}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className="text-sm font-bold text-emerald-800">{selectedFile.name}</div>
                    <div className="text-[11px] text-emerald-600">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Click to change file
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-gray-800">
                      {isDragOver ? 'Drop your Excel file here' : 'Click or drag & drop your Excel file'}
                    </div>
                    <div className="text-[11px] text-gray-400">Supports .xlsx, .xls, .csv</div>
                  </div>
                )}
              </div>

              {/* Info note */}
              <div className="flex items-start space-x-2 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <TriangleAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Import may take several minutes for large files — barcodes are generated and uploaded to ImageKit for each variant + size combination.
                  <strong> Do not close this window</strong> during import.
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  onClick={handleClose}
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartImport}
                  disabled={!selectedFile}
                  className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-6 py-2 rounded-xl transition flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Flame className="w-4 h-4" />
                  <span>Start Import</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          {/* ── STEP: IMPORTING ── */}
          {step === 'importing' && progress && (
            <div className="space-y-5 py-2">
              {/* Overall progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-700">
                    Processing product {progress.current} of {progress.total}
                  </span>
                  <span className="text-indigo-600">{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Current product card */}
              {progress.currentProductTitle && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-indigo-900">{progress.currentProductTitle}</div>
                      <div className="text-[11px] text-indigo-600 mt-0.5">{progress.currentStep}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step indicators */}
              <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                {[
                  { icon: ImageIcon, label: 'Uploading product image to ImageKit', done: progress.currentStep.includes('barcode') || progress.currentStep.includes('Firebase') || progress.currentStep.includes('complete') },
                  { icon: Barcode, label: 'Generating & uploading barcodes to ImageKit', done: progress.currentStep.includes('Firebase') || progress.currentStep.includes('complete') },
                  { icon: Package, label: 'Saving product to Firebase Firestore', done: progress.currentStep.includes('complete') },
                ].map(({ icon: Icon, label, done }) => (
                  <div key={label} className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${done ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span className="font-medium">{label}</span>
                    {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
                  </div>
                ))}
              </div>

              {/* Errors so far */}
              {progress.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1 max-h-28 overflow-y-auto">
                  <div className="text-[11px] font-bold text-red-700 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" /><span>{progress.errors.length} error(s) so far</span>
                  </div>
                  {progress.errors.map((e, i) => (
                    <div key={i} className="text-[10px] text-red-600 font-mono">• {e}</div>
                  ))}
                </div>
              )}

              <div className="text-center text-[11px] text-gray-400 font-medium">
                Please wait — do not close this window...
              </div>
            </div>
          )}

          {/* ── STEP: DONE ── */}
          {step === 'done' && result && (
            <div className="space-y-5 py-2">
              {/* Result hero */}
              <div className={`rounded-2xl p-6 text-center border ${result.errors.length === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${result.errors.length === 0 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                  {result.errors.length === 0
                    ? <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                    : <AlertCircle className="w-9 h-9 text-amber-600" />
                  }
                </div>
                <div className={`text-2xl font-bold mb-1 ${result.errors.length === 0 ? 'text-emerald-900' : 'text-amber-900'}`}>
                  {result.imported} Product{result.imported !== 1 ? 's' : ''} Imported
                </div>
                <div className={`text-xs ${result.errors.length === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {result.errors.length === 0
                    ? 'All products imported successfully with barcodes & ImageKit uploads!'
                    : `Imported with ${result.errors.length} error(s). Check details below.`
                  }
                </div>
              </div>

              {/* What was done */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Products Saved', value: result.imported, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
                  { label: 'Barcodes Generated', value: `Auto`, color: 'text-purple-700 bg-purple-50 border-purple-200' },
                  { label: 'Errors', value: result.errors.length, color: result.errors.length > 0 ? 'text-red-700 bg-red-50 border-red-200' : 'text-gray-500 bg-gray-50 border-gray-200' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`rounded-xl border p-3 ${color}`}>
                    <div className="text-lg font-bold">{value}</div>
                    <div className="text-[10px] font-semibold mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Error list */}
              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1 max-h-36 overflow-y-auto">
                  <div className="text-xs font-bold text-red-700 mb-1">Import Errors:</div>
                  {result.errors.map((e, i) => (
                    <div key={i} className="text-[10px] text-red-600 font-mono">• {e}</div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => { resetModal(); }}
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Import More
                </button>
                <button
                  onClick={handleClose}
                  className="bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-6 py-2 rounded-xl transition flex items-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
