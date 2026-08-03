/**
 * bulkProductService.ts
 * Handles: sample Excel generation (600 Men's Wear products), Excel parsing,
 * RSF-numeric unique barcode generation, ImageKit uploads, auto collection creation,
 * and batch Firebase saves for bulk product import.
 */

import * as XLSX from 'xlsx';
import { Product, ProductVariation, VariationSizeItem, Collection } from '../types';
import {
  generateBarcodeDataUrl,
  generateRSFNumericBarcode,
  extractUsedBarcodes
} from './barcodeService';
import { uploadImageToImageKit } from './imagekitService';
import { saveProductToFirestore, getProductsFromFirestore } from './productService';
import { getCollectionsFromFirestore } from './collectionService';
import {
  doc,
  setDoc,
  updateDoc,
  collection as firestoreCollection,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Default fallback image ───────────────────────────────────────────────────
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

// ─── Excel Column Spec ────────────────────────────────────────────────────────

export interface BulkProductRow {
  // Product-level
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

// ─── Sample Data (600 Men's Wear Products Generator) ─────────────────────────

const MEN_CATEGORIES = [
  {
    name: 'Formal Shirts',
    vendor: 'Executive Tailors',
    basePrice: 1999,
    styles: ['Classic Egyptian Cotton', 'Italian Satin', 'Executive Oxford', 'French Cuff', 'Pinpoint Twill', 'Micro Print']
  },
  {
    name: 'Casual Shirts',
    vendor: 'Linen & Co',
    basePrice: 1499,
    styles: ['Pure Linen Summer', 'Washed Indigo Denim', 'Plaid Flannel', 'Cuban Collar Beach', 'Corduroy Oversized', 'Chambray Vintage']
  },
  {
    name: 'T-Shirts & Polos',
    vendor: 'Pima Cotton Studio',
    basePrice: 999,
    styles: ['Pima Cotton Crew Neck', 'Mercerized Polo', 'Streetwear Oversized', 'Pique Striped Polo', 'Thermal Long Sleeve', 'Heavyweight Graphic']
  },
  {
    name: 'Trousers & Chinos',
    vendor: 'FlexFit Tailors',
    basePrice: 1799,
    styles: ['Stretch Cotton Chino', 'Slim Fit Formal', 'Pleated Dress', 'Linen Relaxed Fit', 'Tactical Cargo', 'Tech Stretch Jogger']
  },
  {
    name: 'Jeans & Denim',
    vendor: 'Indigo Denim Co',
    basePrice: 2199,
    styles: ['Raw Selvedge Slim', 'Dark Indigo Tapered', 'Vintage Wash Straight', 'Black Stretch Denim', 'Distressed Urban', 'Skinny Fit Indigo']
  },
  {
    name: 'Suits & Blazers',
    vendor: 'Royal Men Studio',
    basePrice: 7999,
    styles: ['Italian Wool Tuxedo', 'Double Breasted Navy', 'Royal Bandhgala', 'Velvet Evening Tuxedo', 'Linen Summer Blazer', '3-Piece Formal']
  },
  {
    name: 'Kurtas & Ethnic Wear',
    vendor: 'Heritage Men Wear',
    basePrice: 2499,
    styles: ['Silk Blend Festival', 'Chikankari Embroidered', 'Short Cotton Casual', 'Pathani Suit Set', 'Jacquard Nehru Jacket', 'Royal Silk Kurta Pajama']
  },
  {
    name: 'Sherwanis & Indo-Western',
    vendor: 'Royal Groom Studio',
    basePrice: 15999,
    styles: ['Royal Bridal Silk', 'Velvet Embroidered Indo-Western', 'Asymmetric Groom', 'Achkan Style Kurta Set', 'Zari Work Indo-Western', 'Imperial Zardosi']
  },
  {
    name: 'Jackets & Outerwear',
    vendor: 'Urban Leather Craft',
    basePrice: 3499,
    styles: ['Premium Leather Biker', 'Puffer Winter', 'Classic Bomber', 'Denim Trucker', 'Wool Blend Overcoat', 'Utility Trench']
  },
  {
    name: 'Sweaters & Hoodies',
    vendor: 'Knitwear Studio',
    basePrice: 1899,
    styles: ['Cashmere V-Neck Sweater', 'Fleece Pullover Hoodie', 'Chunky Knit Cardigan', 'Full-Zip Heavyweight', 'Merino Wool Crewneck', 'Ribbed Knit Pullover']
  }
];

const VARIANT_COLORS = [
  { name: 'Midnight Black', hex: '#111827' },
  { name: 'Navy Blue', hex: '#1e3a8a' },
];

const VARIANT_SIZES = ['M', 'L'];

export function generateSampleRows(): BulkProductRow[] {
  const rows: BulkProductRow[] = [];
  let productCount = 0;

  // Generate exactly 600 Men's Wear products (60 products per category across 10 categories)
  for (const cat of MEN_CATEGORIES) {
    for (let i = 1; i <= 60; i++) {
      productCount++;
      const styleName = cat.styles[(i - 1) % cat.styles.length];
      const title = `Men's ${styleName} ${cat.name} #${i}`;
      const price = cat.basePrice + (i * 20);
      const compareAtPrice = Math.round(price * 1.25);
      const discountRupees = compareAtPrice - price;

      VARIANT_COLORS.forEach((col) => {
        VARIANT_SIZES.forEach((sz) => {
          rows.push({
            title,
            shortDescription: `Premium Men's Wear - ${title} crafted for style and comfort`,
            longDescription: `Elevate your wardrobe with the ${title}. Tailored from premium fabrics, designed specifically for modern men's fashion. Perfect for business, casual, or festive occasions.`,
            collection: cat.name,
            vendor: cat.vendor,
            price,
            compareAtPrice,
            discountRupees,
            gstPercentage: 5,
            productStatus: 'Active',
            showInOnline: true,
            showInOffline: true,
            color: col.name,
            colorHex: col.hex,
            size: sz,
            sizePrice: price,
            sizeInventory: Math.floor(Math.random() * 20) + 5,
          });
        });
      });
    }
  }

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

  ws['!cols'] = [
    { wch: 40 }, { wch: 50 }, { wch: 70 }, { wch: 25 }, { wch: 25 },
    { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
    { wch: 14 }, { wch: 13 }, { wch: 14 },
    { wch: 16 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 14 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  // Instructions sheet
  const instrData = [
    ['RS Fashions - Men\'s Wear Bulk Product Import Template'],
    [''],
    ['INSTRUCTIONS:'],
    ['1. This template contains 600 Men\'s Wear base products with color and size variations.'],
    ['2. Each row = one Color+Size combination. Repeat product fields for each color/size row.'],
    ['3. Products are grouped by "title". Same title = same product (multiple variants).'],
    ['4. If a collection in the Excel does not exist, it will be automatically created and assigned.'],
    ['5. Barcodes are auto-generated as unique RSF-numeric codes (e.g. RSF-100001).'],
    ['6. IDs (productId, SKU, variantId, sizeId) are auto-generated.'],
    ['7. showInOnline / showInOffline: use TRUE or FALSE.'],
    ['8. productStatus: Active or Draft.'],
    ['9. gstPercentage: 0, 5, 12, 18, or 28.'],
    [''],
    ['COLUMNS:'],
    ['title', 'Product name — required'],
    ['shortDescription', 'Short tagline for product card'],
    ['longDescription', 'Full product description'],
    ['collection', 'e.g. Formal Shirts, Casual Shirts, Suits & Blazers, Sherwanis'],
    ['vendor', 'Brand or vendor name'],
    ['price', 'Base price in ₹ — required'],
    ['compareAtPrice', 'MRP / original price'],
    ['discountRupees', 'Discount amount in ₹'],
    ['gstPercentage', 'GST % (0/5/12/18/28)'],
    ['productStatus', 'Active or Draft'],
    ['showInOnline', 'TRUE or FALSE'],
    ['showInOffline', 'TRUE or FALSE'],
    ['color', 'Color variant name — required'],
    ['colorHex', 'Hex color code e.g. #111827'],
    ['size', 'Size — required (S/M/L/XL/XXL)'],
    ['sizePrice', 'Price override for this specific size'],
    ['sizeInventory', 'Stock count for this size'],
  ];
  const wsInstr = XLSX.utils.aoa_to_sheet(instrData);
  wsInstr['!cols'] = [{ wch: 30 }, { wch: 65 }];
  XLSX.utils.book_append_sheet(wb, wsInstr, 'Instructions');

  XLSX.writeFile(wb, 'RS-Fashions-MensWear-Bulk-Upload-Template.xlsx');
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
    collection: String(r.collection || 'Formal Shirts').trim(),
    vendor: String(r.vendor || 'RS Fashions Men').trim(),
    price: parseFloat(r.price) || 0,
    compareAtPrice: r.compareAtPrice ? parseFloat(r.compareAtPrice) : undefined,
    discountRupees: r.discountRupees ? parseFloat(r.discountRupees) : undefined,
    gstPercentage: r.gstPercentage ? parseInt(r.gstPercentage) : 5,
    productStatus: String(r.productStatus || 'Active').trim(),
    showInOnline: String(r.showInOnline).toUpperCase() !== 'FALSE',
    showInOffline: String(r.showInOffline).toUpperCase() !== 'FALSE',
    color: String(r.color || 'Default').trim(),
    colorHex: String(r.colorHex || '#111827').trim(),
    size: String(r.size || 'M').trim(),
    sizePrice: r.sizePrice ? parseFloat(r.sizePrice) : undefined,
    sizeInventory: r.sizeInventory ? parseInt(r.sizeInventory) : 10,
  })).filter(r => r.title && r.color && r.size);
}

// ─── Group rows → Product[] structure ────────────────────────────────────────

interface ParsedProduct {
  productId: string;
  sku: string;
  row: BulkProductRow;
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
        colorHex: row.colorHex || '#111827',
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

  onProgress({ total: grouped.length, current: 0, currentProductTitle: '', currentStep: 'Preparing collections & barcodes...', done: false, errors: [] });

  // 1. Fetch existing collections to auto-create missing ones
  const existingCollections = await getCollectionsFromFirestore();
  const collectionMap = new Map<string, { id: string; productIds: string[] }>();
  existingCollections.forEach((c) => {
    collectionMap.set(c.name.toLowerCase().trim(), {
      id: c.id,
      productIds: Array.isArray(c.productIds) ? c.productIds : []
    });
  });

  // 2. Fetch existing products to ensure RSF-numeric barcode uniqueness
  const existingProducts = await getProductsFromFirestore();
  const { usedBarcodes, maxCounter } = extractUsedBarcodes(existingProducts);
  const barcodeCounterRef = { value: maxCounter };

  for (let pi = 0; pi < grouped.length; pi++) {
    const prod = grouped[pi];
    const { productId, sku, row } = prod;

    try {
      onProgress({
        total: grouped.length, current: pi + 1,
        currentProductTitle: row.title,
        currentStep: 'Managing collection & uploading media...',
        done: false, errors
      });

      // ── AUTO-CREATE OR ASSIGN COLLECTION ──
      const collectionName = (row.collection || 'Formal Shirts').trim();
      const collKey = collectionName.toLowerCase();
      
      if (collectionMap.has(collKey)) {
        const existingColl = collectionMap.get(collKey)!;
        if (!existingColl.productIds.includes(productId)) {
          existingColl.productIds.push(productId);
          try {
            const collRef = doc(db, 'collections', existingColl.id);
            await updateDoc(collRef, {
              productIds: arrayUnion(productId),
              updatedAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn(`Failed to sync product ID to existing collection "${collectionName}":`, e);
          }
        }
      } else {
        // Create new collection
        try {
          const newCollRef = doc(firestoreCollection(db, 'collections'));
          const newCollData: Collection = {
            id: newCollRef.id,
            name: collectionName,
            description: `${collectionName} Collection for Men's Wear`,
            image: DEFAULT_PRODUCT_IMAGE,
            productIds: [productId],
            status: 'Active',
            createdAt: new Date().toISOString().split('T')[0]
          };
          await setDoc(newCollRef, newCollData);
          collectionMap.set(collKey, { id: newCollRef.id, productIds: [productId] });
        } catch (e) {
            console.warn(`Failed to auto-create collection "${collectionName}":`, e);
        }
      }

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
          currentStep: `Generating RSF-numeric barcode for variant "${colorName}"...`,
          done: false, errors
        });

        // Generate RSF-numeric barcode for variant
        const varBarcodeCode = generateRSFNumericBarcode(usedBarcodes, barcodeCounterRef);
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
          const sizeBarcodeCode = generateRSFNumericBarcode(usedBarcodes, barcodeCounterRef);
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
        collection: collectionName,
        vendor: row.vendor || 'RS Fashions Men',
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
        category: collectionName,
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
