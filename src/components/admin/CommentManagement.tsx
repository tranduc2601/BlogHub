import React, { useState } from 'react';
import type { AdminComment } from '../../data/mockAdminData';

interface CommentManagementProps {
  comments: AdminComment[];
  onToggleStatus: (commentId: number) => void;
}

const CommentManagement: React.FC<CommentManagementProps> = ({ comments, onToggleStatus }) => {
  const [filter, setFilter] = useState<'all' | 'needsReview' | 'visible' | 'hidden'>('all');

  // Lọc bình luận theo filter
  const filteredComments = comments.filter(comment => {
    if (filter === 'all') return true;
    if (filter === 'needsReview') return comment.needsReview;
    if (filter === 'visible') return comment.status === 'visible';
    if (filter === 'hidden') return comment.status === 'hidden';
    return true;
  });

  const handleToggle = (commentId: number) => {
    if (window.confirm('Bạn có chắc muốn thay đổi trạng thái bình luận này?')) {
      onToggleStatus(commentId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý bình luận</h2>
          <p className="text-gray-600 mt-1">Kiểm duyệt và quản lý nội dung bình luận</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Tất cả ({comments.length})
          </button>
          <button
            onClick={() => setFilter('needsReview')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'needsReview'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Cần duyệt ({comments.filter(c => c.needsReview).length})
          </button>
          <button
            onClick={() => setFilter('visible')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'visible'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Hiển thị ({comments.filter(c => c.status === 'visible').length})
          </button>
          <button
            onClick={() => setFilter('hidden')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'hidden'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Đã ẩn ({comments.filter(c => c.status === 'hidden').length})
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="bg-white rounded-[16px] p-8 text-center shadow-lg">
            <p className="text-gray-500">Không có bình luận nào</p>
          </div>
        ) : (
          filteredComments.map(comment => (
            <div
              key={comment.id}
              className={`bg-white rounded-[16px] p-6 shadow-lg transition-all hover:shadow-xl ${
                comment.needsReview ? 'border-2 border-orange-400' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                {/* Comment Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-500">
                      Bình luận trên:
                    </span>
                    <span className="text-sm text-blue-600 font-medium">
                      "{comment.postTitle}"
                    </span>
                    {comment.needsReview && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                        ⚠️ Cần kiểm duyệt
                      </span>
                    )}
                    {comment.status === 'hidden' && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        🚫 Đã ẩn
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mb-3">
                    <p className="text-gray-800">{comment.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👤 {comment.author}</span>
                    <span>📅 {comment.createdAt}</span>
                    <span className="text-xs text-gray-400">ID: {comment.id}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleToggle(comment.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                    comment.status === 'visible'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {comment.status === 'visible' ? '✅ Hiển thị' : '❌ Ẩn'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentManagement;
