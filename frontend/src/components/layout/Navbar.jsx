import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  Search, 
  Menu, 
  X, 
  Camera,
  Ruler, 
  Truck,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
  ChevronDown
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenCustomizer, 
  onOpenAICamera,
  onOpenTracking, 
  onOpenSizeGuide,
  onOpenAdmin,
  isAdminView,
  searchQuery,
  setSearchQuery,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onLogout
}) {
  const { totalCount, openCart, wishlist, openWishlist } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Refs cho các phần tử xổ xuống để phát hiện click bên ngoài
  const userDropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchBtnRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileToggleBtnRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // 1. Đóng dropdown tài khoản khi click ra ngoài
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }

      // 2. Đóng thanh tìm kiếm khi click ra ngoài thanh tìm kiếm và nút tìm kiếm
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target) &&
        searchBtnRef.current && 
        !searchBtnRef.current.contains(event.target)
      ) {
        setShowSearchInput(false);
      }

      // 3. Đóng mobile menu khi click ra ngoài mobile menu và nút mở
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target) &&
        mobileToggleBtnRef.current && 
        !mobileToggleBtnRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowUserDropdown(false);
        setShowSearchInput(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/80 backdrop-blur-2xl border-b border-white/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)] ios-spring w-full max-w-full pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-1.5 sm:gap-3">
          
          {/* 1. LEFT: Brand Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button 
              ref={mobileToggleBtnRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-[#26211C] hover:bg-[#EFE6DA] transition-colors lg:hidden shrink-0"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Monogram & Title */}
            <div 
              className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer select-none group" 
              onClick={() => { setActiveTab('all'); if (isAdminView) onOpenAdmin(false); }}
            >
              <img 
                src="/logo.png" 
                alt="Logo Vòng Tay Nhà Zy" 
                className="w-8 h-8 sm:w-11 sm:h-11 rounded-full object-cover shadow-sm border-2 border-[#B86244]/60 group-hover:scale-105 group-hover:border-[#B86244] transition-all shrink-0" 
              />
              <div>
                <span className="font-serif-boutique text-base sm:text-2xl font-bold tracking-tight sm:tracking-wider text-[#26211C] block leading-none group-hover:text-[#B86244] transition-colors whitespace-nowrap">
                  VÒNG TAY NHÀ ZY
                </span>
                <span className="text-[8px] sm:text-[9px] tracking-wider sm:tracking-[0.22em] text-[#B86244] uppercase font-semibold hidden sm:block mt-1 whitespace-nowrap">
                  Vòng Tay Thủ Công & Gương Đính Độc Bản
                </span>
              </div>
            </div>
          </div>

          {/* 2. CENTER: Luxury Boutique Category Cards & Actions */}
          <nav className="hidden lg:flex items-center justify-center gap-1.5 xl:gap-2 flex-1 mx-2 xl:mx-4 overflow-x-auto no-scrollbar py-1">
            {/* Category Cards Frosted Group */}
            <div className="flex items-center gap-1 p-1 bg-[#FAF4ED]/95 backdrop-blur-md rounded-2xl border border-[#EADBCC] shadow-2xs">
              <button
                onClick={() => { setActiveTab('all'); if (isAdminView) onOpenAdmin(false); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                  !isAdminView && activeTab === 'all'
                    ? 'bg-gradient-to-r from-[#B86244] to-[#C86A45] text-white font-bold shadow-xs' 
                    : 'text-[#5A5147] hover:text-[#26211C] hover:bg-white/90'
                }`}
              >
                <span>✨</span>
                <span>Tất Cả Sản Phẩm</span>
              </button>

              <button
                onClick={() => { setActiveTab('guong-dinh'); if (isAdminView) onOpenAdmin(false); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                  !isAdminView && activeTab === 'guong-dinh'
                    ? 'bg-gradient-to-r from-[#B86244] to-[#C86A45] text-white font-bold shadow-xs' 
                    : 'text-[#5A5147] hover:text-[#26211C] hover:bg-white/90'
                }`}
              >
                <span>🪞</span>
                <span>Gương Đính Gập & Đơn</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase ${
                  !isAdminView && activeTab === 'guong-dinh' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
                }`}>
                  Mới
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('macrame-pastel'); if (isAdminView) onOpenAdmin(false); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                  !isAdminView && activeTab === 'macrame-pastel'
                    ? 'bg-gradient-to-r from-[#B86244] to-[#C86A45] text-white font-bold shadow-xs' 
                    : 'text-[#5A5147] hover:text-[#26211C] hover:bg-white/90'
                }`}
              >
                <span>🌸</span>
                <span>Macrame Pastel</span>
              </button>

              <button
                onClick={() => { setActiveTab('vong-doi'); if (isAdminView) onOpenAdmin(false); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                  !isAdminView && activeTab === 'vong-doi'
                    ? 'bg-gradient-to-r from-[#B86244] to-[#C86A45] text-white font-bold shadow-xs' 
                    : 'text-[#5A5147] hover:text-[#26211C] hover:bg-white/90'
                }`}
              >
                <span>💫</span>
                <span>Vòng Đôi Dây Sáp</span>
              </button>

              <button
                onClick={() => { setActiveTab('day-do-may-man'); if (isAdminView) onOpenAdmin(false); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                  !isAdminView && activeTab === 'day-do-may-man'
                    ? 'bg-gradient-to-r from-[#B86244] to-[#C86A45] text-white font-bold shadow-xs' 
                    : 'text-[#5A5147] hover:text-[#26211C] hover:bg-white/90'
                }`}
              >
                <span>🏮</span>
                <span>Dây Đỏ Hộ Thân</span>
              </button>
            </div>

            <div className="h-4 w-[1px] bg-[#E8DFD3] mx-0.5"></div>

            {/* Customizer button card */}
            <button
              onClick={onOpenCustomizer}
              className="px-3.5 py-2 text-xs font-semibold rounded-2xl bg-[#FAF4ED] hover:bg-[#F2E5D5] text-[#B86244] border border-[#EADBCC] transition-all duration-200 whitespace-nowrap inline-flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tự Phối Vòng</span>
            </button>

            {/* AI Camera Stylist button card */}
            <button
              onClick={onOpenAICamera}
              className="px-3.5 py-2 text-xs font-semibold rounded-2xl bg-gradient-to-r from-[#B86244] to-[#A05237] hover:brightness-105 text-white transition-all duration-200 whitespace-nowrap inline-flex items-center gap-1.5 shadow-xs hover:shadow-md cursor-pointer"
              title="Quét cổ tay/cánh tay đo size & Tải ảnh gợi ý phối từ hạt và charm có sẵn"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span>AI Quét & Gợi Ý Vòng</span>
            </button>
          </nav>

          {/* 3. RIGHT: Actions (Search, Wishlist, ĐĂNG NHẬP, QUẢN TRỊ, GIỎ HÀNG) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
            
            {/* Search Icon Trigger */}
            <button
              ref={searchBtnRef}
              onClick={() => setShowSearchInput(!showSearchInput)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                showSearchInput 
                  ? 'bg-[#26211C] text-white' 
                  : 'text-[#5A5147] hover:text-[#26211C] hover:bg-[#EFE6DA]'
              }`}
              title="Tìm kiếm vòng tay dây"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Button - Hidden on mobile (< md), accessible via mobile drawer and account profile */}
            <button
              onClick={() => {
                openWishlist();
                setActiveTab('wishlist');
              }}
              className={`hidden md:flex relative w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center transition-all shrink-0 ${
                activeTab === 'wishlist' 
                  ? 'bg-[#FAF4ED] text-[#B86244]' 
                  : 'text-[#5A5147] hover:text-[#B86244] hover:bg-[#EFE6DA]'
              }`}
              title="Bộ sưu tập yêu thích của bạn"
            >
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-[#B86244] text-[#B86244]' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B86244] text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border-2 border-[#FAF7F2] shadow-2xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* USER AUTH / PROFILE */}
            {currentUser ? (
              <div ref={userDropdownRef} className="relative shrink-0">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1 sm:gap-1.5 bg-[#FAF4ED] p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 rounded-full border border-[#E8DFD3] text-xs font-semibold text-[#26211C] hover:bg-[#F0E6D8] transition-all shadow-2xs whitespace-nowrap shrink-0"
                  title={currentUser.fullName}
                >
                  <div className="w-6 h-6 rounded-full bg-[#B86244] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline">
                    {currentUser.fullName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#8C8276] hidden sm:inline" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-white/90 p-2 z-50 animate-scaleIn text-xs">
                    <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7F2]/80 border border-white/60 mb-1">
                      <p className="font-bold text-[#26211C] truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-[#8C8276] truncate">{currentUser.email}</p>
                      {currentUser.phone && (
                        <p className="text-[10px] text-[#B86244] mt-0.5">SĐT: {currentUser.phone}</p>
                      )}
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#F3ECE1] text-[#6B6258] font-semibold">
                        Vai trò: {currentUser.role === 'admin' ? 'Quản Trị Viên' : 'Khách Hàng'}
                      </span>
                    </div>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => { onOpenAdmin(true); setShowUserDropdown(false); }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-[#FAF4ED] text-[#4E6857] font-semibold flex items-center gap-2 transition-colors ios-press"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Mở Trang Quản Trị</span>
                      </button>
                    )}

                    <button
                      onClick={() => { onOpenProfile('orders'); setShowUserDropdown(false); }}
                      className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-[#FAF4ED] text-[#26211C] font-medium flex items-center gap-2 transition-colors ios-press"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#B86244]" />
                      <span>Lịch sử đơn hàng của tôi</span>
                    </button>

                    <button
                      onClick={() => { openWishlist(); setShowUserDropdown(false); }}
                      className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-[#FAF4ED] text-[#26211C] font-medium flex items-center justify-between transition-colors ios-press"
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-[#B86244] fill-[#B86244]" />
                        <span>Bộ sưu tập yêu thích</span>
                      </span>
                      <span className="text-[10px] bg-[#FAF4ED] text-[#B86244] font-bold px-2 py-0.5 rounded-full border border-[#EADBCC]">
                        {wishlist.length}
                      </span>
                    </button>

                    <button
                      onClick={() => { onOpenProfile('profile'); setShowUserDropdown(false); }}
                      className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-[#FAF4ED] text-[#26211C] font-medium flex items-center gap-2 transition-colors ios-press"
                    >
                      <User className="w-4 h-4 text-[#B86244]" />
                      <span>Thông tin tài khoản</span>
                    </button>

                    <button
                      onClick={() => { onOpenTracking(); setShowUserDropdown(false); }}
                      className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-[#FAF4ED] text-[#26211C] flex items-center gap-2 transition-colors ios-press"
                    >
                      <Truck className="w-4 h-4 text-[#B86244]" />
                      <span>Tra cứu vận chuyển đơn</span>
                    </button>

                    <div className="border-t border-[#F0EAE1] mt-1 pt-1">
                      <button
                        onClick={() => { onLogout(); setShowUserDropdown(false); }}
                        className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-semibold flex items-center gap-2 transition-colors ios-press"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng Xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden sm:inline-flex items-center gap-1 sm:gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAF4ED] text-[#B86244] border border-[#EADBCC] hover:bg-[#B86244] hover:text-white transition-all shadow-2xs whitespace-nowrap shrink-0 hover:shadow-sm ios-press"
                title="Đăng nhập hoặc đăng ký tài khoản"
              >
                <User className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}

            {/* Admin Toggle Button - ONLY VISIBLE ON TABLET/DESKTOP WHEN LOGGED IN AS ADMIN */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onOpenAdmin(!isAdminView)}
                className={`hidden md:inline-flex px-2.5 py-1.5 rounded-full text-xs font-semibold items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ios-press ${
                  isAdminView 
                    ? 'bg-[#4E6857] text-white shadow-xs' 
                    : 'bg-[#EDF3EF] text-[#4E6857] hover:bg-[#D8E6DE]'
                }`}
                title="Khu vực Quản Trị Hệ Thống"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAdminView ? 'Về Shop' : 'Quản Trị'}</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="relative w-8 h-8 sm:w-9 sm:h-9 bg-[#26211C] text-[#FAF7F2] rounded-full hover:bg-[#3D352E] transition-all shadow-xs flex items-center justify-center shrink-0 ios-press"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B86244] text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border-2 border-[#FAF7F2] shadow-xs">
                  {totalCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Search Input Popover Row (Opens cleanly below navbar, never crowding items) */}
        {showSearchInput && (
          <div ref={searchContainerRef} className="pb-3 pt-1 border-t border-white/70 animate-fadeIn flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-[#8C8276] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm vòng tay dây macrame, cá voi, hoa cúc, bướm fairy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white/85 backdrop-blur-xl rounded-full border border-white/90 text-xs sm:text-sm text-[#26211C] placeholder-[#8C8276] focus:outline-none focus:ring-2 focus:ring-[#B86244]/30 shadow-sm"
                autoFocus
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8276] hover:text-[#26211C]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu & Outside Backdrop */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 top-16 sm:top-20 bg-black/30 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div 
            ref={mobileMenuRef}
            className="relative z-40 lg:hidden bg-[#FAF7F2]/95 backdrop-blur-2xl border-b border-white/80 px-4 pt-2 pb-6 space-y-3 shadow-2xl animate-fadeIn"
          >
          
          {/* Mobile User Profile / Login Card */}
          <div className="bg-[#FAF4ED] p-3 rounded-2xl border border-[#E8DFD3]">
            {currentUser ? (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#B86244] text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#26211C]">{currentUser.fullName}</p>
                      <p className="text-[10px] text-[#8C8276]">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                    className="px-2 py-1 text-xs text-rose-600 bg-rose-50 rounded-lg font-semibold"
                  >
                    Đăng Xuất
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-[#E8DFD3]">
                  <button
                    onClick={() => { onOpenProfile('orders'); setIsMobileMenuOpen(false); }}
                    className="py-1.5 px-2.5 bg-white rounded-xl border border-[#E8DFD3] text-[11px] font-semibold text-[#26211C] flex items-center justify-center gap-1.5 hover:bg-[#FAF4ED]"
                  >
                    <ShoppingBag className="w-3 h-3 text-[#B86244]" />
                    <span>Đơn Hàng</span>
                  </button>
                  <button
                    onClick={() => { onOpenProfile('wishlist'); setIsMobileMenuOpen(false); }}
                    className="py-1.5 px-2.5 bg-white rounded-xl border border-[#E8DFD3] text-[11px] font-semibold text-[#26211C] flex items-center justify-center gap-1.5 hover:bg-[#FAF4ED]"
                  >
                    <Heart className="w-3 h-3 text-[#B86244] fill-[#B86244]" />
                    <span>Yêu Thích ({wishlist.length})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#6B6258]">
                  👋 Đăng nhập tài khoản để nhận ưu đãi và đồng bộ đơn hàng:
                </p>
                <button
                  onClick={() => { onOpenAuth(); setIsMobileMenuOpen(false); }}
                  className="w-full py-2 rounded-xl bg-[#B86244] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-200" />
                  <span>Đăng Nhập / Đăng Ký Tài Khoản</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Category Cards */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider px-1">
              Danh Mục Bộ Sưu Tập
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => { setActiveTab('all'); if (isAdminView) onOpenAdmin(false); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'all' && !isAdminView 
                    ? 'bg-gradient-to-r from-[#B86244] to-[#C86A45] text-white shadow-xs font-bold' 
                    : 'bg-white/80 text-[#26211C] border border-[#EADBCC]/70 hover:bg-white'
                }`}
              >
                <span className="flex items-center gap-2"><span>✨</span> Tất Cả Sản Phẩm</span>
                <span className="text-[10px] opacity-70">Xem hết</span>
              </button>

              <button
                onClick={() => { setActiveTab('guong-dinh'); if (isAdminView) onOpenAdmin(false); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'guong-dinh' && !isAdminView 
                    ? 'bg-gradient-to-r from-[#B86244] to-[#C86A45] text-white shadow-xs font-bold' 
                    : 'bg-white/80 text-[#26211C] border border-[#EADBCC]/70 hover:bg-white'
                }`}
              >
                <span className="flex items-center gap-2"><span>🪞</span> Gương Đính Gập & Đơn</span>
                <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full font-bold">Mới</span>
              </button>

              <button
                onClick={() => { setActiveTab('macrame-pastel'); if (isAdminView) onOpenAdmin(false); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'macrame-pastel' && !isAdminView 
                    ? 'bg-gradient-to-r from-[#B86244] to-[#C86A45] text-white shadow-xs font-bold' 
                    : 'bg-white/80 text-[#26211C] border border-[#EADBCC]/70 hover:bg-white'
                }`}
              >
                <span className="flex items-center gap-2"><span>🌸</span> Macrame Pastel</span>
                <span className="text-[10px] opacity-70">Trend</span>
              </button>

              <button
                onClick={() => { setActiveTab('vong-doi'); if (isAdminView) onOpenAdmin(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'vong-doi' && !isAdminView 
                    ? 'bg-gradient-to-r from-[#B86244] to-[#C86A45] text-white shadow-xs font-bold' 
                    : 'bg-white/80 text-[#26211C] border border-[#EADBCC]/70 hover:bg-white'
                }`}
              >
                <span className="flex items-center gap-2"><span>💫</span> Vòng Đôi Dây Sáp</span>
                <span className="text-[10px] opacity-70">Cặp đôi</span>
              </button>

              <button
                onClick={() => { setActiveTab('day-do-may-man'); if (isAdminView) onOpenAdmin(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'day-do-may-man' && !isAdminView 
                    ? 'bg-gradient-to-r from-[#B86244] to-[#C86A45] text-white shadow-xs font-bold' 
                    : 'bg-white/80 text-[#26211C] border border-[#EADBCC]/70 hover:bg-white'
                }`}
              >
                <span className="flex items-center gap-2"><span>🏮</span> Dây Đỏ Hộ Thân</span>
                <span className="text-[10px] opacity-70">Bình an</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => { onOpenAICamera(); setIsMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-[#B86244] text-white flex items-center justify-between shadow-xs"
          >
            <span className="flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-amber-200" />
              AI Quét Cổ Tay Nhận Diện Vòng Hợp
            </span>
            <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full uppercase">VIP</span>
          </button>

          <button
            onClick={() => { openWishlist(); setIsMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FAF4ED] text-[#B86244] border border-[#EADBCC] flex items-center justify-between shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-[#B86244] fill-[#B86244]" />
              Bộ Sưu Tập Yêu Thích Của Bạn
            </span>
            <span className="text-[10px] bg-[#B86244] text-white font-bold px-2 py-0.5 rounded-full">
              {wishlist.length}
            </span>
          </button>

          <button
            onClick={() => { onOpenCustomizer(); setIsMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FAF4ED] text-[#B86244] border border-[#EADBCC] flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Xưởng Tự Phối Vòng Studio
            </span>
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => { onOpenAdmin(!isAdminView); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#EDF3EF] text-[#4E6857] flex items-center gap-2"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Trang Quản Trị (Đơn hàng, Mã giảm giá, Sản phẩm, DB)</span>
            </button>
          )}

          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => { onOpenSizeGuide(); setIsMobileMenuOpen(false); }}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-[#EFE6DA] text-[#26211C] flex items-center justify-center gap-1.5"
            >
              <Ruler className="w-3 h-3 text-[#B86244]" />
              Đo Size Cổ Tay
            </button>
            <button
              onClick={() => { onOpenTracking(); setIsMobileMenuOpen(false); }}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-[#EFE6DA] text-[#26211C] flex items-center justify-center gap-1.5"
            >
              <Truck className="w-3 h-3 text-[#B86244]" />
              Tra Cứu Đơn
            </button>
          </div>
        </div>
        </>
      )}
    </header>
  );
}
