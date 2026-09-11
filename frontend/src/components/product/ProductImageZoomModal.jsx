import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Sparkles,
  Move
} from 'lucide-react';

export default function ProductImageZoomModal({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onSelectIndex,
  productName = 'Sản phẩm thủ công Nhà Zy'
}) {
  if (!isOpen || images.length === 0) return null;

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState(null);
  const containerRef = useRef(null);

  // Reset zoom when switching images
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (scale > 1) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, scale, onClose]);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (images.length <= 1) return;
    const prevIdx = (currentIndex - 1 + images.length) % images.length;
    onSelectIndex(prevIdx);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (images.length <= 1) return;
    const nextIdx = (currentIndex + 1) % images.length;
    onSelectIndex(nextIdx);
  };

  const handleZoomIn = (e) => {
    if (e) e.stopPropagation();
    setScale(prev => Math.min(3.5, Number((prev + 0.5).toFixed(1))));
  };

  const handleZoomOut = (e) => {
    if (e) e.stopPropagation();
    setScale(prev => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(1)));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = (e) => {
    if (e) e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Double click to toggle zoom (1x <-> 2x)
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
      // Center zoom towards click position if possible
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetX = (e.clientX - rect.left) - rect.width / 2;
      const offsetY = (e.clientY - rect.top) - rect.height / 2;
      setPosition({ x: -offsetX * 0.8, y: -offsetY * 0.8 });
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setScale(prev => {
      const newScale = Math.min(3.5, Math.max(1, prev + delta));
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
        return 1;
      }
      return Number(newScale.toFixed(2));
    });
  };

  // Mouse Drag to Pan when zoomed in
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile swipe & double tap
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      });
      if (scale > 1) {
        setIsDragging(true);
        setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
      }
    }
  };

  const handleTouchMove = (e) => {
    if (scale > 1 && isDragging && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0];
    const diffX = touchEnd.clientX - touchStart.x;
    const diffY = touchEnd.clientY - touchStart.y;
    const duration = Date.now() - touchStart.time;

    // Detect double tap
    if (Math.abs(diffX) < 15 && Math.abs(diffY) < 15 && duration < 250) {
      if (scale > 1) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      } else {
        setScale(2);
      }
      setTouchStart(null);
      return;
    }

    // Swipe left / right when at normal 1x scale
    if (scale === 1 && Math.abs(diffX) > 50 && Math.abs(diffY) < 60) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStart(null);
  };

  const currentImg = images[currentIndex] || images[0];

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none animate-fadeIn overflow-hidden"
      onClick={onClose}
    >
      {/* 1. TOP HEADER BAR */}
      <div 
        className="p-3 sm:p-4 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-4 z-20 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Product Name & Counter */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#B86244] flex items-center justify-center font-bold text-white shadow-md shrink-0">
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md font-serif-boutique">
              {productName}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-stone-400">
              <span>Góc chụp: <strong className="text-amber-300 font-mono">{currentIndex + 1} / {images.length}</strong></span>
              <span>•</span>
              <span className="hidden sm:inline">Phóng to chuẩn Shopee</span>
            </div>
          </div>
        </div>

        {/* Center: Zoom Control Toolbar */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/15">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Thu nhỏ (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="px-2 text-xs font-mono font-bold text-amber-300 min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 3.5}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Phóng to (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {scale > 1 && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 transition-all cursor-pointer ml-1"
              title="Đặt lại kích thước ban đầu (0)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Close Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 border border-white/20 cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">Đóng</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN VIEWING STAGE */}
      <div 
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-6"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          // If user clicks on the backdrop (not image), close zoom
          if (e.target === containerRef.current) onClose();
        }}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 shadow-2xl cursor-pointer active:scale-95"
            title="Ảnh trước (Phím ◄)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 shadow-2xl cursor-pointer active:scale-95"
            title="Ảnh sau (Phím ►)"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Enlargeable Image */}
        <div 
          className="relative max-w-full max-h-full flex items-center justify-center"
          style={{
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
          }}
          onDoubleClick={handleDoubleClick}
        >
          <img
            src={currentImg}
            alt={productName}
            draggable={false}
            className="max-h-[72vh] sm:max-h-[78vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 select-none"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              transformOrigin: 'center center'
            }}
          />

          {/* Drag hint when zoomed */}
          {scale > 1 && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-amber-200 text-[10px] px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1 pointer-events-none backdrop-blur-xs">
              <Move className="w-3 h-3" />
              <span>Kéo rê chuột hoặc ngón tay để xem chi tiết từng góc</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM SHOPEE-STYLE THUMBNAIL BAR & HINT */}
      <div 
        className="p-3 sm:p-4 bg-black/60 backdrop-blur-md border-t border-white/10 z-20 flex flex-col items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thumbnails row */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2 scrollbar-none">
            {images.map((img, idx) => {
              const isSelected = currentIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectIndex(idx)}
                  className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    isSelected 
                      ? 'border-[#B86244] ring-2 ring-[#B86244] scale-110 shadow-lg' 
                      : 'border-white/30 opacity-60 hover:opacity-100 hover:border-white/70'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${idx + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/10 flex items-end justify-center pb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Helpful instructions hint */}
        <p className="text-[10px] sm:text-xs text-stone-400 text-center flex items-center gap-1.5 flex-wrap justify-center">
          <span>💡</span>
          <span>Nhấn đúp hoặc lăn chuột để phóng to cận cảnh charm & đường đan. Dùng phím mũi tên ◄ ► để chuyển ảnh.</span>
        </p>
      </div>
    </div>
  );
}
