'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Volume2, VolumeX, RefreshCw, Zap, ScanBarcode, ArrowRight, Tag, Search } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product } from '../types';

interface SuggestionItem {
  id: string;
  barcode: string;
  title: string;
  sku: string;
  price: number;
  image?: string;
  variantInfo?: string;
}

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isActive: boolean;
  products?: Product[];
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, isActive, products = [] }) => {
  const [manualInput, setManualInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanFlash, setScanFlash] = useState(false);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const isComponentMounted = useRef(true);
  const scannerContainerId = 'interactive-barcode-reader';
  const lastScanTimestamp = useRef<number>(0);

  // Extract all searchable barcode items from products list
  const suggestionPool: SuggestionItem[] = [];
  products.forEach((p) => {
    if (p.sku || p.id) {
      suggestionPool.push({
        id: `p-${p.id}`,
        barcode: p.sku || p.id,
        title: p.title,
        sku: p.sku || p.id,
        price: p.price,
        image: (p.media && p.media.length > 0) ? p.media[0] : undefined
      });
    }
    if (p.variations && p.variations.length > 0) {
      p.variations.forEach((v) => {
        if (v.sku || v.barcode) {
          suggestionPool.push({
            id: `v-${v.id}`,
            barcode: v.sku || v.barcode || p.sku,
            title: p.title,
            sku: v.sku || v.barcode || p.sku,
            price: p.price,
            image: (p.media && p.media.length > 0) ? p.media[0] : undefined,
            variantInfo: `Color: ${v.color}`
          });
        }
        if (v.sizes && v.sizes.length > 0) {
          v.sizes.forEach((s, sIdx) => {
            if (s.sku || s.barcode) {
              suggestionPool.push({
                id: `vs-${v.id}-${sIdx}`,
                barcode: s.sku || s.barcode || v.sku || p.sku,
                title: p.title,
                sku: s.sku || s.barcode || v.sku || p.sku,
                price: s.price || p.price,
                image: (p.media && p.media.length > 0) ? p.media[0] : undefined,
                variantInfo: `${v.color} / ${s.size}`
              });
            }
          });
        }
      });
    }
  });

  // Filter suggestions based on manualInput
  const filteredSuggestions = manualInput.trim().length > 0 
    ? suggestionPool.filter(item => 
        item.barcode.toLowerCase().includes(manualInput.trim().toLowerCase()) ||
        item.title.toLowerCase().includes(manualInput.trim().toLowerCase()) ||
        item.sku.toLowerCase().includes(manualInput.trim().toLowerCase())
      ).slice(0, 6)
    : [];

  // Play audio beep notification on scan using Web Audio API synthesizer
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio beep error:', e);
    }
  };

  // Hardware Scanner Global Keyboard Listener
  useEffect(() => {
    let keyBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        keyBuffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (keyBuffer.trim().length >= 3) {
          const scanned = keyBuffer.trim();
          handleScannedBarcode(scanned);
          keyBuffer = '';
        }
      } else if (e.key.length === 1) {
        keyBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleScannedBarcode = (code: string) => {
    const now = Date.now();
    if (code === lastScannedCode && now - lastScanTimestamp.current < 800) {
      return;
    }
    lastScanTimestamp.current = now;
    setLastScannedCode(code);

    playBeep();
    setScanFlash(true);
    setTimeout(() => setScanFlash(false), 400);

    onScan(code);
  };

  // Get available camera devices
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices.map(d => ({ id: d.id, label: d.label || `Camera ${d.id}` })));
          const backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch((err) => {
        console.warn('Unable to get cameras:', err);
      });
  }, []);

  // Start Camera Scanning (explicitly requests browser camera permissions on click)
  const startScanner = async (cameraIdToUse?: string) => {
    setCameraError(null);
    try {
      // 1. Explicitly request camera media stream to trigger browser permission prompt dialog
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const tempStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          tempStream.getTracks().forEach(track => track.stop());
        } catch (permErr: any) {
          console.warn('getUserMedia permission result:', permErr);
        }
      }

      // 2. Fetch available camera devices list
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices.map(d => ({ id: d.id, label: d.label || `Camera ${d.id}` })));
      }

      // 3. Stop existing scanner instance if active
      if (html5QrcodeRef.current) {
        try {
          if (html5QrcodeRef.current.isScanning) {
            await html5QrcodeRef.current.stop().catch(() => {});
          }
          html5QrcodeRef.current.clear();
        } catch (e) {}
      }

      const html5Qrcode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE
        ],
        verbose: false
      });
      html5QrcodeRef.current = html5Qrcode;

      const targetCamera = cameraIdToUse || selectedCameraId || (devices && devices.length > 0 ? devices[0].id : { facingMode: 'environment' });

      await html5Qrcode.start(
        targetCamera,
        {
          fps: 20,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.777778
        },
        (decodedText) => {
          handleScannedBarcode(decodedText);
        },
        () => {}
      ).catch((startErr) => {
        // Ignore video play interruption error on quick tab switch or unmount
        if (String(startErr).includes('interrupted') || String(startErr).includes('removed')) {
          return;
        }
        throw startErr;
      });

      if (isComponentMounted.current) {
        setIsScanning(true);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (isComponentMounted.current) {
        if (errMsg.includes('interrupted') || errMsg.includes('removed')) {
          setIsScanning(false);
          return;
        }
        if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission denied')) {
          setCameraError('Camera access is blocked by your browser. Please click the camera/lock icon in your browser address bar to allow camera access, then click "Start Camera" again.');
        } else {
          setCameraError(errMsg || 'Unable to access camera device.');
        }
        setIsScanning(false);
      }
    }
  };

  // Stop Camera Scanner
  const stopScanner = async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop().catch(() => {});
        }
        html5QrcodeRef.current.clear();
      } catch (e) {}
    }
    if (isComponentMounted.current) {
      setIsScanning(false);
    }
  };

  // Auto start camera when active tab
  useEffect(() => {
    isComponentMounted.current = true;
    if (isActive) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      isComponentMounted.current = false;
      stopScanner();
    };
  }, [isActive, selectedCameraId]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScannedBarcode(manualInput.trim());
      setManualInput('');
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (barcode: string) => {
    handleScannedBarcode(barcode);
    setManualInput('');
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 space-y-4">
      {/* Top Header & Controls */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ScanBarcode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">High-Speed Camera Barcode Scanner</h3>
            <p className="text-[11px] text-gray-500">Continuous scanner for product barcodes & SKUs</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Beep Sound' : 'Enable Beep Sound'}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 cursor-pointer transition ${
              soundEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Camera Selection */}
          {cameras.length > 1 && (
            <select
              value={selectedCameraId}
              onChange={(e) => {
                setSelectedCameraId(e.target.value);
                startScanner(e.target.value);
              }}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 font-medium focus:outline-none"
            >
              {cameras.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          )}

          {/* Start/Stop Camera */}
          <button
            onClick={isScanning ? stopScanner : () => startScanner()}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition shadow-xs ${
              isScanning 
                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isScanning ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                <span>Stop Camera</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Start Camera</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Live Camera Viewport */}
      <div className="relative bg-black rounded-xl overflow-hidden min-h-[240px] flex items-center justify-center border border-gray-800 shadow-inner">
        {/* Flash Effect on Scan */}
        {scanFlash && (
          <div className="absolute inset-0 bg-emerald-400/30 z-30 pointer-events-none animate-ping duration-150" />
        )}

        {/* Live Scanner Video Container */}
        <div id={scannerContainerId} className="w-full h-full max-h-[320px] object-cover" />

        {/* Custom Overlay Grid when Scanning */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
            <div className="w-[280px] h-[160px] border-2 border-emerald-400/90 rounded-lg relative shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400" />

              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d199] absolute top-1/2 -translate-y-1/2 animate-pulse" />
            </div>

            <div className="mt-3 bg-black/70 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-full font-mono flex items-center space-x-1.5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Point camera at product barcode</span>
            </div>
          </div>
        )}

        {/* Camera Off / Error Fallback Overlay */}
        {!isScanning && (
          <div className="p-6 text-center text-gray-400 space-y-3 z-20">
            {cameraError ? (
              <div className="max-w-sm mx-auto space-y-2 bg-gray-900/90 p-4 rounded-xl border border-gray-800 backdrop-blur-xs">
                <CameraOff className="w-8 h-8 mx-auto text-amber-400" />
                <p className="text-gray-200 text-xs font-medium leading-relaxed">{cameraError}</p>
                <button
                  onClick={() => startScanner()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition inline-flex items-center space-x-1.5 shadow-md cursor-pointer mt-1"
                >
                  <Camera className="w-4 h-4" />
                  <span>Activate Camera Scanner</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Camera className="w-10 h-10 mx-auto text-gray-600" />
                <p className="text-xs text-gray-300 font-medium">Camera scanner is currently turned off</p>
                <button
                  onClick={() => startScanner()}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition inline-flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Activate Camera Scanner</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Barcode Input with Real-time Suggestions Dropdown */}
      <form onSubmit={handleManualSubmit} className="pt-1 relative">
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Scan with Hardware Gun or Type Barcode / SKU
        </label>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={manualInput}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setManualInput(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="e.g. Type SKU or Barcode ID (RSF-100293)..."
              className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-xs font-mono text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            {manualInput && (
              <button
                type="button"
                onClick={() => {
                  setManualInput('');
                  setShowSuggestions(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!manualInput.trim()}
            className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center space-x-1 cursor-pointer shrink-0"
          >
            <span>Add Item</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Real-time Barcode ID Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in duration-150">
            <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
              <span>Barcode ID Suggestions ({filteredSuggestions.length})</span>
              <button 
                type="button" 
                onClick={() => setShowSuggestions(false)}
                className="hover:text-gray-700 text-[11px]"
              >
                Close
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto divide-y divide-gray-100">
              {filteredSuggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(item.barcode)}
                  className="w-full p-2.5 flex items-center justify-between text-left hover:bg-emerald-50/60 transition cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                        <Tag className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-gray-900 group-hover:text-emerald-700 transition truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500 flex items-center space-x-1.5">
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">{item.barcode}</span>
                        {item.variantInfo && <span>• {item.variantInfo}</span>}
                      </div>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs text-gray-900 shrink-0 ml-2">₹{item.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Last Scanned Code Feedback Banner */}
      {lastScannedCode && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-lg text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Last scanned barcode: <strong className="font-mono font-bold">{lastScannedCode}</strong></span>
          </div>
          <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Scanned</span>
        </div>
      )}
    </div>
  );
};
