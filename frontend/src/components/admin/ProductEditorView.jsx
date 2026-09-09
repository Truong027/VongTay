import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Coins, 
  Image as ImageIcon, 
  Compass, 
  Layers, 
  Eye, 
  Check, 
  AlertCircle, 
  HelpCircle,
  Tag,
  Package,
  Upload,
  RefreshCw,
  X
} from 'lucide-react';

export default function ProductEditorView({
  editingProduct,
  productFormData,
  setProductFormData,
  onSave,
  isSaving,
  onCancel,
  cleanNumberInput,
  handleAutoAnalyzeImage,
  isAnalyzingCord,
  aiAnalysisStatus
}) {
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'pricing' | 'images' | 'attributes'
  const [imageInputMode, setImageInputMode] = useState('url'); // 'url' | 'sample'

  // Thư viện ảnh mẫu có sẵn độ phân giải cao cho vòng tay & phụ kiện
  const sampleImages = [
    { url: '/images/products/vong-dia-chuon-chuon-logo.jpg', label: 'Vòng Đĩa Chuồn Chuồn Logo' },
    { url: '/images/products/vong-dia-hoa-nhi-logo.jpg', label: 'Vòng Đĩa Hoa Nhí Logo' },
    { url: '/images/products/bracelet-pastel-macrame-trio.jpg', label: 'Trio Pastel Macrame Vintage' },
    { url: '/images/products/vong-tay-hoa-anh-dao.jpg', label: 'Vòng Hoa Anh Đào Pastel' },
    { url: '/images/products/vong-tay-charm-ca-voi-xanh.jpg', label: 'Vòng Charm Cá Voi Xanh' },
    { url: '/images/products/vong-tay-da-mat-trang-moonstone.jpg', label: 'Vòng Đá Mặt Trăng Moonstone' },
    { url: '/images/products/vong-tay-thach-anh-dau-tay.jpg', label: 'Vòng Thạch Anh Dâu Tây' },
    { url: '/images/products/vong-tay-thach-anh-toc-vang.jpg', label: 'Vòng Thạch Anh Tóc Vàng' }
  ];

  const categories = [
    { id: 'macrame-pastel', label: '🌸 Vòng Dây Macrame Pastel & Hoa Gốm' },
    { id: 'guong-dinh', label: '🪞 Gương Đính Gập & Đơn (Bestseller)' },
    { id: 'vong-doi', label: '💞 Vòng Đôi Dây Sáp Nam Châm' },
    { id: 'day-do-may-man', label: '🧧 Vòng Chỉ Đỏ Bình An & Hộ Thân' },
    { id: 'day-lua-co-phong', label: '🎋 Vòng Dây Lụa & Dây Da Mộc' },
    { id: 'day-chuyen-vintage', label: '📿 Dây Chuyền Vintage' }
  ];

  const menhOptions = [
    { id: 'Tất cả', label: 'Tất Cả Mệnh', color: 'bg-stone-100 text-stone-700 border-stone-300' },
    { id: 'Kim', label: 'Mệnh Kim (Trắng, Vàng)', color: 'bg-amber-50 text-amber-800 border-amber-300' },
    { id: 'Mộc', label: 'Mệnh Mộc (Xanh Lục)', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    { id: 'Thủy', label: 'Mệnh Thủy (Xanh Lam)', color: 'bg-sky-50 text-sky-800 border-sky-300' },
    { id: 'Hỏa', label: 'Mệnh Hỏa (Đỏ, Hồng)', color: 'bg-rose-50 text-rose-800 border-rose-300' },
    { id: 'Thổ', label: 'Mệnh Thổ (Vàng Đất, Nâu)', color: 'bg-orange-50 text-orange-800 border-orange-300' }
  ];

  const handleToggleMenh = (item) => {
    const current = productFormData.menh || [];
    if (item === 'Tất cả') {
      setProductFormData({ ...productFormData, menh: ['Tất cả'] });
      return;
    }
    let updated = current.filter(m => m !== 'Tất cả');
    if (updated.includes(item)) {
      updated = updated.filter(m => m !== item);
      if (updated.length === 0) updated = ['Tất cả'];
    } else {
      updated.push(item);
    }
    setProductFormData({ ...productFormData, menh: updated });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setProductFormData(prev => ({
          ...prev,
          images: [base64, ...(prev.images || []).filter(img => img !== base64)]
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const retailPrice = Number(productFormData.price) || 0;
  const wholesalePrice = Number(productFormData.wholesalePrice) || 0;
  const originalPrice = Number(productFormData.originalPrice) || 0;

  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. TOP HEADER & BREADCRUMBS (TRANSLUCENT GLASS) */}
        <div className="glass-panel p-4 sm:p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="p-2.5 sm:p-3 rounded-2xl bg-white/80 hover:bg-white text-[#231F1C] border border-white/90 shadow-sm transition-all flex items-center gap-2 group cursor-pointer"
              title="Quay lại danh sách sản phẩm"
            >
              <ArrowLeft className="w-5 h-5 text-[#C59B6D] group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-bold hidden sm:inline">Quay Lại Kho</span>
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#C59B6D] bg-[#FAF4E8] px-2.5 py-0.5 rounded-full border border-[#EADBCC]">
                  {editingProduct ? 'Chế độ Chỉnh sửa' : 'Tạo mới sản phẩm'}
                </span>
                <span className="text-xs text-[#948A7E]">· Đồng bộ Neon PostgreSQL Cloud</span>
              </div>
              <h1 className="font-serif-boutique text-xl sm:text-3xl font-bold text-[#231F1C] mt-0.5">
                {editingProduct ? `CHỈNH SỬA: ${productFormData.name || 'Sản phẩm'}` : 'THÊM SẢN PHẨM MỚI VÀO KHO'}
              </h1>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-2xl bg-white/70 hover:bg-white text-[#6B6258] hover:text-[#231F1C] text-xs font-semibold border border-white transition-all shadow-xs cursor-pointer"
            >
              Hủy Bỏ
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="btn-luxury-cta px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'Cập Nhật Sản Phẩm' : 'Lưu Sản Phẩm Mới'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. MAIN 2-COLUMN LAYOUT (FORM + LIVE PREVIEW) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI (COL 8): FORM THÔNG TIN CHI TIẾT */}
          <div className="lg:col-span-8 space-y-5">

            {/* CARD 1: TÊN SẢN PHẨM & DANH MỤC */}
            <div className="glass-card-luxury p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DFD3]/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F7ECE8] text-[#C59B6D] flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="font-serif-boutique text-lg font-bold text-[#231F1C]">
                    Thông Tin Cơ Bản Vòng Tay
                  </h3>
                </div>
                <span className="text-[11px] text-[#948A7E] italic">* Bắt buộc điền</span>
              </div>

              {/* Tên sản phẩm */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#231F1C] text-xs sm:text-sm">
                    Tên sản phẩm vòng tay / gương đính: *
                  </label>
                  {productFormData.name && (
                    <button
                      type="button"
                      onClick={() => setProductFormData({ ...productFormData, name: '' })}
                      className="text-[11px] text-[#C59B6D] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Xóa tên
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Vòng Tay Cá Voi Xanh Gốm Men Pastel"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    className="w-full glass-input p-3 pr-10 rounded-2xl text-sm font-semibold text-[#231F1C] placeholder:text-[#948A7E]/60"
                  />
                  {productFormData.name && (
                    <button
                      type="button"
                      onClick={() => setProductFormData({ ...productFormData, name: '' })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Danh mục & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="font-bold text-[#231F1C] text-xs block mb-1.5">
                    Danh mục sản phẩm: *
                  </label>
                  <select
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    className="w-full glass-input p-3 rounded-2xl text-xs font-semibold text-[#231F1C] cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#231F1C] text-xs block mb-1.5">
                    Huy hiệu nhãn (Badge Tag):
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Hot Trend, Bán chạy, Độc bản xưởng..."
                    value={productFormData.tag}
                    onChange={(e) => setProductFormData({ ...productFormData, tag: e.target.value })}
                    className="w-full glass-input p-3 rounded-2xl text-xs font-medium text-[#231F1C]"
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: GIÁ BÁN & TỒN KHO */}
            <div className="glass-card-luxury p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DFD3]/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FBF4E8] text-[#C59B6D] flex items-center justify-center font-bold">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif-boutique text-lg font-bold text-[#231F1C]">
                      Giá Bán & Quản Lý Kho Hàng
                    </h3>
                    <p className="text-[11px] text-[#948A7E]">Nhập số tự nhiên mượt mà, tự động định dạng VNĐ</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Giá bán lẻ */}
                <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#C59B6D] text-xs flex items-center gap-1">
                      <span>Giá bán lẻ (₫): *</span>
                    </label>
                    {retailPrice > 0 && (
                      <span className="text-xs font-bold text-[#C59B6D] bg-[#FAF4E8] px-2 py-0.5 rounded-md">
                        {new Intl.NumberFormat('vi-VN').format(retailPrice)} đ
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ví dụ: 195000"
                      value={productFormData.price}
                      onChange={(e) => {
                        const clean = cleanNumberInput(e.target.value);
                        setProductFormData(prev => ({
                          ...prev,
                          price: clean,
                          wholesalePrice: (!prev.wholesalePrice && clean) ? String(Math.round(Number(clean) * 0.7)) : prev.wholesalePrice
                        }));
                      }}
                      className="w-full glass-input p-3 rounded-xl font-bold text-[#C59B6D] text-base"
                    />
                  </div>
                  <p className="text-[10px] text-[#948A7E] mt-1.5">Giá niêm yết khi khách mua lẻ trên website</p>
                </div>

                {/* Giá bán sỉ */}
                <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#4E6857] text-xs flex items-center gap-1">
                      <span>Giá sỉ xưởng (₫):</span>
                    </label>
                    {wholesalePrice > 0 && (
                      <span className="text-xs font-bold text-[#4E6857] bg-[#E5EDE8] px-2 py-0.5 rounded-md">
                        {new Intl.NumberFormat('vi-VN').format(wholesalePrice)} đ
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Tự tính ~70% giá lẻ"
                    value={productFormData.wholesalePrice}
                    onChange={(e) => setProductFormData({ ...productFormData, wholesalePrice: cleanNumberInput(e.target.value) })}
                    className="w-full glass-input p-3 rounded-xl font-bold text-[#4E6857] text-base"
                  />
                  <p className="text-[10px] text-[#948A7E] mt-1.5">Dành cho cộng tác viên và đại lý sỉ</p>
                </div>

                {/* Sỉ tối thiểu & Tồn kho */}
                <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                  <label className="font-bold text-[#231F1C] text-xs block mb-1.5">
                    Số lượng sỉ tối thiểu (chiếc):
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={productFormData.wholesaleMinQty}
                    onChange={(e) => setProductFormData({ ...productFormData, wholesaleMinQty: cleanNumberInput(e.target.value) })}
                    className="w-full glass-input p-2.5 rounded-xl font-semibold text-xs text-[#231F1C]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                  <label className="font-bold text-[#231F1C] text-xs block mb-1.5">
                    Số lượng tồn kho (chiếc):
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({ ...productFormData, stock: cleanNumberInput(e.target.value) })}
                    className="w-full glass-input p-2.5 rounded-xl font-semibold text-xs text-[#231F1C]"
                  />
                </div>

              </div>
            </div>

            {/* CARD 3: HÌNH ẢNH & AI GEMINI VISION */}
            <div className="glass-card-luxury p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DFD3]/60 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EFEBF6] text-[#6B5B95] flex items-center justify-center font-bold">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif-boutique text-lg font-bold text-[#231F1C]">
                      Hình Ảnh Sản Phẩm & AI Bóc Tách
                    </h3>
                    <p className="text-[11px] text-[#948A7E]">Tải ảnh lên, chọn ảnh mẫu hoặc phân tích tự động</p>
                  </div>
                </div>

                {/* AI Gemini Vision Button */}
                <button
                  type="button"
                  onClick={() => {
                    const currentImg = productFormData.images?.[0];
                    if (currentImg) handleAutoAnalyzeImage(currentImg, false);
                    else alert('Vui lòng nhập hoặc chọn ảnh trước khi phân tích AI');
                  }}
                  disabled={isAnalyzingCord || !productFormData.images?.[0]}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#C59B6D] to-[#B86244] text-white text-xs font-bold shadow-sm hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingCord ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzingCord ? 'AI Đang Phân Tích...' : 'AI Phân Tích Dây & Charm'}</span>
                </button>
              </div>

              {/* Status banner nếu AI đang chạy */}
              {aiAnalysisStatus && (
                <div className="p-3 rounded-2xl bg-[#FAF4E8] border border-[#EADBCC] text-xs text-[#B86244] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 animate-pulse text-[#C59B6D]" />
                  <span>{aiAnalysisStatus}</span>
                </div>
              )}

              {/* URL Input & Upload */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nhập đường dẫn ảnh trực tiếp (VD: /images/products/... hoặc https://...)"
                    value={productFormData.images?.[0] || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, images: [e.target.value] })}
                    className="flex-1 glass-input p-3 rounded-2xl text-xs font-medium text-[#231F1C]"
                  />
                  <label className="px-4 py-3 rounded-2xl bg-white/90 hover:bg-white text-[#231F1C] border border-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 transition-all">
                    <Upload className="w-3.5 h-3.5 text-[#C59B6D]" />
                    <span className="hidden sm:inline">Tải File Lên</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Thư viện ảnh mẫu chọn nhanh */}
                <div>
                  <span className="text-[11px] font-bold text-[#6B6258] block mb-2">
                    Hoặc chọn nhanh từ thư viện ảnh chụp xưởng:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {sampleImages.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProductFormData({ ...productFormData, images: [s.url] })}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          productFormData.images?.[0] === s.url
                            ? 'border-[#C59B6D] ring-2 ring-[#C59B6D]/30 scale-95'
                            : 'border-white/80 hover:border-[#C59B6D]/60'
                        }`}
                        title={s.label}
                      >
                        <img src={s.url} alt={s.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        {productFormData.images?.[0] === s.url && (
                          <div className="absolute inset-0 bg-[#C59B6D]/30 flex items-center justify-center text-white">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: THUỘC TÍNH & PHONG THỦY */}
            <div className="glass-card-luxury p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E8DFD3]/60 pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#E5EDE8] text-[#4E6857] flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-boutique text-lg font-bold text-[#231F1C]">
                    Thuộc Tính Thủ Công & Cung Mệnh
                  </h3>
                  <p className="text-[11px] text-[#948A7E]">Giúp khách hàng dễ dàng tìm kiếm theo ngũ hành phong thủy</p>
                </div>
              </div>

              {/* Ngũ hành Mệnh */}
              <div>
                <label className="font-bold text-[#231F1C] text-xs block mb-2">
                  Ngũ Hành Hợp Mệnh (Có thể chọn nhiều mệnh):
                </label>
                <div className="flex flex-wrap gap-2">
                  {menhOptions.map(m => {
                    const isSelected = (productFormData.menh || []).includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleMenh(m.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? `${m.color} ring-2 ring-offset-1 ring-[#C59B6D]/40 font-bold shadow-xs`
                            : 'bg-white/60 text-[#6B6258] border-white/80 hover:bg-white'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chất liệu đá, dây, kích thước hạt */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="font-bold text-[#231F1C] text-xs block mb-1">Chất liệu đá / gốm:</label>
                  <input
                    type="text"
                    value={productFormData.stoneType}
                    onChange={(e) => setProductFormData({ ...productFormData, stoneType: e.target.value })}
                    placeholder="Gốm men nung & Thạch anh"
                    className="w-full glass-input p-2.5 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#231F1C] text-xs block mb-1">Loại dây đan:</label>
                  <input
                    type="text"
                    value={productFormData.cordType}
                    onChange={(e) => setProductFormData({ ...productFormData, cordType: e.target.value })}
                    placeholder="Dây chỉ sáp dệt Macrame"
                    className="w-full glass-input p-2.5 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#231F1C] text-xs block mb-1">Kích thước hạt:</label>
                  <input
                    type="text"
                    value={productFormData.beadSize}
                    onChange={(e) => setProductFormData({ ...productFormData, beadSize: e.target.value })}
                    placeholder="8mm hoặc Freesize"
                    className="w-full glass-input p-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* CARD 5: CÂU CHUYỆN & Ý NGHĨA */}
            <div className="glass-card-luxury p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E8DFD3]/60 pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF4E8] text-[#C59B6D] flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-serif-boutique text-lg font-bold text-[#231F1C]">
                  Câu Chuyện & Ý Nghĩa Phong Thủy
                </h3>
              </div>

              <div>
                <label className="font-bold text-[#231F1C] text-xs block mb-1.5">Mô tả sản phẩm:</label>
                <textarea
                  rows={3}
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  placeholder="Mô tả kỹ thuật đan, điểm nhấn charm và cảm xúc khi đeo..."
                  className="w-full glass-input p-3 rounded-2xl text-xs leading-relaxed text-[#231F1C]"
                />
              </div>

              <div>
                <label className="font-bold text-[#231F1C] text-xs block mb-1.5">Ý nghĩa phong thủy & may mắn:</label>
                <input
                  type="text"
                  value={productFormData.meaning}
                  onChange={(e) => setProductFormData({ ...productFormData, meaning: e.target.value })}
                  placeholder="Ví dụ: Bình an, thu hút tài lộc, giữ tâm an yên..."
                  className="w-full glass-input p-3 rounded-2xl text-xs text-[#231F1C]"
                />
              </div>

              {/* Tùy chọn ẩn hiện & best seller */}
              <div className="flex items-center gap-6 pt-2 border-t border-[#E8DFD3]/60">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#231F1C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productFormData.isBestSeller}
                    onChange={(e) => setProductFormData({ ...productFormData, isBestSeller: e.target.checked })}
                    className="w-4 h-4 text-[#C59B6D] rounded-md"
                  />
                  <span>Đánh dấu là Bán Chạy (Best Seller)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-[#231F1C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productFormData.isHidden}
                    onChange={(e) => setProductFormData({ ...productFormData, isHidden: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded-md"
                  />
                  <span className={productFormData.isHidden ? 'text-rose-600 font-bold' : ''}>
                    Ẩn tạm thời khỏi gian hàng
                  </span>
                </label>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI (COL 4): LIVE PRODUCT PREVIEW CARD (STICKY) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
            <div className="glass-panel p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DFD3]/60 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#C59B6D]" />
                  <h3 className="font-serif-boutique text-base font-bold text-[#231F1C]">
                    Xem Trước Trực Quan
                  </h3>
                </div>
                <span className="text-[10px] bg-[#FAF4E8] text-[#C59B6D] font-bold px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>

              {/* Card Mô Phỏng Giống Ngoài Gian Hàng */}
              <div className="bg-white/90 rounded-3xl overflow-hidden border border-white shadow-lg flex flex-col">
                <div className="relative aspect-square bg-[#F5EFE6] overflow-hidden">
                  <img
                    src={productFormData.images?.[0] || '/images/products/bracelet-pastel-macrame-trio.jpg'}
                    alt={productFormData.name || 'Xem trước'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/images/products/bracelet-pastel-macrame-trio.jpg'; }}
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    {productFormData.isBestSeller && (
                      <span className="bg-gradient-to-r from-amber-600 to-[#C59B6D] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-yellow-200" />
                        <span>BEST SELLER</span>
                      </span>
                    )}
                    {productFormData.tag && (
                      <span className="bg-[#231F1C]/85 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                        {productFormData.tag}
                      </span>
                    )}
                    {productFormData.menh && productFormData.menh.length > 0 && productFormData.menh[0] !== 'Tất cả' && (
                      <span className="bg-white/95 text-[#C59B6D] border border-[#E8DFD3] text-[10px] font-medium px-2 py-0.5 rounded-full shadow-2xs">
                        Mệnh: {productFormData.menh.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] text-[#948A7E] uppercase tracking-wider font-semibold">
                    {productFormData.stoneType || 'Gốm men nung thủ công'}
                  </span>
                  <h4 className="font-serif-boutique text-base font-bold text-[#231F1C] leading-snug line-clamp-2">
                    {productFormData.name || 'Tên sản phẩm vòng tay mẫu'}
                  </h4>

                  <div className="pt-2 flex items-baseline justify-between border-t border-[#F5EFE6]">
                    <div>
                      <span className="text-base font-bold text-[#C59B6D]">
                        {retailPrice > 0 ? `${new Intl.NumberFormat('vi-VN').format(retailPrice)}₫` : '195.000₫'}
                      </span>
                      {originalPrice > retailPrice && (
                        <span className="text-xs text-[#948A7E] line-through ml-2">
                          {new Intl.NumberFormat('vi-VN').format(originalPrice)}₫
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#4E6857] font-semibold bg-[#E5EDE8] px-2 py-0.5 rounded-md">
                      Kho: {productFormData.stock || 20}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checklist sẵn sàng lưu */}
              <div className="p-3.5 rounded-2xl bg-white/60 border border-white text-xs space-y-2">
                <span className="font-bold text-[#231F1C] block text-[11px] uppercase tracking-wider">
                  Kiểm tra tính hợp lệ:
                </span>
                <div className="space-y-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${productFormData.name?.trim() ? 'text-emerald-700' : 'text-amber-600'}`}>
                    <span>{productFormData.name?.trim() ? '✓ Đã nhập tên sản phẩm' : '⚠ Chưa nhập tên sản phẩm'}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${retailPrice > 0 ? 'text-emerald-700' : 'text-amber-600'}`}>
                    <span>{retailPrice > 0 ? '✓ Đã nhập giá bán hợp lệ' : '⚠ Chưa nhập giá bán'}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${productFormData.images?.[0] ? 'text-emerald-700' : 'text-amber-600'}`}>
                    <span>{productFormData.images?.[0] ? '✓ Đã có ảnh đại diện' : '⚠ Chưa có ảnh'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Preview Column */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isSaving || !productFormData.name?.trim() || !retailPrice}
                  className="w-full btn-luxury-cta py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang lưu vào Neon DB...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingProduct ? 'Cập Nhật Ngay' : 'Lưu Vào Cơ Sở Dữ Liệu'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full py-2.5 rounded-2xl bg-white/70 hover:bg-white text-[#6B6258] hover:text-[#231F1C] font-semibold text-xs border border-white transition-all cursor-pointer"
                >
                  Hủy và quay lại kho
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
