import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Gem, 
  Eye, 
  Coins, 
  Package, 
  Filter,
  ArrowLeft,
  Save,
  Tag,
  Palette,
  Compass,
  Sliders,
  ChevronRight,
  HelpCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';

const commonMaterials = [
  'Bạc Ý 925 Cao Cấp',
  'Gốm Men Sứ Nung',
  'Vỏ Sò Biển Tự Nhiên',
  'Pha Lê Aurora Hologram',
  'Gốm Men Lam Cổ Phong',
  'Gốm Mạ Vàng Hoàng Kim',
  'Hợp Kim Bạc Nam Châm',
  'Đồng Mạ Bạc',
  'Ngọc Trai Nước Ngọt',
  'Gỗ Quý Phong Thủy'
];

const commonCategories = [
  'Sinh vật biển',
  'Hoa cỏ may mắn',
  'Linh vật phong thủy',
  'Cổ phong Á Đông',
  'Lấp lánh & Nàng thơ',
  'Tình duyên & Đôi lứa',
  'Âm thanh may mắn',
  'Dấu ấn cá nhân'
];

const commonSizes = [
  '10mm',
  '12mm x 10mm',
  '14mm',
  '15mm x 12mm',
  '16mm x 16mm',
  '18mm x 12mm',
  '20mm'
];

const presetCharmPhotos = [
  { name: 'Cá Voi Xanh Pastel', image: '/images/products/vong-co-choker-ca-voi-xanh.jpg' },
  { name: 'Vỏ Sò Biển Xà Cừ', image: '/images/products/vong-vo-so-sao-bien-kem.jpg' },
  { name: 'Sao Biển Vàng', image: '/images/products/summer-set-sao-bien.jpg' },
  { name: 'Hoa Cúc Mint Trong Suốt', image: '/images/products/bracelet-mint-flower.jpg' },
  { name: 'Bướm Aurora Hologram', image: '/images/products/bracelet-hologram-butterfly.jpg' },
  { name: 'Đĩa Sứ Chuồn Chuồn', image: '/images/products/vong-dia-chuon-chuon-logo.jpg' },
  { name: 'Nam Châm Đôi Tình Yêu', image: '/images/products/bracelet-couple-magnetic.webp' },
  { name: 'Chùm Đại Dương', image: '/images/products/vong-chum-sao-bien-ca-voi.jpg' },
  { name: 'Set Vòng Pastel', image: '/images/products/bracelet-pastel-macrame-trio.jpg' }
];

