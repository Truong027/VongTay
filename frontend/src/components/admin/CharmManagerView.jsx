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
  Filter 
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

const menhList = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];

export default function CharmManagerView({ charms = [], onRefresh, triggerToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharm, setEditingCharm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    material: 'Bạc Ý 925 Cao Cấp',
    category: 'Sinh vật biển',
    price: '55000',
    image: '',
    icon: 'Sparkles',
    desc: '',
    meaning: '',
    stock: '30',
    inStock: true,
    menh: ['Tất cả'],
    sizeMm: '12mm x 10mm'
  });

  // Open modal for new charm
  const handleOpenNewModal = () => {
    setEditingCharm(null);
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
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (charm) => {
    setEditingCharm(charm);
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
    setIsModalOpen(true);
  };

  // Handle image upload from computer
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
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên charm!');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        material: formData.material.trim(),
        category: formData.category.trim(),
        price: Number(formData.price) || 0,
        image: formData.image.trim(),
        icon: formData.icon || 'Sparkles',
        desc: formData.desc.trim(),
        description: formData.desc.trim(),
        meaning: formData.meaning.trim(),
        stock: Number(formData.stock) || 0,
        inStock: formData.inStock,
        menh: formData.menh,
        sizeMm: formData.sizeMm.trim()
      };

      if (editingCharm) {
        await api.updateCharm(editingCharm.id, payload);
        triggerToast(`Đã cập nhật charm "${payload.name}" thành công!`);
      } else {
        await api.createCharm(payload);
        triggerToast(`Đã thêm charm mới "${payload.name}" vào kho!`);
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Lỗi lưu charm: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Quick toggle stock status
  const handleToggleStock = async (charm) => {
    try {
      const res = await api.toggleCharmStock(charm.id);
      triggerToast(`Đã chuyển trạng thái charm ${charm.name}: ${res.data?.inStock ? 'Còn hàng' : 'Tạm hết'}`);
      onRefresh();
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
      triggerToast(`Đã xóa charm "${charm.name}" thành công!`);
      onRefresh();
    } catch (err) {
      alert('Lỗi xóa charm: ' + err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  // Filter charms
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
              className="p-2.5 rounded-xl border border-[#E8DFD3] text-[#6B6258] hover:text-[#231F1C] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              title="Làm mới danh sách"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleOpenNewModal}
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
            onClick={handleOpenNewModal}
            className="mt-4 px-4 py-2 rounded-xl bg-[#C59B6D] text-white text-xs font-bold hover:opacity-90 transition-all"
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
                    onClick={() => handleOpenEditModal(charm)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#231F1C] text-xs font-semibold border border-[#E8DFD3] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#C59B6D]" />
                    <span>Sửa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCharm(charm)}
                    disabled={isDeleting}
                    className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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

      {/* 4. MODAL: THÊM / CHỈNH SỬA CHARM */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-[#FAF7F2] w-full max-w-2xl rounded-3xl border border-[#E8DFD3] shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#231F1C] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#C59B6D] to-[#B86244] flex items-center justify-center">
                  <Gem className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif-boutique text-lg font-bold">
                    {editingCharm ? `CHỈNH SỬA: ${editingCharm.name}` : 'THÊM CHARM MỚI VÀO KHO'}
                  </h3>
                  <p className="text-[10px] text-[#CFC1B0]">
                    Ảnh chụp thật và thông số charm sẽ hiển thị trực tiếp khi khách tự phối đồ trên Customizer
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="text-white/70 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveCharm} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Tên Charm & Giá */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-[#231F1C] block mb-1">
                    Tên Charm & Mô tả ngắn: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Charm Vỏ Sò Biển Tự Nhiên & Ánh Xà Cừ"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl font-bold text-[#231F1C]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#C59B6D] block mb-1">
                    Giá bán charm (₫): *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    placeholder="55000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl font-bold text-[#C59B6D]"
                  />
                </div>
              </div>

              {/* TẢI ẢNH CHARM THẬT */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD3]/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#231F1C] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#C59B6D]" />
                    <span>Hình Ảnh Chụp Thật Của Charm: *</span>
                  </label>
                  <span className="text-[10px] text-[#948A7E]">Nền trong suốt hoặc ảnh chụp phôi đẹp nhất</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  {/* Image Preview Box */}
                  <div className="aspect-square rounded-xl border-2 border-dashed border-[#C59B6D]/40 bg-[#FAF7F2] p-2 flex items-center justify-center relative group">
                    {formData.image ? (
                      <>
                        <img 
                          src={formData.image} 
                          alt="Charm Preview" 
                          className="w-full h-full object-contain filter drop-shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xóa ảnh này"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-[#948A7E] space-y-1">
                        <Upload className="w-6 h-6 mx-auto text-[#C59B6D]" />
                        <span className="text-[10px] block">Chưa có ảnh</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-2 space-y-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-[#6B6258] block mb-1">
                        1. Tải ảnh từ máy tính (PNG / JPG):
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FAF4E8] file:text-[#C59B6D] hover:file:bg-[#F3ECE1] cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-[#6B6258] block mb-1">
                        2. Hoặc dán liên kết URL hình ảnh:
                      </label>
                      <input
                        type="url"
                        placeholder="https://... hoặc /images/products/..."
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full glass-input p-2 rounded-xl text-xs text-[#231F1C]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Chất Liệu & Thể Loại */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#231F1C] block mb-1">Chất liệu charm:</label>
                  <input
                    type="text"
                    list="material-presets"
                    placeholder="Chọn hoặc nhập chất liệu..."
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl font-semibold text-[#231F1C]"
                  />
                  <datalist id="material-presets">
                    {commonMaterials.map(m => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="font-bold text-[#231F1C] block mb-1">Phân loại chủ đề:</label>
                  <input
                    type="text"
                    list="category-presets"
                    placeholder="Chọn hoặc nhập chủ đề..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl font-semibold text-[#231F1C]"
                  />
                  <datalist id="category-presets">
                    {commonCategories.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Tồn Kho & Kích Thước */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#231F1C] block mb-1">Số lượng tồn kho:</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl font-semibold text-[#231F1C]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#231F1C] block mb-1">Kích thước (mm):</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 14mm x 10mm"
                    value={formData.sizeMm}
                    onChange={(e) => setFormData({ ...formData, sizeMm: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl text-xs text-[#231F1C]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#231F1C] block mb-1">Trạng thái mở bán:</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="inStockCheck"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C59B6D] focus:ring-[#C59B6D]"
                    />
                    <label htmlFor="inStockCheck" className="text-xs font-semibold text-[#231F1C] cursor-pointer">
                      {formData.inStock ? '✓ Sẵn sàng phối đồ (Còn hàng)' : '✕ Tạm ngưng (Hết hàng)'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Chọn Mệnh Hợp Phong Thủy */}
              <div>
                <label className="font-bold text-[#231F1C] block mb-1">Mệnh tương sinh:</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleToggleMenh('Tất cả')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      formData.menh.includes('Tất cả') 
                        ? 'bg-[#231F1C] text-white border-[#231F1C]' 
                        : 'bg-white text-[#6B6258] border-[#E8DFD3]'
                    }`}
                  >
                    Tất cả mệnh
                  </button>
                  {menhList.map(m => {
                    const isSelected = formData.menh.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleToggleMenh(m)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected 
                            ? 'bg-[#C59B6D] text-white border-[#C59B6D] shadow-xs' 
                            : 'bg-white text-[#6B6258] border-[#E8DFD3] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        Mệnh {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ý Nghĩa Phong Thủy & Mô Tả */}
              <div>
                <label className="font-bold text-[#231F1C] block mb-1">Ý nghĩa may mắn & Phong thủy:</label>
                <textarea
                  rows="2"
                  placeholder="Ví dụ: Tượng trưng cho sự tự do, khát vọng biển khơi và nụ cười bình an..."
                  value={formData.meaning}
                  onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                  className="w-full glass-input p-2.5 rounded-xl text-xs text-[#231F1C]"
                />
              </div>

              {/* LIVE PREVIEW: PHỐI THỬ TRÊN DÂY VÒNG */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FAF4E8] to-[#EFEAE1] border border-[#EADBCC] flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#C59B6D]/40 flex items-center justify-center p-1.5 shrink-0 shadow-sm relative">
                  {formData.image ? (
                    <img 
                      src={formData.image} 
                      alt="Charm Phối Thử" 
                      className="w-full h-full object-contain filter drop-shadow-sm" 
                    />
                  ) : (
                    <Gem className="w-6 h-6 text-[#C59B6D]" />
                  )}
                  <span className="absolute -top-1.5 -right-1.5 bg-[#C59B6D] text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full">
                    Studio
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#C59B6D] font-bold uppercase tracking-wider block">
                    Xem Trước Khi Khách Tự Phối
                  </span>
                  <h5 className="font-serif-boutique text-xs font-bold text-[#231F1C]">
                    {formData.name || 'Tên Charm'}
                  </h5>
                  <p className="text-[10px] text-[#6B6258]">
                    Hiển thị thật trong canvas vòng tay với giá +{new Intl.NumberFormat('vi-VN').format(Number(formData.price) || 0)}₫
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 border-t border-[#E8DFD3] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white text-[#6B6258] hover:text-[#231F1C] border border-[#E8DFD3] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-luxury-cta px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingCharm ? 'Lưu Cập Nhật' : 'Tạo Charm Mới'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
