import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool = null;
let isConnected = false;
let currentConnectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_dxON2tr3BCTK@ep-blue-moon-b3pc0ls7-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export const initNeonDb = async (connStr = null) => {
  const connectionString = connStr || currentConnectionString;

  if (!connectionString) {
    console.log('ℹ️ Chưa có chuỗi kết nối Neon PostgreSQL (DATABASE_URL). Hệ thống đang chạy ở chế độ Local In-Memory & JSON.');
    return { success: false, message: 'Chưa cung cấp DATABASE_URL' };
  }

  if (isConnected && pool && (!connStr || connStr === currentConnectionString)) {
    return { success: true, message: 'Đã kết nối sẵn sàng tới Neon Tech PostgreSQL' };
  }

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
      }
    });

    // Test connection
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as now, version() as ver');
    client.release();

    isConnected = true;
    currentConnectionString = connectionString;

    console.log('🐘 Đã kết nối thành công tới Neon PostgreSQL Database!');
    console.log('🕒 Thời gian máy chủ Neon:', res.rows[0].now);

    // Auto-create tables
    await createTables();

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
  }
};

const createTables = async () => {
  if (!pool) return;

  const createUsersTable = `
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
  `;

  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      menh JSONB,
      price NUMERIC NOT NULL,
      original_price NUMERIC,
      rating NUMERIC,
      reviews_count INTEGER,
      tag VARCHAR(100),
      stone_type VARCHAR(255),
      cord_type VARCHAR(255),
      bead_size VARCHAR(50),
      artisan_name VARCHAR(255),
      lead_time VARCHAR(255),
      description TEXT,
      meaning TEXT,
      stock INTEGER,
      wholesale_price NUMERIC,
      wholesale_min_qty INTEGER DEFAULT 5,
      is_best_seller BOOLEAN DEFAULT false,
      sales_count INTEGER DEFAULT 0,
      cord_composition JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_min_qty INTEGER DEFAULT 5;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS cord_composition JSONB;
  `;

  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      address TEXT NOT NULL,
      items JSONB NOT NULL,
      total_amount NUMERIC NOT NULL,
      shipping_fee NUMERIC DEFAULT 0,
      payment_method VARCHAR(50) DEFAULT 'VietQR',
      payment_status VARCHAR(50) DEFAULT 'Chờ thanh toán',
      order_status VARCHAR(100) DEFAULT 'Chờ xác nhận',
      note TEXT,
      timeline JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createUsersTable);
    await pool.query(createProductsTable);
    await pool.query(createOrdersTable);
    console.log('✅ Các bảng dữ liệu (users, products, orders) trên Neon Database đã sẵn sàng.');
  } catch (err) {
    console.error('Lỗi khởi tạo bảng Neon:', err.message);
  }
};

export const query = async (text, params) => {
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
  initNeonDb();
}
