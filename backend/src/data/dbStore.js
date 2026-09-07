import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  products as seedProducts, 
  sampleOrders as seedOrders,
  categories as seedCategories,
  sampleVouchers as seedVouchers,
  sampleReviews as seedReviews,
  sampleConsultations as seedConsultations
} from './seedData.js';
import { query, isNeonConnected, initNeonDb } from './neonDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const defaultUsers = [
  {
    id: 'user-admin',
    email: 'admin@khanhvymade.vn',
    password: 'admin123',
    fullName: 'Quản Trị Viên KhánhVyMade',
    phone: '0988668899',
    address: 'Xưởng Chế Tác KhánhVyMade, 128 Nguyễn Trãi, Hà Nội',
    role: 'admin',
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'user-01',
    email: 'khachhang@gmail.com',
    password: '123',
    fullName: 'Lê Thảo Nhi',
    phone: '0912345678',
    address: 'Số 24 ngõ 81 Láng Hạ, Đống Đa, Hà Nội',
    role: 'customer',
    createdAt: '2026-09-05T10:30:00.000Z'
  },
  {
    id: 'user-02',
    email: 'artisan@khanhvymade.vn',
    password: '123',
    fullName: 'Nghệ nhân KhánhVyMade',
    phone: '0988776655',
    address: 'Xưởng Đan Vòng KhánhVyMade',
    role: 'artisan',
    createdAt: '2026-09-02T14:15:00.000Z'
  }
];

// Initialize local memory/disk store across all 10 tables
let memoryData = {
  users: [...defaultUsers],
  categories: [...seedCategories],
  products: [...seedProducts],
  orders: [...seedOrders],
  orderItems: [],
  reviews: [...seedReviews],
  vouchers: [...seedVouchers],
  wishlists: [],
  customDesigns: [],
  consultations: [...seedConsultations]
};

// Load existing db.json if present
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    memoryData.products = [...seedProducts];
    if (parsed.orders) memoryData.orders = parsed.orders;
    if (parsed.users) memoryData.users = parsed.users;
    if (parsed.categories) memoryData.categories = parsed.categories;
    if (parsed.vouchers) memoryData.vouchers = parsed.vouchers;
    if (parsed.reviews) memoryData.reviews = parsed.reviews;
    if (parsed.wishlists) memoryData.wishlists = parsed.wishlists;
    if (parsed.customDesigns) memoryData.customDesigns = parsed.customDesigns;
    if (parsed.consultations) memoryData.consultations = parsed.consultations;
    if (parsed.orderItems) memoryData.orderItems = parsed.orderItems;
    console.log('📁 Đã nạp dữ liệu từ tệp lưu trữ vật lý local db.json (10 bảng).');
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryData, null, 2), 'utf8');
    console.log('📁 Đã khởi tạo tệp cơ sở dữ liệu vật lý db.json (10 bảng).');
  }
} catch (e) {
  console.warn('Lỗi đọc db.json:', e.message);
}

const saveToDisk = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryData, null, 2), 'utf8');
  } catch (e) {
    console.error('Lỗi ghi db.json:', e.message);
  }
};

// ==================== NEON POSTGRESQL SYNC & SETUP ====================

