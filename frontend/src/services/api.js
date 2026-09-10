const BASE_URL = '/api';

const clientCache = new Map();
const CLIENT_CACHE_TTL = 20000; // 20s client cache for 0ms instantaneous tab switching

const getCached = (key) => {
  const item = clientCache.get(key);
  if (!item) return null;
  if (Date.now() - item.time > CLIENT_CACHE_TTL) {
    clientCache.delete(key);
    return null;
  }
  return item.data;
};

const setCached = (key, data) => {
  clientCache.set(key, { data, time: Date.now() });
};

export const clearClientCache = (prefix = '') => {
  if (!prefix) {
    clientCache.clear();
    return;
  }
  for (const key of clientCache.keys()) {
    if (key.startsWith(prefix)) {
      clientCache.delete(key);
    }
  }
};

export const api = {
  // Products & Categories
  async getProducts(params = {}, bypassCache = false) {
    const cleanParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'all' && value !== 'undefined' && value !== 'null') {
        cleanParams[key] = value;
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    const cacheKey = `products:${query}`;
    
    if (!bypassCache) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }

    const res = await fetch(`${BASE_URL}/products${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm');
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  },

  async getProductById(id) {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
    return res.json();
  },

  async getCategories(bypassCache = false) {
    const cacheKey = 'categories';
    if (!bypassCache) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }

    const res = await fetch(`${BASE_URL}/products/categories`);
    if (!res.ok) throw new Error('Không thể tải danh mục');
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  },

  // Customizer
  async getCustomizerOptions(bypassCache = false) {
    const cacheKey = 'customizer:options';
    if (!bypassCache) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }

    const res = await fetch(`${BASE_URL}/customizer/options`);
    if (!res.ok) throw new Error('Không thể tải linh kiện phối vòng');
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  },

  async calculateCustomPrice(payload) {
    const res = await fetch(`${BASE_URL}/customizer/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Lỗi tính giá vòng tự thiết kế');
    return res.json();
  },

  // Charms Management (Kho Charm Thủ Công)
  async getCharms(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/charms${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Không thể tải danh sách charm');
    return res.json();
  },

  async getCharmById(id) {
    const res = await fetch(`${BASE_URL}/charms/${id}`);
    if (!res.ok) throw new Error('Không tìm thấy charm');
    return res.json();
  },

  async createCharm(charmData) {
    const res = await fetch(`${BASE_URL}/charms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(charmData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi thêm charm mới');
    }
    clearCache('customizer:options');
    return res.json();
  },

  async updateCharm(id, charmData) {
    const res = await fetch(`${BASE_URL}/charms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(charmData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi cập nhật charm');
    }
    clearCache('customizer:options');
    return res.json();
  },

  async deleteCharm(id) {
    const res = await fetch(`${BASE_URL}/charms/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Lỗi xóa charm');
    clearCache('customizer:options');
    return res.json();
  },

  async toggleCharmStock(id) {
    const res = await fetch(`${BASE_URL}/charms/${id}/toggle-stock`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Lỗi đổi trạng thái kho charm');
    clearCache('customizer:options');
    return res.json();
  },

  // Orders
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/orders${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Không thể tải danh sách đơn hàng');
    return res.json();
  },

  async getOrderById(id) {
    const res = await fetch(`${BASE_URL}/orders/${id}`);
    if (!res.ok) throw new Error('Không tìm thấy đơn hàng');
    return res.json();
  },

  async createOrder(orderData) {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi đặt hàng');
    }
    clearClientCache();
    return res.json();
  },

  async updateOrderStatus(id, statusData) {
    const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData)
    });
    if (!res.ok) throw new Error('Không thể cập nhật đơn hàng');
    return res.json();
  },

  async updateOrder(id, orderData) {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi cập nhật thông tin đơn hàng');
    }
    return res.json();
  },

  async deleteOrder(id) {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi xóa đơn hàng');
    }
    return res.json();
  },

  // Admin Stats
  async getAdminStats() {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    if (!res.ok) throw new Error('Không thể tải thống kê xưởng');
    return res.json();
  },

  // Auth & User
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi đăng nhập');
    return data;
  },

  async register(userData) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi đăng ký');
    return data;
  },

  async updateProfile(profileData) {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật thông tin tài khoản');
    return data;
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`);
    return res.json();
  },

  async configureDb(connectionString) {
    const res = await fetch(`${BASE_URL}/auth/configure-db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionString })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi cấu hình database');
    return data;
  },

  async createProduct(productData) {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi thêm sản phẩm');
    clearClientCache('products');
    return data;
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật sản phẩm');
    clearClientCache('products');
    return data;
  },

  async deleteProduct(id) {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi xóa sản phẩm');
    clearClientCache('products');
    return data;
  },

  async toggleProductVisibility(id) {
    const res = await fetch(`${BASE_URL}/products/${id}/toggle-visibility`, {
      method: 'PATCH'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi ẩn/hiện sản phẩm');
    clearClientCache('products');
    return data;
  },

  async setHeroTrending(id) {
    const res = await fetch(`${BASE_URL}/products/${id}/set-hero-trending`, {
      method: 'PATCH'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi đặt sản phẩm xu hướng');
    clearClientCache('products');
    return data;
  },

  // Admin User Management
  async getUsers() {
    const res = await fetch(`${BASE_URL}/admin/users`);
    if (!res.ok) throw new Error('Không thể tải danh sách tài khoản');
    return res.json();
  },

  async createUser(userData) {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi tạo tài khoản');
    return data;
  },

  async updateUserRole(id, role) {
    const res = await fetch(`${BASE_URL}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật vai trò');
    return data;
  },

  async deleteUser(id) {
    const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi xóa tài khoản');
    return data;
  },

  // Database Sync & Telemetry
  async syncNeonDatabase() {
    const res = await fetch(`${BASE_URL}/admin/sync-neon`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi đồng bộ Neon PostgreSQL');
    clearClientCache();
    return data;
  },

  async getDatabaseTelemetry() {
    const res = await fetch(`${BASE_URL}/admin/telemetry`);
    if (!res.ok) throw new Error('Không thể tải thông tin telemetry database');
    return res.json();
  },

  // AI Gemini Vision Analysis
  async analyzeWrist(payload) {
    const res = await fetch(`${BASE_URL}/ai/analyze-wrist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi phân tích AI');
    return data;
  },

  async analyzeBraceletCord(payload) {
    const res = await fetch(`${BASE_URL}/ai/analyze-bracelet-cord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi bóc tách thành phần dây');
    return data;
  },

  async matchBeadsAndCharms(payload) {
    const res = await fetch(`${BASE_URL}/ai/match-beads-charms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi gợi ý bản phối hạt & charm');
    return data;
  },

  // Vouchers & Promotions
  async getVouchers(includeAll = false) {
    const url = includeAll ? `${BASE_URL}/vouchers?all=true` : `${BASE_URL}/vouchers`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể tải danh sách mã giảm giá');
    return res.json();
  },

  async createVoucher(voucherData) {
    const res = await fetch(`${BASE_URL}/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucherData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi thêm mã giảm giá');
    return data;
  },

  async updateVoucher(id, voucherData) {
    const res = await fetch(`${BASE_URL}/vouchers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucherData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật mã giảm giá');
    return data;
  },

  async deleteVoucher(id) {
    const res = await fetch(`${BASE_URL}/vouchers/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi xóa mã giảm giá');
    return data;
  },

  async toggleVoucher(id) {
    const res = await fetch(`${BASE_URL}/vouchers/${id}/toggle`, {
      method: 'PATCH'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi chuyển trạng thái voucher');
    return data;
  },

  async applyVoucher(code, orderTotal) {
    const res = await fetch(`${BASE_URL}/vouchers/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, orderTotal })
    });
    return res.json();
  },

  // Reviews
  async getReviews(productId = null) {
    const url = productId ? `${BASE_URL}/reviews/${productId}` : `${BASE_URL}/reviews`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể nạp đánh giá');
    return res.json();
  },

  async createReview(reviewData) {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return res.json();
  },

  // Database-Synced Wishlist
  async getUserWishlist(userId) {
    const res = await fetch(`${BASE_URL}/wishlist/${userId}`);
    if (!res.ok) return { success: false, data: [] };
    return res.json();
  },

  async toggleWishlistDb(userId, productId) {
    const res = await fetch(`${BASE_URL}/wishlist/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId })
    });
    return res.json();
  },

  async syncWishlistDb(userId, productIds) {
    const res = await fetch(`${BASE_URL}/wishlist/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productIds })
    });
    return res.json();
  },

  // Consultations
  async createConsultation(consultationData) {
    const res = await fetch(`${BASE_URL}/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultationData)
    });
    return res.json();
  }
};

