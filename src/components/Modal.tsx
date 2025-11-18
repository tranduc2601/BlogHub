import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  confirmText?: string;
  cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy'
}) => {

  React.useEffect(() => {
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

  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'fa-circle-check', color: 'text-green-600', bg: 'bg-green-100' };
      case 'error':
        return { icon: 'fa-circle-xmark', color: 'text-red-600', bg: 'bg-red-100' };
      case 'warning':
        return { icon: 'fa-triangle-exclamation', color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'confirm':
        return { icon: 'fa-circle-question', color: 'text-blue-600', bg: 'bg-blue-100' };
      default:
        return { icon: 'fa-circle-info', color: 'text-blue-600', bg: 'bg-blue-100' };
    }
  };

  const { icon, color, bg } = getIconAndColor();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className={`${bg} ${color} w-12 h-12 rounded-full flex items-center justify-center`}>
              <i className={`fa-solid ${icon} text-2xl`}></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          </div>
        </div>

        
        <div className="px-6 pb-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        
        <div className="px-6 pb-6 flex gap-3 justify-end">
          {type === 'confirm' || onConfirm ? (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 border border-transparent hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg"
              >
                <i className="fa-solid fa-xmark mr-2"></i>{cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
                className={
                  (type === 'warning' && confirmText?.toLowerCase().includes('xóa'))
                    ? 'px-5 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 hover:scale-105 hover:shadow-xl transition-all duration-200 cursor-pointer'
                    : 'px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg cursor-pointer'
                }
              >
                <i className={`fa-solid ${
                  (type === 'warning' && confirmText?.toLowerCase().includes('xóa'))
                    ? 'fa-trash-can'
                    : 'fa-check'
                } mr-2`}></i>{confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
