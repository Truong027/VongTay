import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Ruler, 
  Truck, 
  Sparkles, 
  Check, 
  Gift, 
  Zap, 
  MessageSquarePlus, 
  Tag, 
  ChevronRight, 
  MessageCircle, 
  Layers, 
  Award,
  ChevronLeft,
  Maximize2
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import ProductImageZoomModal from './ProductImageZoomModal';

export default function ProductModal({ product, onClose, onOpenSizeGuide, onProceedToCheckout }) {
  if (!product) return null;

  const { addToCart, isWishlisted, toggleWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState('15 - 16 cm (Chuẩn Nữ)');
  const [quantity, setQuantity] = useState(1);
  const [giftNote, setGiftNote] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'specs' | 'reviews'
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Image Gallery selection
  const galleryImages = (product.images && product.images.length > 0) 
    ? product.images 
    : [product.image || 'https://images.unsplash.com/photo-1611591475836-8a3d4638a162?w=800&q=80'];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reviews from Database
  const [reviewsList, setReviewsList] = useState([]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newWristFit, setNewWristFit] = useState('Vừa vặn ôm tay chuẩn');
  const [newComment, setNewComment] = useState('');
  const [newReviewerName, setNewReviewerName] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (product?.id) {
      api.getReviews(product.id).then(res => {
        if (res.success && Array.isArray(res.data)) {
          setReviewsList(res.data);
        }
      }).catch(console.warn);
    }
  }, [product?.id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isZoomOpen) {
          setIsZoomOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isZoomOpen]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const res = await api.createReview({
        productId: product.id,
        customerName: newReviewerName.trim() || 'Khách hàng yêu quý',
        rating: newRating,
        wristFit: newWristFit,
        comment: newComment.trim()
      });
      if (res.success && res.data) {
        setReviewsList(prev => [res.data, ...prev]);
        setNewComment('');
        setNewReviewerName('');
        setIsReviewFormOpen(false);
      }
    } catch (err) {
      console.error('Lỗi gửi đánh giá:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const liked = isWishlisted(product.id);

  const sizeOptions = [
    { value: '14 - 15 cm', label: '14 - 15 cm (Cổ tay nhỏ)' },
    { value: '15 - 16 cm (Chuẩn Nữ)', label: '15 - 16 cm (Chuẩn Nữ)' },
    { value: '16 - 17 cm (Vừa tay)', label: '16 - 17 cm (Vừa tay)' },
    { value: '17 - 18 cm (Chuẩn Nam)', label: '17 - 18 cm (Chuẩn Nam)' },
    { value: '18 - 19 cm (Tay đậm)', label: '18 - 19 cm (Tay đậm)' },
  ];

  const originalPrice = product.originalPrice && Number(product.originalPrice) > Number(product.price)
    ? Number(product.originalPrice)
    : Math.round(product.price * 1.25 / 1000) * 1000;
  const isWholesale = quantity >= (product.wholesaleMinQty || 5);
  const effectivePrice = isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;

  const handleQuickBuy = () => {
    const item = {
      ...product,
      quantity,
      wristSize: selectedSize,
      note: giftNote,
      cartKey: `${product.id}-${selectedSize}-${Date.now()}`,
      effectivePrice,
      itemTotal: effectivePrice * quantity,
      isWholesale
    };

    if (onProceedToCheckout) {
      const subtotal = item.itemTotal;
      const shippingFee = subtotal >= 400000 ? 0 : 25000;
      onProceedToCheckout({
        items: [item],
        subtotal,
        finalTotal: subtotal + shippingFee,
        shippingFee,
        discount: 0,
        wholesaleSavings: (product.price - effectivePrice) * quantity
      });
      onClose();
    } else {
      handleAddToCart();
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      wristSize: selectedSize,
      note: giftNote
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/40 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-3xl sm:rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.2)] border border-white/90 overflow-hidden my-auto max-h-[92vh] flex flex-col ios-spring"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/80 hover:bg-white text-[#26211C] transition-all shadow-md hover:scale-105 border border-white/90 ios-press"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 pb-24 sm:pb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6">
            
            {/* 1. LEFT COLUMN: Shopee-Style Image Gallery (5 cols) */}
            <div className="md:col-span-5 bg-[#FAF7F2] p-4 sm:p-6 flex flex-col justify-start border-b md:border-b-0 md:border-r border-[#E8DFD3]">
              
              {/* Main Photo Card - Click to Enlarge Shopee Style */}
              <div 
                onClick={() => setIsZoomOpen(true)}
                className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-artisan border border-[#E8DFD3] bg-white group cursor-zoom-in"
                title="Nhấn vào ảnh để xem to chi tiết cận cảnh"
              >
                <img
                  src={galleryImages[activeImageIndex] || galleryImages[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                  <span className="bg-[#B86244] text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    Chính Hãng Vòng Tay Nhà Zy
                  </span>
                  {product.tag && (
                    <span className="bg-[#26211C] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
                      {product.tag}
                    </span>
                  )}
                </div>

                {/* Shopee Zoom Badge Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomOpen(true);
                  }}
                  className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black/85 text-white backdrop-blur-md transition-all shadow-md flex items-center gap-1 text-[10px] font-bold opacity-90 group-hover:opacity-100 group-hover:scale-105 border border-white/20 cursor-pointer"
                  title="Nhấn để phóng to ảnh xem chi tiết như Shopee"
                >
                  <Maximize2 className="w-3 h-3 text-amber-300" />
                  <span>Phóng to</span>
                </button>

                {/* Shopee FreeShip Xtra Ribbon */}
                <div className="absolute bottom-3 left-3 bg-gradient-to-r from-emerald-700 to-[#3A754B] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 pointer-events-none">
                  <Truck className="w-3 h-3" />
                  <span>Freeship Đơn Từ 400k</span>
                </div>

                {/* Photo indicator */}
                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full pointer-events-none">
                  {activeImageIndex + 1}/{galleryImages.length}
                </span>

                {/* Click-to-zoom Hover Hint Banner */}
                <div className="absolute inset-x-0 bottom-0 py-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-[10.5px] font-semibold pointer-events-none z-10">
                  <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Nhấn vào ảnh để xem to chi tiết (Shopee Zoom)</span>
                </div>
              </div>

              {/* Shopee Thumbnails Row */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2 mt-3 overflow-x-auto py-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-[#B86244] ring-2 ring-[#B86244]/30 scale-105 shadow-sm'
                          : 'border-[#E8DFD3] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Góc chụp ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Service Badges Bar under image */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#E8DFD3] text-[11px] text-[#6B6258]">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#B86244] shrink-0" />
                  <span>Đan tay thủ công 100%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#4E6857] shrink-0" />
                  <span>Bảo hành dây trọn đời</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#C09A58] shrink-0" />
                  <span>Đóng gói chống sốc kỹ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#B86244] shrink-0" />
                  <span>Kèm túi gấm thương hiệu</span>
                </div>
              </div>

            </div>

            {/* 2. RIGHT COLUMN: Shopee Details, Variations & Tabs (7 cols) */}
            <div className="md:col-span-7 p-4 sm:p-6 space-y-4">
              
              {/* Product Title & Brand */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  {product.category && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#845339] border border-[#EADBCC] shadow-2xs">
                      {product.category === 'guong-dinh' ? '🪞 Gương Đính Độc Bản' :
                       product.category === 'macrame-pastel' ? '🌸 Macrame Pastel' :
                       product.category === 'vong-doi' ? '💞 Vòng Đôi Dây Sáp' :
                       product.category === 'day-do-may-man' ? '🏮 Dây Đỏ May Mắn' :
                       product.category === 'day-chuyen-vintage' ? '📿 Dây Chuyền Vintage' :
                       product.category === 'day-lua-co-phong' ? '🎋 Dây Lụa Cổ Phong' : product.category}
                    </span>
                  )}
                  {product.menh && product.menh.map((m, idx) => (
                    <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF4ED] text-[#B86244] border border-[#EADBCC]">
                      Hợp Mệnh {m}
                    </span>
                  ))}
                  <span className="text-xs text-[#8C8276] ml-auto">
                    Nghệ nhân: <strong className="text-[#26211C]">{product.artisanName || 'Khánh Vy'}</strong>
                  </span>
                </div>

                <h1 className="font-serif-boutique text-xl sm:text-2xl md:text-3xl font-bold text-[#26211C] leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Shopee Social Proof Ribbon: Rating | Reviews | Sold */}
              <div className="flex items-center gap-3 text-xs text-[#6B6258] pb-1 border-b border-[#F0EAE1]">
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <span className="font-bold text-[#26211C] ml-1">{product.rating || '5.0'}</span>
                </div>
                <span className="text-[#E8DFD3]">|</span>
                <span className="underline cursor-pointer hover:text-[#B86244]" onClick={() => setActiveTab('reviews')}>
                  {reviewsList.length > 0 ? reviewsList.length : (product.reviewsCount || 48)} Đánh Giá
                </span>
                <span className="text-[#E8DFD3]">|</span>
                <span className="font-medium text-[#26211C]">
                  Đã bán {(product.salesCount || 1200).toLocaleString('vi-VN')}
                </span>
              </div>

              {/* Shopee Price Banner */}
              <div className="p-3.5 bg-[#FAF4ED] rounded-2xl border border-[#EADBCC] space-y-2 shadow-xs">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#B86244]">
                    {product.price.toLocaleString('vi-VN')}₫
                  </span>
                  {originalPrice && originalPrice > product.price && (
                    <span className="text-xs sm:text-sm text-[#8C8276] line-through">
                      {originalPrice.toLocaleString('vi-VN')}₫
                    </span>
                  )}
                  {originalPrice && originalPrice > product.price && (
                    <span className="text-[10px] font-bold bg-[#B86244] text-white px-2 py-0.5 rounded uppercase">
                      -{Math.round(((originalPrice - product.price) / originalPrice) * 100)}% GIẢM
                    </span>
                  )}
                </div>

                {/* Wholesale Tier Highlight */}
                {product.wholesalePrice && (
                  <div className="pt-2 border-t border-[#EADBCC]/80 flex items-center justify-between flex-wrap gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#3A754B] bg-[#EDF5F0] px-2 py-0.5 rounded text-[11px]">
                        🏷️ Giá Sỉ Xưởng
                      </span>
                      <span className="font-bold text-sm text-[#3A754B]">
                        {product.wholesalePrice.toLocaleString('vi-VN')}₫/chiếc
                      </span>
                    </div>
                    <span className="text-[11px] text-[#845339] italic">
                      (Tự động áp dụng khi mua từ {product.wholesaleMinQty || 5} chiếc)
                    </span>
                  </div>
                )}
              </div>

              {/* Shopee Voucher & Shipping Promo Bar */}
              <div className="space-y-2 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD3] text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#8C8276] w-20 shrink-0 font-medium">Mã Giảm Giá:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-[#FAF4ED] text-[#B86244] border border-[#B86244]/40 px-2 py-0.5 rounded text-[10px] font-bold">
                      Giảm 20k
                    </span>
                    <span className="bg-[#FAF4ED] text-[#B86244] border border-[#B86244]/40 px-2 py-0.5 rounded text-[10px] font-bold">
                      Giảm 50k
                    </span>
                    <span className="bg-[#EDF5F0] text-[#3A754B] border border-[#3A754B]/40 px-2 py-0.5 rounded text-[10px] font-bold">
                      Freeship
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8C8276] w-20 shrink-0 font-medium">Vận Chuyển:</span>
                  <span className="text-[#26211C] font-medium flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#3A754B]" />
                    Miễn phí vận chuyển cho đơn từ 400.000₫
                  </span>
                </div>
              </div>

              {/* Variation 1: Wrist Size Selection (Pill style) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#26211C]">
                    Kích Thước Cổ Tay (Size):
                  </span>
                  <button
                    type="button"
                    onClick={onOpenSizeGuide}
                    className="text-[#B86244] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    Chưa biết size tay?
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {sizeOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedSize(opt.value)}
                      className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all flex items-center justify-center gap-1 ${
                        selectedSize === opt.value
                          ? 'border-[#B86244] bg-[#FBEFEA] text-[#B86244] ring-1 ring-[#B86244]'
                          : 'border-[#E8DFD3] bg-white text-[#5A5147] hover:border-[#B86244]/50'
                      }`}
                    >
                      {selectedSize === opt.value && <Check className="w-3 h-3 text-[#B86244] shrink-0" />}
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Variation 2: Gift Note / Custom Name Request */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#26211C] flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-[#B86244]" />
                  Ghi chú cho nghệ nhân (khắc chữ cái, phối charm riêng):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Khắc chữ T&H, gói kèm thiệp chúc mừng..."
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                />
              </div>

              {/* Variation 3: Quantity Stepper */}
              <div className="flex items-center gap-4 text-xs pt-1">
                <span className="font-bold text-[#26211C] w-16">Số lượng:</span>
                <div className="flex items-center border border-[#E8DFD3] rounded-xl bg-white overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#26211C] hover:bg-[#FAF7F2] transition-colors border-r border-[#E8DFD3]"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-[#26211C]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#26211C] hover:bg-[#FAF7F2] transition-colors border-l border-[#E8DFD3]"
                  >
                    +
                  </button>
                </div>
                <span className="text-[#8C8276] text-[11px]">
                  Còn 48 sản phẩm có sẵn
                </span>
              </div>

              {/* Wholesale Active Banner */}
              {product.wholesalePrice && quantity >= (product.wholesaleMinQty || 5) && (
                <div className="p-2.5 bg-[#EDF5F0] border border-[#C2DEC8] rounded-xl flex items-center justify-between text-xs text-[#2E583A] animate-fadeIn">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#3A754B]" />
                    Đã kích hoạt Giá Sỉ Xưởng ({quantity} chiếc)
                  </span>
                  <span className="font-bold bg-[#3A754B] text-white px-2 py-0.5 rounded-full text-[10px]">
                    Tiết kiệm {((product.price - product.wholesalePrice) * quantity).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              )}

              {/* Shopee-style Tabs for Clean Neat Organization */}
              <div className="pt-2 border-t border-[#E8DFD3]">
                <div className="flex items-center gap-1 border-b border-[#E8DFD3] text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`pb-2 px-3 font-bold transition-all relative ${
                      activeTab === 'details'
                        ? 'text-[#B86244] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#B86244]'
                        : 'text-[#6B6258] hover:text-[#26211C]'
                    }`}
                  >
                    Chi Tiết & Mệnh
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('specs')}
                    className={`pb-2 px-3 font-bold transition-all relative ${
                      activeTab === 'specs'
                        ? 'text-[#B86244] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#B86244]'
                        : 'text-[#6B6258] hover:text-[#26211C]'
                    }`}
                  >
                    Cấu Tạo Sợi Dây
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-2 px-3 font-bold transition-all relative ${
                      activeTab === 'reviews'
                        ? 'text-[#B86244] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#B86244]'
                        : 'text-[#6B6258] hover:text-[#26211C]'
                    }`}
                  >
                    Đánh Giá ({reviewsList.length > 0 ? reviewsList.length : 2})
                  </button>
                </div>

                {/* Tab 1: Details & Energy */}
                {activeTab === 'details' && (
                  <div className="py-3 space-y-2.5 text-xs text-[#5A5147] animate-fadeIn">
                    <p className="leading-relaxed">
                      {product.description}
                    </p>
                    {product.meaning && (
                      <div className="p-3 bg-[#FAF4ED] rounded-xl border border-[#EADBCC] text-[#845339]">
                        <strong className="flex items-center gap-1 mb-1 text-[#B86244] font-bold">
                          <Sparkles className="w-3.5 h-3.5" /> Năng lượng & Ý nghĩa phong thủy:
                        </strong>
                        {product.meaning}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Specs & Cord Composition */}
                {activeTab === 'specs' && (
                  <div className="py-3 space-y-2.5 text-xs animate-fadeIn">
                    <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD3] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#6B6258]">
                      <p>🧵 <strong>Sợi chỉ sáp:</strong> {product.cordComposition?.coreMaterial || product.cordType}</p>
                      <p>🪢 <strong>Kiểu đan:</strong> {product.cordComposition?.braidingTechnique || 'Đan thoi Square Knot thủ công'}</p>
                      <p>💎 <strong>Charm & Đá:</strong> {product.cordComposition?.mainCharm || product.stoneType}</p>
                      <p>📏 <strong>Kích thước hạt:</strong> {product.beadSize || '8mm'}</p>
                      <p className="col-span-full">🔒 <strong>Khóa hoàn thiện:</strong> {product.cordComposition?.wristSizeRange || 'Khóa rút điều chỉnh ôm sát cổ tay'}</p>
                      <p className="col-span-full text-[#3A754B] font-semibold">🛡️ <strong>Chống nước:</strong> Đeo tắm giặt thoải mái, không xơ, không kích ứng da.</p>
                    </div>
                  </div>
                )}

                {/* Tab 3: Customer Reviews */}
                {activeTab === 'reviews' && (
                  <div className="py-3 space-y-3 text-xs animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                          ))}
                        </div>
                        <span className="font-bold text-[#26211C]">5.0 / 5</span>
                        <span className="text-[11px] text-[#8C8276]">({reviewsList.length > 0 ? reviewsList.length : 2} lượt phản hồi)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                        className="text-[11px] text-[#B86244] font-bold hover:underline flex items-center gap-1"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        {isReviewFormOpen ? 'Đóng' : 'Viết đánh giá'}
                      </button>
                    </div>

                    {/* Review Form */}
                    {isReviewFormOpen && (
                      <form onSubmit={handleSubmitReview} className="p-3 bg-[#FAF4ED] rounded-xl border border-[#EADBCC] space-y-2 animate-fadeIn">
                        <input
                          type="text"
                          placeholder="Họ tên của bạn..."
                          value={newReviewerName}
                          onChange={(e) => setNewReviewerName(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                        />
                        <textarea
                          rows={2}
                          placeholder="Cảm nhận về vòng tay, chỉ đan, charm..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          required
                          className="w-full text-xs p-2 rounded-lg border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsReviewFormOpen(false)}
                            className="px-3 py-1 text-xs text-[#6B6258] hover:bg-[#EADBCC] rounded-lg"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingReview || !newComment.trim()}
                            className="px-3 py-1 bg-[#B86244] text-white text-xs font-bold rounded-lg disabled:opacity-50"
                          >
                            {isSubmittingReview ? 'Đang gửi...' : 'Gửi Nhận Xét'}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Review List */}
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {(reviewsList.length > 0 ? reviewsList : [
                        {
                          id: 'default-1',
                          customerName: 'Trần Mai Linh · Hà Nội',
                          wristFit: 'Vừa vặn (15cm)',
                          comment: 'Vòng đan tay cực kỳ tỉ mỉ và chắc chắn, chỉ sáp Macrame mịn đeo tắm rửa thoải mái không sợ ướt hay xơ sợi.'
                        },
                        {
                          id: 'default-2',
                          customerName: 'Lê Hoàng Nam · Đà Nẵng',
                          wristFit: 'Dễ đeo một mình',
                          comment: 'Mình mua tặng bạn gái, mặt charm nung bóng đẹp hơn trong ảnh nhiều. Khóa rút trượt hai bên rất dễ đeo.'
                        }
                      ]).map(rev => (
                        <div key={rev.id} className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#26211C] text-xs">
                              {rev.customerName}
                              <span className="text-[9px] text-[#3A754B] bg-[#EDF5F0] px-1.5 py-0.2 rounded ml-1 font-normal">
                                ✓ Đã mua hàng
                              </span>
                            </span>
                            {rev.wristFit && (
                              <span className="text-[10px] text-[#8C8276] bg-white px-2 py-0.5 rounded border border-[#E8DFD3]">
                                {rev.wristFit}
                              </span>
                            )}
                          </div>
                          <p className="text-[#6B6258] text-[11px] leading-relaxed">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* 3. ODOO LUXURY STICKY BOTTOM ACTION BAR */}
        <div className="sticky bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E8DFD3] p-2.5 sm:p-4 px-3 sm:px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-1.5 sm:gap-3 max-w-full">
            
            {/* Odoo Tư Vấn Icon Button */}
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FAF7F2] hover:bg-[#FAF4ED] text-[#6B6258] hover:text-[#B86244] transition-all border border-[#E8DFD3] shrink-0 active:scale-95"
              title="Tư vấn nghệ nhân"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#B86244]" />
              <span className="text-[9px] font-semibold leading-tight mt-0.5">Tư Vấn</span>
            </a>

            {/* Odoo Wishlist Heart Icon Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FAF7F2] hover:bg-[#FAF4ED] text-[#6B6258] hover:text-[#B86244] transition-all border border-[#E8DFD3] shrink-0 active:scale-95"
              title="Yêu thích sản phẩm"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${liked ? 'fill-[#B86244] text-[#B86244]' : ''}`} />
              <span className="text-[9px] font-semibold leading-tight mt-0.5">{liked ? 'Đã Thích' : 'Thích'}</span>
            </button>

            {/* Odoo Button 1: Thêm Vào Giỏ Hàng (Soft Terracotta Outline) */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`flex-1 min-w-0 h-11 sm:h-12 px-2 sm:px-4 rounded-xl font-bold transition-all border flex items-center justify-center active:scale-[0.98] ${
                isAdded 
                  ? 'bg-[#3A754B] text-white border-[#3A754B]' 
                  : 'bg-[#FAF4ED] text-[#B86244] border-[#B86244]/40 hover:bg-[#B86244] hover:text-white shadow-2xs hover:shadow-xs'
              }`}
            >
              {isAdded ? (
                <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-white">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Đã Thêm!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center leading-none">
                  <span className="text-xs sm:text-sm font-bold flex items-center gap-1 whitespace-nowrap">
                    <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                    <span>Thêm Giỏ</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-normal opacity-75 mt-0.5 whitespace-nowrap hidden sm:block">
                    Vào Giỏ Hàng
                  </span>
                </div>
              )}
            </button>

            {/* Odoo Button 2: Mua Ngay (Solid Terracotta with Price) */}
            <button
              type="button"
              onClick={handleQuickBuy}
              className="flex-1 min-w-0 h-11 sm:h-12 px-2 sm:px-4 rounded-xl font-bold bg-[#B86244] hover:bg-[#A05237] text-white flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <div className="flex flex-col items-center justify-center leading-none">
                <span className="text-xs sm:text-sm font-bold flex items-center gap-1 whitespace-nowrap">
                  <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200 shrink-0" />
                  <span>Mua Ngay</span>
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-amber-100 mt-0.5 whitespace-nowrap tracking-tight">
                  {((isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price) * quantity).toLocaleString('vi-VN')}₫
                </span>
              </div>
            </button>

          </div>
        </div>

      </div>

      {/* Shopee-style Fullscreen Image Zoom Lightbox Modal */}
      <ProductImageZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        images={galleryImages}
        currentIndex={activeImageIndex}
        onSelectIndex={(idx) => setActiveImageIndex(idx)}
        productName={product.name}
      />
    </div>
  );
}