export const ensureNeonTables = async () => {
  if (!isNeonConnected()) return false;

  const createTablesSql = `
    -- 1. USERS
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      address TEXT,
      role VARCHAR(50) DEFAULT 'customer',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

    -- 2. CATEGORIES
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      icon VARCHAR(50),
      description TEXT,
      banner_image TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. PRODUCTS
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      menh JSONB,
      price NUMERIC NOT NULL,
      original_price NUMERIC,
      rating NUMERIC DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      tag VARCHAR(100),
      stone_type VARCHAR(255),
      cord_type VARCHAR(255),
      bead_size VARCHAR(50),
      artisan_name VARCHAR(255),
      lead_time VARCHAR(255),
      description TEXT,
      meaning TEXT,
      stock INTEGER DEFAULT 20,
      wholesale_price NUMERIC,
      wholesale_min_qty INTEGER DEFAULT 5,
      is_best_seller BOOLEAN DEFAULT false,
      sales_count INTEGER DEFAULT 0,
      cord_composition JSONB,
      images JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_min_qty INTEGER DEFAULT 5;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS cord_composition JSONB;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB;

    -- 4. ORDERS
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50),
      customer_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      address TEXT NOT NULL,
      items JSONB NOT NULL,
      subtotal NUMERIC,
      wholesale_discount NUMERIC DEFAULT 0,
      voucher_discount NUMERIC DEFAULT 0,
      shipping_fee NUMERIC DEFAULT 0,
      total_amount NUMERIC NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'VietQR',
      payment_status VARCHAR(50) DEFAULT 'Chờ thanh toán',
      order_status VARCHAR(100) DEFAULT 'Chờ xác nhận',
      tracking_code VARCHAR(100),
      note TEXT,
      timeline JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id VARCHAR(50);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS wholesale_discount NUMERIC DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_discount NUMERIC DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(100);

    -- 5. ORDER_ITEMS
    CREATE TABLE IF NOT EXISTS order_items (
      id VARCHAR(50) PRIMARY KEY,
      order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id VARCHAR(50),
      product_name VARCHAR(255) NOT NULL,
      price NUMERIC NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      wrist_size VARCHAR(50),
      custom_engraving TEXT,
      item_total NUMERIC NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. REVIEWS
    CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(50) PRIMARY KEY,
      product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id VARCHAR(50),
      customer_name VARCHAR(100) NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      wrist_fit VARCHAR(100),
      comment TEXT NOT NULL,
      is_verified_buyer BOOLEAN DEFAULT true,
      photos JSONB DEFAULT '[]',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. VOUCHERS
    CREATE TABLE IF NOT EXISTS vouchers (
      id VARCHAR(50) PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      discount_type VARCHAR(20) NOT NULL,
      discount_value NUMERIC NOT NULL,
      min_order_value NUMERIC DEFAULT 0,
      max_discount NUMERIC,
      usage_limit INTEGER DEFAULT 500,
      used_count INTEGER DEFAULT 0,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. WISHLISTS
    CREATE TABLE IF NOT EXISTS wishlists (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_user_wishlist_product UNIQUE (user_id, product_id)
    );

    -- 9. CUSTOM_DESIGNS
    CREATE TABLE IF NOT EXISTS custom_designs (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50),
      design_name VARCHAR(255) NOT NULL,
      cord_type VARCHAR(100),
      cord_color VARCHAR(50),
      pattern VARCHAR(100),
      charm VARCHAR(100),
      accent_stone VARCHAR(100),
      wrist_size VARCHAR(50),
      price NUMERIC NOT NULL,
      preview_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 10. CONSULTATIONS
    CREATE TABLE IF NOT EXISTS consultations (
      id VARCHAR(50) PRIMARY KEY,
      customer_name VARCHAR(100) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255),
      menh VARCHAR(50),
      wrist_circumference VARCHAR(50),
      message TEXT,
      status VARCHAR(50) DEFAULT 'Chờ tư vấn',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createTablesSql);
    console.log('✅ Đã xác thực cấu trúc 10 bảng trên Neon PostgreSQL.');
    return true;
  } catch (err) {
    console.error('Lỗi tạo bảng Neon:', err.message);
    return false;
  }
};

export const syncAllDataToNeon = async () => {
  if (!isNeonConnected()) {
    throw new Error('Chưa kết nối Neon PostgreSQL. Vui lòng kiểm tra chuỗi kết nối trong Bảng Quản Trị.');
  }

  await ensureNeonTables();

  let usersSynced = 0;
  let categoriesSynced = 0;
  let productsSynced = 0;
  let ordersSynced = 0;
  let orderItemsSynced = 0;
  let reviewsSynced = 0;
  let vouchersSynced = 0;
  let consultationsSynced = 0;

  // 1. Sync Users
  for (const u of memoryData.users) {
    try {
      await query(
        `INSERT INTO users (id, email, password_hash, full_name, phone, address, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           phone = EXCLUDED.phone,
           address = EXCLUDED.address,
           role = EXCLUDED.role,
           password_hash = EXCLUDED.password_hash`,
        [u.id, u.email, u.password, u.fullName, u.phone || '', u.address || '', u.role, u.createdAt || new Date().toISOString()]
      );
      usersSynced++;
    } catch (e) {
      console.warn(`Lỗi sync user ${u.email}:`, e.message);
    }
  }

  // 2. Sync Categories
  for (const c of (memoryData.categories || [])) {
    if (c.id === 'all' || c.id === 'best-seller') continue;
    try {
      await query(
        `INSERT INTO categories (id, name, slug, icon, description, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           icon = EXCLUDED.icon`,
        [c.id, c.name, c.id, c.icon || 'Sparkles', c.description || c.name, c.displayOrder || 0]
      );
      categoriesSynced++;
    } catch (e) {
      console.warn(`Lỗi sync category ${c.name}:`, e.message);
    }
  }

  // 3. Sync Products
  const currentIds = memoryData.products.map(p => p.id);
  if (currentIds.length > 0) {
    const placeholders = currentIds.map((_, i) => `$${i + 1}`).join(',');
    await query(`DELETE FROM products WHERE id NOT IN (${placeholders})`, currentIds).catch(() => {});
  }
  for (const p of memoryData.products) {
    try {
      await query(
        `INSERT INTO products (
          id, name, category, menh, price, original_price, wholesale_price, wholesale_min_qty,
          is_best_seller, sales_count, cord_composition, rating, reviews_count,
          tag, stone_type, cord_type, bead_size, artisan_name, lead_time,
          description, meaning, stock, images, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          original_price = EXCLUDED.original_price,
          wholesale_price = EXCLUDED.wholesale_price,
          wholesale_min_qty = EXCLUDED.wholesale_min_qty,
          is_best_seller = EXCLUDED.is_best_seller,
          sales_count = EXCLUDED.sales_count,
          cord_composition = EXCLUDED.cord_composition,
          stock = EXCLUDED.stock,
          cord_type = EXCLUDED.cord_type,
          images = EXCLUDED.images,
          description = EXCLUDED.description`,
        [
          p.id, p.name, p.category, JSON.stringify(p.menh || ['Tất cả']),
          p.price, p.originalPrice || p.price, p.wholesalePrice || Math.round(p.price * 0.7), p.wholesaleMinQty || 5,
          Boolean(p.isBestSeller), p.salesCount || 0, JSON.stringify(p.cordComposition || {}),
          p.rating || 5.0, p.reviewsCount || 0,
          p.tag || '', p.stoneType || '', p.cordType || '', p.beadSize || '8mm',
          p.artisanName || 'Nghệ nhân KhánhVyMade', p.leadTime || 'Làm thủ công 2h',
          p.description || '', p.meaning || '', p.stock || 10,
          JSON.stringify(p.images || []), new Date().toISOString()
        ]
      );
      productsSynced++;
    } catch (e) {
      console.warn(`Lỗi sync product ${p.name}:`, e.message);
    }
  }

  // 4. Sync Orders & Order Items
  for (const o of memoryData.orders) {
    try {
      await query(
        `INSERT INTO orders (
          id, user_id, customer_name, phone, address, items, subtotal, wholesale_discount,
          voucher_discount, shipping_fee, total_amount, payment_method, payment_status,
          order_status, tracking_code, note, timeline, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET
          order_status = EXCLUDED.order_status,
          payment_status = EXCLUDED.payment_status,
          timeline = EXCLUDED.timeline`,
        [
          o.id, o.userId || 'user-01', o.customerName, o.phone, o.address, JSON.stringify(o.items || []),
          o.subtotal || o.totalAmount, o.wholesaleDiscount || 0, o.voucherDiscount || 0,
          o.shippingFee || 25000, o.totalAmount, o.paymentMethod || 'VietQR',
          o.paymentStatus || 'Chờ thanh toán', o.orderStatus || 'Chờ xác nhận',
          o.trackingCode || null, o.note || '', JSON.stringify(o.timeline || []), o.createdAt || new Date().toISOString()
        ]
      );
      ordersSynced++;

      // Sync normalized order_items
      if (Array.isArray(o.items)) {
        for (let idx = 0; idx < o.items.length; idx++) {
          const item = o.items[idx];
          const itemId = `${o.id}-item-${idx + 1}`;
          await query(
            `INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, wrist_size, custom_engraving, item_total)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING`,
            [
              itemId, o.id, item.id || null, item.name || 'Vòng tay thủ công',
              item.price || 0, item.quantity || 1, item.wristSize || item.customDetails?.size || '15-16cm',
              item.customDetails?.engravedLetter || null, (item.price || 0) * (item.quantity || 1)
            ]
          ).catch(() => {});
          orderItemsSynced++;
        }
      }
    } catch (e) {
      console.warn(`Lỗi sync order ${o.id}:`, e.message);
    }
  }

  // 5. Sync Vouchers
  for (const v of (memoryData.vouchers || [])) {
    try {
      await query(
        `INSERT INTO vouchers (id, code, discount_type, discount_value, min_order_value, max_discount, usage_limit, used_count, description, is_active, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           discount_value = EXCLUDED.discount_value,
           min_order_value = EXCLUDED.min_order_value,
           usage_limit = EXCLUDED.usage_limit,
           used_count = EXCLUDED.used_count,
           is_active = EXCLUDED.is_active`,
        [
          v.id, v.code, v.discountType, v.discountValue, v.minOrderValue || 0,
          v.maxDiscount || null, v.usageLimit || 500, v.usedCount || 0,
          v.description || '', v.isActive !== false, v.expiresAt || null
        ]
      );
      vouchersSynced++;
    } catch (e) {
      console.warn(`Lỗi sync voucher ${v.code}:`, e.message);
    }
  }

  // 6. Sync Reviews
  for (const r of (memoryData.reviews || [])) {
    try {
      await query(
        `INSERT INTO reviews (id, product_id, user_id, customer_name, rating, wrist_fit, comment, is_verified_buyer, photos, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           rating = EXCLUDED.rating,
           comment = EXCLUDED.comment`,
        [
          r.id, r.productId, r.userId || null, r.customerName, r.rating || 5,
          r.wristFit || 'Vừa vặn chuẩn', r.comment, r.isVerifiedBuyer !== false,
          JSON.stringify(r.photos || []), r.createdAt || new Date().toISOString()
        ]
      );
      reviewsSynced++;
    } catch (e) {
      console.warn(`Lỗi sync review ${r.id}:`, e.message);
    }
  }

  // 7. Sync Consultations
  for (const c of (memoryData.consultations || [])) {
    try {
      await query(
        `INSERT INTO consultations (id, customer_name, phone, email, menh, wrist_circumference, message, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          c.id, c.customerName, c.phone, c.email || '', c.menh || '',
          c.wristCircumference || '', c.message || '', c.status || 'Chờ tư vấn',
          c.createdAt || new Date().toISOString()
        ]
      );
      consultationsSynced++;
    } catch (e) {
      console.warn(`Lỗi sync consultation ${c.id}:`, e.message);
    }
  }

  return {
    tablesCount: 10,
    usersSynced,
    categoriesSynced,
    productsSynced,
    ordersSynced,
    orderItemsSynced,
    reviewsSynced,
    vouchersSynced,
    consultationsSynced,
    timestamp: new Date().toISOString()
  };
};

// ==================== PRODUCTS REPOSITORY ====================

export const dbGetProducts = async () => {
  if (isNeonConnected()) {
    try {
      const res = await query('SELECT * FROM products ORDER BY created_at DESC');
      if (res && res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: r.id,
          name: r.name,
          category: r.category,
          menh: r.menh,
          price: Number(r.price),
          originalPrice: Number(r.original_price),
          wholesalePrice: r.wholesale_price ? Number(r.wholesale_price) : Math.round(Number(r.price) * 0.7),
          wholesaleMinQty: r.wholesale_min_qty ? Number(r.wholesale_min_qty) : 5,
          isBestSeller: Boolean(r.is_best_seller),
          salesCount: Number(r.sales_count || 0),
          cordComposition: r.cord_composition || {},
          rating: Number(r.rating),
          reviewsCount: r.reviews_count,
          tag: r.tag,
          stoneType: r.stone_type,
          cordType: r.cord_type,
          beadSize: r.bead_size,
          artisanName: r.artisan_name,
          leadTime: r.lead_time,
          description: r.description,
          meaning: r.meaning,
          stock: r.stock,
          images: r.images,
          createdAt: r.created_at
        }));
      }
    } catch (err) {
      console.warn('Lỗi đọc products Neon DB, fallback local:', err.message);
    }
  }
  return memoryData.products;
};

