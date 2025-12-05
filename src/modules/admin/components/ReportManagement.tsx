/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '@/core/config/axios';
import toast from 'react-hot-toast';
import { Modal } from '@/shared/ui';
import { getAvatarUrl, getApiUrl } from '@/shared/utils/apiHelpers';

interface Report {
  id: number;
  postId: number;
  postTitle: string;
  reportedByUser: string;
  postAuthor: string;
  postAuthorId: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedByUser?: string;
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
  author: string;
  authorId?: number;
  authorAvatar?: string;
  authorRole?: string;
  content: string;
  createdAt: string;
  isHidden: boolean;
  isPinned?: boolean;
  parentId?: number | null;
  replies?: Comment[];
}

interface ReportManagementProps {
  onPendingCountChange?: (count: number) => void;
}

const ReportManagement: React.FC<ReportManagementProps> = ({ onPendingCountChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    (searchParams.get('status') as 'all' | 'pending' | 'approved' | 'rejected') || 'all'
  );
  const [reasonFilter, setReasonFilter] = useState<string>(searchParams.get('reason') || '');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [currentPostAuthorId, setCurrentPostAuthorId] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const getCommentAvatar = (avatarUrl?: string) => {
    return avatarUrl || null;
  };
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'info' | 'warning' | 'error' | 'success' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const REPORTS_PER_PAGE = 5;

  const REPORT_REASONS = [
    { id: 'spam', label: 'Spam hoặc quảng cáo' },
    { id: 'harassment', label: 'Quấy rối hoặc bắt nạt' },
    { id: 'hate', label: 'Ngôn từ thù địch hoặc kỳ thị' },
    { id: 'violence', label: 'Bạo lực hoặc nguy hiểm' },
    { id: 'misinformation', label: 'Thông tin sai lệch' },
    { id: 'adult', label: 'Nội dung người lớn' },
    { id: 'copyright', label: 'Vi phạm bản quyền' },
    { id: 'other', label: 'Lý do khác' }
  ];

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    if (reasonFilter) params.set('reason', reasonFilter);
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [filter, reasonFilter, searchQuery, currentPage, setSearchParams]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/admin/reports');
      if (response.data.success) {
        setReports(response.data.reports);

        if (onPendingCountChange) {
          const pendingCount = response.data.reports.filter((r: Report) => r.status === 'pending').length;
          onPendingCountChange(pendingCount);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Không thể tải danh sách báo cáo!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (reportId: number) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Duyệt báo cáo vi phạm',
      message: 'Bạn có chắc muốn duyệt báo cáo này? Người dùng sẽ nhận cảnh báo và có thể bị khóa tài khoản nếu vi phạm 3 lần.',
      onConfirm: async () => {
        try {
          const response = await axios.put(`/admin/reports/${reportId}/approve`);
          if (response.data.success) {
            toast.success(response.data.message);
            fetchReports();
            window.dispatchEvent(new Event('admin-action-changed'));
          }
        } catch (error) {
          console.error('Failed to approve report:', error);
          toast.error('Không thể duyệt báo cáo!');
        }
      }
    });
  };

  const handleReject = async (reportId: number) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Từ chối báo cáo',
      message: 'Bạn có chắc muốn từ chối báo cáo này? Bài viết sẽ không bị cảnh cáo.',
      onConfirm: async () => {
        try {
          const response = await axios.put(`/admin/reports/${reportId}/reject`);
          if (response.data.success) {
            toast.success(response.data.message);
            fetchReports();
            window.dispatchEvent(new Event('admin-action-changed'));
          }
        } catch (error) {
          console.error('Failed to reject report:', error);
          toast.error('Không thể từ chối báo cáo!');
        }
      }
    });
  };

  const handleDeleteReport = async (reportId: number) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Xóa báo cáo',
      message: 'Bạn có chắc muốn xóa báo cáo này? Báo cáo sẽ được lưu vào lịch sử.',
      onConfirm: async () => {
        try {
          const response = await axios.delete(`/admin/reports/${reportId}`);
          if (response.data.success) {
            toast.success('Đã xóa báo cáo và lưu vào lịch sử!');
            fetchReports();
            window.dispatchEvent(new Event('admin-action-changed'));
          }
        } catch (error) {
          console.error('Failed to delete report:', error);
          toast.error('Không thể xóa báo cáo!');
        }
      }
    });
  };

  const handleViewPost = async (postId: number) => {
    try {
      setPostComments([]);
      setIsLoadingComments(true);
      

      const postResponse = await axios.get(`/posts/${postId}`);
      if (postResponse.data.success) {
        setSelectedPost(postResponse.data.post);
        setCurrentPostAuthorId(postResponse.data.post.authorId);
      }


      const response = await fetch(getApiUrl(`posts/${postId}/comments`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.comments) {

        let pinnedCommentId: string | null = null;
        try {
          const pinnedResponse = await fetch(getApiUrl(`posts/${postId}/pinned-comment`), {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
            }
          });
          const pinnedData = await pinnedResponse.json();
          if (pinnedData.pinnedCommentId) {
            pinnedCommentId = pinnedData.pinnedCommentId.toString();
          }
        } catch (err) {
          console.error('Error fetching pinned comment:', err);
        }

        const transformedComments: Comment[] = data.comments.map((c: any) => ({
          id: parseInt(c.id),
          author: c.author.username || c.author.email,
          authorId: c.authorId,
          authorAvatar: c.author.avatarUrl,
          authorRole: c.author.role,
          content: c.content,
          createdAt: c.createdAt,
          isHidden: false,
          isPinned: pinnedCommentId === c.id,
          parentId: c.parentId ? parseInt(c.parentId) : null,
          replies: []
        }));

        const commentMap = new Map<number, Comment>();
        const rootComments: Comment[] = [];
        
        transformedComments.forEach(comment => {
          commentMap.set(comment.id, comment);
        });
        
        transformedComments.forEach(comment => {
          if (comment.parentId) {
            const parent = commentMap.get(comment.parentId);
            if (parent) {
              parent.replies!.push(comment);
            }
          } else {
            rootComments.push(comment);
          }
        });
        

        rootComments.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0;
        });
        
        setPostComments(rootComments);
      }
    } catch (error) {
      console.error('Failed to fetch post detail:', error);
      toast.error('Không thể tải chi tiết bài viết!');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPost(null);
      setPostComments([]);
      setCurrentPostAuthorId(null);
      setIsClosing(false);
    }, 300);
  };

  const filteredReports = reports
    .filter(report => {
      const matchesFilter = filter === 'all' || report.status === filter;
      const matchesSearch = report.postTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesReason = !reasonFilter || report.reason === reasonFilter;
      return matchesFilter && matchesSearch && matchesReason;
    })
    .sort((a, b) => {

      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      

      if (a.status === 'pending' && b.status === 'pending') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      

      if (a.reviewedAt && b.reviewedAt) {
        return new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime();
      }
      
      return 0;
    });

  const totalPages = Math.ceil(filteredReports.length / REPORTS_PER_PAGE);
  const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
  const endIndex = startIndex + REPORTS_PER_PAGE;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);


  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, reasonFilter]);


  useEffect(() => {
    if (paginatedReports.length === 0 && currentPage > 1 && filteredReports.length > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [paginatedReports.length, currentPage, filteredReports.length]);

  // Disable page scrolling when modal is open
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPost]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full"><i className="fa-solid fa-hourglass-end mr-1"></i>Chờ xử lý</span>;
      case 'approved':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">✓ Đã duyệt</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✗ Đã từ chối</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (isLoading) {
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Quản lý báo cáo bài viết</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Xử lý báo cáo bài viết vi phạm từ người dùng</p>
        </div>
        

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            }`}
          >
            Tất cả ({reports.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all cursor-pointer whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-200'
                : 'bg-white text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            }`}
          >
            Chờ ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all cursor-pointer whitespace-nowrap ${
              filter === 'approved'
                ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                : 'bg-white text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            }`}
          >
            Duyệt ({reports.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all cursor-pointer whitespace-nowrap ${
              filter === 'rejected'
                ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                : 'bg-white text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            }`}
          >
            Từ chối ({reports.filter(r => r.status === 'rejected').length})
          </button>
        </div>
      </div>


      <div className="bg-white rounded-[16px] p-4 sm:p-6 shadow-lg grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

        <div>
          <label htmlFor="search" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            <i className="fa-solid fa-magnifying-glass mr-2"></i>Tìm kiếm bài viết
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập tên bài viết..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-3 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>


        <div>
          <label htmlFor="reasonFilter" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            <i className="fa-solid fa-filter mr-2"></i>Lọc theo lý do
          </label>
          <select
            id="reasonFilter"
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3.5 text-sm sm:text-base border-3 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Tất cả lý do</option>
            {REPORT_REASONS.map(reason => (
              <option key={reason.id} value={reason.label}>{reason.label}</option>
            ))}
          </select>
        </div>
      </div>

      
      <div className="space-y-4">
        {paginatedReports.length === 0 ? (
          <div className="bg-white rounded-[16px] p-8 text-center shadow-lg">
            <p className="text-gray-500">Chưa có báo cáo nào!</p>
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

                <div className="flex-1 w-full lg:w-auto">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 break-words mr-1">{report.postTitle}</h3>
                    {getStatusBadge(report.status)}
                    {report.status !== 'pending' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        <i className="fa-solid fa-check-double mr-1"></i>Đã xử lý
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded mb-3">
                    <p className="text-xs sm:text-sm text-red-800">
                      <span className="font-semibold">Lý do:</span> {report.reason}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
                    <div>
                      <p className="mt-2"><span className="font-semibold"><i className="fa-solid fa-file-lines mr-2"></i>Bài viết của:</span> {report.postAuthor}</p>
                      <p className="mt-2"><span className="font-semibold"><i className="fa-solid fa-user mr-2"></i>Báo cáo bởi:</span> {report.reportedByUser}</p>
                    </div>
                    <div className="sm:text-right">
                      {report.reviewedAt && (
                        <p className="mt-2"><span className="font-semibold"><i className="fa-solid fa-calendar-check mr-2"></i>Ngày xử lý:</span> {formatDate(report.reviewedAt)}</p>
                      )}
                      {report.reviewedByUser && (
                        <p className="mt-2"><span className="font-semibold"><i className="fa-solid fa-user-shield mr-2"></i>Xử lý bởi:</span> {report.reviewedByUser}</p>
                      )}
                    </div>
                  </div>
                  

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


                  {report.status === 'pending' ? (
                    <div className="flex flex-wrap gap-2 mt-4 justify-end">
                      <button
                        onClick={() => handleApprove(report.id)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm sm:text-base font-medium transition-all shadow-md cursor-pointer hover:scale-105 hover:shadow-lg"
                        title="Duyệt báo cáo"
                      >
                        <i className="fa-solid fa-check mr-1 sm:mr-2"></i>
                        Duyệt
                      </button>
                      
                      <button
                        onClick={() => handleReject(report.id)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm sm:text-base font-medium transition-all shadow-md cursor-pointer hover:scale-105 hover:shadow-lg"
                        title="Từ chối báo cáo"
                      >
                        <i className="fa-solid fa-times mr-1 sm:mr-2"></i>
                        Từ chối
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-4 justify-end">
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group cursor-pointer"
                        title="Xóa báo cáo và thêm vào lịch sử"
                      >
                        <i className="fa-solid fa-trash mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-300"></i>Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}


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

      
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />


      {selectedPost && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            isClosing ? 'opacity-0' : 'opacity-100 animate-fadeIn'
          }`}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', backdropFilter: isClosing ? 'blur(0px)' : 'blur(1px)' }}
          onClick={handleCloseModal}
        >
          <div 
            className={`bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden relative transition-all duration-300 ${
              isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0 animate-slideUp'
            }`}
            onClick={(e) => e.stopPropagation()}
          >

            <div className="sticky top-0 z-10 bg-blue-600 flex items-center justify-between px-8 py-5 shadow-xl">
              <div className="flex items-center gap-4">

                {selectedPost.authorAvatar ? (
                  <img
                    src={getAvatarUrl(selectedPost.authorAvatar)}
                    alt={selectedPost.author}
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-lg"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-500 ring-4 ring-white shadow-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {selectedPost.author.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-file-lines"></i>
                    Chi tiết bài viết bị báo cáo
                  </h2>
                  <p className="text-blue-100 text-sm mt-0.5">Người đăng: {selectedPost.author}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="group w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-red-500 hover:rotate-180 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:scale-110"
                title="Đóng"
              >
                <i className="fa-solid fa-xmark text-2xl text-white group-hover:scale-125 transition-transform duration-300"></i>
              </button>
            </div>
                  
            <div className="overflow-y-auto max-h-[calc(95vh-80px)]">

              <div className="p-8 border-b border-gray-200">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-blue-600 mb-2">
                    {selectedPost.title}
                  </h3>
                  

                  {selectedPost.tags && (() => {
                    try {
                      let tags: string[] = [];
                      

                      if (Array.isArray(selectedPost.tags)) {
                        tags = selectedPost.tags;
                      } else if (typeof selectedPost.tags === 'string') {

                        try {
                          const parsed = JSON.parse(selectedPost.tags);
                          if (Array.isArray(parsed)) {
                            tags = parsed;
                          }
                        } catch {

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


                {selectedPost.featuredImage && (
                  <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={selectedPost.featuredImage} 
                      alt={selectedPost.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}


                {selectedPost.excerpt && (
                  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <p className="text-gray-700 italic">{selectedPost.excerpt}</p>
                  </div>
                )}


                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />
                </div>
              </div>


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
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có bình luận nào</h3>
                      <p className="text-gray-500">Bài viết này chưa có bình luận hay phản hồi từ người dùng!</p>
                    </div>
                  ) : (
                    postComments.map(comment => {
                      const commentAvatarUrl = getCommentAvatar(comment.authorAvatar);
                      const isAdmin = comment.authorRole === 'admin';
                      
                      return (
                        <div key={comment.id}>

                          <div
                            className={`p-5 rounded-2xl border-2 shadow-md ${
                              comment.isHidden 
                                ? 'bg-gray-100 border-gray-300 opacity-50' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3 flex-1">

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
                                    {comment.author.startsWith('Người dùng ẩn danh') && (
                                      <span className="text-xs bg-gradient-to-r from-gray-500 to-gray-600 text-white px-2 py-1 rounded-full font-semibold">
                                        <i className="fa-solid fa-user-secret mr-1"></i>Ẩn danh
                                      </span>
                                    )}
                                    {comment.isPinned && (
                                      <span className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full font-semibold shadow-sm">
                                        <i className="fa-solid fa-thumbtack mr-1"></i>Đã ghim
                                      </span>
                                    )}
                                    {isAdmin && (
                                      <span className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full font-semibold shadow-sm">
                                        <i className="fa-solid fa-shield-halved mr-1"></i>Quản trị viên
                                      </span>
                                    )}
                                    {currentPostAuthorId && comment.authorId && String(currentPostAuthorId) === String(comment.authorId) && (
                                      <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1 rounded-full font-semibold shadow-sm">
                                        <i className="fa-solid fa-pen-nib mr-1"></i>Tác giả
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


                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-4 sm:ml-8 md:ml-12 mt-3 space-y-3">
                              {comment.replies.map((reply) => {
                                const replyAvatarUrl = getCommentAvatar(reply.authorAvatar);
                                const isReplyAdmin = reply.authorRole === 'admin';
                                
                                return (
                                  <div key={reply.id} className="flex gap-3 group">

                                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mt-2">
                                      {replyAvatarUrl ? (
                                        <img 
                                          src={replyAvatarUrl} 
                                          alt={reply.author}
                                          className="w-full h-full rounded-full object-cover border-2 border-blue-500 shadow-lg"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (fallback) fallback.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div style={{ display: replyAvatarUrl ? 'none' : 'flex' }} className="w-full h-full rounded-full bg-blue-600 items-center justify-center text-white font-bold border-2 border-blue-500 shadow-lg text-xs sm:text-sm">
                                        {reply.author.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                    

                                    <div className="flex-1 min-w-0">
                                      <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm transition-all ${
                                        reply.isHidden 
                                          ? 'bg-gray-100 opacity-50' 
                                          : 'bg-gradient-to-br from-blue-50 to-blue-100'
                                      }`}>
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                          <span className="font-bold text-gray-800 text-sm sm:text-base">{reply.author}</span>
                                          {reply.author.startsWith('Người dùng ẩn danh') && (
                                            <span className="text-[10px] sm:text-xs bg-gradient-to-r from-gray-500 to-gray-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold shadow-sm">
                                              <i className="fa-solid fa-user-secret mr-1"></i>Ẩn danh
                                            </span>
                                          )}
                                          {isReplyAdmin && (
                                            <span className="text-[10px] sm:text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold shadow-sm">
                                              <i className="fa-solid fa-shield-halved mr-1"></i>Admin
                                            </span>
                                          )}
                                          {currentPostAuthorId && reply.authorId && String(currentPostAuthorId) === String(reply.authorId) && (
                                            <span className="text-[10px] sm:text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold shadow-sm">
                                              <i className="fa-solid fa-pen-nib mr-1"></i>Tác giả
                                            </span>
                                          )}
                                          {reply.isHidden && (
                                            <span className="text-[10px] sm:text-xs bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold">
                                              Đã ẩn
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-gray-700 text-sm sm:text-base break-words mb-2">{reply.content}</p>
                                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
                                          <i className="fa-solid fa-clock"></i>
                                          <span>{formatDate(reply.createdAt)}</span>
                                        </div>
                                      </div>
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

export default ReportManagement;
