/**
 * bulkProductService.ts
 * Handles: sample Excel generation, Excel parsing, barcode generation,
 * ImageKit uploads, and batch Firebase saves for bulk product import.
 */

import * as XLSX from 'xlsx';
import { Product, ProductVariation, VariationSizeItem } from '../types';
import { generateBarcodeDataUrl } from './barcodeService';
import { uploadImageToImageKit } from './imagekitService';
import { saveProductToFirestore } from './productService';

// ─── Default fallback image (public domain white placeholder via picsum) ───────
const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80';

// ─── ID / SKU Generators ──────────────────────────────────────────────────────

function randHex(len: number): string {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}
function generateProductSku(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return 'RSF-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
function generateProductId(): string { return `PROD-${randHex(16)}`; }
function generateVariantSku(parentSku: string, color: string): string {
  return `${parentSku}-${color.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5) || 'VAR'}`;
}
function generateVariantId(): string { return `VAR-${randHex(8)}`; }
function generateSizeSku(variantSku: string, size: string): string {
  return `${variantSku}-${size.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4) || 'SZ'}`;
}
function generateSizeId(): string { return `SZE-${randHex(8)}`; }

// ─── Excel Column Spec (what the template contains) ──────────────────────────

export interface BulkProductRow {
  // Product-level (repeated for each variant-size row)
  title: string;
  shortDescription?: string;
  longDescription?: string;
  collection?: string;
  vendor?: string;
  price: number;
  compareAtPrice?: number;
  discountRupees?: number;
  gstPercentage?: number;
  productStatus?: string;     // 'Active' | 'Draft'
  showInOnline?: boolean;
  showInOffline?: boolean;
  // Variant-level
  color: string;
  colorHex?: string;
  // Size-level
  size: string;
  sizePrice?: number;
  sizeInventory?: number;
}

// ─── Sample Data (90 rows) ───────────────────────────────────────────────────

const SAMPLE_PRODUCTS = [
  { title: 'Royal Silk Kanjivaram Saree', collection: 'Sarees', vendor: 'Kanjivaram Guild', price: 8999, compare: 11999 },
  { title: 'Banarasi Zari Lehenga', collection: 'Lehengas', vendor: 'Royal Weaves', price: 15999, compare: 19999 },
  { title: 'Cotton Printed Kurta', collection: 'Kurtis & Tunics', vendor: 'RS Fashions In-House', price: 1299, compare: 1799 },
  { title: 'Chiffon Party Saree', collection: 'Sarees', vendor: 'Silk Paradise', price: 3499, compare: 4999 },
  { title: 'Embroidered Salwar Suit', collection: 'Salwar Suits', vendor: 'CraftVeda', price: 4999, compare: 6499 },
  { title: 'Designer Indo-Western Gown', collection: 'Indo-Western', vendor: 'Apex Textiles', price: 12999, compare: 16999 },
  { title: 'Bridal Silk Lehenga Set', collection: 'Bridal Wear', vendor: 'Royal Weaves', price: 34999, compare: 44999 },
  { title: 'Festive Anarkali Suit', collection: 'Festive Collection', vendor: 'Heritage Fabrics', price: 7499, compare: 9999 },
  { title: 'Georgette Floral Saree', collection: 'Sarees', vendor: 'Silk Paradise', price: 2799, compare: 3599 },
  { title: 'Denim Casual Jeans', collection: 'Western Wear', vendor: 'RS Fashions In-House', price: 1899, compare: 2499 },
];

const COLORS = [
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Emerald Green', hex: '#059669' },
];

const SIZES = ['S', 'M', 'L'];

export function generateSampleRows(): BulkProductRow[] {
  const rows: BulkProductRow[] = [];
  SAMPLE_PRODUCTS.forEach((prod, pi) => {
    COLORS.forEach((col) => {
      SIZES.forEach((sz) => {
        rows.push({
          title: prod.title,
          shortDescription: `Premium quality ${prod.title.toLowerCase()} – perfect for festive occasions`,
          longDescription: `This exquisite ${prod.title.toLowerCase()} is crafted with the finest fabrics, offering a blend of tradition and modern style. Ideal for weddings, festivals, and special occasions. Available in multiple sizes for the perfect fit.`,
          collection: prod.collection,
          vendor: prod.vendor,
          price: prod.price,
          compareAtPrice: prod.compare,
          discountRupees: Math.round((prod.compare - prod.price) * 0.5),
          gstPercentage: 5,
          productStatus: 'Active',
          showInOnline: true,
          showInOffline: true,
          color: col.name,
          colorHex: col.hex,
          size: sz,
          sizePrice: prod.price,
          sizeInventory: Math.floor(Math.random() * 15) + 5,
        });
      });
    });
  });
  return rows;
}

// ─── Download Sample Excel ────────────────────────────────────────────────────

export function downloadSampleExcel(): void {
  const rows = generateSampleRows();

  const sheetData = [
    // Header row
    [
      'title', 'shortDescription', 'longDescription', 'collection', 'vendor',
      'price', 'compareAtPrice', 'discountRupees', 'gstPercentage',
      'productStatus', 'showInOnline', 'showInOffline',
      'color', 'colorHex', 'size', 'sizePrice', 'sizeInventory'
    ],
    // Data rows
    ...rows.map(r => [
      r.title, r.shortDescription || '', r.longDescription || '',
      r.collection || '', r.vendor || '',
      r.price, r.compareAtPrice || '', r.discountRupees || '', r.gstPercentage || 5,
      r.productStatus || 'Active',
      r.showInOnline ? 'TRUE' : 'FALSE',
      r.showInOffline ? 'TRUE' : 'FALSE',
      r.color, r.colorHex || '', r.size,
      r.sizePrice || r.price, r.sizeInventory || 10
    ])
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Column widths
  ws['!cols'] = [
    { wch: 35 }, { wch: 50 }, { wch: 70 }, { wch: 20 }, { wch: 25 },
    { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
    { wch: 14 }, { wch: 13 }, { wch: 14 },
    { wch: 16 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 14 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  // Instructions sheet
  const instrData = [
    ['RS Fashions - Bulk Product Import Template'],
    [''],
    ['INSTRUCTIONS:'],
    ['1. Each row = one Color+Size combination. Repeat product fields for each color/size row.'],
    ['2. Products are grouped by "title". Same title = same product (multiple variants).'],
    ['3. Images are optional. A default image will be used if not provided.'],
    ['4. Barcodes are auto-generated during import — do NOT add them manually.'],
    ['5. IDs (productId, SKU, variantId, sizeId) are all auto-generated — leave blank.'],
    ['6. showInOnline / showInOffline: use TRUE or FALSE'],
    ['7. productStatus: Active or Draft'],
    ['8. gstPercentage: 0, 5, 12, 18, or 28'],
    ['9. colorHex: optional hex code like #dc2626'],
    [''],
    ['COLUMNS:'],
    ['title', 'Product name — required'],
    ['shortDescription', 'Short tagline for product card'],
    ['longDescription', 'Full product description'],
    ['collection', 'e.g. Sarees, Lehengas, Kurtis & Tunics'],
    ['vendor', 'e.g. RS Fashions In-House'],
    ['price', 'Base price in ₹ — required'],
    ['compareAtPrice', 'MRP / original price'],
    ['discountRupees', 'Discount amount in ₹'],
    ['gstPercentage', 'GST % (0/5/12/18/28)'],
    ['productStatus', 'Active or Draft'],
    ['showInOnline', 'TRUE or FALSE'],
    ['showInOffline', 'TRUE or FALSE'],
    ['color', 'Color variant name — required'],
    ['colorHex', 'Hex color code e.g. #dc2626'],
    ['size', 'Size — required (S/M/L/XL/XXL/XS/Free Size)'],
    ['sizePrice', 'Price override for this specific size'],
    ['sizeInventory', 'Stock count for this size'],
  ];
  const wsInstr = XLSX.utils.aoa_to_sheet(instrData);
  wsInstr['!cols'] = [{ wch: 30 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsInstr, 'Instructions');

  XLSX.writeFile(wb, 'RS-Fashions-Bulk-Upload-Template.xlsx');
}

// ─── Parse uploaded Excel ─────────────────────────────────────────────────────

export function parseProductExcel(buffer: ArrayBuffer): BulkProductRow[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

  return raw.map((r): BulkProductRow => ({
    title: String(r.title || '').trim(),
    shortDescription: String(r.shortDescription || '').trim(),
    longDescription: String(r.longDescription || '').trim(),
    collection: String(r.collection || 'Sarees').trim(),
    vendor: String(r.vendor || 'RS Fashions In-House').trim(),
    price: parseFloat(r.price) || 0,
    compareAtPrice: r.compareAtPrice ? parseFloat(r.compareAtPrice) : undefined,
    discountRupees: r.discountRupees ? parseFloat(r.discountRupees) : undefined,
    gstPercentage: r.gstPercentage ? parseInt(r.gstPercentage) : 5,
    productStatus: String(r.productStatus || 'Active').trim(),
    showInOnline: String(r.showInOnline).toUpperCase() !== 'FALSE',
    showInOffline: String(r.showInOffline).toUpperCase() !== 'FALSE',
    color: String(r.color || 'Default').trim(),
    colorHex: String(r.colorHex || '#999999').trim(),
    size: String(r.size || 'Free Size').trim(),
    sizePrice: r.sizePrice ? parseFloat(r.sizePrice) : undefined,
    sizeInventory: r.sizeInventory ? parseInt(r.sizeInventory) : 10,
  })).filter(r => r.title && r.color && r.size);
}

// ─── Group rows → Product[] structure ────────────────────────────────────────

interface ParsedProduct {
  productId: string;
  sku: string;
  row: BulkProductRow; // representative product-level row
  variants: Map<string, { variantId: string; variantSku: string; colorHex: string; sizes: BulkProductRow[] }>;
}

function groupRowsIntoProducts(rows: BulkProductRow[]): ParsedProduct[] {
  const productMap = new Map<string, ParsedProduct>();

  for (const row of rows) {
    const titleKey = row.title.toLowerCase().trim();
    if (!productMap.has(titleKey)) {
      const newSku = generateProductSku();
      productMap.set(titleKey, {
        productId: generateProductId(),
        sku: newSku,
        row,
        variants: new Map()
      });
    }
    const prod = productMap.get(titleKey)!;
    const colorKey = row.color.toLowerCase().trim();
    if (!prod.variants.has(colorKey)) {
      const variantSku = generateVariantSku(prod.sku, row.color);
      prod.variants.set(colorKey, {
        variantId: generateVariantId(),
        variantSku,
        colorHex: row.colorHex || '#999999',
        sizes: []
      });
    }
    prod.variants.get(colorKey)!.sizes.push(row);
  }

  return Array.from(productMap.values());
}

// ─── Progress callback type ───────────────────────────────────────────────────

export interface BulkImportProgress {
  total: number;
  current: number;
  currentProductTitle: string;
  currentStep: string;
  done: boolean;
  errors: string[];
}

// ─── Main Import Function ─────────────────────────────────────────────────────

export async function importProductsFromExcel(
  buffer: ArrayBuffer,
  onProgress: (p: BulkImportProgress) => void
): Promise<{ imported: number; errors: string[] }> {
  const rows = parseProductExcel(buffer);
  const grouped = groupRowsIntoProducts(rows);
  const errors: string[] = [];
  let imported = 0;

  onProgress({ total: grouped.length, current: 0, currentProductTitle: '', currentStep: 'Preparing...', done: false, errors: [] });

  for (let pi = 0; pi < grouped.length; pi++) {
    const prod = grouped[pi];
    const { productId, sku, row } = prod;

    try {
      onProgress({
        total: grouped.length, current: pi + 1,
        currentProductTitle: row.title,
        currentStep: 'Uploading default product image...',
        done: false, errors
      });

      // Default image — upload to ImageKit
      let finalMediaUrl = DEFAULT_PRODUCT_IMAGE;
      try {
        finalMediaUrl = await uploadImageToImageKit(
          DEFAULT_PRODUCT_IMAGE,
          `product-${productId}-img-1.jpg`,
          '/product-images'
        );
      } catch {
        // keep default URL on upload failure
      }

      const finalVariations: ProductVariation[] = [];
      const variantEntries = Array.from(prod.variants.entries());

      for (let vi = 0; vi < variantEntries.length; vi++) {
        const [, variant] = variantEntries[vi];
        const { variantId, variantSku, colorHex, sizes } = variant;
        const colorName = sizes[0].color;

        onProgress({
          total: grouped.length, current: pi + 1,
          currentProductTitle: row.title,
          currentStep: `Generating barcode for variant "${colorName}"...`,
          done: false, errors
        });

        // Generate + upload variant-level barcode
        const varBarcodeCode = variantSku;
        const varBarcodeDataUrl = generateBarcodeDataUrl(varBarcodeCode);
        let varBarcodeUrl = '';
        if (varBarcodeDataUrl) {
          try {
            varBarcodeUrl = await uploadImageToImageKit(
              varBarcodeDataUrl,
              `barcode-${productId}-var-${vi + 1}.png`,
              '/barcodes'
            );
          } catch { /* keep empty on failure */ }
        }

        // Per-size barcodes
        const sizeItems: VariationSizeItem[] = [];
        for (let si = 0; si < sizes.length; si++) {
          const sizeRow = sizes[si];
          const sizeSku = generateSizeSku(variantSku, sizeRow.size);
          const sizeBarcodeCode = sizeSku;
          const sizeBarcodeDataUrl = generateBarcodeDataUrl(sizeBarcodeCode);
          let sizeBarcodeUrl = '';
          if (sizeBarcodeDataUrl) {
            try {
              const cleanSize = sizeRow.size.toUpperCase().replace(/[^A-Z0-9]/g, '');
              sizeBarcodeUrl = await uploadImageToImageKit(
                sizeBarcodeDataUrl,
                `barcode-${productId}-var-${vi + 1}-${cleanSize}.png`,
                '/barcodes'
              );
            } catch { /* keep empty */ }
          }

          sizeItems.push({
            size: sizeRow.size,
            sku: sizeSku,
            productId: generateSizeId(),
            price: sizeRow.sizePrice || sizeRow.price,
            inventory: sizeRow.sizeInventory || 10,
            barcode: sizeBarcodeCode,
            barcodeUrl: sizeBarcodeUrl
          });
        }

        finalVariations.push({
          id: variantId,
          sku: variantSku,
          productId: variantId,
          color: colorName,
          colorHex,
          barcode: varBarcodeCode,
          barcodeUrl: varBarcodeUrl,
          sizes: sizeItems
        });
      }

      // Total inventory = sum of all sizes
      const totalInventory = finalVariations.reduce(
        (sum, v) => sum + v.sizes.reduce((s2, s) => s2 + (s.inventory || 0), 0), 0
      );

      onProgress({
        total: grouped.length, current: pi + 1,
        currentProductTitle: row.title,
        currentStep: 'Saving to Firebase...',
        done: false, errors
      });

      const isActive = (row.productStatus || 'Active').toLowerCase() === 'active';

      await saveProductToFirestore({
        id: productId,
        title: row.title,
        shortDescription: row.shortDescription || '',
        longDescription: row.longDescription || '',
        collection: row.collection || 'Sarees',
        vendor: row.vendor || 'RS Fashions In-House',
        price: row.price,
        compareAtPrice: row.compareAtPrice,
        discountRupees: row.discountRupees,
        gstPercentage: row.gstPercentage || 5,
        sku,
        inventory: totalInventory,
        variations: finalVariations,
        media: [finalMediaUrl],
        isActive,
        showInOnline: row.showInOnline ?? true,
        showInOffline: row.showInOffline ?? true,
        status: isActive ? 'Active' : 'Draft',
        category: row.collection || 'Ethnic Wear',
        productType: 'Fashion Apparel',
        channels: (row.showInOnline ? 1 : 0) + (row.showInOffline ? 1 : 0),
        catalogs: 1,
        imageBgColor: 'bg-emerald-500',
        iconName: 'package'
      });

      imported++;
    } catch (err: any) {
      const msg = `"${row.title}": ${err?.message || 'Unknown error'}`;
      errors.push(msg);
      console.error('Bulk import error for product:', msg, err);
    }
  }

  onProgress({
    total: grouped.length, current: grouped.length,
    currentProductTitle: '', currentStep: 'Import complete!',
    done: true, errors
  });

  return { imported, errors };
}
