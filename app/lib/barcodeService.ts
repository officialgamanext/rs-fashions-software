import JsBarcode from 'jsbarcode';

/**
 * Generates a CODE128 barcode image as a PNG Data URL (base64).
 * Must be called in browser environment.
 */
export function generateBarcodeDataUrl(text: string): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, {
      format: 'CODE128',
      displayValue: true,
      fontSize: 14,
      font: 'monospace',
      textMargin: 4,
      margin: 10,
      width: 2,
      height: 60,
      background: '#ffffff',
      lineColor: '#000000'
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error(`Error generating barcode for text "${text}":`, err);
    return '';
  }
}

/**
 * Generates a unique barcode in the format `RSF-numeric` (e.g., RSF-100001).
 */
export function generateRSFNumericBarcode(
  usedBarcodes: Set<string>,
  counterRef: { value: number }
): string {
  while (true) {
    counterRef.value += 1;
    const code = `RSF-${counterRef.value}`;
    if (!usedBarcodes.has(code)) {
      usedBarcodes.add(code);
      return code;
    }
  }
}

/**
 * Scans products to extract existing barcodes and initialize the barcode counter.
 */
export function extractUsedBarcodes(products: any[]): { usedBarcodes: Set<string>; maxCounter: number } {
  const usedBarcodes = new Set<string>();
  let maxCounter = 100000;

  for (const p of products) {
    if (p.variations && Array.isArray(p.variations)) {
      for (const v of p.variations) {
        if (v.barcode) {
          usedBarcodes.add(v.barcode);
          const match = String(v.barcode).match(/^RSF-(\d+)$/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxCounter) maxCounter = num;
          }
        }
        if (v.sizes && Array.isArray(v.sizes)) {
          for (const s of v.sizes) {
            if (s.barcode) {
              usedBarcodes.add(s.barcode);
              const match = String(s.barcode).match(/^RSF-(\d+)$/i);
              if (match) {
                const num = parseInt(match[1], 10);
                if (!isNaN(num) && num > maxCounter) maxCounter = num;
              }
            }
          }
        }
      }
    }
  }

  return { usedBarcodes, maxCounter };
}

