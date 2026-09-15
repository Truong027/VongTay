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

export default function AICameraModal({
  isOpen,
  onClose,
  initialMode = 'wrist',
  customBracelet = null,
  onApplyCustomPreset = null
}) {
  const { addToCart } = useCart();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const nativeCameraWristRef = useRef(null);
  const matchFileInputRef = useRef(null);
  const nativeCameraMatchRef = useRef(null);

  // Viewport size for fullscreen AR SVG overlay
  const [viewportSize, setViewportSize] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 390,
    h: typeof window !== 'undefined' ? window.innerHeight : 844
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

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

  // Auto AI MediaPipe Hands & Sticky Wrist Tracking State
  const [isAutoTracking, setIsAutoTracking] = useState(true);
  const [isWristLocked, setIsWristLocked] = useState(false);
  const [trackingConfidence, setTrackingConfidence] = useState(0);
  const [trackingFeedback, setTrackingFeedback] = useState('Đang tìm cổ tay...');
  const [detectedWrist, setDetectedWrist] = useState(null);
  const lockStreakRef = useRef(0);
  const lastDetectionTimeRef = useRef(0);
  const prevConfRef = useRef(0);
  const handsRef = useRef(null);
  const [mediaPipeLoaded, setMediaPipeLoaded] = useState(false);

  // Smooth Snap-On Wear Animation State (Mở ra từ mu bàn tay -> Trượt xuống cổ tay -> Co ôm khít)
  const [isWearingAnim, setIsWearingAnim] = useState(true);
  const [wearAnimKey, setWearAnimKey] = useState(0);

  const triggerWearAnimation = () => {
    setWearAnimKey(prev => prev + 1);
    setIsWearingAnim(true);
    setTimeout(() => {
      setIsWearingAnim(false);
    }, 1150);
  };

  // 1. Tải MediaPipe Hands từ CDN chính thức của Google
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.Hands) {
      setMediaPipeLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.onload = () => {
      setMediaPipeLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // 2. Khởi tạo instance Hands
  useEffect(() => {
    if (!mediaPipeLoaded || !window.Hands) return;
    try {
      const hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.50,
        minTrackingConfidence: 0.50
      });

      hands.onResults((results) => {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
          // Nếu mất tay thì giảm confidence từ từ
          if (Date.now() - lastDetectionTimeRef.current > 1200) {
            lockStreakRef.current = 0;
            if (!isWristLocked) {
              setTrackingConfidence(prev => Math.max(0, prev - 6));
              setTrackingFeedback('Đưa cổ tay trần vào giữa camera...');
            } else {
              setTrackingFeedback('🔒 Đã Ghim Cố Định Trên Cổ Tay');
            }
          }
          return;
        }

        const landmarks = results.multiHandLandmarks[0];
        lastDetectionTimeRef.current = Date.now();

        // Điểm neo giải phẫu MediaPipe:
        // 0: Wrist (ngấn cổ tay)
        // 5: Index finger MCP (gốc ngón trỏ)
        // 9: Middle finger MCP (gốc ngón giữa)
        // 17: Pinky finger MCP (gốc ngón út)
        const lmWrist = landmarks[0];
        const lmIndex = landmarks[5];
        const lmMiddle = landmarks[9];
        const lmPinky = landmarks[17];

        // Trục cẳng tay: từ gốc ngón giữa (lm9) xuống cổ tay (lm0)
        const dirX = lmWrist.x - lmMiddle.x;
        const dirY = lmWrist.y - lmMiddle.y;
        const dirLen = Math.hypot(dirX, dirY) || 0.001;
        const dirNormX = dirX / dirLen;
        const dirNormY = dirY / dirLen;

        // Điểm tâm ngấn cổ tay đeo vòng (ở ngay ngấn hoặc lùi nhẹ xuống cẳng tay 6%)
        const creaseNormX = lmWrist.x + dirNormX * (dirLen * 0.06);
        const creaseNormY = lmWrist.y + dirNormY * (dirLen * 0.06);

        // Bề ngang bàn tay đo qua các đốt ngón (knuckle span)
        const handSpan = Math.hypot(lmIndex.x - lmPinky.x, lmIndex.y - lmPinky.y);

        // Góc xoay cẳng tay so với trục dọc
        const angleRad = Math.atan2(dirNormY, dirNormX) - Math.PI / 2;
        const angleDeg = Math.max(-80, Math.min(80, Math.round(angleRad * (180 / Math.PI))));

        // Chuyển đổi tọa độ Normalized (0..1) sang tọa độ màn hình Fullscreen với CSS object-cover
        const sw = window.innerWidth;
        const sh = window.innerHeight;
        const video = videoRef.current;
        const vw = (video && video.videoWidth) ? video.videoWidth : 1280;
        const vh = (video && video.videoHeight) ? video.videoHeight : 720;
        const videoAspect = vw / vh;
        const screenAspect = sw / sh;

        let renderW, renderH, offX, offY;
        if (screenAspect < videoAspect) {
          // Màn hình điện thoại dọc: video bị cắt 2 bên trái/phải
          renderH = sh;
          renderW = sh * videoAspect;
          offX = (renderW - sw) / 2;
          offY = 0;
        } else {
          // Màn hình ngang: video bị cắt trên/dưới
          renderW = sw;
          renderH = sw / videoAspect;
          offX = 0;
          offY = (renderH - sh) / 2;
        }

        let screenX = creaseNormX * renderW - offX;
        let screenY = creaseNormY * renderH - offY;

        // Nếu là camera trước thì lật gương ngang
        if (facingMode === 'user') {
          screenX = sw - screenX;
        }

        // Bề rộng cổ tay thực tế trên màn hình (knuckle span x 0.88 khớp chuẩn với chu vi ngấn cổ tay)
        const rawWristPx = handSpan * renderW * 0.88;
        const wristWidthPx = Math.max(75, Math.min(sw * 0.68, Math.round(rawWristPx)));
        const conf = 96;

        setDetectedWrist({
          screenX: Math.round(screenX),
          screenY: Math.round(screenY),
          wristWidthPx,
          angle: angleDeg,
          confidence: conf
        });
        setTrackingConfidence(conf);

        lockStreakRef.current += 1;
        if (lockStreakRef.current >= 2 && !isWristLocked) {
          setIsWristLocked(true);
          setTrackingFeedback('🔒 Đã Ghim Cứng Cổ Tay (100%)');
        }

        // Kích hoạt animation khi phát hiện tay lần đầu
        if (prevConfRef.current < 50 && conf >= 70) {
          triggerWearAnimation();
        }
        prevConfRef.current = conf;

        if (isAutoTracking) {
          // Thuật toán Ghim Cứng (Deadband Filter)
          setArAngle(prev => {
            const delta = angleDeg - prev;
            if (Math.abs(delta) < 3.0) return prev;
            return Number((prev + delta * 0.35).toFixed(1));
          });
        }
      });

      handsRef.current = hands;
    } catch (err) {
      console.warn('MediaPipe hands init error:', err);
    }

    return () => {
      if (handsRef.current) {
        try { handsRef.current.close(); } catch {}
        handsRef.current = null;
      }
    };
  }, [mediaPipeLoaded, facingMode, isAutoTracking, isWristLocked]);

  // 3. Vòng lặp gửi frame video tới MediaPipe Hands (25 FPS)
  useEffect(() => {
    if (!cameraActive || modalMode !== 'ar_tryon') return;

    let animId = null;
    let lastTime = 0;

    const loop = async (time) => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        if (time - lastTime > 40) { // ~25 FPS
          lastTime = time;
          if (handsRef.current) {
            try {
              await handsRef.current.send({ image: videoRef.current });
            } catch {}
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [cameraActive, modalMode]);

  // Hàm chụp ảnh Shutter phong cách iPhone Camera
  const handleShutterClick = async () => {
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 220);

    if (modalMode === 'wrist') {
      await handleCaptureWrist();
      return;
    }

    if (!videoRef.current) return;
    const video = videoRef.current;
    const sw = window.innerWidth;
    const sh = window.innerHeight;

    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = sw;
    snapCanvas.height = sh;
    const ctx = snapCanvas.getContext('2d');

    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;
    const videoAspect = vw / vh;
    const screenAspect = sw / sh;

    let renderW, renderH, offX, offY;
    if (screenAspect < videoAspect) {
      renderH = sh;
      renderW = sh * videoAspect;
      offX = (renderW - sw) / 2;
      offY = 0;
    } else {
      renderW = sw;
      renderH = sw / videoAspect;
      offX = 0;
      offY = (renderH - sh) / 2;
    }

    ctx.save();
    if (facingMode === 'user') {
      ctx.translate(sw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, -offX, -offY, renderW, renderH);
    ctx.restore();

    // Ghép lớp vòng tay SVG lên ảnh chụp
    const svgEl = document.getElementById('ar-bracelet-svg');
    if (svgEl) {
      try {
        const svgXml = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
        const DOMURL = window.URL || window.webkitURL || window;
        const url = DOMURL.createObjectURL(svgBlob);
        const svgImg = new Image();
        svgImg.onload = () => {
          ctx.drawImage(svgImg, 0, 0, sw, sh);
          DOMURL.revokeObjectURL(url);
          const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.94);
          setArCapturedSnapshot(dataUrl);
          setSnapshotModalOpen(true);
        };
        svgImg.onerror = () => {
          const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.94);
          setArCapturedSnapshot(dataUrl);
          setSnapshotModalOpen(true);
        };
        svgImg.src = url;
      } catch {
        const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.94);
        setArCapturedSnapshot(dataUrl);
        setSnapshotModalOpen(true);
      }
    } else {
      const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.94);
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
    setTrackingFeedback('Chạm kéo thủ công để chỉnh vị trí...');
  };

  const handlePointerMove = (e) => {
    if (!isDraggingOverlay) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    setArOffsetX(Math.max(-200, Math.min(200, Math.round(dragStartRef.current.startOffX + dx))));
    setArOffsetY(Math.max(-200, Math.min(200, Math.round(dragStartRef.current.startOffY + dy))));
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
  }, [isOpen]);

  const startCamera = async (facing = facingMode) => {
    try {
      setCameraError('');
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Không thể truy cập camera. Bạn hãy cấp quyền hoặc tải ảnh lên.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleCaptureWrist = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);
    stopCamera();
    handleAnalyzeWrist(dataUrl);
  };

  const handleFileUploadWrist = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setCapturedImage(dataUrl);
      stopCamera();
      handleAnalyzeWrist(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeWrist = async (imageData) => {
    setIsAnalyzingWrist(true);
    setWristError('');
    setWristResult(null);

    try {
      const res = await api.analyzeWrist({
        imageBase64: imageData,
        birthYear: birthYear ? parseInt(birthYear) : undefined,
        userNotes
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

  const handlePivotToMatchFromWrist = () => {
    if (!capturedImage) return;
    setMatchImage(capturedImage);
    setModalMode('catalog_match');
    setMatchNotes(userNotes || 'Gợi ý bản phối hợp với màu sắc bức ảnh này');
    handleMatchBeadsAndCharms(capturedImage);
  };

  const handleApplyPreset = (preset) => {
    if (preset && onApplyCustomPreset) {
      onApplyCustomPreset(preset);
      stopCamera();
      onClose();
    }
  };

  if (!isOpen) return null;

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
              <span>🎯 Bám Cổ Tay: {trackingConfidence}%</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span>Đưa cổ tay trần vào camera...</span>
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

            {/* REAL-TIME FULLSCREEN 3D BRACELET SVG OVERLAY */}
            {(() => {
              const b = availableBracelets[arSelectedBracelet] || availableBracelets[0];

              // Tâm vòng tay neo trực tiếp vào tọa độ pixel màn hình phát hiện được
              const baseCenterX = detectedWrist ? detectedWrist.screenX : (viewportSize.w / 2);
              const baseCenterY = detectedWrist ? detectedWrist.screenY : (viewportSize.h * 0.46);

              const cx = baseCenterX + arOffsetX;
              const cy = baseCenterY + arOffsetY;

              // Bề rộng cổ tay thực tế được đo từ Camera MediaPipe
              const wristWidthPx = (detectedWrist && detectedWrist.wristWidthPx)
                ? detectedWrist.wristWidthPx
                : Math.min(viewportSize.w * 0.40, 160);

              const armBaseRadius = wristWidthPx * 0.50;
              const fitScale = arSizeCm / 15.5;
              const rx = armBaseRadius * fitScale;
              const sagFactor = Math.max(0, Math.min(1, (arSizeCm - 14) / 5));
              const ry = rx * (0.30 + sagFactor * 0.08);

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
                const baseRadius = (item.isFlower ? 9.5 : (item.isSpacer ? 3.4 : 6.0)) * (rx / 70);
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
                <div className="absolute inset-0 pointer-events-none">
                  <svg id="ar-bracelet-svg" viewBox={`0 0 ${viewportSize.w} ${viewportSize.h}`} className="w-full h-full filter drop-shadow-xl">
                    <defs>
                      <style>{`
                        @keyframes smoothWearSlide {
                          0% {
                            transform: translateY(-85px) scale(1.35);
                            opacity: 0.20;
                          }
                          35% {
                            transform: translateY(-30px) scale(1.20);
                            opacity: 0.90;
                          }
                          70% {
                            transform: translateY(6px) scale(0.96);
                            opacity: 1;
                          }
                          85% {
                            transform: translateY(-2px) scale(1.02);
                            opacity: 1;
                          }
                          100% {
                            transform: translateY(0px) scale(1.00);
                            opacity: 1;
                          }
                        }

                        @keyframes charmWearSway {
                          0% { transform: rotate(0deg); }
                          22% { transform: rotate(-24deg); }
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
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" />
                      </filter>
                      <filter id="beadDropShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
                        <feOffset dx="0" dy="2.5" result="offsetblur" />
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.50" />
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
                        transition: isDraggingOverlay ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
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
                          strokeWidth={Math.max(1.5, rx * 0.035)}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.60"
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
                                        rx={bead.rxBead * 0.28}
                                        ry={bead.ryBead * 0.22}
                                        fill="#FFF5F7"
                                        opacity="0.65"
                                      />
                                    </g>
                                  );
                                })}
                                <circle cx="0" cy="0" r={bead.radius * 0.42} fill="url(#sakuraCenterGrad)" stroke="#B8860B" strokeWidth="0.8" />
                                <circle cx="-0.8" cy="-0.8" r={bead.radius * 0.16} fill="#FFFFFF" opacity="0.9" />
                              </g>
                            ) : bead.isPearl ? (
                              <g transform={`translate(${bead.x}, ${bead.y})`}>
                                <ellipse
                                  cx="0"
                                  cy="0"
                                  rx={bead.rxBead}
                                  ry={bead.ryBead}
                                  fill="url(#pearlLusterGrad)"
                                  stroke="#C9BEB2"
                                  strokeWidth="0.5"
                                  filter="url(#beadDropShadow)"
                                />
                                <ellipse
                                  cx={-bead.rxBead * 0.26}
                                  cy={-bead.ryBead * 0.26}
                                  rx={bead.rxBead * 0.38}
                                  ry={bead.ryBead * 0.28}
                                  fill="#FFFFFF"
                                  opacity="0.88"
                                />
                              </g>
                            ) : bead.isCrystal ? (
                              <g transform={`translate(${bead.x}, ${bead.y})`}>
                                <ellipse
                                  cx="0"
                                  cy="0"
                                  rx={bead.rxBead}
                                  ry={bead.ryBead}
                                  fill="url(#crystalGrad)"
                                  stroke="#8F78B0"
                                  strokeWidth="0.5"
                                  filter="url(#beadDropShadow)"
                                />
                                <polygon
                                  points={`0,${-bead.ryBead * 0.7} ${bead.rxBead * 0.6},0 0,${bead.ryBead * 0.7} ${-bead.rxBead * 0.6},0`}
                                  fill="#FFFFFF"
                                  opacity="0.35"
                                />
                                <circle cx={-bead.rxBead * 0.28} cy={-bead.ryBead * 0.28} r={bead.radius * 0.24} fill="#FFFFFF" opacity="0.9" />
                              </g>
                            ) : bead.isSpacer ? (
                              <g transform={`translate(${bead.x}, ${bead.y})`}>
                                <ellipse
                                  cx="0"
                                  cy="0"
                                  rx={bead.rxBead}
                                  ry={bead.ryBead}
                                  fill="url(#goldSpacerGrad)"
                                  stroke="#A87A1E"
                                  strokeWidth="0.6"
                                  filter="url(#beadDropShadow)"
                                />
                                <ellipse
                                  cx={-bead.rxBead * 0.22}
                                  cy={-bead.ryBead * 0.22}
                                  rx={bead.rxBead * 0.40}
                                  ry={bead.ryBead * 0.25}
                                  fill="#FFFDE8"
                                  opacity="0.9"
                                />
                              </g>
                            ) : bead.isCharm && bead.charmImage ? (
                              <g transform={`translate(${bead.x}, ${bead.y})`}>
                                <image
                                  href={bead.charmImage}
                                  x={-bead.radius * 1.5}
                                  y={-bead.radius * 1.5}
                                  width={bead.radius * 3}
                                  height={bead.radius * 3}
                                  filter="url(#beadDropShadow)"
                                />
                              </g>
                            ) : (
                              <g transform={`translate(${bead.x}, ${bead.y})`}>
                                <ellipse
                                  cx="0"
                                  cy="0"
                                  rx={bead.rxBead}
                                  ry={bead.ryBead}
                                  fill={bead.color}
                                  stroke={darkenColor(bead.color, 0.2)}
                                  strokeWidth="0.5"
                                  filter="url(#beadDropShadow)"
                                />
                                <ellipse
                                  cx={-bead.rxBead * 0.26}
                                  cy={-bead.ryBead * 0.26}
                                  rx={bead.rxBead * 0.40}
                                  ry={bead.ryBead * 0.30}
                                  fill="#FFFFFF"
                                  opacity="0.55"
                                />
                              </g>
                            )}
                          </g>
                        ))}

                        {/* 4. Charm rủ lủng lẳng ở giữa vòng tay */}
                        {b.charmName && !b.isFloralModel && (
                          <g
                            transform={`translate(${cx}, ${cy + ry})`}
                            style={{
                              transformOrigin: '0px 0px',
                              animation: isWearingAnim ? 'charmWearSway 1.15s cubic-bezier(0.25, 1, 0.5, 1) forwards' : 'none'
                            }}
                          >
                            <line x1="0" y1="0" x2="0" y2={10 * (rx / 70)} stroke="#E5C158" strokeWidth="1.8" strokeLinecap="round" />
                            <circle cx="0" cy="1" r="2.2" fill="#E5C158" />
                            {renderArCharmSvg(b.selectedCharm || { id: 'charm-flower-kv' }, rx / 70)}
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
        {/* MODE 1: QUÉT CỔ TAY ĐO SIZE                                               */}
        {/* ========================================================================= */}
        {modalMode === 'wrist' && (
          <div className="relative w-full max-w-md px-6 text-center pointer-events-auto">
            {isAnalyzingWrist ? (
              <div className="bg-black/75 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 border-t-transparent animate-spin flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
                </div>
                <h4 className="font-serif-boutique text-lg font-bold text-amber-200 mb-1">
                  AI GEMINI ĐANG ĐO SIZE CỔ TAY...
                </h4>
                <p className="text-xs text-stone-300">
                  Phân tích chu vi xương cổ tay & gợi ý bản mệnh phong thủy
                </p>
              </div>
            ) : wristResult ? (
              <div className="bg-[#FAF7F2] text-[#26211C] p-6 rounded-3xl border border-[#E8DFD3] shadow-2xl text-left animate-scaleUp">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm">Kết Quả Đo Cổ Tay</span>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                    AI Vision
                  </span>
                </div>
                <div className="text-center py-2 bg-amber-50 rounded-2xl mb-4 border border-amber-200">
                  <p className="text-xs text-stone-600">Chu vi cổ tay ước tính</p>
                  <p className="text-3xl font-serif-boutique font-bold text-[#B86244]">
                    {wristResult.estimatedWristSizeCm ? `${wristResult.estimatedWristSizeCm} cm` : (wristResult.wristSizeRecommendation || '15.5 cm')}
                  </p>
                  <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                    {wristResult.wristShapeDescription || 'Dáng cổ tay thon vừa, dễ đeo các mẫu hạt 8mm'}
                  </p>
                </div>
                {wristResult.menhAnalysis && (
                  <div className="mb-4 text-xs text-stone-700 space-y-1 bg-white p-3 rounded-xl border border-stone-150">
                    <p><span className="font-bold text-stone-900">Bản mệnh:</span> {wristResult.menhAnalysis.menh} ({wristResult.menhAnalysis.canChi})</p>
                    <p><span className="font-bold text-stone-900">Màu may mắn:</span> {wristResult.menhAnalysis.favorableColors?.join(', ')}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setArSizeCm(wristResult.estimatedWristSizeCm || parseWristSizeCm(wristResult.wristSizeRecommendation));
                      setModalMode('ar_tryon');
                      triggerWearAnimation();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Ướm Vòng Theo Size Này</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWristResult(null);
                      setCapturedImage(null);
                      startCamera(facingMode);
                    }}
                    className="py-3 px-4 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-xs cursor-pointer"
                  >
                    Đo Lại
                  </button>
                </div>
              </div>
            ) : (
              <div className="pointer-events-none">
                <div className="w-64 h-64 mx-auto rounded-3xl border-2 border-dashed border-amber-300/60 flex flex-col items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
                  <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 mb-2">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-white">ĐẶT CỔ TAY VÀO ĐÂY</p>
                  <p className="text-[10px] text-white/70 mt-1">Giữ thẳng cẳng tay & bấm nút chụp bên dưới</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: PHỐI ẢNH AI TỪ TRANG PHỤC / Ý TƯỞNG                              */}
        {/* ========================================================================= */}
        {modalMode === 'catalog_match' && (
          <div className="relative w-full max-w-md px-6 text-center pointer-events-auto">
            {isMatchingBeads ? (
              <div className="bg-black/75 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 border-t-transparent animate-spin flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
                </div>
                <h4 className="font-serif-boutique text-lg font-bold text-amber-200 mb-1">
                  AI ĐANG PHỐI MÀU VÒNG TAY...
                </h4>
                <p className="text-xs text-stone-300">
                  Trích xuất tông màu trang phục & tìm hạt đá tương sinh
                </p>
              </div>
            ) : matchResult ? (
              <div className="bg-[#FAF7F2] text-[#26211C] p-6 rounded-3xl border border-[#E8DFD3] shadow-2xl text-left animate-scaleUp max-h-[75vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
                  <span className="font-bold text-sm">Gợi Ý Bản Phối AI</span>
                  <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full">
                    {matchResult.matchedColorTheme || 'Tone Sur Tone'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mb-3">
                  {matchResult.stylingAdvice || 'Màu sắc rất hợp với trang phục của bạn.'}
                </p>
                {matchResult.suggestedPresets && matchResult.suggestedPresets.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {matchResult.suggestedPresets.map((preset, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-2xl border border-stone-200 flex items-center justify-between">
                        <div>
                          <p className="font-serif-boutique font-bold text-sm text-[#26211C]">{preset.name}</p>
                          <p className="text-[11px] text-stone-500">{preset.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="px-3 py-1.5 rounded-xl bg-[#B86244] text-white font-bold text-xs cursor-pointer shrink-0"
                        >
                          Chọn
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setMatchResult(null); setMatchImage(null); }}
                  className="w-full py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-xs cursor-pointer"
                >
                  Chọn Ảnh Khác
                </button>
              </div>
            ) : (
              <div className="bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl">
                <h4 className="font-serif-boutique text-base font-bold text-amber-200 mb-2">
                  Tải Ảnh Trang Phục Hoặc Phong Cách
                </h4>
                <p className="text-xs text-stone-300 mb-4">
                  Chụp hoặc tải ảnh bộ đồ bạn dự định mặc để AI phối vòng đồng điệu màu sắc.
                </p>
                <div className="flex gap-2">
                  <label className="flex-1 py-3 px-4 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Chọn Ảnh Có Sẵn</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setMatchImage(ev.target.result);
                          handleMatchBeadsAndCharms(ev.target.result);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current) {
                        const v = videoRef.current;
                        const c = canvasRef.current || document.createElement('canvas');
                        c.width = v.videoWidth || 640;
                        c.height = v.videoHeight || 480;
                        c.getContext('2d').drawImage(v, 0, 0);
                        const d = c.toDataURL('image/jpeg', 0.88);
                        setMatchImage(d);
                        handleMatchBeadsAndCharms(d);
                      }
                    }}
                    className="py-3 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Chụp Ngay</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. iPhone Bottom Control Deck (Glassmorphism & Authentic iOS Camera Layout) */}
      <div className="relative z-30 w-full pb-6 pt-3 px-4 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-auto flex flex-col items-center gap-3">
        {/* HÀNG 1: Lens / Size Selector (.5x, 1x, 2x) */}
        {modalMode === 'ar_tryon' && (
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md p-1 rounded-full border border-white/15 shadow-inner">
            {[
              { size: 14.5, label: '.5x', desc: '14.5cm Ôm Sát' },
              { size: 15.5, label: '1x', desc: '15.5cm Nữ Chuẩn' },
              { size: 17.5, label: '2x', desc: '17.5cm Buông Lơi' }
            ].map((lens) => (
              <button
                key={lens.size}
                type="button"
                onClick={() => {
                  setArSizeCm(lens.size);
                  setUserCustomSize(lens.size);
                  triggerWearAnimation();
                }}
                className={`w-9 h-9 rounded-full text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  Math.abs(arSizeCm - lens.size) < 0.4
                    ? 'bg-amber-400 text-black shadow-md scale-105'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={lens.desc}
              >
                {lens.label}
              </button>
            ))}
          </div>
        )}

        {/* HÀNG 2: Băng chuyền chọn vòng tay ngang (Horizontal Carousel) */}
        {modalMode === 'ar_tryon' && (
          <div className="w-full max-w-md overflow-x-auto no-scrollbar py-1 flex items-center gap-3 px-2">
            {availableBracelets.map((bracelet, idx) => (
              <button
                key={bracelet.id}
                type="button"
                onClick={() => {
                  setArSelectedBracelet(idx);
                  triggerWearAnimation();
                }}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full shrink-0 transition-all border cursor-pointer ${
                  arSelectedBracelet === idx
                    ? 'bg-white/25 border-amber-400 text-white ring-2 ring-amber-400/40 shadow-lg scale-105'
                    : 'bg-black/40 border-white/10 text-stone-300 hover:bg-white/10'
                }`}
              >
                <div 
                  className="w-5 h-5 rounded-full border border-white/40 shrink-0 shadow-sm"
                  style={{ backgroundColor: bracelet.beadColor || '#F7C6D0' }}
                />
                <span className="text-xs font-semibold whitespace-nowrap">
                  {bracelet.name.replace(/\(.*?\)/g, '')}
                </span>
                <span className="text-[11px] font-bold text-amber-300">
                  {formatPrice(bracelet.price)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* HÀNG 3: Chuyển Chế Độ Chữ Vàng iOS (Đo Size, Ướm Vòng 3D, Phối Ảnh) */}
        <div className="flex items-center justify-center gap-6 text-[12px] font-bold tracking-wider uppercase pt-1">
          <button
            type="button"
            onClick={() => {
              setModalMode('wrist');
              startCamera(facingMode);
            }}
            className={`transition-colors cursor-pointer ${
              modalMode === 'wrist' ? 'text-amber-400' : 'text-stone-400 hover:text-white'
            }`}
          >
            Đo Size Cổ Tay
          </button>

          <button
            type="button"
            onClick={() => {
              setModalMode('ar_tryon');
              startCamera(facingMode);
              triggerWearAnimation();
            }}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              modalMode === 'ar_tryon' ? 'text-amber-400' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ướm Vòng 3D AR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setModalMode('catalog_match');
              stopCamera();
            }}
            className={`transition-colors cursor-pointer ${
              modalMode === 'catalog_match' ? 'text-amber-400' : 'text-stone-400 hover:text-white'
            }`}
          >
            Phối Ảnh AI
          </button>
        </div>

        {/* HÀNG 4: Nút Chụp Ảnh Shutter iPhone Lớn & Nút Phụ */}
        <div className="w-full max-w-sm flex items-center justify-between px-6 pt-1">
          {/* Nút góc trái: Tải ảnh cổ tay lên */}
          <button
            type="button"
            onClick={() => nativeCameraWristRef.current?.click()}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer shadow-md"
            title="Tải ảnh từ thư viện máy"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* NÚT CHỤP IPHONE SHUTTER LỚN */}
          <button
            type="button"
            onClick={handleShutterClick}
            className="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center transition-all active:scale-92 shadow-2xl cursor-pointer"
            title={modalMode === 'wrist' ? 'Chụp ảnh để AI đo size' : 'Chụp ảnh khoảnh khắc ướm vòng'}
          >
            <div className="w-full h-full rounded-full bg-white transition-all hover:bg-stone-200 active:bg-stone-400 shadow-inner" />
          </button>

          {/* Nút góc phải: Đặt mua ngay hoặc xem giỏ hàng */}
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
                note: `Đặt từ AR Camera Live (Size ${arSizeCm}cm)`
              });
              setArAddedSuccess(true);
              setTimeout(() => setArAddedSuccess(false), 2500);
            }}
            className="w-12 h-12 rounded-full bg-[#B86244] hover:bg-[#A05237] text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg relative"
            title="Thêm vòng này vào giỏ hàng"
          >
            <ShoppingBag className="w-5 h-5" />
            {arAddedSuccess && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold flex items-center justify-center text-white animate-bounce">
                ✓
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 6. Settings Drawer (Bảng Tinh Chỉnh Thủ Công) */}
      {showSettingsDrawer && modalMode === 'ar_tryon' && (
        <div className="absolute top-16 right-4 z-40 w-72 bg-black/85 backdrop-blur-xl border border-white/20 rounded-3xl p-4 text-white shadow-2xl pointer-events-auto animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-white/15 mb-3">
            <span className="font-serif-boutique font-bold text-xs text-amber-300">TINH CHỈNH VÒNG TAY</span>
            <button
              type="button"
              onClick={() => setShowSettingsDrawer(false)}
              className="text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-stone-300">Size Cổ Tay</span>
                <span className="font-bold text-amber-300">{arSizeCm} cm</span>
              </div>
              <input
                type="range"
                min="13.5"
                max="19.0"
                step="0.5"
                value={arSizeCm}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setArSizeCm(val);
                  setUserCustomSize(val);
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-stone-300">Xoay Nghiêng</span>
                <span className="font-bold text-amber-300">{arAngle}°</span>
              </div>
              <input
                type="range"
                min="-75"
                max="75"
                step="1"
                value={arAngle}
                onChange={(e) => setArAngle(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setArOffsetX(0);
                  setArOffsetY(0);
                  setArAngle(0);
                  setIsAutoTracking(true);
                  triggerWearAnimation();
                }}
                className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-[11px] font-semibold cursor-pointer"
              >
                Đặt Lại Tâm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal Xem Ảnh Snapshot Sau Khi Chụp */}
      {snapshotModalOpen && arCapturedSnapshot && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-[#1C1714] border border-amber-400/40 rounded-3xl p-4 shadow-2xl flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setSnapshotModalOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg">
              <img src={arCapturedSnapshot} alt="Snapshot Ướm Vòng" className="w-full h-auto object-cover" />
            </div>
            <div className="w-full flex flex-col gap-2 pt-1">
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
