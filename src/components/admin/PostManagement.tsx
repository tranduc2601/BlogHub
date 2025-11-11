import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Modal from '../Modal';
import type { AdminPost } from '../../data/mockAdminData';

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  isHidden: boolean;
}

interface PostManagementProps {
  posts: AdminPost[];
  onToggleStatus: (postId: number) => void;
  onApprovePost?: (postId: number) => void;
  onDeletePost?: (postId: number) => void;
}

const PostManagement: React.FC<PostManagementProps> = ({ posts, onToggleStatus, onApprovePost, onDeletePost }) => {
  const [filter, setFilter] = useState<'all' | 'needsReview' | 'visible' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; commentId: number } | null>(null);
  const [toggledPostId, setToggledPostId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
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

  // Lọc bài viết theo filter và search
  const filteredPosts = posts.filter(post => {
    let matches = true;
    
    // Filter by status
    if (filter === 'needsReview') matches = matches && post.needsReview;
    else if (filter === 'visible') matches = matches && post.status === 'visible';
    else if (filter === 'hidden') matches = matches && post.status === 'hidden';
    
    // Search by email or username
    if (searchQuery) {
      matches = matches && post.author.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    // Search by date
    if (searchDate) {
      matches = matches && post.createdAt.includes(searchDate);
    }
    
    return matches;
  });

  const handleToggle = (postId: number, currentStatus: string) => {
    const action = currentStatus === 'visible' ? 'ẩn' : 'hiển thị';
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Xác nhận thay đổi',
      message: `Bạn có chắc muốn ${action} bài viết này?`,
      onConfirm: () => {
        onToggleStatus(postId);
        setToggledPostId(postId);
        // Show success icon for 1s then revert
        setTimeout(() => {
          setToggledPostId(null);
        }, 1000);
      }
    });
  };

  const handleApprove = (postId: number) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Duyệt bài viết',
      message: 'Bạn có chắc muốn duyệt bài viết này?',
      onConfirm: () => {
        onApprovePost?.(postId);
      }
    });
  };

  const handleDelete = (postId: number) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Xóa bài viết',
      message: 'Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác!',
      onConfirm: () => {
        onDeletePost?.(postId);
      }
    });
  };

  const handleViewPost = (post: AdminPost) => {
    setSelectedPost(post);
    setNewComment('');
    // Mock comments - in real app, fetch from API
    setPostComments([
      { id: 1, author: 'user1@example.com', content: 'Bài viết rất hay!', createdAt: '2024-01-15', isHidden: false },
      { id: 2, author: 'user2@example.com', content: 'Cảm ơn bạn đã chia sẻ', createdAt: '2024-01-16', isHidden: false },
    ]);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      setModal({
        isOpen: true,
        type: 'warning',
        title: 'Thiếu nội dung',
        message: 'Vui lòng nhập nội dung bình luận!'
      });
      return;
    }

    const comment: Comment = {
      id: Date.now(),
      author: 'Admin',
      content: newComment,
      createdAt: new Date().toISOString().split('T')[0],
      isHidden: false
    };

    setPostComments(prev => [...prev, comment]);
    setNewComment('');
    
    setModal({
      isOpen: true,
      type: 'success',
      title: 'Thành công',
      message: 'Đã thêm bình luận!'
    });
  };

  const handleToggleComment = (commentId: number) => {
    setPostComments(prev =>
      prev.map(c => c.id === commentId ? { ...c, isHidden: !c.isHidden } : c)
    );
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent, commentId: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, commentId });
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý bài viết</h2>
          <p className="text-gray-600 mt-1">Kiểm duyệt và quản lý nội dung bài viết</p>
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
            Tất cả ({posts.length})
          </button>
          <button
            onClick={() => setFilter('needsReview')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'needsReview'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Cần duyệt ({posts.filter(p => p.needsReview).length})
          </button>
          <button
            onClick={() => setFilter('visible')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'visible'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Hiển thị ({posts.filter(p => p.status === 'visible').length})
          </button>
          <button
            onClick={() => setFilter('hidden')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'hidden'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Đã ẩn ({posts.filter(p => p.status === 'hidden').length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-[16px] p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tìm theo email/tên tài khoản
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập email hoặc tên tài khoản..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tìm theo ngày đăng
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchDate && (
                <button
                  onClick={() => setSearchDate('')}
                  className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  title="Xóa lọc ngày"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-[16px] p-8 text-center shadow-lg">
            <p className="text-gray-500">Chưa có bài viết nào</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div
              key={post.id}
              className={`bg-white rounded-[16px] p-6 shadow-lg transition-all hover:shadow-xl ${
                post.needsReview ? 'border-2 border-orange-400' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                {/* Post Info */}
                <div className="flex-1 cursor-pointer" onClick={() => handleViewPost(post)}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
                    {post.hasReports && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <i className="fa-solid fa-triangle-exclamation"></i> Có báo cáo
                      </span>
                    )}
                    {post.needsReview && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                        ⚠️ Cần kiểm duyệt
                      </span>
                    )}
                    {post.status === 'hidden' && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        🚫 Đã ẩn
                      </span>
                    )}
                  </div>
                  
                  <div className="prose prose-sm max-w-none text-gray-600 mb-3 line-clamp-2">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                      {post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '')}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👤 {post.author}</span>
                    <span>📅 {post.createdAt}</span>
                    <span>❤️ {post.likes} lượt thích</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {post.needsReview && (
                    <button
                      onClick={() => handleApprove(post.id)}
                      className="w-10 h-10 flex items-center justify-center rounded border-2 border-blue-600 bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md"
                      style={{ borderRadius: '4px' }}
                      title="Duyệt bài viết"
                    >
                      <i className="fa-solid fa-check"></i>
                    </button>
                  )}
                  
                  {/* Chỉ hiển thị nút ẩn/hiện cho bài viết đã được duyệt (status = 'visible') */}
                  {!post.needsReview && post.status === 'visible' && (
                    <button
                      onClick={() => handleToggle(post.id, post.status)}
                      className={`w-10 h-10 flex items-center justify-center rounded border-2 transition-all shadow-md ${
                        toggledPostId === post.id
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-gray-200 border-gray-300 hover:bg-gray-300 text-gray-700'
                      }`}
                      style={{ borderRadius: '4px' }}
                      title="Ẩn bài viết"
                    >
                      {toggledPostId === post.id ? (
                        <i className="fa-solid fa-check"></i>
                      ) : (
                        <i className="fa-solid fa-eye"></i>
                      )}
                    </button>
                  )}
                  
                  {/* Nút hiện cho bài viết đã bị ẩn */}
                  {post.status === 'hidden' && (
                    <button
                      onClick={() => handleToggle(post.id, post.status)}
                      className={`w-10 h-10 flex items-center justify-center rounded border-2 transition-all shadow-md ${
                        toggledPostId === post.id
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-yellow-500 border-yellow-600 hover:bg-yellow-600 text-white'
                      }`}
                      style={{ borderRadius: '4px' }}
                      title="Hiện bài viết"
                    >
                      {toggledPostId === post.id ? (
                        <i className="fa-solid fa-check"></i>
                      ) : (
                        <i className="fa-solid fa-eye-slash"></i>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(post.id)}
                    className="w-10 h-10 flex items-center justify-center rounded border-2 border-red-500 bg-red-500 hover:bg-red-600 text-white transition-all shadow-md"
                    style={{ borderRadius: '4px' }}
                    title="Xóa bài viết"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Post Detail */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{selectedPost.title}</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fa-solid fa-xmark text-2xl"></i>
                </button>
              </div>
              <div className="prose prose-lg max-w-none mb-4">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {selectedPost.content}
                </ReactMarkdown>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>👤 {selectedPost.author}</span>
                <span>📅 {selectedPost.createdAt}</span>
                <span>❤️ {selectedPost.likes} lượt thích</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">
                Bình luận ({postComments.length})
              </h4>
              
              {/* Add Comment Form */}
              <div className="mb-6 bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    A
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Viết bình luận của bạn..."
                      className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setNewComment('')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleAddComment}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-md"
                      >
                        <i className="fa-solid fa-paper-plane mr-2"></i>
                        Gửi
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {postComments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Chưa có bình luận nào</p>
                ) : (
                  postComments.map(comment => (
                    <div
                      key={comment.id}
                      onContextMenu={(e) => handleContextMenu(e, comment.id)}
                      className={`p-4 rounded-xl border-2 ${
                        comment.isHidden ? 'bg-gray-100 border-gray-300 opacity-50' : 'bg-white border-gray-200'
                      } cursor-context-menu hover:border-gray-400 transition-colors`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {comment.author === 'Admin' ? 'A' : comment.author.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-800">{comment.author}</p>
                              {comment.author === 'Admin' && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                  Quản trị viên
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{comment.content}</p>
                            <p className="text-gray-400 text-xs mt-2">📅 {comment.createdAt}</p>
                          </div>
                        </div>
                        {comment.isHidden && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            Đã ẩn
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu for Comments */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-[60]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleToggleComment(contextMenu.commentId)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <i className="fa-solid fa-eye-slash"></i>
            {postComments.find(c => c.id === contextMenu.commentId)?.isHidden ? 'Hiện' : 'Ẩn'} bình luận
          </button>
        </div>
      )}

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

export default PostManagement;
