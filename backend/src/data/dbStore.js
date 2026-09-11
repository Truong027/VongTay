import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  products as seedProducts, 
  sampleOrders as seedOrders,
  categories as seedCategories,
  sampleVouchers as seedVouchers,
  sampleReviews as seedReviews,
  sampleConsultations as seedConsultations,
  customizerOptions as seedCustomizerOptions
} from './seedData.js';
import { query, isNeonConnected, initNeonDb, ensureNeonConnected } from './neonDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const defaultUsers = [
  {
    id: 'user-admin',
    email: 'admin@khanhvymade.vn',
    password: 'admin123',
    fullName: 'Quản Trị Viên Vòng Tay Nhà Zy',
    phone: '0988668899',
    address: 'Xưởng Chế Tác Vòng Tay Nhà Zy, 128 Nguyễn Trãi, Hà Nội',
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
    fullName: 'Nghệ nhân Vòng Tay Nhà Zy',
    phone: '0988776655',
    address: 'Xưởng Đan Vòng Vòng Tay Nhà Zy',
    role: 'artisan',
    createdAt: '2026-09-02T14:15:00.000Z'
  }
];

// Initialize local memory/disk store across all 10 tables + customizerOptions
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
  consultations: [...seedConsultations],
  customizerOptions: JSON.parse(JSON.stringify(seedCustomizerOptions))
};

// Load existing db.json if present
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.products && Array.isArray(parsed.products) && parsed.products.length > 0) {
      memoryData.products = parsed.products;
    } else {
      memoryData.products = [...seedProducts];
    }
    if (parsed.orders) memoryData.orders = parsed.orders;
    if (parsed.users) memoryData.users = parsed.users;
    if (parsed.categories) memoryData.categories = parsed.categories;
    if (parsed.vouchers) memoryData.vouchers = parsed.vouchers;
    if (parsed.reviews) memoryData.reviews = parsed.reviews;
    if (parsed.wishlists) memoryData.wishlists = parsed.wishlists;
    if (parsed.customDesigns) memoryData.customDesigns = parsed.customDesigns;
    if (parsed.consultations) memoryData.consultations = parsed.consultations;
    if (parsed.orderItems) memoryData.orderItems = parsed.orderItems;
    if (parsed.customizerOptions) memoryData.customizerOptions = parsed.customizerOptions;
    if (memoryData.products && memoryData.products.length > 0 && !memoryData.products.some(p => p.isTrending)) {
      memoryData.products[0].isTrending = true;
    }
    console.log('📁 Đã nạp dữ liệu từ tệp lưu trữ vật lý local db.json (11 bảng).');
  } else {
    if (memoryData.products && memoryData.products.length > 0) {
      memoryData.products[0].isTrending = true;
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryData, null, 2), 'utf8');
    console.log('📁 Đã khởi tạo tệp cơ sở dữ liệu vật lý db.json (11 bảng).');
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
    ALTER TABLE users ADD COLUMN IF NOT EXISTS session_token VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS device_info VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

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
      is_trending BOOLEAN DEFAULT false,
      sales_count INTEGER DEFAULT 0,
      cord_composition JSONB,
      images JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_min_qty INTEGER DEFAULT 5;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;
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

    -- 11. CHARMS (Kho Charm Thủ Công cho Customizer Studio)
    CREATE TABLE IF NOT EXISTS charms (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      material VARCHAR(100) NOT NULL DEFAULT 'Bạc 925',
      category VARCHAR(100) DEFAULT 'Khác',
      price NUMERIC NOT NULL DEFAULT 0,
      image TEXT,
      icon VARCHAR(50) DEFAULT 'Sparkles',
      description TEXT,
      meaning TEXT,
      stock INTEGER DEFAULT 50,
      in_stock BOOLEAN DEFAULT true,
      menh JSONB DEFAULT '["Tất cả"]',
      size_mm VARCHAR(50) DEFAULT '10mm',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 12. BEADS (Kho Hạt Đá Phong Thủy cho Customizer Studio)
    CREATE TABLE IF NOT EXISTS beads (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price_per_bead NUMERIC NOT NULL DEFAULT 8000,
      color VARCHAR(50) DEFAULT '#EAA9A9',
      preview_class VARCHAR(50) DEFAULT 'bg-rose-300',
      menh JSONB DEFAULT '["Tất cả"]',
      description TEXT,
      meaning TEXT,
      stock INTEGER DEFAULT 100,
      in_stock BOOLEAN DEFAULT true,
      image TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createTablesSql);
    console.log('✅ Đã xác thực cấu trúc 12 bảng trên Neon PostgreSQL.');
    return true;
  } catch (err) {
    console.error('Lỗi tạo bảng Neon:', err.message);
    return false;
  }
};

const runInBatches = async (items, batchSize, fn) => {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
};

let productsCache = {
  dataWithHidden: null,
  dataPublicOnly: null,
  lastFetched: 0
};
const CACHE_TTL_MS = 2000; // 2s short cache for fast response while preventing stale data

export const invalidateProductsCache = () => {
  productsCache.dataWithHidden = null;
  productsCache.dataPublicOnly = null;
  productsCache.lastFetched = 0;
};

export const syncAllDataToNeon = async () => {
  const connected = await ensureNeonConnected();
  if (!connected && !isNeonConnected()) {
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

  // 1. Đồng bộ song song các bảng phụ trợ (Users, Categories, Vouchers, Reviews, Consultations)
  await Promise.all([
    // Users
    Promise.all(memoryData.users.map(async (u) => {
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
    })),

    // Categories
    Promise.all((memoryData.categories || []).map(async (c) => {
      if (c.id === 'all' || c.id === 'best-seller') return;
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
    })),

    // Vouchers
    Promise.all((memoryData.vouchers || []).map(async (v) => {
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
    })),

    // Reviews
    Promise.all((memoryData.reviews || []).map(async (r) => {
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
    })),

    // Consultations
    Promise.all((memoryData.consultations || []).map(async (c) => {
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
    }))
  ]);

  // 2. Sync Products theo lô song song 8 sản phẩm/lần (tăng tốc gấp 8x)
  const currentIds = memoryData.products.map(p => p.id);
  if (currentIds.length > 0) {
    const placeholders = currentIds.map((_, i) => `$${i + 1}`).join(',');
    await query(`DELETE FROM products WHERE id NOT IN (${placeholders})`, currentIds).catch(() => {});
  }
  await runInBatches(memoryData.products, 8, async (p) => {
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
          p.artisanName || 'Nghệ nhân Vòng Tay Nhà Zy', p.leadTime || 'Làm thủ công 2h',
          p.description || '', p.meaning || '', p.stock || 10,
          JSON.stringify(p.images || []), new Date().toISOString()
        ]
      );
      productsSynced++;
    } catch (e) {
      console.warn(`Lỗi sync product ${p.name}:`, e.message);
    }
  });

  // 3. Sync Orders theo lô song song 6 đơn/lần + order_items song song
  await runInBatches(memoryData.orders, 6, async (o) => {
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
          o.id, o.userId || null, o.customerName, o.phone, o.address, JSON.stringify(o.items || []),
          o.subtotal || o.totalAmount, o.wholesaleDiscount || 0, o.voucherDiscount || 0,
          o.shippingFee || 25000, o.totalAmount, o.paymentMethod || 'VietQR',
          o.paymentStatus || 'Chờ thanh toán', o.orderStatus || 'Chờ xác nhận',
          o.trackingCode || null, o.note || '', JSON.stringify(o.timeline || []), o.createdAt || new Date().toISOString()
        ]
      );
      ordersSynced++;

      if (Array.isArray(o.items) && o.items.length > 0) {
        await Promise.all(o.items.map(async (item, idx) => {
          const itemId = `${o.id}-item-${idx + 1}`;
          try {
            await query(
              `INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, wrist_size, custom_engraving, item_total)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (id) DO NOTHING`,
              [
                itemId, o.id, item.id || null, item.name || 'Vòng tay thủ công',
                item.price || 0, item.quantity || 1, item.wristSize || item.customDetails?.size || '15-16cm',
                item.customDetails?.engravedLetter || null, (item.price || 0) * (item.quantity || 1)
              ]
            );
            orderItemsSynced++;
          } catch (_) {}
        }));
      }
    } catch (e) {
      console.warn(`Lỗi sync order ${o.id}:`, e.message);
    }
  });

  invalidateProductsCache();

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