export const dbCreateProduct = async (productData) => {
  const newProduct = {
    id: productData.id || `vt-${Date.now().toString().slice(-4)}`,
    ...productData,
    wholesalePrice: productData.wholesalePrice || Math.round((productData.price || 0) * 0.7),
    wholesaleMinQty: productData.wholesaleMinQty || 5,
    isBestSeller: Boolean(productData.isBestSeller),
    salesCount: productData.salesCount || 0,
    cordComposition: productData.cordComposition || {},
    rating: 5.0,
    reviewsCount: 0,
    createdAt: new Date().toISOString()
  };

  memoryData.products.unshift(newProduct);
  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query(
        `INSERT INTO products (
          id, name, category, menh, price, original_price, wholesale_price, wholesale_min_qty,
          is_best_seller, sales_count, cord_composition, rating, reviews_count,
          tag, stone_type, cord_type, bead_size, artisan_name, lead_time,
          description, meaning, stock, images, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
        [
          newProduct.id, newProduct.name, newProduct.category, JSON.stringify(newProduct.menh || ['Tất cả']),
          newProduct.price, newProduct.originalPrice || newProduct.price, newProduct.wholesalePrice, newProduct.wholesaleMinQty,
          newProduct.isBestSeller, newProduct.salesCount, JSON.stringify(newProduct.cordComposition),
          newProduct.rating, newProduct.reviewsCount,
          newProduct.tag || '', newProduct.stoneType || '', newProduct.cordType || '', newProduct.beadSize || '8mm',
          newProduct.artisanName || 'Nghệ nhân KhánhVyMade', newProduct.leadTime || 'Làm thủ công 2h',
          newProduct.description || '', newProduct.meaning || '', newProduct.stock || 10,
          JSON.stringify(newProduct.images || []), newProduct.createdAt
        ]
      );
    } catch (err) {
      console.error('Lỗi tạo product Neon:', err.message);
    }
  }

  return newProduct;
};

export const dbUpdateProduct = async (id, updates) => {
  const idx = memoryData.products.findIndex(p => p.id === id);
  if (idx === -1) return null;

  memoryData.products[idx] = { ...memoryData.products[idx], ...updates };
  saveToDisk();

  const updated = memoryData.products[idx];

  if (isNeonConnected()) {
    try {
      await query(
        `UPDATE products SET 
          name = COALESCE($1, name),
          price = COALESCE($2, price),
          wholesale_price = COALESCE($3, wholesale_price),
          wholesale_min_qty = COALESCE($4, wholesale_min_qty),
          is_best_seller = COALESCE($5, is_best_seller),
          sales_count = COALESCE($6, sales_count),
          stock = COALESCE($7, stock),
          category = COALESCE($8, category),
          description = COALESCE($9, description)
         WHERE id = $10`,
        [
          updates.name, updates.price, updates.wholesalePrice, updates.wholesaleMinQty,
          updates.isBestSeller, updates.salesCount,
          updates.stock, updates.category, updates.description, id
        ]
      );
    } catch (err) {
      console.error('Lỗi cập nhật product Neon:', err.message);
    }
  }

  return updated;
};

export const dbDeleteProduct = async (id) => {
  const initialLen = memoryData.products.length;
  memoryData.products = memoryData.products.filter(p => p.id !== id);
  if (memoryData.products.length === initialLen) return false;

  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query('DELETE FROM products WHERE id = $1', [id]);
    } catch (err) {
      console.warn('Lỗi delete product Neon:', err.message);
    }
  }
  return true;
};

// ==================== USERS REPOSITORY ====================

export const dbGetUsers = async () => {
  if (isNeonConnected()) {
    try {
      const res = await query('SELECT id, email, full_name, phone, address, role, created_at FROM users ORDER BY created_at DESC');
      if (res && res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: r.id,
          email: r.email,
          fullName: r.full_name,
          phone: r.phone || '',
          address: r.address || '',
          role: r.role,
          createdAt: r.created_at
        }));
      }
    } catch (err) {
      console.warn('Lỗi đọc users Neon DB, fallback local:', err.message);
    }
  }
  return memoryData.users.map(u => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone || '',
    address: u.address || '',
    role: u.role,
    createdAt: u.createdAt
  }));
};

export const dbCreateUser = async (userData) => {
  const newUser = {
    id: userData.id || `user-${Date.now()}`,
    email: userData.email.trim().toLowerCase(),
    password: userData.password,
    fullName: userData.fullName,
    phone: userData.phone || '',
    address: userData.address || '',
    role: userData.role || 'customer',
    createdAt: new Date().toISOString()
  };

  memoryData.users.push(newUser);
  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query(
        'INSERT INTO users (id, email, password_hash, full_name, phone, address, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [newUser.id, newUser.email, newUser.password, newUser.fullName, newUser.phone, newUser.address, newUser.role, newUser.createdAt]
      );
    } catch (err) {
      console.error('Lỗi tạo user Neon:', err.message);
    }
  }

  return {
    id: newUser.id,
    email: newUser.email,
    fullName: newUser.fullName,
    phone: newUser.phone,
    address: newUser.address,
    role: newUser.role,
    createdAt: newUser.createdAt
  };
};

export const dbUpdateUserRole = async (id, newRole) => {
  const user = memoryData.users.find(u => u.id === id);
  if (!user) return null;

  user.role = newRole;
  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query('UPDATE users SET role = $1 WHERE id = $2', [newRole, id]);
    } catch (err) {
      console.warn('Lỗi update role Neon:', err.message);
    }
  }
  return user;
};

export const dbDeleteUser = async (id) => {
  const initialLen = memoryData.users.length;
  memoryData.users = memoryData.users.filter(u => u.id !== id);
  if (memoryData.users.length === initialLen) return false;

  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query('DELETE FROM users WHERE id = $1', [id]);
    } catch (err) {
      console.warn('Lỗi xóa user Neon:', err.message);
    }
  }
  return true;
};

export const dbFindUserByEmail = async (email) => {
  const cleanEmail = email.trim().toLowerCase();
  if (isNeonConnected()) {
    try {
      const res = await query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
      if (res && res.rows && res.rows.length > 0) {
        const r = res.rows[0];
        return {
          id: r.id,
          email: r.email,
          password: r.password_hash,
          fullName: r.full_name,
          phone: r.phone || '',
          address: r.address || '',
          role: r.role,
          createdAt: r.created_at
        };
      }
    } catch (err) {
      console.warn('Lỗi tìm user Neon DB:', err.message);
    }
  }
  return memoryData.users.find(u => u.email === cleanEmail);
};

// ==================== ORDERS REPOSITORY ====================

export const dbGetOrders = async () => {
  if (isNeonConnected()) {
    try {
      const res = await query('SELECT * FROM orders ORDER BY created_at DESC');
      if (res && res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: r.id,
          customerName: r.customer_name,
          phone: r.phone,
          address: r.address,
          items: r.items,
          totalAmount: Number(r.total_amount),
          shippingFee: Number(r.shipping_fee),
          paymentMethod: r.payment_method,
          paymentStatus: r.payment_status,
          orderStatus: r.order_status,
          note: r.note,
          timeline: r.timeline,
          createdAt: r.created_at
        }));
      }
    } catch (err) {
      console.warn('Lỗi đọc orders Neon DB:', err.message);
    }
  }
  return memoryData.orders;
};

export const dbSaveOrder = async (order) => {
  memoryData.orders.unshift(order);
  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query(
        `INSERT INTO orders (
          id, customer_name, phone, address, items, total_amount, shipping_fee,
          payment_method, payment_status, order_status, note, timeline, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          order_status = EXCLUDED.order_status,
          payment_status = EXCLUDED.payment_status,
          timeline = EXCLUDED.timeline`,
        [
          order.id, order.customerName, order.phone, order.address, JSON.stringify(order.items),
          order.totalAmount, order.shippingFee || 25000, order.paymentMethod || 'VietQR',
          order.paymentStatus || 'Chờ thanh toán', order.orderStatus || 'Chờ xác nhận',
          order.note || '', JSON.stringify(order.timeline || []), order.createdAt
        ]
      );
    } catch (err) {
      console.warn('Lỗi ghi order Neon DB:', err.message);
    }
  }
};

export const dbUpdateOrderStatus = async (id, statusUpdates) => {
  const order = memoryData.orders.find(o => o.id === id);
  if (!order) return null;

  const now = new Date();
  const formattedDate = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;

  if (statusUpdates.orderStatus && statusUpdates.orderStatus !== order.orderStatus) {
    order.orderStatus = statusUpdates.orderStatus;
    order.timeline = order.timeline || [];
    order.timeline.unshift({
      time: formattedDate,
      status: `Trạng thái: ${statusUpdates.orderStatus}`
    });
  }

  if (statusUpdates.paymentStatus) order.paymentStatus = statusUpdates.paymentStatus;
  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query(
        'UPDATE orders SET order_status = $1, payment_status = COALESCE($2, payment_status), timeline = $3 WHERE id = $4',
        [order.orderStatus, statusUpdates.paymentStatus || null, JSON.stringify(order.timeline), id]
      );
    } catch (err) {
      console.warn('Lỗi cập nhật order Neon DB:', err.message);
    }
  }

  return order;
};

// ==================== CATEGORIES REPOSITORY ====================

export const dbGetCategories = async () => {
  if (isNeonConnected()) {
    try {
      const res = await query('SELECT * FROM categories ORDER BY display_order ASC, name ASC');
      if (res && res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          icon: r.icon,
          description: r.description,
          bannerImage: r.banner_image,
          displayOrder: r.display_order
        }));
      }
    } catch (e) {
      console.warn('Lỗi đọc categories Neon DB:', e.message);
    }
  }
  return memoryData.categories || [];
};

// ==================== VOUCHERS REPOSITORY ====================

export const dbGetVouchers = async () => {
  if (isNeonConnected()) {
    try {
      const res = await query('SELECT * FROM vouchers WHERE is_active = true ORDER BY created_at DESC');
      if (res && res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: r.id,
          code: r.code,
          discountType: r.discount_type,
          discountValue: Number(r.discount_value),
          minOrderValue: Number(r.min_order_value || 0),
          maxDiscount: r.max_discount ? Number(r.max_discount) : null,
          usageLimit: r.usage_limit,
          usedCount: r.used_count,
          description: r.description,
          isActive: r.is_active,
          expiresAt: r.expires_at
        }));
      }
    } catch (e) {
      console.warn('Lỗi đọc vouchers Neon DB:', e.message);
    }
  }
  return (memoryData.vouchers || []).filter(v => v.isActive !== false);
};

export const dbValidateAndApplyVoucher = async (code, orderTotal) => {
  if (!code) return { success: false, message: 'Vui lòng cung cấp mã voucher' };
  const cleanCode = String(code).trim().toUpperCase();
  const vouchers = await dbGetVouchers();
  const voucher = vouchers.find(v => v.code === cleanCode);

  if (!voucher) {
    return { success: false, message: `Mã giảm giá "${cleanCode}" không hợp lệ hoặc đã hết hạn` };
  }

  if (orderTotal < (voucher.minOrderValue || 0)) {
    return {
      success: false,
      message: `Mã ${cleanCode} chỉ áp dụng cho đơn hàng từ ${(voucher.minOrderValue).toLocaleString('vi-VN')}₫`
    };
  }

  let discountAmount = 0;
  if (voucher.discountType === 'percentage') {
    discountAmount = Math.round((orderTotal * voucher.discountValue) / 100);
    if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
      discountAmount = voucher.maxDiscount;
    }
  } else {
    discountAmount = voucher.discountValue;
  }

  return {
    success: true,
    code: voucher.code,
    discountAmount,
    description: voucher.description,
    message: `Áp dụng mã ${voucher.code} thành công! Giảm ${discountAmount.toLocaleString('vi-VN')}₫`
  };
};

// ==================== REVIEWS REPOSITORY ====================

export const dbGetReviews = async (productId = null) => {
  if (isNeonConnected()) {
    try {
      const sql = productId 
        ? 'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC'
        : 'SELECT * FROM reviews ORDER BY created_at DESC';
      const params = productId ? [productId] : [];
      const res = await query(sql, params);
      if (res && res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: r.id,
          productId: r.product_id,
          userId: r.user_id,
          customerName: r.customer_name,
          rating: Number(r.rating),
          wristFit: r.wrist_fit,
          comment: r.comment,
          isVerifiedBuyer: r.is_verified_buyer,
          photos: r.photos || [],
          createdAt: r.created_at
        }));
      }
    } catch (e) {
      console.warn('Lỗi đọc reviews Neon DB:', e.message);
    }
  }

  if (productId) {
    return (memoryData.reviews || []).filter(r => r.productId === productId);
  }
  return memoryData.reviews || [];
};

export const dbCreateReview = async (reviewData) => {
  const newReview = {
    id: `rev-${Date.now().toString().slice(-5)}`,
    productId: reviewData.productId,
    userId: reviewData.userId || null,
    customerName: reviewData.customerName || 'Khách hàng ẩn danh',
    rating: Number(reviewData.rating) || 5,
    wristFit: reviewData.wristFit || 'Vừa vặn chuẩn',
    comment: reviewData.comment || '',
    isVerifiedBuyer: true,
    photos: reviewData.photos || [],
    createdAt: new Date().toISOString()
  };

  memoryData.reviews = memoryData.reviews || [];
  memoryData.reviews.unshift(newReview);
  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query(
        `INSERT INTO reviews (id, product_id, user_id, customer_name, rating, wrist_fit, comment, is_verified_buyer, photos, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newReview.id, newReview.productId, newReview.userId, newReview.customerName,
          newReview.rating, newReview.wristFit, newReview.comment, newReview.isVerifiedBuyer,
          JSON.stringify(newReview.photos), newReview.createdAt
        ]
      );
    } catch (e) {
      console.warn('Lỗi ghi review Neon DB:', e.message);
    }
  }

  return newReview;
};

