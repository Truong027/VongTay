import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  Sparkles, 
  RefreshCw, 
  Search, 
  Filter, 
  Check, 
  Eye, 
  AlertCircle,
  Database,
  Lock,
  User,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Users,
  ShieldCheck,
  Tag,
  Phone,
  MapPin,
  FileText,
  Printer,
  X,
  CheckCircle2,
  Upload,
  Flame,
  Layers,
  Wand2
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminDashboard({ onBackToStore, currentUser, onOpenAuth, onLogout }) {
  // Tabs: 'orders' | 'products' | 'users' | 'database'
  const [adminTab, setAdminTab] = useState('orders');

  // Orders state
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Products state
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAnalyzingCord, setIsAnalyzingCord] = useState(false);
  const [aiAnalysisStatus, setAiAnalysisStatus] = useState('');
  const [productFormData, setProductFormData] = useState({
    name: '',
    category: 'macrame-pastel',
    price: 195000,
    wholesalePrice: 130000,
    wholesaleMinQty: 5,
    isBestSeller: false,
    salesCount: 0,
    cordComposition: null,
    originalPrice: 240000,
    stock: 25,
    stoneType: 'Gốm men & Pha lê pastel',
    cordType: 'Dây chỉ sáp dệt Macrame màu kem be nút rút',
    beadSize: '8mm',
    menh: ['Tất cả'],
    tag: 'Mới ra mắt',
    images: ['/images/products/bracelet-pastel-macrame-trio.jpg'],
    description: 'Mẫu vòng tay thắt dây chỉ kem macrame kết hợp hạt pastel vintage và charm thủ công.',
    meaning: 'Bình an, may mắn và tràn đầy năng lượng tích cực.'
  });

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'customer'
  });

  // Database / Neon state
  const [dbStatus, setDbStatus] = useState(null);
  const [neonConnString, setNeonConnString] = useState('');
  const [isConfiguringDb, setIsConfiguringDb] = useState(false);
  const [isSyncingNeon, setIsSyncingNeon] = useState(false);
  const [dbMsg, setDbMsg] = useState('');
  const [syncReport, setSyncReport] = useState(null);

  const statusOptions = [
    'Chờ xác nhận',
    'Đang kết hạt thủ công',
    'Đã hoàn thiện, chuẩn bị giao',
    'Đang giao hàng',
    'Đã giao hàng',
    'Đã hủy'
  ];

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, usersRes, meRes] = await Promise.all([
        api.getAdminStats().catch(() => ({ success: false })),
        api.getOrders().catch(() => ({ success: false })),
        api.getProducts().catch(() => ({ success: false })),
        api.getUsers().catch(() => ({ success: false })),
        api.getMe().catch(() => ({ success: false }))
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (productsRes.success) setProducts(productsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (meRes.success && meRes.data?.dbStatus) setDbStatus(meRes.data.dbStatus);
    } catch (err) {
      console.error('Lỗi tải dữ liệu quản trị:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const triggerToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ================= ORDER HANDLERS =================
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await api.updateOrderStatus(orderId, { orderStatus: newStatus });
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
        if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
          setSelectedOrderDetail(res.data);
        }
        triggerToast(`Đã cập nhật đơn #${orderId} sang "${newStatus}"`);
      }
    } catch (err) {
      alert('Không thể cập nhật đơn hàng: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ================= PRODUCT HANDLERS =================
  const handleAutoAnalyzeImage = async (fileOrUrl, isFile = false) => {
    setIsAnalyzingCord(true);
    setAiAnalysisStatus('Đang gửi hình ảnh đến AI Gemini Vision để bóc tách sợi dây, charm, nút thắt...');
    try {
      let payload = {};
      if (isFile) {
        // Đọc file ảnh dưới dạng Data URL (base64)
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrUrl);
        });
        payload = { imageBase64: base64Data };
        // Đặt preview ngay vào form ảnh
        setProductFormData(prev => ({
          ...prev,
          images: [base64Data, ...(prev.images.slice(1))]
        }));
      } else {
        if (!fileOrUrl) {
          alert('Vui lòng chọn tải ảnh lên hoặc nhập URL hình ảnh để AI phân tích!');
          setIsAnalyzingCord(false);
          return;
        }
        payload = { imageUrl: fileOrUrl };
      }

      setAiAnalysisStatus('AI đang bóc tách thành phần: sợi dây, kỹ thuật thắt, charm phụ kiện, độ bền...');
      const res = await api.analyzeBraceletCord(payload);
      if (res && res.success && res.data) {
        const aiData = res.data;
        setProductFormData(prev => ({
          ...prev,
          name: aiData.name || prev.name || 'Vòng Tay Dây Thủ Công KhánhVyMade',
          category: aiData.category || prev.category || 'macrame-pastel',
          price: aiData.price || prev.price || 195000,
          wholesalePrice: aiData.wholesalePrice || Math.round((aiData.price || prev.price || 195000) * 0.7),
          wholesaleMinQty: aiData.wholesaleMinQty || prev.wholesaleMinQty || 5,
          cordType: aiData.cordType || prev.cordType || '',
          stoneType: aiData.stoneType || prev.stoneType || '',
          tag: aiData.tag || prev.tag || 'AI Đề Xuất',
          description: aiData.description || prev.description || '',
          meaning: aiData.meaning || prev.meaning || '',
          cordComposition: aiData.cordComposition || prev.cordComposition || null,
          isBestSeller: aiData.isBestSeller ?? prev.isBestSeller ?? false,
          salesCount: aiData.salesCount || prev.salesCount || 120
        }));
        setAiAnalysisStatus('Bóc tách thành phần dây thành công!');
        triggerToast('AI Gemini đã tự động nhận diện & bóc tách cấu tạo dây!');
      } else {
        throw new Error(res?.message || 'Không nhận được dữ liệu từ AI');
      }
    } catch (err) {
      console.error('Lỗi phân tích hình ảnh dây:', err);
      alert('Không thể tự động phân tích ảnh: ' + (err.message || 'Lỗi kết nối AI'));
    } finally {
      setIsAnalyzingCord(false);
      setTimeout(() => setAiAnalysisStatus(''), 4000);
    }
  };

  const handleOpenNewProductModal = () => {
    setEditingProduct(null);
    setProductFormData({
      name: '',
      category: 'macrame-pastel',
      price: 195000,
      wholesalePrice: 130000,
      wholesaleMinQty: 5,
      originalPrice: 240000,
      stock: 25,
      stoneType: 'Hạt ngọc pastel & Pha lê hologram',
      cordType: 'Dây chỉ sáp dệt Macrame màu kem be nút rút',
      beadSize: '8mm',
      menh: ['Tất cả'],
      tag: 'Mới ra mắt',
      images: ['/images/products/bracelet-pastel-macrame-trio.jpg'],
      description: 'Mẫu vòng tay thắt dây chỉ kem macrame kết hợp hạt pastel vintage và charm thủ công KhánhVyMade.',
      meaning: 'Bình an, may mắn và tràn đầy năng lượng tích cực.',
      isBestSeller: false,
      salesCount: 0,
      cordComposition: {
        coreMaterial: 'Sợi chỉ sáp dệt Macrame 1.0mm chống nước tắm gội',
        braidingTechnique: 'Kỹ thuật thắt nút thoi Macrame & nút rút đôi trượt tự do',
        mainCharm: 'Gốm men nung thủ công 1200°C phối hoa pastel',
        cordColor: 'Màu kem be vintage pastel nhẹ nhàng thanh lịch',
        wristSizeRange: 'Freesize 13cm - 19cm (rút trượt theo cỡ tay)',
        durability: 'Không bay màu, không xơ xù, bảo hành đan lại dây trọn đời'
      }
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductFormData({
      name: prod.name,
      category: prod.category || 'macrame-pastel',
      price: prod.price,
      wholesalePrice: prod.wholesalePrice || Math.round(prod.price * 0.7),
      wholesaleMinQty: prod.wholesaleMinQty || 5,
      originalPrice: prod.originalPrice || prod.price,
      stock: prod.stock || 20,
      stoneType: prod.stoneType || '',
      cordType: prod.cordType || 'Dây chỉ sáp dệt Macrame màu kem be nút rút',
      beadSize: prod.beadSize || '8mm',
      menh: prod.menh || ['Tất cả'],
      tag: prod.tag || '',
      images: prod.images || ['/images/products/bracelet-pastel-macrame-trio.jpg'],
      description: prod.description || '',
      meaning: prod.meaning || '',
      isBestSeller: prod.isBestSeller ?? prod.is_best_seller ?? false,
      salesCount: prod.salesCount ?? prod.sales_count ?? 0,
      cordComposition: prod.cordComposition || prod.cord_composition || null
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, productFormData);
        if (res.success) {
          setProducts(prev => prev.map(p => p.id === editingProduct.id ? res.data : p));
          triggerToast(`Đã cập nhật sản phẩm "${productFormData.name}"`);
        }
      } else {
        const res = await api.createProduct(productFormData);
        if (res.success) {
          setProducts(prev => [res.data, ...prev]);
          triggerToast(`Đã thêm sản phẩm mới "${productFormData.name}" vào kho!`);
        }
      }
      setIsProductModalOpen(false);
    } catch (err) {
      alert('Lỗi lưu sản phẩm: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi cơ sở dữ liệu?`)) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        triggerToast(`Đã xóa sản phẩm khỏi cơ sở dữ liệu`);
      }
    } catch (err) {
      alert('Lỗi xóa sản phẩm: ' + err.message);
    }
  };

  // ================= USER HANDLERS =================
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createUser(userFormData);
      if (res.success) {
        setUsers(prev => [res.data, ...prev]);
        setIsUserModalOpen(false);
        setUserFormData({ fullName: '', email: '', password: '', phone: '', address: '', role: 'customer' });
        triggerToast(`Tạo tài khoản ${res.data.fullName} thành công!`);
      }
    } catch (err) {
      alert('Lỗi tạo tài khoản: ' + err.message);
    }
  };

  const handleToggleUserRole = async (user) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    try {
      const res = await api.updateUserRole(user.id, newRole);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
        triggerToast(`Đã cập nhật vai trò của ${user.fullName} thành ${newRole}`);
      }
    } catch (err) {
      alert('Lỗi cập nhật vai trò: ' + err.message);
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Xóa tài khoản ${email} khỏi hệ thống?`)) return;
    try {
      const res = await api.deleteUser(id);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== id));
        triggerToast(`Đã xóa tài khoản khỏi cơ sở dữ liệu`);
      }
    } catch (err) {
      alert('Lỗi xóa tài khoản: ' + err.message);
    }
  };

  // ================= NEON DB HANDLERS =================
  const handleSaveNeonDb = async (e) => {
    e.preventDefault();
    if (!neonConnString.trim()) return;

    setIsConfiguringDb(true);
    setDbMsg('');

    try {
      const res = await api.configureDb(neonConnString.trim());
      if (res.success) {
        setDbMsg('✓ Kết nối Neon PostgreSQL thành công!');
        setNeonConnString('');
        loadAllAdminData();
      }
    } catch (err) {
      setDbMsg('❌ ' + err.message);
    } finally {
      setIsConfiguringDb(false);
    }
  };

  const handleSyncNeon = async () => {
    setIsSyncingNeon(true);
    setSyncReport(null);
    try {
      const res = await api.syncNeonDatabase();
      if (res.success) {
        setSyncReport(res.data);
        triggerToast('Đã đồng bộ toàn bộ sản phẩm, đơn hàng và tài khoản vào Neon PostgreSQL!');
        loadAllAdminData();
      }
    } catch (err) {
      alert('Lỗi đồng bộ: ' + err.message);
    } finally {
      setIsSyncingNeon(false);
    }
  };

  // Guard: If not admin, show access gate
  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E8DFD3] shadow-lg text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#B86244]/10 text-[#B86244] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-serif-boutique text-2xl font-bold text-[#26211C]">
              Khu Vực Quản Trị Viên KhánhVyMade
            </h2>
            <p className="text-xs text-[#6B6258] leading-relaxed">
              Bạn cần đăng nhập với tài khoản Quản trị viên (Admin) của KhánhVyMade để quản lý danh sách đơn hàng, sản phẩm, tài khoản và đồng bộ database.
            </p>
          </div>

          <div className="p-3 bg-[#FAF4ED] rounded-xl border border-[#E8DFD3] text-left text-xs space-y-1 text-[#6B6258]">
            <p className="font-bold text-[#26211C]">🔑 Tài khoản Quản trị viên thử nghiệm:</p>
            <p>Email: <span className="font-mono text-[#B86244]">admin@khanhvymade.vn</span></p>
            <p>Mật khẩu: <span className="font-mono text-[#B86244]">admin123</span></p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={onOpenAuth}
              className="w-full py-3 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Đăng Nhập Tài Khoản Quản Trị</span>
            </button>
            <button
              onClick={onBackToStore}
              className="w-full py-2.5 rounded-xl border border-[#E8DFD3] text-[#6B6258] text-xs font-semibold hover:bg-[#FAF7F2]"
            >
              ← Quay Lại Gian Hàng Mua Sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered lists
  const filteredOrders = orders.filter(o => {
    const matchStatus = selectedStatus === 'all' || o.orderStatus === selectedStatus;
    const matchSearch = !orderSearchQuery || 
      (o.id && o.id.toLowerCase().includes(orderSearchQuery.toLowerCase())) ||
      (o.customerName && o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase())) ||
      (o.phone && o.phone.includes(orderSearchQuery));
    return matchStatus && matchSearch;
  });

  const filteredProducts = products.filter(p => {
    const matchCategory = productCategoryFilter === 'all' 
      ? true 
      : productCategoryFilter === 'best-seller'
        ? (p.isBestSeller || p.is_best_seller)
        : p.category === productCategoryFilter;
    const matchSearch = !productSearch || 
      (p.name && p.name.toLowerCase().includes(productSearch.toLowerCase())) ||
      (p.stoneType && p.stoneType.toLowerCase().includes(productSearch.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const filteredUsers = users.filter(u => {
    return !userSearch || 
      (u.fullName && u.fullName.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.phone && u.phone.includes(userSearch));
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-6 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Toast Notification */}
        {successMsg && (
          <div className="fixed top-5 right-5 z-50 bg-[#26211C] text-[#FAF7F2] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-[#4E6857] animate-slideIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Top Header & Navigation Bar */}
        <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B86244] text-white flex items-center justify-center font-bold text-xl shadow-sm">
              KV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-boutique text-2xl font-bold text-[#26211C]">
                  QUẢN TRỊ XƯỞNG THỦ CÔNG KHÁNHVYMADE
                </h1>
                <span className="text-[10px] bg-[#EDF3EF] text-[#4E6857] font-bold px-2.5 py-0.5 rounded-full border border-[#D0E2D7]">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-[#6B6258]">
                Hệ thống quản lý sản phẩm, tài khoản, đơn hàng và cơ sở dữ liệu thực tế Neon PostgreSQL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={loadAllAdminData}
              disabled={loading}
              className="p-2.5 rounded-xl border border-[#E8DFD3] text-[#6B6258] hover:text-[#26211C] hover:bg-[#FAF7F2] transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onBackToStore}
              className="px-4 py-2.5 rounded-xl bg-[#26211C] hover:bg-[#3D352E] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>← Về Gian Hàng</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Main Management Tabs */}
        <div className="flex border-b border-[#E8DFD3] gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setAdminTab('orders')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'orders'
                ? 'bg-[#B86244] text-white shadow-sm'
                : 'bg-white text-[#6B6258] hover:bg-[#F3ECE1] border border-[#E8DFD3]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Quản Lý Đơn Hàng ({orders.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('products')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'products'
                ? 'bg-[#B86244] text-white shadow-sm'
                : 'bg-white text-[#6B6258] hover:bg-[#F3ECE1] border border-[#E8DFD3]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Quản Lý Sản Phẩm ({products.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('users')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'users'
                ? 'bg-[#B86244] text-white shadow-sm'
                : 'bg-white text-[#6B6258] hover:bg-[#F3ECE1] border border-[#E8DFD3]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản Lý Tài Khoản ({users.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('database')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'database'
                ? 'bg-[#4E6857] text-white shadow-sm'
                : 'bg-white text-[#4E6857] hover:bg-[#EDF3EF] border border-[#E8DFD3]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Cơ Sở Dữ Liệu Neon Tech {dbStatus?.isConnected ? '🟢' : '🟡'}</span>
          </button>
        </div>

        {/* ================= TAB 1: QUẢN LÝ ĐƠN HÀNG ================= */}
        {adminTab === 'orders' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-sm">
                <span className="text-[11px] text-[#6B6258] font-medium block">Tổng Doanh Thu</span>
                <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-[#B86244] mt-1 block">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.totalRevenue || 0)}
                </span>
                <span className="text-[10px] text-emerald-600 mt-1 inline-flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3 h-3" /> Ghi nhận thời gian thực
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-sm">
                <span className="text-[11px] text-[#6B6258] font-medium block">Tổng Đơn Hàng</span>
                <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-[#26211C] mt-1 block">
                  {orders.length} đơn
                </span>
                <span className="text-[10px] text-[#8C8276] mt-1 block">Từ website KhánhVyMade</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-sm">
                <span className="text-[11px] text-[#6B6258] font-medium block">Đang Đan Hạt Thủ Công</span>
                <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-amber-600 mt-1 block">
                  {orders.filter(o => o.orderStatus === 'Chờ xác nhận' || o.orderStatus === 'Đang kết hạt thủ công').length} đơn
                </span>
                <span className="text-[10px] text-amber-700 mt-1 block">Nghệ nhân đang hoàn thiện</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-sm">
                <span className="text-[11px] text-[#6B6258] font-medium block">Đã Hoàn Thành / Giao</span>
                <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-emerald-600 mt-1 block">
                  {orders.filter(o => o.orderStatus === 'Đã giao hàng' || o.orderStatus === 'Đang giao hàng').length} đơn
                </span>
                <span className="text-[10px] text-emerald-700 mt-1 block">Giao thành công</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-[#6B6258]" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E8DFD3] text-xs font-semibold rounded-xl px-3 py-2 text-[#26211C] focus:outline-none"
                >
                  <option value="all">Tất cả trạng thái ({orders.length})</option>
                  {statusOptions.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#8C8276] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm mã đơn DH-, tên khách, sđt..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full text-xs bg-[#FAF7F2] pl-9 pr-3 py-2 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-[#E8DFD3] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[#6B6258] uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Mã Đơn</th>
                      <th className="py-3.5 px-4">Khách Hàng</th>
                      <th className="py-3.5 px-4">Sản Phẩm Đặt</th>
                      <th className="py-3.5 px-4">Tổng Tiền</th>
                      <th className="py-3.5 px-4">Thanh Toán</th>
                      <th className="py-3.5 px-4">Trạng Thái Đơn</th>
                      <th className="py-3.5 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EAE1]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-[#8C8276]">
                          Không tìm thấy đơn hàng nào phù hợp
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-[#FAF4ED]/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#B86244]">
                            <div className="flex items-center gap-1.5">
                              <span>#{order.id}</span>
                              {(order.items?.some(it => it.isWholesale || it.quantity >= 5) || order.items?.reduce((s, i) => s + (i.quantity || 1), 0) >= 5) ? (
                                <span className="inline-block text-[9px] bg-[#2E583A] text-white px-1.5 py-0.5 rounded font-sans font-bold">
                                  ĐƠN SỈ
                                </span>
                              ) : (
                                <span className="inline-block text-[9px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-sans font-medium">
                                  ĐƠN LẺ
                                </span>
                              )}
                            </div>
                            <span className="block text-[10px] text-[#8C8276] font-normal font-sans mt-0.5">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-[#26211C]">{order.customerName}</p>
                            <p className="text-[11px] text-[#6B6258]">{order.phone}</p>
                            <p className="text-[10px] text-[#8C8276] max-w-xs truncate">{order.address}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1 max-w-xs">
                              {order.items?.map((it, idx) => (
                                <p key={idx} className="text-[11px] text-[#26211C]">
                                  • <span className="font-semibold">{it.quantity}x</span> {it.name}
                                  {it.isCustom && <span className="text-[#B86244] text-[10px] ml-1">(Tự phối)</span>}
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#26211C]">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              order.paymentStatus === 'Đã thanh toán' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {order.paymentStatus}
                            </span>
                            <span className="block text-[10px] text-[#8C8276] mt-0.5">
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={order.orderStatus}
                              disabled={updatingOrderId === order.id}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="text-xs bg-[#FAF7F2] border border-[#E8DFD3] rounded-lg px-2 py-1 font-medium text-[#26211C] focus:outline-none"
                            >
                              {statusOptions.map(st => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrderDetail(order)}
                              className="px-2.5 py-1 text-xs rounded-lg bg-[#FAF4ED] text-[#B86244] hover:bg-[#B86244] hover:text-white font-semibold transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Chi tiết</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: QUẢN LÝ SẢN PHẨM ================= */}
        {adminTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleOpenNewProductModal}
                  className="px-4 py-2.5 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Sản Phẩm Mới</span>
                </button>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E8DFD3] text-xs font-semibold rounded-xl px-3 py-2 text-[#26211C] focus:outline-none"
                >
                  <option value="all">Tất cả danh mục vòng ({products.length})</option>
                  <option value="best-seller">🔥 Sản Phẩm Bán Chạy Nhất (Best Sellers)</option>
                  <option value="macrame-pastel">Vòng Dây Macrame Pastel & Hoa Gốm</option>
                  <option value="vong-doi">Vòng Đôi Dây Sáp Nam Châm</option>
                  <option value="day-do-may-man">Vòng Chỉ Đỏ Bình An & Hộ Thân</option>
                  <option value="day-lua-co-phong">Vòng Dây Lụa & Dây Da Mộc</option>
                </select>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#8C8276] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm tên vòng, loại đá, charm..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full text-xs bg-[#FAF7F2] pl-9 pr-3 py-2 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(prod => (
                <div key={prod.id} className="bg-white p-4 rounded-3xl border border-[#E8DFD3] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFD3]">
                      <img
                        src={prod.images?.[0] || '/images/products/bracelet-pastel-macrame-trio.jpg'}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-[#26211C]/80 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                        {prod.id}
                      </span>
                      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        {(prod.isBestSeller || prod.is_best_seller) && (
                          <span className="bg-amber-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" />
                            <span>BEST SELLER</span>
                          </span>
                        )}
                        {prod.tag && (
                          <span className="bg-[#B86244] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                            {prod.tag}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#26211C] line-clamp-2">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-[#6B6258] mt-1">
                        Đá/Charm: <span className="font-medium text-[#26211C]">{prod.stoneType || 'Thủ công mỹ nghệ'}</span>
                      </p>
                      <p className="text-[11px] text-[#6B6258]">
                        Dây: <span className="font-medium text-[#26211C]">{prod.cordType || 'Dây macrame thắt rút'}</span>
                      </p>
                      {prod.cordComposition && (
                        <div className="mt-2 p-2 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3]/80 text-[10px] text-[#6B6258] space-y-0.5">
                          <p className="font-bold text-[#4E6857] flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5" />
                            <span>Cấu tạo dây thủ công:</span>
                          </p>
                          <p className="truncate">Sợi: <span className="text-[#26211C]">{prod.cordComposition.coreMaterial || 'Sợi chỉ sáp dệt Macrame'}</span></p>
                          <p className="truncate">Nút: <span className="text-[#26211C]">{prod.cordComposition.braidingTechnique || 'Nút rút freesize'}</span></p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F0EAE1] mt-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#8C8276]">Lẻ:</span>
                        <span className="text-sm font-bold text-[#B86244]">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-[#4E6857] font-semibold">Sỉ (từ {prod.wholesaleMinQty || 5}c):</span>
                        <span className="text-xs font-bold text-[#4E6857]">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.wholesalePrice || Math.round(prod.price * 0.7))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8C8276]">
                        <span>Kho: <strong className="text-[#26211C]">{prod.stock ?? 20}</strong></span>
                        {(prod.salesCount || prod.sales_count) ? (
                          <span className="text-amber-700 font-semibold">· Đã bán: {prod.salesCount || prod.sales_count}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditProduct(prod)}
                        className="p-2 rounded-xl bg-[#FAF4ED] text-[#B86244] hover:bg-[#B86244] hover:text-white transition-colors"
                        title="Sửa sản phẩm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Xóa khỏi cơ sở dữ liệu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: QUẢN LÝ TÀI KHOẢN ================= */}
        {adminTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#4E6857] hover:bg-[#3D5244] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Tài Khoản Mới</span>
              </button>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#8C8276] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo họ tên, email, sđt..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full text-xs bg-[#FAF7F2] pl-9 pr-3 py-2 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8DFD3] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[#6B6258] uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Tài Khoản</th>
                      <th className="py-3.5 px-4">Email & SĐT</th>
                      <th className="py-3.5 px-4">Địa Chỉ Mặc Định</th>
                      <th className="py-3.5 px-4">Vai Trò</th>
                      <th className="py-3.5 px-4">Ngày Tạo</th>
                      <th className="py-3.5 px-4 text-right">Phân Quyền / Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EAE1]">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-[#FAF4ED]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#B86244] text-white flex items-center justify-center font-bold text-xs">
                              {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-[#26211C]">{u.fullName}</p>
                              <span className="text-[10px] text-[#8C8276] font-mono">{u.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-[#26211C]">{u.email}</p>
                          <p className="text-[11px] text-[#6B6258]">{u.phone || 'Chưa cập nhật SĐT'}</p>
                        </td>
                        <td className="py-3.5 px-4 text-[#6B6258] max-w-xs truncate">
                          {u.address || 'Chưa cập nhật'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            u.role === 'admin' 
                              ? 'bg-[#4E6857] text-white' 
                              : u.role === 'artisan'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {u.role === 'admin' ? 'Quản Trị Viên' : u.role === 'artisan' ? 'Nghệ Nhân' : 'Khách Hàng'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#6B6258] text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mới tạo'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleUserRole(u)}
                              className="px-2 py-1 rounded-lg border border-[#E8DFD3] bg-[#FAF7F2] text-[11px] font-semibold text-[#26211C] hover:bg-[#F3ECE1]"
                              title="Chuyển đổi vai trò Admin / Khách Hàng"
                            >
                              {u.role === 'admin' ? 'Hạ quyền Khách' : 'Nâng lên Admin'}
                            </button>
                            {u.id !== 'user-admin' && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                                title="Xóa người dùng"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: DATABASE NEON TECH ================= */}
        {adminTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#F0EAE1] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#4E6857] text-white flex items-center justify-center font-bold">
                    🐘
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#26211C]">
                      Cơ Sở Dữ Liệu Neon Tech PostgreSQL Cloud (patient-resonance-16986828)
                    </h3>
                    <p className="text-xs text-[#6B6258]">
                      Toàn bộ dữ liệu thực tế: Đơn hàng, Sản phẩm KhánhVyMade và Tài khoản người dùng được lưu trữ và đồng bộ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    dbStatus?.isConnected 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${dbStatus?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {dbStatus?.isConnected ? 'Đang kết nối Neon Tech' : 'Đang lưu Local db.json'}
                  </span>
                </div>
              </div>

              {/* Status Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3]">
                  <span className="text-[11px] text-[#6B6258] block">Project Neon Tech</span>
                  <strong className="text-xs font-mono text-[#26211C] block mt-1">patient-resonance-16986828</strong>
                  <a 
                    href="https://console.neon.tech/app/projects/patient-resonance-16986828" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#B86244] font-semibold mt-2 hover:underline"
                  >
                    <span>Mở Neon Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3]">
                  <span className="text-[11px] text-[#6B6258] block">Bảng Dữ Liệu Thực Tế</span>
                  <div className="mt-1 text-xs text-[#26211C] space-y-0.5">
                    <p>• <strong className="font-mono text-[#B86244]">{orders.length}</strong> Đơn hàng (bảng orders)</p>
                    <p>• <strong className="font-mono text-[#B86244]">{products.length}</strong> Sản phẩm (bảng products)</p>
                    <p>• <strong className="font-mono text-[#B86244]">{users.length}</strong> Tài khoản (bảng users)</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-[#6B6258] block">Đồng Bộ Toàn Bộ Dữ Liệu</span>
                    <p className="text-[11px] text-[#8C8276] mt-0.5">Tự động nạp toàn bộ vào máy chủ PostgreSQL</p>
                  </div>
                  <button
                    onClick={handleSyncNeon}
                    disabled={isSyncingNeon}
                    className="mt-2 w-full py-2 rounded-xl bg-[#4E6857] hover:bg-[#3D5244] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNeon ? 'animate-spin' : ''}`} />
                    <span>{isSyncingNeon ? 'Đang đồng bộ...' : '⚡ Đồng Bộ Vào Neon DB'}</span>
                  </button>
                </div>
              </div>

              {/* Sync report notice */}
              {syncReport && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Đồng bộ hoàn tất lên máy chủ Neon Tech PostgreSQL!
                  </p>
                  <p className="text-[11px]">
                    Đã đồng bộ: <strong>{syncReport.productsSynced}</strong> sản phẩm, <strong>{syncReport.usersSynced}</strong> tài khoản, <strong>{syncReport.ordersSynced}</strong> đơn hàng.
                  </p>
                </div>
              )}

              {/* Configure connection string */}
              <form onSubmit={handleSaveNeonDb} className="space-y-3 pt-2">
                <label className="text-xs font-bold text-[#26211C] block">
                  Cập nhật / Kết nối chuỗi Neon Connection String:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    placeholder="postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require"
                    value={neonConnString}
                    onChange={(e) => setNeonConnString(e.target.value)}
                    className="flex-1 text-xs bg-[#FAF7F2] px-3.5 py-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none focus:ring-1 focus:ring-[#4E6857] font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isConfiguringDb || !neonConnString.trim()}
                    className="px-5 py-2.5 bg-[#4E6857] hover:bg-[#3D5244] text-white text-xs font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap"
                  >
                    {isConfiguringDb ? 'Đang kiểm tra...' : 'Kiểm Tra & Lưu'}
                  </button>
                </div>
                {dbMsg && (
                  <p className={`text-xs ${dbMsg.startsWith('✓') ? 'text-emerald-700 font-semibold' : 'text-rose-600'}`}>
                    {dbMsg}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

      </div>

      {/* ================= MODAL: CHI TIẾT ĐƠN HÀNG ================= */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#E8DFD3] shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="bg-[#26211C] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#CFC1B0] uppercase tracking-wider block">Xưởng Chế Tác KhánhVyMade</span>
                <h3 className="font-serif-boutique text-xl font-bold text-amber-200">
                  #{selectedOrderDetail.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3] space-y-1.5">
                <p className="font-bold text-sm text-[#26211C]">{selectedOrderDetail.customerName}</p>
                <p className="flex items-center gap-1.5 text-[#6B6258]">
                  <Phone className="w-3.5 h-3.5 text-[#B86244]" />
                  <span>{selectedOrderDetail.phone}</span>
                </p>
                <p className="flex items-center gap-1.5 text-[#6B6258]">
                  <MapPin className="w-3.5 h-3.5 text-[#B86244]" />
                  <span>{selectedOrderDetail.address}</span>
                </p>
                {selectedOrderDetail.note && (
                  <p className="text-amber-800 bg-amber-50 p-2 rounded-xl text-[11px] mt-2">
                    💬 Lời nhắn: "{selectedOrderDetail.note}"
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <span className="font-bold text-[#26211C] block text-[11px] uppercase tracking-wider">
                  Sản phẩm trong đơn:
                </span>
                {selectedOrderDetail.items?.map((it, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF4ED] rounded-xl border border-[#EADBCC] space-y-1">
                    <div className="flex justify-between font-semibold text-[#26211C]">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="text-[#B86244]">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(it.price * it.quantity)}
                      </span>
                    </div>
                    {it.wristSize && (
                      <p className="text-[11px] text-[#6B6258]">Size tay khách: <strong>{it.wristSize}</strong></p>
                    )}
                    {it.isCustom && it.customDetails && (
                      <div className="text-[10px] text-[#6B6258] bg-white p-2 rounded-lg space-y-0.5 border border-[#E8DFD3]">
                        <p>• Loại dây: {it.customDetails.cord}</p>
                        <p>• Hạt chính: {it.customDetails.mainBead}</p>
                        <p>• Phụ kiện charm: {it.customDetails.charm}</p>
                        <p>• Kích thước: {it.customDetails.size}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-[#E8DFD3] space-y-1">
                <div className="flex justify-between text-[#6B6258]">
                  <span>Phí vận chuyển:</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrderDetail.shippingFee || 25000)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#26211C] pt-1 border-t border-[#F0EAE1]">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#B86244]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrderDetail.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#6B6258] pt-1">
                  <span>Hình thức:</span>
                  <span>{selectedOrderDetail.paymentMethod} ({selectedOrderDetail.paymentStatus})</span>
                </div>
              </div>

              {selectedOrderDetail.timeline && selectedOrderDetail.timeline.length > 0 && (
                <div>
                  <span className="font-bold text-[#26211C] block text-[11px] uppercase tracking-wider mb-2">
                    Lịch sử trạng thái đơn:
                  </span>
                  <div className="space-y-1.5">
                    {selectedOrderDetail.timeline.map((t, idx) => (
                      <div key={idx} className="text-[11px] text-[#6B6258] flex items-center justify-between border-l-2 border-[#B86244] pl-2 py-0.5">
                        <span>{t.status}</span>
                        <span className="text-[#8C8276] text-[10px]">{t.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DFD3] flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-[#E8DFD3] bg-white text-[#26211C] font-semibold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu Đóng Hàng</span>
              </button>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="px-4 py-2 rounded-xl bg-[#26211C] text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM / SỬA SẢN PHẨM ================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#E8DFD3] shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="bg-[#26211C] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-serif-boutique text-lg font-bold">
                  {editingProduct ? 'CHỈNH SỬA SẢN PHẨM' : 'THÊM SẢN PHẨM MỚI VÀO KHO KHÁNHVYMADE'}
                </h3>
                <p className="text-[10px] text-[#CFC1B0]">Lưu trữ trực tiếp vào cơ sở dữ liệu</p>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#26211C] block mb-1">Tên sản phẩm vòng tay: *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Vòng Tay Cá Voi Xanh Gốm Men Pastel"
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Giá bán lẻ (VNĐ): *</label>
                  <input
                    type="number"
                    required
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none font-semibold text-[#B86244]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#4E6857] block mb-1">Giá bán sỉ xưởng (VNĐ): *</label>
                  <input
                    type="number"
                    required
                    value={productFormData.wholesalePrice || Math.round(productFormData.price * 0.7)}
                    onChange={(e) => setProductFormData({ ...productFormData, wholesalePrice: Number(e.target.value) })}
                    className="w-full bg-[#F2F7F4] p-2.5 rounded-xl border border-[#B3D1BE] focus:outline-none font-bold text-[#4E6857]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Sỉ tối thiểu (chiếc):</label>
                  <input
                    type="number"
                    min="1"
                    value={productFormData.wholesaleMinQty || 5}
                    onChange={(e) => setProductFormData({ ...productFormData, wholesaleMinQty: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Tồn kho (chiếc):</label>
                  <input
                    type="number"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({ ...productFormData, stock: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Danh mục vòng dây: *</label>
                  <select
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none font-medium"
                  >
                    <option value="macrame-pastel">Vòng Dây Macrame Pastel & Hoa Gốm</option>
                    <option value="vong-doi">Vòng Đôi Dây Sáp Nam Châm</option>
                    <option value="day-do-may-man">Vòng Chỉ Đỏ Bình An & Hộ Thân</option>
                    <option value="day-lua-co-phong">Vòng Dây Lụa & Dây Da Mộc</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Huy hiệu hiển thị (Tag):</label>
                  <input
                    type="text"
                    placeholder="Hot Trend, Bán chạy, Giá sỉ xưởng..."
                    value={productFormData.tag}
                    onChange={(e) => setProductFormData({ ...productFormData, tag: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Loại sợi / Kỹ thuật dệt dây: *</label>
                  <input
                    type="text"
                    placeholder="Dây chỉ sáp dệt Macrame pastel / Chỉ đỏ Tây Tạng..."
                    value={productFormData.cordType || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, cordType: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Charm / Hạt trang trí chính:</label>
                  <input
                    type="text"
                    placeholder="Gốm sứ men pastel nung thủ công / Charm hoa acrylic..."
                    value={productFormData.stoneType || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, stoneType: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                  />
                </div>
              </div>

              {/* --- KHU VỰC TẢI ẢNH & AI TỰ ĐỘNG BÓC TÁCH THÀNH PHẦN DÂY --- */}
              <div className="bg-[#FAF4ED] p-3.5 rounded-2xl border border-[#D9C8B4] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#26211C] flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#B86244]" />
                    <span>Hình ảnh sản phẩm & Tự động bóc tách (AI Vision):</span>
                  </label>
                  {isAnalyzingCord && (
                    <span className="text-[10px] text-[#B86244] font-semibold flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Đang phân tích...</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="URL ảnh hoặc tải file bên phải"
                    value={productFormData.images[0] || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, images: [e.target.value] })}
                    className="flex-1 bg-white p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none font-mono text-[11px]"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="adminCordImageInput"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleAutoAnalyzeImage(e.target.files[0], true);
                        }
                      }}
                    />
                    <label
                      htmlFor="adminCordImageInput"
                      className="cursor-pointer px-3 py-2 bg-[#26211C] hover:bg-[#3D352E] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải ảnh từ máy</span>
                    </label>

                    <button
                      type="button"
                      disabled={isAnalyzingCord || !productFormData.images[0]}
                      onClick={() => handleAutoAnalyzeImage(productFormData.images[0], false)}
                      className="px-3 py-2 bg-[#B86244] hover:bg-[#A05237] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
                      title="AI Gemini phân tích và bóc tách các thành phần làm nên sợi dây"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>AI Bóc Tách Dây</span>
                    </button>
                  </div>
                </div>

                {aiAnalysisStatus && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-2 animate-fadeIn">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-medium">{aiAnalysisStatus}</span>
                  </div>
                )}

                <div className="flex gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[#8C8276] self-center">Chọn nhanh mẫu xưởng:</span>
                  {[
                    { name: '🐳 Cá Voi Men Ngọc', img: '/images/products/bracelet-whale-ceramic.jpg' },
                    { name: '🌸 Hoa Cúc Pastel', img: '/images/products/bracelet-mint-flower.jpg' },
                    { name: '🦋 Bướm Dạ Quang', img: '/images/products/bracelet-hologram-butterfly.jpg' },
                    { name: '🧧 Chỉ Đỏ Ngũ Phúc', img: '/images/products/bracelet-red-luck.jpg' },
                    { name: '🌙 Macrame Moonstone', img: '/images/products/bracelet-moonstone.jpg' },
                    { name: '✨ Combo Trio 3 Vòng', img: '/images/products/bracelet-pastel-macrame-trio.jpg' }
                  ].map(sample => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => {
                        setProductFormData({ ...productFormData, images: [sample.img] });
                        handleAutoAnalyzeImage(sample.img, false);
                      }}
                      className="text-[10px] px-2 py-1 bg-white rounded-lg border border-[#E8DFD3] hover:bg-[#F0EAE1] transition-colors"
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* --- CHI TIẾT CẤU TẠO THÀNH PHẦN SỢI DÂY (TỰ ĐỘNG BÓC TÁCH) --- */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#4E6857] flex items-center gap-1.5 text-xs">
                    <Layers className="w-3.5 h-3.5 text-[#4E6857]" />
                    <span>Cấu Tạo Thành Phần Sợi Dây (Tự Động Bóc Tách Khi Up Hình):</span>
                  </h4>
                  <span className="text-[10px] text-[#8C8276]">Tự động điền bởi AI Vision hoặc sửa tay</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-semibold text-[#6B6258] block mb-0.5 text-[10px]">1. Chất liệu sợi dây chính:</label>
                    <input
                      type="text"
                      placeholder="Sợi chỉ sáp dệt Macrame 1.0mm chống nước tắm gội"
                      value={productFormData.cordComposition?.coreMaterial || ''}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        cordComposition: { ...(productFormData.cordComposition || {}), coreMaterial: e.target.value }
                      })}
                      className="w-full bg-white p-2 rounded-lg border border-[#E8DFD3] focus:outline-none text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#6B6258] block mb-0.5 text-[10px]">2. Kỹ thuật thắt nút:</label>
                    <input
                      type="text"
                      placeholder="Kỹ thuật thắt nút thoi Macrame & nút rút trượt đôi"
                      value={productFormData.cordComposition?.braidingTechnique || ''}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        cordComposition: { ...(productFormData.cordComposition || {}), braidingTechnique: e.target.value }
                      })}
                      className="w-full bg-white p-2 rounded-lg border border-[#E8DFD3] focus:outline-none text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#6B6258] block mb-0.5 text-[10px]">3. Phụ kiện charm & hạt trang trí:</label>
                    <input
                      type="text"
                      placeholder="Gốm sứ men pastel nung 1200°C phối hoa cúc pastel"
                      value={productFormData.cordComposition?.mainCharm || ''}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        cordComposition: { ...(productFormData.cordComposition || {}), mainCharm: e.target.value }
                      })}
                      className="w-full bg-white p-2 rounded-lg border border-[#E8DFD3] focus:outline-none text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#6B6258] block mb-0.5 text-[10px]">4. Màu sắc sợi dây:</label>
                    <input
                      type="text"
                      placeholder="Màu kem be vintage pastel nhẹ nhàng thanh lịch"
                      value={productFormData.cordComposition?.cordColor || ''}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        cordComposition: { ...(productFormData.cordComposition || {}), cordColor: e.target.value }
                      })}
                      className="w-full bg-white p-2 rounded-lg border border-[#E8DFD3] focus:outline-none text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#6B6258] block mb-0.5 text-[10px]">5. Chu vi cổ tay phù hợp:</label>
                    <input
                      type="text"
                      placeholder="Freesize 13cm - 19cm (rút trượt theo cỡ tay)"
                      value={productFormData.cordComposition?.wristSizeRange || ''}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        cordComposition: { ...(productFormData.cordComposition || {}), wristSizeRange: e.target.value }
                      })}
                      className="w-full bg-white p-2 rounded-lg border border-[#E8DFD3] focus:outline-none text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#6B6258] block mb-0.5 text-[10px]">6. Độ bền & Bảo hành xưởng:</label>
                    <input
                      type="text"
                      placeholder="Không bay màu, không xơ xù, bảo hành đan lại trọn đời"
                      value={productFormData.cordComposition?.durability || ''}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        cordComposition: { ...(productFormData.cordComposition || {}), durability: e.target.value }
                      })}
                      className="w-full bg-white p-2 rounded-lg border border-[#E8DFD3] focus:outline-none text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* --- CÀI ĐẶT BEST SELLER & DOANH SỐ BÁN RA --- */}
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(productFormData.isBestSeller)}
                    onChange={(e) => setProductFormData({ ...productFormData, isBestSeller: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[#26211C] text-xs flex items-center gap-1 text-amber-900">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      <span>Đánh dấu là Sản Phẩm Bán Chạy Nhất (Best Seller)</span>
                    </span>
                    <span className="text-[10px] text-amber-800/80 block">
                      Hiển thị huy hiệu lửa nổi bật và ưu tiên đề xuất hàng đầu
                    </span>
                  </div>
                </label>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-[10px] font-bold text-amber-900">Số lượng đã bán:</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1480"
                    value={productFormData.salesCount || 0}
                    onChange={(e) => setProductFormData({ ...productFormData, salesCount: Number(e.target.value) })}
                    className="w-24 bg-white p-1.5 rounded-lg border border-amber-300 text-xs font-bold text-amber-900 text-center focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#26211C] block mb-1">Mô tả sản phẩm & thông số chi tiết:</label>
                <textarea
                  rows={2}
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#26211C] block mb-1">Ý nghĩa may mắn & bảo hành thủ công:</label>
                <input
                  type="text"
                  placeholder="Dây rút freesize 14-18cm, bảo hành đan lại dây trọn đời tại KhánhVyMade..."
                  value={productFormData.meaning}
                  onChange={(e) => setProductFormData({ ...productFormData, meaning: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E8DFD3] text-[#6B6258] font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold"
                >
                  {editingProduct ? 'Cập Nhật Sản Phẩm' : 'Lưu Vào Cơ Sở Dữ Liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM TÀI KHOẢN MỚI ================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#E8DFD3] shadow-2xl overflow-hidden my-6">
            <div className="bg-[#26211C] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-serif-boutique text-lg font-bold">THÊM TÀI KHOẢN MỚI</h3>
                <p className="text-[10px] text-[#CFC1B0]">Tạo tài khoản quản trị hoặc khách hàng KhánhVyMade</p>
              </div>
              <button onClick={() => setIsUserModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#26211C] block mb-1">Họ và tên: *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Khánh Vy"
                  value={userFormData.fullName}
                  onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#26211C] block mb-1">Email: *</label>
                <input
                  type="email"
                  required
                  placeholder="email@khanhvymade.vn"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#26211C] block mb-1">Số điện thoại:</label>
                <input
                  type="tel"
                  placeholder="0988668899"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#26211C] block mb-1">Địa chỉ giao hàng:</label>
                <input
                  type="text"
                  placeholder="Địa chỉ nhận hàng"
                  value={userFormData.address}
                  onChange={(e) => setUserFormData({ ...userFormData, address: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#26211C] block mb-1">Mật khẩu: *</label>
                <input
                  type="password"
                  required
                  placeholder="Mật khẩu khởi tạo"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#26211C] block mb-1">Phân quyền vai trò:</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none font-semibold"
                >
                  <option value="customer">Khách Hàng</option>
                  <option value="admin">Quản Trị Viên (Admin Toàn Quyền)</option>
                  <option value="artisan">Nghệ Nhân Đan Vòng</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E8DFD3] text-[#6B6258] font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#4E6857] hover:bg-[#3D5244] text-white font-bold"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
