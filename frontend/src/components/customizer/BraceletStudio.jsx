import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  Check,
  Ruler,
  Flower2,
  Clover,
  Type,
  Moon,
  Coins,
  HeartHandshake,
  BellRing,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Star,
  Zap,
  Gift
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

// Charm SVG preview components - renders actual charm art
function CharmPreviewSVG({ charm, size = 40 }) {
  const s = size;
  const h = s;
  const cx = s / 2;
  const cy = h / 2 + 4;

  if (!charm) return null;

  // Render real charm photo if available
  if (charm.image) {
    return (
      <div className="w-full h-full flex items-center justify-center p-0.5 overflow-hidden rounded-xl">
        <img 
          src={charm.image} 
          alt={charm.name} 
          className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110" 
        />
      </div>
    );
  }

  if (charm.id === 'charm-whale-blue') {
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <defs>
          <radialGradient id={`whale-${s}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#B8E8F8" />
            <stop offset="60%" stopColor="#5AB8D8" />
            <stop offset="100%" stopColor="#2A7A9A" />
          </radialGradient>
        </defs>
        <g transform={`translate(${cx}, ${cy})`}>
          <path d="M -13 -2 C -11 -11 8 -11 13 -3 C 17 1 19 6 21 2 C 22 -1 23 7 19 8 C 13 10 0 11 -9 6 C -13 3 -15 1 -13 -2 Z" fill={`url(#whale-${s})`} stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx="-6" cy="-2" r="1.5" fill="#1C2D37" />
          <circle cx="-7" cy="-3" r="0.6" fill="#FFFFFF" />
          <path d="M -3 2 C -2 4 1 4 2 2" stroke="#4A7C9A" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  }
  if (charm.id === 'charm-mint-flower' || charm.id === 'charm-lotus') {
    const fc = charm.id === 'charm-lotus' ? '#A8D8B0' : '#A3E4D7';
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <g transform={`translate(${cx}, ${cy})`}>
          <circle cx="-8" cy="-5" r="6.5" fill={fc} opacity="0.9" />
          <circle cx="8" cy="-5" r="6.5" fill={fc} opacity="0.9" />
          <circle cx="-5" cy="7" r="6.5" fill={fc} opacity="0.9" />
          <circle cx="5" cy="7" r="6.5" fill={fc} opacity="0.9" />
          <circle cx="0" cy="-9" r="6.5" fill={fc} opacity="0.9" />
          <circle cx="0" cy="0" r="5.5" fill="#F9E076" stroke="#E6C229" strokeWidth="0.8" />
          <circle cx="-1.2" cy="-1.2" r="1.8" fill="#FFF8D0" opacity="0.7" />
        </g>
      </svg>
    );
  }
  if (charm.id === 'charm-flower-kv') {
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <g transform={`translate(${cx}, ${cy})`}>
          <circle cx="-8" cy="-5" r="6.5" fill="#F9D5E5" opacity="0.9" />
          <circle cx="8" cy="-5" r="6.5" fill="#F9D5E5" opacity="0.9" />
          <circle cx="-5" cy="7" r="6.5" fill="#FADDE8" opacity="0.9" />
          <circle cx="5" cy="7" r="6.5" fill="#FADDE8" opacity="0.9" />
          <circle cx="0" cy="-9" r="6.5" fill="#F9D5E5" opacity="0.9" />
          <circle cx="0" cy="0" r="5.5" fill="#FFE566" stroke="#F0CC22" strokeWidth="0.8" />
          <circle cx="-1" cy="-1" r="2" fill="#FFF8CC" opacity="0.8" />
        </g>
      </svg>
    );
  }
  if (charm.id === 'charm-butterfly-hologram') {
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <defs>
          <linearGradient id={`holo-${s}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4B4F0" />
            <stop offset="35%" stopColor="#A0D4F0" />
            <stop offset="70%" stopColor="#B4F0D4" />
            <stop offset="100%" stopColor="#F0D4B4" />
          </linearGradient>
        </defs>
        <g transform={`translate(${cx}, ${cy})`}>
          <path d="M 0 0 C -8 -15 -18 -11 -15 0 C -14 8 -3 8 0 2 Z" fill={`url(#holo-${s})`} stroke="#FFFFFF" strokeWidth="0.8" opacity="0.92" />
          <path d="M 0 0 C 8 -15 18 -11 15 0 C 14 8 3 8 0 2 Z" fill={`url(#holo-${s})`} stroke="#FFFFFF" strokeWidth="0.8" opacity="0.92" />
          <path d="M 0 2 C -5 6 -10 13 -3 13 C 0 13 0 6 0 2 Z" fill="#C8F0D8" stroke="#FFFFFF" strokeWidth="0.7" opacity="0.85" />
          <path d="M 0 2 C 5 6 10 13 3 13 C 0 13 0 6 0 2 Z" fill="#C8F0D8" stroke="#FFFFFF" strokeWidth="0.7" opacity="0.85" />
          <line x1="0" y1="-8" x2="0" y2="9" stroke="#8A7BAA" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="-3" y1="-10" x2="0" y2="-8" stroke="#8A7BAA" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="3" y1="-10" x2="0" y2="-8" stroke="#8A7BAA" strokeWidth="0.9" strokeLinecap="round" />
        </g>
      </svg>
    );
  }
  if (charm.id === 'charm-clover') {
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <g transform={`translate(${cx}, ${cy})`}>
          <circle cx="-6" cy="-6" r="6" fill="#7DD87A" stroke="#5BB855" strokeWidth="0.7" />
          <circle cx="6" cy="-6" r="6" fill="#7DD87A" stroke="#5BB855" strokeWidth="0.7" />
          <circle cx="-6" cy="6" r="6" fill="#7DD87A" stroke="#5BB855" strokeWidth="0.7" />
          <circle cx="6" cy="6" r="6" fill="#7DD87A" stroke="#5BB855" strokeWidth="0.7" />
          <line x1="0" y1="0" x2="0" y2="12" stroke="#5BB855" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="-3" cy="-3" r="1.5" fill="#A0E89E" opacity="0.6" />
          <circle cx="3" cy="-3" r="1.5" fill="#A0E89E" opacity="0.6" />
        </g>
      </svg>
    );
  }
  if (charm.id === 'charm-moon-star') {
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <defs>
          <radialGradient id={`moon-${s}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FEFCE8" />
            <stop offset="60%" stopColor="#D4D8F0" />
            <stop offset="100%" stopColor="#8890C8" />
          </radialGradient>
        </defs>
        <g transform={`translate(${cx}, ${cy})`}>
          <path d="M 0 -12 C -2 -10 -2 -4 0 -1 C 5 -1 9 -5 9 -10 C 7 -13 3 -15 0 -12 Z" fill={`url(#moon-${s})`} stroke="#C8CCE8" strokeWidth="0.8" />
          <polygon points="0,-18 1.8,-13 6,-13 2.7,-10 3.9,-5.5 0,-8.5 -3.9,-5.5 -2.7,-10 -6,-13 -1.8,-13" fill="#F9E876" stroke="#DDCC00" strokeWidth="0.5" transform="translate(9, 4) scale(0.55)" />
        </g>
      </svg>
    );
  }
  if (charm.id === 'charm-pixiu') {
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <defs>
          <radialGradient id={`gold-${s}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFEAA0" />
            <stop offset="50%" stopColor="#C09A58" />
            <stop offset="100%" stopColor="#8B6914" />
          </radialGradient>
        </defs>
        <g transform={`translate(${cx}, ${cy})`}>
          <ellipse cx="0" cy="2" rx="10" ry="8" fill={`url(#gold-${s})`} stroke="#A07828" strokeWidth="0.8" />
          <circle cx="-5" cy="-6" r="4.5" fill={`url(#gold-${s})`} stroke="#A07828" strokeWidth="0.7" />
          <circle cx="5" cy="-6" r="4.5" fill={`url(#gold-${s})`} stroke="#A07828" strokeWidth="0.7" />
          <circle cx="-5" cy="-6" r="1.5" fill="#3A2200" />
          <circle cx="5" cy="-6" r="1.5" fill="#3A2200" />
          <circle cx="-5.5" cy="-6.5" r="0.5" fill="#FFFFFF" />
          <circle cx="4.5" cy="-6.5" r="0.5" fill="#FFFFFF" />
          <rect x="-3" y="4" width="6" height="2" rx="1" fill="#A07828" opacity="0.6" />
        </g>
      </svg>
    );
  }
  if (charm.id === 'charm-magnet-heart') {
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <g transform={`translate(${cx}, ${cy})`}>
          <path d="M 0 6 C -10 0 -14 -6 -10 -11 C -6 -15 0 -12 0 -7 C 0 -12 6 -15 10 -11 C 14 -6 10 0 0 6 Z" fill="#E85480" stroke="#C02060" strokeWidth="0.8" />
          <path d="M -2 -2 C -2 -8 2 -8 2 -2" stroke="#FFFFFF" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
        </g>
      </svg>
    );
  }
  if (charm.id === 'charm-bell') {
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <defs>
          <radialGradient id={`bell-${s}`} cx="30%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#FEFCE8" />
            <stop offset="50%" stopColor="#D4C870" />
            <stop offset="100%" stopColor="#8B8020" />
          </radialGradient>
        </defs>
        <g transform={`translate(${cx}, ${cy})`}>
          <path d="M 0 -14 C -8 -14 -12 -6 -12 2 L 12 2 C 12 -6 8 -14 0 -14 Z" fill={`url(#bell-${s})`} stroke="#AAA028" strokeWidth="0.8" />
          <rect x="-12" y="2" width="24" height="3" rx="1.5" fill="#AAA028" />
          <circle cx="0" cy="8" r="2.5" fill="#8B8020" />
          <circle cx="-4" cy="-8" r="1" fill="#FEFCE8" opacity="0.5" />
        </g>
      </svg>
    );
  }
  if (charm.id === 'charm-initial') {
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <defs>
          <radialGradient id={`silver-${s}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#D9D9D9" />
            <stop offset="100%" stopColor="#8C8C8C" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={s * 0.38} fill={`url(#silver-${s})`} stroke="#C8C8C8" strokeWidth="0.8" />
        <text x={cx} y={cy + 5} textAnchor="middle" fill="#26211C" fontSize={s * 0.32} fontWeight="bold" fontFamily="Georgia, serif">A</text>
      </svg>
    );
  }
  // Generic silver circle for unknowns
  return (
    <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
      <circle cx={cx} cy={cy} r={s * 0.38} fill="#D9D9D9" stroke="#B0B0B0" strokeWidth="0.8" />
      <circle cx={cx - s * 0.08} cy={cy - s * 0.08} r={s * 0.1} fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
}

// Odoo step indicator
function StepIndicator({ steps, activeStep, onStep }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#F0E8DE]">
      {steps.map((step, idx) => {
        const isActive = step.id === activeStep;
        const isDone = steps.findIndex(s => s.id === activeStep) > idx;
        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => onStep(step.id)}
              className={`flex flex-col items-center gap-1.5 group transition-all ${isActive ? 'opacity-100' : isDone ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                isActive
                  ? 'bg-[#B86244] text-white border-[#B86244] shadow-md animate-pulseRing'
                  : isDone
                    ? 'bg-[#4E6857] text-white border-[#4E6857]'
                    : 'bg-[#FAF4ED] text-[#B86244] border-[#E8DFD3] group-hover:border-[#B86244]'
              }`}>
                {isDone ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap hidden sm:block ${isActive ? 'text-[#B86244]' : isDone ? 'text-[#4E6857]' : 'text-[#8C8276]'}`}>
                {step.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 sm:mx-3 transition-all ${isDone ? 'bg-[#4E6857]' : 'bg-[#E8DFD3]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Odoo-style back/next navigation buttons
function NavButtons({ onBack, onNext, backLabel, nextLabel, canNext = true }) {
  return (
    <div className="flex items-center justify-between pt-4 mt-2">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF7F2] text-[#6B6258] border border-[#E8DFD3] text-xs font-semibold hover:bg-[#F0E8DE] hover:text-[#26211C] hover:border-[#CFC1B0] transition-all group active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>{backLabel || 'Quay Lại'}</span>
        </button>
      ) : <div />}
      {onNext && (
        <button
          onClick={onNext}
          disabled={!canNext}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all group active:scale-95 ${
            canNext
              ? 'bg-[#26211C] text-white hover:bg-[#B86244] shadow-sm hover:shadow-md'
              : 'bg-[#E8DFD3] text-[#8C8276] cursor-not-allowed'
          }`}
        >
          <span>{nextLabel || 'Tiếp Theo'}</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}

const STEPS = [
  { id: 'cord', label: 'Loại Dây' },
  { id: 'bead', label: 'Hạt Đá' },
  { id: 'charm', label: 'Charm' },
  { id: 'size', label: 'Hoàn Tất' }
];

export default function BraceletStudio({ isOpen, onClose, onOpenSizeGuide, onOpenAiVision, initialPreset }) {
  if (!isOpen) return null;

  const { addToCart } = useCart();
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedCord, setSelectedCord] = useState(null);
  const [selectedMainBead, setSelectedMainBead] = useState(null);
  const [selectedSecondaryBead, setSelectedSecondaryBead] = useState(null);
  const [selectedCharm, setSelectedCharm] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [customLetter, setCustomLetter] = useState('A');
  const [customNote, setCustomNote] = useState('');
  const [activeStep, setActiveStep] = useState('cord');
  const [isAdded, setIsAdded] = useState(false);
  const [charmWiggling, setCharmWiggling] = useState(false);
  const [beadMenhFilter, setBeadMenhFilter] = useState('all');

  const getPrimaryMenh = (menh) => {
    if (!menh) return 'Tất cả';
    if (Array.isArray(menh)) return menh[0] || 'Tất cả';
    return String(menh).split(',')[0].trim();
  };

  const getMenhList = (menh) => {
    if (!menh) return [];
    if (Array.isArray(menh)) return menh.map(m => String(m).trim());
    return String(menh).split(',').map(m => m.trim());
  };

  const filteredBeads = useMemo(() => {
    if (!options?.beads) return [];
    if (beadMenhFilter === 'all') return options.beads;
    return options.beads.filter(b => {
      const list = getMenhList(b.menh);
      return list.some(m => m.toLowerCase().includes(beadMenhFilter.toLowerCase()));
    });
  }, [options?.beads, beadMenhFilter]);

  useEffect(() => {
    api.getCustomizerOptions().then(res => {
      if (res.success && res.data) {
        setOptions(res.data);
        const defaultCord = (initialPreset?.cordId && res.data.cords.find(c => c.id === initialPreset.cordId)) || res.data.cords[0];
        const defaultBead = (initialPreset?.mainBeadId && res.data.beads.find(b => b.id === initialPreset.mainBeadId)) || res.data.beads[0];
        const defaultSecondaryBead = (initialPreset?.secondaryBeadId && res.data.beads.find(b => b.id === initialPreset.secondaryBeadId)) || null;
        const defaultCharm = (initialPreset?.charmId && res.data.charms.find(c => c.id === initialPreset.charmId)) || res.data.charms[0];
        const defaultSize = (initialPreset?.sizeId && res.data.sizes.find(s => s.id === initialPreset.sizeId)) || res.data.sizes[1];
        setSelectedCord(defaultCord);
        setSelectedMainBead(defaultBead);
        setSelectedSecondaryBead(defaultSecondaryBead);
        setSelectedCharm(defaultCharm);
        setSelectedSize(defaultSize);
        if (initialPreset?.mainBeadId) setActiveStep('bead');
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [initialPreset]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const priceData = useMemo(() => {
    if (!selectedCord || !selectedMainBead || !selectedSize) return { total: 0, cordCost: 0, beadCost: 0, charmCost: 0, craftFee: 30000, beadCount: 21 };
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
    return { total: cordCost + beadCost + charmCost + craftFee, cordCost, beadCost, charmCost, craftFee, beadCount: count };
  }, [selectedCord, selectedMainBead, selectedSecondaryBead, selectedCharm, selectedSize]);

  const beadPositions = useMemo(() => {
    const count = selectedSize?.beadCount || 21;
    const radius = 118;
    const cx = 160;
    const cy = 148;
    const positions = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      let beadColor = selectedMainBead?.color || '#EAA9A9';
      let isSec = false;
      if (selectedSecondaryBead && i % 3 === 0) {
        beadColor = selectedSecondaryBead.color;
        isSec = true;
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
      images: ['/images/products/bracelet-strawberry-quartz.webp'],
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
    setTimeout(() => { setIsAdded(false); onClose(); }, 1000);
  };

  const triggerCharmWiggle = () => {
    setCharmWiggling(true);
    setTimeout(() => setCharmWiggling(false), 700);
  };

  if (loading || !options) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          className="p-8 bg-white rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-[#E8DFD3] animate-scaleIn"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FAF4ED] to-[#F0E8DE] flex items-center justify-center border border-[#E8DFD3] shadow-inner">
            <Sparkles className="w-7 h-7 text-[#B86244] animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-serif-boutique text-lg font-bold text-[#26211C]">Đang chuẩn bị Xưởng Tự Phối</p>
            <p className="text-xs text-[#8C8276] mt-1">Tải dữ liệu hạt đá & charm thủ công...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 lg:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#FAF7F2] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden my-2 sm:my-4"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '96vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* ── ODOO HEADER BAR ── */}
        <div className="relative bg-gradient-to-r from-[#26211C] via-[#332B24] to-[#26211C] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 overflow-hidden">
          {/* animated shimmer line */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-px animate-shimmerGold opacity-60" />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B86244] to-[#A05237] flex items-center justify-center shadow-lg border border-[#A05237]/40">
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif-boutique text-lg sm:text-xl font-bold tracking-wide leading-none">
                Xưởng Tự Phối Vòng Tay
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#CFC1B0] mt-0.5 hidden sm:block">
                Chọn dây · hạt đá · charm · size cổ tay theo ý thích riêng của bạn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAiVision && (
              <button
                onClick={onOpenAiVision}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-[#B86244]/30 hover:from-amber-500/30 hover:to-[#B86244]/40 border border-amber-400/30 text-amber-200 text-xs font-bold rounded-full transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>AI Gợi Ý</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#CFC1B0] hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── ODOO STEP INDICATOR ── */}
        <StepIndicator steps={STEPS} activeStep={activeStep} onStep={setActiveStep} />

        {/* ── STUDIO GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">

          {/* LEFT: Live Bracelet Preview Canvas */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#F3ECE1] via-[#EDE4D6] to-[#F3ECE1] p-4 sm:p-6 flex flex-col items-center justify-start border-b lg:border-b-0 lg:border-r border-[#E8DFD3] relative">

            {/* Preview label */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-widest text-[#B86244] font-bold bg-white/70 px-3 py-1 rounded-full border border-[#E8DFD3] shadow-sm">
                ✦ Mô Phỏng Trực Tiếp
              </span>
            </div>

            {/* SVG Bracelet Canvas */}
            <div className="relative w-full max-w-[280px] sm:max-w-[310px] aspect-square flex items-center justify-center mx-auto animate-floatBead">
              <svg viewBox="0 0 320 296" className="w-full h-full drop-shadow-xl">
                <defs>
                  <radialGradient id="mainBeadGrad" cx="33%" cy="33%" r="67%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="38%" stopColor={selectedMainBead?.color || '#EAA9A9'} />
                    <stop offset="100%" stopColor="#1C1C1C" stopOpacity="0.75" />
                  </radialGradient>
                  <radialGradient id="secBeadGrad" cx="33%" cy="33%" r="67%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="38%" stopColor={selectedSecondaryBead?.color || '#73B4C8'} />
                    <stop offset="100%" stopColor="#1C1C1C" stopOpacity="0.75" />
                  </radialGradient>
                  <radialGradient id="silverShine" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="45%" stopColor="#D9D9D9" />
                    <stop offset="85%" stopColor="#8C8C8C" />
                    <stop offset="100%" stopColor="#4A4A4A" />
                  </radialGradient>
                  <filter id="bead-shadow">
                    <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.25" />
                  </filter>
                  <filter id="charm-shadow">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.35" />
                  </filter>
                </defs>

                {/* Cord thread ring */}
                <circle
                  cx="160"
                  cy="148"
                  r="118"
                  fill="none"
                  stroke={selectedCord?.color || '#6A4E36'}
                  strokeWidth="3.5"
                  strokeDasharray={selectedCord?.id?.includes('waxed') ? '7 2' : (selectedCord?.id?.includes('leather') ? '10 3' : 'none')}
                  opacity="0.6"
                />

                {/* Beads */}
                {beadPositions.map(pos => (
                  <g key={pos.index} filter="url(#bead-shadow)">
                    <circle cx={pos.x} cy={pos.y} r="11" fill={pos.isSec ? 'url(#secBeadGrad)' : 'url(#mainBeadGrad)'} stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
                    <circle cx={pos.x - 3.5} cy={pos.y - 3.5} r="3" fill="#FFFFFF" opacity="0.55" />
                    <circle cx={pos.x - 1.5} cy={pos.y - 1.5} r="1" fill="#FFFFFF" opacity="0.35" />
                  </g>
                ))}

                {/* Charm at bottom */}
                {selectedCharm && (
                  <g transform="translate(160, 270)" className={charmWiggling ? 'animate-charmWiggle' : ''} filter="url(#charm-shadow)">
                    {/* Jump ring connector */}
                    <circle cx="0" cy="-10" r="4.5" fill="none" stroke="url(#silverShine)" strokeWidth="2" />
                    <line x1="0" y1="-6" x2="0" y2="-1" stroke="url(#silverShine)" strokeWidth="2" />

                    {/* Charm body via real photo or SVG */}
                    <g transform="translate(-20, 0)">
                      {selectedCharm.image ? (
                        <g transform="translate(4, -8)">
                          <clipPath id={`charm-canvas-clip-${selectedCharm.id}`}>
                            <circle cx="16" cy="16" r="15" />
                          </clipPath>
                          <circle cx="16" cy="16" r="16.5" fill="#FFFFFF" stroke="#C59B6D" strokeWidth="1.8" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))" />
                          <image 
                            href={selectedCharm.image} 
                            x="1" 
                            y="1" 
                            width="30" 
                            height="30" 
                            clipPath={`url(#charm-canvas-clip-${selectedCharm.id})`}
                            preserveAspectRatio="xMidYMid slice" 
                          />
                          <circle cx="12" cy="10" r="3.5" fill="#FFFFFF" opacity="0.4" />
                        </g>
                      ) : (
                        <>
                          {selectedCharm.id === 'charm-whale-blue' && (
                            <g>
                              <path d="M -13 -2 C -11 -11 8 -11 13 -3 C 17 1 19 6 21 2 C 22 -1 23 7 19 8 C 13 10 0 11 -9 6 C -13 3 -15 1 -13 -2 Z" fill="#88C4E6" stroke="#FFFFFF" strokeWidth="0.8" />
                              <circle cx="-6" cy="-2" r="1.5" fill="#1C2D37" />
                              <circle cx="-7" cy="-3" r="0.5" fill="#FFFFFF" />
                              <path d="M -3 2 C -2 4 1 4 2 2" stroke="#4A7C9A" strokeWidth="0.8" fill="none" strokeLinecap="round" />
                            </g>
                          )}
                          {(charm => charm?.id === 'charm-mint-flower' || charm?.id === 'charm-lotus')(selectedCharm) && (
                            <g>
                              <circle cx="-8" cy="-4" r="6.5" fill="#A3E4D7" opacity="0.92" />
                              <circle cx="8" cy="-4" r="6.5" fill="#A3E4D7" opacity="0.92" />
                              <circle cx="-5" cy="8" r="6.5" fill="#A3E4D7" opacity="0.92" />
                              <circle cx="5" cy="8" r="6.5" fill="#A3E4D7" opacity="0.92" />
                              <circle cx="0" cy="-8" r="6.5" fill="#A3E4D7" opacity="0.92" />
                              <circle cx="0" cy="1" r="5.5" fill="#F9E076" stroke="#E6C229" strokeWidth="0.8" />
                            </g>
                          )}
                          {selectedCharm.id === 'charm-flower-kv' && (
                            <g>
                              <circle cx="-8" cy="-4" r="6.5" fill="#F9D5E5" opacity="0.92" />
                              <circle cx="8" cy="-4" r="6.5" fill="#F9D5E5" opacity="0.92" />
                              <circle cx="-5" cy="8" r="6.5" fill="#FADDE8" opacity="0.92" />
                              <circle cx="5" cy="8" r="6.5" fill="#FADDE8" opacity="0.92" />
                              <circle cx="0" cy="-8" r="6.5" fill="#F9D5E5" opacity="0.92" />
                              <circle cx="0" cy="1" r="5.5" fill="#FFE566" stroke="#F0CC22" strokeWidth="0.8" />
                            </g>
                          )}
                          {selectedCharm.id === 'charm-butterfly-hologram' && (
                            <g>
                              <path d="M 0 0 C -8 -15 -18 -11 -15 0 C -14 8 -3 8 0 2 Z" fill="#D4CEEB" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.9" />
                              <path d="M 0 0 C 8 -15 18 -11 15 0 C 14 8 3 8 0 2 Z" fill="#D4CEEB" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.9" />
                              <path d="M 0 2 C -5 6 -10 13 -3 13 C 0 13 0 6 0 2 Z" fill="#BDE6C8" stroke="#FFFFFF" strokeWidth="0.7" opacity="0.85" />
                              <path d="M 0 2 C 5 6 10 13 3 13 C 0 13 0 6 0 2 Z" fill="#BDE6C8" stroke="#FFFFFF" strokeWidth="0.7" opacity="0.85" />
                              <line x1="0" y1="-8" x2="0" y2="9" stroke="#7A6F9B" strokeWidth="1.2" strokeLinecap="round" />
                            </g>
                          )}
                          {selectedCharm.id === 'charm-clover' && (
                            <g>
                              <circle cx="-6" cy="-5" r="6" fill="#7DD87A" />
                              <circle cx="6" cy="-5" r="6" fill="#7DD87A" />
                              <circle cx="-6" cy="7" r="6" fill="#7DD87A" />
                              <circle cx="6" cy="7" r="6" fill="#7DD87A" />
                              <line x1="0" y1="1" x2="0" y2="14" stroke="#5BB855" strokeWidth="1.5" strokeLinecap="round" />
                            </g>
                          )}
                          {selectedCharm.id === 'charm-moon-star' && (
                            <g>
                              <path d="M 0 -11 C -3 -9 -3 -3 0 0 C 5 0 9 -4 9 -9 C 7 -12 3 -14 0 -11 Z" fill="#D4D8F0" stroke="#C8CCE8" strokeWidth="0.8" />
                              <polygon points="13,-8 14.5,-3.5 19,-3.5 15.5,-0.5 16.5,4.5 13,2 9.5,4.5 10.5,-0.5 7,-3.5 11.5,-3.5" fill="#F9E876" stroke="#DDCC00" strokeWidth="0.4" />
                            </g>
                          )}
                          {selectedCharm.id === 'charm-pixiu' && (
                            <g>
                              <ellipse cx="0" cy="4" rx="10" ry="8" fill="#C09A58" stroke="#A07828" strokeWidth="0.8" />
                              <circle cx="-5" cy="-6" r="4.5" fill="#D4B060" stroke="#A07828" strokeWidth="0.7" />
                              <circle cx="5" cy="-6" r="4.5" fill="#D4B060" stroke="#A07828" strokeWidth="0.7" />
                              <circle cx="-5" cy="-6" r="1.5" fill="#3A2200" />
                              <circle cx="5" cy="-6" r="1.5" fill="#3A2200" />
                            </g>
                          )}
                          {selectedCharm.id === 'charm-magnet-heart' && (
                            <g transform="translate(0, 3)">
                              <path d="M 0 5 C -10 -1 -14 -7 -10 -12 C -6 -16 0 -13 0 -8 C 0 -13 6 -16 10 -12 C 14 -7 10 -1 0 5 Z" fill="#E85480" stroke="#C02060" strokeWidth="0.8" />
                            </g>
                          )}
                          {selectedCharm.id === 'charm-bell' && (
                            <g>
                              <path d="M 0 -12 C -8 -12 -12 -4 -12 4 L 12 4 C 12 -4 8 -12 0 -12 Z" fill="#D4C870" stroke="#AAA028" strokeWidth="0.8" />
                              <rect x="-12" y="4" width="24" height="3" rx="1.5" fill="#AAA028" />
                              <circle cx="0" cy="10" r="2.5" fill="#8B8020" />
                            </g>
                          )}
                          {selectedCharm.id === 'charm-initial' && (
                            <g>
                              <circle cx="0" cy="0" r="13" fill="url(#silverShine)" stroke="#C8C8C8" strokeWidth="0.8" />
                              <text x="0" y="5" textAnchor="middle" fill="#26211C" fontSize="13" fontWeight="bold" fontFamily="Georgia, serif">{customLetter}</text>
                            </g>
                          )}
                          {/* fallback */}
                          {!['charm-whale-blue','charm-mint-flower','charm-lotus','charm-flower-kv','charm-butterfly-hologram','charm-clover','charm-moon-star','charm-pixiu','charm-magnet-heart','charm-bell','charm-initial'].includes(selectedCharm.id) && (
                            <g>
                              <circle cx="0" cy="0" r="13" fill="url(#silverShine)" stroke="#C8C8C8" strokeWidth="0.8" />
                              <text x="0" y="4" textAnchor="middle" fill="#26211C" fontSize="10" fontWeight="bold">925</text>
                            </g>
                          )}
                        </>
                      )}
                    </g>
                  </g>
                )}

                {/* Center info label */}
                <text x="160" y="138" textAnchor="middle" fill="#8C8276" fontSize="9" fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5">VÒNG TAY</text>
                <text x="160" y="153" textAnchor="middle" fill="#26211C" fontSize="11" fontFamily="Georgia, serif" fontWeight="bold">{selectedMainBead?.name?.split(' ').slice(0,2).join(' ')}</text>
                <text x="160" y="166" textAnchor="middle" fill="#B86244" fontSize="9" fontFamily="sans-serif">{priceData.beadCount} hạt · {selectedSize?.label?.split(' ')[0]}</text>
              </svg>
            </div>

            {/* Live price summary card */}
            <div className="w-full mt-3 p-3 bg-white/80 rounded-2xl border border-[#E8DFD3] shadow-sm text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#8C8276]">Dây:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border border-black/15" style={{ backgroundColor: selectedCord?.color }} />
                  <span className="font-semibold text-[#26211C] truncate max-w-[110px]">{selectedCord?.name?.split(' ').slice(0,3).join(' ')}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8C8276]">Đá chủ đạo:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: selectedMainBead?.color }} />
                  <span className="font-semibold text-[#26211C] truncate max-w-[100px]">{selectedMainBead?.name?.split(' ').slice(0,2).join(' ')}</span>
                </div>
              </div>
              {selectedSecondaryBead && (
                <div className="flex justify-between items-center">
                  <span className="text-[#8C8276]">Đá xen kẽ:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: selectedSecondaryBead?.color }} />
                    <span className="font-semibold text-[#4E6857] truncate max-w-[100px]">{selectedSecondaryBead?.name?.split(' ').slice(0,2).join(' ')}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-[#8C8276]">Charm:</span>
                <span className="font-semibold text-[#B86244] truncate max-w-[120px]">
                  {selectedCharm?.name?.split(' ').slice(0,3).join(' ')} {selectedCharm?.id === 'charm-initial' ? `(${customLetter})` : ''}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-[#F0E8DE]">
                <span className="text-[#8C8276] font-medium">Tổng cộng:</span>
                <span className="font-bold text-[#B86244] text-sm">{priceData.total.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            {onOpenAiVision && (
              <button
                onClick={onOpenAiVision}
                className="w-full mt-3 py-2.5 px-3 bg-gradient-to-r from-amber-500/10 via-[#B86244]/15 to-amber-500/10 hover:from-amber-500/20 hover:to-[#B86244]/25 border border-amber-400/30 rounded-xl text-xs font-bold text-[#845339] hover:text-[#26211C] flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>📸 AI Gợi Ý Từ Ảnh Của Bạn</span>
              </button>
            )}
          </div>

          {/* RIGHT: Step Panels */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col gap-4">

            {/* ── STEP 1: CORD ── */}
            {activeStep === 'cord' && (
              <div className="animate-revealStep space-y-4">
                <div>
                  <h4 className="font-serif-boutique text-lg sm:text-xl font-bold text-[#26211C]">Bước 1 — Chọn Chất Liệu Dây Kết</h4>
                  <p className="text-xs text-[#6B6258] mt-1">Dây thun co giãn tiện lợi hoặc dây sáp Macrame đan thủ công độc đáo chống nước</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {options.cords.map(cord => (
                    <button
                      key={cord.id}
                      type="button"
                      onClick={() => setSelectedCord(cord)}
                      className={`odoo-card p-3.5 rounded-xl border text-left flex items-start gap-3 ${
                        selectedCord?.id === cord.id
                          ? 'border-[#B86244] bg-[#FBEFEA] shadow-sm ring-1 ring-[#B86244]/30'
                          : 'border-[#E8DFD3] bg-white hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5 relative">
                        <div
                          className="w-8 h-8 rounded-full border border-black/15 shadow-inner"
                          style={{ backgroundColor: cord.color }}
                        />
                        {selectedCord?.id === cord.id && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#B86244] rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-bold text-xs text-[#26211C] leading-tight">{cord.name}</h5>
                          <span className="text-xs font-bold text-[#B86244] shrink-0">{cord.price.toLocaleString('vi-VN')}₫</span>
                        </div>
                        <p className="text-[11px] text-[#6B6258] mt-0.5 leading-relaxed">{cord.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <NavButtons onNext={() => setActiveStep('bead')} nextLabel="Chọn Hạt Đá" />
              </div>
            )}

            {/* ── STEP 2: BEADS ── */}
            {activeStep === 'bead' && (
              <div className="animate-revealStep space-y-4">
                <div>
                  <h4 className="font-serif-boutique text-lg sm:text-xl font-bold text-[#26211C]">Bước 2 — Chọn Hạt Đá Phong Thủy</h4>
                  <p className="text-xs text-[#6B6258] mt-1">Đá thiên nhiên chính và tùy chọn đá phụ xen kẽ tạo hiệu ứng màu sắc độc đáo</p>
                </div>

                {/* Bộ lọc mệnh phong thủy */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[11px] font-bold text-[#6B6258] shrink-0 mr-1">Lọc Mệnh:</span>
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'Kim', label: 'Kim' },
                    { id: 'Mộc', label: 'Mộc' },
                    { id: 'Thủy', label: 'Thủy' },
                    { id: 'Hỏa', label: 'Hỏa' },
                    { id: 'Thổ', label: 'Thổ' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setBeadMenhFilter(m.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all shrink-0 ${
                        beadMenhFilter === m.id
                          ? 'bg-[#B86244] text-white border-[#B86244] shadow-sm'
                          : 'bg-white text-[#6B6258] border-[#E8DFD3] hover:border-[#B86244] hover:text-[#B86244]'
                      }`}
                    >
                      {m.id === 'all' ? 'Tất cả' : `Mệnh ${m.label}`}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#26211C] block mb-2 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#B86244] text-white text-[9px] font-bold flex items-center justify-center">1</span>
                    Đá Chủ Đạo (Chiếm đa số vòng):
                  </label>
                  {filteredBeads.length === 0 ? (
                    <div className="p-4 text-center bg-white rounded-xl border border-[#E8DFD3] text-xs text-[#8C8276]">
                      Không có loại hạt đá nào phù hợp mệnh đã chọn.{' '}
                      <button onClick={() => setBeadMenhFilter('all')} className="text-[#B86244] font-bold underline ml-1">
                        Xem tất cả hạt đá
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {filteredBeads.map(bead => (
                        <button
                          key={bead.id}
                          type="button"
                          onClick={() => setSelectedMainBead(bead)}
                          className={`odoo-card p-2.5 rounded-xl border text-left transition-all ${
                            selectedMainBead?.id === bead.id
                              ? 'border-[#B86244] bg-[#FBEFEA] ring-1 ring-[#B86244]/30 shadow-sm'
                              : 'border-[#E8DFD3] bg-white hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span
                              className="w-5 h-5 rounded-full border border-black/10 shadow-sm shrink-0"
                              style={{ backgroundColor: bead.color }}
                            />
                            <span className="text-[9px] text-[#4E6857] font-bold bg-[#EDF3EF] px-1.5 py-0.5 rounded-full">
                              Mệnh {getPrimaryMenh(bead.menh)}
                            </span>
                          </div>
                          <p className="font-bold text-xs text-[#26211C] leading-tight truncate">{bead.name}</p>
                          <p className="text-[11px] text-[#B86244] font-semibold mt-0.5">{bead.pricePerBead.toLocaleString('vi-VN')}₫/hạt</p>
                          <p className="text-[10px] text-[#8C8276] truncate">{bead.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#F0E8DE]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#26211C] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#8C8276] text-white text-[9px] font-bold flex items-center justify-center">2</span>
                      Đá Phối Xen Kẽ (Tùy chọn):
                    </label>
                    {selectedSecondaryBead && (
                      <button onClick={() => setSelectedSecondaryBead(null)} className="text-[11px] text-[#B86244] hover:underline font-medium">
                        × Bỏ xen kẽ
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                      onClick={() => setSelectedSecondaryBead(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0 transition-all ${
                        !selectedSecondaryBead ? 'border-[#B86244] bg-[#FBEFEA] text-[#B86244]' : 'bg-white text-[#6B6258] border-[#E8DFD3] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      Đơn sắc
                    </button>
                    {options.beads.filter(b => b.id !== selectedMainBead?.id).map(bead => (
                      <button
                        key={bead.id}
                        onClick={() => setSelectedSecondaryBead(bead)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 shrink-0 transition-all ${
                          selectedSecondaryBead?.id === bead.id
                            ? 'border-[#B86244] bg-[#FBEFEA] text-[#B86244]'
                            : 'bg-white text-[#26211C] border-[#E8DFD3] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: bead.color }} />
                        <span>{bead.name.split(' ').slice(0, 2).join(' ')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <NavButtons
                  onBack={() => setActiveStep('cord')}
                  backLabel="Loại Dây"
                  onNext={() => setActiveStep('charm')}
                  nextLabel="Chọn Charm"
                />
              </div>
            )}

            {/* ── STEP 3: CHARMS ── */}
            {activeStep === 'charm' && (
              <div className="animate-revealStep space-y-4">
                <div>
                  <h4 className="font-serif-boutique text-lg sm:text-xl font-bold text-[#26211C]">Bước 3 — Chọn Charm & Phụ Kiện Thủ Công</h4>
                  <p className="text-xs text-[#6B6258] mt-1">Charm gốm men pastel, hoa acrylic trong suốt và phụ kiện đặc trưng Vòng Tay Nhà Zy</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {options.charms.map(charm => {
                    const isSelected = selectedCharm?.id === charm.id;
                    return (
                      <button
                        key={charm.id}
                        type="button"
                        onClick={() => { setSelectedCharm(charm); triggerCharmWiggle(); }}
                        className={`odoo-card p-3 rounded-xl border text-left flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#B86244] bg-[#FBEFEA] shadow-sm ring-1 ring-[#B86244]/30'
                            : 'border-[#E8DFD3] bg-white hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {/* Real charm preview SVG */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-white shadow-sm' : 'bg-[#FAF7F2]'}`}>
                          <CharmPreviewSVG charm={charm} size={42} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="font-bold text-xs text-[#26211C] leading-tight truncate">{charm.name}</h5>
                            <span className="text-xs font-bold text-[#B86244] shrink-0">+{charm.price.toLocaleString('vi-VN')}₫</span>
                          </div>
                          {charm.material && (
                            <span className="inline-block text-[9px] bg-[#FAF4E8] text-[#C59B6D] font-bold px-1.5 py-0.2 rounded mt-0.5 border border-[#EADBCC]">
                              {charm.material}
                            </span>
                          )}
                          <p className="text-[11px] text-[#6B6258] mt-0.5 leading-relaxed line-clamp-1">{charm.desc || charm.meaning}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#B86244] flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedCharm?.id === 'charm-initial' && (
                  <div className="p-3.5 bg-white rounded-xl border border-[#B86244]/40 shadow-sm animate-fadeIn">
                    <label className="text-xs font-bold text-[#26211C] block mb-2.5 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-[#B86244]" />
                      Nhập chữ cái muốn khắc (A – Z):
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        maxLength={1}
                        value={customLetter}
                        onChange={e => setCustomLetter(e.target.value.toUpperCase() || 'A')}
                        className="w-14 h-14 text-center text-2xl font-bold uppercase rounded-xl border-2 border-[#B86244] bg-[#FBEFEA] focus:outline-none focus:ring-2 focus:ring-[#B86244]/30 font-serif-boutique"
                      />
                      <p className="text-xs text-[#6B6258]">Khắc dấu ấn cá nhân lên mặt thẻ gỗ mộc thủ công. Dùng làm quà tặng người thân cực ý nghĩa!</p>
                    </div>
                  </div>
                )}

                <NavButtons
                  onBack={() => setActiveStep('bead')}
                  backLabel="Hạt Đá"
                  onNext={() => setActiveStep('size')}
                  nextLabel="Chọn Size Tay"
                />
              </div>
            )}

            {/* ── STEP 4: SIZE & FINISH ── */}
            {activeStep === 'size' && (
              <div className="animate-revealStep space-y-4">
                <div>
                  <h4 className="font-serif-boutique text-lg sm:text-xl font-bold text-[#26211C]">Bước 4 — Size Cổ Tay & Hoàn Tất</h4>
                  <p className="text-xs text-[#6B6258] mt-1">Số lượng hạt đá được tự động tính chính xác theo chu vi cổ tay</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-[#26211C]">Kích thước cổ tay:</span>
                    <button
                      onClick={onOpenSizeGuide}
                      className="text-[#B86244] font-semibold hover:underline flex items-center gap-1"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      Hướng dẫn đo
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {options.sizes.map(sz => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`odoo-card p-3 rounded-xl border text-left ${
                          selectedSize?.id === sz.id
                            ? 'border-[#B86244] bg-[#FBEFEA] ring-1 ring-[#B86244]/30 shadow-sm'
                            : 'border-[#E8DFD3] bg-white hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs text-[#26211C]">{sz.label}</p>
                          <span className="text-[10px] bg-[#FAF7F2] px-2 py-0.5 rounded-full text-[#B86244] font-bold border border-[#EADBCC]">
                            {sz.beadCount} hạt
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#26211C] flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-[#B86244]" />
                    Ghi chú riêng cho nghệ nhân:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Đan thêm nút bình an, gói hộp quà kèm thiệp viết tay chúc mừng sinh nhật..."
                    value={customNote}
                    onChange={e => setCustomNote(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                  />
                </div>

                <div className="p-3 bg-[#FAF4ED] rounded-xl border border-[#EADBCC] text-xs text-[#845339] flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Mỗi chiếc vòng tự phối được tặng kèm: <strong>Hộp gấm cao cấp, túi thơm thảo mộc và sợi dây dự phòng</strong>.</span>
                </div>

                <NavButtons onBack={() => setActiveStep('charm')} backLabel="Charm" />
              </div>
            )}

            {/* ── BOTTOM: Price Breakdown & Add to Cart ── */}
            <div className="mt-auto pt-4 border-t border-[#E8DFD3]">
              {/* Price breakdown line */}
              <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#6B6258]">
                <span>Dây: <strong className="text-[#26211C]">{priceData.cordCost.toLocaleString('vi-VN')}₫</strong></span>
                <span>+</span>
                <span>Hạt ({priceData.beadCount}): <strong className="text-[#26211C]">{priceData.beadCost.toLocaleString('vi-VN')}₫</strong></span>
                <span>+</span>
                <span>Charm: <strong className="text-[#26211C]">{priceData.charmCost.toLocaleString('vi-VN')}₫</strong></span>
                <span>+</span>
                <span>Công xâu: <strong className="text-[#26211C]">30.000₫</strong></span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-[#8C8276]">Tổng cộng:</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#B86244] leading-none">
                    {priceData.total.toLocaleString('vi-VN')}₫
                  </p>
                </div>
                <button
                  onClick={handleAddCustomToCart}
                  disabled={isAdded}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.97] ${
                    isAdded
                      ? 'bg-[#4E6857] text-white'
                      : 'bg-[#B86244] hover:bg-[#A05237] text-white hover:shadow-lg'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã Thêm Vào Giỏ!</span>
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
