import React, { useState, useRef, useEffect } from 'react';
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
  Compass
} from 'lucide-react';
import { api } from '../../services/api';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

export default function AICameraModal({ isOpen, onClose, onApplyCustomPreset, initialMode = 'wrist' }) {
  if (!isOpen) return null;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const nativeCameraWristRef = useRef(null);
  const matchFileInputRef = useRef(null);
  const nativeCameraMatchRef = useRef(null);

  // Active Tab / Mode: 'wrist' | 'catalog_match'
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

  // Sync initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalMode(initialMode || 'wrist');
      if (initialMode === 'wrist') {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#26211C] text-white px-5 sm:px-7 py-4 flex items-center justify-between border-b border-[#3D352E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#B86244] to-amber-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-boutique text-lg sm:text-xl font-bold tracking-wide">
                  AI STYLIST VÒNG TAY NHÀ ZY
                </h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider hidden sm:inline-block">
                  Gemini Flash Vision
                </span>
              </div>
              <p className="text-[11px] text-[#CFC1B0]">
                Cố vấn thị giác đo chu vi cổ tay & gợi ý phối vòng từ kho hạt, charm thủ công có sẵn
              </p>
            </div>
          </div>

          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#CFC1B0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#EFE7DC] px-4 sm:px-6 py-2.5 flex items-center gap-2 border-b border-[#E0D4C5]">
          <button
            onClick={() => {
              setModalMode('wrist');
              if (!capturedImage) startCamera();
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              modalMode === 'wrist'
                ? 'bg-[#26211C] text-white shadow-sm'
                : 'bg-white/60 text-[#6B6258] hover:bg-white hover:text-[#26211C]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-amber-300" />
            <span>1. Quét Cổ Tay Đo Size</span>
          </button>

          <button
            onClick={() => {
              setModalMode('catalog_match');
              stopCamera();
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              modalMode === 'catalog_match'
                ? 'bg-[#B86244] text-white shadow-sm'
                : 'bg-white/60 text-[#6B6258] hover:bg-white hover:text-[#26211C]'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-200" />
            <span>2. Tải Ảnh Gợi Ý Phối (Hạt & Charm Có Sẵn)</span>
            <span className="text-[9px] bg-amber-400 text-[#26211C] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
              MỚI
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 max-h-[78vh] overflow-y-auto space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: QUÉT CỔ TAY ĐO SIZE                                                */}
          {/* ========================================================================= */}
          {modalMode === 'wrist' && (
            <div>
              {wristError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{wristError}</span>
                </div>
              )}

              {/* Result View for Wrist */}
              {wristResult ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Trường hợp 1: Không phải cổ tay */}
                  {wristResult.isValidWrist === false ? (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-300">
                        <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                          <span>Hình ảnh chưa phát hiện cổ tay hoặc vòng tay!</span>
                        </div>
                        <button
                          onClick={() => {
                            setWristResult(null);
                            setCapturedImage(null);
                            startCamera();
                          }}
                          className="text-xs text-amber-900 hover:text-amber-700 font-semibold underline"
                        >
                          Chụp / Tải ảnh khác
                        </button>
                      </div>

                      {/* Nút Pivot nhanh sang gợi ý phối hạt/charm từ ảnh này */}
                      <div className="p-4 bg-gradient-to-r from-amber-100 via-rose-50 to-amber-100 rounded-2xl border border-amber-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="space-y-0.5 text-left">
                          <p className="text-xs font-bold text-[#845339] flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <span>Bạn muốn lấy cảm hứng phối vòng từ bức ảnh này?</span>
                          </p>
                          <p className="text-[11px] text-[#A05237]">
                            AI có thể bóc tách màu sắc, hoa văn từ ảnh này để chọn hạt đá và charm đang có sẵn tại xưởng!
                          </p>
                        </div>
                        <button
                          onClick={handlePivotToMatchFromWrist}
                          className="w-full sm:w-auto px-4 py-2.5 bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <Palette className="w-3.5 h-3.5 text-amber-200" />
                          <span>Phối Hạt/Charm Từ Ảnh Này</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-4 space-y-3">
                          <div className="aspect-square rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-[#26211C] relative">
                            <img 
                              src={capturedImage} 
                              alt="Ảnh người dùng gửi" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center p-3">
                              <span className="bg-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow">
                                ⚠️ Không phải cổ tay
                              </span>
                            </div>
                          </div>
                          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-950 space-y-1">
                            <p>🔍 AI nhận diện: <strong className="text-[#26211C]">{wristResult.detectedObject || 'Hình ảnh khác'}</strong></p>
                            <p>⚠️ Trạng thái: <span className="text-amber-700 font-semibold">Chưa phát hiện cổ tay</span></p>
                          </div>
                        </div>

                        <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-[#E8DFD3] shadow-sm space-y-4">
                          <h4 className="font-serif-boutique text-lg font-bold text-[#26211C] border-b border-[#F3ECE1] pb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            Lời Nhắn Từ Nghệ Nhân Vòng Tay Nhà Zy
                          </h4>

                          <div className="text-xs sm:text-sm text-[#26211C] leading-relaxed whitespace-pre-line bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFD3]">
                            {wristResult.analysis}
                          </div>

                          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                            <p className="font-bold text-amber-950">💡 Để AI nhận diện chính xác size tay & tone da của bạn:</p>
                            <p>1. Hướng camera trực diện vào <strong>cổ tay</strong> hoặc <strong>bàn tay</strong>.</p>
                            <p>2. Đặt tay nơi có ánh sáng rõ ràng, nền đơn sắc.</p>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => {
                                setWristResult(null);
                                setCapturedImage(null);
                                startCamera();
                              }}
                              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#26211C] hover:bg-[#3D352E] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                            >
                              <Camera className="w-4 h-4" />
                              <span>Chụp Lại Ảnh Cổ Tay</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Trường hợp 2: Cổ tay chuẩn xác */
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-[#EDF3EF] rounded-2xl border border-[#D0E2D7]">
                        <div className="flex items-center gap-2 text-[#4E6857] font-bold text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>AI Gemini Vision đã nhận diện chính xác cổ tay của bạn!</span>
                        </div>
                        <button
                          onClick={() => {
                            setWristResult(null);
                            setCapturedImage(null);
                            startCamera();
                          }}
                          className="text-xs text-[#6B6258] hover:text-[#26211C] font-semibold underline"
                        >
                          Chụp lại ảnh khác
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-4 space-y-3">
                          <div className="aspect-square rounded-2xl overflow-hidden border-2 border-[#E8DFD3] shadow-md bg-[#26211C]">
                            <img 
                              src={capturedImage} 
                              alt="Ảnh cổ tay chụp từ camera" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-[#E8DFD3] text-[11px] text-[#6B6258] space-y-1">
                            <p>✓ Đối tượng: <strong className="text-[#26211C]">{wristResult.detectedObject || 'Cổ tay chuẩn xác'}</strong></p>
                            <p>✓ Mô hình: <strong>{wristResult.model || 'Gemini Flash AI'}</strong></p>
                          </div>
                        </div>

                        <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-[#E8DFD3] shadow-sm space-y-4">
                          <h4 className="font-serif-boutique text-xl font-bold text-[#26211C] border-b border-[#F3ECE1] pb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            Lời Khuyên Chuyên Gia Stylist & Nghệ Nhân Phong Thủy
                          </h4>

                          {(wristResult.skinTone || wristResult.wristType || wristResult.existingBracelet) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3] text-xs">
                              {wristResult.skinTone && (
                                <div>
                                  <span className="text-[#8C8276] text-[10px] block">🎨 Tone da thực tế:</span>
                                  <strong className="text-[#26211C] text-[11px]">{wristResult.skinTone}</strong>
                                </div>
                              )}
                              {wristResult.wristType && (
                                <div>
                                  <span className="text-[#8C8276] text-[10px] block">📏 Dáng & size ước tính:</span>
                                  <strong className="text-[#26211C] text-[11px]">{wristResult.wristType}</strong>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="text-xs sm:text-sm text-[#26211C] leading-relaxed whitespace-pre-line space-y-2">
                            {wristResult.analysis}
                          </div>

                          <div className="pt-4 border-t border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-3">
                            <button
                              onClick={() => {
                                setWristResult(null);
                                setCapturedImage(null);
                                startCamera();
                              }}
                              className="px-4 py-2.5 rounded-xl border border-[#E8DFD3] text-xs font-semibold text-[#6B6258] hover:bg-[#FAF7F2]"
                            >
                              ← Chụp Lại Cổ Tay
                            </button>

                            <button
                              onClick={() => handleApplyPreset(wristResult.presetConfig)}
                              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-xs sm:text-sm shadow-artisan-hover transition-all flex items-center justify-center gap-2"
                            >
                              <Flower2 className="w-4 h-4 text-amber-200" />
                              <span>Áp Dụng Thiết Kế Vào Xưởng Tự Phối</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Camera & Input Form for Wrist */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-7 flex flex-col items-center justify-center">
                    <div className="relative w-full aspect-square max-w-[380px] rounded-2xl overflow-hidden bg-[#26211C] border-2 border-[#E8DFD3] shadow-lg flex items-center justify-center">
                      {capturedImage ? (
                        <img 
                          src={capturedImage} 
                          alt="Ảnh đã chụp" 
                          className="w-full h-full object-cover" 
                        />
                      ) : cameraActive ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          {/* Flip Camera Button */}
                          <button
                            onClick={toggleFacingMode}
                            className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 hover:bg-black/80 transition-all border border-white/20 shadow-md cursor-pointer"
                            title="Đổi camera trước hoặc sau"
                          >
                            <RefreshCw className="w-3 h-3 text-amber-300" />
                            <span>{facingMode === 'environment' ? 'Cam Sau' : 'Cam Trước'}</span>
                          </button>

                          <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-3xl pointer-events-none flex items-center justify-center">
                            <div className="text-center bg-black/40 backdrop-blur-sm p-3 rounded-xl">
                              <p className="text-white text-xs font-semibold">
                                ĐẶT CỔ TAY VÀO KHUNG NÀY
                              </p>
                              <p className="text-[10px] text-amber-200 mt-0.5">
                                Để AI quét màu da và đo size tay
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-5 space-y-3">
                          <div className="w-12 h-12 rounded-full bg-white/10 text-amber-300 flex items-center justify-center mx-auto">
                            <Camera className="w-6 h-6" />
                          </div>
                          <p className="text-xs text-[#E8DFD3] max-w-xs mx-auto leading-relaxed">
                            {cameraError || 'Camera trực tiếp chưa được bật hoặc bị chặn quyền truy cập.'}
                          </p>
                          <div className="flex flex-col gap-2 max-w-xs mx-auto pt-1">
                            <button
                              onClick={() => nativeCameraWristRef.current?.click()}
                              className="w-full py-2.5 px-4 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Camera className="w-4 h-4 text-amber-200" />
                              <span>📸 Mở Camera Điện Thoại Chụp Ngay</span>
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startCamera(facingMode)}
                                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium border border-white/20 cursor-pointer"
                              >
                                Bật Lại Live Cam
                              </button>
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium border border-white/20 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Thư Viện Ảnh</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <canvas ref={canvasRef} className="hidden" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4 w-full max-w-[380px]">
                      {capturedImage ? (
                        <button
                          onClick={() => {
                            setCapturedImage(null);
                            startCamera(facingMode);
                          }}
                          className="flex-1 py-2.5 rounded-xl border border-[#E8DFD3] bg-white text-[#26211C] text-xs font-semibold hover:bg-[#F3ECE1] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-[#B86244]" />
                          Chụp Lại Ảnh Khác
                        </button>
                      ) : cameraActive ? (
                        <>
                          <button
                            onClick={handleCaptureWrist}
                            className="flex-1 py-3 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold shadow-artisan-hover flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                            Chụp Khung Hình Này
                          </button>
                          <button
                            onClick={() => nativeCameraWristRef.current?.click()}
                            className="py-3 px-3.5 rounded-xl bg-[#26211C] hover:bg-[#3D352E] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            title="Mở ứng dụng chụp ảnh gốc của thiết bị"
                          >
                            <Camera className="w-3.5 h-3.5 text-amber-300" />
                            <span className="hidden sm:inline">Camera Máy</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => nativeCameraWristRef.current?.click()}
                          className="flex-1 py-3 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-amber-200" />
                          <span>📸 Chụp Bằng Camera Máy</span>
                        </button>
                      )}

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2.5 px-3.5 rounded-xl border border-[#E8DFD3] bg-white text-[#6B6258] hover:text-[#26211C] text-xs font-semibold hover:bg-[#F3ECE1] flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        title="Tải ảnh từ điện thoại / máy tính"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Thư Viện Ảnh</span>
                      </button>

                      {/* Native camera input - always supported on iOS Safari and Android */}
                      <input
                        ref={nativeCameraWristRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUploadWrist}
                        className="hidden"
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUploadWrist}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Form input */}
                  <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-[#E8DFD3] space-y-4 flex flex-col justify-between shadow-sm">
                    <div className="space-y-3">
                      <h4 className="font-serif-boutique text-lg font-bold text-[#26211C] border-b border-[#F3ECE1] pb-2">
                        Thông Tin Bổ Sung
                      </h4>

                      <div>
                        <label className="text-xs font-semibold text-[#26211C] block mb-1">
                          Năm sinh của bạn (tính ngũ hành bản mệnh):
                        </label>
                        <input
                          type="number"
                          placeholder="Ví dụ: 2000, 1998, 1995..."
                          value={birthYear}
                          onChange={(e) => setBirthYear(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-[#E8DFD3] bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#26211C] block mb-1">
                          Bạn mong muốn cầu điều gì nhất?
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Ví dụ: Cầu tình duyên ngọt ngào, may mắn thi cử, hoặc hợp phong cách hoa cúc pastel..."
                          value={userNotes}
                          onChange={(e) => setUserNotes(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-[#E8DFD3] bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                        />
                      </div>

                      <div className="p-3 bg-[#FAF4ED] rounded-xl border border-[#EADBCC] text-[11px] text-[#845339] space-y-1">
                        <p className="font-bold flex items-center gap-1 text-[#B86244]">
                          <Zap className="w-3.5 h-3.5" /> Công Nghệ Đo Thật 100%:
                        </p>
                        <p>
                          AI phân tích trực tiếp độ rộng xương cổ tay và màu da thật, đề xuất mẫu đan dây macrame và hạt phong thủy tương hợp.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleAnalyzeWrist}
                      disabled={isAnalyzingWrist || (!capturedImage && !userNotes)}
                      className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                        isAnalyzingWrist
                          ? 'bg-amber-600 text-white cursor-wait'
                          : !capturedImage && !userNotes
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#B86244] to-[#C09A58] hover:opacity-95 text-white shadow-artisan-hover'
                      }`}
                    >
                      {isAnalyzingWrist ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>AI Gemini Đang Phân Tích Cổ Tay...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-200" />
                          <span>Bắt Đầu Nhận Diện & Tư Vấn Bằng AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TẢI ẢNH GỢI Ý PHỐI TỪ HẠT & CHARM CÓ SẴN (NEW FEATURE)              */}
          {/* ========================================================================= */}
          {modalMode === 'catalog_match' && (
            <div>
              {matchError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{matchError}</span>
                </div>
              )}

              {/* Result View for Bead Matching */}
              {matchResult ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Status Banner */}
                  <div className="p-4 bg-[#EDF3EF] rounded-2xl border border-[#D0E2D7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[#4E6857] font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>AI đã phối thành công mẫu vòng từ hạt & charm có sẵn trong kho!</span>
                    </div>
                    <button
                      onClick={() => {
                        setMatchResult(null);
                        setMatchImage(null);
                      }}
                      className="text-xs text-[#6B6258] hover:text-[#26211C] font-semibold underline text-left sm:text-right"
                    >
                      ← Tải / Phối ảnh khác
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Image & Extracted Color Palette */}
                    <div className="lg:col-span-4 space-y-4">
                      <div className="aspect-square rounded-2xl overflow-hidden border-2 border-[#E8DFD3] shadow-md bg-[#26211C] relative">
                        {matchImage && (
                          <img 
                            src={matchImage} 
                            alt="Ảnh cảm hứng người dùng tải lên" 
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl text-white text-[11px] truncate">
                          🌸 <strong>Cảm hứng:</strong> {matchResult.detectedTheme || 'Ảnh duy mỹ'}
                        </div>
                      </div>

                      {/* Color Palette extracted */}
                      {matchResult.colorPalette && matchResult.colorPalette.length > 0 && (
                        <div className="p-3.5 bg-white rounded-2xl border border-[#E8DFD3] shadow-2xs space-y-2">
                          <span className="text-[11px] uppercase tracking-wider text-[#8C8276] font-bold block">
                            Bảng Màu Trích Xuất Từ Ảnh:
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {matchResult.colorPalette.map((hex, idx) => (
                              <div key={idx} className="flex items-center gap-1 bg-[#FAF7F2] px-2 py-1 rounded-lg border border-[#E8DFD3]">
                                <div 
                                  className="w-4 h-4 rounded-full border border-black/10 shadow-inner"
                                  style={{ backgroundColor: hex }}
                                />
                                <span className="text-[10px] font-mono text-[#6B6258]">{hex}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price summary badge */}
                      <div className="p-4 bg-gradient-to-br from-[#FAF4ED] to-[#F3ECE1] rounded-2xl border border-[#EADBCC] text-center space-y-1">
                        <span className="text-[11px] text-[#8C8276] block">Tổng Giá Trị Dự Kiến (Chuẩn 21 hạt):</span>
                        <div className="font-serif-boutique text-2xl font-bold text-[#B86244]">
                          {formatPrice(matchResult.estimatedPrice)}
                        </div>
                        <span className="text-[10px] text-[#6B6258] block">
                          Đã gồm: Dây dệt + Hạt đá + Charm + Công thắt thủ công
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Matched in-stock Components & Story */}
                    <div className="lg:col-span-8 space-y-4">
                      {/* Design Title & Vibe */}
                      <div className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F3ECE1] pb-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B86244] bg-[#FAF4ED] px-2.5 py-0.5 rounded-full border border-[#EADBCC]">
                              Bản Phối Độc Quyền Xưởng Vòng Tay Nhà Zy
                            </span>
                            <h4 className="font-serif-boutique text-2xl font-bold text-[#26211C] mt-1">
                              {matchResult.designName}
                            </h4>
                          </div>
                          <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            100% Có Sẵn Trong Kho
                          </span>
                        </div>

                        {/* 4 Cards: Primary Bead, Secondary Bead, Charm, Cord */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {/* 1. Hạt Đá Chính */}
                          <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3] flex items-start gap-3 hover:border-amber-300 transition-colors">
                            <div 
                              className="w-9 h-9 rounded-full shrink-0 shadow-md border-2 border-white mt-0.5"
                              style={{ backgroundColor: matchResult.primaryBead?.color || '#EAA9A9' }}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-[#B86244] uppercase tracking-wider block">
                                Hạt Đá Chủ Đạo (15 hạt)
                              </span>
                              <h5 className="font-bold text-xs text-[#26211C] truncate">
                                {matchResult.primaryBead?.name}
                              </h5>
                              <p className="text-[11px] text-[#6B6258] line-clamp-1">
                                {matchResult.primaryBead?.desc}
                              </p>
                              <span className="text-[10px] font-semibold text-[#8C8276]">
                                {formatPrice(matchResult.primaryBead?.pricePerBead)}/hạt
                              </span>
                            </div>
                          </div>

                          {/* 2. Hạt Đá Phụ */}
                          <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3] flex items-start gap-3 hover:border-amber-300 transition-colors">
                            <div 
                              className="w-9 h-9 rounded-full shrink-0 shadow-md border-2 border-white mt-0.5"
                              style={{ backgroundColor: matchResult.secondaryBead?.color || '#73B4C8' }}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-[#4E6857] uppercase tracking-wider block">
                                Hạt Phối Xen Kẽ (6 hạt)
                              </span>
                              <h5 className="font-bold text-xs text-[#26211C] truncate">
                                {matchResult.secondaryBead?.name}
                              </h5>
                              <p className="text-[11px] text-[#6B6258] line-clamp-1">
                                {matchResult.secondaryBead?.desc}
                              </p>
                              <span className="text-[10px] font-semibold text-[#8C8276]">
                                {formatPrice(matchResult.secondaryBead?.pricePerBead)}/hạt
                              </span>
                            </div>
                          </div>

                          {/* 3. Charm Điểm Nhấn */}
                          <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3] flex items-start gap-3 hover:border-amber-300 transition-colors">
                            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border-2 border-white shadow-md mt-0.5">
                              <Sparkle className="w-4 h-4 text-[#B86244]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                                Charm Điểm Nhấn
                              </span>
                              <h5 className="font-bold text-xs text-[#26211C] truncate">
                                {matchResult.charm?.name}
                              </h5>
                              <p className="text-[11px] text-[#6B6258] line-clamp-1">
                                {matchResult.charm?.desc}
                              </p>
                              <span className="text-[10px] font-semibold text-[#8C8276]">
                                {formatPrice(matchResult.charm?.price)}
                              </span>
                            </div>
                          </div>

                          {/* 4. Dây Dệt Đan Tay */}
                          <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3] flex items-start gap-3 hover:border-amber-300 transition-colors">
                            <div 
                              className="w-9 h-9 rounded-full shrink-0 shadow-md border-2 border-white mt-0.5"
                              style={{ backgroundColor: matchResult.cord?.color || '#F7F3EB' }}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-[#6B6258] uppercase tracking-wider block">
                                Dây Dệt Thủ Công
                              </span>
                              <h5 className="font-bold text-xs text-[#26211C] truncate">
                                {matchResult.cord?.name}
                              </h5>
                              <p className="text-[11px] text-[#6B6258] line-clamp-1">
                                {matchResult.cord?.description}
                              </p>
                              <span className="text-[10px] font-semibold text-[#8C8276]">
                                {formatPrice(matchResult.cord?.price)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Thuyết minh nghệ nhân */}
                        <div className="pt-3 border-t border-[#F3ECE1] space-y-2">
                          <h6 className="text-xs font-bold text-[#26211C] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Lời Bình Nghệ Nhân Stylist:</span>
                          </h6>
                          <p className="text-xs sm:text-sm text-[#5A5147] leading-relaxed bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DFD3]">
                            {matchResult.explanation}
                          </p>
                        </div>

                        {/* Vibe phong thủy */}
                        {matchResult.fengShuiVibe && (
                          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                            <Compass className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-amber-950 block">Ý nghĩa năng lượng & phong thủy:</strong>
                              <span>{matchResult.fengShuiVibe}</span>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="pt-4 border-t border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-3">
                          <button
                            onClick={() => {
                              setMatchResult(null);
                              setMatchImage(null);
                            }}
                            className="px-4 py-2.5 rounded-xl border border-[#E8DFD3] text-xs font-semibold text-[#6B6258] hover:bg-[#FAF7F2] w-full sm:w-auto"
                          >
                            ← Thử Ảnh Khác
                          </button>

                          <button
                            onClick={() => handleApplyPreset(matchResult.presetConfig)}
                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#B86244] to-[#C09A58] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-artisan-hover transition-all flex items-center justify-center gap-2"
                          >
                            <Flower2 className="w-4 h-4 text-amber-200" />
                            <span>Áp Dụng Bản Phối Vào Xưởng Tự Phối Ngay</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Uploader & Input Form for Bead/Charm Matching */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Image Upload Area */}
                  <div className="md:col-span-7 flex flex-col items-center justify-center">
                    <div 
                      onClick={() => matchFileInputRef.current?.click()}
                      className="relative w-full aspect-square max-w-[380px] rounded-2xl overflow-hidden bg-[#FAF7F2] border-2 border-dashed border-[#B86244]/40 hover:border-[#B86244] shadow-sm flex flex-col items-center justify-center cursor-pointer group transition-all p-6 text-center"
                    >
                      {matchImage ? (
                        <>
                          <img 
                            src={matchImage} 
                            alt="Ảnh bạn vừa tải lên" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white/90 text-[#26211C] text-xs font-bold px-3 py-1.5 rounded-xl shadow">
                              Bấm để thay ảnh khác
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-16 h-16 rounded-full bg-[#B86244]/10 text-[#B86244] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#26211C]">
                              Bấm vào đây để tải ảnh hoặc chụp ảnh mẫu
                            </p>
                            <p className="text-xs text-[#8C8276] mt-1">
                              Hỗ trợ chụp trực tiếp từ camera hoặc tải ảnh từ máy
                            </p>
                          </div>
                          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                nativeCameraMatchRef.current?.click();
                              }}
                              className="px-3 py-1.5 rounded-full bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>📸 Mở Camera Chụp Ngay</span>
                            </button>
                            <span className="text-[11px] bg-white px-3 py-1 rounded-full border border-[#E8DFD3] text-[#B86244] font-semibold">
                              🌸 Ảnh hoa, váy, charm
                            </span>
                          </div>
                        </div>
                      )}

                      <input
                        ref={matchFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUploadMatch}
                        className="hidden"
                      />
                      <input
                        ref={nativeCameraMatchRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUploadMatch}
                        className="hidden"
                      />
                    </div>

                    <div className="flex items-center gap-2 mt-3 w-full max-w-[380px]">
                      {matchImage ? (
                        <button
                          onClick={() => setMatchImage(null)}
                          className="flex-1 py-2 rounded-xl border border-[#E8DFD3] bg-white text-xs font-semibold text-[#6B6258] hover:bg-[#FAF7F2] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-[#B86244]" />
                          Xóa & Chọn Ảnh Khác
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => nativeCameraMatchRef.current?.click()}
                            className="flex-1 py-2.5 rounded-xl bg-[#26211C] hover:bg-[#3D352E] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5 text-amber-200" />
                            <span>📸 Camera Máy</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => matchFileInputRef.current?.click()}
                            className="flex-1 py-2.5 rounded-xl border border-[#E8DFD3] bg-white text-[#26211C] text-xs font-semibold hover:bg-[#F3ECE1] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#B86244]" />
                            <span>Thư Viện Ảnh</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Form input */}
                  <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-[#E8DFD3] space-y-4 flex flex-col justify-between shadow-sm">
                    <div className="space-y-3">
                      <div className="border-b border-[#F3ECE1] pb-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#B86244]">
                          Kho Hàng Thực Tế
                        </span>
                        <h4 className="font-serif-boutique text-lg font-bold text-[#26211C]">
                          Ý Tưởng & Phong Cách Phối
                        </h4>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#26211C] block mb-1">
                          Bạn thích vòng tay theo phong cách nào? (Tùy chọn)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Ví dụ: Phối tone pastel dịu dàng đi biển, phong cách vintage thanh lịch đi làm, hợp màu hoa trong ảnh..."
                          value={matchNotes}
                          onChange={(e) => setMatchNotes(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-[#E8DFD3] bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                        />
                      </div>

                      <div className="p-3.5 bg-[#FAF4ED] rounded-xl border border-[#EADBCC] text-[11px] text-[#845339] space-y-1.5">
                        <p className="font-bold flex items-center gap-1.5 text-[#B86244]">
                          <Sparkles className="w-3.5 h-3.5" /> Chỉ chọn từ hàng có sẵn:
                        </p>
                        <p className="text-[#6B6258] leading-relaxed">
                          AI sẽ đối chiếu các loại hạt (Thạch Anh Dâu, Moonstone, Lam Ngọc, Ngọc Bích...) và charm (Cá Voi Pastel, Hoa Cúc, Bướm Hologram...) đang có tại xưởng để đưa ra bản phối <strong>chắc chắn đặt làm được ngay</strong>.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMatchBeadsAndCharms()}
                      disabled={isMatchingBeads || (!matchImage && !matchNotes)}
                      className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                        isMatchingBeads
                          ? 'bg-amber-600 text-white cursor-wait'
                          : !matchImage && !matchNotes
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#B86244] to-[#C09A58] hover:opacity-95 text-white shadow-artisan-hover'
                      }`}
                    >
                      {isMatchingBeads ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>AI Gemini Đang Phân Tích & Đối Soát Kho...</span>
                        </>
                      ) : (
                        <>
                          <Palette className="w-4 h-4 text-amber-200" />
                          <span>Gợi Ý Phối Từ Hạt & Charm Có Sẵn</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
