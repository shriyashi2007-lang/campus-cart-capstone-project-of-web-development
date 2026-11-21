import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Product from '../models/Product.js';

const serverDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(serverDir, '.env') });
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const allowProduction = args.has('--allow-production');
const departmentMap = {
  men: 'Men', women: 'Women', 'food-snacks': 'Food & Beverages', electronics: 'Electronics', stationery: 'Stationery', books: 'Books',
  'hostel-essentials': 'Hostel Essentials', 'daily-essentials': 'Beauty & Personal Care', sports: 'Sports & Fitness',
  fashion: 'Bags & Accessories', 'for-college': 'Bags & Accessories', 'art-supplies': 'Stationery', toys: 'Stationery'
};

function normalize(item, index) {
  const productKey = String(item.id || item.slug || item.name).trim().toLowerCase();
  const department = departmentMap[String(item.category).trim()];
  const price = Number(item.price); const stock = Number(item.stock);
  if (!productKey) throw new Error(`item ${index}: missing stable id`);
  if (!department) throw new Error(`item ${index} (${productKey}): unknown category ${item.category}`);
  if (!Number.isFinite(price) || price < 0) throw new Error(`item ${index} (${productKey}): invalid price`);
  if (!Number.isInteger(stock) || stock < 0) throw new Error(`item ${index} (${productKey}): invalid stock`);
  return { productKey, name: String(item.name).trim(), description: String(item.description || '').trim(), price, ...(item.originalPrice == null ? {} : { originalPrice: Number(item.originalPrice) }), department, category: String(item.category).trim(), image: String(item.image || '').trim(), rating: Number(item.rating || 0), reviews: Number(item.reviewCount || 0), stock, featured: Boolean(item.isFeatured), tags: Array.isArray(item.keywords) ? item.keywords.map(String) : [] };
}

async function main() {
  if (process.env.NODE_ENV === 'production' && !allowProduction) throw new Error('Refusing to seed NODE_ENV=production without --allow-production.');
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI; if (!uri) throw new Error('MONGO_URI/MONGODB_URI is missing from server/.env.');
  const { products } = await import(pathToFileURL(path.resolve(serverDir, '../client/src/data/products.js')).href);
  const failures = []; const normalized = [];
  products.forEach((item, index) => { try { normalized.push(normalize(item, index)); } catch (error) { failures.push(error.message); } });
  const keys = new Set(); normalized.forEach(item => { if (keys.has(item.productKey)) failures.push(`duplicate stable key: ${item.productKey}`); keys.add(item.productKey); });
  const summary = { total: products.length, created: 0, updated: 0, skipped: 0, failed: failures.length };
  if (dryRun) { console.log(JSON.stringify(summary, null, 2)); failures.forEach(f => console.log(`FAILED: ${f}`)); return; }
  console.log(`Seeding database: ${new URL(uri).pathname.replace(/^\//, '') || '(default database)'}`);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  try {
    const ops = normalized.map(item => ({ updateOne: { filter: { productKey: item.productKey }, update: { $set: item }, upsert: true } }));
    if (ops.length) { const result = await Product.bulkWrite(ops, { ordered: false, timestamps: false }); summary.created = result.upsertedCount || 0; summary.updated = result.modifiedCount || 0; summary.skipped = (result.matchedCount || 0) - summary.updated; }
  } finally { await mongoose.disconnect(); }
  console.log(JSON.stringify(summary, null, 2)); failures.forEach(f => console.log(`FAILED: ${f}`)); if (summary.failed) process.exitCode = 1;
}
main().catch(error => { console.error(`Seed failed: ${error.name}: ${error.message}`); process.exitCode = 1; });
