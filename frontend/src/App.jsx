import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Feather, 
  Compass,
  ArrowRight,
  Filter,
  Camera,
  Palette,
  Flower2
} from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import { api } from './services/api';

import Navbar from './components/layout/Navbar';
import MobileBottomBar from './components/layout/MobileBottomBar';
import Footer from './components/layout/Footer';
import HeroSection from './components/home/HeroSection';
import ProductCard from './components/product/ProductCard';
import ProductFilter from './components/product/ProductFilter';
import ProductModal from './components/product/ProductModal';
import WristSizeModal from './components/product/WristSizeModal';
import BraceletStudio from './components/customizer/BraceletStudio';
import CartDrawer from './components/cart/CartDrawer';
import WishlistDrawer from './components/cart/WishlistDrawer';
import CheckoutModal from './components/checkout/CheckoutModal';
import OrderTrackingModal from './components/tracking/OrderTrackingModal';
import AdminDashboard from './components/admin/AdminDashboard';
import AICameraModal from './components/ai/AICameraModal';
import AuthModal from './components/auth/AuthModal';
import UserProfileModal from './components/auth/UserProfileModal';
import PersonalizedSection from './components/personalization/PersonalizedSection';
import ConcurrentSessionModal from './components/auth/ConcurrentSessionModal';
import { getSessionToken, setSessionToken } from './services/api';