// ==================== WISHLISTS REPOSITORY (Database Sync) ====================

export const dbGetWishlist = async (userId) => {
  if (!userId) return [];
  if (isNeonConnected()) {
    try {
      const res = await query('SELECT product_id FROM wishlists WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      if (res && res.rows) {
        return res.rows.map(r => r.product_id);
      }
    } catch (e) {
      console.warn('Lỗi đọc wishlist Neon DB:', e.message);
    }
  }

  const userItems = (memoryData.wishlists || []).filter(w => w.userId === userId);
  return userItems.map(w => w.productId);
};

export const dbToggleWishlist = async (userId, productId) => {
  if (!userId || !productId) return { success: false, message: 'Thiếu userId hoặc productId' };

  memoryData.wishlists = memoryData.wishlists || [];
  const existingIdx = memoryData.wishlists.findIndex(w => w.userId === userId && w.productId === productId);
  let isWishlisted = false;

  if (existingIdx >= 0) {
    memoryData.wishlists.splice(existingIdx, 1);
    isWishlisted = false;
  } else {
    memoryData.wishlists.push({
      id: `w-${Date.now().toString().slice(-4)}`,
      userId,
      productId,
      createdAt: new Date().toISOString()
    });
    isWishlisted = true;
  }
  saveToDisk();

  if (isNeonConnected()) {
    try {
      if (isWishlisted) {
        await query(
          'INSERT INTO wishlists (id, user_id, product_id, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, product_id) DO NOTHING',
          [`w-${Date.now().toString().slice(-4)}`, userId, productId, new Date().toISOString()]
        );
      } else {
        await query('DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2', [userId, productId]);
      }
    } catch (e) {
      console.warn('Lỗi toggle wishlist Neon DB:', e.message);
    }
  }

  return { success: true, isWishlisted, productId };
};

