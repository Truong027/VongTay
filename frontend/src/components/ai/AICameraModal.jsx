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
  Sliders,
  Flower2
} from 'lucide-react';
import { api } from '../../services/api';

export default function AICameraModal({ isOpen, onClose, onApplyCustomPreset }) {
  if (!isOpen) return null;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraError, setCameraError] = useState('');

  // Start webcam
  const startCamera = async () => {
    setCameraError('');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } else {
        setCameraError('Trình duyệt không hỗ trợ truy cập camera trực tiếp. Bạn có thể tải ảnh chụp cánh tay từ máy tính/điện thoại.');
      }
    } catch (err) {
      console.warn('Lỗi mở camera:', err);
      setCameraError('Không thể mở camera (chưa cấp quyền hoặc không có thiết bị). Bạn hãy chọn tải ảnh từ máy nhé!');
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

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  // Capture frame from webcam
  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Upload image fallback
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setErrorMsg('');
    startCamera();
  };

  // Call Gemini Vision via backend
  const handleAnalyzeWithAI = async () => {
    if (!capturedImage && !userNotes) {
      setErrorMsg('Vui lòng chụp ảnh hoặc điền thông tin để AI tư vấn.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');

    try {
      const res = await api.analyzeWrist({
        imageBase64: capturedImage,
        userNotes,
        birthYear
      });

      if (res.success && res.data) {
        setAnalysisResult(res.data);
      } else {
        throw new Error(res.message || 'Không nhận được kết quả từ AI');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi gửi hình ảnh lên AI Gemini. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyPreset = () => {
    if (analysisResult?.presetConfig && onApplyCustomPreset) {
      onApplyCustomPreset(analysisResult.presetConfig);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#26211C] text-white px-6 py-4 flex items-center justify-between border-b border-[#3D352E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#B86244] to-amber-500 flex items-center justify-center text-white shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-boutique text-xl font-bold tracking-wide">
                  AI STYLIST: QUÉT CỔ TAY & TƯ VẤN VÒNG TAY
                </h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Gemini Flash AI
                </span>
              </div>
              <p className="text-[11px] text-[#CFC1B0]">
                Nhận diện màu da, chu vi cổ tay và đề xuất mẫu vòng phong thủy, charm hoa Nàng Handmade tương hợp
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

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto space-y-6">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* VIEW 1: RESULT VIEW */}
          {analysisResult ? (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex items-center justify-between p-4 bg-[#EDF3EF] rounded-2xl border border-[#D0E2D7]">
                <div className="flex items-center gap-2 text-[#4E6857] font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>AI Gemini Vision đã phân tích thành công cổ tay của bạn!</span>
                </div>
                <button
                  onClick={handleRetake}
                  className="text-xs text-[#6B6258] hover:text-[#26211C] font-semibold underline"
                >
                  Chụp lại ảnh khác
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Captured Image preview */}
                <div className="md:col-span-4 space-y-3">
                  <div className="aspect-square rounded-2xl overflow-hidden border-2 border-[#E8DFD3] shadow-md bg-[#26211C]">
                    <img 
                      src={capturedImage} 
                      alt="Ảnh cổ tay chụp từ camera" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E8DFD3] text-[11px] text-[#6B6258] space-y-1">
                    <p>✓ Phân tích bởi mô hình: <strong>{analysisResult.model || 'Gemini 3.6 Flash'}</strong></p>
                    <p>✓ Cảm hứng phối đá: <strong>KhánhVyMade x Nàng Handmade</strong></p>
                  </div>
                </div>

                {/* Analysis Report text */}
                <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-[#E8DFD3] shadow-sm space-y-4">
                  <h4 className="font-serif-boutique text-xl font-bold text-[#26211C] border-b border-[#F3ECE1] pb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Lời Khuyên Chuyên Gia Stylist & Nghệ Nhân Phong Thủy
                  </h4>

                  <div className="text-xs sm:text-sm text-[#26211C] leading-relaxed whitespace-pre-line space-y-2">
                    {analysisResult.analysis}
                  </div>

                  {/* Apply to customizer action */}
                  <div className="pt-4 border-t border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      onClick={handleRetake}
                      className="px-4 py-2.5 rounded-xl border border-[#E8DFD3] text-xs font-semibold text-[#6B6258] hover:bg-[#FAF7F2]"
                    >
                      ← Chụp Lại Cổ Tay
                    </button>

                    <button
                      onClick={handleApplyPreset}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-xs sm:text-sm shadow-artisan-hover transition-all flex items-center justify-center gap-2"
                    >
                      <Flower2 className="w-4 h-4 text-amber-200" />
                      <span>Áp Dụng Thiết Kế Vào Xưởng Tự Phối Ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* VIEW 2: CAMERA CAPTURE / UPLOAD VIEW */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Camera / Photo Window */}
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
                      {/* Wrist targeting guide overlay */}
                      <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-3xl pointer-events-none flex items-center justify-center">
                        <div className="text-center bg-black/40 backdrop-blur-sm p-3 rounded-xl">
                          <p className="text-white text-xs font-semibold">
                            ĐẶT CỔ TAY / CÁNH TAY VÀO ĐÂY
                          </p>
                          <p className="text-[10px] text-amber-200 mt-0.5">
                            Để AI quét tone da và vòng tay chính xác
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-3">
                      <Camera className="w-12 h-12 text-[#8C8276] mx-auto opacity-50" />
                      <p className="text-xs text-[#CFC1B0] max-w-xs">
                        {cameraError || 'Camera đang tắt hoặc chưa kết nối.'}
                      </p>
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 rounded-xl bg-[#B86244] text-white text-xs font-semibold hover:bg-[#A05237]"
                      >
                        Thử Bật Lại Camera
                      </button>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Camera Trigger Buttons */}
                <div className="flex items-center gap-3 mt-4 w-full max-w-[380px]">
                  {capturedImage ? (
                    <button
                      onClick={handleRetake}
                      className="flex-1 py-2.5 rounded-xl border border-[#E8DFD3] bg-white text-[#26211C] text-xs font-semibold hover:bg-[#F3ECE1] flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Chụp Lại Ảnh Khác
                    </button>
                  ) : cameraActive ? (
                    <button
                      onClick={handleCapture}
                      className="flex-1 py-3 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white text-xs font-bold shadow-artisan-hover flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Chụp Ngay Cổ Tay Này
                    </button>
                  ) : null}

                  {/* File Upload Option */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-4 rounded-xl border border-[#E8DFD3] bg-white text-[#6B6258] hover:text-[#26211C] text-xs font-semibold hover:bg-[#F3ECE1] flex items-center gap-1.5"
                    title="Tải ảnh từ điện thoại / máy tính"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải Ảnh Lên</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Side Parameters & Preferences */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-[#E8DFD3] space-y-4 flex flex-col justify-between shadow-sm">
                <div className="space-y-3">
                  <h4 className="font-serif-boutique text-lg font-bold text-[#26211C] border-b border-[#F3ECE1] pb-2">
                    Thông Tin Bổ Sung (Tùy Chọn)
                  </h4>

                  <div>
                    <label className="text-xs font-semibold text-[#26211C] block mb-1">
                      Năm sinh của bạn (để tính ngũ hành chính xác):
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
                      placeholder="Ví dụ: Cầu tình duyên ngọt ngào, may mắn thi cử, cầu bình an tĩnh tâm, hoặc thích phong cách mặt hoa cúc Nàng Handmade..."
                      value={userNotes}
                      onChange={(e) => setUserNotes(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#E8DFD3] bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                    />
                  </div>

                  <div className="p-3 bg-[#FAF4ED] rounded-xl border border-[#EADBCC] text-[11px] text-[#845339] space-y-1">
                    <p className="font-bold flex items-center gap-1 text-[#B86244]">
                      <Zap className="w-3.5 h-3.5" /> AI Gemini Vision 3.6 Flash:
                    </p>
                    <p>
                      Mô hình AI sẽ tự động trích xuất quang phổ màu da trên cổ tay, nhận diện đường gân tay để gợi ý màu đá thạch anh, ngọc bích và charm phù hợp tôn dáng nhất.
                    </p>
                  </div>
                </div>

                {/* Submit AI Analysis Button */}
                <button
                  onClick={handleAnalyzeWithAI}
                  disabled={isAnalyzing || (!capturedImage && !userNotes)}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                    isAnalyzing
                      ? 'bg-amber-600 text-white cursor-wait'
                      : !capturedImage && !userNotes
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#B86244] to-[#C09A58] hover:opacity-95 text-white shadow-artisan-hover'
                  }`}
                >
                  {isAnalyzing ? (
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
      </div>
    </div>
  );
}
