import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { products as seedProducts, sampleOrders as seedOrders } from './seedData.js';
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

// Initialize local memory/disk store
let memoryData = {
  products: [...seedProducts],
  orders: [...seedOrders],
  users: [...defaultUsers]
};

// Load existing db.json if present
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    // Strictly use the refined 100% cord bracelets catalogue
    memoryData.products = [...seedProducts];
    if (parsed.orders) memoryData.orders = parsed.orders;
    if (parsed.users) memoryData.users = parsed.users;
    console.log('📁 Đã nạp dữ liệu từ tệp lưu trữ vật lý local db.json.');
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryData, null, 2), 'utf8');
    console.log('📁 Đã khởi tạo tệp cơ sở dữ liệu vật lý db.json.');
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

    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      menh JSONB,
      price NUMERIC NOT NULL,
      original_price NUMERIC,
      wholesale_price NUMERIC,
      wholesale_min_qty INTEGER DEFAULT 5,
      rating NUMERIC DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      tag VARCHAR(100),
      stone_type VARCHAR(255),
      cord_type VARCHAR(255),
      bead_size VARCHAR(50),
      artisan_name VARCHAR(100),
      lead_time VARCHAR(100),
      description TEXT,
      meaning TEXT,
      stock INTEGER DEFAULT 10,
      images JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_min_qty INTEGER DEFAULT 5;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS cord_composition JSONB;

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
    await query(createTablesSql);
    console.log('✅ Đã xác thực cấu trúc bảng (users, products, orders) trên Neon PostgreSQL.');
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

  let productsSynced = 0;
  let usersSynced = 0;
  let ordersSynced = 0;

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

  // 2. Sync Products (clean obsolete non-cord items first)
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

  // 3. Sync Orders
  for (const o of memoryData.orders) {
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
          o.id, o.customerName, o.phone, o.address, JSON.stringify(o.items),
          o.totalAmount, o.shippingFee || 25000, o.paymentMethod || 'VietQR',
          o.paymentStatus || 'Chờ thanh toán', o.orderStatus || 'Chờ xác nhận',
          o.note || '', JSON.stringify(o.timeline || []), o.createdAt || new Date().toISOString()
        ]
      );
      ordersSynced++;
    } catch (e) {
      console.warn(`Lỗi sync order ${o.id}:`, e.message);
    }
  }

  return {
    productsSynced,
    usersSynced,
    ordersSynced,
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

export const getDbTelemetry = async () => {
  const products = await dbGetProducts();
  const orders = await dbGetOrders();
  const users = await dbGetUsers();

  return {
    isNeonConnected: isNeonConnected(),
    counts: {
      products: products.length,
      orders: orders.length,
      users: users.length
    },
    storageType: isNeonConnected() ? 'Neon Cloud PostgreSQL + Local Disk' : 'Local Disk File (db.json)'
  };
};
