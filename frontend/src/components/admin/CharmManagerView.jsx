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
  ShieldCheck,
  CircleDot
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

const beadColorPresets = [
  { name: 'Thạch Anh Dâu Hồng', color: '#EAA9A9', menh: 'Hỏa, Thổ' },
  { name: 'Ngôi Sao Thủy Tinh', color: '#E8F1F5', menh: 'Kim, Thủy' },
  { name: 'Ngọc Tím Lam Lavender', color: '#D4CEEB', menh: 'Thủy, Thổ' },
  { name: 'Cặp Lá Non Xanh Mint', color: '#BDE6C8', menh: 'Mộc, Hỏa' },
  { name: 'Hoa Anh Đào Pastel', color: '#FBCFD0', menh: 'Hỏa, Thổ' },
  { name: 'Mặt Trăng Moonstone', color: '#DCE6ED', menh: 'Kim, Thủy' },
  { name: 'Thạch Anh Tím Sâu', color: '#9973B8', menh: 'Hỏa, Thổ' },
  { name: 'Đá Mắt Hổ Vàng Nâu', color: '#A06E28', menh: 'Kim, Thổ' },
  { name: 'Ngọc Bích Hòa Điền', color: '#668F6C', menh: 'Mộc, Hỏa' },
  { name: 'Lam Ngọc Aquamarine', color: '#73B4C8', menh: 'Thủy, Mộc' },
  { name: 'Núi Lửa Đen Nhám', color: '#3A3A3A', menh: 'Thủy, Kim' },
  { name: 'Gỗ Trầm Tự Nhiên', color: '#6E4D34', menh: 'Mộc, Thủy' }
];

