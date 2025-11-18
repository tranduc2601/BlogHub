/**
 * ReportManagement - Quản lý báo cáo vi phạm
 * Hiển thị danh sách báo cáo và cho phép Admin duyệt/từ chối
 */

import React, { useState, useEffect } from 'react';
import axios from '../../config/axios';
import toast from 'react-hot-toast';
import Modal from '../Modal';

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

interface ReportManagementProps {
  onPendingCountChange?: (count: number) => void;
}

const ReportManagement: React.FC<ReportManagementProps> = ({ onPendingCountChange }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
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
  const [searchQuery, setSearchQuery] = useState('');

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
          }
        } catch (error) {
          console.error('Failed to reject report:', error);
          toast.error('Không thể từ chối báo cáo!');
        }
      }
    });
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = report.postTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesReason = !reasonFilter || report.reason === reasonFilter;
    return matchesFilter && matchesSearch && matchesReason;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full"><i className="fa-regular fa-hourglass-end mr-1"></i>Chờ xử lý</span>;
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
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý báo cáo</h2>
          <p className="text-gray-600 mt-1">Xử lý báo cáo vi phạm từ người dùng</p>
        </div>
        
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tất cả ({reports.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-200'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Chờ xử lý ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              filter === 'approved'
                ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Đã duyệt ({reports.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              filter === 'rejected'
                ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Đã từ chối ({reports.filter(r => r.status === 'rejected').length})
          </button>
        </div>
      </div>

      
      <div className="bg-white rounded-[16px] p-6 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div>
          <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
            <i className="fa-solid fa-magnifying-glass mr-2"></i>Tìm kiếm bài viết bị báo cáo
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập tên bài viết để tìm kiếm..."
            className="w-full px-4 py-3 border-3 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        
        <div>
          <label htmlFor="reasonFilter" className="block text-sm font-semibold text-gray-700 mb-2">
            <i className="fa-solid fa-filter mr-2"></i>Lọc bài viết theo lý do
          </label>
          <select
            id="reasonFilter"
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="w-full px-4 py-3.5 border-3 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Tất cả lý do</option>
            {REPORT_REASONS.map(reason => (
              <option key={reason.id} value={reason.label}>{reason.label}</option>
            ))}
          </select>
        </div>
      </div>

      
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-[16px] p-8 text-center shadow-lg">
            <p className="text-gray-500">Chưa có báo cáo nào</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div
              key={report.id}
              className={`bg-white rounded-[16px] p-6 shadow-lg transition-all hover:shadow-xl ${
                report.status === 'pending' ? 'border-2 border-yellow-400' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{report.postTitle}</h3>
                    {getStatusBadge(report.status)}
                  </div>
                  
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-3">
                    <p className="text-sm text-red-800">
                      <span className="font-semibold">Lý do:</span> {report.reason}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <p className="mt-2"><span className="font-semibold"><i className="fa-solid fa-file-lines mr-1"></i>Bài viết của:</span> {report.postAuthor}</p>
                      <p className="mt-2"><span className="font-semibold"><i className="fa-solid fa-user mr-1"></i>Báo cáo bởi:</span> {report.reportedByUser}</p>
                    </div>
                    <div>
                      {report.reviewedAt && (
                        <p className="ml-180"><span className="font-semibold">Ngày xử lý:</span> {formatDate(report.reviewedAt)}</p>
                      )}
                      {report.reviewedByUser && (
                        <p className="ml-180"><span className="font-semibold">Xử lý bởi:</span> {report.reviewedByUser}</p>
                      )}
                    </div>
                  </div>
                  
                  
                  <div className="flex justify-start">
                    <p className="text-xs text-gray-500">
                      Ngày báo cáo: {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>

                
                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(report.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all shadow-md mt-10 cursor-pointer hover:scale-105 hover:shadow-lg"
                      title="Duyệt báo cáo (cảnh cáo người dùng)"
                    >
                      <i className="fa-solid fa-check mr-2"></i>
                      Duyệt
                    </button>
                    
                    <button
                      onClick={() => handleReject(report.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all shadow-md mt-10 cursor-pointer hover:scale-105 hover:shadow-lg"
                      title="Từ chối báo cáo"
                    >
                      <i className="fa-solid fa-times mr-2"></i>
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
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
    </div>
  );
};

export default ReportManagement;