export const dbGetProducts = async (includeHidden = false) => {
  const now = Date.now();
  if (includeHidden && productsCache.dataWithHidden && (now - productsCache.lastFetched < CACHE_TTL_MS)) {
    return productsCache.dataWithHidden;
  }
  if (!includeHidden && productsCache.dataPublicOnly && (now - productsCache.lastFetched < CACHE_TTL_MS)) {
    return productsCache.dataPublicOnly;
  }

  await ensureNeonConnected();
  if (isNeonConnected()) {
    try {
      const sql = includeHidden
        ? 'SELECT * FROM products ORDER BY created_at DESC'
        : 'SELECT * FROM products WHERE (is_hidden IS NULL OR is_hidden = false) ORDER BY created_at DESC';
      const res = await query(sql);
      if (res && Array.isArray(res.rows)) {
        const mapped = res.rows.map(r => ({
          id: r.id,
          name: r.name,
          category: r.category,
          menh: r.menh,
          price: Number(r.price),
          originalPrice: Number(r.original_price),
          wholesalePrice: r.wholesale_price ? Number(r.wholesale_price) : Math.round(Number(r.price) * 0.7),
          wholesaleMinQty: r.wholesale_min_qty ? Number(r.wholesale_min_qty) : 5,
          isBestSeller: Boolean(r.is_best_seller),
          isTrending: Boolean(r.is_trending),
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
          isHidden: Boolean(r.is_hidden),
          createdAt: r.created_at
        }));

        if (includeHidden) {
          productsCache.dataWithHidden = mapped;
          memoryData.products = mapped;
          saveToDisk();
        } else {
          productsCache.dataPublicOnly = mapped;
        }
        productsCache.lastFetched = Date.now();

        return mapped;
      }
    } catch (err) {
      console.warn('Lỗi đọc products Neon DB, fallback local:', err.message);
    }
  }

  const fallback = includeHidden 
    ? memoryData.products 
    : memoryData.products.filter(p => !p.isHidden);

  if (includeHidden) productsCache.dataWithHidden = fallback;
  else productsCache.dataPublicOnly = fallback;
  productsCache.lastFetched = Date.now();

  return fallback;
};

