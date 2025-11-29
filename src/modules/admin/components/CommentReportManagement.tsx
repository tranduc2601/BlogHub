import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '@/core/config/axios';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '@/shared/utils/apiHelpers';

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

interface PostDetail {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: string;
  authorAvatar?: string;
  category: string;
  tags?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: number;
  content: string;
  author: string;
  authorId: number;
  authorAvatar?: string;
  authorRole?: string;
  createdAt: string;
  isHidden?: boolean;
  isPinned?: boolean;
  replies?: Reply[];
}

interface Reply {
  id: number;
  content: string;
  author: string;
  authorId: number;
  authorAvatar?: string;
  authorRole?: string;
  createdAt: string;
  isHidden?: boolean;
}

const CommentReportManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [reports, setReports] = useState<CommentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'rejected' | 'action_taken'>(
    (searchParams.get('status') as 'all' | 'pending' | 'reviewed' | 'rejected' | 'action_taken') || 'all'
  );
  const [selectedReport, setSelectedReport] = useState<CommentReport | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'hide' | 'reject'>('hide');
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [reasonFilter, setReasonFilter] = useState<string>(searchParams.get('reason') || 'all');
  const REPORTS_PER_PAGE = 5;

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
    // Lọc theo trạng thái
    if (filter !== 'all' && report.status !== filter) return false;
    
    // Lọc theo lý do
    if (reasonFilter !== 'all' && !report.reason.toLowerCase().includes(reasonFilter.toLowerCase())) return false;
    
    // Tìm kiếm theo nội dung, tác giả bình luận, người báo cáo
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        report.commentContent.toLowerCase().includes(query) ||
        report.commentAuthor.toLowerCase().includes(query) ||
        report.reporterUsername.toLowerCase().includes(query) ||
        report.postTitle.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Tính toán phân trang
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, reasonFilter]);

  // Cập nhật URL khi state thay đổi
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    if (searchQuery) params.set('search', searchQuery);
    if (reasonFilter !== 'all') params.set('reason', reasonFilter);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [filter, searchQuery, reasonFilter, currentPage, setSearchParams]);

  const totalPages = Math.ceil(filteredReports.length / REPORTS_PER_PAGE);
  const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
  const endIndex = startIndex + REPORTS_PER_PAGE;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  // Tự động chuyển về trang trước nếu trang hiện tại không còn báo cáo nào
  useEffect(() => {
    if (paginatedReports.length === 0 && currentPage > 1 && filteredReports.length > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [paginatedReports.length, currentPage, filteredReports.length]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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

  const handleViewPost = async (postId: number) => {
    try {
      const [postResponse, commentsResponse] = await Promise.all([
        axios.get(`/posts/${postId}`),
        axios.get(`/posts/${postId}/comments`)
      ]);
      
      if (postResponse.data.success) {
        setSelectedPost(postResponse.data.post);
      }

      if (commentsResponse.data.success) {
        setIsLoadingComments(false);
        setPostComments(commentsResponse.data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch post detail:', error);
      toast.error('Không thể tải chi tiết bài viết!');
      setIsLoadingComments(false);
    }
  };

  const handleClosePostModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPost(null);
      setPostComments([]);
      setIsClosing(false);
    }, 300);
  };

  const getCommentAvatar = (avatar?: string) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return getAvatarUrl(avatar);
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Quản lý báo cáo bình luận</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Xử lý các báo cáo bình luận vi phạm từ người dùng</p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            Tất cả ({reports.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            Chờ ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('action_taken')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
              filter === 'action_taken'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            Ẩn ({reports.filter(r => r.status === 'action_taken').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
              filter === 'rejected'
                ? 'bg-gray-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            Từ chối ({reports.filter(r => r.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Bộ lọc và tìm kiếm - responsive */}
      <div className="bg-white rounded-[16px] p-4 sm:p-6 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Input tìm kiếm */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              <i className="fa-solid fa-magnifying-glass mr-2 text-blue-600"></i>
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo nội dung, tác giả..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-3 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                <i className="fa-solid fa-filter mr-1"></i>
                Tìm thấy {filteredReports.length} kết quả
              </p>
            )}
          </div>

          {/* Select lọc theo lý do */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              <i className="fa-solid fa-list mr-2 text-blue-600"></i>
              Lọc theo lý do
            </label>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-3 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%232563eb'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.25rem'
              }}
            >
              <option value="all">Tất cả lý do</option>
              <option value="spam">Spam hoặc quảng cáo</option>
              <option value="harassment">Quấy rối hoặc bắt nạt</option>
              <option value="hate">Ngôn từ thù địch</option>
              <option value="violence">Bạo lực hoặc nguy hiểm</option>
              <option value="misinformation">Thông tin sai lệch</option>
              <option value="adult">Nội dung người lớn</option>
              <option value="inappropriate">Nội dung không phù hợp</option>
            </select>
          </div>
        </div>

        {/* Nút reset filter */}
        {(searchQuery || reasonFilter !== 'all') && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setReasonFilter('all');
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-rotate-right"></i>
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-[16px] p-8 text-center shadow-lg">
            <p className="text-gray-500">Không có báo cáo nào</p>
          </div>
        ) : (
          paginatedReports.map(report => (
            <div
              key={report.id}
              className={`bg-white rounded-[16px] p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl ${
                report.status === 'pending' ? 'border-2 border-yellow-400' : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
                {/* Report content - responsive */}
                <div className="flex-1 w-full lg:w-auto">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 break-words">{report.postTitle}</h3>
                    {getStatusBadge(report.status)}
                    {report.status !== 'pending' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        <i className="fa-solid fa-check-double mr-1"></i>Đã xử lý
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-3 border-l-4 border-red-500">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      <span className="font-semibold">Bình luận từ:</span> {report.commentAuthor}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-800 bg-white p-3 rounded-lg mt-2">{report.commentContent}</p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded mb-3">
                    <p className="text-xs sm:text-sm text-red-800">
                      <span className="font-semibold">Lý do:</span> {report.reason}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
                    <div>
                      <p className="mt-2"><span className="font-semibold"><i className="fa-solid fa-user mr-2"></i>Người báo cáo:</span> {report.reporterUsername}</p>
                      <p className="mt-2"><span className="font-semibold"><i className="fa-solid fa-user-pen mr-2"></i>Tác giả bình luận:</span> {report.commentAuthor}</p>
                    </div>
                    <div>
                      {report.reviewedAt && (
                        <p className="ml-180"><span className="font-semibold">Ngày xử lý:</span> {formatDate(report.reviewedAt)}</p>
                      )}
                      {report.reviewerUsername && (
                        <p className="ml-180"><span className="font-semibold">Xử lý bởi:</span> {report.reviewerUsername}</p>
                      )}
                    </div>
                  </div>

                  {report.adminResponse && (
                    <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500 mb-3">
                      <p className="text-sm font-semibold text-blue-800 mb-1">
                        <i className="fa-solid fa-comment-dots mr-1"></i>
                        Phản hồi của Admin:
                      </p>
                      <p className="text-gray-700">{report.adminResponse}</p>
                    </div>
                  )}
                  
                  {/* Footer with date and view button - responsive */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <p className="text-xs text-gray-500">
                      Ngày báo cáo: {formatDate(report.createdAt)}
                    </p>
                    
                    <button
                      onClick={() => handleViewPost(report.postId)}
                      className="px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm sm:text-base font-medium transition-all shadow-md cursor-pointer hover:scale-105 hover:shadow-lg w-full sm:w-auto"
                      title="Xem chi tiết bài viết"
                    >
                      <i className="fa-solid fa-eye mr-2"></i>
                      Xem bài viết
                    </button>
                  </div>

                  {/* Action buttons - responsive */}
                  {report.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 mt-4 justify-end">
                    <button
                      onClick={() => handleOpenModal(report, 'hide')}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group cursor-pointer"
                    >
                      <i className="fa-solid fa-ban mr-1 sm:mr-2 group-hover:rotate-12 transition-transform duration-300"></i>Ẩn
                    </button>
                    <button
                      onClick={() => handleOpenModal(report, 'reject')}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group cursor-pointer"
                    >
                      <i className="fa-solid fa-times mr-1 sm:mr-2 group-hover:rotate-90 transition-transform duration-300"></i>Từ chối
                    </button>
                  </div>
                )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Phân trang - responsive */}
        {totalPages > 1 && paginatedReports.length > 0 && (
          <div className="bg-white rounded-[16px] shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Hiển thị <span className="font-semibold">{startIndex + 1}</span> đến{' '}
                <span className="font-semibold">{Math.min(endIndex, filteredReports.length)}</span> trong tổng số{' '}
                <span className="font-semibold">{filteredReports.length}</span> báo cáo
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                  }`}
                >
                  <i className="fa-solid fa-chevron-left mr-1 sm:mr-2"></i>
                  <span className="hidden sm:inline">Trang trước</span>
                  <span className="sm:hidden">Trước</span>
                </button>
                <div className="flex items-center gap-2 px-2 sm:px-4">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                    Trang {currentPage} / {totalPages}
                  </span>
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                  }`}
                >
                  <span className="hidden sm:inline">Trang sau</span>
                  <span className="sm:hidden">Sau</span>
                  <i className="fa-solid fa-chevron-right ml-1 sm:ml-2"></i>
                </button>
              </div>
            </div>
          </div>
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

      {/* Post Detail Modal */}
      {selectedPost && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            isClosing ? 'opacity-0' : 'opacity-100 animate-fadeIn'
          }`}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', backdropFilter: isClosing ? 'blur(0px)' : 'blur(1px)' }}
          onClick={handleClosePostModal}
        >
          <div 
            className={`bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden relative transition-all duration-300 ${
              isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0 animate-slideUp'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-blue-600 flex items-center justify-between px-8 py-5 shadow-xl">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                {selectedPost.authorAvatar ? (
                  <img
                    src={getAvatarUrl(selectedPost.authorAvatar)}
                    alt={selectedPost.author}
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-lg"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white/20 ring-4 ring-white shadow-lg flex items-center justify-center">
                    <i className="fa-solid fa-user text-2xl text-white"></i>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-file-lines"></i>
                    Chi tiết bài viết
                  </h2>
                  <p className="text-blue-100 text-sm mt-0.5">Người đăng: {selectedPost.author}</p>
                </div>
              </div>
              <button
                onClick={handleClosePostModal}
                className="group w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-red-500 hover:rotate-180 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:scale-110"
                title="Đóng"
              >
                <i className="fa-solid fa-xmark text-2xl text-white group-hover:scale-125 transition-transform duration-300"></i>
              </button>
            </div>
                  
            <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
              {/* Content */}
              <div className="p-8 border-b border-gray-200">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-blue-600 mb-2">
                    {selectedPost.title}
                  </h3>
                  
                  {/* Tags */}
                  {selectedPost.tags && (() => {
                    try {
                      let tags: string[] = [];
                      
                      // Check if already an array
                      if (Array.isArray(selectedPost.tags)) {
                        tags = selectedPost.tags;
                      } else if (typeof selectedPost.tags === 'string') {
                        // Try parsing as JSON first
                        try {
                          const parsed = JSON.parse(selectedPost.tags);
                          if (Array.isArray(parsed)) {
                            tags = parsed;
                          }
                        } catch {
                          // If not JSON, treat as comma-separated string
                          tags = selectedPost.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
                        }
                      }
                      
                      if (tags.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-2 mt-3 mb-4">
                            {tags.map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full shadow-md hover:bg-cyan-600 hover:shadow-lg hover:scale-105 transition-all duration-200"
                              >
                                <i className="fa-solid fa-tag text-xs"></i>
                                {tag}
                              </span>
                            ))}
                          </div>
                        );
                      }
                    } catch (e) {
                      console.error('Error parsing tags:', e);
                    }
                    return null;
                  })()}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                      <i className="fa-solid fa-calendar text-blue-600"></i>
                      <span className="font-medium">{formatDate(selectedPost.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                      <i className="fa-solid fa-eye text-green-600"></i>
                      <span className="font-medium">{selectedPost.views} lượt xem</span>
                    </div>
                  </div>
                </div>

                {/* Featured Image */}
                {selectedPost.featuredImage && (
                  <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={selectedPost.featuredImage} 
                      alt={selectedPost.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {/* Excerpt */}
                {selectedPost.excerpt && (
                  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <p className="text-gray-700 italic">{selectedPost.excerpt}</p>
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />
                </div>
              </div>

              {/* Comments Section */}
              <div className="p-8 bg-gray-50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                  <h4 className="text-xl font-bold text-gray-800">
                    <i className="fa-solid fa-comments text-blue-600 mr-2"></i>
                    Bình luận 
                    <span className="ml-2 text-lg text-black font-bold">
                      ({postComments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
                    </span>
                  </h4>
                </div>

                <div className="space-y-4">
                  {isLoadingComments ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải...</p>
                      </div>
                    </div>
                  ) : postComments.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-comments text-4xl text-gray-400"></i>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có bình luận nào!</h3>
                      <p className="text-gray-500">Bài viết này chưa có bình luận hay phản hồi từ người dùng</p>
                    </div>
                  ) : (
                    postComments.map(comment => {
                      const commentAvatarUrl = getCommentAvatar(comment.authorAvatar);
                      const isAdmin = comment.authorRole === 'admin';
                      
                      return (
                        <div key={comment.id}>
                          {/* Comment */}
                          <div
                            className={`p-5 rounded-2xl border-2 shadow-md ${
                              comment.isHidden 
                                ? 'bg-gray-100 border-gray-300 opacity-50' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3 flex-1">
                                {/* Avatar */}
                                <div className="relative w-10 h-10 flex-shrink-0">
                                  {commentAvatarUrl ? (
                                    <img 
                                      src={commentAvatarUrl} 
                                      alt={comment.author}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div style={{ display: commentAvatarUrl ? 'none' : 'flex' }} className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center text-white font-bold border-2 border-blue-500">
                                    {comment.author.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-800">{comment.author}</p>
                                    {comment.isPinned && (
                                      <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full font-semibold">
                                        <i className="fa-solid fa-thumbtack mr-1"></i>Đã ghim
                                      </span>
                                    )}
                                    {isAdmin && (
                                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-semibold">
                                        <i className="fa-solid fa-shield-halved mr-1"></i>Admin
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-sm mt-1">{comment.content}</p>
                                  <p className="text-gray-400 text-xs mt-2">
                                    <i className="fa-solid fa-calendar mr-2"></i>
                                    {formatDate(comment.createdAt)}
                                  </p>
                                </div>
                              </div>
                              {comment.isHidden && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                  Đã ẩn
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-8 mt-3 space-y-3">
                              {comment.replies.map((reply) => {
                                const replyAvatarUrl = getCommentAvatar(reply.authorAvatar);
                                const isReplyAdmin = reply.authorRole === 'admin';
                                
                                return (
                                  <div
                                    key={reply.id}
                                    className={`p-5 rounded-2xl border-2 shadow-md ${
                                      reply.isHidden 
                                        ? 'bg-gray-100 border-gray-300 opacity-50' 
                                        : 'bg-blue-50 border-blue-200'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex gap-3 flex-1">
                                        {/* Avatar */}
                                        <div className="relative w-10 h-10 flex-shrink-0">
                                          {replyAvatarUrl ? (
                                            <img 
                                              src={replyAvatarUrl} 
                                              alt={reply.author}
                                              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                                              onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                              }}
                                            />
                                          ) : null}
                                          <div style={{ display: replyAvatarUrl ? 'none' : 'flex' }} className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center text-white font-bold border-2 border-blue-500">
                                            {reply.author.charAt(0).toUpperCase()}
                                          </div>
                                        </div>
                                        
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-800">{reply.author}</p>
                                            {isReplyAdmin && (
                                              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-semibold">
                                                <i className="fa-solid fa-shield-halved mr-1"></i>Admin
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-gray-600 text-sm mt-1">{reply.content}</p>
                                          <p className="text-gray-400 text-xs mt-2">
                                            <i className="fa-solid fa-calendar mr-2"></i>
                                            {formatDate(reply.createdAt)}
                                          </p>
                                        </div>
                                      </div>
                                      {reply.isHidden && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                          Đã ẩn
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>


            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentReportManagement;
