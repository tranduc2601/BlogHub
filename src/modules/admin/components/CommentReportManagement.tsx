import React, { useState, useEffect } from 'react';
import axios from '@/core/config/axios';
import toast from 'react-hot-toast';

interface CommentReport {
  id: number;
  commentId: number;
  reporterId: number;
  reason: string;
  status: 'pending' | 'reviewed' | 'rejected' | 'action_taken';
  adminResponse: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  createdAt: string;
  commentContent: string;
  commentAuthor: string;
  commentAuthorId: number;
  reporterUsername: string;
  postId: number;
  postTitle: string;
  reviewerUsername: string | null;
}

const CommentReportManagement: React.FC = () => {
  const [reports, setReports] = useState<CommentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'rejected' | 'action_taken'>('all');
  const [selectedReport, setSelectedReport] = useState<CommentReport | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'hide' | 'reject'>('hide');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/admin/comment-reports');
      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Error fetching comment reports:', error);
      toast.error('Không thể tải danh sách báo cáo bình luận!');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  const handleOpenModal = (report: CommentReport, action: 'hide' | 'reject') => {
    setSelectedReport(report);
    setActionType(action);
    setAdminResponse('');
    setShowModal(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedReport) return;

    try {
      const response = await axios.put(`/admin/comment-reports/${selectedReport.id}/handle`, {
        action: actionType,
        adminResponse: adminResponse.trim() || undefined
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchReports();
        setShowModal(false);
        setSelectedReport(null);
        setAdminResponse('');
      }
    } catch (error) {
      console.error('Error handling comment report:', error);
      toast.error('Không thể xử lý báo cáo!');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
          <i className="fa-solid fa-clock mr-1"></i> Chờ xử lý
        </span>;
      case 'action_taken':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
          <i className="fa-solid fa-check mr-1"></i> Đã ẩn
        </span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
          <i className="fa-solid fa-times mr-1"></i> Đã từ chối
        </span>;
      case 'reviewed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          <i className="fa-solid fa-check-circle mr-1"></i> Đã xem xét
        </span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý báo cáo bình luận</h2>
          <p className="text-gray-600 mt-1">Xử lý các báo cáo bình luận vi phạm từ người dùng</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Tất cả ({reports.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'pending'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Chờ xử lý ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('action_taken')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'action_taken'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Đã ẩn ({reports.filter(r => r.status === 'action_taken').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'rejected'
                ? 'bg-gray-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Đã từ chối ({reports.filter(r => r.status === 'rejected').length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-[16px] p-8 text-center shadow-lg">
            <p className="text-gray-500">Không có báo cáo nào</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-[16px] p-6 shadow-lg transition-all hover:shadow-xl"
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(report.status)}
                    <span className="text-xs text-gray-500">
                      <i className="fa-regular fa-calendar mr-1"></i>
                      {formatDate(report.createdAt)}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mb-3 border-l-4 border-red-500 mt-5">
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">Bình luận từ:</span> {report.commentAuthor}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">Trên bài viết:</span> "{report.postTitle}"
                    </p>
                    <p className="text-gray-800 bg-white p-3 rounded-lg">{report.commentContent}</p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3 mb-3 mt-7">
                    <p className="text-sm font-semibold text-orange-800 mb-1">
                      <i className="fa-solid fa-exclamation-triangle mr-1"></i>
                      Lý do báo cáo:
                    </p>
                    <p className="text-gray-700">{report.reason}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      <i className="fa-solid fa-user mr-1"></i>
                      Người báo cáo: {report.reporterUsername}
                    </p>
                  </div>

                  {report.adminResponse && (
                    <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                      <p className="text-sm font-semibold text-blue-800 mb-1">
                        <i className="fa-solid fa-comment-dots mr-1"></i>
                        Phản hồi của Admin:
                      </p>
                      <p className="text-gray-700">{report.adminResponse}</p>
                      {report.reviewerUsername && (
                        <p className="text-xs text-gray-500 mt-2">
                          <i className="fa-solid fa-user-shield mr-1"></i>
                          Xử lý bởi: {report.reviewerUsername} • {report.reviewedAt && formatDate(report.reviewedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {report.status === 'pending' && (
                  <div className="flex gap-2 mt-36">
                    <button
                      onClick={() => handleOpenModal(report, 'hide')}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group cursor-pointer"
                    >
                      <i className="fa-solid fa-ban mr-2 group-hover:rotate-12 transition-transform duration-300"></i>Ẩn bình luận
                    </button>
                    <button
                      onClick={() => handleOpenModal(report, 'reject')}
                      className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group cursor-pointer"
                    >
                      <i className="fa-solid fa-times mr-2 group-hover:rotate-90 transition-transform duration-300"></i>Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal xử lý báo cáo */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className={`p-6 ${actionType === 'hide' ? 'bg-red-600' : 'bg-gray-600'} text-white rounded-t-2xl flex justify-between items-center`}>
              <h3 className="text-xl font-bold">
                {actionType === 'hide' ? 'Ẩn bình luận vi phạm' : 'Từ chối báo cáo'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                aria-label="Đóng"
              >
                <i className="fa-solid fa-times text-xl group-hover:rotate-90 transition-transform duration-300"></i>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Bình luận:</p>
                <p className="text-gray-800">{selectedReport.commentContent}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {actionType === 'hide' ? 'Lý do ẩn bình luận:' : 'Phản hồi cho người dùng (tùy chọn):'}
                  {actionType === 'hide' && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="w-full border-3 border-gray-300 rounded-xl p-3 focus:border-blue-500 focus:outline-none resize-none"
                  rows={4}
                  placeholder={
                    actionType === 'hide'
                      ? 'Nhập lý do ẩn bình luận để thông báo cho tác giả...'
                      : 'Nhập lý do từ chối để thông báo cho người báo cáo...'
                  }
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer group"
                >
                  <i className="fa-solid fa-times mr-2 group-hover:rotate-90 transition-transform duration-300"></i>Hủy
                </button>
                <button
                  onClick={handleSubmitAction}
                  disabled={actionType === 'hide' && !adminResponse.trim()}
                  className={`flex-1 px-6 py-3 text-white rounded-xl font-medium transition-all duration-300 shadow-lg group ${
                    actionType === 'hide' && !adminResponse.trim()
                      ? 'bg-gray-300 cursor-not-allowed opacity-50'
                      : actionType === 'hide'
                        ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer'
                        : 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer'
                  }`}
                >
                  <i className={`fa-solid ${actionType === 'hide' ? 'fa-ban group-hover:rotate-12' : 'fa-check group-hover:scale-125'} mr-2 transition-transform duration-300`}></i>
                  {actionType === 'hide' ? 'Xác nhận ẩn' : 'Xác nhận từ chối'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentReportManagement;
