import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Phone,
  MapPin,
  LogIn,
  UserPlus
} from 'lucide-react';
import { api } from '../../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  if (!isOpen) return null;

  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login(email, password);
        if (res.success && res.data) {
          sessionStorage.setItem('viban_user', JSON.stringify(res.data.user));
          if (res.data.user.role === 'admin') {
            sessionStorage.setItem('viban_admin_user', JSON.stringify(res.data.user));
          } else {
            sessionStorage.setItem('viban_customer_user', JSON.stringify(res.data.user));
          }
          localStorage.setItem('viban_user', JSON.stringify(res.data.user));
          setSuccessMsg('Đăng nhập thành công!');
          setTimeout(() => {
            if (onAuthSuccess) onAuthSuccess(res.data.user);
            onClose();
          }, 600);
        }
      } else {
        if (!phone.trim()) {
          setErrorMsg('Vui lòng nhập số điện thoại nhận hàng.');
          setLoading(false);
          return;
        }

        const res = await api.register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim()
        });
        if (res.success && res.data) {
          sessionStorage.setItem('viban_user', JSON.stringify(res.data.user));
          sessionStorage.setItem('viban_customer_user', JSON.stringify(res.data.user));
          localStorage.setItem('viban_user', JSON.stringify(res.data.user));
          setSuccessMsg('Đăng ký tài khoản khách hàng thành công và đã lưu vào cơ sở dữ liệu!');
          setTimeout(() => {
            if (onAuthSuccess) onAuthSuccess(res.data.user);
            onClose();
          }, 600);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Thao tác không thành công, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#26211C] text-white px-6 py-4 flex items-center justify-between border-b border-[#3D352E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#B86244] flex items-center justify-center text-white font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-boutique text-lg font-bold tracking-wide">
                {isLogin ? 'ĐĂNG NHẬP VÒNG TAY NHÀ ZY' : 'TẠO TÀI KHOẢN VÒNG TAY NHÀ ZY'}
              </h3>
              <p className="text-[11px] text-[#CFC1B0]">
                {isLogin ? 'Truy cập đơn hàng & bảng quản trị xưởng' : 'Lưu thông tin giao hàng, voucher & mẫu vòng tự phối'}
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

        {/* Tab switch */}
        <div className="flex border-b border-[#E8DFD3] bg-white">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              isLogin 
                ? 'border-[#B86244] text-[#B86244] bg-[#FAF7F2]' 
                : 'border-transparent text-[#6B6258] hover:text-[#26211C]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng Nhập</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              !isLogin 
                ? 'border-[#B86244] text-[#B86244] bg-[#FAF7F2]' 
                : 'border-transparent text-[#6B6258] hover:text-[#26211C]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Đăng Ký Tài Khoản</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Full name (for register) */}
          {!isLogin && (
            <div>
              <label className="text-xs font-semibold text-[#26211C] block mb-1">
                Họ và tên của bạn: *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C8276] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Khánh Vy"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-[#26211C] block mb-1">
              Địa chỉ Email: *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C8276] absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="khanhvy@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
              />
            </div>
          </div>

          {/* Phone (for register) */}
          {!isLogin && (
            <div>
              <label className="text-xs font-semibold text-[#26211C] block mb-1">
                Số điện thoại liên hệ: *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C8276] absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0988668899"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                />
              </div>
            </div>
          )}

          {/* Address (for register) */}
          {!isLogin && (
            <div>
              <label className="text-xs font-semibold text-[#26211C] block mb-1">
                Địa chỉ giao hàng mặc định:
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#8C8276] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-[#26211C] block mb-1">
              Mật khẩu: *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C8276] absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E8DFD3] bg-white focus:outline-none focus:ring-1 focus:ring-[#B86244]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#B86244] hover:bg-[#A05237] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Đang lưu vào cơ sở dữ liệu...</span>
            ) : (
              <>
                <span>{isLogin ? 'Đăng Nhập Ngay' : 'Hoàn Tất Đăng Ký Tài Khoản Khách Hàng'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Security note */}
          <div className="pt-3 border-t border-[#E8DFD3] text-center text-[11px] text-[#8C8276] flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#4E6857]" />
            <span>Hệ thống bảo mật tài khoản chuẩn mã hóa HTTPS & Neon Cloud</span>
          </div>

        </form>

      </div>
    </div>
  );
}
