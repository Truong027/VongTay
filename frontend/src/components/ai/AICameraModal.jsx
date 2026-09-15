import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  Camera, 
  Sparkles, 
  RefreshCw, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Zap, 
  Flower2,
  Palette,
  Layers,
  Sparkle,
  Image as ImageIcon,
  Check,
  Compass,
  ShoppingBag,
  Sliders,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Lock,
  Unlock
} from 'lucide-react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

function darkenColor(hex, factor = 0.4) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return '#261208';
  let c = hex.slice(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return '#261208';
  const r = Math.max(0, Math.floor(((num >> 16) & 255) * (1 - factor)));
  const g = Math.max(0, Math.floor(((num >> 8) & 255) * (1 - factor)));
  const b = Math.max(0, Math.floor((num & 255) * (1 - factor)));
  return `rgb(${r}, ${g}, ${b})`;
}

function renderArCharmSvg(charm, scaleFactor = 0.75) {
  if (!charm) return null;
  const charmId = charm.id || '';
  const sf = Math.max(0.45, Math.min(1.0, scaleFactor));

  if (charmId === 'charm-whale-blue') {
    const s = 0.70 * sf;
    return (
      <g transform={`translate(0, ${10 * sf}) scale(${s})`}>
        <defs>
          <radialGradient id="arWhaleGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#C6EEFD" />
            <stop offset="55%" stopColor="#5AB8D8" />
            <stop offset="100%" stopColor="#257596" />
          </radialGradient>
        </defs>
        <path
          d="M -13 -2 C -11 -11 8 -11 13 -3 C 17 1 19 6 21 2 C 22 -1 23 7 19 8 C 13 10 0 11 -9 6 C -13 3 -15 1 -13 -2 Z"
          fill="url(#arWhaleGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.9"
          filter="url(#beadDropShadow)"
        />
        <circle cx="-6" cy="-2" r="1.6" fill="#1C2D37" />
        <circle cx="-6.8" cy="-2.7" r="0.6" fill="#FFFFFF" />
        <path d="M -3 2 C -2 4 1 4 2 2" stroke="#257596" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <ellipse cx="2" cy="5" rx="3.5" ry="1.8" fill="#FFFFFF" opacity="0.4" />
      </g>
    );
  }

  if (charmId === 'charm-mint-flower' || charmId === 'charm-lotus') {
    const fc = charmId === 'charm-lotus' ? '#A8D8B0' : '#A3E4D7';
    const s = 0.75 * sf;
    return (
      <g transform={`translate(0, ${10 * sf}) scale(${s})`}>
        <circle cx="-8" cy="-5" r="6" fill={fc} opacity="0.92" filter="url(#beadDropShadow)" />
        <circle cx="8" cy="-5" r="6" fill={fc} opacity="0.92" filter="url(#beadDropShadow)" />
        <circle cx="-5" cy="7" r="6" fill={fc} opacity="0.92" filter="url(#beadDropShadow)" />
        <circle cx="5" cy="7" r="6" fill={fc} opacity="0.92" filter="url(#beadDropShadow)" />
        <circle cx="0" cy="-9" r="6" fill={fc} opacity="0.92" filter="url(#beadDropShadow)" />
        <circle cx="0" cy="0" r="5" fill="#F9E076" stroke="#E6C229" strokeWidth="0.8" />
        <circle cx="-1" cy="-1" r="1.6" fill="#FFF8D0" opacity="0.8" />
      </g>
    );
  }

  if (charmId === 'charm-flower-kv') {
    const s = 0.75 * sf;
    return (
      <g transform={`translate(0, ${10 * sf}) scale(${s})`}>
        <circle cx="-8" cy="-5" r="6" fill="#F9D5E5" opacity="0.92" filter="url(#beadDropShadow)" />
        <circle cx="8" cy="-5" r="6" fill="#F9D5E5" opacity="0.92" filter="url(#beadDropShadow)" />
        <circle cx="-5" cy="7" r="6" fill="#FADDE8" opacity="0.92" filter="url(#beadDropShadow)" />
        <circle cx="5" cy="7" r="6" fill="#FADDE8" opacity="0.92" filter="url(#beadDropShadow)" />
        <circle cx="0" cy="-9" r="6" fill="#F9D5E5" opacity="0.92" filter="url(#beadDropShadow)" />
        <circle cx="0" cy="0" r="5" fill="#FFE566" stroke="#F0CC22" strokeWidth="0.8" />
        <circle cx="-1" cy="-1" r="1.8" fill="#FFF8CC" opacity="0.85" />
      </g>
    );
  }

  if (charmId === 'charm-butterfly-hologram') {
    const s = 0.72 * sf;
    return (
      <g transform={`translate(0, ${10 * sf}) scale(${s})`}>
        <path d="M 0 0 C -8 -15 -18 -11 -15 0 C -14 8 -3 8 0 2 Z" fill="#D4B4F0" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.92" filter="url(#beadDropShadow)" />
        <path d="M 0 0 C 8 -15 18 -11 15 0 C 14 8 3 8 0 2 Z" fill="#D4B4F0" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.92" filter="url(#beadDropShadow)" />
        <path d="M 0 2 C -5 6 -10 13 -3 13 C 0 13 0 6 0 2 Z" fill="#C8F0D8" stroke="#FFFFFF" strokeWidth="0.7" opacity="0.85" />
        <path d="M 0 2 C 5 6 10 13 3 13 C 0 13 0 6 0 2 Z" fill="#C8F0D8" stroke="#FFFFFF" strokeWidth="0.7" opacity="0.85" />
        <line x1="0" y1="-8" x2="0" y2="9" stroke="#8A7BAA" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    );
  }

  if (charmId === 'charm-clover') {
    const s = 0.75 * sf;
    return (
      <g transform={`translate(0, ${10 * sf}) scale(${s})`}>
        <circle cx="-5" cy="-5" r="5.5" fill="#7DD87A" filter="url(#beadDropShadow)" />
        <circle cx="5" cy="-5" r="5.5" fill="#7DD87A" filter="url(#beadDropShadow)" />
        <circle cx="-5" cy="5" r="5.5" fill="#7DD87A" filter="url(#beadDropShadow)" />
        <circle cx="5" cy="5" r="5.5" fill="#7DD87A" filter="url(#beadDropShadow)" />
        <line x1="0" y1="1" x2="0" y2="12" stroke="#4AA745" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    );
  }

  if (charmId === 'charm-moon-star') {
    const s = 0.75 * sf;
    return (
      <g transform={`translate(0, ${10 * sf}) scale(${s})`}>
        <path d="M 0 -10 C -3 -8 -3 -3 0 0 C 5 0 9 -4 9 -8 C 7 -11 3 -13 0 -10 Z" fill="#D4D8F0" stroke="#C8CCE8" strokeWidth="0.8" filter="url(#beadDropShadow)" />
        <polygon points="11,-6 12.5,-2 16.5,-2 13.5,0.5 14.5,4.5 11,2.5 7.5,4.5 8.5,0.5 5.5,-2 9.5,-2" fill="#F9E876" stroke="#DDCC00" strokeWidth="0.5" />
      </g>
    );
  }

  if (charmId === 'charm-pixiu') {
    const s = 0.75 * sf;
    return (
      <g transform={`translate(0, ${10 * sf}) scale(${s})`}>
        <ellipse cx="0" cy="4" rx="10" ry="7" fill="#D4B060" stroke="#9E7624" strokeWidth="0.8" filter="url(#beadDropShadow)" />
        <circle cx="-5" cy="-4" r="4" fill="#E8C776" stroke="#9E7624" strokeWidth="0.7" />
        <circle cx="5" cy="-4" r="4" fill="#E8C776" stroke="#9E7624" strokeWidth="0.7" />
        <circle cx="-5" cy="-4" r="1.3" fill="#3A2200" />
        <circle cx="5" cy="-4" r="1.3" fill="#3A2200" />
      </g>
    );
  }

  if (charmId === 'charm-magnet-heart') {
    return (
      <g transform="translate(0, 14) scale(1.1)">
        <path d="M 0 5 C -10 -1 -14 -7 -10 -12 C -6 -16 0 -13 0 -8 C 0 -13 6 -16 10 -12 C 14 -7 10 -1 0 5 Z" fill="#E85480" stroke="#C02060" strokeWidth="0.8" filter="url(#beadDropShadow)" />
      </g>
    );
  }

  if (charmId === 'charm-bell' || charmId === 'charm-bell-holiday') {
    return (
      <g transform="translate(0, 14) scale(1.1)">
        <path d="M 0 -10 C -7 -10 -10 -3 -10 4 L 10 4 C 10 -3 7 -10 0 -10 Z" fill="#F2D06B" stroke="#B8860B" strokeWidth="0.8" filter="url(#beadDropShadow)" />
        <rect x="-10" y="4" width="20" height="2.5" rx="1.2" fill="#B8860B" />
        <circle cx="0" cy="9" r="2.2" fill="#B8860B" />
      </g>
    );
  }

  if (charm.image) {
    return (
      <g transform="translate(0, 14) scale(1.15)">
        <circle cx="0" cy="0" r="12" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="1.5" filter="url(#beadDropShadow)" />
        <clipPath id="ar-charm-img-clip">
          <circle cx="0" cy="0" r="10.5" />
        </clipPath>
        <image
          href={charm.image}
          x="-10.5"
          y="-10.5"
          width="21"
          height="21"
          clipPath="url(#ar-charm-img-clip)"
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
    );
  }

  // Fallback: Elegant silver medallion with 925 engraving
  return (
    <g transform="translate(0, 14) scale(1.15)">
      <circle cx="0" cy="0" r="11" fill="#FFFDF8" stroke="#D4AF37" strokeWidth="1.4" filter="url(#beadDropShadow)" />
      <circle cx="0" cy="0" r="8.5" fill="#F4EDE4" stroke="#D4AF37" strokeWidth="0.6" strokeDasharray="2 1.5" />
      <text x="0" y="3" textAnchor="middle" fill="#8C6828" fontSize="6.5" fontWeight="bold">925</text>
    </g>
  );
}

const AR_BRACELETS = [
  {
    id: 'ar-sakura-pearl',
    name: 'Hoa Hồng Pha Lê & Ngọc Trai (Ảnh Mẫu)',
    price: 195000,
    beadColor: '#FDE2E4',
    cordColor: '#FFF8F0',
    charmName: 'Hoa Anh Đào 5 Cánh',
    menh: 'Kim, Thủy, Hỏa',
    isFloralModel: true,
    floralBeads: [
      { type: 'pearl', color: '#FFFDF9', name: 'Ngọc trai trắng' },
      { type: 'flower', color: '#F8B4C4', name: 'Hoa hồng 5 cánh' },
      { type: 'crystal', color: '#F0E6F6', name: 'Pha lê trong suốt' },
      { type: 'pearl', color: '#FFFDF9', name: 'Ngọc trai trắng' },
      { type: 'strawberry', color: '#F7C6D0', name: 'Thạch anh dâu' },
      { type: 'pearl', color: '#FFFDF9', name: 'Ngọc trai trắng' },
      { type: 'crystal', color: '#F0E6F6', name: 'Pha lê trong suốt' },
      { type: 'pearl', color: '#FFFDF9', name: 'Ngọc trai trắng' },
      { type: 'gold_spacer', color: '#F2D06B', name: 'Khoen vàng 18K' },
      { type: 'strawberry', color: '#F7C6D0', name: 'Thạch anh dâu' },
      { type: 'pearl', color: '#FFFDF9', name: 'Ngọc trai trắng' },
      { type: 'crystal', color: '#F0E6F6', name: 'Pha lê trong suốt' }
    ]
  },
  {
    id: 'ar-strawberry',
    name: 'Vòng Thạch Anh Dâu Hồng Pastel',
    price: 185000,
    beadColor: '#F7C6D0',
    cordColor: '#D9829B',
    charmName: 'Hoa Sen Bạc 925',
    menh: 'Hỏa, Thổ'
  },
  {
    id: 'ar-rutile-gold',
    name: 'Vòng Thạch Anh Tóc Vàng Tài Lộc',
    price: 245000,
    beadColor: '#E6C265',
    cordColor: '#8C6828',
    charmName: 'Đồng Xu Chiêu Tài',
    menh: 'Kim, Thổ'
  },
  {
    id: 'ar-jade-green',
    name: 'Vòng Ngọc Bích Sơn Thủy Bình An',
    price: 215000,
    beadColor: '#78A885',
    cordColor: '#3A5C45',
    charmName: 'Cỏ 4 Lá May Mắn',
    menh: 'Mộc, Hỏa'
  },
  {
    id: 'ar-red-cord',
    name: 'Vòng Chỉ Đỏ Ngũ Sắc May Mắn',
    price: 98000,
    beadColor: '#C43D3D',
    cordColor: '#9E1B1B',
    charmName: 'Chuông Bạc Bình An',
    menh: 'Hỏa, Thổ, Tất cả'
  },
  {
    id: 'ar-tiger-eye',
    name: 'Vòng Mắt Hổ Nâu Vàng Hộ Thân',
    price: 165000,
    beadColor: '#9C6838',
    cordColor: '#5C3818',
    charmName: 'Tỳ Hưu Bạc 925',
    menh: 'Thổ, Kim'
  }
];

// Hàm trích xuất chu vi cổ tay (cm) chuẩn xác từ chuỗi size (ví dụ "14 - 15 cm" -> 14.5)
export const parseWristSizeCm = (wristSizeStr) => {
  if (!wristSizeStr) return 15.5;
  const numbers = String(wristSizeStr).match(/\d+(\.\d+)?/g);
  if (!numbers || numbers.length === 0) return 15.5;
  if (numbers.length === 1) return parseFloat(numbers[0]);
  return (parseFloat(numbers[0]) + parseFloat(numbers[1])) / 2;
};

export default function AICameraModal({ isOpen, onClose, onApplyCustomPreset, initialMode = 'wrist', customBracelet = null }) {
  if (!isOpen) return null;

  const { addToCart } = useCart();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const trackingCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const nativeCameraWristRef = useRef(null);
  const matchFileInputRef = useRef(null);
  const nativeCameraMatchRef = useRef(null);

  // Active Tab / Mode: 'wrist' | 'catalog_match' | 'ar_tryon'
  const [modalMode, setModalMode] = useState(initialMode || 'wrist');

  // Camera & Image state
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (sau) | 'user' (trước)

  // Mode 1: Wrist Analysis State
  const [birthYear, setBirthYear] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [isAnalyzingWrist, setIsAnalyzingWrist] = useState(false);
  const [wristResult, setWristResult] = useState(null);
  const [wristError, setWristError] = useState('');

  // Mode 2: Catalog Bead & Charm Match State
  const [matchImage, setMatchImage] = useState(null);
  const [matchNotes, setMatchNotes] = useState('');
  const [isMatchingBeads, setIsMatchingBeads] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [matchError, setMatchError] = useState('');

  // Available Bracelets (combines custom user design + boutique presets)
  const availableBracelets = useMemo(() => {
    if (!customBracelet) return AR_BRACELETS;
    return [
      {
        id: customBracelet.id || 'custom-designed',
        isCustom: true,
        name: customBracelet.name || 'Vòng Tự Phối (Xưởng 3D)',
        price: customBracelet.price || 145000,
        beadColor: customBracelet.beadColor || '#EAA9A9',
        cordColor: customBracelet.cordColor || '#F7F3EB',
        cordName: customBracelet.cordName || 'Dây thủ công',
        charmName: customBracelet.charmName || customBracelet.selectedCharm?.name || 'Charm Tự Chọn',
        menh: 'Thiết kế riêng',
        beadPositions: customBracelet.beadPositions || [],
        selectedCharm: customBracelet.selectedCharm || null,
        wristSize: customBracelet.wristSize || '15 - 16 cm'
      },
      ...AR_BRACELETS
    ];
  }, [customBracelet]);

  // Mode 3: AR Try-On State (Tự động khởi tạo theo size mà khách đã chọn trong Tự Phối)
  const initialWristCm = useMemo(() => {
    return customBracelet ? parseWristSizeCm(customBracelet.wristSize) : 15.5;
  }, [customBracelet]);

  const [arSelectedBracelet, setArSelectedBracelet] = useState(0);
  const [arSizeCm, setArSizeCm] = useState(initialWristCm);
  const [userCustomSize, setUserCustomSize] = useState(initialWristCm);
  const [arAngle, setArAngle] = useState(0);
  const [arOffsetX, setArOffsetX] = useState(0);
  const [arOffsetY, setArOffsetY] = useState(0);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startOffX: 0, startOffY: 0 });
  const [arCapturedSnapshot, setArCapturedSnapshot] = useState(null);
  const [arAddedSuccess, setArAddedSuccess] = useState(false);

  // iPhone Camera UI Specific States
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);

  // Auto AI YOLO / Vision Wrist Tracking State
  const [isAutoTracking, setIsAutoTracking] = useState(true);
  const [isWristLocked, setIsWristLocked] = useState(false); // Trạng thái Gắn Cứng Cổ Tay 100%
  const [trackingConfidence, setTrackingConfidence] = useState(0);
  const [trackingFeedback, setTrackingFeedback] = useState('Đang tìm cổ tay...');
  const [detectedWrist, setDetectedWrist] = useState(null);
  const lockStreakRef = useRef(0);

  // Smooth Snap-On Wear Animation State (Mở ra từ mu bàn tay -> Trượt xuống cổ tay -> Co ôm khít)
  const [isWearingAnim, setIsWearingAnim] = useState(true);
  const [wearAnimKey, setWearAnimKey] = useState(0);
  const prevConfRef = useRef(0);

  const triggerWearAnimation = () => {
    setWearAnimKey(prev => prev + 1);
    setIsWearingAnim(true);
    setTimeout(() => {
      setIsWearingAnim(false);
    }, 1150);
  };

  // Hàm chụp ảnh Shutter phong cách iPhone Camera
  const handleShutterClick = async () => {
    // 1. Hiệu ứng chớp sáng màn hình như iOS Camera
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 220);

    // Nếu ở chế độ 1 (Quét cổ tay đo size) thì chụp ảnh để AI Gemini Vision phân tích
    if (modalMode === 'wrist') {
      await handleCaptureWrist();
      return;
    }

    // Nếu ở chế độ 3 (Ướm vòng 3D AR) thì chụp ảnh lồng ghép vòng tay 3D vào cổ tay người dùng
    if (!videoRef.current) return;
    const video = videoRef.current;
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = vw;
    snapCanvas.height = vh;
    const ctx = snapCanvas.getContext('2d');

    // Vẽ luồng video (lật gương nếu dùng camera trước)
    if (facingMode === 'user') {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, vw, vh);
    if (facingMode === 'user') {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Ghép lớp vòng tay 3D SVG lên ảnh chụp
    const svgEl = document.getElementById('ar-bracelet-svg');
    if (svgEl) {
      try {
        const svgXml = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
        const DOMURL = window.URL || window.webkitURL || window;
        const url = DOMURL.createObjectURL(svgBlob);
        const svgImg = new Image();
        svgImg.onload = () => {
          ctx.drawImage(svgImg, 0, 0, vw, vh);
          DOMURL.revokeObjectURL(url);
          const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.92);
          setArCapturedSnapshot(dataUrl);
          setSnapshotModalOpen(true);
        };
        svgImg.onerror = () => {
          const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.92);
          setArCapturedSnapshot(dataUrl);
          setSnapshotModalOpen(true);
        };
        svgImg.src = url;
      } catch {
        const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.92);
        setArCapturedSnapshot(dataUrl);
        setSnapshotModalOpen(true);
      }
    } else {
      const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.92);
      setArCapturedSnapshot(dataUrl);
      setSnapshotModalOpen(true);
    }
  };

  const handlePointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    setIsDraggingOverlay(true);
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      startOffX: arOffsetX,
      startOffY: arOffsetY
    };
    setIsAutoTracking(false);
    setTrackingFeedback('Đang chỉnh vị trí bằng tay (Chạm kéo để đặt vào cổ tay)...');
  };

  const handlePointerMove = (e) => {
    if (!isDraggingOverlay) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    setArOffsetX(Math.max(-130, Math.min(130, Math.round(dragStartRef.current.startOffX + dx * 0.75))));
    setArOffsetY(Math.max(-130, Math.min(130, Math.round(dragStartRef.current.startOffY + dy * 0.75))));
  };

  const handlePointerUp = () => {
    if (isDraggingOverlay) {
      setIsDraggingOverlay(false);
    }
  };

  // Đồng bộ chuẩn xác khi mẫu tự phối customBracelet được truyền vào
  useEffect(() => {
    if (customBracelet) {
      const parsedCm = parseWristSizeCm(customBracelet.wristSize);
      setArSizeCm(parsedCm);
      setUserCustomSize(parsedCm);
      setArSelectedBracelet(0);
      setArOffsetX(0);
      setArOffsetY(0);
      setArAngle(0);
      triggerWearAnimation();
    }
  }, [customBracelet]);

  // Real-time AI Wrist Tracking Loop (Computer Vision Skin & Arm Linear Contour Analysis)
  useEffect(() => {
    if (!cameraActive || modalMode !== 'ar_tryon') return;

    let animId = null;
    let lastProcess = 0;

    const processFrame = (time) => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animId = requestAnimationFrame(processFrame);
        return;
      }

      if (time - lastProcess > 85) { // ~12 FPS
        lastProcess = time;
        try {
          const video = videoRef.current;
          if (!trackingCanvasRef.current) {
            trackingCanvasRef.current = document.createElement('canvas');
            trackingCanvasRef.current.width = 120;
            trackingCanvasRef.current.height = 90;
          }
          const tCanvas = trackingCanvasRef.current;
          const tCtx = tCanvas.getContext('2d', { willReadFrequently: true });

          // Cắt video đúng tỷ lệ hiển thị object-cover tương ứng viewport container 4:3
          const vw = video.videoWidth || 640;
          const vh = video.videoHeight || 480;
          const containerAspect = 4 / 3;
          const videoAspect = vw / vh;
          let sx = 0, sy = 0, sWidth = vw, sHeight = vh;
          if (videoAspect > containerAspect) {
            sWidth = vh * containerAspect;
            sx = (vw - sWidth) / 2;
          } else {
            sHeight = vw / containerAspect;
            sy = (vh - sHeight) / 2;
          }

          tCtx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, 120, 90);
          const imgData = tCtx.getImageData(0, 0, 120, 90);
          const data = imgData.data;

          const rowStats = [];
          let totalSkinCount = 0;

          for (let y = 10; y < 85; y += 2) {
            let minX = 120, maxX = 0, count = 0;
            let sumX = 0;
            for (let x = 6; x < 114; x += 2) {
              const idx = (y * 120 + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              // Nhận diện sắc tố da người Việt Nam
              const isSkin = (r > 65 && g > 42 && b > 25 && r > g && r > b && (r - g) > 8 && (r - b) > 10 && Math.abs(r - g) < 115);
              if (isSkin) {
                count++;
                sumX += x;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
              }
            }
            if (count >= 5 && (maxX - minX) >= 12) {
              totalSkinCount += count;
              rowStats.push({ y, count, minX, maxX, width: maxX - minX, centerX: sumX / count });
            }
          }

          if (rowStats.length >= 6) {
            // Lấy lát cắt cẳng tay ở khoảng giữa
            const bestIdx = Math.floor(rowStats.length * 0.52);
            const wristRow = rowStats[bestIdx] || rowStats[0];
            const normX = wristRow.centerX / 120;
            const normY = wristRow.y / 90;
            const normW = wristRow.width / 120;

            // Tính góc nghiêng cẳng tay bằng Hồi quy tuyến tính (Linear Regression) trên các lát cắt
            let sumY = 0, sumX = 0, sumXY = 0, sumY2 = 0;
            const n = rowStats.length;
            for (const row of rowStats) {
              sumX += row.centerX;
              sumY += row.y;
              sumXY += row.centerX * row.y;
              sumY2 += row.y * row.y;
            }
            const denom = n * sumY2 - sumY * sumY;
            const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
            // Góc xoay của cẳng tay so với trục dọc
            const armAngleDeg = Math.round(Math.atan(slope) * (180 / Math.PI) * 1.15);
            const clampedAngle = Math.max(-75, Math.min(75, armAngleDeg));

            const conf = Math.min(98, Math.max(68, Math.round((totalSkinCount / 400) * 88)));

            setDetectedWrist({
              x: normX * 100,
              y: normY * 100,
              width: normW * 100,
              angle: clampedAngle,
              confidence: conf
            });
            setTrackingConfidence(conf);

            // Khi nhận diện cổ tay ổn định, TỰ ĐỘNG GẮN CỨNG VÀO CỔ TAY LUÔN
            lockStreakRef.current += 1;
            if (conf >= 68 && lockStreakRef.current >= 2) {
              if (!isWristLocked) {
                setIsWristLocked(true);
              }
              setTrackingFeedback(`🔒 Đã Gắn Cứng Cổ Tay (${conf}%)`);
            } else {
              setTrackingFeedback(`🎯 Đang dò cổ tay ${conf}%...`);
            }

            // Tự động kích hoạt animation đeo trượt vào tay khi khóa cổ tay thành công lần đầu
            if (prevConfRef.current < 55 && conf >= 68) {
              triggerWearAnimation();
            }
            prevConfRef.current = conf;

            if (isAutoTracking) {
              const targetOffsetX = (normX - 0.5) * 220;
              const targetOffsetY = (normY - 0.5) * 190 + 5;

              // Thuật toán GẮN CỨNG CỔ TAY (Deadband Sticky Filter):
              // Khi cổ tay giữ yên hoặc chỉ rung lắc nhẹ (< 4.5px), vòng tay được GHIM CỨNG 100% không trôi, không giật.
              // Khi người dùng di chuyển cổ tay rõ ràng (> 4.5px), vòng tay đi theo mượt mà và ngay lập tức bám cứng lại vị trí mới!
              setArOffsetX(prev => {
                const delta = targetOffsetX - prev;
                if (Math.abs(delta) < 4.5) return prev; // Gắn cứng hoàn toàn
                return Number((prev + delta * 0.25).toFixed(1));
              });

              setArOffsetY(prev => {
                const delta = targetOffsetY - prev;
                if (Math.abs(delta) < 4.5) return prev; // Gắn cứng hoàn toàn
                return Number((prev + delta * 0.25).toFixed(1));
              });

              setArAngle(prev => {
                const delta = clampedAngle - prev;
                if (Math.abs(delta) < 3.0) return prev; // Gắn cứng góc xoay
                return Number((prev + delta * 0.20).toFixed(1));
              });
            }
          } else {
            lockStreakRef.current = 0;
            // Nếu đã gắn cứng rồi thì GIỮ NGUYÊN vị trí, không để vòng tay bị trôi mất
            if (isWristLocked) {
              setTrackingFeedback('🔒 Đang Giữ Cố Định Vòng Trên Cổ Tay');
              setTrackingConfidence(prev => Math.max(50, prev - 2));
            } else {
              setTrackingConfidence(prev => Math.max(0, prev - 4));
              setTrackingFeedback('Đưa cổ tay vào giữa khung camera...');
            }
          }
        } catch (e) {
          // Ignore transient read errors
        }
      }
      animId = requestAnimationFrame(processFrame);
    };

    animId = requestAnimationFrame(processFrame);
  }, [cameraActive, modalMode, isAutoTracking]);

  // Sync initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalMode(initialMode || 'wrist');
      if (initialMode === 'wrist' || initialMode === 'ar_tryon') {
        startCamera(facingMode);
      }
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Start webcam with multi-tier fallback for all iOS & Android devices
  const startCamera = async (mode = facingMode) => {
    setCameraError('');
    stopCamera();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Trình duyệt chưa hỗ trợ luồng camera trực tiếp (hoặc đang mở trong app Zalo/Facebook). Bạn hãy bấm nút "Chụp Bằng Camera Máy" bên dưới để mở ngay!');
      return;
    }

    // Multi-tier fallback constraints:
    // Tier 1: Ideal facingMode + 720p/HD resolution
    // Tier 2: Simple facingMode
    // Tier 3: Opposite facingMode (if device lacks requested one)
    // Tier 4: { video: true } universal fallback guaranteed on 100% of mobile & desktop browsers
    const constraintTiers = [
      { video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: mode } },
      { video: { facingMode: mode === 'environment' ? 'user' : 'environment' } },
      { video: true }
    ];

    let activeStream = null;
    let lastErr = null;

    for (const constraints of constraintTiers) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (activeStream) break;
      } catch (err) {
        lastErr = err;
        console.warn('Camera tier constraint failed, trying next tier...', err.name, err.message);
      }
    }

    if (activeStream) {
      if (videoRef.current) {
        videoRef.current.srcObject = activeStream;
        try {
          // iOS Safari requires explicit play() call
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play() failed:', playErr);
        }
        setCameraActive(true);
        setCameraError('');
      }
    } else {
      console.warn('All camera tiers failed:', lastErr);
      let msg = 'Không thể mở luồng camera trực tiếp.';
      if (lastErr?.name === 'NotAllowedError' || lastErr?.name === 'PermissionDeniedError') {
        msg = 'Quyền Camera đang bị chặn trên trình duyệt. Bạn hãy cấp quyền hoặc nhấn nút "📸 Chụp Bằng Camera Máy" bên dưới để chụp ngay nhé!';
      } else if (lastErr?.name === 'NotFoundError' || lastErr?.name === 'DevicesNotFoundError') {
        msg = 'Không tìm thấy thiết bị camera trên máy.';
      } else {
        msg = 'Camera bị hạn chế hoặc đang bận. Bạn hãy dùng nút "📸 Chụp Bằng Camera Máy" bên dưới để chụp trực tiếp!';
      }
      setCameraError(msg);
      setCameraActive(false);
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Nén ảnh client-side xuống max 1000px để request siêu nhẹ, siêu nhanh và tránh payload limit
  const compressImage = (dataUrl, maxDimension = 1000, quality = 0.82) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Capture frame from webcam for Mode 1
  const handleCaptureWrist = async () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const optimized = await compressImage(rawDataUrl, 1000, 0.82);
    setCapturedImage(optimized);
    stopCamera();
  };

  // File upload for Mode 1 (Wrist)
  const handleFileUploadWrist = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const optimized = await compressImage(event.target.result, 1000, 0.82);
      setCapturedImage(optimized);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // File upload for Mode 2 (Bead/Charm Matching)
  const handleFileUploadMatch = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const optimized = await compressImage(event.target.result, 1000, 0.82);
      setMatchImage(optimized);
      setMatchError('');
    };
    reader.readAsDataURL(file);
  };

  // Call Mode 1: Analyze Wrist
  const handleAnalyzeWrist = async () => {
    if (!capturedImage && !userNotes) {
      setWristError('Vui lòng chụp ảnh hoặc điền thông tin để AI tư vấn.');
      return;
    }

    setIsAnalyzingWrist(true);
    setWristError('');

    try {
      const res = await api.analyzeWrist({
        imageBase64: capturedImage,
        userNotes,
        birthYear
      });

      if (res.success && res.data) {
        setWristResult(res.data);
      } else {
        throw new Error(res.message || 'Không nhận được kết quả từ AI');
      }
    } catch (err) {
      setWristError(err.message || 'Lỗi khi gửi hình ảnh lên AI Gemini. Vui lòng thử lại.');
    } finally {
      setIsAnalyzingWrist(false);
    }
  };

  // Call Mode 2: Match Beads and Charms from Uploaded Image
  const handleMatchBeadsAndCharms = async (overrideImage = null) => {
    const targetImage = overrideImage || matchImage;
    if (!targetImage && !matchNotes) {
      setMatchError('Vui lòng tải ảnh lên hoặc nhập ý tưởng để AI gợi ý.');
      return;
    }

    setIsMatchingBeads(true);
    setMatchError('');

    try {
      const res = await api.matchBeadsAndCharms({
        imageBase64: targetImage,
        userNotes: matchNotes
      });

      if (res.success && res.data) {
        setMatchResult(res.data);
      } else {
        throw new Error(res.message || 'Không thể phối hạt từ ảnh');
      }
    } catch (err) {
      setMatchError(err.message || 'Lỗi khi phân tích ảnh phối hạt. Vui lòng thử lại.');
    } finally {
      setIsMatchingBeads(false);
    }
  };

  // Chuyển từ ảnh cổ tay không hợp lệ sang chế độ phối hạt & charm từ ảnh đó
  const handlePivotToMatchFromWrist = () => {
    if (!capturedImage) return;
    setMatchImage(capturedImage);
    setModalMode('catalog_match');
    setMatchNotes(userNotes || 'Gợi ý bản phối hợp với màu sắc bức ảnh này');
    handleMatchBeadsAndCharms(capturedImage);
  };

  // Áp dụng Preset vào BraceletStudio
  const handleApplyPreset = (preset) => {
    if (preset && onApplyCustomPreset) {
      onApplyCustomPreset(preset);
      stopCamera();
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] w-screen h-screen bg-black text-white flex flex-col justify-between overflow-hidden select-none touch-none animate-fadeIn"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 1. Shutter Flash Effect */}
      {shutterFlash && (
        <div className="absolute inset-0 bg-white z-[90] pointer-events-none transition-opacity duration-200" />
      )}

      {/* 2. Fullscreen Live Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* 3. Top Header Bar (iPhone Dynamic Island / Minimalist Frosted Glass) */}
      <div className="relative z-30 w-full px-4 pt-4 pb-2 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        {/* Nút đóng góc trái */}
        <button
          type="button"
          onClick={() => { stopCamera(); onClose(); }}
          className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white/90 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer"
          title="Đóng camera"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Center: Dynamic Island / Trạng thái ghim cổ tay */}
        <button
          type="button"
          onClick={() => {
            setIsWristLocked(prev => {
              const next = !prev;
              if (next) {
                setIsAutoTracking(true);
                setTrackingFeedback('🔒 Đã BẬT Gắn Cứng Cổ Tay!');
              } else {
                setTrackingFeedback('🔓 Đã mở khóa di chuyển');
              }
              return next;
            });
          }}
          className={`px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold backdrop-blur-md border transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
            isWristLocked
              ? 'bg-emerald-950/85 text-emerald-200 border-emerald-500/60 ring-2 ring-emerald-500/30'
              : isAutoTracking && trackingConfidence > 65
              ? 'bg-amber-950/85 text-amber-200 border-amber-500/60 ring-2 ring-amber-500/30'
              : 'bg-black/60 text-stone-300 border-white/20'
          }`}
        >
          {isWristLocked ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="tracking-wide">🔒 ĐÃ GHIM CỔ TAY (100%)</span>
            </>
          ) : isAutoTracking && trackingConfidence > 65 ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin shrink-0" />
              <span>🎯 Đang Bám Cổ Tay: {trackingConfidence}%</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span>Đưa cổ tay trần vào giữa camera...</span>
            </>
          )}
        </button>

        {/* Cụm nút bên phải: Ướm lại, Đổi camera, Tinh chỉnh */}
        <div className="flex items-center gap-2">
          {modalMode === 'ar_tryon' && (
            <button
              type="button"
              onClick={triggerWearAnimation}
              className="px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/75 text-amber-300 border border-amber-400/40 backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 active:scale-95 shadow-md cursor-pointer"
              title="Xem lại animation mở ra và mang vào tay"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Ướm Lại</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFacingMode}
            className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer"
            title="Đổi camera trước / sau"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {modalMode === 'ar_tryon' && (
            <button
              type="button"
              onClick={() => setShowSettingsDrawer(prev => !prev)}
              className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer ${
                showSettingsDrawer
                  ? 'bg-[#B86244] text-white border-[#B86244]'
                  : 'bg-black/50 hover:bg-black/75 text-white border-white/20'
              }`}
              title="Căn chỉnh chi tiết vị trí & kích cỡ"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Center Viewport Area */}
      <div className="relative flex-1 flex items-center justify-center pointer-events-none">
        {/* ========================================================================= */}
        {/* MODE 3: 3D AR TRY-ON                                                      */}
        {/* ========================================================================= */}
        {modalMode === 'ar_tryon' && (
          <>
            {/* Khung định vị 4 góc phong cách iPhone Camera */}
            <div className="relative w-64 h-80 pointer-events-none flex flex-col items-center justify-between py-6 transition-all duration-300">
              <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-xl transition-colors duration-300 ${isWristLocked ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'border-amber-300/60'}`} />
              <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-xl transition-colors duration-300 ${isWristLocked ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'border-amber-300/60'}`} />
              <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-xl transition-colors duration-300 ${isWristLocked ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'border-amber-300/60'}`} />
              <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-xl transition-colors duration-300 ${isWristLocked ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'border-amber-300/60'}`} />

              <div className={`w-44 h-60 rounded-full border border-dashed transition-all duration-300 flex items-center justify-center ${
                isWristLocked ? 'border-emerald-400/40 bg-emerald-500/5' : 'border-white/20'
              }`} />

              <span className="text-[10px] tracking-wider uppercase text-white/80 bg-black/55 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10 shadow-sm">
                {isWristLocked ? '✨ Vòng tay đã ôm khít cố định' : 'Bàn tay hướng lên trên'}
              </span>
            </div>

            {/* REAL-TIME 3D BRACELET SVG OVERLAY */}
            {(() => {
              const b = availableBracelets[arSelectedBracelet] || availableBracelets[0];
              const armWidthPx = (detectedWrist && detectedWrist.width > 12)
                ? Math.min(210, Math.max(90, (detectedWrist.width / 100) * 320))
                : 140;

              const armBaseRadius = armWidthPx * 0.50;
              const fitScale = arSizeCm / 15.5;
              const rx = armBaseRadius * fitScale;
              const sagFactor = Math.max(0, Math.min(1, (arSizeCm - 14) / 5));
              const ry = rx * (0.30 + sagFactor * 0.08);

              const cx = 160 + arOffsetX;
              const cy = 160 + arOffsetY;

              const frontCount = 11;
              let displayBeads = [];

              if (b.isCustom && b.beadPositions && b.beadPositions.length > 0) {
                const total = b.beadPositions.length;
                const centerIdx = Math.floor(total / 2);
                const halfFront = Math.floor(frontCount / 2);

                for (let offset = -halfFront; offset <= halfFront; offset++) {
                  const rawIdx = (centerIdx + offset + total) % total;
                  const p = b.beadPositions[rawIdx] || b.beadPositions[0];
                  displayBeads.push({
                    id: p.id || `bead-${rawIdx}`,
                    color: p.color || b.beadColor || '#EAA9A9',
                    name: p.name || 'Hạt đá phong thủy',
                    isPearl: Boolean(p.isPearl || p.name?.toLowerCase().includes('ngọc trai')),
                    isCrystal: Boolean(p.isCrystal || p.name?.toLowerCase().includes('pha lê')),
                    isSpacer: Boolean(p.isSpacer || p.name?.toLowerCase().includes('ngăn cách') || p.name?.toLowerCase().includes('khoen') || p.name?.toLowerCase().includes('bi kim loại')),
                    isFlower: false,
                    isCharm: Boolean(p.isCharm),
                    charmImage: p.image || null,
                    index: rawIdx
                  });
                }
              } else if (b.floralBeads && b.floralBeads.length > 0) {
                const floralTotal = b.floralBeads.length;
                const centerIdx = b.floralBeads.findIndex(fb => fb.type === 'flower');
                const cIdx = centerIdx !== -1 ? centerIdx : Math.floor(floralTotal / 2);
                const halfFront = Math.floor(frontCount / 2);

                for (let offset = -halfFront; offset <= halfFront; offset++) {
                  const rawIdx = (cIdx + offset + floralTotal) % floralTotal;
                  const fb = b.floralBeads[rawIdx] || b.floralBeads[0];
                  displayBeads.push({
                    ...fb,
                    id: `floral-${rawIdx}`,
                    isPearl: fb.type === 'pearl',
                    isFlower: fb.type === 'flower',
                    isCrystal: fb.type === 'crystal',
                    isSpacer: fb.type === 'gold_spacer',
                    isStrawberry: fb.type === 'strawberry'
                  });
                }
              } else {
                for (let i = 0; i < frontCount; i++) {
                  displayBeads.push({
                    id: `preset-bead-${i}`,
                    color: b.beadColor || '#F7C6D0',
                    name: b.name,
                    isPearl: false,
                    isFlower: false,
                    isCrystal: false,
                    isSpacer: false,
                    isCharm: false
                  });
                }
              }

              const beadCount = displayBeads.length;
              const beadItems = [];

              for (let i = 0; i < beadCount; i++) {
                const t = beadCount > 1 ? i / (beadCount - 1) : 0.5;
                const angle = (-Math.PI * 0.47) + t * (Math.PI * 0.94);
                const bx = cx + rx * Math.sin(angle);
                const by = cy + ry * Math.cos(angle);
                const depthFactor = 0.85 + 0.25 * Math.cos(angle);
                const item = displayBeads[i];
                const baseRadius = (item.isFlower ? 8.5 : (item.isSpacer ? 3.0 : 5.4)) * (rx / 65);
                const radius = baseRadius * depthFactor;
                const rxBead = radius * (0.55 + 0.45 * Math.cos(angle));
                const ryBead = radius;

                beadItems.push({
                  x: bx,
                  y: by,
                  radius,
                  rxBead,
                  ryBead,
                  depthFactor,
                  angle,
                  color: item.color || b.beadColor || '#FFFDF9',
                  index: i,
                  isEdge: i === 0 || i === beadCount - 1,
                  isFlower: item.isFlower,
                  isPearl: item.isPearl,
                  isCrystal: item.isCrystal,
                  isSpacer: item.isSpacer,
                  isCharm: item.isCharm,
                  charmImage: item.charmImage,
                  item
                });
              }

              const frontArcPath = `M ${cx - rx} ${cy} C ${cx - rx * 0.60} ${cy + ry * 1.06}, ${cx + rx * 0.60} ${cy + ry * 1.06}, ${cx + rx} ${cy}`;
              const beadCordPath = beadItems.length > 1
                ? `M ${beadItems[0].x.toFixed(1)} ${beadItems[0].y.toFixed(1)} ` + beadItems.slice(1).map(bead => `L ${bead.x.toFixed(1)} ${bead.y.toFixed(1)}`).join(' ')
                : frontArcPath;
              const contactShadowPath = beadCordPath;

              return (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <svg id="ar-bracelet-svg" viewBox="0 0 320 320" className="w-full h-full filter drop-shadow-xl">
                    <defs>
                      <style>{`
                        @keyframes smoothWearSlide {
                          0% {
                            transform: translateY(-80px) scale(1.36);
                            opacity: 0.15;
                          }
                          32% {
                            transform: translateY(-35px) scale(1.22);
                            opacity: 0.90;
                          }
                          65% {
                            transform: translateY(6px) scale(0.96);
                            opacity: 1;
                          }
                          82% {
                            transform: translateY(-3px) scale(1.025);
                            opacity: 1;
                          }
                          100% {
                            transform: translateY(0px) scale(1.00);
                            opacity: 1;
                          }
                        }

                        @keyframes charmWearSway {
                          0% { transform: rotate(0deg); }
                          22% { transform: rotate(-22deg); }
                          45% { transform: rotate(16deg); }
                          68% { transform: rotate(-8deg); }
                          85% { transform: rotate(3deg); }
                          100% { transform: rotate(0deg); }
                        }

                        @keyframes snapRippleGlow {
                          0% { transform: scale(0.90); opacity: 0; }
                          35% { opacity: 0.85; }
                          100% { transform: scale(1.22); opacity: 0; }
                        }
                      `}</style>
                      <filter id="skinContactBlur" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" />
                      </filter>
                      <filter id="beadDropShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" />
                        <feOffset dx="0" dy="2.2" result="offsetblur" />
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.48" />
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      <radialGradient id="pearlLusterGrad" cx="30%" cy="28%" r="72%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="28%" stopColor="#FFFDF8" />
                        <stop offset="68%" stopColor="#EDE1D1" />
                        <stop offset="100%" stopColor="#BAA591" />
                      </radialGradient>

                      <radialGradient id="sakuraPetalGrad" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#FFF2F5" />
                        <stop offset="42%" stopColor="#FBB6C7" />
                        <stop offset="85%" stopColor="#E67B98" />
                        <stop offset="100%" stopColor="#B34B68" />
                      </radialGradient>

                      <radialGradient id="sakuraCenterGrad" cx="32%" cy="30%" r="68%">
                        <stop offset="0%" stopColor="#FFFDE6" />
                        <stop offset="45%" stopColor="#F5D061" />
                        <stop offset="90%" stopColor="#C48E1D" />
                        <stop offset="100%" stopColor="#7A5308" />
                      </radialGradient>

                      <radialGradient id="crystalGrad" cx="28%" cy="26%" r="74%">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
                        <stop offset="40%" stopColor="#EFE8F8" stopOpacity="0.85" />
                        <stop offset="80%" stopColor="#C8B5E3" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#876DA8" stopOpacity="0.95" />
                      </radialGradient>

                      <radialGradient id="goldSpacerGrad" cx="32%" cy="30%" r="68%">
                        <stop offset="0%" stopColor="#FFFDF0" />
                        <stop offset="50%" stopColor="#EAC150" />
                        <stop offset="100%" stopColor="#8A6517" />
                      </radialGradient>
                    </defs>

                    {/* VÒNG XOAY VÀ THEO DÕI CỔ TAY */}
                    <g 
                      transform={`rotate(${arAngle} ${cx} ${cy})`}
                      style={{
                        transformOrigin: `${cx}px ${cy}px`,
                        transition: isDraggingOverlay ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      {/* NHÓM ANIMATION MỞ RA VÀ TRƯỢT ÔM VÀO TAY */}
                      <g
                        key={wearAnimKey}
                        style={{
                          transformOrigin: `${cx}px ${cy + ry * 0.4}px`,
                          animation: isWearingAnim ? 'smoothWearSlide 0.95s cubic-bezier(0.22, 1, 0.36, 1) forwards' : 'none'
                        }}
                      >
                        {isWearingAnim && (
                          <ellipse
                            cx={cx}
                            cy={cy + ry * 0.45}
                            rx={rx * 1.12}
                            ry={ry * 1.25}
                            fill="none"
                            stroke="#FDE2E4"
                            strokeWidth="2.5"
                            opacity="0.75"
                            style={{
                              transformOrigin: `${cx}px ${cy + ry * 0.45}px`,
                              animation: 'snapRippleGlow 0.95s ease-out forwards'
                            }}
                          />
                        )}

                        {/* 1. Bóng đổ tiếp xúc */}
                        <path
                          d={contactShadowPath}
                          fill="none"
                          stroke="#160905"
                          strokeWidth={Math.max(5.5, rx * 0.20)}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.45"
                          filter="url(#skinContactBlur)"
                        />

                        {/* 2. Dây cước luồn trong hạt */}
                        <path
                          d={beadCordPath}
                          fill="none"
                          stroke={b.cordColor ? darkenColor(b.cordColor, 0.3) : '#756252'}
                          strokeWidth={Math.max(1.2, rx * 0.032)}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.55"
                        />

                        {/* 3. Chuỗi hạt 3D */}
                        {beadItems.map((bead) => (
                          <g key={bead.index} opacity={bead.isEdge ? 0.86 : 1.0}>
                            {bead.isFlower ? (
                              <g transform={`translate(${bead.x}, ${bead.y})`}>
                                {[0, 1, 2, 3, 4].map((petalIdx) => {
                                  const pRad = (petalIdx * 72 - 18) * (Math.PI / 180);
                                  const px = Math.cos(pRad) * (bead.radius * 0.82);
                                  const py = Math.sin(pRad) * (bead.radius * 0.82);
                                  const pDeg = petalIdx * 72 - 18;
                                  return (
                                    <g key={petalIdx} transform={`translate(${px}, ${py}) rotate(${pDeg})`}>
                                      <ellipse
                                        cx="0"
                                        cy="0"
                                        rx={bead.rxBead * 0.65}
                                        ry={bead.ryBead * 0.48}
                                        fill="url(#sakuraPetalGrad)"
                                        stroke="#FCA3B7"
                                        strokeWidth="0.6"
                                        filter="url(#beadDropShadow)"
                                      />
                                      <ellipse
                                        cx="0"
                                        cy="0"
                                        rx={bead.rxBead * 0.38}
                                        ry={bead.ryBead * 0.26}
                                        fill="#FFF5F8"
                                        opacity="0.85"
                                      />
                                    </g>
                                  );
                                })}
                                <circle cx="0" cy="0" r={bead.radius * 0.40} fill="url(#sakuraCenterGrad)" stroke="#B8860B" strokeWidth="0.7" />
                                <circle cx={-bead.radius * 0.12} cy={-bead.radius * 0.12} r={bead.radius * 0.15} fill="#FFFFFF" opacity="0.95" />
                              </g>
                            ) : bead.isSpacer ? (
                              <g transform={`translate(${bead.x}, ${bead.y})`}>
                                <ellipse cx="0" cy="0" rx={bead.rxBead} ry={bead.ryBead} fill="url(#goldSpacerGrad)" stroke="#FFFFFF" strokeWidth="0.6" filter="url(#beadDropShadow)" />
                                <circle cx={-bead.radius * 0.3} cy={-bead.radius * 0.3} r={bead.radius * 0.32} fill="#FFFFFF" opacity="0.9" />
                              </g>
                            ) : bead.isPearl ? (
                              <g transform={`translate(${bead.x}, ${bead.y})`}>
                                <ellipse cx="0" cy="0" rx={bead.rxBead} ry={bead.ryBead} fill="url(#pearlLusterGrad)" stroke="#FFFFFF" strokeWidth="0.8" filter="url(#beadDropShadow)" />
                                <ellipse cx={-bead.radius * 0.18} cy={-bead.radius * 0.18} rx={bead.rxBead * 0.52} ry={bead.ryBead * 0.44} fill="#FFFFFF" opacity="0.55" />
                                <circle cx={-bead.radius * 0.32} cy={-bead.radius * 0.32} r={bead.radius * 0.28} fill="#FFFFFF" opacity="0.95" />
                              </g>
                            ) : bead.isCrystal ? (
                              <g transform={`translate(${bead.x}, ${bead.y})`}>
                                <ellipse cx="0" cy="0" rx={bead.rxBead} ry={bead.ryBead} fill="url(#crystalGrad)" stroke="#FFFFFF" strokeWidth="0.8" filter="url(#beadDropShadow)" />
                                <circle cx={-bead.radius * 0.3} cy={-bead.radius * 0.3} r={bead.radius * 0.3} fill="#FFFFFF" opacity="0.9" />
                                <circle cx={bead.radius * 0.2} cy={bead.radius * 0.2} r={bead.radius * 0.35} fill="#FFFFFF" opacity="0.3" />
                              </g>
                            ) : (
                              <g transform={`translate(${bead.x}, ${bead.y})`}>
                                <defs>
                                  <radialGradient id={`dynBeadGrad-${bead.index}`} cx="32%" cy="28%" r="72%">
                                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
                                    <stop offset="38%" stopColor={bead.color} />
                                    <stop offset="85%" stopColor={darkenColor(bead.color, 0.42)} />
                                    <stop offset="100%" stopColor="#1C0E0A" stopOpacity="0.92" />
                                  </radialGradient>
                                </defs>
                                <ellipse
                                  cx="0"
                                  cy="0"
                                  rx={bead.rxBead}
                                  ry={bead.ryBead}
                                  fill={`url(#dynBeadGrad-${bead.index})`}
                                  stroke="rgba(255,255,255,0.7)"
                                  strokeWidth="0.8"
                                  filter="url(#beadDropShadow)"
                                />
                                <ellipse cx={-bead.rxBead * 0.32} cy={-bead.ryBead * 0.32} rx={bead.rxBead * 0.32} ry={bead.ryBead * 0.28} fill="#FFFFFF" opacity="0.85" />
                                <ellipse cx={bead.rxBead * 0.25} cy={bead.ryBead * 0.25} rx={bead.rxBead * 0.20} ry={bead.ryBead * 0.18} fill="#FFFFFF" opacity="0.25" />
                              </g>
                            )}
                          </g>
                        ))}

                        {/* 4. Charm trung tâm đong đưa vật lý */}
                        {b.selectedCharm && !b.isFloralModel && (
                          <g 
                            transform={`translate(${cx}, ${cy + ry + 1}) rotate(${-arAngle * 0.75})`}
                            style={{
                              transformOrigin: '0px 0px',
                              animation: isWearingAnim ? 'charmWearSway 1.15s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
                            }}
                          >
                            <circle cx="0" cy="0" r="2.2" fill="none" stroke="#D4AF37" strokeWidth="1.2" />
                            <line x1="0" y1="1.5" x2="0" y2="5" stroke="#D4AF37" strokeWidth="1.3" />
                            {renderArCharmSvg(b.selectedCharm, Math.max(0.55, Math.min(0.85, (rx / 65) * 0.70)))}
                          </g>
                        )}
                      </g>
                    </g>
                  </svg>
                </div>
              );
            })()}
          </>
        )}

        {/* ========================================================================= */}
        {/* MODE 1: QUÉT CỔ TAY ĐO SIZE                                                */}
        {/* ========================================================================= */}
        {modalMode === 'wrist' && (
          <div className="relative w-full max-w-md mx-auto p-4 flex flex-col items-center pointer-events-auto">
            {!wristResult ? (
              <div className="text-center p-4 rounded-3xl bg-black/55 backdrop-blur-md border border-white/20 shadow-xl space-y-2 max-w-sm">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center mx-auto">
                  <Camera className="w-5 h-5" />
                </div>
                <h4 className="font-serif-boutique text-sm sm:text-base font-bold text-white">
                  Căn Chỉnh Cổ Tay Để AI Đo Size
                </h4>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Đưa cổ tay hoặc bàn tay vào trước ống kính. Nhấn nút chụp tròn bên dưới để AI quét chu vi và màu da của bạn!
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải Ảnh Có Sẵn</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUploadWrist}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full bg-[#FAF7F2] text-[#26211C] p-5 rounded-3xl shadow-2xl border border-[#E8DFD3] space-y-4 max-h-[70vh] overflow-y-auto animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã Phân Tích Cổ Tay Thành Công</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setWristResult(null); setCapturedImage(null); startCamera(); }}
                    className="text-xs text-[#B86244] hover:underline font-semibold cursor-pointer"
                  >
                    Chụp lại
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {wristResult.skinTone && (
                    <div className="p-2.5 bg-white rounded-xl border border-[#E8DFD3]">
                      <span className="text-[10px] text-[#8C8276] block">🎨 Tone da:</span>
                      <strong className="text-[11px]">{wristResult.skinTone}</strong>
                    </div>
                  )}
                  {wristResult.wristType && (
                    <div className="p-2.5 bg-white rounded-xl border border-[#E8DFD3]">
                      <span className="text-[10px] text-[#8C8276] block">📏 Kích thước gợi ý:</span>
                      <strong className="text-[11px]">{wristResult.wristType}</strong>
                    </div>
                  )}
                </div>
                <div className="text-xs text-[#26211C] leading-relaxed p-3 bg-white rounded-xl border border-[#E8DFD3] max-h-36 overflow-y-auto whitespace-pre-line">
                  {wristResult.analysis}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (wristResult.presetConfig) handleApplyPreset(wristResult.presetConfig);
                    }}
                    className="flex-1 py-2.5 px-4 bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Flower2 className="w-3.5 h-3.5 text-amber-200" />
                    <span>Áp Dụng Thiết Kế Vào Xưởng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('ar_tryon');
                      startCamera();
                    }}
                    className="py-2.5 px-4 bg-[#26211C] hover:bg-[#3D352E] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ướm Thử 3D Ngay</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: TẢI ẢNH GỢI Ý PHỐI HẠT & CHARM                                    */}
        {/* ========================================================================= */}
        {modalMode === 'catalog_match' && (
          <div className="relative w-full max-w-md mx-auto p-4 flex flex-col items-center pointer-events-auto">
            {!matchResult ? (
              <div className="w-full bg-black/65 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-xl space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-[#B86244]/30 text-amber-300 border border-amber-400/40 flex items-center justify-center mx-auto">
                  <Palette className="w-5 h-5" />
                </div>
                <h4 className="font-serif-boutique text-sm sm:text-base font-bold text-white">
                  Phối Hạt & Charm Từ Ảnh Cảm Hứng
                </h4>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Tải bức ảnh bạn yêu thích (trang phục, phong cảnh, ảnh mẫu) để AI bóc tách màu và gợi ý hạt đá có sẵn tại xưởng!
                </p>

                {matchImage && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-300 mx-auto shadow-md">
                    <img src={matchImage} alt="Match preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => matchFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{matchImage ? 'Đổi Ảnh Khác' : 'Chọn Ảnh Tải Lên'}</span>
                  </button>
                  <input
                    ref={matchFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUploadMatch}
                  />

                  {matchImage && (
                    <button
                      type="button"
                      onClick={() => handleMatchBeadsAndCharms(matchImage)}
                      disabled={isMatchingBeads}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isMatchingBeads ? 'Đang Phân Tích...' : 'Bắt Đầu Phối'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full bg-[#FAF7F2] text-[#26211C] p-5 rounded-3xl shadow-2xl border border-[#E8DFD3] space-y-4 max-h-[70vh] overflow-y-auto animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-2">
                  <span className="font-bold text-xs sm:text-sm text-[#845339] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Bản Phối Hạt Gợi Ý Cho Bạn</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => { setMatchResult(null); setMatchImage(null); }}
                    className="text-xs text-[#B86244] hover:underline font-semibold cursor-pointer"
                  >
                    Chọn ảnh khác
                  </button>
                </div>
                <div className="text-xs text-[#26211C] leading-relaxed p-3 bg-white rounded-xl border border-[#E8DFD3] whitespace-pre-line max-h-36 overflow-y-auto">
                  {matchResult.stylingAdvice || matchResult.analysis}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (matchResult.suggestedDesign) handleApplyPreset(matchResult.suggestedDesign);
                    }}
                    className="flex-1 py-2.5 px-4 bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Flower2 className="w-3.5 h-3.5 text-amber-200" />
                    <span>Áp Dụng Vào Xưởng 3D</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Bottom Controls (iPhone Camera Layout) */}
      <div className="relative z-40 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-3 pb-6 px-4 flex flex-col items-center gap-2.5 pointer-events-auto">
        {/* Tier 1: Fit Selector (Lens selector: 14.5cm, 15.5cm, 17.5cm) */}
        {modalMode === 'ar_tryon' && (
          <div className="flex items-center gap-2 pb-0.5">
            <button
              type="button"
              onClick={() => { setArSizeCm(14.5); triggerWearAnimation(); }}
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer ${
                arSizeCm <= 14.8 ? 'bg-[#B86244] text-white border-[#B86244] shadow-sm' : 'bg-black/50 text-white/80 border-white/20 hover:bg-black/70'
              }`}
            >
              🤏 14.5cm Ôm Sát
            </button>
            <button
              type="button"
              onClick={() => { setArSizeCm(userCustomSize || 15.5); triggerWearAnimation(); }}
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer ${
                Math.abs(arSizeCm - (userCustomSize || 15.5)) < 0.4 ? 'bg-[#B86244] text-white border-[#B86244] shadow-sm' : 'bg-black/50 text-white/80 border-white/20 hover:bg-black/70'
              }`}
            >
              ✨ {customBracelet?.wristSize || `${userCustomSize || 15.5}cm Chuẩn`}
            </button>
            <button
              type="button"
              onClick={() => { setArSizeCm(17.5); triggerWearAnimation(); }}
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer ${
                arSizeCm >= 17.2 ? 'bg-[#B86244] text-white border-[#B86244] shadow-sm' : 'bg-black/50 text-white/80 border-white/20 hover:bg-black/70'
              }`}
            >
              🍃 17.5cm Buông Lơi
            </button>
          </div>
        )}

        {/* Tier 2: Horizontal Carousel of Bracelets (iOS Filter / Photographic Styles) */}
        {modalMode === 'ar_tryon' && (
          <div className="w-full max-w-2xl overflow-x-auto no-scrollbar py-1 px-2 flex items-center gap-2 justify-start sm:justify-center">
            {availableBracelets.map((item, idx) => {
              const isSelected = arSelectedBracelet === idx;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => {
                    setArSelectedBracelet(idx);
                    triggerWearAnimation();
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border backdrop-blur-md transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#B86244]/90 border-amber-300 ring-2 ring-amber-400/40 text-white shadow-lg'
                      : 'bg-black/50 border-white/15 text-stone-300 hover:bg-black/70'
                  }`}
                >
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-inner shrink-0" 
                    style={{ backgroundColor: item.beadColor }} 
                  />
                  <div className="text-left">
                    <p className="text-[11px] font-bold leading-none line-clamp-1">{(item.name || 'Vòng Tay').replace('Vòng ', '')}</p>
                    <p className="text-[10px] text-amber-200 font-semibold mt-0.5">{formatPrice(item.price)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tier 3: iPhone Camera Mode Text Selector Row */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 py-1 text-xs font-bold tracking-wider">
          <button
            type="button"
            onClick={() => { setModalMode('wrist'); if (!capturedImage) startCamera(); }}
            className={`transition-all flex flex-col items-center gap-1 cursor-pointer ${
              modalMode === 'wrist' ? 'text-amber-300 font-extrabold scale-105' : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>ĐO SIZE CỔ TAY</span>
            {modalMode === 'wrist' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />}
          </button>

          <button
            type="button"
            onClick={() => { setModalMode('ar_tryon'); startCamera(); }}
            className={`transition-all flex flex-col items-center gap-1 cursor-pointer ${
              modalMode === 'ar_tryon' ? 'text-amber-300 font-extrabold scale-105' : 'text-stone-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ƯỚM VÒNG 3D AR</span>
            </span>
            {modalMode === 'ar_tryon' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />}
          </button>

          <button
            type="button"
            onClick={() => { setModalMode('catalog_match'); stopCamera(); }}
            className={`transition-all flex flex-col items-center gap-1 cursor-pointer ${
              modalMode === 'catalog_match' ? 'text-amber-300 font-extrabold scale-105' : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>PHỐI ẢNH AI</span>
            {modalMode === 'catalog_match' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />}
          </button>
        </div>

        {/* Tier 4: Iconic iPhone Shutter Button Row */}
        <div className="w-full max-w-lg px-4 flex items-center justify-between gap-4">
          {/* Left: Thumbnail preview snapshot */}
          <div className="w-16 flex justify-start">
            {arCapturedSnapshot ? (
              <button
                type="button"
                onClick={() => setSnapshotModalOpen(true)}
                className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/60 shadow-lg active:scale-95 transition-transform cursor-pointer"
                title="Xem lại ảnh vừa chụp"
              >
                <img src={arCapturedSnapshot} alt="Snapshot" className="w-full h-full object-cover" />
              </button>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-stone-400">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Center: Iconic iPhone Camera Shutter Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleShutterClick}
              className="w-[72px] h-[72px] rounded-full border-4 border-white flex items-center justify-center p-1 shadow-[0_0_20px_rgba(0,0,0,0.5)] active:scale-90 transition-transform cursor-pointer"
              title="Chụp ảnh ướm vòng tay"
            >
              <div className="w-full h-full rounded-full bg-white transition-colors hover:bg-amber-100" />
            </button>
          </div>

          {/* Right: Thêm vào giỏ hàng hoặc Chụp camera máy */}
          <div className="w-28 sm:w-36 flex justify-end">
            {modalMode === 'ar_tryon' ? (
              <button
                type="button"
                onClick={() => {
                  const b = availableBracelets[arSelectedBracelet] || availableBracelets[0];
                  if (b.isCustom) {
                    addToCart({
                      id: b.id || 'custom-designed-bracelet',
                      name: b.name || 'Vòng Tự Phối Độc Bản (AR 3D)',
                      price: b.price,
                      isCustom: true,
                      cordName: b.cordName,
                      cordColor: b.cordColor,
                      beadPositions: b.beadPositions,
                      selectedCharm: b.selectedCharm,
                      images: [b.selectedCharm?.image || '/images/products/bracelet-strawberry-quartz.webp']
                    }, 1, {
                      wristSize: `${arSizeCm} cm`,
                      beadCount: b.beadPositions?.length || 18,
                      note: `Đã thử ướm vừa vặn qua AR Camera 3D (Size ${arSizeCm}cm, Tự phối xưởng)`
                    });
                  } else {
                    addToCart({
                      id: b.id,
                      name: b.name,
                      price: b.price,
                      images: ['/images/products/bracelet-strawberry-quartz.webp']
                    }, 1, {
                      wristSize: `${arSizeCm} cm`,
                      note: `Đã thử ướm vừa vặn qua AR Camera (Size ${arSizeCm}cm, Mệnh ${b.menh})`
                    });
                  }
                  setArAddedSuccess(true);
                  setTimeout(() => setArAddedSuccess(false), 2500);
                }}
                className="px-3 py-2.5 rounded-2xl bg-gradient-to-r from-[#B86244] to-amber-600 hover:from-[#A05237] hover:to-amber-700 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                title="Thêm vòng đang thử vào giỏ hàng"
              >
                {arAddedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span className="hidden sm:inline">Đã Thêm!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-amber-200 shrink-0" />
                    <span className="hidden sm:inline">Thêm Giỏ</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => nativeCameraWristRef.current?.click()}
                className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                title="Chụp bằng camera gốc máy"
              >
                <Camera className="w-4 h-4 text-amber-200" />
                <span className="hidden sm:inline">Camera Máy</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 6. Slide-Up Drawer (Settings Sheet) for Fine-Tuning */}
      {showSettingsDrawer && (
        <div className="absolute inset-x-0 bottom-0 z-50 bg-[#26211C]/95 backdrop-blur-xl border-t border-white/20 p-5 rounded-t-3xl shadow-2xl text-white space-y-4 animate-fadeIn pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              <span>Tinh Chỉnh Thủ Công Vòng Tay Cổ Tay</span>
            </span>
            <button
              type="button"
              onClick={() => setShowSettingsDrawer(false)}
              className="p-1 rounded-full hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-stone-300">
                <span>Chu vi:</span>
                <span className="font-bold text-amber-300">{arSizeCm} cm</span>
              </div>
              <input
                type="range"
                min="13"
                max="19"
                step="0.5"
                value={arSizeCm}
                onChange={(e) => setArSizeCm(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-stone-300">
                <span>Góc xoay:</span>
                <span className="font-bold text-amber-300">{arAngle}°</span>
              </div>
              <input
                type="range"
                min="-85"
                max="85"
                step="1"
                value={arAngle}
                onChange={(e) => setArAngle(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-stone-300">
                <span>Dịch ngang (X):</span>
                <span className="font-bold text-amber-300">{arOffsetX}px</span>
              </div>
              <input
                type="range"
                min="-120"
                max="120"
                step="2"
                value={arOffsetX}
                onChange={(e) => { setArOffsetX(Number(e.target.value)); setIsAutoTracking(false); }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-stone-300">
                <span>Dịch dọc (Y):</span>
                <span className="font-bold text-amber-300">{arOffsetY}px</span>
              </div>
              <input
                type="range"
                min="-120"
                max="120"
                step="2"
                value={arOffsetY}
                onChange={(e) => { setArOffsetY(Number(e.target.value)); setIsAutoTracking(false); }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <button
              type="button"
              onClick={() => {
                setIsWristLocked(prev => !prev);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                isWristLocked
                  ? 'bg-emerald-600/90 text-white border-emerald-400'
                  : 'bg-white/10 text-stone-300 border-white/20'
              }`}
            >
              {isWristLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isWristLocked ? '🔒 Đã Ghim Cổ Tay' : '🔓 Ghim Vị Trí Cố Định'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setArOffsetX(0);
                setArOffsetY(0);
                setArAngle(0);
                setIsAutoTracking(true);
                setIsWristLocked(false);
                triggerWearAnimation();
              }}
              className="text-xs text-amber-300 hover:underline cursor-pointer"
            >
              🔄 Đặt Lại Trung Tâm
            </button>
          </div>
        </div>
      )}

      {/* 7. Snapshot Modal Preview */}
      {snapshotModalOpen && arCapturedSnapshot && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn pointer-events-auto">
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden border-2 border-amber-300/60 shadow-2xl bg-stone-900 flex flex-col">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img src={arCapturedSnapshot} alt="AR Snapshot" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setSnapshotModalOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 bg-[#26211C] text-white">
              <div className="text-center">
                <h4 className="font-serif-boutique font-bold text-sm text-amber-200">
                  {availableBracelets[arSelectedBracelet]?.name || 'Ảnh Ướm Vòng Tay 3D'}
                </h4>
                <p className="text-[11px] text-stone-300">Đã ướm vừa vặn trên cổ tay thật</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={arCapturedSnapshot}
                  download={`uom_vong_${Date.now()}.jpg`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Về Máy</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const b = availableBracelets[arSelectedBracelet] || availableBracelets[0];
                    addToCart({
                      id: b.id,
                      name: b.name,
                      price: b.price,
                      images: ['/images/products/bracelet-strawberry-quartz.webp']
                    }, 1, {
                      wristSize: `${arSizeCm} cm`,
                      note: `Chụp từ AR Camera Snapshot (Size ${arSizeCm}cm)`
                    });
                    setSnapshotModalOpen(false);
                    setArAddedSuccess(true);
                    setTimeout(() => setArAddedSuccess(false), 2500);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-200" />
                  <span>Đặt Mua Vòng Này</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for native camera */}
      <input
        ref={nativeCameraWristRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUploadWrist}
      />
    </div>
  );
}