export const dbCreateProduct = async (productData) => {
  const parsedPrice = Number(productData.price) || 0;
  const parsedOriginalPrice = productData.originalPrice !== undefined && productData.originalPrice !== ''
    ? Number(productData.originalPrice)
    : parsedPrice;
  const parsedWholesalePrice = productData.wholesalePrice !== undefined && productData.wholesalePrice !== ''
    ? Number(productData.wholesalePrice)
    : Math.round(parsedPrice * 0.7);
  const parsedWholesaleMinQty = Number(productData.wholesaleMinQty) || 5;
  const parsedStock = productData.stock !== undefined && productData.stock !== ''
    ? Number(productData.stock)
    : 20;
  const parsedSalesCount = Number(productData.salesCount) || 0;

  const newProduct = {
    id: productData.id || `vt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: productData.name?.trim() || 'Vòng Tay Thủ Công',
    category: productData.category || 'macrame-pastel',
    menh: Array.isArray(productData.menh) ? productData.menh : ['Tất cả'],
    price: parsedPrice,
    originalPrice: parsedOriginalPrice,
    wholesalePrice: parsedWholesalePrice,
    wholesaleMinQty: parsedWholesaleMinQty,
    isBestSeller: Boolean(productData.isBestSeller),
    isTrending: Boolean(productData.isTrending),
    salesCount: parsedSalesCount,
    cordComposition: productData.cordComposition || {},
    rating: 5.0,
    reviewsCount: 0,
    tag: productData.tag?.trim() || '',
    stoneType: productData.stoneType?.trim() || '',
    cordType: productData.cordType?.trim() || '',
    beadSize: productData.beadSize?.trim() || '8mm',
    artisanName: productData.artisanName || 'Nghệ nhân Vòng Tay Nhà Zy',
    leadTime: productData.leadTime || 'Làm thủ công 2h',
    description: productData.description?.trim() || '',
    meaning: productData.meaning?.trim() || '',
    stock: parsedStock,
    images: Array.isArray(productData.images) && productData.images.length > 0 && productData.images[0]
      ? productData.images
      : ['/images/products/bracelet-pastel-macrame-trio.jpg'],
    isHidden: Boolean(productData.isHidden || false),
    createdAt: new Date().toISOString()
  };

  memoryData.products.unshift(newProduct);
  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query(
        `INSERT INTO products (
          id, name, category, menh, price, original_price, wholesale_price, wholesale_min_qty,
          is_best_seller, is_trending, sales_count, cord_composition, rating, reviews_count,
          tag, stone_type, cord_type, bead_size, artisan_name, lead_time,
          description, meaning, stock, images, is_hidden, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)`,
        [
          newProduct.id, newProduct.name, newProduct.category, JSON.stringify(newProduct.menh),
          newProduct.price, newProduct.originalPrice, newProduct.wholesalePrice, newProduct.wholesaleMinQty,
          newProduct.isBestSeller, newProduct.isTrending, newProduct.salesCount, JSON.stringify(newProduct.cordComposition),
          newProduct.rating, newProduct.reviewsCount,
          newProduct.tag, newProduct.stoneType, newProduct.cordType, newProduct.beadSize,
          newProduct.artisanName, newProduct.leadTime,
          newProduct.description, newProduct.meaning, newProduct.stock,
          JSON.stringify(newProduct.images), newProduct.isHidden, newProduct.createdAt
        ]
      );
    } catch (err) {
      console.error('Lỗi tạo product Neon:', err.message);
    }
  }

  invalidateProductsCache();
  return newProduct;
};

export const dbUpdateProduct = async (id, updates) => {
  const cleanId = String(id).trim();
  const idx = memoryData.products.findIndex(p => String(p.id).trim() === cleanId);
  
  const formattedUpdates = { ...updates };
  if (updates.price !== undefined && updates.price !== '') formattedUpdates.price = Number(updates.price);
  if (updates.originalPrice !== undefined && updates.originalPrice !== '') formattedUpdates.originalPrice = Number(updates.originalPrice);
  if (updates.wholesalePrice !== undefined && updates.wholesalePrice !== '') formattedUpdates.wholesalePrice = Number(updates.wholesalePrice);
  if (updates.wholesaleMinQty !== undefined && updates.wholesaleMinQty !== '') formattedUpdates.wholesaleMinQty = Number(updates.wholesaleMinQty);
  if (updates.stock !== undefined && updates.stock !== '') formattedUpdates.stock = Number(updates.stock);
  if (updates.salesCount !== undefined && updates.salesCount !== '') formattedUpdates.salesCount = Number(updates.salesCount);
  if (updates.isBestSeller !== undefined) formattedUpdates.isBestSeller = Boolean(updates.isBestSeller);
  if (updates.isTrending !== undefined) formattedUpdates.isTrending = Boolean(updates.isTrending);
  if (updates.isHidden !== undefined) formattedUpdates.isHidden = Boolean(updates.isHidden);

  if (idx !== -1) {
    memoryData.products[idx] = { ...memoryData.products[idx], ...formattedUpdates };
    saveToDisk();
  }

  let updated = idx !== -1 ? memoryData.products[idx] : null;

  if (isNeonConnected()) {
    try {
      const res = await query(
        `UPDATE products SET 
          name = COALESCE($1, name),
          price = COALESCE($2, price),
          wholesale_price = COALESCE($3, wholesale_price),
          wholesale_min_qty = COALESCE($4, wholesale_min_qty),
          original_price = COALESCE($5, original_price),
          is_best_seller = COALESCE($6, is_best_seller),
          sales_count = COALESCE($7, sales_count),
          stock = COALESCE($8, stock),
          category = COALESCE($9, category),
          description = COALESCE($10, description),
          meaning = COALESCE($11, meaning),
          tag = COALESCE($12, tag),
          stone_type = COALESCE($13, stone_type),
          cord_type = COALESCE($14, cord_type),
          cord_composition = COALESCE($15, cord_composition),
          images = COALESCE($16, images),
          is_hidden = COALESCE($17, is_hidden),
          is_trending = COALESCE($18, is_trending),
          menh = COALESCE($19, menh),
          bead_size = COALESCE($20, bead_size),
          artisan_name = COALESCE($21, artisan_name),
          lead_time = COALESCE($22, lead_time)
         WHERE id = $23
         RETURNING *`,
        [
          formattedUpdates.name !== undefined ? formattedUpdates.name : null,
          formattedUpdates.price !== undefined ? formattedUpdates.price : null,
          formattedUpdates.wholesalePrice !== undefined ? formattedUpdates.wholesalePrice : null,
          formattedUpdates.wholesaleMinQty !== undefined ? formattedUpdates.wholesaleMinQty : null,
          formattedUpdates.originalPrice !== undefined ? formattedUpdates.originalPrice : null,
          formattedUpdates.isBestSeller !== undefined ? formattedUpdates.isBestSeller : null,
          formattedUpdates.salesCount !== undefined ? formattedUpdates.salesCount : null,
          formattedUpdates.stock !== undefined ? formattedUpdates.stock : null,
          formattedUpdates.category !== undefined ? formattedUpdates.category : null,
          formattedUpdates.description !== undefined ? formattedUpdates.description : null,
          formattedUpdates.meaning !== undefined ? formattedUpdates.meaning : null,
          formattedUpdates.tag !== undefined ? formattedUpdates.tag : null,
          formattedUpdates.stoneType !== undefined ? formattedUpdates.stoneType : null,
          formattedUpdates.cordType !== undefined ? formattedUpdates.cordType : null,
          formattedUpdates.cordComposition !== undefined ? JSON.stringify(formattedUpdates.cordComposition) : null,
          formattedUpdates.images !== undefined ? JSON.stringify(formattedUpdates.images) : null,
          formattedUpdates.isHidden !== undefined ? formattedUpdates.isHidden : null,
          formattedUpdates.isTrending !== undefined ? formattedUpdates.isTrending : null,
          formattedUpdates.menh !== undefined ? JSON.stringify(formattedUpdates.menh) : null,
          formattedUpdates.beadSize !== undefined ? formattedUpdates.beadSize : null,
          formattedUpdates.artisanName !== undefined ? formattedUpdates.artisanName : null,
          formattedUpdates.leadTime !== undefined ? formattedUpdates.leadTime : null,
          cleanId
        ]
      );

      if (res && res.rows && res.rows[0]) {
        const r = res.rows[0];
        updated = {
          id: r.id,
          name: r.name,
          category: r.category,
          menh: r.menh,
          price: Number(r.price),
          originalPrice: Number(r.original_price || r.price),
          wholesalePrice: Number(r.wholesale_price || 0),
          wholesaleMinQty: Number(r.wholesale_min_qty || 5),
          isBestSeller: Boolean(r.is_best_seller),
          isTrending: Boolean(r.is_trending),
          salesCount: Number(r.sales_count || 0),
          stock: r.stock,
          tag: r.tag,
          stoneType: r.stone_type,
          cordType: r.cord_type,
          beadSize: r.bead_size,
          artisanName: r.artisan_name,
          leadTime: r.lead_time,
          cordComposition: r.cord_composition,
          images: r.images,
          meaning: r.meaning,
          isHidden: Boolean(r.is_hidden),
          description: r.description
        };
        if (idx !== -1) {
          memoryData.products[idx] = updated;
          saveToDisk();
        }
      }
    } catch (err) {
      console.error('Lỗi cập nhật product Neon:', err.message);
    }
  }

  invalidateProductsCache();
  return updated;
};

export const dbDeleteProduct = async (id) => {
  const cleanId = String(id).trim();
  let deletedFromNeon = false;

  if (isNeonConnected()) {
    try {
      // Đảm bảo tháo gỡ an toàn các bảng liên kết trước khi xóa
      await query('UPDATE order_items SET product_id = NULL WHERE product_id = $1', [cleanId]).catch(() => {});
      await query('DELETE FROM reviews WHERE product_id = $1', [cleanId]).catch(() => {});
      await query('DELETE FROM wishlists WHERE product_id = $1', [cleanId]).catch(() => {});
      
      const res = await query('DELETE FROM products WHERE id = $1', [cleanId]);
      if (res && res.rowCount > 0) {
        deletedFromNeon = true;
      }
    } catch (err) {
      console.warn('Lỗi delete product Neon:', err.message);
    }
  }

  const initialLen = memoryData.products.length;
  memoryData.products = memoryData.products.filter(p => String(p.id).trim() !== cleanId);
  const deletedFromMemory = memoryData.products.length < initialLen;
  invalidateProductsCache();
  return deletedFromNeon || deletedFromMemory;
};

export const dbToggleProductVisibility = async (id) => {
  const cleanId = String(id).trim();
  let newHiddenState = true;
  const idx = memoryData.products.findIndex(p => String(p.id).trim() === cleanId);
  
  if (idx !== -1) {
    memoryData.products[idx].isHidden = !Boolean(memoryData.products[idx].isHidden);
    newHiddenState = memoryData.products[idx].isHidden;
    saveToDisk();
  }

  if (isNeonConnected()) {
    try {
      const res = await query(
        `UPDATE products SET is_hidden = NOT COALESCE(is_hidden, false) WHERE id = $1 RETURNING is_hidden`,
        [cleanId]
      );
      if (res && res.rows && res.rows[0]) {
        newHiddenState = Boolean(res.rows[0].is_hidden);
        if (idx !== -1) {
          memoryData.products[idx].isHidden = newHiddenState;
        }
      }
    } catch (err) {
      console.error('Lỗi toggle ẩn/hiện sản phẩm Neon:', err.message);
    }
  }

  invalidateProductsCache();
  return { id: cleanId, isHidden: newHiddenState };
};

export const dbSetHeroTrending = async (id) => {
  const cleanId = String(id).trim();
  let targetProduct = null;
  
  memoryData.products.forEach(p => {
    const isTarget = String(p.id).trim() === cleanId;
    p.isTrending = isTarget;
    if (isTarget) targetProduct = p;
  });
  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query(
        `UPDATE products SET is_trending = CASE WHEN id = $1 THEN true ELSE false END`,
        [cleanId]
      );
    } catch (err) {
      console.error('Lỗi đặt hero trending Neon:', err.message);
    }
  }

  invalidateProductsCache();
  return targetProduct;
};

// ==================== USERS REPOSITORY ====================

export const dbGetUsers = async () => {
  await ensureNeonConnected();
  if (isNeonConnected()) {
    try {
      const res = await query('SELECT id, email, full_name, phone, address, role, session_token, device_info, last_login_at, created_at FROM users ORDER BY created_at DESC');
      if (res && Array.isArray(res.rows)) {
        return res.rows.map(r => ({
          id: r.id,
          email: r.email,
          fullName: r.full_name,
          phone: r.phone || '',
          address: r.address || '',
          role: r.role,
          sessionToken: r.session_token || null,
          deviceInfo: r.device_info || '',
          lastLoginAt: r.last_login_at || null,
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
    sessionToken: u.sessionToken || null,
    deviceInfo: u.deviceInfo || '',
    lastLoginAt: u.lastLoginAt || null,
    createdAt: u.createdAt
  }));
};

export const dbCreateUser = async (userData) => {
  await ensureNeonConnected();
  const sessionToken = userData.sessionToken || ('sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10));
  const now = new Date().toISOString();
  const newUser = {
    id: userData.id || `user-${Date.now()}`,
    email: userData.email.trim().toLowerCase(),
    password: userData.password,
    fullName: userData.fullName,
    phone: userData.phone || '',
    address: userData.address || '',
    role: userData.role || 'customer',
    sessionToken: sessionToken,
    deviceInfo: userData.deviceInfo || '',
    lastLoginAt: now,
    createdAt: now
  };

  const existingIdx = memoryData.users.findIndex(u => u.email.toLowerCase() === newUser.email);
  if (existingIdx >= 0) {
    memoryData.users[existingIdx] = { ...memoryData.users[existingIdx], ...newUser };
  } else {
    memoryData.users.push(newUser);
  }
  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query(
        `INSERT INTO users (id, email, password_hash, full_name, phone, address, role, session_token, device_info, last_login_at, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (email) DO UPDATE 
         SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address, 
             password_hash = EXCLUDED.password_hash, session_token = EXCLUDED.session_token,
             device_info = EXCLUDED.device_info, last_login_at = EXCLUDED.last_login_at`,
        [newUser.id, newUser.email, newUser.password, newUser.fullName, newUser.phone, newUser.address, newUser.role, newUser.sessionToken, newUser.deviceInfo, newUser.lastLoginAt, newUser.createdAt]
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
    sessionToken: newUser.sessionToken,
    createdAt: newUser.createdAt
  };
};

export const dbUpdateUserProfile = async (id, updates = {}) => {
  await ensureNeonConnected();

  const cleanEmail = (updates.email || '').trim().toLowerCase();
  let user = memoryData.users.find(u => u.id === id || (cleanEmail && u.email.toLowerCase() === cleanEmail));

  if (isNeonConnected()) {
    try {
      // Find in Neon by id or email
      const checkRes = await query(
        'SELECT * FROM users WHERE id = $1 OR (LOWER(email) = LOWER($2) AND $2 != \'\') LIMIT 1',
        [id || '', cleanEmail]
      );

      if (checkRes && checkRes.rows && checkRes.rows.length > 0) {
        const neonUser = checkRes.rows[0];
        const newFullName = updates.fullName !== undefined ? updates.fullName.trim() : neonUser.full_name;
        const newPhone = updates.phone !== undefined ? updates.phone.trim() : (neonUser.phone || '');
        const newAddress = updates.address !== undefined ? updates.address.trim() : (neonUser.address || '');
        const newPass = updates.password ? updates.password : neonUser.password_hash;

        const updateRes = await query(
          `UPDATE users 
           SET full_name = $1, phone = $2, address = $3, password_hash = $4 
           WHERE id = $5 
           RETURNING id, email, full_name, phone, address, role, created_at`,
          [newFullName, newPhone, newAddress, newPass, neonUser.id]
        );

        if (updateRes && updateRes.rows && updateRes.rows.length > 0) {
          const r = updateRes.rows[0];
          const resultUser = {
            id: r.id,
            email: r.email,
            fullName: r.full_name,
            phone: r.phone || '',
            address: r.address || '',
            role: r.role,
            createdAt: r.created_at
          };

          // Synchronize in memory
          const memIdx = memoryData.users.findIndex(u => u.id === r.id || u.email.toLowerCase() === r.email.toLowerCase());
          if (memIdx >= 0) {
            memoryData.users[memIdx] = { ...memoryData.users[memIdx], ...resultUser, password: newPass };
          } else {
            memoryData.users.push({ ...resultUser, password: newPass });
          }
          saveToDisk();
          return resultUser;
        }
      }
    } catch (err) {
      console.warn('Lỗi update user profile Neon:', err.message);
    }
  }

  // Fallback in-memory
  if (!user) return null;

  if (updates.fullName !== undefined) user.fullName = updates.fullName.trim();
  if (updates.phone !== undefined) user.phone = updates.phone.trim();
  if (updates.address !== undefined) user.address = updates.address.trim();
  if (updates.password) user.password = updates.password;
  saveToDisk();

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone || '',
    address: user.address || '',
    role: user.role,
    createdAt: user.createdAt
  };
};

export const dbUpdateUserRole = async (id, newRole) => {
  await ensureNeonConnected();
  const user = memoryData.users.find(u => u.id === id);
  if (user) {
    user.role = newRole;
    saveToDisk();
  }

  if (isNeonConnected()) {
    try {
      await query('UPDATE users SET role = $1 WHERE id = $2', [newRole, id]);
    } catch (err) {
      console.warn('Lỗi update role Neon:', err.message);
    }
  }
  return user || { id, role: newRole };
};

export const dbDeleteUser = async (id) => {
  await ensureNeonConnected();
  const initialLen = memoryData.users.length;
  memoryData.users = memoryData.users.filter(u => u.id !== id);

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
  if (!email) return null;
  await ensureNeonConnected();
  const cleanEmail = email.trim().toLowerCase();

  if (isNeonConnected()) {
    try {
      const res = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [cleanEmail]);
      if (res && res.rows && res.rows.length > 0) {
        const r = res.rows[0];
        const userObj = {
          id: r.id,
          email: r.email,
          password: r.password_hash,
          fullName: r.full_name,
          phone: r.phone || '',
          address: r.address || '',
          role: r.role,
          sessionToken: r.session_token || null,
          deviceInfo: r.device_info || '',
          lastLoginAt: r.last_login_at || null,
          createdAt: r.created_at
        };
        // sync to memoryData if missing
        const idx = memoryData.users.findIndex(u => u.id === r.id || u.email.toLowerCase() === cleanEmail);
        if (idx >= 0) {
          memoryData.users[idx] = { ...memoryData.users[idx], ...userObj };
        } else {
          memoryData.users.push(userObj);
        }
        return userObj;
      }
    } catch (err) {
      console.warn('Lỗi tìm user Neon DB:', err.message);
    }
  }
  return memoryData.users.find(u => u.email.toLowerCase() === cleanEmail);
};

export const dbFindUserById = async (id) => {
  if (!id) return null;
  await ensureNeonConnected();

  if (isNeonConnected()) {
    try {
      const res = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      if (res && res.rows && res.rows.length > 0) {
        const r = res.rows[0];
        const userObj = {
          id: r.id,
          email: r.email,
          password: r.password_hash,
          fullName: r.full_name,
          phone: r.phone || '',
          address: r.address || '',
          role: r.role,
          sessionToken: r.session_token || null,
          deviceInfo: r.device_info || '',
          lastLoginAt: r.last_login_at || null,
          createdAt: r.created_at
        };
        const idx = memoryData.users.findIndex(u => u.id === r.id);
        if (idx >= 0) {
          memoryData.users[idx] = { ...memoryData.users[idx], ...userObj };
        } else {
          memoryData.users.push(userObj);
        }
        return userObj;
      }
    } catch (err) {
      console.warn('Lỗi tìm user theo id Neon DB:', err.message);
    }
  }
  return memoryData.users.find(u => u.id === id) || null;
};

export const dbUpdateUserSession = async (userId, sessionToken, deviceInfo = '') => {
  if (!userId) return null;
  await ensureNeonConnected();

  const now = new Date().toISOString();

  // Update memory
  const user = memoryData.users.find(u => u.id === userId);
  if (user) {
    user.sessionToken = sessionToken;
    user.deviceInfo = deviceInfo;
    user.lastLoginAt = now;
  }
  saveToDisk();

  // Update Neon DB
  if (isNeonConnected()) {
    try {
      await query(
        `UPDATE users 
         SET session_token = $1, device_info = $2, last_login_at = $3 
         WHERE id = $4`,
        [sessionToken, deviceInfo, now, userId]
      );
    } catch (err) {
      console.warn('Lỗi cập nhật session user trên Neon:', err.message);
    }
  }

  return user || null;
};

export const dbValidateUserSession = async (userId, sessionToken) => {
  if (!userId) {
    return { valid: false, code: 'INVALID_REQUEST', message: 'Thiếu thông tin tài khoản người dùng.' };
  }
  if (!sessionToken) {
    return { valid: false, code: 'NO_TOKEN', message: 'Phiên làm việc chưa được cung cấp mã xác thực.' };
  }

  const user = await dbFindUserById(userId);
  if (!user) {
    return { valid: false, code: 'USER_NOT_FOUND', message: 'Tài khoản không tồn tại trên hệ thống.' };
  }

  // If user has not had a session token bound yet, bind this token as the active single session
  if (!user.sessionToken) {
    await dbUpdateUserSession(userId, sessionToken, 'Thiết bị hiện tại');
    return { valid: true };
  }

  // Strict check: current token MUST match the active session token stored in DB
  if (user.sessionToken !== sessionToken) {
    return {
      valid: false,
      code: 'CONCURRENT_DEVICE_LOGIN',
      message: 'Tài khoản của bạn đã được đăng nhập từ một thiết bị khác. Để đảm bảo an toàn, hệ thống chỉ cho phép 1 thiết bị hoạt động tại một thời điểm. Phiên làm việc trên thiết bị này đã tự động kết thúc.'
    };
  }

  return { valid: true };
};

// ==================== ORDERS REPOSITORY ====================

const safeParseArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const p = JSON.parse(val);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const dbGetOrders = async () => {
  await ensureNeonConnected();
  if (isNeonConnected()) {
    try {
      const res = await query('SELECT * FROM orders ORDER BY created_at DESC');
      if (res && Array.isArray(res.rows)) {
        const mapped = res.rows.map(r => ({
          id: r.id,
          userId: r.user_id || null,
          customerName: r.customer_name,
          phone: r.phone,
          address: r.address,
          items: safeParseArray(r.items),
          totalAmount: Number(r.total_amount),
          shippingFee: Number(r.shipping_fee),
          paymentMethod: r.payment_method,
          paymentStatus: r.payment_status,
          orderStatus: r.order_status,
          trackingCode: r.tracking_code || null,
          note: r.note,
          timeline: safeParseArray(r.timeline),
          createdAt: r.created_at
        }));
        memoryData.orders = mapped;
        saveToDisk();
        return mapped;
      }
    } catch (err) {
      console.warn('Lỗi đọc orders Neon DB:', err.message);
    }
  }
  return memoryData.orders.map(o => ({
    ...o,
    items: safeParseArray(o.items),
    timeline: safeParseArray(o.timeline)
  }));
};

export const dbSaveOrder = async (order) => {
  memoryData.orders.unshift(order);
  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query(
        `INSERT INTO orders (
          id, user_id, customer_name, phone, address, items, total_amount, shipping_fee,
          payment_method, payment_status, order_status, note, timeline, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          order_status = EXCLUDED.order_status,
          payment_status = EXCLUDED.payment_status,
          timeline = EXCLUDED.timeline`,
        [
          order.id, order.userId || null, order.customerName, order.phone, order.address, JSON.stringify(order.items),
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

export const dbUpdateOrder = async (id, updates) => {
  await ensureNeonConnected();
  const order = memoryData.orders.find(o => o.id === id);
  if (!order) return null;

  const now = new Date();
  const formattedDate = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;

  const updatedOrder = {
    ...order,
    customerName: updates.customerName !== undefined ? updates.customerName.trim() : order.customerName,
    phone: updates.phone !== undefined ? updates.phone.trim() : order.phone,
    address: updates.address !== undefined ? updates.address.trim() : order.address,
    note: updates.note !== undefined ? updates.note : order.note,
    trackingCode: updates.trackingCode !== undefined ? (updates.trackingCode ? updates.trackingCode.trim() : null) : (order.trackingCode || null),
    carrier: updates.carrier !== undefined ? (updates.carrier ? updates.carrier.trim() : 'GHTK') : (order.carrier || 'GHTK'),
    paymentMethod: updates.paymentMethod !== undefined ? updates.paymentMethod : order.paymentMethod,
    paymentStatus: updates.paymentStatus !== undefined ? updates.paymentStatus : order.paymentStatus,
    orderStatus: updates.orderStatus !== undefined ? updates.orderStatus : order.orderStatus,
    shippingFee: updates.shippingFee !== undefined ? Number(updates.shippingFee) : order.shippingFee,
    totalAmount: updates.totalAmount !== undefined ? Number(updates.totalAmount) : order.totalAmount,
    items: updates.items !== undefined ? updates.items : order.items
  };

  if (updates.orderStatus && updates.orderStatus !== order.orderStatus) {
    updatedOrder.timeline = updatedOrder.timeline || [];
    updatedOrder.timeline.unshift({
      time: formattedDate,
      status: `Chuyển trạng thái: ${updates.orderStatus}${updates.timelineNote ? ` (${updates.timelineNote})` : ''}`
    });
  }

  const idx = memoryData.orders.findIndex(o => o.id === id);
  if (idx !== -1) {
    memoryData.orders[idx] = updatedOrder;
  }
  saveToDisk();

  if (isNeonConnected()) {
    try {
      await query(
        `UPDATE orders SET
           customer_name = $1, phone = $2, address = $3, note = $4,
           tracking_code = $5, carrier = $6, payment_method = $7, payment_status = $8,
           order_status = $9, shipping_fee = $10, total_amount = $11,
           items = $12, timeline = $13
         WHERE id = $14`,
        [
          updatedOrder.customerName, updatedOrder.phone, updatedOrder.address, updatedOrder.note,
          updatedOrder.trackingCode, updatedOrder.carrier, updatedOrder.paymentMethod, updatedOrder.paymentStatus,
          updatedOrder.orderStatus, updatedOrder.shippingFee, updatedOrder.totalAmount,
          JSON.stringify(updatedOrder.items), JSON.stringify(updatedOrder.timeline || []), id
        ]
      );
    } catch (err) {
      console.warn('Lỗi cập nhật order Neon DB:', err.message);
    }
  }

  return updatedOrder;
};

export const dbDeleteOrder = async (id) => {
  await ensureNeonConnected();
  const initialLen = memoryData.orders.length;
  memoryData.orders = memoryData.orders.filter(o => o.id !== id);
  const deleted = memoryData.orders.length < initialLen;
  if (deleted) saveToDisk();

  if (isNeonConnected()) {
    try {
      await query('DELETE FROM order_items WHERE order_id = $1', [id]).catch(() => {});
      await query('DELETE FROM orders WHERE id = $1', [id]);
    } catch (err) {
      console.warn('Lỗi xóa order Neon DB:', err.message);
    }
  }

  return deleted;
};

// ==================== CATEGORIES REPOSITORY ====================

export const dbGetCategories = async () => {
  await ensureNeonConnected();
  if (isNeonConnected()) {
    try {
      const res = await query('SELECT * FROM categories ORDER BY display_order ASC, name ASC');
      if (res && Array.isArray(res.rows)) {
        const mapped = res.rows.map(r => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          icon: r.icon,
          description: r.description,
          bannerImage: r.banner_image,
          displayOrder: r.display_order
        }));
        memoryData.categories = mapped;
        saveToDisk();
        return mapped;
      }
    } catch (e) {
      console.warn('Lỗi đọc categories Neon DB:', e.message);
    }
  }
  return memoryData.categories || [];
};

// ==================== VOUCHERS REPOSITORY ====================

export const dbGetVouchers = async (includeInactive = false) => {
  await ensureNeonConnected();
  if (isNeonConnected()) {
    try {
      const sql = includeInactive 
        ? 'SELECT * FROM vouchers ORDER BY created_at DESC'
        : 'SELECT * FROM vouchers WHERE is_active = true ORDER BY created_at DESC';
      const res = await query(sql);
      if (res && Array.isArray(res.rows)) {
        const mapped = res.rows.map(r => ({
          id: r.id,
          code: r.code,
          discountType: r.discount_type,
          discountValue: Number(r.discount_value),
          minOrderValue: Number(r.min_order_value || 0),
          maxDiscount: r.max_discount ? Number(r.max_discount) : null,
          usageLimit: r.usage_limit,
          usedCount: Number(r.used_count || 0),
          description: r.description,
          isActive: r.is_active,
          expiresAt: r.expires_at,
          createdAt: r.created_at
        }));
        if (includeInactive) {
          memoryData.vouchers = mapped;
          saveToDisk();
        }
        return mapped;
      }
    } catch (e) {
      console.warn('Lỗi đọc vouchers Neon DB:', e.message);
    }
  }
  const allVouchers = memoryData.vouchers || [];
  return includeInactive ? allVouchers : allVouchers.filter(v => v.isActive !== false);
};

export const dbCreateVoucher = async (voucherData) => {
  const code = String(voucherData.code || '').trim().toUpperCase();
  if (!code) {
    throw new Error('Mã voucher không được để trống');
  }

  const existing = await dbGetVouchers(true);
  if (existing.some(v => v.code === code)) {
    throw new Error(`Mã voucher "${code}" đã tồn tại trên hệ thống`);
  }

  const newVoucher = {
    id: voucherData.id || `voucher-${Date.now()}`,
    code,
    discountType: voucherData.discountType === 'fixed' ? 'fixed' : 'percentage',
    discountValue: Number(voucherData.discountValue) || 0,
    minOrderValue: Number(voucherData.minOrderValue) || 0,
    maxDiscount: voucherData.maxDiscount ? Number(voucherData.maxDiscount) : null,
    usageLimit: Number(voucherData.usageLimit) || 500,
    usedCount: 0,
    description: voucherData.description || `Ưu đãi ${code}`,
    isActive: voucherData.isActive !== false,
    expiresAt: voucherData.expiresAt ? new Date(voucherData.expiresAt).toISOString() : null,
    createdAt: new Date().toISOString()
  };

  if (isNeonConnected()) {
    try {
      await query(
        `INSERT INTO vouchers (id, code, discount_type, discount_value, min_order_value, max_discount, usage_limit, used_count, description, is_active, expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
         ON CONFLICT (code) DO UPDATE SET
           discount_type = EXCLUDED.discount_type,
           discount_value = EXCLUDED.discount_value,
           min_order_value = EXCLUDED.min_order_value,
           max_discount = EXCLUDED.max_discount,
           usage_limit = EXCLUDED.usage_limit,
           description = EXCLUDED.description,
           is_active = EXCLUDED.is_active,
           expires_at = EXCLUDED.expires_at`,
        [
          newVoucher.id,
          newVoucher.code,
          newVoucher.discountType,
          newVoucher.discountValue,
          newVoucher.minOrderValue,
          newVoucher.maxDiscount,
          newVoucher.usageLimit,
          newVoucher.usedCount,
          newVoucher.description,
          newVoucher.isActive,
          newVoucher.expiresAt
        ]
      );
    } catch (e) {
      console.warn('Lỗi thêm voucher vào Neon DB:', e.message);
    }
  }

  if (!memoryData.vouchers) memoryData.vouchers = [];
  memoryData.vouchers.unshift(newVoucher);
  saveToDisk();

  return newVoucher;
};

export const dbUpdateVoucher = async (id, updateData) => {
  const vouchers = await dbGetVouchers(true);
  const target = vouchers.find(v => v.id === id || v.code === id);
  if (!target) {
    throw new Error(`Không tìm thấy mã giảm giá có mã ID "${id}"`);
  }

  const updatedVoucher = {
    ...target,
    code: updateData.code ? String(updateData.code).trim().toUpperCase() : target.code,
    discountType: updateData.discountType ? updateData.discountType : target.discountType,
    discountValue: updateData.discountValue !== undefined ? Number(updateData.discountValue) : target.discountValue,
    minOrderValue: updateData.minOrderValue !== undefined ? Number(updateData.minOrderValue) : target.minOrderValue,
    maxDiscount: updateData.maxDiscount !== undefined ? (updateData.maxDiscount ? Number(updateData.maxDiscount) : null) : target.maxDiscount,
    usageLimit: updateData.usageLimit !== undefined ? Number(updateData.usageLimit) : target.usageLimit,
    description: updateData.description !== undefined ? updateData.description : target.description,
    isActive: updateData.isActive !== undefined ? Boolean(updateData.isActive) : target.isActive,
    expiresAt: updateData.expiresAt !== undefined ? (updateData.expiresAt ? new Date(updateData.expiresAt).toISOString() : null) : target.expiresAt
  };

  if (isNeonConnected()) {
    try {
      await query(
        `UPDATE vouchers 
         SET code = $1, discount_type = $2, discount_value = $3, min_order_value = $4,
             max_discount = $5, usage_limit = $6, description = $7, is_active = $8, expires_at = $9
         WHERE id = $10 OR code = $10`,
        [
          updatedVoucher.code,
          updatedVoucher.discountType,
          updatedVoucher.discountValue,
          updatedVoucher.minOrderValue,
          updatedVoucher.maxDiscount,
          updatedVoucher.usageLimit,
          updatedVoucher.description,
          updatedVoucher.isActive,
          updatedVoucher.expiresAt,
          target.id
        ]
      );
    } catch (e) {
      console.warn('Lỗi cập nhật voucher Neon DB:', e.message);
    }
  }

  const memIdx = (memoryData.vouchers || []).findIndex(v => v.id === target.id || v.code === target.code);
  if (memIdx !== -1) {
    memoryData.vouchers[memIdx] = updatedVoucher;
  } else {
    memoryData.vouchers.push(updatedVoucher);
  }
  saveToDisk();

  return updatedVoucher;
};

export const dbDeleteVoucher = async (id) => {
  const clean = String(id).trim();
  const cleanUpper = clean.toUpperCase();
  await ensureNeonConnected();

  if (isNeonConnected()) {
    try {
      await query('UPDATE orders SET voucher_code = NULL WHERE voucher_code = $1 OR voucher_code = $2', [clean, cleanUpper]).catch(() => {});
      await query('DELETE FROM vouchers WHERE id = $1 OR UPPER(code) = $2 OR code = $1', [clean, cleanUpper]);
    } catch (e) {
      console.warn('Lỗi xóa voucher Neon DB:', e.message);
    }
  }

  if (memoryData.vouchers) {
    memoryData.vouchers = memoryData.vouchers.filter(v => v.id !== clean && v.code !== clean && v.code !== cleanUpper);
    saveToDisk();
  }

  return { success: true, message: `Đã xóa mã voucher ${clean} thành công` };
};

export const dbToggleVoucherActive = async (id) => {
  const vouchers = await dbGetVouchers(true);
  const target = vouchers.find(v => v.id === id || v.code === id);
  if (!target) {
    throw new Error(`Không tìm thấy mã giảm giá ID "${id}"`);
  }

  const newStatus = !target.isActive;

  if (isNeonConnected()) {
    try {
      await query('UPDATE vouchers SET is_active = $1 WHERE id = $2 OR code = $2', [newStatus, target.id]);
    } catch (e) {
      console.warn('Lỗi đổi trạng thái voucher Neon DB:', e.message);
    }
  }

  const memIdx = (memoryData.vouchers || []).findIndex(v => v.id === target.id || v.code === target.code);
  if (memIdx !== -1) {
    memoryData.vouchers[memIdx].isActive = newStatus;
  }
  saveToDisk();

  return { success: true, id: target.id, code: target.code, isActive: newStatus };
};

export const dbValidateAndApplyVoucher = async (code, orderTotal) => {
  if (!code) return { success: false, message: 'Vui lòng cung cấp mã voucher' };
  const cleanCode = String(code).trim().toUpperCase();
  const vouchers = await dbGetVouchers(false);
  const voucher = vouchers.find(v => v.code === cleanCode);

  if (!voucher) {
    return { success: false, message: `Mã giảm giá "${cleanCode}" không hợp lệ hoặc đã bị tạm ngưng` };
  }

  if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
    return { success: false, message: `Mã giảm giá "${cleanCode}" đã hết hạn sử dụng` };
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
  await ensureNeonConnected();
  if (isNeonConnected()) {
    try {
      const sql = productId 
        ? 'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC'
        : 'SELECT * FROM reviews ORDER BY created_at DESC';
      const params = productId ? [productId] : [];
      const res = await query(sql, params);
      if (res && Array.isArray(res.rows)) {
        const mapped = res.rows.map(r => ({
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
        if (!productId) {
          memoryData.reviews = mapped;
          saveToDisk();
        }
        return mapped;
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
  await ensureNeonConnected();
  if (isNeonConnected()) {
    try {
      const res = await query('SELECT * FROM consultations ORDER BY created_at DESC');
      if (res && Array.isArray(res.rows)) {
        const mapped = res.rows.map(r => ({
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
        memoryData.consultations = mapped;
        saveToDisk();
        return mapped;
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
  await ensureNeonConnected();
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

// ==================== CUSTOMIZER & CHARMS CRUD ====================

export const dbGetCustomizerOptions = () => {
  return memoryData.customizerOptions;
};

// Generic add item to a customizer category
export const dbAddCustomizerItem = (category, item) => {
  if (!memoryData.customizerOptions[category]) return null;
  // Generate ID if missing
  if (!item.id) {
    const prefix = category === 'beads' ? 'bead' : category === 'charms' ? 'charm' : category === 'cords' ? 'cord' : 'item';
    item.id = `${prefix}-${Date.now()}`;
  }
  memoryData.customizerOptions[category].push(item);
  saveToDisk();
  return item;
};

export const dbUpdateCustomizerItem = (category, id, updates) => {
  if (!memoryData.customizerOptions[category]) return null;
  const idx = memoryData.customizerOptions[category].findIndex(i => i.id === id);
  if (idx === -1) return null;
  memoryData.customizerOptions[category][idx] = { ...memoryData.customizerOptions[category][idx], ...updates };
  saveToDisk();
  return memoryData.customizerOptions[category][idx];
};

export const dbDeleteCustomizerItem = (category, id) => {
  if (!memoryData.customizerOptions[category]) return false;
  const before = memoryData.customizerOptions[category].length;
  memoryData.customizerOptions[category] = memoryData.customizerOptions[category].filter(i => i.id !== id);
  const deleted = memoryData.customizerOptions[category].length < before;
  if (deleted) saveToDisk();
  return deleted;
};

// Dedicated Charm Operations (Neon PostgreSQL + In-Memory + Disk)
export const dbGetCharms = async (filters = {}) => {
  let list = Array.isArray(memoryData.customizerOptions?.charms) 
    ? [...memoryData.customizerOptions.charms] 
    : [];

  if (isNeonConnected()) {
    try {
      const res = await query('SELECT * FROM charms ORDER BY created_at ASC');
      if (res.rows && res.rows.length > 0) {
        list = res.rows.map(r => ({
          id: r.id,
          name: r.name,
          material: r.material,
          category: r.category,
          price: Number(r.price) || 0,
          image: r.image || '',
          icon: r.icon || 'Sparkles',
          desc: r.description || '',
          description: r.description || '',
          meaning: r.meaning || '',
          stock: Number(r.stock) || 0,
          inStock: r.in_stock !== false,
          menh: Array.isArray(r.menh) ? r.menh : ['Tất cả'],
          sizeMm: r.size_mm || '10mm',
          createdAt: r.created_at
        }));
        // Update memory cache
        if (memoryData.customizerOptions) {
          memoryData.customizerOptions.charms = list;
        }
      }
    } catch (e) {
      console.warn('Neon dbGetCharms fallback to memory:', e.message);
    }
  }

  // Filter in memory
  if (filters.q) {
    const qLower = filters.q.toLowerCase().trim();
    list = list.filter(c => 
      c.name?.toLowerCase().includes(qLower) || 
      c.material?.toLowerCase().includes(qLower) ||
      c.desc?.toLowerCase().includes(qLower) ||
      c.category?.toLowerCase().includes(qLower)
    );
  }

  if (filters.material && filters.material !== 'all') {
    list = list.filter(c => c.material === filters.material);
  }

  if (filters.category && filters.category !== 'all') {
    list = list.filter(c => c.category === filters.category);
  }

  if (filters.inStock !== undefined && filters.inStock !== 'all') {
    const shouldBeInStock = filters.inStock === 'true' || filters.inStock === true;
    list = list.filter(c => c.inStock === shouldBeInStock);
  }

  return list;
};

export const dbGetCharmById = async (id) => {
  const charms = await dbGetCharms();
  return charms.find(c => c.id === id) || null;
};

export const dbCreateCharm = async (charmData) => {
  const id = charmData.id || `charm-${Date.now()}`;
  const newCharm = {
    id,
    name: charmData.name?.trim() || 'Charm Thủ Công Mới',
    material: charmData.material || 'Bạc 925',
    category: charmData.category || 'Khác',
    price: Number(charmData.price) || 0,
    image: charmData.image || '',
    icon: charmData.icon || 'Sparkles',
    desc: charmData.desc || charmData.description || '',
    description: charmData.desc || charmData.description || '',
    meaning: charmData.meaning || '',
    stock: Number(charmData.stock) || 30,
    inStock: charmData.inStock !== false,
    menh: Array.isArray(charmData.menh) && charmData.menh.length > 0 ? charmData.menh : ['Tất cả'],
    sizeMm: charmData.sizeMm || '10mm',
    createdAt: new Date().toISOString()
  };

  // 1. Neon DB
  if (isNeonConnected()) {
    try {
      await query(
        `INSERT INTO charms (id, name, material, category, price, image, icon, description, meaning, stock, in_stock, menh, size_mm, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, material = EXCLUDED.material, category = EXCLUDED.category,
           price = EXCLUDED.price, image = EXCLUDED.image, icon = EXCLUDED.icon,
           description = EXCLUDED.description, meaning = EXCLUDED.meaning, stock = EXCLUDED.stock,
           in_stock = EXCLUDED.in_stock, menh = EXCLUDED.menh, size_mm = EXCLUDED.size_mm`,
        [
          newCharm.id, newCharm.name, newCharm.material, newCharm.category, newCharm.price,
          newCharm.image, newCharm.icon, newCharm.description, newCharm.meaning,
          newCharm.stock, newCharm.inStock, JSON.stringify(newCharm.menh), newCharm.sizeMm, newCharm.createdAt
        ]
      );
    } catch (e) {
      console.warn('Neon dbCreateCharm fallback to disk:', e.message);
    }
  }

  // 2. Memory & Disk
  if (!memoryData.customizerOptions.charms) memoryData.customizerOptions.charms = [];
  memoryData.customizerOptions.charms.push(newCharm);
  saveToDisk();
  return newCharm;
};

export const dbUpdateCharm = async (id, updates) => {
  let existing = memoryData.customizerOptions.charms.find(c => c.id === id);
  if (!existing) return null;

  const updatedCharm = {
    ...existing,
    ...updates,
    price: updates.price !== undefined ? Number(updates.price) : existing.price,
    stock: updates.stock !== undefined ? Number(updates.stock) : existing.stock,
    inStock: updates.inStock !== undefined ? Boolean(updates.inStock) : existing.inStock
  };

  if (isNeonConnected()) {
    try {
      await query(
        `UPDATE charms SET
           name = COALESCE($2, name), material = COALESCE($3, material), category = COALESCE($4, category),
           price = COALESCE($5, price), image = COALESCE($6, image), icon = COALESCE($7, icon),
           description = COALESCE($8, description), meaning = COALESCE($9, meaning), stock = COALESCE($10, stock),
           in_stock = COALESCE($11, in_stock), menh = COALESCE($12, menh), size_mm = COALESCE($13, size_mm)
         WHERE id = $1`,
        [
          id, updatedCharm.name, updatedCharm.material, updatedCharm.category, updatedCharm.price,
          updatedCharm.image, updatedCharm.icon, updatedCharm.description || updatedCharm.desc,
          updatedCharm.meaning, updatedCharm.stock, updatedCharm.inStock,
          JSON.stringify(updatedCharm.menh), updatedCharm.sizeMm
        ]
      );
    } catch (e) {
      console.warn('Neon dbUpdateCharm fallback:', e.message);
    }
  }

  const idx = memoryData.customizerOptions.charms.findIndex(c => c.id === id);
  if (idx !== -1) {
    memoryData.customizerOptions.charms[idx] = updatedCharm;
  }
  saveToDisk();
  return updatedCharm;
};

export const dbDeleteCharm = async (id) => {
  if (isNeonConnected()) {
    try {
      await query('DELETE FROM charms WHERE id = $1', [id]);
    } catch (e) {
      console.warn('Neon dbDeleteCharm fallback:', e.message);
    }
  }

  const before = memoryData.customizerOptions.charms?.length || 0;
  memoryData.customizerOptions.charms = (memoryData.customizerOptions.charms || []).filter(c => c.id !== id);
  const deleted = memoryData.customizerOptions.charms.length < before;
  if (deleted) saveToDisk();
  return deleted;
};

export const dbToggleCharmStock = async (id) => {
  const charm = memoryData.customizerOptions.charms?.find(c => c.id === id);
  if (!charm) return null;
  const newStockStatus = !charm.inStock;
  return await dbUpdateCharm(id, { inStock: newStockStatus });
};

// =========================================================================
// Dedicated Bead Operations (Neon PostgreSQL + In-Memory + Disk Fallback)
// =========================================================================
export const dbGetBeads = async (filters = {}) => {
  let list = Array.isArray(memoryData.customizerOptions?.beads) 
    ? [...memoryData.customizerOptions.beads] 
    : [];

  if (isNeonConnected()) {
    try {
      const res = await query('SELECT * FROM beads ORDER BY created_at ASC');
      if (res.rows && res.rows.length > 0) {
        list = res.rows.map(r => ({
          id: r.id,
          name: r.name,
          pricePerBead: Number(r.price_per_bead) || 8000,
          color: r.color || '#EAA9A9',
          previewClass: r.preview_class || 'bg-rose-300',
          menh: Array.isArray(r.menh) ? r.menh : (typeof r.menh === 'string' ? r.menh.split(', ') : ['Tất cả']),
          description: r.description || '',
          desc: r.description || '',
          meaning: r.meaning || '',
          stock: Number(r.stock) || 100,
          inStock: r.in_stock !== false,
          image: r.image || '',
          createdAt: r.created_at
        }));
        if (memoryData.customizerOptions) {
          memoryData.customizerOptions.beads = list;
        }
      }
    } catch (e) {
      console.warn('Neon dbGetBeads fallback to memory:', e.message);
    }
  }

  // Filter in memory
  if (filters.q) {
    const qLower = filters.q.toLowerCase().trim();
    list = list.filter(b => 
      b.name?.toLowerCase().includes(qLower) || 
      b.desc?.toLowerCase().includes(qLower) ||
      b.meaning?.toLowerCase().includes(qLower)
    );
  }

  if (filters.menh && filters.menh !== 'all') {
    list = list.filter(b => {
      if (Array.isArray(b.menh)) {
        return b.menh.includes('Tất cả') || b.menh.includes(filters.menh);
      }
      if (typeof b.menh === 'string') {
        return b.menh.includes('Tất cả') || b.menh.includes(filters.menh);
      }
      return true;
    });
  }

  if (filters.inStock !== undefined && filters.inStock !== 'all') {
    const shouldBeInStock = filters.inStock === 'true' || filters.inStock === true;
    list = list.filter(b => b.inStock === shouldBeInStock);
  }

  return list;
};

export const dbGetBeadById = async (id) => {
  const beads = await dbGetBeads();
  return beads.find(b => b.id === id) || null;
};

export const dbCreateBead = async (beadData) => {
  const id = beadData.id || `bead-${Date.now()}`;
  const newBead = {
    id,
    name: beadData.name?.trim() || 'Hạt Đá Phong Thủy Mới',
    pricePerBead: Number(beadData.pricePerBead) || 8000,
    color: beadData.color || '#EAA9A9',
    previewClass: beadData.previewClass || 'bg-rose-300',
    menh: Array.isArray(beadData.menh) && beadData.menh.length > 0 ? beadData.menh : ['Tất cả'],
    description: beadData.desc || beadData.description || '',
    desc: beadData.desc || beadData.description || '',
    meaning: beadData.meaning || '',
    stock: Number(beadData.stock) || 100,
    inStock: beadData.inStock !== false,
    image: beadData.image || '',
    createdAt: new Date().toISOString()
  };

  // 1. Neon DB
  if (isNeonConnected()) {
    try {
      await query(
        `INSERT INTO beads (id, name, price_per_bead, color, preview_class, menh, description, meaning, stock, in_stock, image, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, price_per_bead = EXCLUDED.price_per_bead, color = EXCLUDED.color,
           preview_class = EXCLUDED.preview_class, menh = EXCLUDED.menh, description = EXCLUDED.description,
           meaning = EXCLUDED.meaning, stock = EXCLUDED.stock, in_stock = EXCLUDED.in_stock, image = EXCLUDED.image`,
        [
          newBead.id, newBead.name, newBead.pricePerBead, newBead.color, newBead.previewClass,
          JSON.stringify(newBead.menh), newBead.description, newBead.meaning,
          newBead.stock, newBead.inStock, newBead.image, newBead.createdAt
        ]
      );
    } catch (e) {
      console.warn('Neon dbCreateBead fallback to disk:', e.message);
    }
  }

  // 2. Memory & Disk
  if (!memoryData.customizerOptions.beads) memoryData.customizerOptions.beads = [];
  memoryData.customizerOptions.beads.push(newBead);
  saveToDisk();
  return newBead;
};

export const dbUpdateBead = async (id, updates) => {
  let existing = memoryData.customizerOptions.beads?.find(b => b.id === id);
  if (!existing) return null;

  const updatedBead = {
    ...existing,
    ...updates,
    pricePerBead: updates.pricePerBead !== undefined ? Number(updates.pricePerBead) : existing.pricePerBead,
    stock: updates.stock !== undefined ? Number(updates.stock) : existing.stock,
    inStock: updates.inStock !== undefined ? Boolean(updates.inStock) : existing.inStock
  };

  if (isNeonConnected()) {
    try {
      await query(
        `UPDATE beads SET
           name = COALESCE($2, name), price_per_bead = COALESCE($3, price_per_bead), color = COALESCE($4, color),
           preview_class = COALESCE($5, preview_class), menh = COALESCE($6, menh),
           description = COALESCE($7, description), meaning = COALESCE($8, meaning), stock = COALESCE($9, stock),
           in_stock = COALESCE($10, in_stock), image = COALESCE($11, image)
         WHERE id = $1`,
        [
          id, updatedBead.name, updatedBead.pricePerBead, updatedBead.color, updatedBead.previewClass,
          JSON.stringify(updatedBead.menh), updatedBead.description || updatedBead.desc,
          updatedBead.meaning, updatedBead.stock, updatedBead.inStock, updatedBead.image
        ]
      );
    } catch (e) {
      console.warn('Neon dbUpdateBead fallback:', e.message);
    }
  }

  const idx = memoryData.customizerOptions.beads.findIndex(b => b.id === id);
  if (idx !== -1) {
    memoryData.customizerOptions.beads[idx] = updatedBead;
  }
  saveToDisk();
  return updatedBead;
};

export const dbDeleteBead = async (id) => {
  if (isNeonConnected()) {
    try {
      await query('DELETE FROM beads WHERE id = $1', [id]);
    } catch (e) {
      console.warn('Neon dbDeleteBead fallback:', e.message);
    }
  }

  const before = memoryData.customizerOptions.beads?.length || 0;
  memoryData.customizerOptions.beads = (memoryData.customizerOptions.beads || []).filter(b => b.id !== id);
  const deleted = memoryData.customizerOptions.beads.length < before;
  if (deleted) saveToDisk();
  return deleted;
};

export const dbToggleBeadStock = async (id) => {
  const bead = memoryData.customizerOptions.beads?.find(b => b.id === id);
  if (!bead) return null;
  const newStockStatus = !bead.inStock;
  return await dbUpdateBead(id, { inStock: newStockStatus });
};

