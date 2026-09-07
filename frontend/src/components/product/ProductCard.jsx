import React from 'react';
import { Star, Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart, isWishlisted, toggleWishlist } = useCart();
  const liked = isWishlisted(product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1, { wristSize: '15 - 16 cm' });
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div 
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-2xl overflow-hidden border border-[#E8DFD3] shadow-artisan shadow-artisan-hover flex flex-col cursor-pointer transition-all duration-300 relative"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#F3ECE1]">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 items-start">
          {product.isBestSeller && (
            <span className="bg-gradient-to-r from-amber-600 via-[#B86244] to-rose-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3 text-yellow-200" />
              <span>BEST SELLER</span>
              {product.salesCount && (
                <span className="font-normal opacity-90">({product.salesCount}+)</span>
              )}
            </span>
          )}
          {product.tag && (
            <span className="bg-[#26211C]/90 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm shadow-sm">
              {product.tag}
            </span>
          )}
          {product.menh && product.menh.length > 0 && product.menh[0] !== 'Tất cả' && (
            <span className="bg-[#FAF7F2]/95 text-[#B86244] border border-[#E8DFD3] text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm">
              Mệnh: {product.menh.join(', ')}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-[#6B6258] hover:text-[#B86244] transition-all duration-200 shadow-sm hover:scale-110 z-10"
          title="Thêm vào yêu thích"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-[#B86244] text-[#B86244]' : ''}`} />
        </button>

        {/* Quick View Hover Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="flex-1 py-2 px-3 bg-white/95 text-[#26211C] hover:bg-white text-xs font-medium rounded-xl shadow-md backdrop-blur-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#B86244]" />
            <span>Xem Chi Tiết</span>
          </button>
          
          <button
            onClick={handleAddToCart}
            className="p-2 bg-[#B86244] hover:bg-[#A05237] text-white rounded-xl shadow-md transition-colors flex items-center justify-center"
            title="Thêm nhanh vào giỏ"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Material & Artisan Sub-header */}
          <div className="flex items-center justify-between text-[11px] text-[#8C8276] mb-1.5">
            <span className="font-medium truncate max-w-[65%]">{product.stoneType}</span>
            <span className="text-[#B86244] font-medium">{product.beadSize}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif-boutique text-base sm:text-lg font-bold text-[#26211C] group-hover:text-[#B86244] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Artisan & Rating */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F3ECE1] text-xs">
            <span className="text-[#6B6258] italic text-[11px]">
              bởi {product.artisanName}
            </span>
            <div className="flex items-center gap-1 text-[#6B6258]">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-semibold text-[#26211C]">{product.rating}</span>
              <span className="text-[10px] text-[#8C8276]">({product.reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-[#F3ECE1] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-[#B86244]">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
              <span className="text-[10px] text-[#8C8276] uppercase font-semibold">Giá lẻ</span>
            </div>
            {product.wholesalePrice && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[11px] font-bold text-[#4E6857]">
                  {product.wholesalePrice.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-[9px] bg-[#EDF3EF] text-[#4E6857] px-1.5 py-0.2 rounded font-semibold">
                  Sỉ từ {product.wholesaleMinQty || 5}c
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FBEFEA] text-[#B86244] hover:bg-[#B86244] hover:text-white transition-all shadow-2xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Mua</span>
          </button>
        </div>

      </div>
    </div>
  );
}
