import React from 'react';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function WishlistDrawer({ products = [], onOpenProduct, onSelectWishlistTab }) {
  const { 
    wishlist, 
    isWishlisted, 
    toggleWishlist, 
    addToCart, 
    isWishlistOpen, 
    closeWishlist 
  } = useCart();

  if (!isWishlistOpen) return null;

  // Filter wishlisted products from master product list
  const wishlistedItems = (products || []).filter(p => isWishlisted(p.id));

  const handleOpenProduct = (product) => {
    closeWishlist();
    if (onOpenProduct) onOpenProduct(product);
  };

  const handleQuickAdd = (product, e) => {
    e.stopPropagation();
    addToCart(product, 1, { wristSize: '15 - 16 cm' });
  };

  const handleViewAllOnShop = () => {
    closeWishlist();
    if (onSelectWishlistTab) {
      onSelectWishlistTab();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeWishlist}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col justify-between border-l border-[#E8DFD3]">
          
          {/* Header */}
          <div className="p-5 bg-white border-b border-[#E8DFD3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FAF4ED] text-[#B86244] flex items-center justify-center border border-[#EADBCC]">
                <Heart className="w-4 h-4 fill-[#B86244]" />
              </div>
              <div>
                <h3 className="font-serif-boutique text-lg sm:text-xl font-bold text-[#26211C] leading-tight">
                  Mục Yêu Thích ({wishlist.length})
                </h3>
                <p className="text-[11px] text-[#8C8276]">Các mẫu vòng tay thủ công bạn đã lưu</p>
              </div>
            </div>
            <button
              onClick={closeWishlist}
              className="p-1.5 rounded-full hover:bg-[#F3ECE1] text-[#6B6258] hover:text-[#26211C] transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {wishlistedItems.length === 0 ? (
              <div className="py-16 text-center space-y-3.5 bg-white rounded-3xl border border-[#E8DFD3] p-6 shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-[#FAF4ED] text-[#B86244] flex items-center justify-center mx-auto border border-[#EADBCC]">
                  <Heart className="w-7 h-7 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif-boutique text-lg font-bold text-[#26211C]">
                    Mục yêu thích đang trống
                  </h4>
                  <p className="text-xs text-[#8C8276] max-w-xs mx-auto leading-relaxed">
                    Bạn chưa lưu mẫu vòng tay nào. Nhấn biểu tượng trái tim ❤️ ở bất kỳ sản phẩm nào để lưu xem lại nhé!
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeWishlist();
                    const el = document.getElementById('products-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-2 px-5 py-2.5 rounded-full bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold transition-all shadow-sm"
                >
                  Khám Phá Gian Hàng Vòng Tay
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {wishlistedItems.map(product => (
                  <div
                    key={product.id}
                    className="p-3 bg-white rounded-2xl border border-[#E8DFD3] shadow-xs flex items-center justify-between gap-3 hover:shadow-md transition-all group"
                  >
                    {/* Product Image & Info */}
                    <div 
                      onClick={() => handleOpenProduct(product)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <img
                        src={product.images?.[0] || '/images/products/bracelet-pastel-macrame-trio.jpg'}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#E8DFD3] shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {product.tag && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FAF4ED] text-[#B86244] font-semibold border border-[#EADBCC]">
                              {product.tag}
                            </span>
                          )}
                          <span className="text-[10px] text-[#8C8276] truncate">
                            {product.beadSize || '8mm'}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs sm:text-sm text-[#26211C] truncate group-hover:text-[#B86244] transition-colors">
                          {product.name}
                        </h5>
                        <p className="text-[10px] text-[#8C8276] truncate mt-0.5">
                          {product.cordComposition?.coreMaterial || product.cordType || 'Dây macrame thủ công'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs sm:text-sm font-bold text-[#B86244]">
                            {(product.price || 0).toLocaleString('vi-VN')}₫
                          </span>
                          {product.wholesalePrice && (
                            <span className="text-[10px] text-[#4E6857] font-semibold bg-[#EDF3EF] px-1.5 py-0.5 rounded">
                              Sỉ: {(product.wholesalePrice).toLocaleString('vi-VN')}₫
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="p-2 sm:px-3 sm:py-1.5 bg-[#26211C] hover:bg-[#3D352E] text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors shadow-sm"
                        title="Thêm nhanh vào giỏ hàng"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Thêm giỏ</span>
                      </button>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors"
                        title="Bỏ khỏi yêu thích"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {wishlistedItems.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFD3] space-y-2.5">
              <button
                onClick={handleViewAllOnShop}
                className="w-full py-3 px-4 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Xem Toàn Bộ Trên Gian Hàng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-between text-xs text-[#8C8276] px-1">
                <span>{wishlistedItems.length} mẫu đã lưu</span>
                <button
                  onClick={closeWishlist}
                  className="hover:text-[#26211C] font-semibold underline underline-offset-2"
                >
                  Tiếp tục xem mẫu
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
