import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  Copy,
  Check,
  X,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Download,
  ExternalLink,
  ChevronDown,
  Sparkles,
  DollarSign,
  ArrowLeft,
  Save,
  RefreshCw,
  UserCheck,
  ChevronRight,
  User,
  Tag
} from 'lucide-react';
import { api } from '../../services/api';

const ORDER_STATUS_CONFIG = {
  'Chờ xác nhận': {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
    step: 1
  },
  'Đang kết hạt thủ công': {
    bg: 'bg-purple-50 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
    icon: Sparkles,
    step: 2
  },
  'Đang giao hàng': {
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    icon: Truck,
    step: 3
  },
  'Đã giao hàng': {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
    step: 4
  },
  'Đã hủy': {
    bg: 'bg-red-50 text-red-800 border-red-200',
    dot: 'bg-red-500',
    icon: AlertCircle,
    step: 0
  }
};

const CARRIERS = [
  { id: 'GHTK', name: 'Giao Hàng Tiết Kiệm (GHTK)', trackUrl: 'https://i.ghtk.vn/' },
  { id: 'ViettelPost', name: 'Viettel Post', trackUrl: 'https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/' },
  { id: 'VNPost', name: 'Bưu Điện Việt Nam (VNPost)', trackUrl: 'http://www.vnpost.vn/' },
  { id: 'ShopeeXpress', name: 'Shopee Xpress / SPX', trackUrl: 'https://spx.vn/' },
  { id: 'Express2H', name: 'Hỏa Tốc Nội Thành 2H', trackUrl: '' },
  { id: 'StorePickup', name: 'Nhận Trực Tiếp Tại Xưởng', trackUrl: '' }
];

const WRIST_SIZES = [
  '14 - 15 cm (Cổ tay nhỏ)',
  '15 - 16 cm (Tiêu chuẩn nữ)',
  '16 - 17 cm (Tiêu chuẩn nam/nữ đầy)',
  '17 - 18 cm (Cổ tay lớn)',
  'Tùy chỉnh theo yêu cầu'
];

