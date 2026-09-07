import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const getWishlistKey = (user) => {
  if (user?.id) return `khanhvy_wishlist_user_${user.id}`;
  if (user?.email) return `khanhvy_wishlist_user_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
  return 'khanhvy_wishlist_guest';
};

export const CartProvider = ({ children, currentUser }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('viban_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const key = getWishlistKey(currentUser);
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      // Nếu chưa có, kiểm tra dữ liệu cũ
      const oldSaved = localStorage.getItem('viban_wishlist');
      return oldSaved ? JSON.parse(oldSaved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Tự động tải lại danh sách yêu thích riêng khi người dùng đăng nhập, đăng xuất hoặc đổi tài khoản
  useEffect(() => {
    const key = getWishlistKey(currentUser);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setWishlist(JSON.parse(saved));
      } else {
        // Tài khoản mới chưa có danh sách yêu thích
        setWishlist([]);
      }
    } catch {
      setWishlist([]);
    }
  }, [currentUser?.id, currentUser?.email]);

  useEffect(() => {
    try {
      localStorage.setItem('viban_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Lưu danh sách yêu thích vào đúng bộ nhớ của tài khoản đang đăng nhập
  useEffect(() => {
    const key = getWishlistKey(currentUser);
    try {
      localStorage.setItem(key, JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist, currentUser?.id, currentUser?.email]);

  const addToCart = (product, quantity = 1, options = {}) => {
    setCartItems(prev => {
      // If it's a custom bracelet, treat each uniquely
      if (options.isCustom) {
        return [...prev, {
          ...product,
          quantity,
          isCustom: true,
          customDetails: options.customDetails,
          wristSize: options.wristSize || '15 - 16 cm',
          note: options.note || '',
          cartKey: `custom-${Date.now()}`
        }];
      }

      // If standard product, check if same id and wristSize exists
      const existingIndex = prev.findIndex(item => 
        !item.isCustom && 
        item.id === product.id && 
        item.wristSize === (options.wristSize || '15 - 16 cm')
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [...prev, {
        ...product,
        quantity,
        isCustom: false,
        wristSize: options.wristSize || '15 - 16 cm',
        note: options.note || '',
        cartKey: `${product.id}-${options.wristSize || 'default'}-${Date.now()}`
      }];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartKey) => {
    setCartItems(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.cartKey === cartKey ? { ...item, quantity: newQty } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Compute wholesale-adjusted cart items
  const processedCartItems = cartItems.map(item => {
    const isWholesale = item.quantity >= (item.wholesaleMinQty || 5) || totalCount >= 10;
    const effectivePrice = isWholesale ? (item.wholesalePrice || Math.round(item.price * 0.7)) : item.price;
    return {
      ...item,
      isWholesale,
      effectivePrice,
      itemTotal: effectivePrice * item.quantity,
      savings: (item.price - effectivePrice) * item.quantity
    };
  });

  const retailSubtotal = processedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = processedCartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const wholesaleSavings = retailSubtotal - subtotal;
  const hasWholesaleDiscount = wholesaleSavings > 0;

  return (
    <CartContext.Provider value={{
      cartItems: processedCartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      totalCount,
      subtotal,
      retailSubtotal,
      wholesaleSavings,
      hasWholesaleDiscount,
      wishlist,
      toggleWishlist
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