export const dbSyncWishlist = async (userId, productIds = []) => {
  if (!userId || !Array.isArray(productIds)) return [];

  for (const pid of productIds) {
    const exists = (memoryData.wishlists || []).some(w => w.userId === userId && w.productId === pid);
    if (!exists) {
      memoryData.wishlists.push({
        id: `w-${Date.now().toString().slice(-4)}`,
        userId,
        productId: pid,
        createdAt: new Date().toISOString()
      });
      if (isNeonConnected()) {
        await query(
          'INSERT INTO wishlists (id, user_id, product_id, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, product_id) DO NOTHING',
          [`w-${Date.now().toString().slice(-4)}`, userId, pid, new Date().toISOString()]
        ).catch(() => {});
      }
    }
  }
  saveToDisk();
  return dbGetWishlist(userId);
};

// ==================== CONSULTATIONS REPOSITORY ====================

export const dbGetConsultations = async () => {
  if (isNeonConnected()) {
    try {
      const res = await query('SELECT * FROM consultations ORDER BY created_at DESC');
      if (res && res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: r.id,
          customerName: r.customer_name,
          phone: r.phone,
          email: r.email,
          menh: r.menh,
          wristCircumference: r.wrist_circumference,
          message: r.message,
          status: r.status,
          createdAt: r.created_at
        }));
      }
    } catch (e) {
      console.warn('Lỗi đọc consultations Neon DB:', e.message);
    }
  }
  return memoryData.consultations || [];
};

