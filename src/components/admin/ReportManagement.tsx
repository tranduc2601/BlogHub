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

const ReportManagement: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
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

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/admin/reports');
      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Không thể tải danh sách báo cáo');
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
          toast.error('Không thể duyệt báo cáo');
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
          toast.error('Không thể từ chối báo cáo');
        }
      }
    });
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">⏳ Chờ xử lý</span>;
      case 'approved':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">✓ Đã duyệt</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✗ Đã từ chối</span>;
      default:
        return null;
    }
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
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý báo cáo</h2>
          <p className="text-gray-600 mt-1">Xử lý báo cáo vi phạm từ người dùng</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tất cả ({reports.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-200'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Chờ xử lý ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'approved'
                ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Đã duyệt ({reports.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'rejected'
                ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Đã từ chối ({reports.filter(r => r.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Reports List */}
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
                {/* Report Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{report.postTitle}</h3>
                    {getStatusBadge(report.status)}
                  </div>
                  
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-3">
                    <p className="text-sm text-red-800">
                      <span className="font-semibold">Lý do:</span> {report.reason}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><span className="font-semibold">Bài viết của:</span> {report.postAuthor}</p>
                      <p><span className="font-semibold">Báo cáo bởi:</span> {report.reportedByUser}</p>
                    </div>
                    <div>
                      <p><span className="font-semibold">Ngày báo cáo:</span> {report.createdAt}</p>
                      {report.reviewedAt && (
                        <p><span className="font-semibold">Ngày xử lý:</span> {report.reviewedAt}</p>
                      )}
                      {report.reviewedByUser && (
                        <p><span className="font-semibold">Xử lý bởi:</span> {report.reviewedByUser}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Only show for pending reports */}
                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(report.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all shadow-md"
                      title="Từ chối báo cáo"
                    >
                      <i className="fa-solid fa-times mr-2"></i>
                      Từ chối
                    </button>
                    
                    <button
                      onClick={() => handleApprove(report.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all shadow-md"
                      title="Duyệt báo cáo (cảnh cáo người dùng)"
                    >
                      <i className="fa-solid fa-check mr-2"></i>
                      Duyệt
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Component */}
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
