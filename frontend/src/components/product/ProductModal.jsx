import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, ShieldCheck, Ruler, Truck, Sparkles, Check, Gift } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductModal({ product, onClose, onOpenSizeGuide }) {
  if (!product) return null;

  const { addToCart, wishlist, toggleWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState('15 - 16 cm (Chuẩn Nữ)');
  const [quantity, setQuantity] = useState(1);
  const [giftNote, setGiftNote] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  const sizeOptions = [
    { value: '14 - 15 cm', label: '14 - 15 cm (Cổ tay rất nhỏ)' },
    { value: '15 - 16 cm (Chuẩn Nữ)', label: '15 - 16 cm (Chuẩn Nữ)' },
    { value: '16 - 17 cm (Vừa tay)', label: '16 - 17 cm (Vừa tay)' },
    { value: '17 - 18 cm (Chuẩn Nam)', label: '17 - 18 cm (Chuẩn Nam)' },
    { value: '18 - 19 cm (Tay đậm)', label: '18 - 19 cm (Tay đậm)' },
  ];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-[#26211C] transition-all shadow-sm"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left: Product Image */}
          <div className="relative bg-[#F3ECE1] p-6 sm:p-8 flex items-center justify-center">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-artisan border border-[#E8DFD3]">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.tag && (
                <span className="absolute top-3 left-3 bg-[#26211C] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {product.tag}
                </span>
              )}
            </div>
          </div>

          {/* Right: Details & Options */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="space-y-4">
              
              {/* Category & Mệnh tags */}
              <div className="flex flex-wrap items-center gap-2">
                {product.menh && product.menh.map((m, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-0.5 rounded-full bg-[#FBEFEA] text-[#B86244] font-medium border border-[#E8DFD3]">
                    Hợp Mệnh: {m}
                  </span>
                ))}
                <span className="text-xs text-[#6B6258] ml-auto italic">
                  Chế tác: {product.artisanName}
                </span>
              </div>

              {/* Best Seller highlight */}
              {product.isBestSeller && (
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-600 via-[#B86244] to-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
                  <span>SẢN PHẨM BÁN CHẠY NHẤT (BEST SELLER)</span>
                  {product.salesCount && (
                    <span className="font-normal opacity-90">· Đã bán {product.salesCount.toLocaleString('vi-VN')}+ chiếc</span>
                  )}
                </div>
              )}

              {/* Title */}
              <h2 className="font-serif-boutique text-2xl sm:text-3xl font-bold text-[#26211C] leading-snug">
                {product.name}
              </h2>

              {/* Ratings */}
              <div className="flex items-center gap-2 text-sm text-[#6B6258]">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <span className="font-semibold text-[#26211C]">{product.rating}</span>
                <span>·</span>
                <span>{product.reviewsCount} khách hàng hài lòng</span>
              </div>

              {/* Pricing breakdown: Retail & Wholesale */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3] space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-bold text-[#B86244]">
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="text-xs text-[#8C8276] ml-1.5 font-medium">/ Giá bán lẻ</span>
                  </div>
                  <span className="text-xs text-[#4E6857] bg-[#EDF3EF] px-2.5 py-1 rounded-full font-semibold">
                    {product.leadTime || 'Làm thủ công 2h'}
                  </span>
                </div>

                {product.wholesalePrice && (
                  <div className="pt-2 border-t border-[#E8DFD3] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#4E6857] bg-[#EDF3EF] px-2 py-0.5 rounded">
                        Giá Sỉ Xưởng
                      </span>
                      <span className="font-bold text-base text-[#4E6857]">
                        {product.wholesalePrice.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-[#6B6258] text-[11px]">
                        (Tiết kiệm {(product.price - product.wholesalePrice).toLocaleString('vi-VN')}₫/c)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Cord Composition Breakdown */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E8DFD3] space-y-2 text-xs shadow-xs">
                <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                  <span className="font-bold text-[#26211C] flex items-center gap-1.5">
                    <span className="text-sm">🪢</span> Cấu Tạo Thành Phần Sợi Dây Thủ Công
                  </span>
                  <span className="text-[10px] text-[#4E6857] font-semibold bg-[#EDF5F0] px-2 py-0.5 rounded">
                    Xưởng KhánhVyMade
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#6B6258] leading-relaxed">
                  <p>🧵 <strong>Sợi dây chính:</strong> {product.cordComposition?.coreMaterial || product.cordType}</p>
                  <p>🪢 <strong>Kiểu đan:</strong> {product.cordComposition?.braidingTechnique || 'Đan thoi Square Knot thủ công'}</p>
                  <p>💎 <strong>Charm & Hạt:</strong> {product.cordComposition?.mainCharm || product.stoneType}</p>
                  <p>🎨 <strong>Màu sắc dây:</strong> {product.cordComposition?.cordColor || 'Kem Be Vintage'}</p>
                  <p className="col-span-full">📏 <strong>Khóa hoàn thiện:</strong> {product.cordComposition?.wristSizeRange || '13cm - 19cm (Khóa trượt tự do ôm khít tay)'}</p>
                  <p className="col-span-full text-[#4E6857] font-semibold">🛡️ <strong>Độ bền & Bảo hành:</strong> {product.cordComposition?.durability || 'Chống nước tắm giặt, bảo hành đan lại dây trọn đời'}</p>
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-[#E8DFD3]">
                <div>
                  <span className="text-[#8C8276] block">Chất liệu đá:</span>
                  <span className="font-semibold text-[#26211C]">{product.stoneType}</span>
                </div>
                <div>
                  <span className="text-[#8C8276] block">Kích thước hạt:</span>
                  <span className="font-semibold text-[#26211C]">{product.beadSize}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-[#F3ECE1]">
                  <span className="text-[#8C8276] block">Loại dây kết:</span>
                  <span className="font-semibold text-[#26211C]">{product.cordType}</span>
                </div>
              </div>

              {/* Spiritual Energy & Description */}
              <div className="space-y-2 text-xs sm:text-sm text-[#6B6258] leading-relaxed">
                <p><strong>Mô tả:</strong> {product.description}</p>
                <div className="p-3 bg-[#FAF4ED] rounded-xl border border-[#EADBCC] text-[#845339]">
                  <strong className="flex items-center gap-1 mb-1 text-[#B86244]">
                    <Sparkles className="w-4 h-4" /> Năng lượng & Ý nghĩa:
                  </strong>
                  {product.meaning}
                </div>
              </div>

              {/* Wrist Size Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-[#26211C]">
                    Chọn Kích Thước Cổ Tay (Size):
                  </label>
                  <button
                    type="button"
                    onClick={onOpenSizeGuide}
                    className="text-[#B86244] hover:underline flex items-center gap-1 font-medium"
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
                      className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                        selectedSize === opt.value
                          ? 'border-[#B86244] bg-[#FBEFEA] text-[#B86244] font-semibold'
                          : 'border-[#E8DFD3] bg-white text-[#26211C] hover:bg-[#F3ECE1]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gift Note Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#26211C] flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-[#B86244]" />
                  Ghi chú cho nghệ nhân / Yêu cầu khắc tên:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Khắc chữ T&H, gói kèm túi gấm đỏ mừng thọ..."
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                />
              </div>

            </div>

            {/* Actions: Quantity & Add to Cart */}
            <div className="space-y-3 pt-4 border-t border-[#E8DFD3]">
              {/* Wholesale notification trigger */}
              {product.wholesalePrice && (
                <div>
                  {quantity >= (product.wholesaleMinQty || 5) ? (
                    <div className="p-2.5 bg-[#EDF5F0] border border-[#C2DEC8] rounded-xl flex items-center justify-between text-xs text-[#2E583A]">
                      <span className="font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#3A754B]" />
                        Đã kích hoạt Giá Sỉ Xưởng ({quantity} chiếc)
                      </span>
                      <span className="font-bold bg-[#3A754B] text-white px-2 py-0.5 rounded-full text-[10px]">
                        Tiết kiệm {((product.price - product.wholesalePrice) * quantity).toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 bg-[#FAF4ED] border border-[#EADBCC] rounded-xl text-xs text-[#845339] flex items-center justify-between">
                      <span>💡 Mua thêm <strong>{(product.wholesaleMinQty || 5) - quantity} chiếc</strong> nữa để nhận giá sỉ</span>
                      <button 
                        type="button" 
                        onClick={() => setQuantity(product.wholesaleMinQty || 5)}
                        className="text-[10px] font-bold text-[#B86244] underline hover:text-[#A05237]"
                      >
                        Chọn nhanh {(product.wholesaleMinQty || 5)}c
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* Quantity adjuster */}
                <div className="flex items-center border border-[#E8DFD3] rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-sm text-[#26211C] hover:bg-[#F3ECE1] transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-semibold text-[#26211C]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-sm text-[#26211C] hover:bg-[#F3ECE1] transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Main Add Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    isAdded 
                      ? 'bg-[#4E6857] text-white' 
                      : 'bg-[#B86244] hover:bg-[#A05237] text-white shadow-artisan-hover'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã Thêm Vào Giỏ!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        Thêm Vào Giỏ · {((quantity >= (product.wholesaleMinQty || 5) && product.wholesalePrice ? product.wholesalePrice : product.price) * quantity).toLocaleString('vi-VN')}₫
                        {quantity >= (product.wholesaleMinQty || 5) && product.wholesalePrice ? ' (Sỉ Xưởng)' : ''}
                      </span>
                    </>
                  )}
                </button>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="p-3 rounded-xl border border-[#E8DFD3] bg-white hover:bg-[#FBEFEA] text-[#6B6258] hover:text-[#B86244] transition-colors"
                  title="Yêu thích"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#B86244] text-[#B86244]' : ''}`} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-between text-[11px] text-[#6B6258] pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#4E6857]" /> Giao hàng toàn quốc
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C09A58]" /> Miễn phí thay dây trọn đời
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
