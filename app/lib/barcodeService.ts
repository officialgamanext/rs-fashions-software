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
