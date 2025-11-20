import { useState, useEffect } from 'react';

interface ReportCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  commentContent: string;
  commentAuthor: string;
}

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam hoặc quảng cáo' },
  { id: 'harassment', label: 'Quấy rối hoặc bắt nạt' },
  { id: 'hate', label: 'Ngôn từ thù địch hoặc kỳ thị' },
  { id: 'violence', label: 'Bạo lực hoặc nguy hiểm' },
  { id: 'misinformation', label: 'Thông tin sai lệch' },
  { id: 'adult', label: 'Nội dung người lớn' },
  { id: 'inappropriate', label: 'Nội dung không phù hợp' },
  { id: 'other', label: 'Lý do khác' }
];

export default function ReportCommentModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  commentContent,
  commentAuthor 
}: ReportCommentModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    const reason = selectedReason === 'other' ? customReason : REPORT_REASONS.find(r => r.id === selectedReason)?.label;
    
    if (!reason || reason.trim() === '') {
      alert('Vui lòng chọn lý do báo cáo');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(reason);
      setSelectedReason('');
      setCustomReason('');
      handleClose();
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedReason('');
      setCustomReason('');
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
      isClosing ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className={`bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 ${
        isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-fadeIn'
      }`}>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
              <div>
                <h2 className="text-2xl font-bold">Báo cáo bình luận vi phạm</h2>
                <p className="text-red-100 text-sm mt-1">Giúp chúng tôi duy trì cộng đồng lành mạnh</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors cursor-pointer"
              disabled={isSubmitting}
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>
        </div>

        
        <div className="p-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Bình luận được báo cáo từ: <span className="font-semibold text-gray-800">{commentAuthor}</span></p>
            <div className="bg-white rounded-lg p-3 mt-2 border-l-4 border-red-500">
              <p className="text-gray-800 line-clamp-3">{commentContent}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-clipboard-list text-red-500"></i>
              Chọn lý do báo cáo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {REPORT_REASONS.map(reason => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`p-4 rounded-xl border-4 transition-all text-center cursor-pointer ${
                    selectedReason === reason.id
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                  }`}
                  disabled={isSubmitting}
                >
                  <span className={`font-medium ${
                    selectedReason === reason.id ? 'text-red-700' : 'text-gray-700'
                  }`}>
                    {reason.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          
          {selectedReason === 'other' && (
            <div className="mb-6 animate-fadeIn">
              <label className="block font-semibold text-gray-800 mb-2">
                <i className="fa-solid fa-pen text-red-500 mr-2"></i>
                Chi tiết lý do
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết lý do báo cáo bình luận này..."
                className="w-full border-2 border-gray-300 rounded-xl p-4 focus:border-red-500 focus:outline-none resize-none"
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          )}

          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <i className="fa-solid fa-info-circle text-blue-500 text-xl mt-0.5"></i>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Báo cáo của bạn sẽ được xem xét bởi đội ngũ quản trị</li>
                  <li>Bạn sẽ nhận được thông báo khi admin xử lý báo cáo</li>
                  <li>Vui lòng chỉ báo cáo nội dung thực sự vi phạm quy định</li>
                  <li>Báo cáo giả mạo có thể bị xử lý kỷ luật</li>
                </ul>
              </div>
            </div>
          </div>

          
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              <i className="fa-solid fa-xmark mr-0.5"></i>Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              disabled={isSubmitting || !selectedReason || (selectedReason === 'other' && !customReason.trim())}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Đang gửi...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  Gửi báo cáo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