function MainShop({ currentUser, setCurrentUser }) {
  const { wishlist, isWishlisted } = useCart();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileDefaultTab, setProfileDefaultTab] = useState('orders');

  const handleOpenProfile = (tab = 'orders') => {
    setProfileDefaultTab(tab);
    setIsProfileOpen(true);
  };

  // Navigation & view states
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMenh, setSelectedMenh] = useState('all');
  const [sortOption, setSortOption] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminView, setIsAdminView] = useState(false);

  // Modals states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [isAICameraOpen, setIsAICameraOpen] = useState(false);
  const [aiModalMode, setAiModalMode] = useState('wrist');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [aiCustomPreset, setAiCustomPreset] = useState(null);
  const [sessionConflict, setSessionConflict] = useState(null);

  // Single active session enforcement: Mỗi tài khoản chỉ đăng nhập trên 1 thiết bị duy nhất
  useEffect(() => {
    const handleSessionExpired = (e) => {
      const detail = e.detail || {};
      handleLogout();
      setSessionConflict({
        isOpen: true,
        message: detail.message || 'Tài khoản của bạn vừa được đăng nhập trên một thiết bị khác.'
      });
    };

    window.addEventListener('viban_session_expired', handleSessionExpired);
    return () => window.removeEventListener('viban_session_expired', handleSessionExpired);
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;

    // Định kỳ gửi heartbeat để kiểm tra tài khoản có bị đăng nhập bởi thiết bị khác không
    const checkSession = async () => {
      const token = getSessionToken();
      if (!token) return;
      try {
        await api.validateSession(currentUser.id, token);
      } catch (err) {
        console.warn('Kiểm tra phiên đăng nhập:', err);
      }
    };

    // Kiểm tra ngay lập tức khi vào trang
    checkSession();

    // Heartbeat định kỳ mỗi 6 giây
    const interval = setInterval(checkSession, 6000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const handleOpenAiWrist = () => {
    setAiModalMode('wrist');
    setIsAICameraOpen(true);
  };

  const handleOpenAiMatch = () => {
    setAiModalMode('catalog_match');
    setIsAICameraOpen(true);
  };

  // Data
  const [products, setProducts] = useState([]);
  const [allProductsMaster, setAllProductsMaster] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce search input để trải nghiệm gõ phím mượt mà, không giật lag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products and categories from backend
  const loadShopData = async (forceBypass = false) => {
    setLoading(true);
    try {
      // 1. Luôn tải toàn bộ sản phẩm mới nhất từ cơ sở dữ liệu để làm Master Pool
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({ all: 'true' }, forceBypass),
        api.getCategories(forceBypass)
      ]);

      if (prodRes.success && Array.isArray(prodRes.data)) {
        const freshAll = prodRes.data;
        setAllProductsMaster(freshAll);

        // 2. Lọc sản phẩm theo tab, danh mục, mệnh, tìm kiếm và sắp xếp hiện tại
        let filtered = [...freshAll];

        if (activeTab === 'wishlist') {
          filtered = filtered.filter(p => isWishlisted(p.id));
        } else if (activeTab === 'best-seller') {
          filtered = filtered.filter(p => p.isBestSeller);
        } else if (activeTab !== 'all') {
          filtered = filtered.filter(p => p.category === activeTab);
        }

        if (selectedMenh !== 'all') {
          filtered = filtered.filter(p => p.menh && (p.menh.includes(selectedMenh) || p.menh.includes('Tất cả')));
        }

        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase().trim();
          filtered = filtered.filter(p => 
            (p.name && p.name.toLowerCase().includes(q)) || 
            (p.stoneType && p.stoneType.toLowerCase().includes(q)) ||
            (p.description && p.description.toLowerCase().includes(q))
          );
        }

        if (sortOption === 'price-asc') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price-desc') {
          filtered.sort((a, b) => b.price - a.price);
        } else if (sortOption === 'rating') {
          filtered.sort((a, b) => b.rating - a.rating);
        } else {
          filtered.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0) || (b.reviewsCount || 0) - (a.reviewsCount || 0));
        }

        setProducts(filtered);
      }
      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Lỗi nạp dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lắng nghe sự kiện cập nhật sản phẩm từ trang quản trị để đồng bộ ngay lập tức
  useEffect(() => {
    const handleProductsUpdated = () => {
      loadShopData(true);
    };
    window.addEventListener('viban_products_updated', handleProductsUpdated);
    return () => window.removeEventListener('viban_products_updated', handleProductsUpdated);
  }, [activeTab, selectedMenh, sortOption, debouncedSearch]);

  // Khi thay đổi tab/mệnh/tìm kiếm/sắp xếp, lọc ngay tức thì từ Master Pool hoặc nạp lại
  useEffect(() => {
    if (allProductsMaster.length > 0) {
      let filtered = [...allProductsMaster];
      if (activeTab === 'wishlist') {
        filtered = filtered.filter(p => isWishlisted(p.id));
      } else if (activeTab === 'best-seller') {
        filtered = filtered.filter(p => p.isBestSeller);
      } else if (activeTab !== 'all') {
        filtered = filtered.filter(p => p.category === activeTab);
      }

      if (selectedMenh !== 'all') {
        filtered = filtered.filter(p => p.menh && (p.menh.includes(selectedMenh) || p.menh.includes('Tất cả')));
      }

      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase().trim();
        filtered = filtered.filter(p => 
          (p.name && p.name.toLowerCase().includes(q)) || 
          (p.stoneType && p.stoneType.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }

      if (sortOption === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortOption === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortOption === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else {
        filtered.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0) || (b.reviewsCount || 0) - (a.reviewsCount || 0));
      }

      setProducts(filtered);
    } else {
      loadShopData();
    }
  }, [activeTab, selectedMenh, sortOption, debouncedSearch, allProductsMaster]);

  // Khi danh sách wishlist thay đổi, cập nhật ngay nếu đang xem tab wishlist
  useEffect(() => {
    if (activeTab === 'wishlist' && allProductsMaster.length > 0) {
      setProducts(allProductsMaster.filter(p => isWishlisted(p.id)));
    }
  }, [wishlist, activeTab]);

  // Tự động cuộn xuống phần sản phẩm khi mở tab wishlist
  useEffect(() => {
    if (activeTab === 'wishlist') {
      const el = document.getElementById('products-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [activeTab]);

  const handleProceedToCheckout = (data) => {
    setCheckoutData(data);
    setIsCheckoutOpen(true);
  };

  const handleScrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    setSessionToken('');
    sessionStorage.removeItem('viban_user');
    sessionStorage.removeItem('viban_admin_user');
    sessionStorage.removeItem('viban_customer_user');
    localStorage.removeItem('viban_user');
    setCurrentUser(null);
    setIsAdminView(false);
  };

  const handleApplyCustomPreset = (preset) => {
    setAiCustomPreset(preset);
    setIsAICameraOpen(false);
    setIsCustomizerOpen(true);
  };

  // Chỉ tài khoản có quyền admin mới được mở trang quản trị
  if (isAdminView && currentUser?.role === 'admin') {
    return (
      <>
        <AdminDashboard
          onBackToStore={() => {
            setIsAdminView(false);
            loadShopData(true);
          }}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthOpen(false);
          }}
        />
        <ConcurrentSessionModal
          isOpen={!!sessionConflict?.isOpen}
          message={sessionConflict?.message}
          onClose={() => setSessionConflict(null)}
          onReLogin={() => {
            setSessionConflict(null);
            setIsAuthOpen(true);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col luxury-pastel-bg w-full max-w-full overflow-x-clip pb-16 lg:pb-0">
      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCustomizer={() => {
          setAiCustomPreset(null);
          setIsCustomizerOpen(true);
        }}
        onOpenAICamera={handleOpenAiWrist}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenAdmin={(targetState) => {
          if (targetState === false) {
            setIsAdminView(false);
            loadShopData(true);
          } else {
            if (currentUser?.role === 'admin') {
              setIsAdminView(true);
            } else {
              setIsAuthOpen(true);
            }
          }
        }}
        isAdminView={isAdminView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={handleOpenProfile}
        onLogout={handleLogout}
      />

      {/* Hero Section (only on default view) */}
      {activeTab === 'all' && !searchQuery && (
        <HeroSection
          products={allProductsMaster.length > 0 ? allProductsMaster : products}
          onExplore={handleScrollToProducts}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          onQuickViewFeatured={(prod) => {
            if (prod) setSelectedProduct(prod);
          }}
        />
      )}

      {/* Automated Personalized Recommendation Section */}
      {activeTab === 'all' && !searchQuery && (
        <PersonalizedSection
          products={allProductsMaster.length > 0 ? allProductsMaster : products}
          onQuickView={(p) => setSelectedProduct(p)}
          currentUser={currentUser}
        />
      )}

      {/* Main Products Content */}
      <main id="products-section" className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-16 w-full max-w-full">
        
        {/* Section Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#C59B6D] font-bold">
                {activeTab === 'wishlist' ? 'Bộ Sưu Tập Của Bạn' : activeTab === 'best-seller' ? 'Được Yêu Thích Nhất' : 'Nghệ Thuật Đan Tay'}
              </span>
              <h2 className="font-serif-boutique text-2xl sm:text-4xl font-bold text-[#231F1C]">
                {activeTab === 'wishlist' ? (
                  `Vòng Dây Yêu Thích (${products.length})`
                ) : activeTab === 'best-seller' ? (
                  'Top Vòng Tay Dây Bán Chạy Nhất (Best Sellers)'
                ) : activeTab === 'guong-dinh' ? (
                  '🪞 Gương Đính Gập & Đơn (Boutique Độc Bản)'
                ) : activeTab === 'macrame-pastel' ? (
                  'Vòng Dây Macrame Pastel (Cá Voi, Hoa Cúc & Bướm Tiên)'
                ) : activeTab === 'vong-doi' ? (
                  'Vòng Đôi Dây Sáp Nam Châm Khắc Tên'
                ) : activeTab === 'day-do-may-man' ? (
                  'Vòng Dây Chỉ Đỏ Tây Tạng Hộ Thân Bình An'
                ) : activeTab === 'day-chuyen-vintage' ? (
                  'Dây Chuyền & Choker Boho Vintage'
                ) : activeTab === 'day-lua-co-phong' ? (
                  'Vòng Dây Lụa Cổ Phong & Dây Da Bò Mộc'
                ) : categories.find(c => c.id === activeTab)?.name ? (
                  categories.find(c => c.id === activeTab).name
                ) : (
                  'Các Mẫu Vòng Tay Dây Đan Thủ Công Mới Nhất'
                )}
              </h2>
            </div>

            {/* AI Camera & Customizer Quick Triggers */}
            <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
              <button
                onClick={handleOpenAiWrist}
                className="btn-luxury-cta inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-amber-100" />
                <span>AI Quét Cổ Tay</span>
              </button>

              <button
                onClick={handleOpenAiMatch}
                className="btn-luxury-secondary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-[#C59B6D]" />
                <span className="hidden sm:inline">Tải Ảnh Gợi Ý Hạt & Charm Có Sẵn</span>
                <span className="sm:hidden">Gợi Ý Hạt & Charm</span>
              </button>

              <button
                onClick={() => {
                  setAiCustomPreset(null);
                  setIsCustomizerOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 text-[#C59B6D] border border-white text-xs font-bold hover:bg-[#C59B6D] hover:text-white transition-all shadow-xs cursor-pointer"
              >
                <Flower2 className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Tự phối vòng thủ công</span>
                <span className="sm:hidden">Tự phối vòng</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {activeTab !== 'wishlist' && (
          <ProductFilter
            categories={categories}
            selectedCategory={activeTab}
            onSelectCategory={setActiveTab}
            selectedMenh={selectedMenh}
            onSelectMenh={setSelectedMenh}
            sortOption={sortOption}
            onSortChange={setSortOption}
            totalResults={products.length}
          />
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#B86244] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-[#6B6258] font-medium">Đang tải bộ sưu tập vòng tay thủ công...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#E8DFD3] p-8 space-y-3">
            {activeTab === 'wishlist' ? (
              <>
                <div className="w-14 h-14 rounded-full bg-[#FAF4ED] text-[#B86244] flex items-center justify-center mx-auto mb-2 border border-[#EADBCC]">
                  <Heart className="w-7 h-7 stroke-[1.5]" />
                </div>
                <p className="font-serif-boutique text-2xl font-bold text-[#26211C]">
                  Bộ sưu tập yêu thích của bạn đang trống
                </p>
                <p className="text-xs text-[#6B6258] max-w-sm mx-auto leading-relaxed">
                  Bạn chưa lưu mẫu vòng tay nào. Hãy nhấn vào biểu tượng trái tim ❤️ ở góc bất kỳ mẫu vòng tay nào trên trang chủ để lưu vào đây nhé!
                </p>
                <button
                  onClick={() => { setActiveTab('all'); setSelectedMenh('all'); setSearchQuery(''); }}
                  className="mt-3 px-6 py-2.5 rounded-full bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold transition-all shadow-sm"
                >
                  Khám Phá Các Mẫu Vòng Tay
                </button>
              </>
            ) : (
              <>
                <p className="font-serif-boutique text-xl font-bold text-[#26211C]">
                  Không tìm thấy sản phẩm nào
                </p>
                <p className="text-xs text-[#6B6258] max-w-sm mx-auto">
                  Không có mẫu vòng tay nào phù hợp với bộ lọc hiện tại. Bạn có thể chọn lại mệnh hoặc mở xưởng tự phối vòng theo ý thích.
                </p>
                <button
                  onClick={() => { setActiveTab('all'); setSelectedMenh('all'); setSearchQuery(''); }}
                  className="mt-2 px-5 py-2 rounded-xl bg-[#26211C] text-white text-xs font-semibold"
                >
                  Xem Tất Cả Vòng Tay
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setSelectedProduct}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        onOpenCustomizer={() => {
          setAiCustomPreset(null);
          setIsCustomizerOpen(true);
        }}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
      />

      {/* Shopee-style Mobile Bottom Navigation Bar */}
      <MobileBottomBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCustomizer={() => {
          setAiCustomPreset(null);
          setIsCustomizerOpen(true);
        }}
        onOpenAICamera={handleOpenAiWrist}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={handleOpenProfile}
        isAdminView={isAdminView}
        onOpenAdmin={setIsAdminView}
        onScrollToProducts={handleScrollToProducts}
      />

      {/* Modals & Drawers */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenSizeGuide={() => {
          setSelectedProduct(null);
          setIsSizeGuideOpen(true);
        }}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <BraceletStudio
        isOpen={isCustomizerOpen}
        onClose={() => {
          setIsCustomizerOpen(false);
          setAiCustomPreset(null);
        }}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenAiVision={handleOpenAiMatch}
        initialPreset={aiCustomPreset}
      />

      <WristSizeModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        currentUser={currentUser}
      />

      <CartDrawer
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Slide-out Wishlist Drawer */}
      <WishlistDrawer
        products={allProductsMaster.length > 0 ? allProductsMaster : products}
        onOpenProduct={(prod) => setSelectedProduct(prod)}
        onSelectWishlistTab={() => {
          setActiveTab('wishlist');
          handleScrollToProducts();
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        checkoutData={checkoutData}
        currentUser={currentUser}
        onOrderSuccess={(order) => {
          // Success handled in modal
        }}
      />

      {/* NEW: AI Camera Stylist Modal */}
      <AICameraModal
        isOpen={isAICameraOpen}
        onClose={() => setIsAICameraOpen(false)}
        onApplyCustomPreset={handleApplyCustomPreset}
        initialMode={aiModalMode}
      />

      {/* NEW: Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
          if (user.role === 'admin') {
            setIsAdminView(true);
          }
        }}
      />

      {/* NEW: User Profile & Order History Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
        defaultTab={profileDefaultTab}
        products={allProductsMaster.length > 0 ? allProductsMaster : products}
        onOpenProduct={(prod) => {
          setIsProfileOpen(false);
          setSelectedProduct(prod);
        }}
        onLogout={handleLogout}
        onSelectOrderForTracking={(orderId) => {
          setIsProfileOpen(false);
          setIsTrackingOpen(true);
        }}
      />

      {/* Cross-Device Single Session Notification Modal */}
      <ConcurrentSessionModal
        isOpen={!!sessionConflict?.isOpen}
        message={sessionConflict?.message}
        onClose={() => setSessionConflict(null)}
        onReLogin={() => {
          setSessionConflict(null);
          setIsAuthOpen(true);
        }}
      />

    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      // 1. Kiểm tra session riêng của tab hiện tại (mỗi tab/cửa sổ là một luồng độc lập)
      const sessionSaved = sessionStorage.getItem('viban_user');
      if (sessionSaved) return JSON.parse(sessionSaved);
      // Khi mở link mới trong tab mới, bắt đầu là khách, KHÔNG tự động ép đăng nhập
      return null;
    } catch {
      return null;
    }
  });

  const handleUpdateUser = (user) => {
    setCurrentUser(user);
    if (user) {
      sessionStorage.setItem('viban_user', JSON.stringify(user));
      if (user.role === 'admin') {
        sessionStorage.setItem('viban_admin_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('viban_customer_user', JSON.stringify(user));
      }
    } else {
      setSessionToken('');
      sessionStorage.removeItem('viban_user');
      sessionStorage.removeItem('viban_admin_user');
      sessionStorage.removeItem('viban_customer_user');
      localStorage.removeItem('viban_user');
    }
  };

  return (
    <CartProvider currentUser={currentUser}>
      <MainShop currentUser={currentUser} setCurrentUser={handleUpdateUser} />
    </CartProvider>
  );
}
