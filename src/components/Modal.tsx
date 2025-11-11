/**
 * Modal Component - Reusable modal for confirmations and notifications
 */

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className={`${bg} ${color} w-12 h-12 rounded-full flex items-center justify-center`}>
              <i className={`fa-solid ${icon} text-2xl`}></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 justify-end">
          {type === 'confirm' || onConfirm ? (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
              >
                {confirmText}
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