const menhList = [
  { id: 'Tất cả', label: 'Tất Cả Mệnh', color: 'bg-stone-100 text-stone-800 border-stone-300' },
  { id: 'Kim', label: 'Mệnh Kim (Trắng, Vàng)', color: 'bg-amber-50 text-amber-800 border-amber-300' },
  { id: 'Mộc', label: 'Mệnh Mộc (Xanh Lục)', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { id: 'Thủy', label: 'Mệnh Thủy (Xanh Biển)', color: 'bg-sky-50 text-sky-800 border-sky-300' },
  { id: 'Hỏa', label: 'Mệnh Hỏa (Đỏ, Hồng)', color: 'bg-rose-50 text-rose-800 border-rose-300' },
  { id: 'Thổ', label: 'Mệnh Thổ (Vàng Đất, Nâu)', color: 'bg-orange-50 text-orange-800 border-orange-300' }
];

export default function CharmManagerView({ charms = [], beads = [], onRefresh, triggerToast }) {
  // SUB-TAB: 'charms' (Kho Charm) | 'beads' (Kho Hạt Đá)
  const [activeTab, setActiveTab] = useState('charms');

  // WORKSPACE VIEW STATE: 'list' (Danh sách) | 'charm-editor' | 'bead-editor'
  const [workspaceView, setWorkspaceView] = useState('list');
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Selected bead pairing for charm preview
  const [previewBeadId, setPreviewBeadId] = useState(beads[0]?.id || 'bead-strawberry');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState('all');
  const [selectedMenhFilter, setSelectedMenhFilter] = useState('all');

  // Form Data for Charm
  const [charmFormData, setCharmFormData] = useState({
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

  // Form Data for Bead (Hạt Đá Phong Thủy)
  const [beadFormData, setBeadFormData] = useState({
    name: '',
    pricePerBead: '8000',
    color: '#EAA9A9',
    previewClass: 'bg-rose-300',
    menh: ['Hỏa'],
    desc: 'Tình duyên ngọt ngào',
    meaning: 'Mang lại sự gắn kết yêu thương, dung hòa các mối quan hệ và thu hút duyên lành bình an.',
    stock: '150',
    inStock: true,
    image: ''
  });

  // Open Charm Editor Workspace
  const handleOpenNewCharmWorkspace = () => {
    setEditingItem(null);
    setErrorMessage('');
    setCharmFormData({
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
    setWorkspaceView('charm-editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditCharmWorkspace = (charm) => {
    setEditingItem(charm);
    setErrorMessage('');
    setCharmFormData({
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
    setWorkspaceView('charm-editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Bead Editor Workspace
  const handleOpenNewBeadWorkspace = () => {
    setEditingItem(null);
    setErrorMessage('');
    setBeadFormData({
      name: '',
      pricePerBead: '10000',
      color: '#EAA9A9',
      previewClass: 'bg-rose-300',
      menh: ['Tất cả'],
      desc: 'Năng lượng phong thủy an lành',
      meaning: 'Thanh tẩy tâm hồn, cân bằng cảm xúc và mang lại nguồn sinh khí mới.',
      stock: '120',
      inStock: true,
      image: ''
    });
    setWorkspaceView('bead-editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditBeadWorkspace = (bead) => {
    setEditingItem(bead);
    setErrorMessage('');
    const mArray = Array.isArray(bead.menh) 
      ? bead.menh 
      : (typeof bead.menh === 'string' ? bead.menh.split(', ') : ['Tất cả']);
    setBeadFormData({
      name: bead.name || '',
      pricePerBead: String(bead.pricePerBead || '8000'),
      color: bead.color || '#EAA9A9',
      previewClass: bead.previewClass || 'bg-rose-300',
      menh: mArray.length > 0 ? mArray : ['Tất cả'],
      desc: bead.desc || bead.description || '',
      meaning: bead.meaning || '',
      stock: String(bead.stock || '100'),
      inStock: bead.inStock !== false,
      image: bead.image || ''
    });
    setWorkspaceView('bead-editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle file uploads
  const handleCharmFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) setCharmFormData(prev => ({ ...prev, image: event.target.result }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBeadFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) setBeadFormData(prev => ({ ...prev, image: event.target.result }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Toggle Menh
  const handleToggleCharmMenh = (item) => {
    const current = charmFormData.menh || [];
    if (item === 'Tất cả') {
      setCharmFormData(prev => ({ ...prev, menh: ['Tất cả'] }));
      return;
    }
    let updated = current.filter(m => m !== 'Tất cả');
    if (updated.includes(item)) {
      updated = updated.filter(m => m !== item);
      if (updated.length === 0) updated = ['Tất cả'];
    } else {
      updated.push(item);
    }
    setCharmFormData(prev => ({ ...prev, menh: updated }));
  };

  const handleToggleBeadMenh = (item) => {
    const current = beadFormData.menh || [];
    if (item === 'Tất cả') {
      setBeadFormData(prev => ({ ...prev, menh: ['Tất cả'] }));
      return;
    }
    let updated = current.filter(m => m !== 'Tất cả');
    if (updated.includes(item)) {
      updated = updated.filter(m => m !== item);
      if (updated.length === 0) updated = ['Tất cả'];
    } else {
      updated.push(item);
    }
    setBeadFormData(prev => ({ ...prev, menh: updated }));
  };

  // Save Charm
  const handleSaveCharm = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    if (!charmFormData.name.trim()) {
      setErrorMessage('Vui lòng nhập tên cho charm thủ công!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const numPrice = Number(charmFormData.price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMessage('Vui lòng nhập giá bán hợp lệ cho charm!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: charmFormData.name.trim(),
        material: charmFormData.material.trim(),
        category: charmFormData.category.trim(),
        price: numPrice,
        image: charmFormData.image.trim(),
        icon: charmFormData.icon || 'Sparkles',
        desc: charmFormData.desc.trim(),
        description: charmFormData.desc.trim(),
        meaning: charmFormData.meaning.trim(),
        stock: Number(charmFormData.stock) || 0,
        inStock: Boolean(charmFormData.inStock),
        menh: charmFormData.menh,
        sizeMm: charmFormData.sizeMm.trim()
      };

      if (editingItem) {
        await api.updateCharm(editingItem.id, payload);
        if (triggerToast) triggerToast(`Đã cập nhật charm "${payload.name}" thành công!`, 'success');
      } else {
        await api.createCharm(payload);
        if (triggerToast) triggerToast(`Đã thêm charm mới "${payload.name}" vào kho!`, 'success');
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

  // Save Bead
  const handleSaveBead = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    if (!beadFormData.name.trim()) {
      setErrorMessage('Vui lòng nhập tên loại hạt đá phong thủy!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const numPrice = Number(beadFormData.pricePerBead);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMessage('Vui lòng nhập đơn giá hợp lệ cho mỗi hạt đá!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: beadFormData.name.trim(),
        pricePerBead: numPrice,
        color: beadFormData.color || '#EAA9A9',
        previewClass: beadFormData.previewClass || 'bg-rose-300',
        menh: beadFormData.menh,
        desc: beadFormData.desc.trim(),
        description: beadFormData.desc.trim(),
        meaning: beadFormData.meaning.trim(),
        stock: Number(beadFormData.stock) || 0,
        inStock: Boolean(beadFormData.inStock),
        image: beadFormData.image.trim()
      };

      if (editingItem) {
        await api.updateBead(editingItem.id, payload);
        if (triggerToast) triggerToast(`Đã cập nhật hạt đá "${payload.name}" thành công!`, 'success');
      } else {
        await api.createBead(payload);
        if (triggerToast) triggerToast(`Đã thêm hạt đá mới "${payload.name}" vào kho!`, 'success');
      }

      setWorkspaceView('list');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Lỗi khi lưu hạt đá:', err);
      setErrorMessage('Lỗi lưu hạt đá: ' + (err.message || 'Không xác định'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Stock & Delete Handlers
  const handleToggleCharmStock = async (charm) => {
    try {
      const res = await api.toggleCharmStock(charm.id);
      if (triggerToast) triggerToast(`Đã chuyển trạng thái charm ${charm.name}: ${res.data?.inStock ? 'Còn hàng' : 'Tạm hết'}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Lỗi đổi trạng thái charm: ' + err.message);
    }
  };

  const handleToggleBeadStock = async (bead) => {
    try {
      const res = await api.toggleBeadStock(bead.id);
      if (triggerToast) triggerToast(`Đã chuyển trạng thái hạt đá ${bead.name}: ${res.data?.inStock ? 'Còn hàng' : 'Tạm hết'}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Lỗi đổi trạng thái hạt đá: ' + err.message);
    }
  };

  const handleDeleteCharm = async (charm) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa charm "${charm.name}" khỏi kho?`)) return;
    setIsDeletingId(charm.id);
    try {
      await api.deleteCharm(charm.id);
      if (triggerToast) triggerToast(`Đã xóa charm "${charm.name}" thành công!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Lỗi xóa charm: ' + err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleDeleteBead = async (bead) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hạt đá "${bead.name}" khỏi kho?`)) return;
    setIsDeletingId(bead.id);
    try {
      await api.deleteBead(bead.id);
      if (triggerToast) triggerToast(`Đã xóa hạt đá "${bead.name}" thành công!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Lỗi xóa hạt đá: ' + err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  const selectedPreviewBead = beads.find(b => b.id === previewBeadId) || beads[0] || { color: '#EAA9A9', name: 'Thạch Anh Dâu' };

  // =========================================================================
  // VIEW: GIAO DIỆN CỨNG THÊM / CHỈNH SỬA HẠT ĐÁ (DEDICATED BEAD WORKSPACE)
  // =========================================================================
  if (workspaceView === 'bead-editor') {
    const estimatedFullBraceletPrice = (Number(beadFormData.pricePerBead) || 0) * 21;

    return (
      <div className="space-y-6 animate-fadeIn pb-24 lg:pb-12">
        {/* Header */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-2 z-30 backdrop-blur-md bg-white/95">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setWorkspaceView('list')}
              className="p-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2E5D5] text-[#26211C] border border-[#E8DFD3] transition-all flex items-center gap-2 font-bold text-xs cursor-pointer shadow-2xs group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-[#B86244]" />
              <span>Quay Lại Kho Hạt Đá</span>
            </button>
            <div className="h-6 w-[1px] bg-[#E8DFD3] hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider">
                  XƯỞNG TỰ PHỐI · HẠT ĐÁ PHONG THỦY
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  editingItem 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {editingItem ? `Chỉnh sửa #${editingItem.id}` : '+ Tạo mẫu hạt mới'}
                </span>
              </div>
              <h2 className="font-serif-boutique text-xl sm:text-2xl font-bold text-[#26211C] mt-0.5">
                {editingItem ? `Chỉnh Sửa Hạt Đá: ${editingItem.name}` : 'Thêm Loại Hạt Đá Mới Vào Xưởng'}
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
              onClick={handleSaveBead}
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
                  <span>{editingItem ? 'Lưu Cập Nhật Hạt' : 'Tạo Hạt Đá Mới'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs animate-shake">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
            <button type="button" onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Grid */}
        <form onSubmit={handleSaveBead} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card 1: Thông tin & Đơn giá từng hạt */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#F5EFE6] pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF4E8] text-[#C59B6D] flex items-center justify-center font-bold">
                  <CircleDot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-boutique text-base font-bold text-[#231F1C]">
                    1. Định Danh & Đơn Giá Từng Hạt Đá
                  </h3>
                  <p className="text-[11px] text-[#948A7E]">
                    Giá mỗi hạt sẽ nhân tự động theo size cổ tay của khách (19 - 27 hạt) trong Studio tự phối
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#231F1C] flex items-center gap-1">
                    <span>Tên Hạt Đá Phong Thủy:</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Thạch Anh Dâu Hồng Tự Nhiên"
                    value={beadFormData.name}
                    onChange={(e) => setBeadFormData({ ...beadFormData, name: e.target.value })}
                    className="w-full glass-input p-3 rounded-2xl font-bold text-sm text-[#231F1C] border border-[#E8DFD3]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#C59B6D] flex items-center justify-between">
                    <span>Giá mỗi hạt (₫/hạt):</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      step="500"
                      placeholder="8000"
                      value={beadFormData.pricePerBead}
                      onChange={(e) => setBeadFormData({ ...beadFormData, pricePerBead: e.target.value })}
                      className="w-full glass-input p-3 pr-12 rounded-2xl font-bold text-sm text-[#C59B6D] border border-[#E8DFD3]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#C59B6D]">₫</span>
                  </div>
                  <div className="text-[10px] text-[#8C8276] bg-[#FAF4E8] px-2.5 py-1 rounded-xl border border-[#EADBCC]">
                    Vòng chuẩn 21 hạt = <strong>{estimatedFullBraceletPrice.toLocaleString('vi-VN')}₫</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F5EFE6]">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#231F1C]">Số lượng tồn kho (viên hạt):</label>
                  <input
                    type="number"
                    min="0"
                    value={beadFormData.stock}
                    onChange={(e) => setBeadFormData({ ...beadFormData, stock: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl text-xs font-bold text-[#231F1C] border border-[#E8DFD3]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#231F1C]">Trạng thái mở bán:</label>
                  <div 
                    onClick={() => setBeadFormData({ ...beadFormData, inStock: !beadFormData.inStock })}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      beadFormData.inStock 
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800' 
                        : 'bg-rose-50/80 border-rose-300 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${beadFormData.inStock ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      <span className="text-xs font-bold">
                        {beadFormData.inStock ? 'Sẵn sàng cho khách phối' : 'Tạm hết hạt / Ẩn'}
                      </span>
                    </div>
                    <span className="text-[10px] underline font-semibold">Đổi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Màu sắc & Ảnh hạt đá */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#F5EFE6] pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF4E8] text-[#C59B6D] flex items-center justify-center font-bold">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-boutique text-base font-bold text-[#231F1C]">
                    2. Màu Sắc & Hiệu Ứng Trực Quan 2D
                  </h3>
                  <p className="text-[11px] text-[#948A7E]">
                    Màu hex được dùng để tạo gradient 3D chân thực trên từng viên hạt của vòng tay
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* Bead Color Preview Box */}
                <div className="aspect-square rounded-2xl bg-gradient-to-b from-[#FAF7F2] to-[#EDE4D6] p-4 flex flex-col items-center justify-center border border-[#EADBCC] shadow-inner relative">
                  <div 
                    className="w-20 h-20 rounded-full shadow-2xl border-2 border-white/80 relative flex items-center justify-center transition-transform hover:scale-105"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${beadFormData.color} 45%, #1A1A1A 100%)`
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-white/70 absolute top-3 left-4 filter blur-[0.5px]" />
                  </div>
                  <span className="text-xs font-bold text-[#231F1C] mt-2 block">
                    {beadFormData.color}
                  </span>
                  <span className="text-[10px] text-[#948A7E]">Mô phỏng 3D</span>
                </div>

                {/* Color Picker & Presets */}
                <div className="sm:col-span-2 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={beadFormData.color}
                      onChange={(e) => setBeadFormData({ ...beadFormData, color: e.target.value })}
                      className="w-12 h-12 rounded-xl cursor-pointer border border-[#E8DFD3] p-1 bg-white shrink-0"
                    />
                    <div className="flex-1">
                      <label className="text-xs font-bold text-[#231F1C] block mb-1">Mã màu Hex:</label>
                      <input
                        type="text"
                        value={beadFormData.color}
                        onChange={(e) => setBeadFormData({ ...beadFormData, color: e.target.value })}
                        className="w-full glass-input p-2 rounded-xl text-xs font-mono font-bold text-[#231F1C] border border-[#E8DFD3]"
                      />
                    </div>
                  </div>

                  {/* Preset Colors */}
                  <div>
                    <label className="text-[11px] font-bold text-[#8C8276] block mb-1.5">
                      Chọn nhanh từ bảng màu đá quý xưởng:
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {beadColorPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setBeadFormData({ ...beadFormData, color: preset.color, name: beadFormData.name || preset.name })}
                          className={`p-1 rounded-lg border text-center flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                            beadFormData.color.toLowerCase() === preset.color.toLowerCase()
                              ? 'border-[#B86244] ring-2 ring-[#B86244]/30 bg-[#FAF4E8]'
                              : 'border-[#E8DFD3] bg-white hover:bg-[#FAF7F2]'
                          }`}
                          title={preset.name}
                        >
                          <span className="w-5 h-5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: preset.color }} />
                          <span className="text-[8px] text-[#231F1C] truncate max-w-full font-medium">
                            {preset.name.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Real Photo */}
              <div className="pt-3 border-t border-[#F5EFE6] space-y-2">
                <label className="text-xs font-bold text-[#231F1C] block">
                  Ảnh phôi hạt đá cận cảnh (Tùy chọn):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBeadFileUpload}
                    className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FAF4E8] file:text-[#C59B6D] cursor-pointer"
                  />
                  <input
                    type="url"
                    placeholder="Hoặc dán URL ảnh..."
                    value={beadFormData.image}
                    onChange={(e) => setBeadFormData({ ...beadFormData, image: e.target.value })}
                    className="flex-1 glass-input p-2 rounded-xl text-xs border border-[#E8DFD3]"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Ngũ hành & Ý nghĩa phong thủy */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#F5EFE6] pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF4E8] text-[#C59B6D] flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-boutique text-base font-bold text-[#231F1C]">
                    3. Ngũ Hành Tương Sinh & Năng Lượng Tâm An
                  </h3>
                  <p className="text-[11px] text-[#948A7E]">
                    Bản mệnh hợp với hạt đá để tư vấn và phân loại tự động
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#231F1C] block">
                  Mệnh ngũ hành tương hợp:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {menhList.map(m => {
                    const isSelected = beadFormData.menh.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleBeadMenh(m.id)}
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

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-[#231F1C] block">
                  Ý nghĩa may mắn & Năng lượng đá:
                </label>
                <textarea
                  rows="3"
                  placeholder="Ví dụ: Mang lại sự an yên, thu hút tình duyên ngọt ngào và chữa lành tâm hồn..."
                  value={beadFormData.meaning}
                  onChange={(e) => setBeadFormData({ ...beadFormData, meaning: e.target.value })}
                  className="w-full glass-input p-3 rounded-2xl text-xs text-[#231F1C] border border-[#E8DFD3]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#231F1C] block">
                  Mô tả ngắn gọn đặc tính hạt:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hạt tròn 8mm nhẵn bóng, màu pastel ngọt ngào"
                  value={beadFormData.desc}
                  onChange={(e) => setBeadFormData({ ...beadFormData, desc: e.target.value })}
                  className="w-full glass-input p-2.5 rounded-xl text-xs text-[#231F1C] border border-[#E8DFD3]"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Live Bracelet Canvas Simulation */}
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4 sticky top-28">
              <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C59B6D]" />
                  <h4 className="font-serif-boutique text-sm font-bold text-[#231F1C]">
                    Mô Phỏng Vòng 21 Hạt Thật
                  </h4>
                </div>
                <span className="text-[10px] bg-[#FAF4E8] text-[#C59B6D] font-bold px-2 py-0.5 rounded-full border border-[#EADBCC]">
                  Studio Canvas
                </span>
              </div>

              {/* 2D Circular Canvas */}
              <div className="aspect-square rounded-2xl bg-gradient-to-tr from-[#FAF7F2] via-[#F3ECE1] to-[#FAF7F2] p-4 flex flex-col items-center justify-center relative overflow-hidden border border-[#EADBCC] shadow-inner">
                <div className="w-44 h-44 rounded-full border-2 border-dashed border-[#C59B6D]/50 flex items-center justify-center relative">
                  
                  {/* 21 Beads rendered around the circle */}
                  {Array.from({ length: 20 }).map((_, i) => {
                    const angle = (i / 20) * 2 * Math.PI - Math.PI / 2;
                    const r = 74;
                    const x = 88 + r * Math.cos(angle) - 6;
                    const y = 88 + r * Math.sin(angle) - 6;
                    return (
                      <div
                        key={i}
                        className="w-3.5 h-3.5 rounded-full shadow-sm absolute border border-white/60"
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                          background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${beadFormData.color} 50%, #1A1A1A 100%)`
                        }}
                      />
                    );
                  })}

                  {/* Charm at bottom */}
                  <div className="absolute -bottom-4 z-10 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#C59B6D] flex items-center justify-center p-1 shadow-md">
                      {charms[0]?.image ? (
                        <img src={charms[0].image} alt="Charm mẫu" className="w-full h-full object-contain" />
                      ) : (
                        <Gem className="w-5 h-5 text-[#C59B6D]" />
                      )}
                    </div>
                  </div>

                  {/* Center Text */}
                  <div className="text-center p-1">
                    <span className="font-serif-boutique text-[11px] font-bold text-[#8C8276] uppercase tracking-widest block">
                      HẠT ĐÁ CHÍNH
                    </span>
                    <span className="font-serif-boutique text-xs font-bold text-[#231F1C] block line-clamp-1">
                      {beadFormData.name || 'Thạch Anh'}
                    </span>
                    <span className="text-[9px] text-[#C59B6D] font-bold block mt-0.5">
                      {Number(beadFormData.pricePerBead || 0).toLocaleString('vi-VN')}₫ / hạt
                    </span>
                  </div>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${
                    beadFormData.inStock 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}>
                    {beadFormData.inStock ? 'Sẵn sàng' : 'Tạm hết'}
                  </span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#948A7E]">Đơn giá hạt:</span>
                  <span className="font-bold text-[#231F1C]">
                    {Number(beadFormData.pricePerBead || 0).toLocaleString('vi-VN')}₫ / viên
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#948A7E]">Vòng chuẩn 21 hạt:</span>
                  <span className="font-bold text-[#C59B6D]">
                    {estimatedFullBraceletPrice.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#948A7E]">Hợp mệnh:</span>
                  <span className="font-bold text-[#C59B6D]">{beadFormData.menh.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#EADBCC]">
                  <span className="font-bold text-[#231F1C]">Ước tính trọn bộ (Dây + Đá + Charm):</span>
                  <span className="font-bold text-sm text-[#B86244]">
                    {(estimatedFullBraceletPrice + 30000 + 55000 + 30000).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              {/* Actions */}
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
                      <span>{editingItem ? 'Lưu Cập Nhật Hạt Đá' : 'Tạo Hạt Đá Mới Vào Kho'}</span>
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
            </div>
          </div>
        </form>

        {/* Mobile Sticky Save Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-3 border-t border-[#E8DFD3] shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FAF4E8] border border-[#EADBCC] flex items-center justify-center p-1 shrink-0">
              <span className="w-6 h-6 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: beadFormData.color }} />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-[#231F1C] truncate block">
                {beadFormData.name || 'Mẫu Hạt Mới'}
              </span>
              <span className="text-[11px] font-bold text-[#C59B6D]">
                {Number(beadFormData.pricePerBead || 0).toLocaleString('vi-VN')}₫/hạt
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveBead}
            disabled={isSaving}
            className="btn-luxury-cta px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{editingItem ? 'Lưu' : 'Tạo Hạt'}</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: GIAO DIỆN CỨNG THÊM / CHỈNH SỬA CHARM (DEDICATED CHARM WORKSPACE)
  // =========================================================================
  if (workspaceView === 'charm-editor') {
    return (
      <div className="space-y-6 animate-fadeIn pb-24 lg:pb-12">
        {/* Header Navigation Bar */}
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
                  editingItem 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {editingItem ? `Chỉnh sửa #${editingItem.id}` : '+ Tạo mẫu charm mới'}
                </span>
              </div>
              <h2 className="font-serif-boutique text-xl sm:text-2xl font-bold text-[#26211C] mt-0.5">
                {editingItem ? `Chỉnh Sửa Charm: ${editingItem.name}` : 'Thêm Charm Mới Vào Kho Xưởng'}
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
                  <span>{editingItem ? 'Lưu Cập Nhật' : 'Tạo Charm Mới'}</span>
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
            <button type="button" onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Workspace Form Grid */}
        <form onSubmit={handleSaveCharm} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* CARD 1: THÔNG TIN ĐỊNH DANH & GIÁ BÁN */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#F5EFE6] pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF4E8] text-[#C59B6D] flex items-center justify-center font-bold">
                  <Gem className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-boutique text-base font-bold text-[#231F1C]">
                    1. Thông Tin Định Danh & Giá Bán Charm
                  </h3>
                  <p className="text-[11px] text-[#948A7E]">
                    Tên hiển thị, giá cộng thêm khi khách chọn và số lượng phôi hiện có
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#231F1C] flex items-center gap-1">
                    <span>Tên Charm Thủ Công:</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Charm Vỏ Sò Biển Tự Nhiên & Ánh Xà Cừ"
                    value={charmFormData.name}
                    onChange={(e) => setCharmFormData({ ...charmFormData, name: e.target.value })}
                    className="w-full glass-input p-3 rounded-2xl font-bold text-sm text-[#231F1C] border border-[#E8DFD3]"
                  />
                </div>

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
                      value={charmFormData.price}
                      onChange={(e) => setCharmFormData({ ...charmFormData, price: e.target.value })}
                      className="w-full glass-input p-3 pr-12 rounded-2xl font-bold text-sm text-[#C59B6D] border border-[#E8DFD3]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#C59B6D]">₫</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#C59B6D] bg-[#FAF4E8] px-2.5 py-1 rounded-xl border border-[#EADBCC] inline-block">
                    {new Intl.NumberFormat('vi-VN').format(Number(charmFormData.price) || 0)}₫
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#F5EFE6]">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#231F1C]">Số lượng tồn kho:</label>
                  <input
                    type="number"
                    min="0"
                    value={charmFormData.stock}
                    onChange={(e) => setCharmFormData({ ...charmFormData, stock: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl text-xs font-bold text-[#231F1C] border border-[#E8DFD3]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#231F1C]">Kích thước chi tiết:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 12mm x 10mm"
                    value={charmFormData.sizeMm}
                    onChange={(e) => setCharmFormData({ ...charmFormData, sizeMm: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl text-xs font-semibold text-[#231F1C] border border-[#E8DFD3]"
                  />
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    {commonSizes.slice(0, 4).map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setCharmFormData({ ...charmFormData, sizeMm: sz })}
                        className={`text-[9px] px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                          charmFormData.sizeMm === sz 
                            ? 'bg-[#C59B6D] text-white border-[#C59B6D]' 
                            : 'bg-[#FAF7F2] text-[#6B6258] border-[#E8DFD3] hover:bg-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#231F1C]">Trạng thái mở bán:</label>
                  <div 
                    onClick={() => setCharmFormData({ ...charmFormData, inStock: !charmFormData.inStock })}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      charmFormData.inStock 
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800' 
                        : 'bg-rose-50/80 border-rose-300 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${charmFormData.inStock ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      <span className="text-xs font-bold">
                        {charmFormData.inStock ? 'Sẵn sàng phối đồ' : 'Tạm hết / Ẩn'}
                      </span>
                    </div>
                    <span className="text-[10px] underline font-semibold">Đổi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: HÌNH ẢNH CHỤP THỰC TẾ */}
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
                {charmFormData.image && (
                  <button
                    type="button"
                    onClick={() => setCharmFormData({ ...charmFormData, image: '' })}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa ảnh</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
                <div className="aspect-square rounded-2xl border-2 border-dashed border-[#C59B6D]/40 bg-gradient-to-b from-[#FAF7F2] to-[#EFEAE1] p-3 flex items-center justify-center relative group overflow-hidden shadow-inner">
                  {charmFormData.image ? (
                    <>
                      <img 
                        src={charmFormData.image} 
                        alt="Charm Preview" 
                        className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCharmFormData({ ...charmFormData, image: '' })}
                          className="p-2 rounded-xl bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors"
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
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-1.5">
                    <label className="text-xs font-bold text-[#231F1C] flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#C59B6D]" />
                      <span>Cách 1: Tải ảnh từ thiết bị (Điện thoại / Máy tính)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCharmFileUpload}
                      className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#C59B6D] file:text-white hover:file:opacity-90 cursor-pointer w-full"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-1.5">
                    <label className="text-xs font-bold text-[#231F1C] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#C59B6D]" />
                      <span>Cách 2: Hoặc dán liên kết URL hình ảnh</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://... hoặc /images/products/..."
                      value={charmFormData.image}
                      onChange={(e) => setCharmFormData({ ...charmFormData, image: e.target.value })}
                      className="w-full glass-input p-2.5 rounded-xl text-xs font-mono text-[#231F1C] border border-[#E8DFD3]"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Charm Photos */}
              <div className="pt-3 border-t border-[#F5EFE6] space-y-2">
                <span className="text-xs font-bold text-[#231F1C] block">
                  Chọn nhanh từ kho phôi ảnh mẫu của xưởng:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {presetCharmPhotos.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCharmFormData({ ...charmFormData, image: preset.image })}
                      className={`p-2 rounded-xl border text-left flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        charmFormData.image === preset.image 
                          ? 'bg-[#FAF4E8] border-[#C59B6D] ring-2 ring-[#C59B6D]/30 shadow-xs' 
                          : 'bg-white border-[#E8DFD3] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] p-1 flex items-center justify-center overflow-hidden border border-[#EADBCC]">
                        <img src={preset.image} alt={preset.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[9px] font-bold text-[#231F1C] text-center line-clamp-1">{preset.name}</span>
                    </button>
                  ))}
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
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#231F1C] block">Chất liệu chế tác:</label>
                  <input
                    type="text"
                    list="material-presets-workspace"
                    value={charmFormData.material}
                    onChange={(e) => setCharmFormData({ ...charmFormData, material: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl font-bold text-xs text-[#231F1C] border border-[#E8DFD3]"
                  />
                  <datalist id="material-presets-workspace">
                    {commonMaterials.map(m => <option key={m} value={m} />)}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#231F1C] block">Phân loại chủ đề thiết kế:</label>
                  <input
                    type="text"
                    list="category-presets-workspace"
                    value={charmFormData.category}
                    onChange={(e) => setCharmFormData({ ...charmFormData, category: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl font-bold text-xs text-[#231F1C] border border-[#E8DFD3]"
                  />
                  <datalist id="category-presets-workspace">
                    {commonCategories.map(c => <option key={c} value={c} />)}
                  </datalist>
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
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#231F1C] block">Mệnh tương sinh tương hợp:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {menhList.map(m => {
                    const isSelected = charmFormData.menh.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleCharmMenh(m.id)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected ? `${m.color} ring-2 ring-current shadow-xs` : 'bg-white text-[#6B6258] border-[#E8DFD3] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span>{m.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-[#231F1C] block">Ý nghĩa may mắn & Phong thủy:</label>
                <textarea
                  rows="3"
                  value={charmFormData.meaning}
                  onChange={(e) => setCharmFormData({ ...charmFormData, meaning: e.target.value })}
                  className="w-full glass-input p-3 rounded-2xl text-xs text-[#231F1C] border border-[#E8DFD3]"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Live Simulation with Bead Pairing */}
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4 sticky top-28">
              <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C59B6D]" />
                  <h4 className="font-serif-boutique text-sm font-bold text-[#231F1C]">
                    Mô Phỏng Phối Thử Với Hạt Đá
                  </h4>
                </div>
                <span className="text-[10px] bg-[#FAF4E8] text-[#C59B6D] font-bold px-2 py-0.5 rounded-full border border-[#EADBCC]">
                  Canvas Thật
                </span>
              </div>

              {/* Choose Bead to Pair in Preview */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider block">
                  Phối thử cùng hạt đá trong kho:
                </label>
                <select
                  value={previewBeadId}
                  onChange={(e) => setPreviewBeadId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs font-bold text-[#231F1C] focus:outline-none"
                >
                  {beads.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.pricePerBead?.toLocaleString('vi-VN')}₫/hạt)
                    </option>
                  ))}
                </select>
              </div>

              {/* Circular Canvas Simulation with Real Chosen Bead Color */}
              <div className="aspect-square rounded-2xl bg-gradient-to-tr from-[#FAF7F2] via-[#F3ECE1] to-[#FAF7F2] p-4 flex flex-col items-center justify-center relative overflow-hidden border border-[#EADBCC] shadow-inner">
                <div className="w-44 h-44 rounded-full border-2 border-dashed border-[#C59B6D]/60 flex items-center justify-center relative">
                  
                  {/* Beads around ring */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const angle = (i / 16) * 2 * Math.PI - Math.PI / 2;
                    const r = 74;
                    const x = 88 + r * Math.cos(angle) - 6;
                    const y = 88 + r * Math.sin(angle) - 6;
                    return (
                      <div
                        key={i}
                        className="w-3.5 h-3.5 rounded-full shadow-xs absolute border border-white/70"
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                          background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${selectedPreviewBead.color || '#EAA9A9'} 50%, #1A1A1A 100%)`
                        }}
                      />
                    );
                  })}

                  {/* CHARM AT BOTTOM */}
                  <div className="absolute -bottom-4 z-10 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#C59B6D] flex items-center justify-center p-1 shadow-lg group">
                      {charmFormData.image ? (
                        <img src={charmFormData.image} alt="Charm Preview" className="w-full h-full object-contain filter drop-shadow-md" />
                      ) : (
                        <Gem className="w-7 h-7 text-[#C59B6D]" />
                      )}
                    </div>
                  </div>

                  {/* Center branding */}
                  <div className="text-center p-1">
                    <span className="font-serif-boutique text-[10px] font-bold text-[#8C8276] uppercase tracking-widest block">
                      VÒNG TỰ PHỐI
                    </span>
                    <span className="font-serif-boutique text-xs font-bold text-[#231F1C] block line-clamp-1">
                      {charmFormData.name || 'Tên Charm'}
                    </span>
                    <span className="text-[9px] text-[#C59B6D] font-bold block mt-0.5">
                      +{Number(charmFormData.price || 0).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary Attributes */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#948A7E]">Charm:</span>
                  <span className="font-bold text-[#231F1C] truncate max-w-[170px]">{charmFormData.name || '(Chưa đặt tên)'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#948A7E]">Hạt đá phối cùng:</span>
                  <span className="font-semibold text-[#231F1C]">{selectedPreviewBead.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#948A7E]">Giá charm cộng thêm:</span>
                  <span className="font-bold text-sm text-[#C59B6D]">
                    +{new Intl.NumberFormat('vi-VN').format(Number(charmFormData.price) || 0)}₫
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
                      <span>{editingItem ? 'Lưu Cập Nhật Charm' : 'Tạo Charm Mới Vào Kho'}</span>
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
            </div>
          </div>
        </form>

        {/* Mobile Sticky Save Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-3 border-t border-[#E8DFD3] shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FAF4E8] border border-[#EADBCC] flex items-center justify-center p-1 shrink-0">
              {charmFormData.image ? (
                <img src={charmFormData.image} alt="Thumb" className="w-full h-full object-contain" />
              ) : (
                <Gem className="w-5 h-5 text-[#C59B6D]" />
              )}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-[#231F1C] truncate block">{charmFormData.name || 'Charm Mới'}</span>
              <span className="text-[11px] font-bold text-[#C59B6D]">
                +{new Intl.NumberFormat('vi-VN').format(Number(charmFormData.price) || 0)}₫
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveCharm}
            disabled={isSaving}
            className="btn-luxury-cta px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{editingItem ? 'Lưu' : 'Tạo Charm'}</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: DANH SÁCH LINH KIỆN TỰ PHỐI (KHO CHARM & KHO HẠT ĐÁ)
  // =========================================================================
  const filteredCharms = charms.filter(charm => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = charm.name?.toLowerCase().includes(q);
      const matchMat = charm.material?.toLowerCase().includes(q);
      const matchMeaning = charm.meaning?.toLowerCase().includes(q);
      if (!matchName && !matchMat && !matchMeaning) return false;
    }
    if (selectedMaterial !== 'all' && charm.material !== selectedMaterial) return false;
    if (selectedCategory !== 'all' && charm.category !== selectedCategory) return false;
    if (selectedStockStatus === 'in_stock' && !charm.inStock) return false;
    if (selectedStockStatus === 'out_of_stock' && charm.inStock) return false;
    return true;
  });

  const filteredBeads = beads.filter(bead => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = bead.name?.toLowerCase().includes(q);
      const matchDesc = (bead.desc || bead.description)?.toLowerCase().includes(q);
      const matchMeaning = bead.meaning?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchMeaning) return false;
    }
    if (selectedMenhFilter !== 'all') {
      const menhStr = Array.isArray(bead.menh) ? bead.menh.join(', ') : (bead.menh || '');
      if (!menhStr.includes('Tất cả') && !menhStr.includes(selectedMenhFilter)) return false;
    }
    if (selectedStockStatus === 'in_stock' && !bead.inStock) return false;
    if (selectedStockStatus === 'out_of_stock' && bead.inStock) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header & Unified Sub-Tab Switcher */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C59B6D] to-[#B86244] text-white flex items-center justify-center font-bold text-xl shadow-md">
              <Sparkles className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif-boutique text-2xl font-bold text-[#231F1C]">
                  QUẢN LÝ LINH KIỆN TỰ PHỐI VÒNG TAY
                </h2>
                <span className="text-[10px] bg-[#FAF4E8] text-[#C59B6D] font-bold px-2.5 py-0.5 rounded-full border border-[#EADBCC]">
                  {charms.length} Charm · {beads.length} Hạt Đá
                </span>
              </div>
              <p className="text-xs text-[#948A7E]">
                Đồng bộ hai chiều thời gian thực với Xưởng Tự Phối (Bracelet Studio) để khách hàng chọn lựa và tính giá chuẩn xác 100%
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
            {activeTab === 'charms' ? (
              <button
                type="button"
                onClick={handleOpenNewCharmWorkspace}
                className="btn-luxury-cta px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Charm Mới</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenNewBeadWorkspace}
                className="btn-luxury-cta px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Hạt Đá Mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tab Navigation: Charm vs Hạt Đá */}
        <div className="flex items-center gap-2 border-b border-[#E8DFD3] pt-2">
          <button
            type="button"
            onClick={() => { setActiveTab('charms'); setSearchQuery(''); }}
            className={`px-5 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'charms'
                ? 'bg-white text-[#B86244] border-t-2 border-x border-t-[#B86244] border-x-[#E8DFD3] shadow-xs'
                : 'text-[#6B6258] hover:text-[#231F1C] hover:bg-white/50'
            }`}
          >
            <Gem className="w-4 h-4 text-[#C59B6D]" />
            <span>Kho Charm Thủ Công ({charms.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('beads'); setSearchQuery(''); }}
            className={`px-5 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'beads'
                ? 'bg-white text-[#B86244] border-t-2 border-x border-t-[#B86244] border-x-[#E8DFD3] shadow-xs'
                : 'text-[#6B6258] hover:text-[#231F1C] hover:bg-white/50'
            }`}
          >
            <CircleDot className="w-4 h-4 text-emerald-600" />
            <span>Kho Hạt Đá Phong Thủy ({beads.length})</span>
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-white/80 border border-white shadow-2xs">
            <span className="text-[11px] text-[#948A7E] font-medium block">
              {activeTab === 'charms' ? 'Tổng số mẫu charm:' : 'Tổng số loại hạt đá:'}
            </span>
            <span className="text-xl font-bold text-[#231F1C] mt-0.5 block">
              {activeTab === 'charms' ? charms.length : beads.length}
            </span>
            <span className="text-[10px] text-[#4E6857]">Đã tối ưu cho Studio</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-white shadow-2xs">
            <span className="text-[11px] text-[#948A7E] font-medium block">Đang sẵn hàng:</span>
            <span className="text-xl font-bold text-emerald-700 mt-0.5 block">
              {activeTab === 'charms' ? charms.filter(c => c.inStock).length : beads.filter(b => b.inStock).length}
            </span>
            <span className="text-[10px] text-emerald-600">Khách có thể chọn phối</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-white shadow-2xs">
            <span className="text-[11px] text-[#948A7E] font-medium block">Tạm hết / Cảnh báo:</span>
            <span className="text-xl font-bold text-amber-700 mt-0.5 block">
              {activeTab === 'charms' ? charms.filter(c => !c.inStock).length : beads.filter(b => !b.inStock).length}
            </span>
            <span className="text-[10px] text-amber-600">Cần nhập phôi thêm</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-white shadow-2xs">
            <span className="text-[11px] text-[#948A7E] font-medium block">Đa dạng ngũ hành:</span>
            <span className="text-xl font-bold text-[#C59B6D] mt-0.5 block">5 Mệnh</span>
            <span className="text-[10px] text-[#C59B6D]">Kim, Mộc, Thủy, Hỏa, Thổ</span>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#948A7E]" />
          <input
            type="text"
            placeholder={activeTab === 'charms' ? "Tìm charm theo tên, chất liệu, ý nghĩa..." : "Tìm hạt đá theo tên, mệnh, ý nghĩa..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs text-[#231F1C] focus:outline-none focus:border-[#C59B6D]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {activeTab === 'beads' && (
            <select
              value={selectedMenhFilter}
              onChange={(e) => setSelectedMenhFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs text-[#231F1C] font-semibold focus:outline-none"
            >
              <option value="all">Tất cả mệnh</option>
              <option value="Kim">Mệnh Kim</option>
              <option value="Mộc">Mệnh Mộc</option>
              <option value="Thủy">Mệnh Thủy</option>
              <option value="Hỏa">Mệnh Hỏa</option>
              <option value="Thổ">Mệnh Thổ</option>
            </select>
          )}

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

      {/* 3. GRID CONTENT: CHARMS OR BEADS */}
      {activeTab === 'charms' ? (
        /* CHARMS GRID */
        filteredCharms.length === 0 ? (
          <div className="text-center py-12 bg-white/70 rounded-3xl border border-white">
            <Gem className="w-12 h-12 mx-auto text-[#C59B6D]/40 mb-3" />
            <h4 className="font-serif-boutique text-lg font-bold text-[#231F1C]">Không tìm thấy mẫu charm nào</h4>
            <button
              type="button"
              onClick={handleOpenNewCharmWorkspace}
              className="mt-4 px-4 py-2 rounded-xl bg-[#C59B6D] text-white text-xs font-bold hover:opacity-90 cursor-pointer shadow-md"
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
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#EFEAE1] flex items-center justify-center p-3 group">
                    {charm.image ? (
                      <img src={charm.image} alt={charm.name} className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#948A7E]">
                        <Gem className="w-12 h-12 text-[#C59B6D]/50 mb-1" />
                        <span className="text-[10px] font-semibold">Chưa có ảnh</span>
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#231F1C]/80 text-white backdrop-blur-xs">
                        {charm.material || 'Bạc 925'}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleCharmStock(charm)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm transition-all cursor-pointer ${
                          charm.inStock 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' 
                            : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                        }`}
                      >
                        {charm.inStock ? '✓ Còn hàng' : '✕ Hết hàng'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-serif-boutique text-sm font-bold text-[#231F1C] leading-snug line-clamp-1" title={charm.name}>
                      {charm.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F5EFE6]">
                      <span className="font-bold text-[#C59B6D]">
                        +{new Intl.NumberFormat('vi-VN').format(charm.price)}₫
                      </span>
                      <span className="text-[10px] text-[#948A7E]">
                        Kho: <strong className="text-[#231F1C]">{charm.stock || 0}</strong>
                      </span>
                    </div>
                    {(charm.meaning || charm.desc) && (
                      <p className="text-[11px] text-[#6B6258] line-clamp-2 leading-relaxed italic">
                        "{charm.meaning || charm.desc}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#F5EFE6] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditCharmWorkspace(charm)}
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
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* BEADS GRID (KHO HẠT ĐÁ PHONG THỦY) */
        filteredBeads.length === 0 ? (
          <div className="text-center py-12 bg-white/70 rounded-3xl border border-white">
            <CircleDot className="w-12 h-12 mx-auto text-emerald-600/40 mb-3" />
            <h4 className="font-serif-boutique text-lg font-bold text-[#231F1C]">Không tìm thấy mẫu hạt đá nào</h4>
            <button
              type="button"
              onClick={handleOpenNewBeadWorkspace}
              className="mt-4 px-4 py-2 rounded-xl bg-[#B86244] text-white text-xs font-bold hover:opacity-90 cursor-pointer shadow-md"
            >
              + Thêm Hạt Đá Ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBeads.map(bead => {
              const isDeleting = isDeletingId === bead.id;
              const menhLabel = Array.isArray(bead.menh) ? bead.menh.join(', ') : bead.menh;

              return (
                <div 
                  key={bead.id}
                  className={`glass-card-luxury p-4 rounded-3xl space-y-3 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border ${
                    bead.inStock ? 'border-white/80' : 'border-amber-200/80 bg-amber-50/30'
                  }`}
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#EDE4D6] flex items-center justify-center p-3 group border border-[#EADBCC]">
                    {/* Realistic 3D Bead Ball */}
                    <div 
                      className="w-24 h-24 rounded-full shadow-2xl border-2 border-white/80 relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${bead.color || '#EAA9A9'} 45%, #1A1A1A 100%)`
                      }}
                    >
                      <div className="w-4 h-4 rounded-full bg-white/70 absolute top-3.5 left-5 filter blur-[0.5px]" />
                    </div>

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#231F1C]/80 text-white backdrop-blur-xs">
                        Mệnh {menhLabel?.split(',')[0]}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleBeadStock(bead)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm transition-all cursor-pointer ${
                          bead.inStock 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' 
                            : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                        }`}
                      >
                        {bead.inStock ? '✓ Còn hàng' : '✕ Hết hàng'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-serif-boutique text-sm font-bold text-[#231F1C] leading-snug line-clamp-1" title={bead.name}>
                      {bead.name}
                    </h4>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F5EFE6]">
                      <span className="font-bold text-[#B86244]">
                        {new Intl.NumberFormat('vi-VN').format(bead.pricePerBead)}₫/hạt
                      </span>
                      <span className="text-[10px] text-[#948A7E]">
                        Kho: <strong className="text-[#231F1C]">{bead.stock || 0}</strong>
                      </span>
                    </div>

                    {(bead.meaning || bead.desc) && (
                      <p className="text-[11px] text-[#6B6258] line-clamp-2 leading-relaxed italic">
                        "{bead.meaning || bead.desc}"
                      </p>
                    )}

                    <div className="text-[10px] bg-[#FAF4E8] text-[#8C8276] px-2 py-0.5 rounded-md border border-[#EADBCC] inline-block font-medium">
                      21 hạt = {(Number(bead.pricePerBead || 0) * 21).toLocaleString('vi-VN')}₫
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F5EFE6] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditBeadWorkspace(bead)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#231F1C] text-xs font-semibold border border-[#E8DFD3] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#B86244]" />
                      <span>Sửa Hạt Đá</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBead(bead)}
                      disabled={isDeleting}
                      className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
