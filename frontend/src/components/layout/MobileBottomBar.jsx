import React from 'react';
import { Home, Sparkles, Camera, ShoppingBag, User, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function MobileBottomBar({
  activeTab,
  setActiveTab,
  onOpenCustomizer,
  onOpenAICamera,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  isAdminView,
  onOpenAdmin,
  onScrollToProducts
}) {
  const { totalCount, openCart, wishlist, openWishlist } = useCart();

  const handleHomeClick = () => {
    setActiveTab('all');
    if (isAdminView) onOpenAdmin(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserClick = () => {
    if (currentUser) {
      onOpenProfile('orders');
    } else {
      onOpenAuth();
    }
  };

  return (
    <nav 
      className="lg:hidden fixed bottom-3 left-3 right-3 z-40 ios-dock max-w-md mx-auto shadow-[0_12px_36px_rgba(0,0,0,0.12)] mb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Thanh điều hướng di động"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        
        {/* 1. Trang Chủ */}
        <button
          type="button"
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center py-1 ios-press ${
            !isAdminView && activeTab === 'all'
              ? 'text-[#B86244] font-bold'
              : 'text-[#6B6258] hover:text-[#26211C]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Trang Chủ</span>
        </button>

        {/* 2. Tự Phối Studio */}
        <button
          type="button"
          onClick={onOpenCustomizer}
          className="flex flex-col items-center justify-center py-1 text-[#6B6258] hover:text-[#B86244] ios-press"
        >
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span className="text-[10px] mt-1 font-medium">Tự Phối</span>
        </button>

        {/* 3. AI Đo Cổ Tay (Floating Island Button) */}
        <button
          type="button"
          onClick={onOpenAICamera}
          className="flex flex-col items-center justify-center -mt-4 group ios-press"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-[#B86244] to-rose-600 text-white flex items-center justify-center shadow-lg shadow-[#B86244]/35 border border-white/80 group-hover:scale-105 ios-spring">
            <Camera className="w-6 h-6 text-amber-100" />
          </div>
          <span className="text-[10px] mt-1 font-bold text-[#B86244]">AI Đo Tay</span>
        </button>

        {/* 4. Giỏ Hàng */}
        <button
          type="button"
          onClick={openCart}
          className="relative flex flex-col items-center justify-center py-1 text-[#6B6258] hover:text-[#B86244] ios-press"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#B86244] text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                {totalCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Giỏ Hàng</span>
        </button>

        {/* 5. Tài Khoản */}
        <button
          type="button"
          onClick={handleUserClick}
          className="flex flex-col items-center justify-center py-1 text-[#6B6258] hover:text-[#B86244] ios-press"
        >
          {currentUser ? (
            <div className="w-5 h-5 rounded-full bg-[#B86244] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
              {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] mt-1 font-medium truncate max-w-[60px]">
            {currentUser ? 'Tôi' : 'Đăng Nhập'}
          </span>
        </button>

      </div>
    </nav>
  );
}
