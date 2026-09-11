import React from 'react';
import { Star, Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { isBraceletProduct } from '../../utils/productUtils';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart, isWishlisted, toggleWishlist } = useCart();
  const liked = isWishlisted(product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1, { wristSize: isBraceletProduct(product) ? '15 - 16 cm' : null });
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const categoryNameMap = {
    'macrame-pastel': '🌸 Macrame Pastel',
    'guong-dinh': '🪞 Gương Đính Độc Bản',
    'vong-doi': '💞 Vòng Đôi Dây Sáp',
    'day-do-may-man': '🏮 Dây Đỏ May Mắn',
    'day-chuyen-vintage': '📿 Dây Chuyền Vintage',
    'day-lua-co-phong': '🎋 Dây Lụa Cổ Phong'
  };

  const imageSrc = (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) 
    ? product.images[0] 
    : (product.image || '/images/products/bracelet-pastel-macrame-trio.jpg');

  return (
    <div 
      onClick={() => onQuickView(product)}
      className="ios-glass-card rounded-[28px] overflow-hidden flex flex-col cursor-pointer relative group"
    >
      {/* Image Container with subtle inner rounded frame */}
      <div className="relative aspect-square overflow-hidden bg-[#F5EFE6]/80 m-2 sm:m-2.5 rounded-2xl sm:rounded-[1.4rem]">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          onError={(e) => { e.target.src = '/images/products/vong-dia-chuon-chuon-logo.jpg'; }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 items-start">
          {product.category && categoryNameMap[product.category] && (
            <span className="ios-pill bg-white/95 text-[#6B6258] text-[9.5px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs border border-white/80">
              {categoryNameMap[product.category]}
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-gradient-to-r from-amber-600 via-[#C59B6D] to-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3 text-yellow-100" />
              <span>BEST SELLER</span>
              {product.salesCount > 0 && (
                <span className="font-normal opacity-90">({product.salesCount})</span>
              )}
            </span>
          )}
          {product.tag && (
            <span className="ios-pill text-[#231F1C] text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
              {product.tag}
            </span>
          )}
          {product.menh && product.menh.length > 0 && product.menh[0] !== 'Tất cả' && (
            <span className="ios-pill text-[#C59B6D] text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
              Mệnh: {product.menh.join(', ')}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 backdrop-blur-xl text-[#6B6258] hover:text-[#C59B6D] transition-all duration-300 shadow-sm hover:scale-110 z-10 border border-white/90 ios-press"
          title="Thêm vào yêu thích"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-[#C59B6D] text-[#C59B6D]' : ''}`} />
        </button>

        {/* Quick View Hover Button */}
        <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1.5 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="flex-1 py-2 px-3 bg-white/90 backdrop-blur-xl text-[#231F1C] hover:bg-white text-xs font-semibold rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all border border-white/90 ios-press"
          >
            <Eye className="w-3.5 h-3.5 text-[#C59B6D]" />
            <span>Xem Chi Tiết</span>
          </button>
          
          <button
            onClick={handleAddToCart}
            className="p-2 btn-luxury-cta rounded-2xl shadow-md transition-all flex items-center justify-center cursor-pointer ios-press"
            title="Thêm nhanh vào giỏ"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Material & Artisan Sub-header */}
          <div className="flex items-center justify-between text-[11px] text-[#948A7E] mb-1.5">
            <span className="font-medium truncate max-w-[65%]">{product.stoneType}</span>
            <span className="text-[#C59B6D] font-semibold">{product.beadSize}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif-boutique text-base sm:text-lg font-bold text-[#231F1C] group-hover:text-[#C59B6D] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Artisan & Rating */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/60 text-xs">
            <span className="text-[#948A7E] italic text-[11px]">
              bởi {product.artisanName || 'KhánhVyMade'}
            </span>
            <div className="flex items-center gap-1 text-[#6B6258]">
              <Star className={`w-3.5 h-3.5 ${product.reviewsCount > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
              {product.reviewsCount > 0 ? (
                <>
                  <span className="font-bold text-[#231F1C]">{Number(product.rating || 5.0).toFixed(1)}</span>
                  <span className="text-[10px] text-[#948A7E]">({product.reviewsCount})</span>
                </>
              ) : (
                <span className="text-[10px] text-[#948A7E]">Mới ra mắt</span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-white/60 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-bold text-[#C59B6D] font-serif-boutique">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
              {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                <span className="text-[11px] text-[#948A7E] line-through font-medium">
                  {Number(product.originalPrice).toLocaleString('vi-VN')}₫
                </span>
              )}
              <span className="text-[9px] text-[#948A7E] uppercase font-semibold">Giá lẻ</span>
            </div>
            {product.wholesalePrice && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[11px] font-bold text-[#4E6857]">
                  {product.wholesalePrice.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-[9px] bg-[#E5EDE8] text-[#4E6857] px-1.5 py-0.2 rounded font-semibold">
                  Sỉ từ {product.wholesaleMinQty || 5}c
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FAF4E8]/90 text-[#C59B6D] border border-[#EADBCC] hover:bg-[#C59B6D] hover:text-white transition-all shadow-2xs cursor-pointer ios-press"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Mua</span>
          </button>
        </div>

      </div>
    </div>
  );
}