const menhList = [
  { id: 'Tất cả', label: 'Tất Cả Mệnh', color: 'bg-stone-100 text-stone-800 border-stone-300' },
  { id: 'Kim', label: 'Mệnh Kim (Trắng, Vàng)', color: 'bg-amber-50 text-amber-800 border-amber-300' },
  { id: 'Mộc', label: 'Mệnh Mộc (Xanh Lục)', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { id: 'Thủy', label: 'Mệnh Thủy (Xanh Biển)', color: 'bg-sky-50 text-sky-800 border-sky-300' },
  { id: 'Hỏa', label: 'Mệnh Hỏa (Đỏ, Hồng)', color: 'bg-rose-50 text-rose-800 border-rose-300' },
  { id: 'Thổ', label: 'Mệnh Thổ (Vàng Đất, Nâu)', color: 'bg-orange-50 text-orange-800 border-orange-300' }
];

export default function CharmManagerView({ charms = [], onRefresh, triggerToast }) {
  // WORKSPACE VIEW STATE: 'list' (Danh sách) | 'editor' (Giao diện cứng thêm/sửa charm)
  const [workspaceView, setWorkspaceView] = useState('list');
  const [editingCharm, setEditingCharm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters for list view
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState('all');

  // Form data for creating/editing charms
  const [formData, setFormData] = useState({
    name: '',
    material: 'Bạc Ý 925 Cao Cấp',
    category: 'Sinh vật biển',
    price: '55000',
    image: '',
    icon: 'Sparkles',
    desc: '',
    meaning: '',
    stock: '35',
    inStock: true,
    menh: ['Tất cả'],
    sizeMm: '12mm x 10mm'
  });

  // Open dedicated workspace for new charm
  const handleOpenNewWorkspace = () => {
    setEditingCharm(null);
    setErrorMessage('');
    setFormData({
      name: '',
      material: 'Bạc Ý 925 Cao Cấp',
      category: 'Sinh vật biển',
      price: '55000',
      image: '',
      icon: 'Sparkles',
      desc: '',
      meaning: '',
      stock: '35',
      inStock: true,
      menh: ['Tất cả'],
      sizeMm: '12mm x 10mm'
    });
    setWorkspaceView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open dedicated workspace for editing charm
  const handleOpenEditWorkspace = (charm) => {
    setEditingCharm(charm);
    setErrorMessage('');
    setFormData({
      name: charm.name || '',
      material: charm.material || 'Bạc Ý 925 Cao Cấp',
      category: charm.category || 'Khác',
      price: String(charm.price || '0'),
      image: charm.image || '',
      icon: charm.icon || 'Sparkles',
      desc: charm.desc || charm.description || '',
      meaning: charm.meaning || '',
      stock: String(charm.stock || '0'),
      inStock: charm.inStock !== false,
      menh: Array.isArray(charm.menh) && charm.menh.length > 0 ? charm.menh : ['Tất cả'],
      sizeMm: charm.sizeMm || '12mm'
    });
    setWorkspaceView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle image upload from computer / phone camera
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setFormData(prev => ({ ...prev, image: base64 }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Toggle Mệnh selection
  const handleToggleMenh = (item) => {
    const current = formData.menh || [];
    if (item === 'Tất cả') {
      setFormData(prev => ({ ...prev, menh: ['Tất cả'] }));
      return;
    }
    let updated = current.filter(m => m !== 'Tất cả');
    if (updated.includes(item)) {
      updated = updated.filter(m => m !== item);
      if (updated.length === 0) updated = ['Tất cả'];
    } else {
      updated.push(item);
    }
    setFormData(prev => ({ ...prev, menh: updated }));
  };

  // Save Charm (Create or Update)
  const handleSaveCharm = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Vui lòng nhập tên cho charm thủ công!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const numPrice = Number(formData.price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMessage('Vui lòng nhập giá bán hợp lệ (lớn hơn hoặc bằng 0đ)!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        material: formData.material.trim(),
        category: formData.category.trim(),
        price: numPrice,
        image: formData.image.trim(),
        icon: formData.icon || 'Sparkles',
        desc: formData.desc.trim(),
        description: formData.desc.trim(),
        meaning: formData.meaning.trim(),
        stock: Number(formData.stock) || 0,
        inStock: Boolean(formData.inStock),
        menh: formData.menh,
        sizeMm: formData.sizeMm.trim()
      };

      if (editingCharm) {
        await api.updateCharm(editingCharm.id, payload);
        if (triggerToast) {
          triggerToast(`Đã cập nhật charm "${payload.name}" thành công!`, 'success');
        }
      } else {
        await api.createCharm(payload);
        if (triggerToast) {
          triggerToast(`Đã thêm charm mới "${payload.name}" vào kho!`, 'success');
        }
      }

      setWorkspaceView('list');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Lỗi khi lưu charm:', err);
      setErrorMessage('Lỗi lưu charm: ' + (err.message || 'Không xác định'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  // Quick toggle stock status
  const handleToggleStock = async (charm) => {
    try {
      const res = await api.toggleCharmStock(charm.id);
      if (triggerToast) {
        triggerToast(`Đã chuyển trạng thái charm ${charm.name}: ${res.data?.inStock ? 'Còn hàng' : 'Tạm hết'}`);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Lỗi đổi trạng thái: ' + err.message);
    }
  };

  // Delete charm
  const handleDeleteCharm = async (charm) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa charm "${charm.name}" khỏi kho?`)) return;
    setIsDeletingId(charm.id);
    try {
      await api.deleteCharm(charm.id);
      if (triggerToast) {
        triggerToast(`Đã xóa charm "${charm.name}" thành công!`);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Lỗi xóa charm: ' + err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  // =========================================================================
  // VIEW 2: GIAO DIỆN CỨNG: THÊM / CHỈNH SỬA CHARM RIÊNG BIỆT (DEDICATED WORKSPACE)
  // Không dùng popup modal đè màn hình để tránh lỗi cuộn và cắt góc trên di động
  // =========================================================================
  if (workspaceView === 'editor') {
    return (
      <div className="space-y-6 animate-fadeIn pb-24 lg:pb-12">
        {/* 1. Header Navigation Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-2 z-30 backdrop-blur-md bg-white/95">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setWorkspaceView('list')}
              className="p-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2E5D5] text-[#26211C] border border-[#E8DFD3] transition-all flex items-center gap-2 font-bold text-xs cursor-pointer shadow-2xs group"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-[#B86244]" />
              <span>Quay Lại Kho Charm</span>
            </button>
            <div className="h-6 w-[1px] bg-[#E8DFD3] hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider">
                  XƯỞNG THỦ CÔNG & STUDIO PHỐI ĐỒ
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  editingCharm 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {editingCharm ? `Chỉnh sửa #${editingCharm.id}` : '+ Tạo mẫu mới'}
                </span>
              </div>
              <h2 className="font-serif-boutique text-xl sm:text-2xl font-bold text-[#26211C] mt-0.5">
                {editingCharm ? `Chỉnh Sửa Charm: ${editingCharm.name}` : 'Thêm Charm Mới Vào Kho Xưởng'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={() => setWorkspaceView('list')}
              className="px-4 py-2.5 rounded-2xl border border-[#E8DFD3] text-xs font-semibold text-[#6B6258] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSaveCharm}
              disabled={isSaving}
              className="btn-luxury-cta px-6 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editingCharm ? 'Lưu Cập Nhật' : 'Tạo Charm Mới'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs animate-shake">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
            <button 
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Workspace Form Grid */}
        <form onSubmit={handleSaveCharm} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ================= LEFT COLUMN: FORM FIELDS (2 cols) ================= */}
          <div className="lg:col-span-2 space-y-6">

            {/* CARD 1: THÔNG TIN ĐỊNH DANH & GIÁ BÁN */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#F5EFE6] pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF4E8] text-[#C59B6D] flex items-center justify-center font-bold">
                  <Gem className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-boutique text-base font-bold text-[#231F1C]">
                    1. Thông Tin Định Danh & Giá Bán
                  </h3>
                  <p className="text-[11px] text-[#948A7E]">
                    Tên hiển thị, giá cộng thêm khi khách chọn và số lượng phôi hiện có
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tên Charm */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#231F1C] flex items-center gap-1">
                    <span>Tên Charm Thủ Công:</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Charm Vỏ Sò Biển Tự Nhiên & Ánh Xà Cừ"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full glass-input p-3 rounded-2xl font-bold text-sm text-[#231F1C] border border-[#E8DFD3] focus:border-[#C59B6D] focus:ring-1 focus:ring-[#C59B6D]"
                  />
                  <span className="text-[10px] text-[#948A7E]">
                    Tên nên mô tả rõ đặc tính: chất liệu, màu sắc, linh vật hoặc hoa cỏ
                  </span>
                </div>

                {/* Giá Bán */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#C59B6D] flex items-center justify-between">
                    <span>Giá bán charm (₫):</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      placeholder="55000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full glass-input p-3 pr-12 rounded-2xl font-bold text-sm text-[#C59B6D] border border-[#E8DFD3] focus:border-[#C59B6D]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#C59B6D]">
                      ₫
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-[#C59B6D] bg-[#FAF4E8] px-2.5 py-1 rounded-xl border border-[#EADBCC] inline-block">
                    {new Intl.NumberFormat('vi-VN').format(Number(formData.price) || 0)}₫
                  </div>
                </div>
              </div>

              {/* Tồn Kho, Kích Thước & Mở Bán */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#F5EFE6]">
                {/* Tồn Kho */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#231F1C]">Số lượng tồn kho:</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl text-xs font-bold text-[#231F1C] border border-[#E8DFD3]"
                  />
                  <span className="text-[10px] text-[#948A7E]">Chiếc hiện có trong xưởng</span>
                </div>

                {/* Kích Thước mm */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#231F1C]">Kích thước chi tiết:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 12mm x 10mm"
                    value={formData.sizeMm}
                    onChange={(e) => setFormData({ ...formData, sizeMm: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl text-xs font-semibold text-[#231F1C] border border-[#E8DFD3]"
                  />
                  {/* Quick size chips */}
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    {commonSizes.slice(0, 4).map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setFormData({ ...formData, sizeMm: sz })}
                        className={`text-[9px] px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                          formData.sizeMm === sz 
                            ? 'bg-[#C59B6D] text-white border-[#C59B6D]' 
                            : 'bg-[#FAF7F2] text-[#6B6258] border-[#E8DFD3] hover:bg-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trạng thái mở bán */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#231F1C]">Trạng thái mở bán:</label>
                  <div 
                    onClick={() => setFormData({ ...formData, inStock: !formData.inStock })}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      formData.inStock 
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800' 
                        : 'bg-rose-50/80 border-rose-300 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${formData.inStock ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      <span className="text-xs font-bold">
                        {formData.inStock ? 'Sẵn sàng phối đồ' : 'Tạm hết / Ẩn'}
                      </span>
                    </div>
                    <span className="text-[10px] underline font-semibold">Đổi</span>
                  </div>
                  <span className="text-[10px] text-[#948A7E]">
                    {formData.inStock ? 'Khách hàng có thể chọn trên Studio' : 'Tạm ẩn khỏi studio phối vòng'}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2: HÌNH ẢNH CHỤP THỰC TẾ (QUAN TRỌNG NHẤT) */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF4E8] text-[#C59B6D] flex items-center justify-center font-bold">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif-boutique text-base font-bold text-[#231F1C]">
                      2. Hình Ảnh Chụp Thật Của Charm
                    </h3>
                    <p className="text-[11px] text-[#948A7E]">
                      Ảnh phôi chụp thật trên nền sáng hoặc nền trong suốt (PNG/JPG)
                    </p>
                  </div>
                </div>
                {formData.image && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa ảnh</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
                {/* Image Preview Box */}
                <div className="aspect-square rounded-2xl border-2 border-dashed border-[#C59B6D]/40 bg-gradient-to-b from-[#FAF7F2] to-[#EFEAE1] p-3 flex items-center justify-center relative group overflow-hidden shadow-inner">
                  {formData.image ? (
                    <>
                      <img 
                        src={formData.image} 
                        alt="Charm Preview" 
                        className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="p-2 rounded-xl bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-[#948A7E] space-y-2 p-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/80 mx-auto flex items-center justify-center shadow-xs">
                        <Upload className="w-6 h-6 text-[#C59B6D]" />
                      </div>
                      <span className="text-xs font-bold block text-[#231F1C]">Chưa có ảnh</span>
                      <span className="text-[10px] block leading-relaxed text-[#948A7E]">
                        Tải ảnh từ máy hoặc chọn nhanh ảnh mẫu có sẵn bên dưới
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload & URL Controls */}
                <div className="sm:col-span-2 space-y-3.5">
                  {/* File Upload */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-1.5">
                    <label className="text-xs font-bold text-[#231F1C] flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#C59B6D]" />
                      <span>Cách 1: Tải ảnh từ thiết bị (Điện thoại / Máy tính)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#C59B6D] file:text-white hover:file:opacity-90 cursor-pointer w-full"
                    />
                    <span className="text-[10px] text-[#948A7E] block">
                      Hỗ trợ chụp trực tiếp từ camera iPhone/Android hoặc ảnh thư viện
                    </span>
                  </div>

                  {/* URL Input */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-1.5">
                    <label className="text-xs font-bold text-[#231F1C] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#C59B6D]" />
                      <span>Cách 2: Hoặc dán liên kết URL hình ảnh</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://... hoặc /images/products/..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full glass-input p-2.5 rounded-xl text-xs font-mono text-[#231F1C] border border-[#E8DFD3]"
                    />
                  </div>
                </div>
              </div>

              {/* PRESET CHARM PHOTOS FROM WORKSHOP */}
              <div className="pt-3 border-t border-[#F5EFE6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#231F1C] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#C59B6D]" />
                    <span>Cách 3: Chọn nhanh từ kho phôi ảnh charm mẫu của Xưởng</span>
                  </span>
                  <span className="text-[10px] text-[#948A7E]">1 chạm áp dụng ngay</span>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {presetCharmPhotos.map((preset, idx) => {
                    const isSelected = formData.image === preset.image;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: preset.image })}
                        className={`p-2 rounded-xl border text-left flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#FAF4E8] border-[#C59B6D] ring-2 ring-[#C59B6D]/30 shadow-xs' 
                            : 'bg-white border-[#E8DFD3] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] p-1 flex items-center justify-center overflow-hidden border border-[#EADBCC]">
                          <img 
                            src={preset.image} 
                            alt={preset.name} 
                            className="w-full h-full object-contain filter drop-shadow-xs" 
                          />
                        </div>
                        <span className="text-[9px] font-bold text-[#231F1C] text-center line-clamp-1">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CARD 3: CHẤT LIỆU & PHÂN LOẠI CHỦ ĐỀ */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#F5EFE6] pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF4E8] text-[#C59B6D] flex items-center justify-center font-bold">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-boutique text-base font-bold text-[#231F1C]">
                    3. Chất Liệu & Phân Loại Chủ Đề
                  </h3>
                  <p className="text-[11px] text-[#948A7E]">
                    Chất liệu đá, gốm men, bạc 925 và nhóm chủ đề giúp khách dễ lọc trên Studio
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Chất Liệu */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#231F1C] block">
                    Chất liệu chế tác:
                  </label>
                  <input
                    type="text"
                    list="material-presets-workspace"
                    placeholder="Chọn hoặc nhập chất liệu..."
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl font-bold text-xs text-[#231F1C] border border-[#E8DFD3]"
                  />
                  <datalist id="material-presets-workspace">
                    {commonMaterials.map(m => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    {commonMaterials.slice(0, 5).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFormData({ ...formData, material: m })}
                        className={`text-[9px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          formData.material === m 
                            ? 'bg-[#231F1C] text-white border-[#231F1C]' 
                            : 'bg-[#FAF7F2] text-[#6B6258] border-[#E8DFD3] hover:bg-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phân Loại Chủ Đề */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#231F1C] block">
                    Phân loại chủ đề thiết kế:
                  </label>
                  <input
                    type="text"
                    list="category-presets-workspace"
                    placeholder="Chọn hoặc nhập chủ đề..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl font-bold text-xs text-[#231F1C] border border-[#E8DFD3]"
                  />
                  <datalist id="category-presets-workspace">
                    {commonCategories.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    {commonCategories.slice(0, 4).map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: c })}
                        className={`text-[9px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          formData.category === c 
                            ? 'bg-[#231F1C] text-white border-[#231F1C]' 
                            : 'bg-[#FAF7F2] text-[#6B6258] border-[#E8DFD3] hover:bg-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: PHONG THỦY NGŨ HÀNH & Ý NGHĨA TÂM AN */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#F5EFE6] pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF4E8] text-[#C59B6D] flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-boutique text-base font-bold text-[#231F1C]">
                    4. Ngũ Hành Tương Sinh & Năng Lượng Phong Thủy
                  </h3>
                  <p className="text-[11px] text-[#948A7E]">
                    Gợi ý phối màu phong thủy tương sinh với từng bản mệnh ngũ hành của khách
                  </p>
                </div>
              </div>

              {/* 6 Nút Chọn Mệnh */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#231F1C] block">
                  Mệnh tương sinh tương hợp:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {menhList.map(m => {
                    const isSelected = formData.menh.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleMenh(m.id)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? `${m.color} ring-2 ring-current shadow-xs` 
                            : 'bg-white text-[#6B6258] border-[#E8DFD3] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span>{m.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ý Nghĩa May Mắn & Mô Tả */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-[#231F1C] block">
                  Ý nghĩa may mắn & Phong thủy:
                </label>
                <textarea
                  rows="3"
                  placeholder="Ví dụ: Tượng trưng cho sự tự do, khát vọng biển khơi bao la và nụ cười bình an trong tâm hồn..."
                  value={formData.meaning}
                  onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                  className="w-full glass-input p-3 rounded-2xl text-xs text-[#231F1C] border border-[#E8DFD3] focus:border-[#C59B6D]"
                />
              </div>

              {/* Mô tả kỹ thuật xâu hạt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#231F1C] block">
                  Mô tả kỹ thuật chế tác thủ công (nếu có):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lỗ xỏ 1.8mm vừa dây sáp macrame, men sứ nung 1200°C chống phai màu"
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full glass-input p-2.5 rounded-xl text-xs text-[#231F1C] border border-[#E8DFD3]"
                />
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW & ACTIONS (1 col) ================= */}
          <div className="space-y-6">

            {/* CARD: LIVE STUDIO SIMULATION (MÔ PHỎNG VÒNG THẬT) */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4 sticky top-28">
              <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C59B6D]" />
                  <h4 className="font-serif-boutique text-sm font-bold text-[#231F1C]">
                    Mô Phỏng Trong Studio 2D
                  </h4>
                </div>
                <span className="text-[10px] bg-[#FAF4E8] text-[#C59B6D] font-bold px-2 py-0.5 rounded-full border border-[#EADBCC]">
                  Canvas Thật
                </span>
              </div>

              {/* Canvas Preview Simulation */}
              <div className="aspect-square rounded-2xl bg-gradient-to-tr from-[#FAF7F2] via-[#F3ECE1] to-[#FAF7F2] p-4 flex flex-col items-center justify-center relative overflow-hidden border border-[#EADBCC] shadow-inner">
                {/* Simulated cord circle */}
                <div className="w-44 h-44 rounded-full border-2 border-dashed border-[#C59B6D]/60 flex items-center justify-center relative">
                  
                  {/* Surrounding decorative beads */}
                  <div className="absolute -top-2 w-3.5 h-3.5 rounded-full bg-[#D4AF37] shadow-xs" />
                  <div className="absolute top-6 -left-1 w-3.5 h-3.5 rounded-full bg-[#A8D8B0] shadow-xs" />
                  <div className="absolute top-6 -right-1 w-3.5 h-3.5 rounded-full bg-[#FBCFD0] shadow-xs" />
                  <div className="absolute top-20 -left-2 w-3.5 h-3.5 rounded-full bg-[#EAA9A9] shadow-xs" />
                  <div className="absolute top-20 -right-2 w-3.5 h-3.5 rounded-full bg-[#A3E4D7] shadow-xs" />
                  <div className="absolute bottom-6 left-2 w-3.5 h-3.5 rounded-full bg-[#D4CEEB] shadow-xs" />
                  <div className="absolute bottom-6 right-2 w-3.5 h-3.5 rounded-full bg-[#DCE6ED] shadow-xs" />

                  {/* CHARM AT BOTTOM CENTER (Real Photo or Gem Icon) */}
                  <div className="absolute -bottom-4 z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#C59B6D] flex items-center justify-center p-1.5 shadow-lg group">
                      {formData.image ? (
                        <img 
                          src={formData.image} 
                          alt="Charm Phối Thử" 
                          className="w-full h-full object-contain filter drop-shadow-md transition-transform group-hover:scale-110" 
                        />
                      ) : (
                        <Gem className="w-8 h-8 text-[#C59B6D]" />
                      )}
                    </div>
                  </div>

                  {/* Center branding watermark */}
                  <div className="text-center p-2">
                    <span className="font-serif-boutique text-[11px] font-bold text-[#8C8276] uppercase tracking-widest block">
                      VÒNG TAY
                    </span>
                    <span className="font-serif-boutique text-xs font-bold text-[#231F1C] block">
                      Nhà Zy Made
                    </span>
                    <span className="text-[9px] text-[#C59B6D] font-bold block mt-1">
                      +{(Number(formData.price) || 0).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>

                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[9px] font-bold bg-white/90 text-[#231F1C] px-2 py-0.5 rounded-md border border-[#E8DFD3] shadow-2xs">
                    {formData.sizeMm || '12mm'}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${
                    formData.inStock 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}>
                    {formData.inStock ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                </div>
              </div>

              {/* Summary Attributes */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#948A7E]">Tên mẫu:</span>
                  <span className="font-bold text-[#231F1C] text-right line-clamp-1 max-w-[170px]">
                    {formData.name || '(Chưa đặt tên)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#948A7E]">Chất liệu:</span>
                  <span className="font-semibold text-[#231F1C]">{formData.material}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#948A7E]">Chủ đề:</span>
                  <span className="font-semibold text-[#231F1C]">{formData.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#948A7E]">Mệnh hợp:</span>
                  <span className="font-bold text-[#C59B6D]">{formData.menh.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#EADBCC]">
                  <span className="font-bold text-[#231F1C]">Giá bán cộng dồn:</span>
                  <span className="font-bold text-sm text-[#C59B6D]">
                    {new Intl.NumberFormat('vi-VN').format(Number(formData.price) || 0)}₫
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-luxury-cta w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang lưu vào kho...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingCharm ? 'Lưu Cập Nhật Charm' : 'Tạo Charm Mới Vào Kho'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setWorkspaceView('list')}
                  className="w-full py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2E5D5] text-[#6B6258] text-xs font-semibold border border-[#E8DFD3] transition-colors cursor-pointer"
                >
                  Hủy bỏ và quay lại
                </button>
              </div>

              {/* Safe sync guarantee */}
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-[10px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Tự động đồng bộ thời gian thực vào Xưởng Tự Phối và cơ sở dữ liệu Neon PostgreSQL.
                </span>
              </div>
            </div>

          </div>

        </form>

        {/* MOBILE STICKY SAVE BAR (Luôn ghim đáy màn hình iPhone / Android) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-3 border-t border-[#E8DFD3] shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FAF4E8] border border-[#EADBCC] flex items-center justify-center p-1 shrink-0">
              {formData.image ? (
                <img src={formData.image} alt="Thumb" className="w-full h-full object-contain" />
              ) : (
                <Gem className="w-5 h-5 text-[#C59B6D]" />
              )}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-[#231F1C] truncate block">
                {formData.name || 'Mẫu Charm Mới'}
              </span>
              <span className="text-[11px] font-bold text-[#C59B6D]">
                {new Intl.NumberFormat('vi-VN').format(Number(formData.price) || 0)}₫
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveCharm}
            disabled={isSaving}
            className="btn-luxury-cta px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{editingCharm ? 'Lưu' : 'Tạo Charm'}</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: DANH SÁCH CHARM (LIST WORKSPACE)
  // =========================================================================
  const filteredCharms = charms.filter(charm => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = charm.name?.toLowerCase().includes(q);
      const matchMat = charm.material?.toLowerCase().includes(q);
      const matchMeaning = charm.meaning?.toLowerCase().includes(q);
      const matchDesc = (charm.desc || charm.description)?.toLowerCase().includes(q);
      if (!matchName && !matchMat && !matchMeaning && !matchDesc) return false;
    }

    if (selectedMaterial !== 'all' && charm.material !== selectedMaterial) return false;
    if (selectedCategory !== 'all' && charm.category !== selectedCategory) return false;

    if (selectedStockStatus === 'in_stock' && !charm.inStock) return false;
    if (selectedStockStatus === 'out_of_stock' && charm.inStock) return false;

    return true;
  });

  const uniqueMaterials = Array.from(new Set(charms.map(c => c.material).filter(Boolean)));
  const uniqueCategories = Array.from(new Set(charms.map(c => c.category).filter(Boolean)));

  const inStockCount = charms.filter(c => c.inStock).length;
  const outOfStockCount = charms.filter(c => !c.inStock || c.stock <= 0).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header & Summary Stats */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C59B6D] to-[#B86244] text-white flex items-center justify-center font-bold text-xl shadow-md">
              <Gem className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-boutique text-2xl font-bold text-[#231F1C]">
                  KHO CHARM THỦ CÔNG & PHỤ KIỆN PHỐI VÒNG
                </h2>
                <span className="text-[10px] bg-[#FAF4E8] text-[#C59B6D] font-bold px-2.5 py-0.5 rounded-full border border-[#EADBCC]">
                  {charms.length} MẪU
                </span>
              </div>
              <p className="text-xs text-[#948A7E]">
                Quản lý ảnh chụp thật của charm (Bạc 925, gốm men, vỏ sò biển, ngọc...) để đồng bộ thời gian thực vào Customizer Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onRefresh}
              className="p-2.5 rounded-2xl border border-[#E8DFD3] text-[#6B6258] hover:text-[#231F1C] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              title="Làm mới danh sách"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleOpenNewWorkspace}
              className="btn-luxury-cta px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Charm Mới</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white/80 border border-white shadow-2xs">
            <span className="text-[11px] text-[#948A7E] font-medium block">Tổng số mẫu charm:</span>
            <span className="text-xl font-bold text-[#231F1C] mt-0.5 block">{charms.length}</span>
            <span className="text-[10px] text-[#4E6857]">Đã tối ưu cho Customizer</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-white shadow-2xs">
            <span className="text-[11px] text-[#948A7E] font-medium block">Đang sẵn hàng:</span>
            <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{inStockCount}</span>
            <span className="text-[10px] text-emerald-600">Khách có thể chọn phối</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-white shadow-2xs">
            <span className="text-[11px] text-[#948A7E] font-medium block">Tạm hết / Cảnh báo kho:</span>
            <span className="text-xl font-bold text-amber-700 mt-0.5 block">{outOfStockCount}</span>
            <span className="text-[10px] text-amber-600">Cần đúc/nhập thêm</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-white shadow-2xs">
            <span className="text-[11px] text-[#948A7E] font-medium block">Chất liệu phong phú:</span>
            <span className="text-xl font-bold text-[#C59B6D] mt-0.5 block">{uniqueMaterials.length || 6}</span>
            <span className="text-[10px] text-[#C59B6D]">Bạc 925, vỏ sò, gốm men, đá</span>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#948A7E]" />
          <input
            type="text"
            placeholder="Tìm kiếm charm theo tên, chất liệu, ý nghĩa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs text-[#231F1C] focus:outline-none focus:border-[#C59B6D]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Lọc chất liệu */}
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs text-[#231F1C] font-semibold focus:outline-none"
          >
            <option value="all">Tất cả chất liệu</option>
            {uniqueMaterials.map(mat => (
              <option key={mat} value={mat}>{mat}</option>
            ))}
          </select>

          {/* Lọc danh mục */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs text-[#231F1C] font-semibold focus:outline-none"
          >
            <option value="all">Tất cả thể loại</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Lọc trạng thái tồn kho */}
          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs text-[#231F1C] font-semibold focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="in_stock">Còn hàng</option>
            <option value="out_of_stock">Tạm hết hàng</option>
          </select>
        </div>
      </div>

      {/* 3. Charm Grid Cards */}
      {filteredCharms.length === 0 ? (
        <div className="text-center py-12 bg-white/70 rounded-3xl border border-white">
          <Gem className="w-12 h-12 mx-auto text-[#C59B6D]/40 mb-3" />
          <h4 className="font-serif-boutique text-lg font-bold text-[#231F1C]">Không tìm thấy mẫu charm nào</h4>
          <p className="text-xs text-[#948A7E] mt-1">Thử thay đổi bộ lọc hoặc thêm charm mới vào kho</p>
          <button
            type="button"
            onClick={handleOpenNewWorkspace}
            className="mt-4 px-4 py-2 rounded-xl bg-[#C59B6D] text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-md"
          >
            + Thêm Charm Ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCharms.map(charm => {
            const isDeleting = isDeletingId === charm.id;
            return (
              <div 
                key={charm.id}
                className={`glass-card-luxury p-4 rounded-3xl space-y-3 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border ${
                  charm.inStock ? 'border-white/80' : 'border-amber-200/80 bg-amber-50/30'
                }`}
              >
                {/* Image & Badges */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#EFEAE1] flex items-center justify-center p-3 group">
                  {charm.image ? (
                    <img 
                      src={charm.image} 
                      alt={charm.name} 
                      className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#948A7E]">
                      <Gem className="w-12 h-12 text-[#C59B6D]/50 mb-1" />
                      <span className="text-[10px] font-semibold">Chưa có ảnh</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#231F1C]/80 text-white backdrop-blur-xs">
                      {charm.material || 'Bạc 925'}
                    </span>
                    {charm.category && (
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-[#6B6258] border border-white shadow-2xs">
                        {charm.category}
                      </span>
                    )}
                  </div>

                  {/* Stock status indicator */}
                  <div className="absolute top-2.5 right-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleStock(charm)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm transition-all cursor-pointer ${
                        charm.inStock 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' 
                          : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                      }`}
                      title="Bấm để bật/tắt trạng thái còn hàng"
                    >
                      {charm.inStock ? '✓ Còn hàng' : '✕ Hết hàng'}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-1">
                    <h4 className="font-serif-boutique text-sm font-bold text-[#231F1C] leading-snug line-clamp-1" title={charm.name}>
                      {charm.name}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F5EFE6]">
                    <span className="font-bold text-[#C59B6D]">
                      {new Intl.NumberFormat('vi-VN').format(charm.price)}₫
                    </span>
                    <span className="text-[10px] text-[#948A7E]">
                      Kho: <strong className="text-[#231F1C]">{charm.stock || 0}</strong>
                    </span>
                  </div>

                  {/* Meaning / Desc */}
                  {(charm.meaning || charm.desc) && (
                    <p className="text-[11px] text-[#6B6258] line-clamp-2 leading-relaxed italic">
                      "{charm.meaning || charm.desc}"
                    </p>
                  )}

                  {/* Mệnh Tags */}
                  {charm.menh && charm.menh.length > 0 && charm.menh[0] !== 'Tất cả' && (
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      <span className="text-[9px] text-[#948A7E]">Hợp:</span>
                      {charm.menh.map(m => (
                        <span key={m} className="text-[9px] bg-[#FAF4E8] text-[#C59B6D] px-1.5 py-0.2 rounded border border-[#EADBCC]">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-[#F5EFE6] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditWorkspace(charm)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#231F1C] text-xs font-semibold border border-[#E8DFD3] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#C59B6D]" />
                    <span>Sửa Charm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCharm(charm)}
                    disabled={isDeleting}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa charm khỏi kho"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
