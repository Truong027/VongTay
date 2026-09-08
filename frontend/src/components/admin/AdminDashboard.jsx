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
  EyeOff,
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
  Wand2,
  Ticket,
  Percent,
  Star,
  MessageSquare,
  Link2,
  GitBranch,
  Calendar,
  DollarSign,
  Copy,
  Heart,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

const schemaTables = [
  {
    name: 'users',
    label: 'Tài Khoản & Khách Hàng',
    icon: 'Users',
    pk: 'id',
    color: 'border-blue-500 bg-blue-50/50',
    tagColor: 'bg-blue-100 text-blue-800',
    description: 'Lưu trữ thông tin khách hàng, thợ thủ công và ban quản trị xưởng.',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', isPk: true, note: 'Khóa chính PK' },
      { name: 'email', type: 'VARCHAR(255)', isUnique: true, note: 'Email đăng nhập duy nhất' },
      { name: 'password_hash', type: 'VARCHAR(255)' },
      { name: 'full_name', type: 'VARCHAR(255)', note: 'Họ tên người dùng' },
      { name: 'phone', type: 'VARCHAR(50)', note: 'Số điện thoại nhận hàng' },
      { name: 'address', type: 'TEXT', note: 'Địa chỉ giao hàng' },
      { name: 'role', type: 'VARCHAR(50)', note: 'admin | customer | artisan' },
      { name: 'created_at', type: 'TIMESTAMPTZ', note: 'Thời điểm đăng ký' }
    ],
    relations: [
      { to: 'orders', type: '1:N', fk: 'orders.user_id -> users.id', desc: '1 Khách hàng có thể tạo nhiều Đơn hàng' },
      { to: 'reviews', type: '1:N', fk: 'reviews.user_id -> users.id', desc: '1 Khách hàng viết nhiều Đánh giá sản phẩm' },
      { to: 'wishlists', type: '1:N', fk: 'wishlists.user_id -> users.id', desc: '1 Khách hàng lưu nhiều Vòng tay yêu thích' },
      { to: 'custom_designs', type: '1:N', fk: 'custom_designs.user_id -> users.id', desc: '1 Khách hàng lưu nhiều Bản thiết kế tự phối' }
    ]
  },
  {
    name: 'categories',
    label: 'Danh Mục Bộ Sưu Tập',
    icon: 'Layers',
    pk: 'id',
    color: 'border-amber-500 bg-amber-50/50',
    tagColor: 'bg-amber-100 text-amber-800',
    description: 'Phân loại các dòng vòng tay dây đan (Macrame pastel, Vòng đôi, Dây đỏ, Dây lụa).',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', isPk: true, note: 'Mã danh mục' },
      { name: 'name', type: 'VARCHAR(100)', note: 'Tên hiển thị bộ sưu tập' },
      { name: 'slug', type: 'VARCHAR(100)', isUnique: true, note: 'Khóa đối chiếu danh mục duy nhất' },
      { name: 'icon', type: 'VARCHAR(50)' },
      { name: 'display_order', type: 'INTEGER', note: 'Thứ tự ưu tiên hiển thị' }
    ],
    relations: [
      { to: 'products', type: '1:N', fk: 'products.category -> categories.slug', desc: '1 Danh mục chứa nhiều Sản phẩm vòng tay' }
    ]
  },
  {
    name: 'products',
    label: 'Kho Sản Phẩm Vòng Tay',
    icon: 'Package',
    pk: 'id',
    color: 'border-emerald-500 bg-emerald-50/50',
    tagColor: 'bg-emerald-100 text-emerald-800',
    description: 'Thông tin chi tiết mẫu mã, giá bán lẻ/sỉ, tồn kho, thành phần sợi dệt AI bóc tách.',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', isPk: true, note: 'Khóa chính mã vòng (vt-pastel-whale...)' },
      { name: 'name', type: 'VARCHAR(255)', note: 'Tên mẫu vòng tay thủ công' },
      { name: 'category', type: 'VARCHAR(100)', isFk: true, fkTarget: 'categories.slug', note: 'FK liên kết danh mục' },
      { name: 'price', type: 'NUMERIC', note: 'Giá bán lẻ niêm yết' },
      { name: 'wholesale_price', type: 'NUMERIC', note: 'Giá bán buôn/sỉ ưu đãi' },
      { name: 'cord_type', type: 'VARCHAR(255)', note: 'Chỉ sáp dệt Macrame / Dây lụa' },
      { name: 'stone_type', type: 'VARCHAR(255)', note: 'Gốm sứ men / Charm acrylic' },
      { name: 'cord_composition', type: 'JSONB', note: 'AI Gemini Vision bóc tách thành phần' },
      { name: 'stock', type: 'INTEGER', note: 'Số lượng tồn xưởng' }
    ],
    relations: [
      { to: 'order_items', type: '1:N', fk: 'order_items.product_id -> products.id', desc: '1 Vòng tay xuất hiện trong nhiều Chi tiết đơn' },
      { to: 'reviews', type: '1:N', fk: 'reviews.product_id -> products.id (ON DELETE CASCADE)', desc: '1 Vòng tay nhận nhiều Đánh giá' },
      { to: 'wishlists', type: '1:N', fk: 'wishlists.product_id -> products.id (ON DELETE CASCADE)', desc: '1 Vòng tay được nhiều người Yêu thích' }
    ]
  },
  {
    name: 'orders',
    label: 'Hóa Đơn & Đơn Hàng',
    icon: 'ShoppingBag',
    pk: 'id',
    color: 'border-[#B86244] bg-orange-50/50',
    tagColor: 'bg-orange-100 text-[#B86244]',
    description: 'Quản lý toàn bộ giao dịch đặt làm vòng tay, chiết khấu và trạng thái vận chuyển.',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', isPk: true, note: 'Mã đơn duy nhất (DH-...)' },
      { name: 'user_id', type: 'VARCHAR(50)', isFk: true, fkTarget: 'users.id', note: 'FK liên kết tài khoản đặt' },
      { name: 'customer_name', type: 'VARCHAR(255)', note: 'Tên người nhận' },
      { name: 'phone', type: 'VARCHAR(50)', note: 'Số điện thoại nhận hàng' },
      { name: 'total_amount', type: 'NUMERIC', note: 'Tổng tiền thanh toán cuối cùng' },
      { name: 'voucher_discount', type: 'NUMERIC', note: 'Chiết khấu từ mã giảm giá' },
      { name: 'order_status', type: 'VARCHAR(100)', note: 'Chờ xác nhận / Đang kết hạt / Đã giao' },
      { name: 'tracking_code', type: 'VARCHAR(100)', note: 'Mã vận đơn bưu cục' }
    ],
    relations: [
      { to: 'order_items', type: '1:N', fk: 'order_items.order_id -> orders.id (ON DELETE CASCADE)', desc: '1 Đơn hàng gồm nhiều Dòng sản phẩm chi tiết' },
      { to: 'users', type: 'N:1', fk: 'orders.user_id -> users.id', desc: 'Đơn hàng liên kết với 1 Khách hàng' },
      { to: 'vouchers', type: 'N:1', fk: 'orders.voucher_discount áp dụng từ vouchers.code', desc: 'Đơn hàng hưởng chiết khấu từ Mã giảm giá' }
    ]
  },
  {
    name: 'order_items',
    label: 'Chi Tiết Dòng Đơn Hàng',
    icon: 'FileText',
    pk: 'id',
    color: 'border-purple-500 bg-purple-50/50',
    tagColor: 'bg-purple-100 text-purple-800',
    description: 'Các mục sản phẩm cụ thể kèm size cổ tay đo đạc, khắc chữ kỷ niệm.',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', isPk: true, note: 'Mã dòng chi tiết' },
      { name: 'order_id', type: 'VARCHAR(50)', isFk: true, fkTarget: 'orders.id (CASCADE)', note: 'FK tới đơn hàng cha' },
      { name: 'product_id', type: 'VARCHAR(50)', isFk: true, fkTarget: 'products.id', note: 'FK tới sản phẩm gốc' },
      { name: 'product_name', type: 'VARCHAR(255)' },
      { name: 'wrist_size', type: 'VARCHAR(50)', note: 'Size cổ tay đo thực tế (14-17cm)' },
      { name: 'custom_engraving', type: 'TEXT', note: 'Nội dung khắc chữ kỷ niệm' },
      { name: 'quantity', type: 'INTEGER', note: 'Số lượng đặt' },
      { name: 'price', type: 'NUMERIC', note: 'Đơn giá tại thời điểm đặt' }
    ],
    relations: [
      { to: 'orders', type: 'N:1', fk: 'order_items.order_id -> orders.id', desc: 'Thuộc về đơn hàng cha' },
      { to: 'products', type: 'N:1', fk: 'order_items.product_id -> products.id', desc: 'Liên kết tới sản phẩm gốc' }
    ]
  },
  {
    name: 'vouchers',
    label: 'Mã Giảm Giá & Ưu Đãi',
    icon: 'Ticket',
    pk: 'id / code',
    color: 'border-pink-500 bg-pink-50/50',
    tagColor: 'bg-pink-100 text-pink-800',
    description: 'Chính sách khuyến mãi chiết khấu % hoặc tiền mặt, quản lý thêm sửa xóa.',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', isPk: true, note: 'Khóa chính mã ID' },
      { name: 'code', type: 'VARCHAR(50)', isUnique: true, note: 'Mã áp dụng duy nhất (KHANHVY15...)' },
      { name: 'discount_type', type: 'VARCHAR(20)', note: 'percentage | fixed' },
      { name: 'discount_value', type: 'NUMERIC', note: 'Tỷ lệ % hoặc tiền mặt ₫' },
      { name: 'min_order_value', type: 'NUMERIC', note: 'Điều kiện đơn hàng tối thiểu' },
      { name: 'max_discount', type: 'NUMERIC', note: 'Mức giảm tối đa' },
      { name: 'usage_limit', type: 'INTEGER', note: 'Giới hạn tổng lượt sử dụng' },
      { name: 'used_count', type: 'INTEGER', note: 'Số lượt đã được áp dụng' },
      { name: 'is_active', type: 'BOOLEAN', note: 'Bật / Tắt hiệu lực mã' }
    ],
    relations: [
      { to: 'orders', type: '1:N', fk: 'orders.voucher_discount áp dụng từ vouchers.code', desc: 'Mã giảm giá áp dụng vào các đơn hàng hợp lệ' }
    ]
  },
  {
    name: 'reviews',
    label: 'Đánh Giá & Trải Nghiệm',
    icon: 'Star',
    pk: 'id',
    color: 'border-yellow-500 bg-yellow-50/50',
    tagColor: 'bg-yellow-100 text-yellow-800',
    description: 'Phản hồi từ người mua thực tế, độ vừa vặn cổ tay, hình ảnh feedback.',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', isPk: true, note: 'Mã đánh giá' },
      { name: 'product_id', type: 'VARCHAR(50)', isFk: true, fkTarget: 'products.id (CASCADE)', note: 'FK tới sản phẩm được đánh giá' },
      { name: 'user_id', type: 'VARCHAR(50)', isFk: true, fkTarget: 'users.id', note: 'FK tới tài khoản người đánh giá' },
      { name: 'customer_name', type: 'VARCHAR(100)', note: 'Tên người mua' },
      { name: 'rating', type: 'INTEGER', note: 'Số sao đánh giá (1-5)' },
      { name: 'wrist_fit', type: 'VARCHAR(100)', note: 'Độ vừa vặn cổ tay' },
      { name: 'comment', type: 'TEXT', note: 'Nội dung cảm nhận' }
    ],
    relations: [
      { to: 'products', type: 'N:1', fk: 'reviews.product_id -> products.id', desc: 'Đánh giá cho sản phẩm cụ thể' },
      { to: 'users', type: 'N:1', fk: 'reviews.user_id -> users.id', desc: 'Người viết đánh giá' }
    ]
  },
  {
    name: 'wishlists',
    label: 'Bộ Sưu Tập Yêu Thích',
    icon: 'Heart',
    pk: 'id',
    color: 'border-rose-500 bg-rose-50/50',
    tagColor: 'bg-rose-100 text-rose-800',
    description: 'Lưu trữ các mẫu vòng khách hàng đã đánh dấu yêu thích trên tài khoản.',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', isPk: true },
      { name: 'user_id', type: 'VARCHAR(50)', isFk: true, fkTarget: 'users.id', note: 'FK tới tài khoản khách hàng' },
      { name: 'product_id', type: 'VARCHAR(50)', isFk: true, fkTarget: 'products.id (CASCADE)', note: 'FK tới sản phẩm yêu thích' },
      { name: 'created_at', type: 'TIMESTAMPTZ', note: 'Ngày thêm vào yêu thích' }
    ],
    relations: [
      { to: 'users', type: 'N:1', fk: 'wishlists.user_id -> users.id', desc: 'Thuộc về tài khoản người dùng' },
      { to: 'products', type: 'N:1', fk: 'wishlists.product_id -> products.id', desc: 'Sản phẩm được đánh dấu' }
    ]
  },
  {
    name: 'custom_designs',
    label: 'Thiết Kế Tự Phối Độc Bản',
    icon: 'Sparkles',
    pk: 'id',
    color: 'border-indigo-500 bg-indigo-50/50',
    tagColor: 'bg-indigo-100 text-indigo-800',
    description: 'Lưu bản vẽ tự phối vòng từ Studio Customizer: hạt, màu dây, charm, chữ khắc.',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', isPk: true },
      { name: 'user_id', type: 'VARCHAR(50)', isFk: true, fkTarget: 'users.id', note: 'FK tới tài khoản tác giả' },
      { name: 'design_name', type: 'VARCHAR(255)', note: 'Tên bản thiết kế độc bản' },
      { name: 'beads_config', type: 'JSONB', note: 'Cấu hình hạt & charm thủ công' },
      { name: 'cord_color', type: 'VARCHAR(50)', note: 'Màu sắc dây dệt' },
      { name: 'estimated_price', type: 'NUMERIC', note: 'Dự toán kinh phí gia công' }
    ],
    relations: [
      { to: 'users', type: 'N:1', fk: 'custom_designs.user_id -> users.id', desc: 'Khách hàng tạo bản thiết kế' }
    ]
  },
  {
    name: 'consultations',
    label: 'Yêu Cầu Tư Vấn Thủ Công',
    icon: 'HelpCircle',
    pk: 'id',
    color: 'border-teal-500 bg-teal-50/50',
    tagColor: 'bg-teal-100 text-teal-800',
    description: 'Yêu cầu gọi lại tư vấn màu hợp mệnh, hướng dẫn đo size cổ tay chuẩn xác.',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', isPk: true, note: 'Mã yêu cầu' },
      { name: 'customer_name', type: 'VARCHAR(100)', note: 'Tên khách hàng' },
      { name: 'phone', type: 'VARCHAR(50)', note: 'Số điện thoại liên hệ' },
      { name: 'menh', type: 'VARCHAR(50)', note: 'Mệnh phong thủy (Kim/Mộc/Thủy/Hỏa/Thổ)' },
      { name: 'wrist_size', type: 'VARCHAR(50)', note: 'Size cổ tay cần tư vấn' },
      { name: 'status', type: 'VARCHAR(50)', note: 'Chờ tư vấn / Đã hỗ trợ' }
    ],
    relations: [
      { to: 'orders', type: '1:1', fk: 'Tư vấn chuyển đổi thành đơn hàng thực tế', desc: 'Nghệ nhân tư vấn chọn vòng phù hợp và chốt đơn' }
    ]
  }
];

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
  const [productVisibilityFilter, setProductVisibilityFilter] = useState('all'); // 'all' | 'visible' | 'hidden'
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
    meaning: 'Bình an, may mắn và tràn đầy năng lượng tích cực.',
    isHidden: false
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

  // Vouchers state (Quản lý Thêm, Sửa, Xóa mã giảm giá)
  const [vouchers, setVouchers] = useState([]);
  const [voucherSearch, setVoucherSearch] = useState('');
  const [voucherFilter, setVoucherFilter] = useState('all'); // 'all' | 'active' | 'inactive' | 'percentage' | 'fixed'
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [voucherFormData, setVoucherFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 200000,
    maxDiscount: 50000,
    usageLimit: 500,
    description: 'Ưu đãi tri ân khách hàng KhánhVyMade',
    isActive: true,
    expiresAt: ''
  });

  // Reviews state
  const [reviews, setReviews] = useState([]);

  // Relational Schema Interactive state
  const [activeSchemaTable, setActiveSchemaTable] = useState('orders');

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
      const [statsRes, ordersRes, productsRes, usersRes, meRes, vouchersRes, reviewsRes] = await Promise.all([
        api.getAdminStats().catch(() => ({ success: false })),
        api.getOrders().catch(() => ({ success: false })),
        api.getProducts({ includeHidden: true }).catch(() => ({ success: false })),
        api.getUsers().catch(() => ({ success: false })),
        api.getMe().catch(() => ({ success: false })),
        api.getVouchers(true).catch(() => ({ success: false })),
        api.getReviews().catch(() => ({ success: false }))
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (productsRes.success) setProducts(productsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (meRes.success && meRes.data?.dbStatus) setDbStatus(meRes.data.dbStatus);
      if (vouchersRes.success && Array.isArray(vouchersRes.data)) setVouchers(vouchersRes.data);
      if (reviewsRes.success && Array.isArray(reviewsRes.data)) setReviews(reviewsRes.data);
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
      },
      isHidden: false
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
      cordComposition: prod.cordComposition || prod.cord_composition || null,
      isHidden: Boolean(prod.isHidden)
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, productFormData);
        if (res.success) {
          setProducts(prev => prev.map(p => String(p.id).trim() === String(editingProduct.id).trim() ? res.data : p));
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
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm "${name}" khỏi cơ sở dữ liệu? Hành động này sẽ xóa hoàn toàn và không thể khôi phục.`)) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        setProducts(prev => prev.filter(p => String(p.id).trim() !== String(id).trim()));
        triggerToast(`Đã xóa vĩnh viễn sản phẩm "${name}" khỏi cơ sở dữ liệu`);
      }
    } catch (err) {
      alert('Lỗi xóa sản phẩm: ' + err.message);
    }
  };

  const handleToggleProductVisibility = async (prod) => {
    try {
      const res = await api.toggleProductVisibility(prod.id);
      if (res.success) {
        setProducts(prev => prev.map(p => 
          String(p.id).trim() === String(prod.id).trim() 
            ? { ...p, isHidden: res.data.isHidden } 
            : p
        ));
        triggerToast(res.message || (res.data.isHidden ? `Đã ẩn "${prod.name}" khỏi gian hàng` : `Đã hiện "${prod.name}" lên gian hàng`));
      }
    } catch (err) {
      alert('Lỗi thay đổi trạng thái ẩn/hiện: ' + err.message);
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

  // ================= VOUCHERS HANDLERS =================
  const handleOpenCreateVoucher = () => {
    setEditingVoucher(null);
    setVoucherFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 15,
      minOrderValue: 200000,
      maxDiscount: 50000,
      usageLimit: 500,
      description: 'Ưu đãi tri ân khách hàng thân thiết KhánhVyMade',
      isActive: true,
      expiresAt: ''
    });
    setIsVoucherModalOpen(true);
  };

  const handleOpenEditVoucher = (voucher) => {
    setEditingVoucher(voucher);
    setVoucherFormData({
      code: voucher.code,
      discountType: voucher.discountType || 'percentage',
      discountValue: voucher.discountValue || 0,
      minOrderValue: voucher.minOrderValue || 0,
      maxDiscount: voucher.maxDiscount || '',
      usageLimit: voucher.usageLimit || 500,
      description: voucher.description || '',
      isActive: voucher.isActive !== false,
      expiresAt: voucher.expiresAt ? voucher.expiresAt.substring(0, 10) : ''
    });
    setIsVoucherModalOpen(true);
  };

  const handleSaveVoucher = async (e) => {
    e.preventDefault();
    try {
      const cleanCode = String(voucherFormData.code || '').trim().toUpperCase();
      if (!cleanCode) {
        alert('Vui lòng nhập mã giảm giá');
        return;
      }

      const payload = {
        ...voucherFormData,
        code: cleanCode,
        discountValue: Number(voucherFormData.discountValue) || 0,
        minOrderValue: Number(voucherFormData.minOrderValue) || 0,
        maxDiscount: voucherFormData.maxDiscount ? Number(voucherFormData.maxDiscount) : null,
        usageLimit: Number(voucherFormData.usageLimit) || 500
      };

      if (editingVoucher) {
        const res = await api.updateVoucher(editingVoucher.id, payload);
        if (res.success) {
          triggerToast(`Đã cập nhật mã giảm giá "${res.data.code}"`);
        }
      } else {
        const res = await api.createVoucher(payload);
        if (res.success) {
          triggerToast(`Đã tạo mới mã giảm giá "${res.data.code}"`);
        }
      }
      setIsVoucherModalOpen(false);
      const vRes = await api.getVouchers(true);
      if (vRes.success) setVouchers(vRes.data);
    } catch (err) {
      alert('Lỗi lưu mã giảm giá: ' + err.message);
    }
  };

  const handleDeleteVoucher = async (id, code) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn mã giảm giá "${code}"?`)) return;
    try {
      const res = await api.deleteVoucher(id);
      if (res.success) {
        setVouchers(prev => prev.filter(v => v.id !== id && v.code !== id));
        triggerToast(`Đã xóa mã voucher "${code}" thành công`);
      }
    } catch (err) {
      alert('Lỗi xóa voucher: ' + err.message);
    }
  };

  const handleToggleVoucher = async (id) => {
    try {
      const res = await api.toggleVoucher(id);
      if (res.success) {
        setVouchers(prev => prev.map(v => (v.id === id || v.code === id) ? { ...v, isActive: res.data.isActive } : v));
        triggerToast(res.message);
      }
    } catch (err) {
      alert('Lỗi chuyển trạng thái: ' + err.message);
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
    const matchVisibility = productVisibilityFilter === 'all'
      ? true
      : productVisibilityFilter === 'hidden'
        ? Boolean(p.isHidden)
        : !Boolean(p.isHidden);
    return matchCategory && matchSearch && matchVisibility;
  });

  const filteredUsers = users.filter(u => {
    return !userSearch || 
      (u.fullName && u.fullName.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.phone && u.phone.includes(userSearch));
  });

  const filteredVouchers = vouchers.filter(v => {
    const matchSearch = !voucherSearch ||
      (v.code && v.code.toLowerCase().includes(voucherSearch.toLowerCase())) ||
      (v.description && v.description.toLowerCase().includes(voucherSearch.toLowerCase()));
    
    if (!matchSearch) return false;

    if (voucherFilter === 'active') return v.isActive !== false;
    if (voucherFilter === 'inactive') return v.isActive === false;
    if (voucherFilter === 'percentage') return v.discountType === 'percentage';
    if (voucherFilter === 'fixed') return v.discountType === 'fixed';
    return true;
  });

  // Tính toán doanh thu dự phòng nếu stats API chưa đồng bộ
  const calculatedRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || o.total_amount || 0), 0);
  const totalRevenue = (stats?.totalRevenue && Number(stats.totalRevenue) > 0) ? Number(stats.totalRevenue) : calculatedRevenue;

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

        {/* 7 Main Management Tabs */}
        <div className="flex border-b border-[#E8DFD3] gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setAdminTab('orders')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              adminTab === 'orders'
                ? 'bg-[#B86244] text-white shadow-sm'
                : 'bg-white text-[#6B6258] hover:bg-[#F3ECE1] border border-[#E8DFD3]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Đơn Hàng ({orders.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('vouchers')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              adminTab === 'vouchers'
                ? 'bg-[#B86244] text-white shadow-sm'
                : 'bg-white text-[#6B6258] hover:bg-[#F3ECE1] border border-[#E8DFD3]'
            }`}
          >
            <Ticket className="w-4 h-4 text-amber-500" />
            <span>Mã Giảm Giá ({vouchers.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('products')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              adminTab === 'products'
                ? 'bg-[#B86244] text-white shadow-sm'
                : 'bg-white text-[#6B6258] hover:bg-[#F3ECE1] border border-[#E8DFD3]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Sản Phẩm ({products.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('users')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              adminTab === 'users'
                ? 'bg-[#B86244] text-white shadow-sm'
                : 'bg-white text-[#6B6258] hover:bg-[#F3ECE1] border border-[#E8DFD3]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tài Khoản ({users.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('reviews')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              adminTab === 'reviews'
                ? 'bg-[#B86244] text-white shadow-sm'
                : 'bg-white text-[#6B6258] hover:bg-[#F3ECE1] border border-[#E8DFD3]'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500" />
            <span>Đánh Giá ({reviews.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('schema')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              adminTab === 'schema'
                ? 'bg-[#4E6857] text-white shadow-sm'
                : 'bg-white text-[#4E6857] hover:bg-[#EDF3EF] border border-[#E8DFD3]'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Sơ Đồ CSDL 10 Bảng (FK)</span>
          </button>

          <button
            onClick={() => setAdminTab('database')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              adminTab === 'database'
                ? 'bg-[#4E6857] text-white shadow-sm'
                : 'bg-white text-[#4E6857] hover:bg-[#EDF3EF] border border-[#E8DFD3]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Neon DB {dbStatus?.isConnected ? '🟢' : '🟡'}</span>
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
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
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

        {/* ================= TAB 2: QUẢN LÝ MÃ GIẢM GIÁ (VOUCHERS) ================= */}
        {adminTab === 'vouchers' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-sm">
                <span className="text-[11px] text-[#6B6258] font-medium block">Tổng Mã Giảm Giá</span>
                <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-[#B86244] mt-1 block">
                  {vouchers.length} mã
                </span>
                <span className="text-[10px] text-[#8C8276] mt-1 block">Trong cơ sở dữ liệu</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-sm">
                <span className="text-[11px] text-[#6B6258] font-medium block">Đang Hoạt Động</span>
                <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-emerald-600 mt-1 block">
                  {vouchers.filter(v => v.isActive !== false).length} mã
                </span>
                <span className="text-[10px] text-emerald-700 mt-1 block">Khách có thể áp dụng</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-sm">
                <span className="text-[11px] text-[#6B6258] font-medium block">Mã Giảm Theo %</span>
                <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-amber-600 mt-1 block">
                  {vouchers.filter(v => v.discountType === 'percentage').length} mã
                </span>
                <span className="text-[10px] text-amber-700 mt-1 block">Chiết khấu theo tỷ lệ %</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-sm">
                <span className="text-[11px] text-[#6B6258] font-medium block">Mã Giảm Trực Tiếp</span>
                <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-[#4E6857] mt-1 block">
                  {vouchers.filter(v => v.discountType === 'fixed').length} mã
                </span>
                <span className="text-[10px] text-[#4E6857] mt-1 block">Trừ thẳng vào hóa đơn</span>
              </div>
            </div>

            {/* Filter & Action Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleOpenCreateVoucher}
                  className="px-4 py-2.5 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tạo Mã Giảm Giá Mới</span>
                </button>

                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#8C8276] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã (VD: KHANHVY15)..."
                    value={voucherSearch}
                    onChange={(e) => setVoucherSearch(e.target.value)}
                    className="w-full text-xs bg-[#FAF7F2] pl-8 pr-3 py-2 rounded-xl border border-[#E8DFD3] focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'Tất Cả' },
                  { id: 'active', label: 'Đang Bật' },
                  { id: 'inactive', label: 'Tạm Ngưng' },
                  { id: 'percentage', label: 'Giảm %' },
                  { id: 'fixed', label: 'Giảm ₫' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setVoucherFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      voucherFilter === tab.id
                        ? 'bg-[#26211C] text-white'
                        : 'bg-[#FAF7F2] text-[#6B6258] hover:bg-[#EDE5DA]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vouchers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVouchers.map(v => (
                <div
                  key={v.id || v.code}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-sm relative flex flex-col justify-between ${
                    v.isActive === false ? 'border-dashed border-gray-300 opacity-75' : 'border-[#E8DFD3] hover:border-[#B86244]'
                  }`}
                >
                  <div>
                    {/* Top row: Code badge + Status toggle */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm tracking-wide bg-[#FAF4ED] text-[#B86244] border border-[#EADBCC] px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                          <Ticket className="w-3.5 h-3.5 text-[#B86244]" />
                          {v.code}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(v.code);
                            triggerToast(`Đã sao chép mã ${v.code}`);
                          }}
                          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          title="Sao chép mã"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleToggleVoucher(v.id || v.code)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                          v.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                        }`}
                        title="Bấm để bật / tắt mã giảm giá"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${v.isActive !== false ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        <span>{v.isActive !== false ? 'Đang bật' : 'Tạm ngưng'}</span>
                      </button>
                    </div>

                    {/* Discount Headline */}
                    <div className="mb-3">
                      <div className="text-xl font-bold text-[#26211C] flex items-baseline gap-1">
                        {v.discountType === 'percentage' ? (
                          <>
                            <span className="text-[#B86244]">Giảm {v.discountValue}%</span>
                            {v.maxDiscount && (
                              <span className="text-xs text-[#8C8276] font-normal">
                                (Tối đa {new Intl.NumberFormat('vi-VN').format(v.maxDiscount)}₫)
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[#4E6857]">
                            Giảm {new Intl.NumberFormat('vi-VN').format(v.discountValue)}₫
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B6258] mt-1 leading-relaxed line-clamp-2">
                        {v.description || 'Ưu đãi dành cho đơn hàng tại KhánhVyMade'}
                      </p>
                    </div>

                    {/* Criteria Details */}
                    <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3]/80 text-[11px] space-y-1 text-[#6B6258] mb-4">
                      <div className="flex justify-between">
                        <span>Đơn tối thiểu:</span>
                        <strong className="text-[#26211C]">
                          {v.minOrderValue ? `${new Intl.NumberFormat('vi-VN').format(v.minOrderValue)}₫` : 'Không giới hạn'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Lượt dùng:</span>
                        <strong className="text-[#26211C]">
                          {v.usedCount || 0} / {v.usageLimit || '∞'} lượt
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Hạn dùng:</span>
                        <strong className="text-[#26211C]">
                          {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Sửa / Xóa) */}
                  <div className="pt-3 border-t border-[#F0EAE1] flex items-center justify-between">
                    <span className="text-[10px] text-[#8C8276]">
                      Loại: <span className="font-semibold text-[#26211C]">{v.discountType === 'percentage' ? 'Theo tỷ lệ %' : 'Tiền mặt cố định'}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditVoucher(v)}
                        className="p-2 rounded-xl bg-[#FAF4ED] text-[#B86244] hover:bg-[#B86244] hover:text-white transition-colors"
                        title="Chỉnh sửa mã giảm giá"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVoucher(v.id || v.code, v.code)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Xóa mã giảm giá vĩnh viễn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredVouchers.length === 0 && (
              <div className="bg-white p-12 rounded-3xl border border-[#E8DFD3] text-center space-y-3">
                <Ticket className="w-12 h-12 text-[#CFC1B0] mx-auto" />
                <h3 className="font-serif-boutique text-lg font-bold text-[#26211C]">
                  Không tìm thấy mã giảm giá nào
                </h3>
                <p className="text-xs text-[#6B6258] max-w-sm mx-auto">
                  Bạn có thể tạo mã mới để kích hoạt khuyến mãi cho các đơn hàng vòng tay macrame.
                </p>
                <button
                  onClick={handleOpenCreateVoucher}
                  className="px-4 py-2 bg-[#B86244] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#A05237]"
                >
                  + Tạo Mã Ngay
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: QUẢN LÝ SẢN PHẨM ================= */}
        {adminTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handleOpenNewProductModal}
                  className="px-4 py-2.5 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Sản Phẩm Mới</span>
                </button>

                <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#E8DFD3]">
                  <button
                    type="button"
                    onClick={() => setProductVisibilityFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      productVisibilityFilter === 'all' 
                        ? 'bg-white text-[#26211C] shadow-sm' 
                        : 'text-[#6B6258] hover:text-[#26211C]'
                    }`}
                  >
                    Tất Cả ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductVisibilityFilter('visible')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      productVisibilityFilter === 'visible' 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-emerald-700 hover:text-emerald-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Đang Hiện ({products.filter(p => !p.isHidden).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductVisibilityFilter('hidden')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      productVisibilityFilter === 'hidden' 
                        ? 'bg-amber-600 text-white shadow-sm' 
                        : 'text-amber-700 hover:text-amber-900'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Đã Ẩn ({products.filter(p => p.isHidden).length})</span>
                  </button>
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E8DFD3] text-xs font-semibold rounded-xl px-3 py-2 text-[#26211C] focus:outline-none"
                >
                  <option value="all">Tất cả danh mục vòng</option>
                  <option value="best-seller">🔥 Sản Phẩm Bán Chạy Nhất (Best Sellers)</option>
                  <option value="macrame-pastel">Vòng Dây Macrame Pastel & Hoa Gốm</option>
                  <option value="vong-doi">Vòng Đôi Dây Sáp Nam Châm</option>
                  <option value="day-do-may-man">Vòng Chỉ Đỏ Bình An & Hộ Thân</option>
                  <option value="day-lua-co-phong">Vòng Dây Lụa & Dây Da Mộc</option>
                </select>
              </div>

              <div className="relative w-full md:w-72">
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
                <div key={prod.id} className={`bg-white p-4 rounded-3xl border shadow-sm flex flex-col justify-between hover:shadow-md transition-all ${
                  prod.isHidden ? 'border-amber-300/80 bg-amber-50/20' : 'border-[#E8DFD3]'
                }`}>
                  <div className="space-y-3">
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFD3]">
                      <img
                        src={prod.images?.[0] || '/images/products/bracelet-pastel-macrame-trio.jpg'}
                        alt={prod.name}
                        className={`w-full h-full object-cover transition-opacity ${prod.isHidden ? 'opacity-70 grayscale-[20%]' : ''}`}
                      />
                      <span className="absolute top-2 left-2 bg-[#26211C]/80 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                        {prod.id}
                      </span>
                      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        {prod.isHidden ? (
                          <span className="bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow flex items-center gap-1">
                            <EyeOff className="w-2.5 h-2.5" />
                            <span>ĐÃ ẨN</span>
                          </span>
                        ) : (
                          <span className="bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow flex items-center gap-1">
                            <Eye className="w-2.5 h-2.5" />
                            <span>ĐANG HIỆN</span>
                          </span>
                        )}
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
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-[#26211C] line-clamp-2">
                          {prod.name}
                        </h4>
                      </div>
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
                        onClick={() => handleToggleProductVisibility(prod)}
                        className={`p-2 rounded-xl transition-all shadow-sm ${
                          prod.isHidden
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                        title={prod.isHidden ? 'Bấm để Hiện lại sản phẩm trên gian hàng' : 'Bấm để Ẩn sản phẩm khỏi gian hàng khách'}
                      >
                        {prod.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
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
                        title="Xóa vĩnh viễn khỏi cơ sở dữ liệu"
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

        {/* ================= TAB 5: ĐÁNH GIÁ & NHẬN XÉT (REVIEWS) ================= */}
        {adminTab === 'reviews' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-sm">
                <span className="text-[11px] text-[#6B6258] font-medium block">Tổng Số Đánh Giá</span>
                <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-[#B86244] mt-1 block">
                  {reviews.length} đánh giá
                </span>
                <span className="text-[10px] text-[#8C8276] mt-1 block">Bảng reviews liên kết products</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-sm">
                <span className="text-[11px] text-[#6B6258] font-medium block">Điểm Trung Bình</span>
                <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-amber-500 mt-1 block flex items-center gap-1">
                  5.0 <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
                </span>
                <span className="text-[10px] text-amber-700 mt-1 block">100% đánh giá 5 sao</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-sm">
                <span className="text-[11px] text-[#6B6258] font-medium block">Khách Mua Thực Tế</span>
                <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-emerald-600 mt-1 block">
                  {reviews.filter(r => r.isVerifiedBuyer !== false).length} khách
                </span>
                <span className="text-[10px] text-emerald-700 mt-1 block">Đã xác thực mua hàng</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-sm">
                <span className="text-[11px] text-[#6B6258] font-medium block">Vừa Vặn Cổ Tay</span>
                <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-[#4E6857] mt-1 block">
                  {reviews.length} khách
                </span>
                <span className="text-[10px] text-[#4E6857] mt-1 block">Feedback chuẩn size đo</span>
              </div>
            </div>

            {/* Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev, idx) => (
                <div key={rev.id || idx} className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#26211C]">{rev.customerName || rev.customer_name || 'Khách hàng'}</span>
                        {(rev.isVerifiedBuyer !== false || rev.is_verified_buyer !== false) && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Đã Mua Hàng
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8C8276] block mt-0.5">
                        Mã SP liên kết: <span className="font-mono text-[#B86244] font-semibold">{rev.productId || rev.product_id}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[#4A4036] leading-relaxed italic bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD3]/60">
                    "{rev.comment}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#8C8276] pt-1">
                    <span className="bg-[#FAF4ED] text-[#B86244] px-2 py-0.5 rounded-full font-medium border border-[#EADBCC]">
                      Độ vừa tay: {rev.wristFit || rev.wrist_fit || 'Vừa vặn chuẩn size'}
                    </span>
                    <span>{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}</span>
                  </div>
                </div>
              ))}
            </div>

            {reviews.length === 0 && (
              <div className="bg-white p-12 rounded-3xl border border-[#E8DFD3] text-center space-y-2">
                <Star className="w-12 h-12 text-[#CFC1B0] mx-auto" />
                <h3 className="font-serif-boutique text-lg font-bold text-[#26211C]">Chưa có đánh giá nào</h3>
                <p className="text-xs text-[#6B6258]">Các đánh giá từ người mua sẽ xuất hiện tại đây.</p>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 6: SƠ ĐỒ LIÊN KẾT CSDL 10 BẢNG (RELATIONAL SCHEMA) ================= */}
        {adminTab === 'schema' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#26211C] via-[#3D352E] to-[#4E6857] text-white p-6 rounded-3xl border border-[#E8DFD3] shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-emerald-400" />
                    <h2 className="font-serif-boutique text-xl font-bold text-amber-200">
                      SƠ ĐỒ CƠ SỞ DỮ LIỆU LIÊN KẾT TOÀN DIỆN (10 BẢNG NEON POSTGRESQL)
                    </h2>
                  </div>
                  <p className="text-xs text-[#D8CFBF] mt-1 max-w-2xl leading-relaxed">
                    Mọi bảng dữ liệu trong hệ thống KhánhVyMade đều được kết nối chặt chẽ bằng Khóa ngoại (Foreign Keys) và ràng buộc toàn vẹn quan hệ (Relational Integrity) — không có bảng nào đứng độc lập rời rạc.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                    ✓ 10 Bảng Liên Kết
                  </span>
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/30">
                    ✓ 12 Khóa Ngoại (FK)
                  </span>
                  <span className="text-[11px] bg-purple-500/20 text-purple-300 font-bold px-3 py-1 rounded-full border border-purple-500/30">
                    ✓ Cascade Delete
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Schema Explorer: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: 10 Tables list */}
              <div className="lg:col-span-4 space-y-2.5">
                <div className="p-2 text-xs font-bold uppercase tracking-wider text-[#6B6258] flex items-center justify-between">
                  <span>10 Bảng Dữ Liệu</span>
                  <span>Khóa Ngoại (FK)</span>
                </div>

                {schemaTables.map(tbl => {
                  const isSelected = activeSchemaTable === tbl.name;
                  return (
                    <button
                      key={tbl.name}
                      onClick={() => setActiveSchemaTable(tbl.name)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between shadow-2xs ${
                        isSelected 
                          ? 'bg-white border-[#B86244] shadow-md ring-2 ring-[#B86244]/20' 
                          : 'bg-white/80 border-[#E8DFD3] hover:bg-white hover:border-[#B86244]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${tbl.tagColor}`}>
                          {tbl.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-[#26211C]">{tbl.name}</span>
                            <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded">
                              PK: {tbl.pk}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#6B6258] block mt-0.5">{tbl.label}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] bg-[#FAF4ED] text-[#B86244] font-bold px-2 py-0.5 rounded-full border border-[#EADBCC]">
                          {tbl.relations.length} liên kết
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Selected Table Inspector */}
              <div className="lg:col-span-8 space-y-5">
                {(() => {
                  const currentTable = schemaTables.find(t => t.name === activeSchemaTable) || schemaTables[0];
                  return (
                    <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-5">
                      {/* Table Header Details */}
                      <div className="flex items-start justify-between border-b border-[#F0EAE1] pb-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${currentTable.tagColor}`}>
                              BẢNG: {currentTable.name.toUpperCase()}
                            </span>
                            <span className="font-serif-boutique text-lg font-bold text-[#26211C]">
                              {currentTable.label}
                            </span>
                          </div>
                          <p className="text-xs text-[#6B6258] mt-1 leading-relaxed">
                            {currentTable.description}
                          </p>
                        </div>

                        <span className="font-mono text-xs text-[#B86244] bg-[#FAF4ED] px-3 py-1 rounded-xl border border-[#EADBCC] font-bold">
                          Primary Key: {currentTable.pk}
                        </span>
                      </div>

                      {/* Foreign Key Connections */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#26211C] flex items-center gap-1.5">
                          <GitBranch className="w-3.5 h-3.5 text-[#B86244]" />
                          <span>Các Mối Quan Hệ Liên Kết (Foreign Keys) Của Bảng Này:</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {currentTable.relations.map((rel, idx) => (
                            <div key={idx} className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3] space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#B86244] font-mono flex items-center gap-1">
                                  <Link2 className="w-3 h-3" />
                                  <span>{rel.to}</span>
                                </span>
                                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold border border-[#E8DFD3] text-[#4E6857]">
                                  Quan hệ {rel.type}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-[#26211C] bg-white px-2 py-1 rounded border border-[#E8DFD3]">
                                {rel.fk}
                              </p>
                              <p className="text-[10px] text-[#6B6258] pt-0.5">
                                {rel.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Columns Schema Table */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#26211C]">
                          Cấu Trúc Cột & Kiểu Dữ Liệu PostgreSQL:
                        </h4>
                        <div className="overflow-x-auto rounded-2xl border border-[#E8DFD3]">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[#6B6258] text-[10px] uppercase font-bold">
                              <tr>
                                <th className="py-2.5 px-3">Tên Cột</th>
                                <th className="py-2.5 px-3">Kiểu Dữ Liệu</th>
                                <th className="py-2.5 px-3">Ràng Buộc</th>
                                <th className="py-2.5 px-3">Ghi Chú Nghiệp Vụ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EAE1]">
                              {currentTable.columns.map((col, idx) => (
                                <tr key={idx} className="hover:bg-[#FAF7F2]/50">
                                  <td className="py-2 px-3 font-mono font-bold text-[#26211C]">
                                    {col.name}
                                  </td>
                                  <td className="py-2 px-3 font-mono text-[#4E6857]">
                                    {col.type}
                                  </td>
                                  <td className="py-2 px-3">
                                    {col.isPk ? (
                                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        PRIMARY KEY
                                      </span>
                                    ) : col.isFk ? (
                                      <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        FOREIGN KEY ({col.fkTarget})
                                      </span>
                                    ) : col.isUnique ? (
                                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        UNIQUE
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-[10px]">-</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-[#6B6258] text-[11px]">
                                    {col.note || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Database Architecture Topology Visual Card */}
                <div className="bg-[#FAF4ED] p-5 rounded-3xl border border-[#EADBCC] space-y-3">
                  <h4 className="font-bold text-xs text-[#B86244] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Luồng Dữ Liệu Quan Hệ Xuyên Suốt Hệ Thống:</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#6B6258]">
                    <div className="p-3 bg-white rounded-xl border border-[#EADBCC] space-y-1">
                      <strong className="text-[#26211C] block text-[11px]">1. Luồng Giao Dịch Đơn Hàng:</strong>
                      <p className="text-[11px] leading-relaxed">
                        <span className="font-mono text-blue-600">users</span> (Khách hàng) ──1:N──&gt; <span className="font-mono text-[#B86244]">orders</span> (Đơn hàng) ──1:N──&gt; <span className="font-mono text-purple-600">order_items</span> (Chi tiết mẫu vòng, size cổ tay, khắc tên).
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#EADBCC] space-y-1">
                      <strong className="text-[#26211C] block text-[11px]">2. Luồng Mã Giảm Giá & Chiết Khấu:</strong>
                      <p className="text-[11px] leading-relaxed">
                        <span className="font-mono text-pink-600">vouchers</span> (Mã giảm giá) ──1:N──&gt; <span className="font-mono text-[#B86244]">orders</span>. Khi khách nhập mã, đơn hàng liên kết để trừ tiền và tính toán doanh thu thực nhận.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#EADBCC] space-y-1">
                      <strong className="text-[#26211C] block text-[11px]">3. Luồng Đánh Giá & Yêu Thích:</strong>
                      <p className="text-[11px] leading-relaxed">
                        <span className="font-mono text-emerald-600">products</span> (Kho vòng) ──1:N──&gt; <span className="font-mono text-yellow-600">reviews</span> và <span className="font-mono text-rose-600">wishlists</span>. Cả hai đều liên kết ngược lại <span className="font-mono text-blue-600">users</span>.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#EADBCC] space-y-1">
                      <strong className="text-[#26211C] block text-[11px]">4. Luồng Tự Phối Studio & Tư Vấn:</strong>
                      <p className="text-[11px] leading-relaxed">
                        <span className="font-mono text-indigo-600">custom_designs</span> liên kết <span className="font-mono text-blue-600">users</span>. Khách yêu cầu <span className="font-mono text-teal-600">consultations</span> chọn hạt & size cổ tay được chuyển đổi thành đơn hàng.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: DATABASE NEON TECH ================= */}
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

              {/* --- CÀI ĐẶT TRẠNG THÁI HIỂN THỊ (ẨN / HIỆN GIAN HÀNG) --- */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                productFormData.isHidden 
                  ? 'bg-amber-50/80 border-amber-300/80' 
                  : 'bg-emerald-50/70 border-emerald-200/80'
              }`}>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(productFormData.isHidden)}
                    onChange={(e) => setProductFormData({ ...productFormData, isHidden: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className={`font-bold text-xs flex items-center gap-1.5 ${
                      productFormData.isHidden ? 'text-amber-900' : 'text-emerald-900'
                    }`}>
                      {productFormData.isHidden ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                          <span>Đang ẨN sản phẩm khỏi khách mua trên gian hàng</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đang HIỆN sản phẩm công khai trên gian hàng</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-[#6B6258] block">
                      {productFormData.isHidden 
                        ? 'Khách hàng ngoài shop sẽ không tìm thấy sản phẩm này. Chỉ Admin mới nhìn thấy trong Dashboard.'
                        : 'Sản phẩm sẽ xuất hiện công khai trên trang chủ và danh mục cho khách đặt mua.'}
                    </span>
                  </div>
                </label>
                <button
                  type="button"
                  onClick={() => setProductFormData({ ...productFormData, isHidden: !productFormData.isHidden })}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                    productFormData.isHidden 
                      ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' 
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                  }`}
                >
                  {productFormData.isHidden ? 'Bấm để Hiện' : 'Bấm để Ẩn'}
                </button>
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

      {/* ================= MODAL: TẠO / CHỈNH SỬA MÃ GIẢM GIÁ ================= */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#E8DFD3] shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="bg-[#26211C] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#B86244] text-white flex items-center justify-center font-bold">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-boutique text-lg font-bold">
                    {editingVoucher ? 'CHỈNH SỬA MÃ GIẢM GIÁ' : 'TẠO MÃ GIẢM GIÁ MỚI'}
                  </h3>
                  <p className="text-[10px] text-[#CFC1B0]">
                    {editingVoucher ? `Chỉnh sửa mã ưu đãi ${editingVoucher.code}` : 'Thiết lập chính sách chiết khấu cho khách hàng'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsVoucherModalOpen(false)} 
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVoucher} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Mã code */}
              <div>
                <label className="font-bold text-[#26211C] block mb-1">Mã Giảm Giá (Code): *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: KHANHVY15, TRIAN50K, FREESHIP..."
                  value={voucherFormData.code}
                  onChange={(e) => setVoucherFormData({ ...voucherFormData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none focus:ring-1 focus:ring-[#B86244] font-mono font-bold uppercase tracking-wider text-sm text-[#B86244]"
                />
                <p className="text-[10px] text-[#8C8276] mt-1">Khách hàng sẽ nhập chính xác mã này tại trang thanh toán.</p>
              </div>

              {/* Loại chiết khấu & Giá trị */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Hình Thức Giảm: *</label>
                  <select
                    value={voucherFormData.discountType}
                    onChange={(e) => setVoucherFormData({ ...voucherFormData, discountType: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none font-semibold text-[#26211C]"
                  >
                    <option value="percentage">Giảm theo tỷ lệ phần trăm (%)</option>
                    <option value="fixed">Giảm số tiền cố định (₫)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#26211C] block mb-1">
                    {voucherFormData.discountType === 'percentage' ? 'Tỷ Lệ Giảm (%): *' : 'Số Tiền Giảm (₫): *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={voucherFormData.discountType === 'percentage' ? '15' : '30000'}
                    value={voucherFormData.discountValue}
                    onChange={(e) => setVoucherFormData({ ...voucherFormData, discountValue: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none font-bold text-[#26211C]"
                  />
                </div>
              </div>

              {/* Điều kiện đơn tối thiểu & Giảm tối đa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Đơn Hàng Tối Thiểu (₫):</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    placeholder="150000"
                    value={voucherFormData.minOrderValue}
                    onChange={(e) => setVoucherFormData({ ...voucherFormData, minOrderValue: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none text-[#26211C]"
                  />
                  <span className="text-[10px] text-[#8C8276] mt-0.5 block">0₫ nếu không yêu cầu</span>
                </div>

                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Giảm Tối Đa (₫) (Nếu giảm %):</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    placeholder="50000"
                    value={voucherFormData.maxDiscount}
                    onChange={(e) => setVoucherFormData({ ...voucherFormData, maxDiscount: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none text-[#26211C]"
                  />
                  <span className="text-[10px] text-[#8C8276] mt-0.5 block">Để trống nếu không giới hạn trần</span>
                </div>
              </div>

              {/* Giới hạn lượt dùng & Hạn dùng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Giới Hạn Lượt Dùng Toàn Xưởng:</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="500"
                    value={voucherFormData.usageLimit}
                    onChange={(e) => setVoucherFormData({ ...voucherFormData, usageLimit: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none text-[#26211C]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Hạn Sử Dụng (Tùy chọn):</label>
                  <input
                    type="date"
                    value={voucherFormData.expiresAt}
                    onChange={(e) => setVoucherFormData({ ...voucherFormData, expiresAt: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none text-[#26211C]"
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="font-bold text-[#26211C] block mb-1">Mô Tả Mã Giảm Giá:</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Giảm 15% tối đa 50k cho đơn vòng tay từ 200k nhân dịp ra mắt bộ sưu tập mới"
                  value={voucherFormData.description}
                  onChange={(e) => setVoucherFormData({ ...voucherFormData, description: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>

              {/* Trạng thái hoạt động */}
              <div className="p-3 bg-[#FAF4ED] rounded-xl border border-[#EADBCC] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#26211C] block">Kích Hoạt Sử Dụng Ngay</span>
                  <span className="text-[10px] text-[#6B6258]">Bật để khách hàng có thể áp dụng mã này khi đặt vòng</span>
                </div>
                <input
                  type="checkbox"
                  checked={voucherFormData.isActive}
                  onChange={(e) => setVoucherFormData({ ...voucherFormData, isActive: e.target.checked })}
                  className="w-5 h-5 accent-[#B86244] cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#F0EAE1]">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E8DFD3] text-[#6B6258] font-semibold hover:bg-gray-50"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold shadow-sm"
                >
                  {editingVoucher ? 'Lưu Thay Đổi' : 'Tạo Mã Giảm Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
