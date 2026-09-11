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

export const clearCache = clearClientCache;

const SESSION_TOKEN_KEY = 'viban_session_token';

export const getSessionToken = () => {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setSessionToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    }
  } catch (err) {
    console.warn('Lỗi ghi session token:', err);
  }
};

/**
 * Trích xuất và giải mã dữ liệu an toàn từ phản hồi máy chủ
 * Ngăn chặn tuyệt đối lỗi WebKit / Safari 'The string did not match the expected pattern'
 * khi máy chủ hoặc Vercel trả về HTML/Plaintext (413 Payload Too Large, 500, 502, 504 Timeout)
 */
async function safeParseResponse(res, defaultErrorMsg = 'Thao tác không thành công') {
  let text = '';
  try {
    text = await res.text();
  } catch {
    throw new Error(`${defaultErrorMsg}: Không thể đọc dữ liệu phản hồi từ máy chủ`);
  }

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (res.status === 413) {
        throw new Error('Dung lượng hình ảnh quá lớn vượt giới hạn máy chủ Vercel (4.5MB). Ảnh đã được tự động nén, vui lòng thử lưu lại.');
      }
      if (res.status === 504 || res.status === 502) {
        throw new Error('Máy chủ phản hồi quá lâu (Timeout). Vui lòng thử lại sau giây lát.');
      }
      if (!res.ok) {
        const cleanMsg = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        throw new Error(`${defaultErrorMsg} (Mã lỗi ${res.status}): ${cleanMsg.slice(0, 150) || 'Lỗi hệ thống'}`);
      }
    }
  }

  if (!res.ok) {
    const msg = data?.message || data?.error || `${defaultErrorMsg} (Mã lỗi ${res.status})`;
    throw new Error(msg);
  }

  return data || {};
}

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

    const tParam = bypassCache ? `_t=${Date.now()}` : '';
    const fullQuery = [query, tParam].filter(Boolean).join('&');
    const res = await fetch(`${BASE_URL}/products${fullQuery ? `?${fullQuery}` : ''}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const data = await safeParseResponse(res, 'Không thể tải danh sách sản phẩm');
    setCached(cacheKey, data);
    return data;
  },

  async getProductById(id) {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      cache: 'no-store'
    });
    return safeParseResponse(res, 'Không tìm thấy sản phẩm');
  },

  async getCategories(bypassCache = false) {
    const cacheKey = 'categories';
    if (!bypassCache) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }

    const res = await fetch(`${BASE_URL}/products/categories${bypassCache ? `?_t=${Date.now()}` : ''}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const data = await safeParseResponse(res, 'Không thể tải danh mục');
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
    const data = await safeParseResponse(res, 'Không thể tải linh kiện phối vòng');
    setCached(cacheKey, data);
    return data;
  },

  async calculateCustomPrice(payload) {
    const res = await fetch(`${BASE_URL}/customizer/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return safeParseResponse(res, 'Lỗi tính giá vòng tự thiết kế');
  },

  // Charms Management (Kho Charm Thủ Công)
  async getCharms(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/charms${query ? `?${query}` : ''}`);
    return safeParseResponse(res, 'Không thể tải danh sách charm');
  },

  async getCharmById(id) {
    const res = await fetch(`${BASE_URL}/charms/${id}`);
    return safeParseResponse(res, 'Không tìm thấy charm');
  },

  async createCharm(charmData) {
    const res = await fetch(`${BASE_URL}/charms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(charmData)
    });
    const data = await safeParseResponse(res, 'Lỗi thêm charm mới');
    clearClientCache('customizer:options');
    clearClientCache('/charms');
    return data;
  },

  async updateCharm(id, charmData) {
    const res = await fetch(`${BASE_URL}/charms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(charmData)
    });
    const data = await safeParseResponse(res, 'Lỗi cập nhật charm');
    clearClientCache('customizer:options');
    clearClientCache('/charms');
    return data;
  },

  async deleteCharm(id) {
    const res = await fetch(`${BASE_URL}/charms/${id}`, {
      method: 'DELETE'
    });
    const data = await safeParseResponse(res, 'Lỗi xóa charm');
    clearClientCache('customizer:options');
    clearClientCache('/charms');
    return data;
  },

  async toggleCharmStock(id) {
    const res = await fetch(`${BASE_URL}/charms/${id}/toggle-stock`, {
      method: 'PATCH'
    });
    const data = await safeParseResponse(res, 'Lỗi đổi trạng thái kho charm');
    clearClientCache('customizer:options');
    clearClientCache('/charms');
    return data;
  },

  // Beads Management (Kho Hạt Đá Phong Thủy)
  async getBeads(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/beads${query ? `?${query}` : ''}`);
    return safeParseResponse(res, 'Không thể tải danh sách hạt đá');
  },

  async getBeadById(id) {
    const res = await fetch(`${BASE_URL}/beads/${id}`);
    return safeParseResponse(res, 'Không tìm thấy hạt đá phong thủy');
  },

  async createBead(beadData) {
    const res = await fetch(`${BASE_URL}/beads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(beadData)
    });
    const data = await safeParseResponse(res, 'Lỗi thêm hạt đá mới');
    clearClientCache('customizer:options');
    clearClientCache('/beads');
    return data;
  },

  async updateBead(id, beadData) {
    const res = await fetch(`${BASE_URL}/beads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(beadData)
    });
    const data = await safeParseResponse(res, 'Lỗi cập nhật hạt đá');
    clearClientCache('customizer:options');
    clearClientCache('/beads');
    return data;
  },

  async deleteBead(id) {
    const res = await fetch(`${BASE_URL}/beads/${id}`, {
      method: 'DELETE'
    });
    const data = await safeParseResponse(res, 'Lỗi xóa hạt đá');
    clearClientCache('customizer:options');
    clearClientCache('/beads');
    return data;
  },

  async toggleBeadStock(id) {
    const res = await fetch(`${BASE_URL}/beads/${id}/toggle-stock`, {
      method: 'PATCH'
    });
    const data = await safeParseResponse(res, 'Lỗi đổi trạng thái kho hạt đá');
    clearClientCache('customizer:options');
    clearClientCache('/beads');
    return data;
  },

  // Orders
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/orders${query ? `?${query}` : ''}`);
    return safeParseResponse(res, 'Không thể tải danh sách đơn hàng');
  },

  async getOrderById(id) {
    const res = await fetch(`${BASE_URL}/orders/${id}`);
    return safeParseResponse(res, 'Không tìm thấy đơn hàng');
  },

  async createOrder(orderData) {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const data = await safeParseResponse(res, 'Lỗi đặt hàng');
    clearClientCache();
    return data;
  },

  async updateOrderStatus(id, statusData) {
    const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData)
    });
    return safeParseResponse(res, 'Không thể cập nhật trạng thái đơn hàng');
  },

  async updateOrder(id, orderData) {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return safeParseResponse(res, 'Lỗi cập nhật thông tin đơn hàng');
  },

  async deleteOrder(id) {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      method: 'DELETE'
    });
    return safeParseResponse(res, 'Lỗi xóa đơn hàng');
  },

  // Admin Stats
  async getAdminStats() {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    return safeParseResponse(res, 'Không thể tải thống kê xưởng');
  },

  // Auth & User
  async login(email, password) {
    const deviceInfo = typeof navigator !== 'undefined' ? `${navigator.platform || ''} - ${navigator.userAgent || ''}`.substring(0, 200) : '';
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceInfo })
    });
    const data = await safeParseResponse(res, 'Lỗi đăng nhập');
    if (data?.data?.token) {
      setSessionToken(data.data.token);
    }
    return data;
  },

  async register(userData) {
    const deviceInfo = typeof navigator !== 'undefined' ? `${navigator.platform || ''} - ${navigator.userAgent || ''}`.substring(0, 200) : '';
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, deviceInfo })
    });
    const data = await safeParseResponse(res, 'Lỗi đăng ký');
    if (data?.data?.token) {
      setSessionToken(data.data.token);
    }
    return data;
  },

  async validateSession(userId, token) {
    const activeToken = token || getSessionToken();
    if (!userId || !activeToken) {
      return { valid: true, guest: true };
    }
    try {
      const res = await fetch(`${BASE_URL}/auth/validate-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ userId, token: activeToken })
      });
      const data = await safeParseResponse(res, 'Phiên đăng nhập không hợp lệ');
      if (res.status === 401 && (data.code === 'CONCURRENT_DEVICE_LOGIN' || data.sessionExpired)) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('viban_session_expired', { detail: data }));
        }
        return { valid: false, sessionExpired: true, ...data };
      }
      return data;
    } catch {
      return { valid: true, networkError: true };
    }
  },

  async logout(userId) {
    try {
      const activeToken = getSessionToken();
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ userId })
      });
    } catch (e) {
      console.warn('Logout notice:', e);
    } finally {
      setSessionToken('');
    }
  },

  async updateProfile(profileData) {
    const activeToken = getSessionToken();
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeToken}`
      },
      body: JSON.stringify(profileData)
    });
    const data = await safeParseResponse(res, 'Lỗi cập nhật thông tin tài khoản');
    if (res.status === 401 && data.sessionExpired) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('viban_session_expired', { detail: data }));
      }
      throw new Error(data.message || 'Phiên làm việc đã bị gián đoạn do đăng nhập từ thiết bị khác');
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`);
    return safeParseResponse(res, 'Không thể tải thông tin cá nhân');
  },

  async configureDb(connectionString) {
    const res = await fetch(`${BASE_URL}/auth/configure-db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionString })
    });
    return safeParseResponse(res, 'Lỗi cấu hình database');
  },

  async createProduct(productData) {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const data = await safeParseResponse(res, 'Lỗi thêm sản phẩm');
    clearClientCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('viban_products_updated', { detail: data.data }));
    }
    return data;
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const data = await safeParseResponse(res, 'Lỗi cập nhật sản phẩm');
    clearClientCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('viban_products_updated', { detail: data.data }));
    }
    return data;
  },

  async deleteProduct(id) {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE'
    });
    const data = await safeParseResponse(res, 'Lỗi xóa sản phẩm');
    clearClientCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('viban_products_updated', { detail: { id } }));
    }
    return data;
  },

  async toggleProductVisibility(id) {
    const res = await fetch(`${BASE_URL}/products/${id}/toggle-visibility`, {
      method: 'PATCH'
    });
    const data = await safeParseResponse(res, 'Lỗi ẩn/hiện sản phẩm');
    clearClientCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('viban_products_updated', { detail: data.data }));
    }
    return data;
  },

  async setHeroTrending(id) {
    const res = await fetch(`${BASE_URL}/products/${id}/set-hero-trending`, {
      method: 'PATCH'
    });
    const data = await safeParseResponse(res, 'Lỗi đặt sản phẩm xu hướng');
    clearClientCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('viban_products_updated', { detail: data.data }));
    }
    return data;
  },

  // Admin User Management
  async getUsers() {
    const res = await fetch(`${BASE_URL}/admin/users`);
    return safeParseResponse(res, 'Không thể tải danh sách tài khoản');
  },

  async createUser(userData) {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await safeParseResponse(res, 'Lỗi tạo tài khoản');
  },

  async updateUserRole(id, role) {
    const res = await fetch(`${BASE_URL}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return await safeParseResponse(res, 'Lỗi cập nhật vai trò');
  },

  async deleteUser(id) {
    const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'DELETE'
    });
    return await safeParseResponse(res, 'Lỗi xóa tài khoản');
  },

  // Database Sync & Telemetry
  async syncNeonDatabase() {
    const res = await fetch(`${BASE_URL}/admin/sync-neon`, {
      method: 'POST'
    });
    const data = await safeParseResponse(res, 'Lỗi đồng bộ Neon PostgreSQL');
    clearClientCache();
    return data;
  },

  async getDatabaseTelemetry() {
    const res = await fetch(`${BASE_URL}/admin/telemetry`);
    return safeParseResponse(res, 'Không thể tải thông tin telemetry database');
  },

  // AI Gemini Vision Analysis
  async analyzeWrist(payload) {
    const res = await fetch(`${BASE_URL}/ai/analyze-wrist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await safeParseResponse(res, 'Lỗi phân tích AI');
  },

  async analyzeBraceletCord(payload) {
    const res = await fetch(`${BASE_URL}/ai/analyze-bracelet-cord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await safeParseResponse(res, 'Lỗi bóc tách thành phần dây');
  },

  async matchBeadsAndCharms(payload) {
    const res = await fetch(`${BASE_URL}/ai/match-beads-charms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await safeParseResponse(res, 'Lỗi gợi ý bản phối hạt & charm');
  },

  // Vouchers & Promotions
  async getVouchers(includeAll = false) {
    const url = includeAll ? `${BASE_URL}/vouchers?all=true` : `${BASE_URL}/vouchers`;
    const res = await fetch(url);
    return safeParseResponse(res, 'Không thể tải danh sách mã giảm giá');
  },

  async createVoucher(voucherData) {
    const res = await fetch(`${BASE_URL}/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucherData)
    });
    return await safeParseResponse(res, 'Lỗi thêm mã giảm giá');
  },

  async updateVoucher(id, voucherData) {
    const res = await fetch(`${BASE_URL}/vouchers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucherData)
    });
    return await safeParseResponse(res, 'Lỗi cập nhật mã giảm giá');
  },

  async deleteVoucher(id) {
    const res = await fetch(`${BASE_URL}/vouchers/${id}`, {
      method: 'DELETE'
    });
    return await safeParseResponse(res, 'Lỗi xóa mã giảm giá');
  },

  async toggleVoucher(id) {
    const res = await fetch(`${BASE_URL}/vouchers/${id}/toggle`, {
      method: 'PATCH'
    });
    return await safeParseResponse(res, 'Lỗi chuyển trạng thái voucher');
  },

  async applyVoucher(code, orderTotal) {
    const res = await fetch(`${BASE_URL}/vouchers/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, orderTotal })
    });
    return safeParseResponse(res, 'Lỗi áp dụng mã giảm giá');
  },

  // Reviews
  async getReviews(productId = null) {
    const url = productId ? `${BASE_URL}/reviews/${productId}` : `${BASE_URL}/reviews`;
    const res = await fetch(url);
    return safeParseResponse(res, 'Không thể nạp đánh giá');
  },

  async createReview(reviewData) {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return safeParseResponse(res, 'Lỗi gửi đánh giá');
  },

  // Database-Synced Wishlist
  async getUserWishlist(userId) {
    const res = await fetch(`${BASE_URL}/wishlist/${userId}`);
    return safeParseResponse(res, 'Lỗi tải danh sách yêu thích');
  },

  async toggleWishlistDb(userId, productId) {
    const res = await fetch(`${BASE_URL}/wishlist/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId })
    });
    return safeParseResponse(res, 'Lỗi lưu danh sách yêu thích');
  },

  async syncWishlistDb(userId, productIds) {
    const res = await fetch(`${BASE_URL}/wishlist/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productIds })
    });
    return safeParseResponse(res, 'Lỗi đồng bộ danh sách yêu thích');
  },

  // Consultations
  async createConsultation(consultationData) {
    const res = await fetch(`${BASE_URL}/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultationData)
    });
    return safeParseResponse(res, 'Lỗi gửi yêu cầu tư vấn');
  }
};

