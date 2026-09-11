import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 bg-white rounded-3xl border border-[#E8DFD3] shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF4ED] text-[#B86244] flex items-center justify-center mx-auto text-2xl font-bold">
              ✨
            </div>
            <h2 className="font-serif-boutique text-2xl font-bold text-[#26211C]">
              Đang làm mới dữ liệu
            </h2>
            <p className="text-xs text-[#6B6258] leading-relaxed">
              Trang web vừa cập nhật tính năng mới. Vui lòng bấm nút bên dưới để tải lại và tiếp tục trải nghiệm sản phẩm nhé!
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-6 rounded-2xl bg-[#B86244] text-white text-xs font-bold shadow-md hover:bg-[#A05237] transition-all"
            >
              Tải Lại Trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