export const dbCreateConsultation = async (data) => {
  const newCsl = {
    id: `csl-${Date.now().toString().slice(-5)}`,
    customerName: data.customerName || 'Khách hàng',
    phone: data.phone || '',
    email: data.email || '',
    menh: data.menh || '',
    wristCircumference: data.wristCircumference || '',
    message: data.message || '',
    status: 'Chờ tư vấn',
    createdAt: new Date().toISOString()
  };

  memoryData.consultations = memoryData.consultations || [];
  memoryData.consultations.unshift(newCsl);
  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query(
        `INSERT INTO consultations (id, customer_name, phone, email, menh, wrist_circumference, message, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newCsl.id, newCsl.customerName, newCsl.phone, newCsl.email,
          newCsl.menh, newCsl.wristCircumference, newCsl.message,
          newCsl.status, newCsl.createdAt
        ]
      );
    } catch (e) {
      console.warn('Lỗi ghi consultation Neon DB:', e.message);
    }
  }
  return newCsl;
};

// ==================== CUSTOM DESIGNS REPOSITORY ====================

export const dbSaveCustomDesign = async (data) => {
  const newDesign = {
    id: `cd-${Date.now().toString().slice(-5)}`,
    userId: data.userId || null,
    designName: data.designName || 'Mẫu vòng phối độc bản',
    cordType: data.cordType || '',
    cordColor: data.cordColor || '',
    pattern: data.pattern || '',
    charm: data.charm || '',
    accentStone: data.accentStone || '',
    wristSize: data.wristSize || '15-16cm',
    price: Number(data.price) || 295000,
    previewData: data.previewData || {},
    createdAt: new Date().toISOString()
  };

  memoryData.customDesigns = memoryData.customDesigns || [];
  memoryData.customDesigns.unshift(newDesign);
  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query(
        `INSERT INTO custom_designs (id, user_id, design_name, cord_type, cord_color, pattern, charm, accent_stone, wrist_size, price, preview_data, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          newDesign.id, newDesign.userId, newDesign.designName, newDesign.cordType,
          newDesign.cordColor, newDesign.pattern, newDesign.charm, newDesign.accentStone,
          newDesign.wristSize, newDesign.price, JSON.stringify(newDesign.previewData), newDesign.createdAt
        ]
      );
    } catch (e) {
      console.warn('Lỗi ghi custom design Neon DB:', e.message);
    }
  }
  return newDesign;
};

export const getDbTelemetry = async () => {
  const products = await dbGetProducts();
  const orders = await dbGetOrders();
  const users = await dbGetUsers();
  const categories = await dbGetCategories();
  const vouchers = await dbGetVouchers();
  const reviews = await dbGetReviews();
  const consultations = await dbGetConsultations();

  return {
    isNeonConnected: isNeonConnected(),
    totalTables: 10,
    tables: [
      'users', 'categories', 'products', 'orders', 'order_items',
      'reviews', 'vouchers', 'wishlists', 'custom_designs', 'consultations'
    ],
    counts: {
      users: users.length,
      categories: categories.length,
      products: products.length,
      orders: orders.length,
      reviews: reviews.length,
      vouchers: vouchers.length,
      consultations: consultations.length,
      wishlists: (memoryData.wishlists || []).length,
      customDesigns: (memoryData.customDesigns || []).length
    },
    storageType: isNeonConnected() ? 'Neon Cloud PostgreSQL + Local Disk (10 Bảng Chuẩn)' : 'Local Disk File (db.json - 10 Bảng)'
  };
};
