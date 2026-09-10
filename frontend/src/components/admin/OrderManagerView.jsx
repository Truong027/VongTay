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
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api';

const ORDER_STATUS_CONFIG = {
  'Chờ xác nhận': {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock
  },
  'Đang kết hạt thủ công': {
    bg: 'bg-purple-50 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
    icon: Sparkles
  },
  'Đang giao hàng': {
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    icon: Truck
  },
  'Đã giao hàng': {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2
  },
  'Đã hủy': {
    bg: 'bg-red-50 text-red-800 border-red-200',
    dot: 'bg-red-500',
    icon: AlertCircle
  }
};

const CARRIERS = [
  { id: 'GHTK', name: 'Giao Hàng Tiết Kiệm (GHTK)' },
  { id: 'ViettelPost', name: 'Viettel Post' },
  { id: 'VNPost', name: 'Bưu Điện Việt Nam (VNPost)' },
  { id: 'ShopeeXpress', name: 'Shopee Xpress / SPX' },
  { id: 'Express2H', name: 'Hỏa Tốc Nội Thành 2H' },
  { id: 'StorePickup', name: 'Nhận Trực Tiếp Tại Xưởng' }
];

export default function OrderManagerView({
  orders = [],
  setOrders,
  products = [],
  users = [],
  onRefresh,
  triggerToast
}) {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

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
    totalAmount: 0
  });

  // Create Order Form State (Admin POS)
  const [createFormData, setCreateFormData] = useState({
    customerName: '',
    phone: '',
    address: 'Mua trực tiếp tại xưởng / Hà Nội',
    note: 'Đơn tạo bởi nhân viên quản trị',
    paymentMethod: 'Tiền mặt',
    paymentStatus: 'Đã thanh toán',
    orderStatus: 'Chờ xác nhận',
    shippingFee: 0,
    carrier: 'StorePickup',
    selectedItems: []
  });

  const [copiedPhoneId, setCopiedPhoneId] = useState(null);

  // Copy phone helper
  const handleCopyPhone = (id, phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
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

  // Filtered Orders
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
        triggerToast?.(`Đã chuyển đơn #${orderId} sang "${newStatus}"`);
      }
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Quick Payment Toggle
  const handleTogglePayment = async (order) => {
    const newStatus = order.paymentStatus === 'Đã thanh toán' ? 'Chờ thanh toán khi nhận hàng' : 'Đã thanh toán';
    setUpdatingOrderId(order.id);
    try {
      const res = await api.updateOrderStatus(order.id, { paymentStatus: newStatus });
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === order.id ? res.data : o));
        triggerToast?.(`Đã đổi trạng thái thanh toán đơn #${order.id} sang "${newStatus}"`);
      }
    } catch (err) {
      alert('Lỗi cập nhật thanh toán: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Open Edit Modal
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
      totalAmount: order.totalAmount || 0
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit Order
  const handleSaveEditOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await api.updateOrder(selectedOrder.id, editFormData);
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? res.data : o));
        setIsEditModalOpen(false);
        triggerToast?.(`Đã lưu thay đổi cho đơn #${selectedOrder.id}`);
      }
    } catch (err) {
      alert('Lỗi cập nhật đơn hàng: ' + err.message);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN đơn hàng #${orderId}? Thao tác này không thể hoàn tác!`)) return;
    try {
      const res = await api.deleteOrder(orderId);
      if (res.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        triggerToast?.(`Đã xóa đơn hàng #${orderId}`);
      }
    } catch (err) {
      alert('Lỗi xóa đơn hàng: ' + err.message);
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
        wristSize: '15 - 16 cm (Tiêu chuẩn)',
        image: product.images?.[0] || '/images/products/bracelet-strawberry-quartz.webp'
      };
      setCreateFormData(prev => ({ ...prev, selectedItems: [...prev.selectedItems, newItem] }));
    }
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

  // Submit Create Order
  const handleSaveCreateOrder = async (e) => {
    e.preventDefault();
    if (!createFormData.selectedItems.length) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm vào đơn hàng');
      return;
    }

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
        note: createFormData.note,
        carrier: createFormData.carrier
      };

      const res = await api.createOrder(payload);
      if (res.success) {
        setOrders(prev => [res.data, ...prev]);
        setIsCreateModalOpen(false);
        setCreateFormData({
          customerName: '',
          phone: '',
          address: 'Mua trực tiếp tại xưởng / Hà Nội',
          note: 'Đơn tạo bởi nhân viên quản trị',
          paymentMethod: 'Tiền mặt',
          paymentStatus: 'Đã thanh toán',
          orderStatus: 'Chờ xác nhận',
          shippingFee: 0,
          carrier: 'StorePickup',
          selectedItems: []
        });
        triggerToast?.(`Đã tạo thành công đơn hàng #${res.data.id}`);
      }
    } catch (err) {
      alert('Lỗi tạo đơn hàng: ' + err.message);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredOrders.length) {
      alert('Không có dữ liệu đơn hàng để xuất!');
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
  };

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
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B86244] to-[#A05237] hover:from-[#A05237] hover:to-[#8C452D] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Đơn Hàng Mới (POS / Hotline)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl border border-[#E8DFD3] bg-white text-[#26211C] hover:bg-[#FAF7F2] font-semibold text-xs flex items-center gap-1.5 transition-colors"
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
            <option value="retail">Đơn mua lẻ</option>
            <option value="wholesale">Đơn sỉ xưởng (≥5 chiếc)</option>
            <option value="custom">Đơn tự phối Studio</option>
          </select>

          {(statusFilter !== 'all' || paymentFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPaymentFilter('all');
                setTypeFilter('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-[#B86244] hover:underline font-semibold ml-auto"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* ── 3. MAIN ORDERS TABLE ── */}
      <div className="bg-white rounded-3xl border border-[#E8DFD3] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[#6B6258] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold">Mã Đơn & Thời Gian</th>
                <th className="py-3.5 px-4 font-bold">Khách Hàng Nhận</th>
                <th className="py-3.5 px-4 font-bold">Sản Phẩm & Size Tay</th>
                <th className="py-3.5 px-4 font-bold">Tổng Tiền</th>
                <th className="py-3.5 px-4 font-bold">Thanh Toán</th>
                <th className="py-3.5 px-4 font-bold">Trạng Thái Xưởng</th>
                <th className="py-3.5 px-4 font-bold">Vận Đơn</th>
                <th className="py-3.5 px-4 font-bold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#8C8276]">
                    <ShoppingBag className="w-8 h-8 text-[#CFC1B0] mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-sm text-[#26211C]">Không tìm thấy đơn hàng nào phù hợp</p>
                    <p className="text-xs text-[#8C8276] mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const isWholesale = order.items?.some(it => it.isWholesale || it.quantity >= 5) || order.items?.reduce((s, i) => s + (i.quantity || 1), 0) >= 5;
                  const isCustom = order.items?.some(it => it.isCustom);
                  const statusCfg = ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG['Chờ xác nhận'];
                  const StatusIcon = statusCfg.icon;

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF4ED]/50 transition-colors">
                      {/* Mã Đơn */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[#B86244]">#{order.id}</span>
                          {isWholesale ? (
                            <span className="inline-block text-[9px] bg-[#2E583A] text-white px-1.5 py-0.5 rounded font-sans font-bold">
                              ĐƠN SỈ
                            </span>
                          ) : isCustom ? (
                            <span className="inline-block text-[9px] bg-purple-600 text-white px-1.5 py-0.5 rounded font-sans font-bold">
                              TỰ PHỐI
                            </span>
                          ) : (
                            <span className="inline-block text-[9px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-sans font-medium">
                              ĐƠN LẺ
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] text-[#8C8276] font-normal font-sans mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                        </span>
                      </td>

                      {/* Khách Hàng */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#26211C] text-[13px]">{order.customerName}</p>
                        <div className="flex items-center gap-1 text-[11px] text-[#6B6258] mt-0.5">
                          <Phone className="w-3 h-3 text-[#8C8276]" />
                          <span>{order.phone}</span>
                          <button
                            onClick={() => handleCopyPhone(order.id, order.phone)}
                            className="text-[#8C8276] hover:text-[#B86244] p-0.5 transition-colors"
                            title="Sao chép số điện thoại"
                          >
                            {copiedPhoneId === order.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-[#8C8276] max-w-[200px] truncate mt-0.5" title={order.address}>
                          <MapPin className="w-3 h-3 inline mr-0.5 text-[#8C8276]" />
                          {order.address}
                        </p>
                      </td>

                      {/* Sản Phẩm */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-xs">
                          {order.items?.map((it, idx) => (
                            <div key={idx} className="text-[11px] text-[#26211C] leading-tight">
                              • <span className="font-bold text-[#B86244]">{it.quantity}x</span> {it.name}
                              {it.wristSize && (
                                <span className="text-[10px] text-[#8C8276] ml-1">({it.wristSize})</span>
                              )}
                              {it.isCustom && (
                                <span className="text-purple-700 font-semibold text-[10px] ml-1">[Custom]</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Tổng Tiền */}
                      <td className="py-3.5 px-4 font-bold text-[#26211C] whitespace-nowrap">
                        <span className="text-[13px] text-[#B86244]">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                        </span>
                        {Number(order.shippingFee || 0) > 0 && (
                          <span className="block text-[9px] text-[#8C8276] font-normal">
                            (Gồm ship {new Intl.NumberFormat('vi-VN').format(order.shippingFee)}đ)
                          </span>
                        )}
                      </td>

                      {/* Thanh Toán */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePayment(order)}
                          title="Bấm để chuyển nhanh trạng thái thanh toán"
                          className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold border transition-transform hover:scale-105 ${
                            order.paymentStatus === 'Đã thanh toán'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'Đã thanh toán' ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                          <span>{order.paymentStatus}</span>
                        </button>
                        <span className="block text-[10px] text-[#8C8276] mt-1 font-medium">
                          {order.paymentMethod || 'VietQR'}
                        </span>
                      </td>

                      {/* Trạng Thái Đơn */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={order.orderStatus}
                            disabled={updatingOrderId === order.id}
                            onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                            className={`text-xs font-bold rounded-xl px-2.5 py-1.5 pr-6 border focus:outline-none appearance-none cursor-pointer ${statusCfg.bg}`}
                          >
                            {Object.keys(ORDER_STATUS_CONFIG).map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2.5 pointer-events-none text-current opacity-70" />
                        </div>
                      </td>

                      {/* Vận Đơn */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {order.trackingCode ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono font-bold bg-[#FAF4ED] text-[#B86244] px-1.5 py-0.5 rounded border border-[#EADBCC] inline-block">
                              {order.trackingCode}
                            </span>
                            <span className="block text-[9px] text-[#8C8276]">
                              {order.carrier || 'GHTK'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#8C8276] italic">Chưa phát mã</span>
                        )}
                      </td>

                      {/* Thao Tác */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#FAF4ED] text-[#B86244] hover:bg-[#B86244] hover:text-white font-semibold transition-colors"
                            title="Xem chi tiết đơn hàng"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenPrint(order)}
                            className="p-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-[#26211C] hover:text-white transition-colors"
                            title="In phiếu đóng hàng"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(order)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors"
                            title="Sửa thông tin đơn hàng"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
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

      {/* ── 4. MODAL: TẠO ĐƠN HÀNG MỚI (POS / HOTLINE) ── */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl border border-[#E8DFD3] shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#26211C] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-serif-boutique text-lg font-bold text-amber-200 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>TẠO ĐƠN HÀNG MỚI (TẠI QUẦY / INBOX)</span>
                </h3>
                <p className="text-[10px] text-[#CFC1B0]">
                  Ghi nhận đơn khách mua tại quầy, nhắn tin Zalo, Facebook hoặc đặt qua Hotline
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCreateOrder} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Customer info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#26211C] block mb-1">Địa chỉ giao nhận hàng: *</label>
                <input
                  type="text"
                  required
                  placeholder="Địa chỉ nhà hoặc Mua tại xưởng"
                  value={createFormData.address}
                  onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>

              {/* Product selector */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#26211C] block">Chọn sản phẩm vào đơn:</label>
                  <span className="text-[10px] text-[#8C8276]">Đã chọn: {createFormData.selectedItems.length} món</span>
                </div>

                {/* Quick Add dropdown */}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const prod = products.find(p => p.id === e.target.value);
                      if (prod) handleAddItemToCreate(prod);
                      e.target.value = '';
                    }
                  }}
                  className="w-full bg-white p-2.5 rounded-xl border border-[#E8DFD3] font-semibold text-[#26211C]"
                >
                  <option value="">-- Bấm chọn sản phẩm từ kho --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {new Intl.NumberFormat('vi-VN').format(p.price)}đ (Kho: {p.stock || 20})
                    </option>
                  ))}
                </select>

                {/* Selected items list */}
                {createFormData.selectedItems.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {createFormData.selectedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#EADBCC]">
                        <div className="flex-1 pr-2">
                          <p className="font-bold text-[#26211C]">{item.name}</p>
                          <p className="text-[10px] text-[#B86244] font-semibold">
                            {new Intl.NumberFormat('vi-VN').format(item.price)}đ / chiếc
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-[#E8DFD3] rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(idx, -1)}
                              className="px-2 py-1 bg-stone-50 hover:bg-stone-100 font-bold"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-1 font-bold text-[#26211C]">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(idx, 1)}
                              className="px-2 py-1 bg-stone-50 hover:bg-stone-100 font-bold"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold text-[#26211C] w-20 text-right">
                            {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}đ
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromCreate(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Phương thức thanh toán:</label>
                  <select
                    value={createFormData.paymentMethod}
                    onChange={(e) => setCreateFormData({ ...createFormData, paymentMethod: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-semibold"
                  >
                    <option value="Tiền mặt">Tiền mặt tại quầy</option>
                    <option value="VietQR">Quét mã VietQR</option>
                    <option value="Chuyển khoản">Chuyển khoản ngân hàng</option>
                    <option value="COD">Thu tiền khi nhận hàng (COD)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Trạng thái thanh toán:</label>
                  <select
                    value={createFormData.paymentStatus}
                    onChange={(e) => setCreateFormData({ ...createFormData, paymentStatus: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-semibold"
                  >
                    <option value="Đã thanh toán">✓ Đã thanh toán</option>
                    <option value="Chờ thanh toán">⏳ Chờ thanh toán</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Phí vận chuyển (đ):</label>
                  <input
                    type="number"
                    value={createFormData.shippingFee}
                    onChange={(e) => setCreateFormData({ ...createFormData, shippingFee: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#26211C] block mb-1">Ghi chú đơn hàng:</label>
                <textarea
                  rows={2}
                  value={createFormData.note}
                  onChange={(e) => setCreateFormData({ ...createFormData, note: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] focus:outline-none"
                />
              </div>

              {/* Total preview */}
              <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-200 flex items-center justify-between">
                <span className="font-bold text-[#6B6258]">Tổng tiền thanh toán dự kiến:</span>
                <span className="text-lg font-bold text-[#B86244] font-serif-boutique">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    createFormData.selectedItems.reduce((sum, it) => sum + (it.price * it.quantity), 0) + Number(createFormData.shippingFee || 0)
                  )}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#F0EAE1]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E8DFD3] text-[#6B6258] font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!createFormData.selectedItems.length}
                  className="px-5 py-2.5 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold disabled:opacity-50"
                >
                  Xác Nhận Tạo Đơn Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. MODAL: CHỈNH SỬA THÔNG TIN ĐƠN HÀNG ── */}
      {isEditModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-xl rounded-3xl border border-[#E8DFD3] shadow-2xl overflow-hidden my-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#26211C] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-serif-boutique text-lg font-bold text-amber-200">
                  CHỈNH SỬA ĐƠN HÀNG #{selectedOrder.id}
                </h3>
                <p className="text-[10px] text-[#CFC1B0]">
                  Cập nhật thông tin giao nhận, mã vận đơn và trạng thái thanh toán
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOrder} className="p-5 sm:p-6 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Tên khách nhận hàng: *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.customerName}
                    onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Số điện thoại: *</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#26211C] block mb-1">Địa chỉ giao hàng: *</label>
                <input
                  type="text"
                  required
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Đơn vị vận chuyển:</label>
                  <select
                    value={editFormData.carrier}
                    onChange={(e) => setEditFormData({ ...editFormData, carrier: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-semibold"
                  >
                    {CARRIERS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Mã vận đơn (Tracking Code):</label>
                  <input
                    type="text"
                    placeholder="VD: GHTK123456789"
                    value={editFormData.trackingCode}
                    onChange={(e) => setEditFormData({ ...editFormData, trackingCode: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Trạng thái đơn hàng:</label>
                  <select
                    value={editFormData.orderStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, orderStatus: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-semibold"
                  >
                    {Object.keys(ORDER_STATUS_CONFIG).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#26211C] block mb-1">Trạng thái thanh toán:</label>
                  <select
                    value={editFormData.paymentStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, paymentStatus: e.target.value })}
                    className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3] font-semibold"
                  >
                    <option value="Chờ thanh toán khi nhận hàng">Chờ thanh toán khi nhận hàng (COD)</option>
                    <option value="Đã thanh toán">Đã thanh toán (VietQR / Chuyển khoản)</option>
                    <option value="Đã cọc 50%">Đã đặt cọc 50%</option>
                    <option value="Đã hoàn tiền">Đã hoàn tiền cho khách</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#26211C] block mb-1">Ghi chú nội bộ / dặn dò nghệ nhân:</label>
                <textarea
                  rows={2}
                  value={editFormData.note}
                  onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })}
                  className="w-full bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#F0EAE1]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E8DFD3] text-[#6B6258] font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#26211C] hover:bg-[#3D352E] text-white font-bold"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. MODAL: CHI TIẾT ĐƠN HÀNG ── */}
      {isDetailModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl border border-[#E8DFD3] shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#26211C] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#CFC1B0] uppercase tracking-wider block">Xưởng Chế Tác Vòng Tay Nhà Zy</span>
                <h3 className="font-serif-boutique text-xl font-bold text-amber-200">
                  #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Customer Box */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3] space-y-1.5">
                <p className="font-bold text-sm text-[#26211C]">{selectedOrder.customerName}</p>
                <p className="flex items-center gap-1.5 text-[#6B6258]">
                  <Phone className="w-3.5 h-3.5 text-[#B86244]" />
                  <span>{selectedOrder.phone}</span>
                </p>
                <p className="flex items-center gap-1.5 text-[#6B6258]">
                  <MapPin className="w-3.5 h-3.5 text-[#B86244]" />
                  <span>{selectedOrder.address}</span>
                </p>
                {selectedOrder.note && (
                  <p className="text-amber-800 bg-amber-50 p-2 rounded-xl text-[11px] mt-2">
                    💬 Lời nhắn: "{selectedOrder.note}"
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="font-bold text-[#26211C] block text-[11px] uppercase tracking-wider">
                  Sản phẩm trong đơn:
                </span>
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF4ED] rounded-xl border border-[#EADBCC] space-y-1">
                    <div className="flex justify-between font-semibold text-[#26211C]">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="text-[#B86244] font-bold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(it.price * it.quantity)}
                      </span>
                    </div>
                    {it.wristSize && (
                      <p className="text-[11px] text-[#6B6258]">Size tay khách: <strong>{it.wristSize}</strong></p>
                    )}
                    {it.isCustom && it.customDetails && (
                      <div className="text-[10px] text-[#6B6258] bg-white p-2 rounded-lg space-y-0.5 border border-[#E8DFD3]">
                        <p>• Dây: {it.customDetails.cord}</p>
                        <p>• Hạt: {it.customDetails.mainBead}</p>
                        <p>• Charm: {it.customDetails.charm}</p>
                        <p>• Size: {it.customDetails.size}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Payment details */}
              <div className="p-3.5 bg-white rounded-2xl border border-[#E8DFD3] space-y-1">
                <div className="flex justify-between text-[#6B6258]">
                  <span>Phí vận chuyển:</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.shippingFee || 25000)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#26211C] pt-1 border-t border-[#F0EAE1]">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#B86244]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#6B6258] pt-1">
                  <span>Hình thức:</span>
                  <span>{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</span>
                </div>
                {selectedOrder.trackingCode && (
                  <div className="flex justify-between text-[11px] text-[#26211C] pt-1">
                    <span>Mã vận đơn:</span>
                    <strong className="font-mono text-[#B86244]">{selectedOrder.trackingCode} ({selectedOrder.carrier || 'GHTK'})</strong>
                  </div>
                )}
              </div>

              {/* Timeline */}
              {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                <div>
                  <span className="font-bold text-[#26211C] block text-[11px] uppercase tracking-wider mb-2">
                    Lịch sử trạng thái đơn:
                  </span>
                  <div className="space-y-1.5">
                    {selectedOrder.timeline.map((t, idx) => (
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
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenPrint(selectedOrder);
                }}
                className="px-4 py-2 rounded-xl border border-[#E8DFD3] bg-white text-[#26211C] font-semibold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu Đóng Hàng</span>
              </button>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#26211C] text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. MODAL: IN PHIẾU ĐÓNG HÀNG & HÓA ĐƠN XUẤT XƯỞNG ── */}
      {isPrintModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsPrintModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl border border-[#E8DFD3] shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Print action */}
            <div className="bg-[#26211C] text-white p-4 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-200" />
                <h3 className="font-serif-boutique text-base font-bold text-amber-200">
                  PHIẾU ĐÓNG HÀNG #{selectedOrder.id}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Ngay</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1 text-white/70 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Container */}
            <div id="printable-invoice" className="p-6 overflow-y-auto space-y-4 text-xs font-sans text-stone-800 bg-white">
              {/* Brand Header */}
              <div className="text-center pb-3 border-b-2 border-stone-800">
                <h2 className="font-serif-boutique text-xl font-bold tracking-widest text-[#26211C]">
                  VÒNG TAY NHÀ ZY
                </h2>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">
                  Xưởng Chế Tác Vòng Tay & Gương Đính Thủ Công
                </p>
                <p className="text-[10px] text-stone-600 mt-1">
                  Địa chỉ: 128 Nguyễn Trãi, Thanh Xuân, Hà Nội · Hotline: 0988.66.88.99
                </p>
              </div>

              {/* Order Meta */}
              <div className="flex justify-between items-center text-xs py-1 border-b border-stone-200">
                <div>
                  <p>Mã đơn hàng: <strong className="font-mono text-sm text-[#B86244]">#{selectedOrder.id}</strong></p>
                  <p className="text-stone-500 text-[10px]">
                    Ngày in: {new Date().toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded bg-stone-100 font-bold text-[10px]">
                    {selectedOrder.carrier || 'GHTK'}
                  </span>
                  {selectedOrder.trackingCode && (
                    <p className="font-mono font-bold text-[11px] mt-0.5">{selectedOrder.trackingCode}</p>
                  )}
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
