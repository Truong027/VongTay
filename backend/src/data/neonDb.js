import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool = null;
let isConnected = false;
let connectingPromise = null;
let tablesInitialized = false;
let currentConnectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_dxON2tr3BCTK@ep-blue-moon-b3pc0ls7-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=verify-full';

export const initNeonDb = async (connStr = null) => {
  const connectionString = connStr || currentConnectionString;

  if (!connectionString) {
    console.log('ℹ️ Chưa có chuỗi kết nối Neon PostgreSQL (DATABASE_URL). Hệ thống đang chạy ở chế độ Local In-Memory & JSON.');
    return { success: false, message: 'Chưa cung cấp DATABASE_URL' };
  }

  if (isConnected && pool && (!connStr || connStr === currentConnectionString)) {
    return { success: true, message: 'Đã kết nối sẵn sàng tới Neon Tech PostgreSQL' };
  }

  if (connectingPromise && (!connStr || connStr === currentConnectionString)) {
    return connectingPromise;
  }

  connectingPromise = (async () => {
    try {
      if (pool) {
        const oldPool = pool;
        pool = null;
        await oldPool.end().catch(() => {});
      }

      pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000
      });

      // Test connection
      const client = await pool.connect();
      const res = await client.query('SELECT NOW() as now, version() as ver');
      client.release();

      isConnected = true;
      currentConnectionString = connectionString;

      console.log('🐘 Đã kết nối thành công tới Neon PostgreSQL Database!');
      console.log('🕒 Thời gian máy chủ Neon:', res.rows[0].now);

      // Auto-create tables once
      if (!tablesInitialized) {
        await createTables();
      }

      return { 
        success: true, 
        message: 'Kết nối Neon Tech PostgreSQL thành công',
        serverTime: res.rows[0].now 
      };
    } catch (error) {
      isConnected = false;
      console.error('❌ Lỗi kết nối Neon Database:', error.message);
      return { 
        success: false, 
        message: `Lỗi kết nối Neon: ${error.message}` 
      };
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
};

export const ensureNeonConnected = async () => {
  if (isConnected && pool) return true;
  if (currentConnectionString) {
    const res = await initNeonDb();
    return res.success;
  }
  return false;
};

const createTables = async () => {
  if (!pool || tablesInitialized) return;

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
    ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_min_qty INTEGER DEFAULT 5;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS cord_composition JSONB;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

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
      carrier VARCHAR(100) DEFAULT 'GHTK',
      note TEXT,
      timeline JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id VARCHAR(50);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS wholesale_discount NUMERIC DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_discount NUMERIC DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(100);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier VARCHAR(100);

    -- 5. ORDER_ITEMS (Normalized relational line items)
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

    -- 6. REVIEWS (Ratings & verified customer photos)
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

    -- 7. VOUCHERS (Discount codes & promotions)
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

    -- 8. WISHLISTS (Cloud-saved favorite bracelets)
    CREATE TABLE IF NOT EXISTS wishlists (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_user_wishlist_product UNIQUE (user_id, product_id)
    );

    -- 9. CUSTOM_DESIGNS (User-designed bespoke bracelets)
    CREATE TABLE IF NOT EXISTS custom_designs (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
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

    -- 10. CONSULTATIONS (Feng-shui & custom sizing advice requests)
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

    -- SAFE FOREIGN KEY REINFORCEMENTS ACROSS TABLES
    DO $$
    BEGIN
      -- Add voucher_code to orders if not exists
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'voucher_code') THEN
        ALTER TABLE orders ADD COLUMN voucher_code VARCHAR(50);
      END IF;

      -- Orders -> Users FK
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_orders_user') THEN
        ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
      END IF;

      -- Orders -> Vouchers FK
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_orders_voucher') THEN
        ALTER TABLE orders ADD CONSTRAINT fk_orders_voucher FOREIGN KEY (voucher_code) REFERENCES vouchers(code) ON DELETE SET NULL;
      END IF;

      -- Custom Designs -> Users FK
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_custom_designs_user') THEN
        ALTER TABLE custom_designs ADD CONSTRAINT fk_custom_designs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
      END IF;
    END $$;

    -- Tối ưu hóa chỉ mục (Indexes) giúp truy vấn tìm kiếm, lọc nhanh vượt trội
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_products_is_hidden ON products(is_hidden);
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  `;

  try {
    await pool.query(createTablesSql);
    tablesInitialized = true;
    console.log('✅ Toàn bộ 10 bảng dữ liệu (users, categories, products, orders, order_items, reviews, vouchers, wishlists, custom_designs, consultations) trên Neon PostgreSQL đã sẵn sàng.');
  } catch (err) {
    console.error('Lỗi khởi tạo 10 bảng Neon:', err.message);
  }
};

export const query = async (text, params) => {
  if (!pool || !isConnected) {
    if (currentConnectionString) {
      await ensureNeonConnected();
    }
  }
  if (!pool || !isConnected) {
    return null;
  }
  return pool.query(text, params);
};

export const isNeonConnected = () => isConnected;

export const getConnectionInfo = () => ({
  isConnected,
  maskedUrl: currentConnectionString 
    ? currentConnectionString.replace(/:([^@]+)@/, ':****@')
    : 'Chưa cấu hình (Đang chạy In-Memory Database)',
  projectId: 'patient-resonance-16986828'
});

// Auto-run if DATABASE_URL is present in environment
if (currentConnectionString) {
  ensureNeonConnected().catch(err => console.warn('Background connect notice:', err.message));
}

