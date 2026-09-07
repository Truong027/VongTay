import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  ShoppingBag, 
  RotateCcw, 
  Check, 
  Ruler, 
  Info,
  Flower2,
  Clover,
  Type,
  Moon,
  Coins,
  HeartHandshake,
  BellRing
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

const charmIconMap = {
  Flower2: Flower2,
  Clover: Clover,
  Type: Type,
  Moon: Moon,
  Coins: Coins,
  HeartHandshake: HeartHandshake,
  BellRing: BellRing
};

export default function BraceletStudio({ isOpen, onClose, onOpenSizeGuide, initialPreset }) {
  if (!isOpen) return null;

  const { addToCart } = useCart();
  
  // Customizer options from backend (with fallbacks)
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);

  // User selections
  const [selectedCord, setSelectedCord] = useState(null);
  const [selectedMainBead, setSelectedMainBead] = useState(null);
  const [selectedSecondaryBead, setSelectedSecondaryBead] = useState(null);
  const [selectedCharm, setSelectedCharm] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [customLetter, setCustomLetter] = useState('A');
  const [customNote, setCustomNote] = useState('');
  const [activeStep, setActiveStep] = useState('cord'); // cord | bead | charm | size
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.getCustomizerOptions();
        if (res.success && res.data) {
          setOptions(res.data);
          
          const defaultCord = (initialPreset?.cordId && res.data.cords.find(c => c.id === initialPreset.cordId)) || res.data.cords[0];
          const defaultBead = (initialPreset?.mainBeadId && res.data.beads.find(b => b.id === initialPreset.mainBeadId)) || res.data.beads[0];
          const defaultCharm = (initialPreset?.charmId && res.data.charms.find(c => c.id === initialPreset.charmId)) || res.data.charms[0];
          const defaultSize = (initialPreset?.sizeId && res.data.sizes.find(s => s.id === initialPreset.sizeId)) || res.data.sizes[1];

          setSelectedCord(defaultCord);
          setSelectedMainBead(defaultBead);
          setSelectedCharm(defaultCharm);
          setSelectedSize(defaultSize);
          if (initialPreset?.mainBeadId) setActiveStep('bead');
        }
      } catch (err) {
        console.error('Error fetching customizer options:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [initialPreset]);

  // Calculate live price
  const priceData = useMemo(() => {
    if (!selectedCord || !selectedMainBead || !selectedSize) return { total: 0, cordCost: 0, beadCost: 0, charmCost: 0, craftFee: 30000 };
    
    const count = selectedSize.beadCount || 21;
    let beadCost = 0;

    if (selectedSecondaryBead) {
      const mainCount = Math.ceil(count * 0.7);
      const secCount = count - mainCount;
      beadCost = (mainCount * selectedMainBead.pricePerBead) + (secCount * selectedSecondaryBead.pricePerBead);
    } else {
      beadCost = count * selectedMainBead.pricePerBead;
    }

    const cordCost = selectedCord.price || 0;
    const charmCost = selectedCharm ? selectedCharm.price : 0;
    const craftFee = 30000;

    return {
      total: cordCost + beadCost + charmCost + craftFee,
      cordCost,
      beadCost,
      charmCost,
      craftFee,
      beadCount: count
    };
  }, [selectedCord, selectedMainBead, selectedSecondaryBead, selectedCharm, selectedSize]);

  // Generate SVG Bead coordinates around circle
  const beadPositions = useMemo(() => {
    const count = selectedSize?.beadCount || 21;
    const radius = 130;
    const cx = 175;
    const cy = 160;
    const positions = [];

    for (let i = 0; i < count; i++) {
      // Leave bottom center (approx angle 90 deg) for the charm
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      
      // Determine bead color: main or secondary
      let beadColor = selectedMainBead?.color || '#EAA9A9';
      let isSec = false;

      if (selectedSecondaryBead) {
        // Every 3rd bead or split pattern
        if (i % 3 === 0) {
          beadColor = selectedSecondaryBead.color;
          isSec = true;
        }
      }

      positions.push({ x, y, beadColor, isSec, index: i });
    }
    return positions;
  }, [selectedSize, selectedMainBead, selectedSecondaryBead]);

  const handleAddCustomToCart = () => {
    const customBracelet = {
      id: `custom-bracelet-${Date.now()}`,
      name: `Vòng Tay Tự Phối: ${selectedMainBead?.name} & ${selectedCharm?.name || 'Charm Thủ Công'}`,
      price: priceData.total,
      images: ['/images/products/bracelet-strawberry-quartz.webp'], // preview representation
      leadTime: 'Làm thủ công 2-3h'
    };

    addToCart(customBracelet, 1, {
      isCustom: true,
      wristSize: selectedSize?.label || '15 - 16 cm',
      note: customNote,
      customDetails: {
        cord: selectedCord?.name,
        mainBead: selectedMainBead?.name,
        secondaryBead: selectedSecondaryBead ? selectedSecondaryBead.name : 'Không xen kẽ',
        charm: selectedCharm?.name,
        letter: selectedCharm?.id === 'charm-initial' ? customLetter : null,
        size: selectedSize?.label,
        beadCount: priceData.beadCount
      }
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  if (loading || !options) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="p-8 bg-white rounded-2xl shadow-xl flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#B86244] animate-spin" />
          <span className="text-[#26211C] font-medium">Đang chuẩn bị xưởng tự phối vòng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-5xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#26211C] text-white px-6 py-4 flex items-center justify-between border-b border-[#3D352E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#B86244] flex items-center justify-center text-amber-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-boutique text-xl font-bold tracking-wide">
                XƯỞNG TỰ PHỐI VÒNG TAY (CUSTOM STUDIO)
              </h3>
              <p className="text-[11px] text-[#CFC1B0]">
                Tự chọn từng loại dây, hạt màu sắc và phụ kiện gốm hoa thủ công theo ý thích
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#CFC1B0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[82vh] overflow-y-auto">
          
          {/* Left: 2D Interactive Live Visual Canvas / SVG */}
          <div className="lg:col-span-5 bg-[#F3ECE1] p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[#E8DFD3] relative">
            
            <div className="text-center mb-2">
              <span className="text-[10px] uppercase tracking-widest text-[#B86244] font-bold bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#E8DFD3]">
                Mô Phỏng Trực Quan Thời Gian Thực
              </span>
            </div>

            {/* Bracelet SVG Ring Simulation */}
            <div className="relative w-[320px] h-[320px] sm:w-[350px] sm:h-[350px] flex items-center justify-center">
              <svg viewBox="0 0 350 350" className="w-full h-full drop-shadow-lg">
                <defs>
                  {/* Cord gradient */}
                  <linearGradient id="cordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={selectedCord?.color || '#6A4E36'} />
                    <stop offset="100%" stopColor="#26211C" />
                  </linearGradient>

                  {/* 3D Bead Radial Gradients */}
                  <radialGradient id="mainBeadGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                    <stop offset="40%" stopColor={selectedMainBead?.color || '#EAA9A9'} />
                    <stop offset="100%" stopColor="#1C1C1C" stopOpacity="0.85" />
                  </radialGradient>

                  <radialGradient id="secBeadGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                    <stop offset="40%" stopColor={selectedSecondaryBead?.color || '#73B4C8'} />
                    <stop offset="100%" stopColor="#1C1C1C" stopOpacity="0.85" />
                  </radialGradient>

                  {/* Silver 925 Charm metallic shine */}
                  <radialGradient id="silverShine" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="45%" stopColor="#D9D9D9" />
                    <stop offset="85%" stopColor="#8C8C8C" />
                    <stop offset="100%" stopColor="#4A4A4A" />
                  </radialGradient>
                </defs>

                {/* Cord circular thread underneath */}
                <circle
                  cx="175"
                  cy="160"
                  r="130"
                  fill="none"
                  stroke={selectedCord?.color || '#6A4E36'}
                  strokeWidth="4"
                  strokeDasharray={selectedCord?.id.includes('waxed') ? '6 2' : 'none'}
                />

                {/* Render Beads */}
                {beadPositions.map((pos) => (
                  <g key={pos.index}>
                    {/* Bead shadow */}
                    <circle
                      cx={pos.x + 1}
                      cy={pos.y + 2}
                      r="10.5"
                      fill="rgba(0,0,0,0.2)"
                    />
                    {/* Bead 3D sphere */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="10.5"
                      fill={pos.isSec ? "url(#secBeadGrad)" : "url(#mainBeadGrad)"}
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="0.5"
                    />
                    {/* Specular highlight glint */}
                    <circle
                      cx={pos.x - 3}
                      cy={pos.y - 3}
                      r="2.5"
                      fill="#FFFFFF"
                      opacity="0.6"
                    />
                  </g>
                ))}

                {/* Render Hanging Charm at bottom center (175, 290) */}
                {selectedCharm && (
                  <g transform="translate(175, 290)">
                    {/* Silver connector jump ring */}
                    <circle cx="0" cy="0" r="4.5" fill="none" stroke="url(#silverShine)" strokeWidth="2" />
                    <line x1="0" y1="4" x2="0" y2="10" stroke="url(#silverShine)" strokeWidth="2.5" />
                    
                    {/* Charm pendant body */}
                    <g transform="translate(0, 24)">
                      {selectedCharm.id === 'charm-whale-blue' ? (
                        <g filter="drop-shadow(0px 3px 4px rgba(0,0,0,0.25))">
                          {/* Cute Pastel Whale Charm */}
                          <path d="M -14 -2 C -12 -12 8 -12 14 -3 C 18 1 20 6 22 2 C 23 -1 24 7 20 8 C 14 10 0 12 -10 6 C -14 3 -16 1 -14 -2 Z" fill="#88C4E6" stroke="#FFFFFF" strokeWidth="1" />
                          <circle cx="-7" cy="-2" r="1.5" fill="#1C2D37" />
                          <circle cx="-8" cy="-3" r="0.5" fill="#FFFFFF" />
                          <path d="M -4 2 C -3 4 0 4 2 2" stroke="#4A7C9A" strokeWidth="1" fill="none" strokeLinecap="round" />
                        </g>
                      ) : selectedCharm.id === 'charm-mint-flower' || selectedCharm.id === 'charm-flower-nang' ? (
                        <g filter="drop-shadow(0px 3px 4px rgba(0,0,0,0.25))">
                          {/* Mint / Acrylic Flower Charm */}
                          <circle cx="-9" cy="-5" r="7" fill={selectedCharm.id === 'charm-mint-flower' ? '#A3E4D7' : '#F9D5E5'} opacity="0.9" />
                          <circle cx="9" cy="-5" r="7" fill={selectedCharm.id === 'charm-mint-flower' ? '#A3E4D7' : '#F9D5E5'} opacity="0.9" />
                          <circle cx="-6" cy="8" r="7" fill={selectedCharm.id === 'charm-mint-flower' ? '#A3E4D7' : '#F9D5E5'} opacity="0.9" />
                          <circle cx="6" cy="8" r="7" fill={selectedCharm.id === 'charm-mint-flower' ? '#A3E4D7' : '#F9D5E5'} opacity="0.9" />
                          <circle cx="0" cy="-10" r="7" fill={selectedCharm.id === 'charm-mint-flower' ? '#A3E4D7' : '#F9D5E5'} opacity="0.9" />
                          <circle cx="0" cy="0" r="6" fill="#F9E076" stroke="#E6C229" strokeWidth="1" />
                        </g>
                      ) : selectedCharm.id === 'charm-butterfly-hologram' ? (
                        <g filter="drop-shadow(0px 3px 4px rgba(0,0,0,0.25))">
                          {/* Hologram Butterfly Charm */}
                          <path d="M 0 0 C -8 -16 -18 -12 -16 0 C -15 8 -4 8 0 2 Z" fill="#D4CEEB" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.9" />
                          <path d="M 0 0 C 8 -16 18 -12 16 0 C 15 8 4 8 0 2 Z" fill="#D4CEEB" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.9" />
                          <path d="M 0 2 C -6 6 -12 14 -4 14 C 0 14 0 6 0 2 Z" fill="#BDE6C8" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
                          <path d="M 0 2 C 6 6 12 14 4 14 C 0 14 0 6 0 2 Z" fill="#BDE6C8" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
                          <line x1="0" y1="-8" x2="0" y2="8" stroke="#7A6F9B" strokeWidth="1.5" strokeLinecap="round" />
                        </g>
                      ) : (
                        <>
                          <circle cx="0" cy="0" r="14" fill="url(#silverShine)" stroke="#FFFFFF" strokeWidth="1" filter="drop-shadow(0px 3px 3px rgba(0,0,0,0.3))" />
                          {selectedCharm.id === 'charm-initial' ? (
                            <text x="0" y="5" textAnchor="middle" fill="#26211C" fontSize="13" fontWeight="bold" fontFamily="serif">
                              {customLetter}
                            </text>
                          ) : (
                            <text x="0" y="4" textAnchor="middle" fill="#26211C" fontSize="10" fontWeight="bold">
                              925
                            </text>
                          )}
                        </>
                      )}
                    </g>
                  </g>
                )}
              </svg>
            </div>

            {/* Visual Specs summary */}
            <div className="w-full mt-4 p-3 bg-white/90 rounded-2xl border border-[#E8DFD3] text-xs space-y-1.5 shadow-sm">
              <div className="flex justify-between">
                <span className="text-[#8C8276]">Dây đã chọn:</span>
                <span className="font-semibold text-[#26211C]">{selectedCord?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C8276]">Đá chủ đạo:</span>
                <span className="font-semibold text-[#26211C]">{selectedMainBead?.name}</span>
              </div>
              {selectedSecondaryBead && (
                <div className="flex justify-between">
                  <span className="text-[#8C8276]">Đá xen kẽ:</span>
                  <span className="font-semibold text-[#4E6857]">{selectedSecondaryBead.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#8C8276]">Charm đính kèm:</span>
                <span className="font-semibold text-[#B86244]">
                  {selectedCharm?.name} {selectedCharm?.id === 'charm-initial' ? `(${customLetter})` : ''}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#F3ECE1] pt-1 text-[#6B6258]">
                <span>Tổng hạt dự kiến:</span>
                <span className="font-bold text-[#26211C]">{priceData.beadCount} hạt</span>
              </div>
            </div>

          </div>

          {/* Right: Step-by-Step Customization Options */}
          <div className="lg:col-span-7 p-6 space-y-6 flex flex-col justify-between">
            
            {/* Step Navigation Tabs */}
            <div className="flex border-b border-[#E8DFD3] overflow-x-auto pb-1 gap-2 text-xs font-semibold">
              <button
                onClick={() => setActiveStep('cord')}
                className={`pb-2 px-3 whitespace-nowrap transition-all border-b-2 ${
                  activeStep === 'cord' 
                    ? 'border-[#B86244] text-[#B86244]' 
                    : 'border-transparent text-[#6B6258] hover:text-[#26211C]'
                }`}
              >
                1. Loại Dây ({selectedCord?.name.split(' ')[0]})
              </button>

              <button
                onClick={() => setActiveStep('bead')}
                className={`pb-2 px-3 whitespace-nowrap transition-all border-b-2 ${
                  activeStep === 'bead' 
                    ? 'border-[#B86244] text-[#B86244]' 
                    : 'border-transparent text-[#6B6258] hover:text-[#26211C]'
                }`}
              >
                2. Đá Quý & Hạt ({selectedMainBead?.name.split(' ')[0]})
              </button>

              <button
                onClick={() => setActiveStep('charm')}
                className={`pb-2 px-3 whitespace-nowrap transition-all border-b-2 ${
                  activeStep === 'charm' 
                    ? 'border-[#B86244] text-[#B86244]' 
                    : 'border-transparent text-[#6B6258] hover:text-[#26211C]'
                }`}
              >
                3. Charm & Phụ Kiện Thủ Công
              </button>

              <button
                onClick={() => setActiveStep('size')}
                className={`pb-2 px-3 whitespace-nowrap transition-all border-b-2 ${
                  activeStep === 'size' 
                    ? 'border-[#B86244] text-[#B86244]' 
                    : 'border-transparent text-[#6B6258] hover:text-[#26211C]'
                }`}
              >
                4. Size Cổ Tay & Hoàn Tất
              </button>
            </div>

            {/* TAB CONTENT: STEP 1 - CORD */}
            {activeStep === 'cord' && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <h4 className="font-serif-boutique text-lg font-bold text-[#26211C]">
                    Bước 1: Chọn chất liệu và kiểu dây kết
                  </h4>
                  <p className="text-xs text-[#6B6258]">
                    Dây thun co giãn dễ tháo đeo hàng ngày hoặc dây sáp đan thắt nút mộc mạc chống nước
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options.cords.map((cord) => (
                    <div
                      key={cord.id}
                      onClick={() => setSelectedCord(cord)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        selectedCord?.id === cord.id
                          ? 'border-[#B86244] bg-[#FBEFEA] shadow-sm'
                          : 'border-[#E8DFD3] bg-white hover:bg-[#F3ECE1]'
                      }`}
                    >
                      <div 
                        className="w-7 h-7 rounded-full border border-black/20 flex-shrink-0 shadow-inner mt-0.5"
                        style={{ backgroundColor: cord.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-xs text-[#26211C] truncate">{cord.name}</h5>
                          <span className="text-xs font-bold text-[#B86244]">{cord.price.toLocaleString('vi-VN')}₫</span>
                        </div>
                        <p className="text-[11px] text-[#6B6258] mt-0.5">{cord.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={() => setActiveStep('bead')}
                    className="px-5 py-2 rounded-xl bg-[#26211C] text-white text-xs font-medium hover:bg-[#3D352E]"
                  >
                    Tiếp Theo: Chọn Hạt Đá →
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: STEP 2 - BEADS */}
            {activeStep === 'bead' && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <h4 className="font-serif-boutique text-lg font-bold text-[#26211C]">
                    Bước 2: Chọn hạt đá tự nhiên phong thủy
                  </h4>
                  <p className="text-xs text-[#6B6258]">
                    Chọn loại đá chính và tùy chọn thêm đá phụ phối xen kẽ
                  </p>
                </div>

                {/* Main Bead Selector */}
                <div>
                  <label className="text-xs font-bold text-[#26211C] block mb-2">
                    1. Đá Chủ Đạo (Chiếm đa số vòng):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {options.beads.map((bead) => (
                      <button
                        key={bead.id}
                        type="button"
                        onClick={() => setSelectedMainBead(bead)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedMainBead?.id === bead.id
                            ? 'border-[#B86244] bg-[#FBEFEA] ring-1 ring-[#B86244]'
                            : 'border-[#E8DFD3] bg-white hover:bg-[#F3ECE1]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span 
                            className="w-5 h-5 rounded-full border border-black/15 shadow-sm block"
                            style={{ backgroundColor: bead.color }}
                          />
                          <span className="text-[10px] text-[#4E6857] font-semibold">Mệnh {bead.menh}</span>
                        </div>
                        <p className="font-bold text-xs text-[#26211C] leading-tight truncate">{bead.name}</p>
                        <p className="text-[11px] text-[#B86244] font-medium">{bead.pricePerBead.toLocaleString('vi-VN')}₫/hạt</p>
                        <p className="text-[10px] text-[#8C8276] truncate">{bead.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary Bead Selector (Optional) */}
                <div className="pt-2 border-t border-[#E8DFD3]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#26211C]">
                      2. Đá Phối Xen Kẽ (Tùy chọn cách 3 hạt điểm 1 hạt):
                    </label>
                    {selectedSecondaryBead && (
                      <button
                        onClick={() => setSelectedSecondaryBead(null)}
                        className="text-[11px] text-[#B86244] hover:underline"
                      >
                        Bỏ phối xen kẽ
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <button
                      onClick={() => setSelectedSecondaryBead(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex-shrink-0 ${
                        !selectedSecondaryBead ? 'border-[#B86244] bg-[#FBEFEA] text-[#B86244]' : 'bg-white text-[#6B6258]'
                      }`}
                    >
                      Không xen kẽ (Đơn sắc)
                    </button>
                    {options.beads.filter(b => b.id !== selectedMainBead?.id).map(bead => (
                      <button
                        key={bead.id}
                        onClick={() => setSelectedSecondaryBead(bead)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 flex-shrink-0 ${
                          selectedSecondaryBead?.id === bead.id
                            ? 'border-[#B86244] bg-[#FBEFEA] text-[#B86244]'
                            : 'bg-white text-[#26211C] hover:bg-[#F3ECE1]'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: bead.color }} />
                        <span>{bead.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => setActiveStep('cord')}
                    className="px-4 py-2 rounded-xl border border-[#E8DFD3] text-xs text-[#6B6258] hover:bg-white"
                  >
                    ← Quay lại Chọn Dây
                  </button>
                  <button
                    onClick={() => setActiveStep('charm')}
                    className="px-5 py-2 rounded-xl bg-[#26211C] text-white text-xs font-medium hover:bg-[#3D352E]"
                  >
                    Tiếp Theo: Chọn Charm →
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: STEP 3 - CHARM */}
            {activeStep === 'charm' && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <h4 className="font-serif-boutique text-lg font-bold text-[#26211C]">
                    Bước 3: Chọn charm & phụ kiện thủ công làm điểm nhấn
                  </h4>
                  <p className="text-xs text-[#6B6258]">
                    Charm gốm men pastel, hoa acrylic trong suốt và charm chuông phong cách thủ công mộc mạc
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options.charms.map((charm) => {
                    const IconComp = charmIconMap[charm.icon] || Sparkles;
                    const isSelected = selectedCharm?.id === charm.id;

                    return (
                      <div
                        key={charm.id}
                        onClick={() => setSelectedCharm(charm)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#B86244] bg-[#FBEFEA] shadow-sm'
                            : 'border-[#E8DFD3] bg-white hover:bg-[#F3ECE1]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E8DFD3] flex items-center justify-center text-[#B86244]">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-xs text-[#26211C] truncate">{charm.name}</h5>
                            <span className="text-xs font-bold text-[#B86244]">+{charm.price.toLocaleString('vi-VN')}₫</span>
                          </div>
                          <p className="text-[11px] text-[#6B6258] mt-0.5">{charm.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Initial engraving letter input if initial charm selected */}
                {selectedCharm?.id === 'charm-initial' && (
                  <div className="p-3 bg-white rounded-xl border border-[#B86244] space-y-2">
                    <label className="text-xs font-bold text-[#26211C] block">
                      Nhập chữ cái bạn muốn khắc (A - Z):
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        maxLength={1}
                        value={customLetter}
                        onChange={(e) => setCustomLetter(e.target.value.toUpperCase() || 'A')}
                        className="w-12 h-12 text-center text-xl font-bold uppercase rounded-xl border-2 border-[#B86244] bg-[#FAF7F2] focus:outline-none"
                      />
                      <p className="text-xs text-[#6B6258]">
                        Khắc tên của bạn hoặc người thương lên mặt charm thẻ mộc thủ công.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => setActiveStep('bead')}
                    className="px-4 py-2 rounded-xl border border-[#E8DFD3] text-xs text-[#6B6258] hover:bg-white"
                  >
                    ← Quay lại Chọn Hạt
                  </button>
                  <button
                    onClick={() => setActiveStep('size')}
                    className="px-5 py-2 rounded-xl bg-[#26211C] text-white text-xs font-medium hover:bg-[#3D352E]"
                  >
                    Tiếp Theo: Chọn Size Tay →
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: STEP 4 - SIZE & FINISH */}
            {activeStep === 'size' && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <h4 className="font-serif-boutique text-lg font-bold text-[#26211C]">
                    Bước 4: Chọn kích thước cổ tay & ghi chú nghệ nhân
                  </h4>
                  <p className="text-xs text-[#6B6258]">
                    Số lượng hạt đá sẽ tự động được điều chỉnh chuẩn xác theo chu vi cổ tay
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#26211C]">Chọn kích thước size tay:</span>
                    <button
                      onClick={onOpenSizeGuide}
                      className="text-[#B86244] font-medium hover:underline flex items-center gap-1"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      Xem bảng hướng dẫn đo
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {options.sizes.map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedSize?.id === sz.id
                            ? 'border-[#B86244] bg-[#FBEFEA] ring-1 ring-[#B86244]'
                            : 'border-[#E8DFD3] bg-white hover:bg-[#F3ECE1]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs text-[#26211C]">{sz.label}</p>
                          <span className="text-[10px] bg-[#FAF7F2] px-2 py-0.5 rounded text-[#B86244] font-semibold">
                            {sz.beadCount} hạt
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Note */}
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-semibold text-[#26211C]">
                    Ghi chú riêng cho nghệ nhân xâu vòng:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Đan thêm thắt nút bình an, gói hộp quà tặng kèm thiệp viết tay chúc mừng..."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                  />
                </div>

                <div className="p-3 bg-[#FAF4ED] rounded-xl border border-[#EADBCC] text-xs text-[#845339]">
                  ✓ Mỗi chiếc vòng tự phối được tặng kèm: <strong>Hộp gấm cao cấp, túi thơm thanh tẩy thảo mộc và dây dự phòng</strong>.
                </div>
              </div>
            )}

            {/* Bottom: Price Breakdown & Action */}
            <div className="pt-4 border-t border-[#E8DFD3] bg-[#FAF7F2]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-[#8C8276]">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-[#B86244]">
                      {priceData.total.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6258]">
                    (Dây: {priceData.cordCost.toLocaleString('vi-VN')}₫ + Hạt: {priceData.beadCost.toLocaleString('vi-VN')}₫ + Charm: {priceData.charmCost.toLocaleString('vi-VN')}₫ + Công xâu: 30k)
                  </p>
                </div>

                <button
                  onClick={handleAddCustomToCart}
                  disabled={isAdded}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                    isAdded
                      ? 'bg-[#4E6857] text-white'
                      : 'bg-[#B86244] hover:bg-[#A05237] text-white shadow-artisan-hover'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã Thêm Mẫu Tự Phối Vào Giỏ!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Đặt Làm Chiếc Vòng Này</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
