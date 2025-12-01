import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const isValid = 
    password.trim().length >= 6 && 
    (confirmText === 'XÓA TÀI KHOẢN' || confirmText === 'XOA TAI KHOAN') && 
    agreedToTerms;

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;
    
    setIsLoading(true);
    try {
      await onConfirm(password);
      handleClose();
    } catch {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return; // Ngăn đóng khi đang loading
    setIsClosing(true);
    setTimeout(() => {
      setPassword('');
      setConfirmText('');
      setAgreedToTerms(false);
      setShowPassword(false);
      setIsLoading(false);
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  const modalContent = (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 transition-all duration-300 ${
        isClosing ? 'opacity-0 backdrop-blur-none' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0 animate-fadeIn'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
      <div className="p-6 md:p-8 select-none">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <i className="fa-solid fa-triangle-exclamation text-red-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Xóa tài khoản</h2>
              <p className="text-sm text-gray-500">Thao tác này không thể hoàn tác</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="group w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 hover:rotate-90"
            title="Đóng"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Warning Message */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex gap-3">
            <i className="fa-solid fa-circle-exclamation text-red-600 mt-1"></i>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">Cảnh báo quan trọng!</h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Tất cả bài viết của bạn sẽ bị ẩn vĩnh viễn</li>
                <li>• Tất cả bình luận của bạn sẽ hiển thị là "Người dùng đã xóa"</li>
                <li>• Bạn sẽ không thể đăng nhập lại với tài khoản này</li>
                <li>• Email và username sẽ không thể được sử dụng lại</li>
                <li>• Dữ liệu cá nhân sẽ bị xóa khỏi hệ thống</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label className="block font-semibold mb-2 text-gray-700">
            <i className="fa-solid fa-lock mr-2"></i>
            Nhập mật khẩu của bạn để xác nhận
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full p-3 pr-12 rounded-lg bg-gray-50 border-3 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại..."
              disabled={isLoading}
              onKeyDown={(e) => e.key === 'Enter' && isValid && handleSubmit()}
            />
            <button
              type="button"
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                !password.trim() || isLoading
                  ? 'text-gray-300 cursor-not-allowed opacity-50'
                  : 'text-gray-500 hover:text-gray-700 cursor-pointer'
              }`}
              onClick={() => setShowPassword(!showPassword)}
              disabled={!password.trim() || isLoading}
            >
              <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        {/* Confirmation Text Input */}
        <div className="mb-4">
          <label className="block font-semibold mb-2 text-gray-700">
            <i className="fa-solid fa-keyboard mr-2"></i>
            Nhập "XÓA TÀI KHOẢN" để xác nhận
          </label>
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-gray-50 border-3 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 outline-none font-mono"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="Nhập: XOA TAI KHOAN"
            disabled={isLoading}
            onKeyDown={(e) => e.key === 'Enter' && isValid && handleSubmit()}
          />
          {confirmText && confirmText !== 'XÓA TÀI KHOẢN' && confirmText !== 'XOA TAI KHOAN' && (
            <p className="text-sm text-red-600 mt-1">
              <i className="fa-solid fa-circle-xmark mr-1"></i>
              Vui lòng nhập: "XOA TAI KHOAN" hoặc "XÓA TÀI KHOẢN"
            </p>
          )}
        </div>

        {/* Agreement Checkbox */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-red-600 focus:ring-2 focus:ring-red-100 cursor-pointer"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={isLoading}
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              Tôi hiểu rằng thao tác này không thể hoàn tác và tôi muốn xóa vĩnh viễn tài khoản của mình cùng tất cả dữ liệu liên quan.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="group flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={handleClose}
            disabled={isLoading}
          >
            <i className="fa-solid fa-times mr-2 group-hover:rotate-90 transition-transform duration-200"></i>
            Hủy bỏ
          </button>
          <button
            className={`group flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              isValid && !isLoading
                ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-2xl hover:scale-105 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="fa-solid fa-trash mr-2"></i>
                Xóa tài khoản vĩnh viễn
              </>
            )}
          </button>
        </div>
      </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