export default function OrderManagerView({
  orders = [],
  setOrders,
  products = [],
  users = [],
  onRefresh,
  triggerToast
}) {
  // Navigation Workspace View: 'list' | 'detail' | 'edit' | 'create'
  const [workspaceView, setWorkspaceView] = useState('list');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Selected Order & Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [copiedPhoneId, setCopiedPhoneId] = useState(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // POS Product Filter inside Create Workspace
  const [posSearch, setPosSearch] = useState('');
  const [posCategory, setPosCategory] = useState('all');

  // Edit Order Form State
  const [editFormData, setEditFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    note: '',
    trackingCode: '',
    carrier: 'GHTK',
    paymentStatus: 'Chờ thanh toán',
    paymentMethod: 'VietQR',
    orderStatus: 'Chờ xác nhận',
    shippingFee: 25000,
    totalAmount: 0,
    items: []
  });

  // Create Order Form State (Admin POS)
  const [createFormData, setCreateFormData] = useState({
    customerName: '',
    phone: '',
    address: 'Mua trực tiếp tại xưởng / Hà Nội',
    note: 'Đơn tạo bởi nhân viên quản trị tại quầy',
    paymentMethod: 'Tiền mặt',
    paymentStatus: 'Đã thanh toán',
    orderStatus: 'Chờ xác nhận',
    shippingFee: 0,
    carrier: 'StorePickup',
    selectedItems: []
  });

  // Copy phone helper
  const handleCopyPhone = (id, phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  // Copy tracking code helper
  const handleCopyTracking = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // KPIs Calculations
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const totalRev = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const inProgressCount = orders.filter(
      o => o.orderStatus === 'Chờ xác nhận' || o.orderStatus === 'Đang kết hạt thủ công'
    ).length;
    const completedCount = orders.filter(
      o => o.orderStatus === 'Đã giao hàng' || o.orderStatus === 'Đang giao hàng'
    ).length;
    const paidCount = orders.filter(
      o => o.paymentStatus === 'Đã thanh toán'
    ).length;
    const wholesaleCount = orders.filter(
      o => (o.items?.some(it => it.isWholesale || it.quantity >= 5) || o.items?.reduce((s, i) => s + (i.quantity || 1), 0) >= 5)
    ).length;
    const customCount = orders.filter(
      o => o.items?.some(it => it.isCustom)
    ).length;

    return {
      totalCount,
      totalRev,
      inProgressCount,
      completedCount,
      paidCount,
      wholesaleCount,
      customCount
    };
  }, [orders]);

  // Filtered Orders for Table List
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = o.id && o.id.toLowerCase().includes(q);
        const matchName = o.customerName && o.customerName.toLowerCase().includes(q);
        const matchPhone = o.phone && o.phone.includes(q);
        const matchAddress = o.address && o.address.toLowerCase().includes(q);
        const matchTracking = o.trackingCode && o.trackingCode.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchPhone && !matchAddress && !matchTracking) return false;
      }

      // Status
      if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;

      // Payment
      if (paymentFilter === 'paid' && o.paymentStatus !== 'Đã thanh toán') return false;
      if (paymentFilter === 'unpaid' && o.paymentStatus === 'Đã thanh toán') return false;

      // Type
      if (typeFilter === 'wholesale') {
        const isWs = o.items?.some(it => it.isWholesale || it.quantity >= 5) || o.items?.reduce((s, i) => s + (i.quantity || 1), 0) >= 5;
        if (!isWs) return false;
      } else if (typeFilter === 'custom') {
        const isCust = o.items?.some(it => it.isCustom);
        if (!isCust) return false;
      } else if (typeFilter === 'retail') {
        const isWs = o.items?.some(it => it.isWholesale || it.quantity >= 5) || o.items?.reduce((s, i) => s + (i.quantity || 1), 0) >= 5;
        if (isWs) return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter, typeFilter]);

  // Quick Status Update
  const handleQuickStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await api.updateOrderStatus(orderId, { orderStatus: newStatus });
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(res.data);
        }
        triggerToast?.(`Đã chuyển đơn #${orderId} sang "${newStatus}"`, 'success');
      }
    } catch (err) {
      triggerToast?.('Lỗi cập nhật trạng thái: ' + err.message, 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Quick Payment Toggle
  const handleTogglePayment = async (order) => {
    const newStatus = order.paymentStatus === 'Đã thanh toán' ? 'Chờ thanh toán' : 'Đã thanh toán';
    setUpdatingOrderId(order.id);
    try {
      const res = await api.updateOrderStatus(order.id, { paymentStatus: newStatus });
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === order.id ? res.data : o));
        if (selectedOrder && selectedOrder.id === order.id) {
          setSelectedOrder(res.data);
        }
        triggerToast?.(`Đã cập nhật thanh toán đơn #${order.id} sang "${newStatus}"`, 'success');
      }
    } catch (err) {
      triggerToast?.('Lỗi cập nhật thanh toán: ' + err.message, 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Open Detail Workspace (Dedicated View)
  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setWorkspaceView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Edit Workspace (Dedicated View)
  const handleOpenEdit = (order) => {
    setSelectedOrder(order);
    setEditFormData({
      customerName: order.customerName || '',
      phone: order.phone || '',
      address: order.address || '',
      note: order.note || '',
      trackingCode: order.trackingCode || '',
      carrier: order.carrier || 'GHTK',
      paymentStatus: order.paymentStatus || 'Chờ thanh toán',
      paymentMethod: order.paymentMethod || 'VietQR',
      orderStatus: order.orderStatus || 'Chờ xác nhận',
      shippingFee: order.shippingFee || 25000,
      totalAmount: order.totalAmount || 0,
      items: Array.isArray(order.items) ? JSON.parse(JSON.stringify(order.items)) : []
    });
    setWorkspaceView('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Create Workspace (Dedicated View)
  const handleOpenCreate = () => {
    setCreateFormData({
      customerName: '',
      phone: '',
      address: 'Mua trực tiếp tại xưởng / Hà Nội',
      note: 'Đơn tạo bởi nhân viên quản trị tại quầy',
      paymentMethod: 'Tiền mặt',
      paymentStatus: 'Đã thanh toán',
      orderStatus: 'Chờ xác nhận',
      shippingFee: 0,
      carrier: 'StorePickup',
      selectedItems: []
    });
    setWorkspaceView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Edit Order
  const handleSaveEditOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSaving(true);
    try {
      const res = await api.updateOrder(selectedOrder.id, editFormData);
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? res.data : o));
        setSelectedOrder(res.data);
        triggerToast?.(`Đã lưu thành công các thay đổi cho đơn #${selectedOrder.id}`, 'success');
        setWorkspaceView('detail');
      }
    } catch (err) {
      triggerToast?.('Lỗi cập nhật đơn hàng: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // In-App Confirm & Execute Delete Order
  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteOrder(orderToDelete.id);
      if (res.success) {
        setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
        triggerToast?.(`Đã xóa vĩnh viễn đơn hàng #${orderToDelete.id}`, 'success');
        setOrderToDelete(null);
        if (workspaceView === 'detail' || workspaceView === 'edit') {
          setWorkspaceView('list');
        }
      }
    } catch (err) {
      triggerToast?.('Lỗi xóa đơn hàng: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Print Invoice Modal
  const handleOpenPrint = (order) => {
    setSelectedOrder(order);
    setIsPrintModalOpen(true);
  };

  // Add Item to Create Order Form
  const handleAddItemToCreate = (product) => {
    const existingIndex = createFormData.selectedItems.findIndex(it => it.productId === product.id);
    if (existingIndex >= 0) {
      const updated = [...createFormData.selectedItems];
      updated[existingIndex].quantity += 1;
      setCreateFormData(prev => ({ ...prev, selectedItems: updated }));
    } else {
      const newItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        wristSize: '15 - 16 cm (Tiêu chuẩn nữ)',
        image: product.images?.[0] || '/images/products/bracelet-strawberry-quartz.webp'
      };
      setCreateFormData(prev => ({ ...prev, selectedItems: [...prev.selectedItems, newItem] }));
    }
    triggerToast?.(`Đã thêm "${product.name}" vào đơn`, 'success');
  };

  const handleRemoveItemFromCreate = (index) => {
    setCreateFormData(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.filter((_, idx) => idx !== index)
    }));
  };

  const handleUpdateItemQty = (index, delta) => {
    setCreateFormData(prev => {
      const updated = [...prev.selectedItems];
      const newQty = (updated[index].quantity || 1) + delta;
      if (newQty <= 0) return prev;
      updated[index].quantity = newQty;
      return { ...prev, selectedItems: updated };
    });
  };

  const handleUpdateItemSize = (index, size) => {
    setCreateFormData(prev => {
      const updated = [...prev.selectedItems];
      updated[index].wristSize = size;
      return { ...prev, selectedItems: updated };
    });
  };

  // Submit Create Order
  const handleSaveCreateOrder = async (e) => {
    e.preventDefault();
    if (!createFormData.selectedItems.length) {
      triggerToast?.('Vui lòng chọn ít nhất 1 sản phẩm vào đơn hàng', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const subtotal = createFormData.selectedItems.reduce(
        (sum, it) => sum + (it.price * it.quantity),
        0
      );
      const totalAmount = subtotal + Number(createFormData.shippingFee || 0);

      const payload = {
        customerName: createFormData.customerName.trim(),
        phone: createFormData.phone.trim(),
        address: createFormData.address.trim(),
        items: createFormData.selectedItems,
        totalAmount,
        shippingFee: Number(createFormData.shippingFee || 0),
        paymentMethod: createFormData.paymentMethod,
        paymentStatus: createFormData.paymentStatus,
        orderStatus: createFormData.orderStatus,
        note: createFormData.note,
        carrier: createFormData.carrier
      };

      const res = await api.createOrder(payload);
      if (res.success) {
        setOrders(prev => [res.data, ...prev]);
        setSelectedOrder(res.data);
        triggerToast?.(`Đã tạo thành công đơn hàng mới #${res.data.id}`, 'success');
        setWorkspaceView('detail');
      }
    } catch (err) {
      triggerToast?.('Lỗi tạo đơn hàng: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Products for POS catalog
  const filteredPosProducts = useMemo(() => {
    return products.filter(p => {
      if (posCategory !== 'all' && p.category !== posCategory) return false;
      if (posSearch.trim()) {
        const q = posSearch.toLowerCase();
        return (p.name && p.name.toLowerCase().includes(q)) || (p.stoneType && p.stoneType.toLowerCase().includes(q));
      }
      return true;
    });
  }, [products, posSearch, posCategory]);

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredOrders.length) {
      triggerToast?.('Không có dữ liệu đơn hàng để xuất CSV!', 'error');
      return;
    }
    const headers = ['Mã Đơn', 'Ngày Đặt', 'Khách Hàng', 'Số Điện Thoại', 'Địa Chỉ', 'Sản Phẩm Đặt', 'Tổng Tiền (VNĐ)', 'Phương Thức', 'Thanh Toán', 'Trạng Thái', 'Mã Vận Đơn'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '',
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `'${o.phone || ''}`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      `"${(o.items || []).map(i => `${i.quantity}x ${i.name}`).join('; ')}"`,
      o.totalAmount || 0,
      o.paymentMethod || '',
      o.paymentStatus || '',
      o.orderStatus || '',
      o.trackingCode || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DonHang_VongTayNhaZy_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast?.('Đã xuất thành công tệp Excel CSV danh sách đơn hàng', 'success');
  };

  // =========================================================================
  // VIEW 1: DEDICATED WORKSPACE - ORDER DETAIL (GIAO DIỆN CHI TIẾT MỚI CỨNG)
  // =========================================================================
  if (workspaceView === 'detail' && selectedOrder) {
    const currentStatusConfig = ORDER_STATUS_CONFIG[selectedOrder.orderStatus] || ORDER_STATUS_CONFIG['Chờ xác nhận'];
    const StatusIcon = currentStatusConfig.icon;
    const carrierObj = CARRIERS.find(c => c.id === selectedOrder.carrier) || CARRIERS[0];
    const subtotal = selectedOrder.items?.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0) || Number(selectedOrder.totalAmount || 0);

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Top Navigation & Action Header */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWorkspaceView('list')}
              className="p-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2E5D5] text-[#26211C] border border-[#E8DFD3] transition-all flex items-center gap-2 font-semibold text-xs cursor-pointer shadow-2xs group"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Quay Lại Danh Sách</span>
            </button>
            <div className="h-6 w-[1px] bg-[#E8DFD3] hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#8C8276] uppercase tracking-wider">Hóa Đơn Chi Tiết</span>
                <span className="font-mono text-xs font-bold text-[#B86244] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                  #{selectedOrder.id}
                </span>
              </div>
              <h2 className="font-serif-boutique text-xl sm:text-2xl font-bold text-[#26211C] mt-0.5">
                Đơn Hàng Của {selectedOrder.customerName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenPrint(selectedOrder)}
              className="px-3.5 py-2 rounded-xl border border-[#E8DFD3] bg-white text-[#26211C] hover:bg-[#FAF7F2] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4 text-[#8C8276]" />
              <span>In Vận Đơn / Hóa Đơn</span>
            </button>

            <button
              onClick={() => handleOpenEdit(selectedOrder)}
              className="px-4 py-2 rounded-xl bg-[#26211C] hover:bg-[#3D352E] text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Edit3 className="w-4 h-4 text-amber-300" />
              <span>Chỉnh Sửa Đơn Này</span>
            </button>

            <button
              onClick={() => setOrderToDelete(selectedOrder)}
              className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
              title="Xóa đơn hàng này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Order Status Stepper Pipeline */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EAE1] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-[#8C8276] uppercase tracking-wider">Tiến Trình Xử Lý:</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentStatusConfig.bg}`}>
                <span className={`w-2 h-2 rounded-full ${currentStatusConfig.dot}`} />
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{selectedOrder.orderStatus}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8C8276]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Đặt ngày: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : 'Mới đặt'}</span>
            </div>
          </div>

          {/* Stepper Buttons (1-click transition) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
            {['Chờ xác nhận', 'Đang kết hạt thủ công', 'Đang giao hàng', 'Đã giao hàng'].map((st, idx) => {
              const cfg = ORDER_STATUS_CONFIG[st];
              const StepIcon = cfg.icon;
              const isCurrent = selectedOrder.orderStatus === st;
              const isPast = cfg.step <= currentStatusConfig.step && selectedOrder.orderStatus !== 'Đã hủy';

              return (
                <button
                  key={st}
                  disabled={updatingOrderId === selectedOrder.id}
                  onClick={() => handleQuickStatusChange(selectedOrder.id, st)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isCurrent
                      ? 'bg-gradient-to-br from-[#B86244] to-[#A05237] text-white border-[#B86244] shadow-sm'
                      : isPast
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                        : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#6B6258] hover:bg-white hover:border-[#B86244]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      Bước {idx + 1}
                    </span>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold block">{st}</span>
                  {isCurrent && (
                    <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full mt-1 font-semibold w-fit">
                      Đang ở bước này
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Customer Details, Items Table & Finance Breakdown (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Khách hàng & Giao hàng */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] flex items-center gap-2 border-b border-[#F0EAE1] pb-3">
                <User className="w-4 h-4 text-[#B86244]" />
                <span>Thông Tin Người Nhận & Địa Chỉ</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[11px] text-[#8C8276] font-semibold block">Họ và tên khách hàng:</span>
                  <p className="font-bold text-sm text-[#26211C]">{selectedOrder.customerName}</p>
                  {selectedOrder.userId && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                      <UserCheck className="w-3 h-3" /> Thành viên ({selectedOrder.userId})
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-[#8C8276] font-semibold block">Số điện thoại nhận hàng:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#B86244]">{selectedOrder.phone}</span>
                    <button
                      onClick={() => handleCopyPhone(selectedOrder.id, selectedOrder.phone)}
                      className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2E5D5] text-[#26211C] border border-[#E8DFD3] transition-colors"
                      title="Sao chép số điện thoại"
                    >
                      {copiedPhoneId === selectedOrder.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <a
                      href={`tel:${selectedOrder.phone}`}
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                      title="Gọi điện ngay"
                    >
                      <Phone className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1 pt-1 border-t border-[#F0EAE1]">
                  <span className="text-[11px] text-[#8C8276] font-semibold block flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B86244]" /> Địa chỉ giao nhận:
                  </span>
                  <p className="font-medium text-xs text-[#26211C] bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFD3] leading-relaxed">
                    {selectedOrder.address}
                  </p>
                </div>

                {selectedOrder.note && (
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-[11px] text-amber-800 font-semibold block flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Ghi chú từ khách hàng:
                    </span>
                    <p className="text-xs text-amber-900 bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 leading-relaxed italic">
                      "{selectedOrder.note}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Danh sách các mẫu vòng tay đặt */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
                <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#B86244]" />
                  <span>Sản Phẩm Trong Đơn Hàng ({selectedOrder.items?.length || 0})</span>
                </h3>
                <span className="text-xs text-[#8C8276]">
                  Tổng số lượng: <strong className="text-[#26211C]">{selectedOrder.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0} món</strong>
                </span>
              </div>

              <div className="divide-y divide-[#F0EAE1]">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex items-start gap-3.5">
                    <img
                      src={item.image || '/images/products/bracelet-strawberry-quartz.webp'}
                      alt={item.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#E8DFD3] shrink-0 shadow-2xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="font-bold text-xs text-[#26211C] leading-snug">{item.name}</h4>
                        <span className="font-bold text-xs text-[#B86244] shrink-0 font-mono">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#8C8276]">
                        <span>Đơn giá: <strong className="text-[#26211C]">{new Intl.NumberFormat('vi-VN').format(item.price)}đ</strong></span>
                        <span>•</span>
                        <span>Số lượng: <strong className="text-[#26211C]">{item.quantity}</strong></span>
                        {item.wristSize && (
                          <>
                            <span>•</span>
                            <span className="text-[#B86244] font-semibold">Size: {item.wristSize}</span>
                          </>
                        )}
                      </div>

                      {item.isCustom && item.customDetails && (
                        <div className="mt-1.5 p-2 bg-purple-50/70 rounded-xl border border-purple-200 text-[10px] text-purple-900 space-y-0.5">
                          <p><strong>Dây đan:</strong> {item.customDetails.cord || 'Macrame'}</p>
                          <p><strong>Charm đính:</strong> {item.customDetails.charm || 'Hoa gốm thủ công'}</p>
                          {item.customDetails.engravedLetter && (
                            <p><strong>Khắc chữ:</strong> "{item.customDetails.engravedLetter}"</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Chi tiết tài chính & Chiết khấu */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-3 text-xs">
              <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] border-b border-[#F0EAE1] pb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#B86244]" />
                <span>Bảng Kê Tài Chính & Thanh Toán</span>
              </h3>

              <div className="space-y-2 text-[#6B6258] pt-1">
                <div className="flex justify-between">
                  <span>Tạm tính tiền hàng:</span>
                  <span className="font-mono font-semibold text-[#26211C]">{new Intl.NumberFormat('vi-VN').format(subtotal)}đ</span>
                </div>

                {Number(selectedOrder.wholesaleDiscount || 0) > 0 && (
                  <div className="flex justify-between text-[#2E583A] font-semibold">
                    <span>Chiết khấu đơn sỉ (Wholesale):</span>
                    <span className="font-mono">-{new Intl.NumberFormat('vi-VN').format(selectedOrder.wholesaleDiscount)}đ</span>
                  </div>
                )}

                {Number(selectedOrder.voucherDiscount || 0) > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Mã giảm giá ưu đãi:</span>
                    <span className="font-mono">-{new Intl.NumberFormat('vi-VN').format(selectedOrder.voucherDiscount)}đ</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Phí vận chuyển bưu cục:</span>
                  <span className="font-mono font-semibold text-[#26211C]">
                    {Number(selectedOrder.shippingFee || 0) === 0 ? 'Miễn phí (0đ)' : `${new Intl.NumberFormat('vi-VN').format(selectedOrder.shippingFee)}đ`}
                  </span>
                </div>

                <div className="pt-3 border-t-2 border-[#26211C] flex items-baseline justify-between text-base">
                  <span className="font-bold text-[#26211C] font-serif-boutique text-lg">TỔNG TIỀN THANH TOÁN:</span>
                  <span className="font-serif-boutique text-2xl font-bold text-[#B86244]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Payment, Shipping & Carrier, Timeline (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card 1: Trạng thái thanh toán */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-3.5 text-xs">
              <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] flex items-center gap-2 border-b border-[#F0EAE1] pb-3">
                <CreditCard className="w-4 h-4 text-[#B86244]" />
                <span>Thanh Toán Đơn Hàng</span>
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#8C8276]">Hình thức:</span>
                  <span className="font-bold text-[#26211C] bg-[#FAF7F2] px-2.5 py-1 rounded-xl border border-[#E8DFD3]">
                    {selectedOrder.paymentMethod || 'VietQR'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8C8276]">Trạng thái hiện tại:</span>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${
                    selectedOrder.paymentStatus === 'Đã thanh toán'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>

                <button
                  disabled={updatingOrderId === selectedOrder.id}
                  onClick={() => handleTogglePayment(selectedOrder)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                    selectedOrder.paymentStatus === 'Đã thanh toán'
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${updatingOrderId === selectedOrder.id ? 'animate-spin' : ''}`} />
                  <span>
                    {selectedOrder.paymentStatus === 'Đã thanh toán'
                      ? 'Đổi sang "Chờ thanh toán (COD)"'
                      : 'Đổi sang "✓ Đã thanh toán đầy đủ"'}
                  </span>
                </button>
              </div>
            </div>

            {/* Card 2: Vận chuyển & Bưu cục */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-3.5 text-xs">
              <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] flex items-center gap-2 border-b border-[#F0EAE1] pb-3">
                <Truck className="w-4 h-4 text-[#B86244]" />
                <span>Vận Chuyển & Giao Hàng</span>
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#8C8276]">Bưu cục đối tác:</span>
                  <strong className="text-[#26211C]">{carrierObj.name}</strong>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8C8276] block">Mã vận đơn bưu cục (Tracking code):</span>
                  {selectedOrder.trackingCode ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#26211C] bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#E8DFD3] flex-1 truncate">
                        {selectedOrder.trackingCode}
                      </span>
                      <button
                        onClick={() => handleCopyTracking(selectedOrder.trackingCode)}
                        className="p-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#26211C] border border-[#E8DFD3]"
                        title="Sao chép mã"
                      >
                        {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      {carrierObj.trackUrl && (
                        <a
                          href={`${carrierObj.trackUrl}${selectedOrder.trackingCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1"
                          title="Mở trang tra cứu bưu cục"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-dashed border-[#E8DFD3] text-center text-[#8C8276]">
                      <span>Chưa có mã vận đơn bưu cục. Bấm "Chỉnh sửa đơn" để cập nhật.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card 3: Lịch sử hành trình (Timeline) */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-3.5 text-xs">
              <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] flex items-center gap-2 border-b border-[#F0EAE1] pb-3">
                <Clock className="w-4 h-4 text-[#B86244]" />
                <span>Nhật Ký Hành Trình Đơn Hàng</span>
              </h3>

              <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8DFD3]">
                {Array.isArray(selectedOrder.timeline) && selectedOrder.timeline.length > 0 ? (
                  selectedOrder.timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-6 text-[11px]">
                      <span className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white border-2 border-[#B86244] flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B86244]" />
                      </span>
                      <p className="font-bold text-[#26211C]">{item.status || item.title || 'Cập nhật trạng thái'}</p>
                      <span className="text-[10px] text-[#8C8276]">{item.time || item.createdAt}</span>
                    </div>
                  ))
                ) : (
                  <div className="relative pl-6 text-[11px]">
                    <span className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white border-2 border-emerald-500" />
                    <p className="font-bold text-[#26211C]">Đơn hàng được khởi tạo thành công</p>
                    <span className="text-[10px] text-[#8C8276]">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : 'Gần đây'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal (In-App) */}
        {orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-3xl border border-[#E8DFD3] shadow-2xl p-6 space-y-4 animate-scaleIn">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-serif-boutique text-xl font-bold text-[#26211C]">
                  Xác Nhận Xóa Đơn Hàng?
                </h3>
                <p className="text-xs text-[#6B6258] leading-relaxed">
                  Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng <strong className="text-[#26211C]">#{orderToDelete.id}</strong> của khách hàng <strong className="text-[#26211C]">{orderToDelete.customerName}</strong>?
                </p>
                <p className="text-[11px] text-red-600 font-semibold mt-1">
                  Thao tác này sẽ xóa toàn bộ dữ liệu đơn hàng và không thể hoàn tác!
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-[#F0EAE1]">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DFD3] text-[#6B6258] hover:bg-[#FAF7F2] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Xác Nhận Xóa</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DEDICATED WORKSPACE - EDIT ORDER (GIAO DIỆN CHỈNH SỬA MỚI CỨNG)
  // =========================================================================
  if (workspaceView === 'edit' && selectedOrder) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Top Header */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWorkspaceView('detail')}
              className="p-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2E5D5] text-[#26211C] border border-[#E8DFD3] transition-all flex items-center gap-2 font-semibold text-xs cursor-pointer shadow-2xs group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Hủy & Quay Lại</span>
            </button>
            <div className="h-6 w-[1px] bg-[#E8DFD3] hidden sm:block" />
            <div>
              <span className="text-[11px] font-bold text-[#8C8276] uppercase tracking-wider">Chế Độ Chỉnh Sửa</span>
              <h2 className="font-serif-boutique text-xl sm:text-2xl font-bold text-[#26211C]">
                Cập Nhật Đơn Hàng #{selectedOrder.id}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWorkspaceView('detail')}
              className="px-4 py-2 rounded-xl border border-[#E8DFD3] text-[#6B6258] font-semibold text-xs hover:bg-[#FAF7F2] transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveEditOrder}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#B86244] to-[#A05237] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:brightness-105 transition-all cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Lưu Thay Đổi Đơn Hàng</span>
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveEditOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Left Column: Customer & Delivery Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] border-b border-[#F0EAE1] pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#B86244]" />
                <span>1. Thông Tin Khách Hàng & Giao Nhận</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Tên khách nhận hàng: *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.customerName}
                    onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-medium focus:outline-none focus:border-[#B86244]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Số điện thoại liên hệ: *</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-mono font-bold focus:outline-none focus:border-[#B86244]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#26211C] block mb-1">Địa chỉ nhận hàng chi tiết: *</label>
                <textarea
                  rows={3}
                  required
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] leading-relaxed focus:outline-none focus:border-[#B86244]"
                />
              </div>

              <div>
                <label className="font-bold text-[#26211C] block mb-1">Ghi chú từ khách hàng / Dặn dò xưởng đan vòng:</label>
                <textarea
                  rows={2}
                  value={editFormData.note}
                  onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none focus:border-[#B86244]"
                />
              </div>
            </div>

            {/* Items in order */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] border-b border-[#F0EAE1] pb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#B86244]" />
                <span>2. Danh Sách Sản Phẩm ({editFormData.items?.length || 0})</span>
              </h3>

              <div className="divide-y divide-[#F0EAE1]">
                {editFormData.items?.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#26211C] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#8C8276]">
                        Đơn giá: {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                        {item.wristSize && ` | Size: ${item.wristSize}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-[#E8DFD3] rounded-lg overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...editFormData.items];
                            if (updated[idx].quantity > 1) {
                              updated[idx].quantity -= 1;
                              const newTotal = updated.reduce((s, it) => s + (it.price * it.quantity), 0) + Number(editFormData.shippingFee || 0);
                              setEditFormData({ ...editFormData, items: updated, totalAmount: newTotal });
                            }
                          }}
                          className="px-2 py-1 text-xs hover:bg-stone-100"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-1 font-bold text-xs text-[#26211C] font-mono">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...editFormData.items];
                            updated[idx].quantity += 1;
                            const newTotal = updated.reduce((s, it) => s + (it.price * it.quantity), 0) + Number(editFormData.shippingFee || 0);
                            setEditFormData({ ...editFormData, items: updated, totalAmount: newTotal });
                          }}
                          className="px-2 py-1 text-xs hover:bg-stone-100"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold font-mono text-[#B86244] w-24 text-right">
                        {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}đ
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editFormData.items.filter((_, i) => i !== idx);
                          const newTotal = updated.reduce((s, it) => s + (it.price * it.quantity), 0) + Number(editFormData.shippingFee || 0);
                          setEditFormData({ ...editFormData, items: updated, totalAmount: newTotal });
                        }}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        title="Xóa món"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Status, Logistics & Pricing */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] border-b border-[#F0EAE1] pb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#B86244]" />
                <span>3. Trạng Thái & Vận Chuyển</span>
              </h3>

              <div className="space-y-3.5">
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Trạng thái đơn hàng:</label>
                  <select
                    value={editFormData.orderStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, orderStatus: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-bold text-[#26211C] focus:outline-none"
                  >
                    {Object.keys(ORDER_STATUS_CONFIG).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Đơn vị vận chuyển (Carrier):</label>
                  <select
                    value={editFormData.carrier}
                    onChange={(e) => setEditFormData({ ...editFormData, carrier: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-semibold text-[#26211C]"
                  >
                    {CARRIERS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Mã vận đơn bưu cục (Tracking Code):</label>
                  <input
                    type="text"
                    placeholder="VD: GHTK123456789 hoặc SPX..."
                    value={editFormData.trackingCode}
                    onChange={(e) => setEditFormData({ ...editFormData, trackingCode: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Payment settings */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] border-b border-[#F0EAE1] pb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#B86244]" />
                <span>4. Thanh Toán & Tiền Hàng</span>
              </h3>

              <div className="space-y-3.5">
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Hình thức thanh toán:</label>
                  <select
                    value={editFormData.paymentMethod}
                    onChange={(e) => setEditFormData({ ...editFormData, paymentMethod: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-semibold"
                  >
                    <option value="VietQR">Quét mã VietQR</option>
                    <option value="Tiền mặt">Tiền mặt tại quầy</option>
                    <option value="Chuyển khoản">Chuyển khoản trực tiếp</option>
                    <option value="COD">Thu hộ COD khi nhận hàng</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Trạng thái thanh toán:</label>
                  <select
                    value={editFormData.paymentStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, paymentStatus: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-bold"
                  >
                    <option value="Chờ thanh toán">⏳ Chờ thanh toán</option>
                    <option value="Đã thanh toán">✓ Đã thanh toán</option>
                    <option value="Đã cọc 50%">Đã đặt cọc 50%</option>
                    <option value="Đã hoàn tiền">Đã hoàn tiền</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#26211C] block mb-1">Phí ship (đ):</label>
                    <input
                      type="number"
                      value={editFormData.shippingFee}
                      onChange={(e) => {
                        const fee = Number(e.target.value);
                        const sub = editFormData.items.reduce((s, it) => s + (it.price * it.quantity), 0);
                        setEditFormData({ ...editFormData, shippingFee: fee, totalAmount: sub + fee });
                      }}
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#26211C] block mb-1">Tổng tiền (đ):</label>
                    <input
                      type="number"
                      value={editFormData.totalAmount}
                      onChange={(e) => setEditFormData({ ...editFormData, totalAmount: Number(e.target.value) })}
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-mono font-bold text-[#B86244]"
                    />
                  </div>
                </div>

                <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200 flex items-center justify-between">
                  <span className="font-bold text-xs text-[#6B6258]">Tổng thực thu:</span>
                  <span className="font-serif-boutique text-xl font-bold text-[#B86244]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(editFormData.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom save bar */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setWorkspaceView('detail')}
                className="px-5 py-3 rounded-2xl border border-[#E8DFD3] text-[#6B6258] hover:bg-[#FAF7F2] font-semibold transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-2xl bg-[#26211C] hover:bg-[#3D352E] text-white font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-emerald-400" />}
                <span>Lưu Thay Đổi Đơn Hàng</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: DEDICATED WORKSPACE - CREATE ORDER (GIAO DIỆN TẠO ĐƠN POS MỚI CỨNG)
  // =========================================================================
  if (workspaceView === 'create') {
    const subtotal = createFormData.selectedItems.reduce(
      (sum, it) => sum + (it.price * it.quantity),
      0
    );
    const totalAmount = subtotal + Number(createFormData.shippingFee || 0);

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Top Header */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWorkspaceView('list')}
              className="p-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2E5D5] text-[#26211C] border border-[#E8DFD3] transition-all flex items-center gap-2 font-semibold text-xs cursor-pointer shadow-2xs group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Quay Lại Danh Sách</span>
            </button>
            <div className="h-6 w-[1px] bg-[#E8DFD3] hidden sm:block" />
            <div>
              <span className="text-[11px] font-bold text-[#8C8276] uppercase tracking-wider">POS Xưởng / Hotline / Quầy</span>
              <h2 className="font-serif-boutique text-xl sm:text-2xl font-bold text-[#26211C]">
                Tạo Đơn Hàng Mới Cho Khách
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWorkspaceView('list')}
              className="px-4 py-2 rounded-xl border border-[#E8DFD3] text-[#6B6258] font-semibold text-xs hover:bg-[#FAF7F2]"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveCreateOrder}
              disabled={isSaving || !createFormData.selectedItems.length}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#B86244] to-[#A05237] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Xác Nhận Tạo Đơn Hàng</span>
            </button>
          </div>
        </div>

        {/* 2-Column POS Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* LEFT: Product Catalog Picker (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#B86244]" />
                  <span>Kho Sản Phẩm Vòng Tay Có Sẵn ({filteredPosProducts.length})</span>
                </h3>

                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-[#8C8276] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm tên vòng, charm, đá..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    className="w-full text-xs bg-[#FAF7F2] pl-8 pr-3 py-1.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { id: 'all', name: 'Tất Cả' },
                  { id: 'guong-dinh', name: '🪞 Gương Đính' },
                  { id: 'macrame-pastel', name: '🌸 Macrame' },
                  { id: 'vong-doi', name: '💞 Vòng Đôi' },
                  { id: 'day-do-may-man', name: '🧧 Chỉ Đỏ' },
                  { id: 'day-chuyen-vintage', name: '📿 Dây Chuyền' },
                  { id: 'day-lua-co-phong', name: '🎋 Dây Lụa' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPosCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      posCategory === cat.id
                        ? 'bg-[#B86244] text-white shadow-xs'
                        : 'bg-[#FAF7F2] text-[#6B6258] hover:bg-white border border-[#E8DFD3]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
                {filteredPosProducts.map(p => {
                  const isAdded = createFormData.selectedItems.some(it => it.productId === p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleAddItemToCreate(p)}
                      className="p-3 bg-[#FAF7F2] hover:bg-white rounded-2xl border border-[#E8DFD3] hover:border-[#B86244] transition-all cursor-pointer flex gap-3 group relative shadow-2xs hover:shadow-sm"
                    >
                      <img
                        src={p.images?.[0] || '/images/products/bracelet-strawberry-quartz.webp'}
                        alt={p.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#E8DFD3] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-[#26211C] group-hover:text-[#B86244] line-clamp-2 leading-snug">
                          {p.name}
                        </h4>
                        <p className="font-bold font-mono text-[#B86244] mt-1 text-xs">
                          {new Intl.NumberFormat('vi-VN').format(p.price)}đ
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-[#8C8276] mt-1">
                          <span>Tồn: <strong className="text-emerald-700">{p.stock || 20}</strong></span>
                          <span className="text-[#B86244] font-bold group-hover:underline flex items-center gap-0.5">
                            <Plus className="w-3 h-3" /> Thêm
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Order Form & Cart (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <form onSubmit={handleSaveCreateOrder} className="space-y-4">
              {/* Selected Cart Items */}
              <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2.5">
                  <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#B86244]" />
                    <span>Món Đã Chọn ({createFormData.selectedItems.length})</span>
                  </h3>
                  {createFormData.selectedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCreateFormData(prev => ({ ...prev, selectedItems: [] }))}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Xóa hết
                    </button>
                  )}
                </div>

                {createFormData.selectedItems.length === 0 ? (
                  <div className="py-8 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E8DFD3] text-[#8C8276]">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-1.5 opacity-40 text-[#B86244]" />
                    <p className="font-medium text-xs">Chưa có sản phẩm nào trong đơn</p>
                    <p className="text-[10px] text-[#A09587] mt-0.5">Bấm chọn các sản phẩm từ danh mục bên trái để thêm</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {createFormData.selectedItems.map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3] space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-xs text-[#26211C] line-clamp-1">{item.name}</p>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromCreate(idx)}
                            className="text-red-500 hover:text-red-700 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <select
                            value={item.wristSize}
                            onChange={(e) => handleUpdateItemSize(idx, e.target.value)}
                            className="text-[10px] bg-white px-2 py-1 rounded-lg border border-[#E8DFD3] text-[#26211C]"
                          >
                            {WRIST_SIZES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white border border-[#E8DFD3] rounded-lg">
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQty(idx, -1)}
                                className="px-2 py-0.5 text-xs hover:bg-stone-100"
                              >
                                -
                              </button>
                              <span className="px-2 font-bold font-mono text-xs">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQty(idx, 1)}
                                className="px-2 py-0.5 text-xs hover:bg-stone-100"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-bold font-mono text-[#B86244] text-xs">
                              {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Information Card */}
              <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-3.5">
                <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] border-b border-[#F0EAE1] pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#B86244]" />
                  <span>Thông Tin Khách Hàng</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-[#26211C] block mb-1">Tên khách hàng: *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Khánh Vy"
                      value={createFormData.customerName}
                      onChange={(e) => setCreateFormData({ ...createFormData, customerName: e.target.value })}
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#26211C] block mb-1">Số điện thoại: *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0988668899"
                      value={createFormData.phone}
                      onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-[#26211C] block">Địa chỉ nhận hàng: *</label>
                      <button
                        type="button"
                        onClick={() => setCreateFormData({ ...createFormData, address: 'Mua trực tiếp tại xưởng / Hà Nội', shippingFee: 0 })}
                        className="text-[10px] text-[#B86244] font-semibold hover:underline"
                      >
                        Khách mua tại quầy
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Địa chỉ nhà hoặc Mua tại xưởng"
                      value={createFormData.address}
                      onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment & Shipping Method */}
              <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-3.5">
                <h3 className="font-serif-boutique text-lg font-bold text-[#26211C] border-b border-[#F0EAE1] pb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#B86244]" />
                  <span>Thanh Toán & Vận Chuyển</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#26211C] block mb-1">Phương thức:</label>
                    <select
                      value={createFormData.paymentMethod}
                      onChange={(e) => setCreateFormData({ ...createFormData, paymentMethod: e.target.value })}
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-semibold"
                    >
                      <option value="Tiền mặt">Tiền mặt tại quầy</option>
                      <option value="VietQR">Quét mã VietQR</option>
                      <option value="Chuyển khoản">Chuyển khoản</option>
                      <option value="COD">Thu COD khi nhận</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#26211C] block mb-1">Trạng thái:</label>
                    <select
                      value={createFormData.paymentStatus}
                      onChange={(e) => setCreateFormData({ ...createFormData, paymentStatus: e.target.value })}
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-bold"
                    >
                      <option value="Đã thanh toán">✓ Đã thanh toán</option>
                      <option value="Chờ thanh toán">⏳ Chờ thanh toán</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#26211C] block mb-1">Đơn vị vận chuyển:</label>
                    <select
                      value={createFormData.carrier}
                      onChange={(e) => setCreateFormData({ ...createFormData, carrier: e.target.value })}
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-semibold"
                    >
                      {CARRIERS.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#26211C] block mb-1">Phí vận chuyển (đ):</label>
                    <input
                      type="number"
                      value={createFormData.shippingFee}
                      onChange={(e) => setCreateFormData({ ...createFormData, shippingFee: Number(e.target.value) })}
                      className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Ghi chú nội bộ đơn hàng:</label>
                  <textarea
                    rows={2}
                    value={createFormData.note}
                    onChange={(e) => setCreateFormData({ ...createFormData, note: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2 rounded-xl border border-[#E8DFD3] focus:outline-none"
                  />
                </div>

                {/* Total Summary */}
                <div className="p-4 bg-orange-50/80 rounded-2xl border border-orange-200 space-y-1.5">
                  <div className="flex justify-between text-[#6B6258] text-[11px]">
                    <span>Tiền hàng ({createFormData.selectedItems.length} món):</span>
                    <span className="font-mono">{new Intl.NumberFormat('vi-VN').format(subtotal)}đ</span>
                  </div>
                  <div className="flex justify-between text-[#6B6258] text-[11px]">
                    <span>Phí ship:</span>
                    <span className="font-mono">{new Intl.NumberFormat('vi-VN').format(createFormData.shippingFee || 0)}đ</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-orange-200">
                    <span className="font-bold text-xs text-[#26211C]">Tổng tiền thanh toán:</span>
                    <span className="font-serif-boutique text-xl font-bold text-[#B86244]">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving || !createFormData.selectedItems.length}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#B86244] to-[#A05237] text-white font-bold text-xs shadow-sm hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Xác Nhận Tạo Đơn Hàng Mới</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 0: MAIN DASHBOARD & TABLE LIST VIEW (MẶC ĐỊNH)
  // =========================================================================
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── 1. TOP STATS BAR ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD3] shadow-sm relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-[#B86244]/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C8276] uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#B86244] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-[#B86244] mt-2 block">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRev)}
          </span>
          <div className="flex items-center justify-between text-[10px] text-[#6B6258] mt-1.5 pt-1.5 border-t border-[#F0EAE1]">
            <span>Đã thu tiền:</span>
            <strong className="text-emerald-700">{stats.paidCount} / {stats.totalCount} đơn</strong>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD3] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C8276] uppercase tracking-wider">Tổng Số Đơn Hàng</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-[#26211C] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-[#26211C] mt-2 block">
            {stats.totalCount} đơn
          </span>
          <div className="flex items-center gap-2 text-[10px] mt-1.5 pt-1.5 border-t border-[#F0EAE1]">
            <span className="bg-[#2E583A]/10 text-[#2E583A] font-bold px-1.5 py-0.5 rounded">{stats.wholesaleCount} đơn sỉ</span>
            <span className="bg-[#B86244]/10 text-[#B86244] font-bold px-1.5 py-0.5 rounded">{stats.customCount} tự phối</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD3] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C8276] uppercase tracking-wider">Đang Xâu & Hoàn Thiện</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-amber-600 mt-2 block">
            {stats.inProgressCount} đơn
          </span>
          <p className="text-[10px] text-[#8C8276] mt-1.5 pt-1.5 border-t border-[#F0EAE1]">
            Chờ nghệ nhân xâu hạt & chuẩn bị giao
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD3] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C8276] uppercase tracking-wider">Giao Thành Công</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-bold font-serif-boutique text-emerald-600 mt-2 block">
            {stats.completedCount} đơn
          </span>
          <p className="text-[10px] text-emerald-700 mt-1.5 pt-1.5 border-t border-[#F0EAE1] font-semibold">
            Tỷ lệ hoàn thành: {stats.totalCount > 0 ? Math.round((stats.completedCount / stats.totalCount) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* ── 2. ACTION BAR & ADVANCED FILTERS ── */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-3.5">
        {/* Top button row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B86244] to-[#A05237] hover:from-[#A05237] hover:to-[#8C452D] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Đơn Hàng Mới (POS / Hotline)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl border border-[#E8DFD3] bg-white text-[#26211C] hover:bg-[#FAF7F2] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Xuất tệp CSV Excel"
            >
              <Download className="w-4 h-4 text-[#8C8276]" />
              <span className="hidden sm:inline">Xuất CSV</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8C8276] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm mã đơn DH-, tên khách, sđt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-[#FAF7F2] pl-9 pr-3 py-2 rounded-xl border border-[#E8DFD3] focus:outline-none focus:border-[#B86244]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#8C8276] hover:text-[#26211C]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0EAE1] text-xs">
          <div className="flex items-center gap-1.5 text-[#8C8276] font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc:</span>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FAF7F2] border border-[#E8DFD3] text-xs font-semibold rounded-xl px-3 py-1.5 text-[#26211C] focus:outline-none"
          >
            <option value="all">Tất cả trạng thái ({orders.length})</option>
            {Object.keys(ORDER_STATUS_CONFIG).map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#FAF7F2] border border-[#E8DFD3] text-xs font-semibold rounded-xl px-3 py-1.5 text-[#26211C] focus:outline-none"
          >
            <option value="all">Tất cả thanh toán</option>
            <option value="paid">✓ Đã thanh toán</option>
            <option value="unpaid">⏳ Chờ thanh toán / COD</option>
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#FAF7F2] border border-[#E8DFD3] text-xs font-semibold rounded-xl px-3 py-1.5 text-[#26211C] focus:outline-none"
          >
            <option value="all">Tất cả loại đơn</option>
            <option value="retail">Đơn lẻ thường</option>
            <option value="wholesale">Đơn sỉ buôn (≥5 món)</option>
            <option value="custom">Đơn tự phối charm</option>
          </select>

          <span className="text-[11px] text-[#8C8276] ml-auto">
            Hiển thị <strong className="text-[#26211C]">{filteredOrders.length}</strong> / {orders.length} đơn
          </span>
        </div>
      </div>

      {/* ── 3. MAIN ORDERS TABLE ── */}
      <div className="bg-white rounded-3xl border border-[#E8DFD3] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-[#8C8276] border-b border-[#E8DFD3] uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Mã Đơn & Ngày</th>
                <th className="py-3.5 px-4">Khách Hàng & SĐT</th>
                <th className="py-3.5 px-4">Sản Phẩm Đặt</th>
                <th className="py-3.5 px-4 text-right">Tổng Tiền</th>
                <th className="py-3.5 px-4 text-center">Thanh Toán</th>
                <th className="py-3.5 px-4">Trạng Thái Đơn</th>
                <th className="py-3.5 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#8C8276]">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-[#C59B6D]/40" />
                    <p className="font-semibold text-sm text-[#26211C]">Không tìm thấy đơn hàng nào</p>
                    <p className="text-xs text-[#8C8276] mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const statusCfg = ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG['Chờ xác nhận'];
                  const StatusIcon = statusCfg.icon;
                  const isWholesale = order.items?.some(it => it.isWholesale || it.quantity >= 5) || order.items?.reduce((s, i) => s + (i.quantity || 1), 0) >= 5;
                  const isCustom = order.items?.some(it => it.isCustom);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FAF7F2]/80 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(order)}
                    >
                      {/* Mã đơn & Ngày */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#B86244] block group-hover:underline">
                          #{order.id}
                        </span>
                        <span className="text-[10px] text-[#8C8276] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Mới đặt'}
                        </span>
                        {order.trackingCode && (
                          <span className="inline-block mt-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {order.trackingCode}
                          </span>
                        )}
                      </td>

                      {/* Khách hàng & SĐT */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <span className="font-bold text-[#26211C] block truncate max-w-[150px]">
                          {order.customerName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[#6B6258] text-[11px]">{order.phone}</span>
                          <button
                            onClick={() => handleCopyPhone(order.id, order.phone)}
                            className="p-1 rounded text-[#8C8276] hover:text-[#26211C] hover:bg-stone-100"
                            title="Sao chép SĐT"
                          >
                            {copiedPhoneId === order.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Sản phẩm tóm tắt */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 max-w-xs">
                          {order.items?.slice(0, 2).map((it, idx) => (
                            <span key={idx} className="truncate text-xs text-[#26211C] font-medium block">
                              • {it.quantity}x {it.name}
                            </span>
                          ))}
                          {order.items?.length > 2 && (
                            <span className="text-[10px] text-[#8C8276]">
                              +{order.items.length - 2} sản phẩm khác...
                            </span>
                          )}
                          <div className="flex items-center gap-1 mt-0.5">
                            {isWholesale && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#2E583A]/10 text-[#2E583A]">
                                Đơn Sỉ
                              </span>
                            )}
                            {isCustom && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                                Tự Phối
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold font-serif-boutique text-sm text-[#B86244] block">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                        </span>
                        <span className="text-[10px] text-[#8C8276] block">
                          {order.paymentMethod || 'VietQR'}
                        </span>
                      </td>

                      {/* Trạng thái thanh toán */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleTogglePayment(order)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-transform hover:scale-105 ${
                            order.paymentStatus === 'Đã thanh toán'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                          title="Bấm để đổi trạng thái thanh toán"
                        >
                          {order.paymentStatus === 'Đã thanh toán' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{order.paymentStatus}</span>
                        </button>
                      </td>

                      {/* Trạng thái đơn hàng */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <select
                            value={order.orderStatus}
                            disabled={updatingOrderId === order.id}
                            onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                            className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border appearance-none pr-7 cursor-pointer focus:outline-none transition-all ${statusCfg.bg}`}
                          >
                            {Object.keys(ORDER_STATUS_CONFIG).map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 pointer-events-none opacity-60" />
                        </div>
                      </td>

                      {/* Thao tác CRUD (Chuyển sang dedicated view, không notice popup) */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(order)}
                            className="p-1.5 rounded-full bg-orange-50/80 text-[#B86244] hover:bg-[#B86244] hover:text-white transition-colors cursor-pointer"
                            title="Xem chi tiết đơn hàng (Giao diện toàn diện)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenPrint(order)}
                            className="p-1.5 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
                            title="In hóa đơn & vận đơn"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(order)}
                            className="p-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                            title="Chỉnh sửa đơn hàng (Giao diện toàn diện)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setOrderToDelete(order)}
                            className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                            title="Xóa đơn hàng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── IN-APP DELETE CONFIRMATION MODAL ── */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#E8DFD3] shadow-2xl p-6 space-y-4 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif-boutique text-xl font-bold text-[#26211C]">
                Xác Nhận Xóa Đơn Hàng?
              </h3>
              <p className="text-xs text-[#6B6258] leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng <strong className="text-[#26211C]">#{orderToDelete.id}</strong> của khách hàng <strong className="text-[#26211C]">{orderToDelete.customerName}</strong>?
              </p>
              <p className="text-[11px] text-red-600 font-semibold mt-1">
                Thao tác này sẽ xóa toàn bộ chi tiết và lịch sử đơn hàng, không thể hoàn tác!
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-[#F0EAE1]">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8DFD3] text-[#6B6258] hover:bg-[#FAF7F2] font-semibold text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác Nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINT INVOICE MODAL ── */}
      {isPrintModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsPrintModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-xl rounded-3xl border border-[#E8DFD3] shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#26211C] text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 className="font-serif-boutique text-lg font-bold text-amber-200 flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  <span>PHIẾU GIAO HÀNG & HÓA ĐƠN #{selectedOrder.id}</span>
                </h3>
                <p className="text-[10px] text-[#CFC1B0]">Khổ in tiêu chuẩn A5 / Vận đơn bưu cục dán gói hàng</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Ngay</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div id="printable-invoice" className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              {/* Brand Header */}
              <div className="flex items-center justify-between border-b-2 border-stone-800 pb-3">
                <div>
                  <h2 className="font-serif-boutique text-xl font-bold text-stone-900 tracking-wider">
                    VÒNG TAY NHÀ ZY
                  </h2>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest">Xưởng Chế Tác Vòng Dây Thủ Công & Gương Đính</p>
                  <p className="text-[10px] text-stone-600 mt-0.5">Hotline: 0988.66.88.99 | www.khanhvymade.vn</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-stone-900 block">#{selectedOrder.id}</span>
                  <span className="text-[10px] text-stone-500">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                  <span className="inline-block mt-1 font-bold text-[9px] px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-300">
                    {selectedOrder.carrier || 'GHTK'}
                  </span>
                </div>
              </div>

              {/* Sender & Receiver Info */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl text-[11px]">
                <div>
                  <p className="font-bold text-stone-600 uppercase text-[9px]">Người gửi:</p>
                  <p className="font-bold text-stone-900">VÒNG TAY NHÀ ZY</p>
                  <p className="text-stone-600">0988.66.88.99</p>
                  <p className="text-stone-600">Hà Nội</p>
                </div>
                <div>
                  <p className="font-bold text-stone-600 uppercase text-[9px]">Người nhận:</p>
                  <p className="font-bold text-stone-900">{selectedOrder.customerName}</p>
                  <p className="text-stone-600 font-mono font-bold">{selectedOrder.phone}</p>
                  <p className="text-stone-600">{selectedOrder.address}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-stone-300 text-stone-600 text-[10px] uppercase">
                      <th className="py-1.5">Sản Phẩm</th>
                      <th className="py-1.5 text-center">SL</th>
                      <th className="py-1.5 text-right">Đơn Giá</th>
                      <th className="py-1.5 text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {selectedOrder.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2">
                          <p className="font-bold text-stone-900">{it.name}</p>
                          {it.wristSize && <p className="text-[10px] text-stone-500">Size tay: {it.wristSize}</p>}
                          {it.isCustom && it.customDetails && (
                            <p className="text-[9px] text-purple-700">Dây: {it.customDetails.cord} | Charm: {it.customDetails.charm}</p>
                          )}
                        </td>
                        <td className="py-2 text-center font-bold">{it.quantity}</td>
                        <td className="py-2 text-right">{new Intl.NumberFormat('vi-VN').format(it.price)}đ</td>
                        <td className="py-2 text-right font-bold">{new Intl.NumberFormat('vi-VN').format(it.price * it.quantity)}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total calculation */}
              <div className="pt-2 border-t-2 border-stone-800 space-y-1 text-right text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Phí ship:</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(selectedOrder.shippingFee || 25000)}đ</span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 pt-1">
                  <span>TIỀN THU NGƯỜI NHẬN (COD):</span>
                  <span className="text-[#B86244] font-serif-boutique text-lg">
                    {selectedOrder.paymentStatus === 'Đã thanh toán'
                      ? '0 đ (ĐÃ THANH TOÁN)'
                      : `${new Intl.NumberFormat('vi-VN').format(selectedOrder.totalAmount)} đ`}
                  </span>
                </div>
              </div>

              {/* Customer Note */}
              {selectedOrder.note && (
                <div className="p-2.5 bg-amber-50 rounded-lg text-[10px] text-amber-900 border border-amber-200">
                  <strong>Ghi chú đơn:</strong> {selectedOrder.note}
                </div>
              )}

              {/* Footer thank you */}
              <div className="text-center pt-3 border-t border-dashed border-stone-300 text-[10px] text-stone-500 space-y-0.5">
                <p className="font-semibold text-stone-700">✨ Cảm ơn bạn đã lựa chọn sản phẩm thủ công từ Vòng Tay Nhà Zy ✨</p>
                <p>Khách hàng được kiểm tra hàng trước khi thanh toán. Vui lòng quay video mở hàng để được hỗ trợ bảo hành tốt nhất.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
