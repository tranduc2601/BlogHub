import { useState, useMemo, useEffect } from "react";
import { useComments } from "../hooks/useComments";
import { useAuth } from "@/core/auth";
import toast from 'react-hot-toast';
import type { Comment } from '@/shared/types';
import { Modal } from '@/shared/ui';
import ReactionPicker, { type ReactionType, ReactionStats } from './ReactionPicker';
import axios from '@/core/config/axios';

interface CommentBoxProps {
  postId: string | number;
  postAuthorId?: number;
  onCommentAdded?: () => void;
  onReportComment?: (commentId: string, content: string, author: string) => void;
}

interface CommentItemProps {
  comment: Comment;
  level: number;
  onLike: (commentId: string) => void;
  currentUserId?: number;
  postAuthorId?: number;
  editingId: string | null;
  editContent: string;
  setEditingId: (id: string | null) => void;
  setEditContent: (content: string) => void;
  handleEdit: (commentId: string, content: string) => void;
  handleDelete: (commentId: string) => void;
  handleReply: (parentId: string, content: string) => void;
  handlePinComment: (commentId: string) => void;
  handleUnpinComment: () => void;
  handleReport: (commentId: string, content: string, author: string) => void;
  pinnedCommentId: string | null;
  user: { id: number; username: string; avatarUrl?: string } | null;
  getAuthorInitial: (name: string) => string;
  getAvatarColor: (name: string) => string;
  getAuthorName: (author: { username?: string; name?: string; email?: string }) => string;
  formatDate: (dateString: string) => string;
}

export default function CommentBox({ postId, postAuthorId, onCommentAdded, onReportComment }: CommentBoxProps) {
  const { comments, loading, error, addComment, updateComment, deleteComment, likeComment } = useComments(postId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [pinnedCommentId, setPinnedCommentId] = useState<string | null>(null);
  
  const MIN_COMMENT_LENGTH = 2; 
  const MAX_COMMENT_LENGTH = 500; 

  useEffect(() => {
    const fetchPinnedComment = async () => {
      try {
        const response = await axios.get(`/posts/${postId}/pinned-comment`);
        if (response.data.pinnedCommentId) {
          setPinnedCommentId(response.data.pinnedCommentId.toString());
        }
      } catch (error) {
        console.error('Error fetching pinned comment:', error);
      }
    };

    fetchPinnedComment();
  }, [postId]);
  
  // Simple validation
  const validateComment = (content: string): { valid: boolean; message?: string } => {
    const trimmedContent = content.trim();
    
    // Check độ dài tối thiểu
    if (trimmedContent.length < MIN_COMMENT_LENGTH) {
      return { valid: false, message: `Bình luận phải có ít nhất ${MIN_COMMENT_LENGTH} ký tự!` };
    }
    
    // Check độ dài tối đa
    if (trimmedContent.length > MAX_COMMENT_LENGTH) {
      return { valid: false, message: `Bình luận không được vượt quá ${MAX_COMMENT_LENGTH} ký tự!` };
    }
    
    return { valid: true };
  };

  const commentTree = useMemo(() => {
    const tree: Comment[] = [];
    const commentMap = new Map<string, Comment>();
    

    comments.forEach((comment: Comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    

    commentMap.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent && parent.replies) {
          parent.replies.push(comment);
        }
      } else {
        tree.push(comment);
      }
    });
    
    // Sắp xếp: bình luận được ghim lên đầu
    if (pinnedCommentId) {
      tree.sort((a, b) => {
        if (a.id === pinnedCommentId) return -1;
        if (b.id === pinnedCommentId) return 1;
        return 0;
      });
    }
    
    return tree;
  }, [comments, pinnedCommentId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 30) return `${diffInDays} ngày trước`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} năm trước`;
  };

  const getAuthorInitial = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-blue-500',
      'from-teal-500 to-green-500',
      'from-pink-500 to-rose-500',
      'from-yellow-500 to-orange-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const getAuthorName = (author: { username?: string; name?: string; email?: string }) => {
    return author.username || author.name || author.email || 'Anonymous';
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    // Validate anti-spam
    const validation = validateComment(newComment);
    if (!validation.valid) {
      toast.error(validation.message || 'Bình luận không hợp lệ!');
      return;
    }

    setSubmitting(true);
    try {
      const trimmedComment = newComment.trim();
      await addComment(trimmedComment, undefined, isAnonymous);
      
      setNewComment("");
      setIsAnonymous(false);
      toast.success(isAnonymous ? 'Đã bình luận ẩn danh!' : 'Đã bình luận thành công!');
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Không thể gửi bình luận!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!content.trim() || !user) return;

    try {
      await addComment(content.trim(), parentId);
      toast.success('Đã trả lời thành công!');
    } catch (error) {
      console.error('Error replying:', error);
      toast.error('Không thể gửi trả lời!');
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    if (!content.trim()) return;

    try {
      await updateComment(commentId, content.trim());
      setEditingId(null);
      setEditContent("");
      toast.success('Đã cập nhật bình luận!');
    } catch (error) {
      console.error('Error editing:', error);
      toast.error('Không thể cập nhật bình luận!');
    }
  };

  const handleDelete = async (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      await deleteComment(commentToDelete);
      toast.success('Đã xóa bình luận!');
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Không thể xóa bình luận!');
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thích bình luận!');
      return;
    }
    await likeComment(commentId);
  };

  const handlePinComment = async (commentId: string) => {
    try {
      await axios.post(`/posts/${postId}/pin-comment`, { commentId });
      setPinnedCommentId(commentId);
      toast.success('Đã ghim bình luận!');
    } catch (error) {
      console.error('Error pinning comment:', error);
      toast.error('Không thể ghim bình luận!');
    }
  };

  const handleUnpinComment = async () => {
    try {
      await axios.delete(`/posts/${postId}/pin-comment`);
      setPinnedCommentId(null);
      toast.success('Đã bỏ ghim bình luận!');
    } catch (error) {
      console.error('Error unpinning comment:', error);
      toast.error('Không thể bỏ ghim bình luận!');
    }
  };

  const handleReport = (commentId: string, content: string, author: string) => {
    if (onReportComment) {
      onReportComment(commentId, content, author);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        <i className="fa-solid fa-comments text-gray-600 mr-1 sm:mr-2 text-lg sm:text-2xl"></i>
        Bình luận ({commentTree.length})
      </h3>
         
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <div className="flex items-center gap-3 sm:block">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 sm:border-4 border-blue-500 shadow-lg flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center border-2 sm:border-4 border-blue-500 shadow-lg flex-shrink-0">
                  <span className="text-sm sm:text-base font-bold text-blue-700">
                    {user.username.split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="sm:hidden text-sm font-medium text-gray-700">Bình luận với tư cách <span className="text-blue-600">{user.username}</span></span>
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border-2 sm:border-3 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 focus:border-blue-500 focus:outline-none transition-all resize-none hover:border-gray-300 text-sm sm:text-base"
                rows={3}
                placeholder="Hãy chia sẻ suy nghĩ của bạn..."
                disabled={submitting}
                maxLength={MAX_COMMENT_LENGTH}
              />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className={`text-xs sm:text-sm font-medium ${newComment.length > MAX_COMMENT_LENGTH * 0.9 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {newComment.length}/{MAX_COMMENT_LENGTH}
                  </span>
                  
                  {/* Anonymous Comment Toggle */}
                  <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm text-gray-600 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                      <i className="fa-solid fa-user-secret"></i>
                      <span>Ẩn danh</span>
                    </span>
                    <span className="hidden md:inline text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Tên và avatar sẽ được ẩn
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                {newComment.trim() && (
                  <button 
                    type="button"
                    onClick={() => setNewComment('')}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 font-medium rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:bg-red-100 hover:text-red-600 hover:border-red-300 hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                    <i className="fa-solid fa-xmark mr-1 sm:mr-2"></i><span className="hidden xs:inline">Hủy</span>
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg cursor-pointer border border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-paper-plane mr-1 sm:mr-2"></i>
                  {submitting ? 'Đang gửi...' : <><span className="hidden sm:inline">Gửi bình luận</span><span className="sm:hidden">Gửi</span></>}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-blue-100 rounded-lg sm:rounded-xl text-center border-2 border-blue-200">
          <p className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-3 font-medium">Hãy đăng nhập để bình luận!</p>
          <a href="/login" className="inline-block bg-blue-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl transition-transform duration-300 shadow-lg">
            <i className="fa-solid fa-right-to-bracket mr-1 sm:mr-2"></i>Đăng nhập ngay
          </a>
        </div>
      )}
    
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-xl p-4 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
 
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-2">
          {commentTree.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              level={0}
              onLike={handleLike}
              currentUserId={user?.id}
              postAuthorId={postAuthorId}
              editingId={editingId}
              editContent={editContent}
              setEditingId={setEditingId}
              setEditContent={setEditContent}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleReply={handleReply}
              handlePinComment={handlePinComment}
              handleUnpinComment={handleUnpinComment}
              handleReport={handleReport}
              pinnedCommentId={pinnedCommentId}
              user={user}
              getAuthorInitial={getAuthorInitial}
              getAvatarColor={getAvatarColor}
              getAuthorName={getAuthorName}
              formatDate={formatDate}
            />
          ))}
   
          {commentTree.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Chưa có bình luận nào</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">Hãy là người đầu tiên chia sẻ suy nghĩ!</p>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa bình luận"
        message="Bạn có chắc chắn muốn xóa bình luận này? Tất cả các phản hồi cũng sẽ bị xóa và không thể khôi phục."
        type="error"
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}

const CommentItem = ({ 
  comment, 
  level, 
  onLike, 
  currentUserId,
  postAuthorId,
  editingId,
  editContent,
  setEditingId,
  setEditContent,
  handleEdit,
  handleDelete,
  handleReply,
  handlePinComment,
  handleUnpinComment,
  handleReport,
  pinnedCommentId,
  user,
  getAuthorInitial,
  getAvatarColor,
  getAuthorName,
  formatDate
}: CommentItemProps) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const authorName = getAuthorName(comment.author);
    const avatarUrl = (comment.author as { avatarUrl?: string; avatar?: string }).avatarUrl || 
                     (comment.author as { avatarUrl?: string; avatar?: string }).avatar;
    const isOwner = currentUserId && String(currentUserId) === String(comment.authorId);
    const isPostAuthor = postAuthorId && String(postAuthorId) === String(comment.authorId);
    const isCurrentUserPostAuthor = currentUserId && String(currentUserId) === String(postAuthorId);
    const isPinned = pinnedCommentId === comment.id;

    const handleEditClick = () => {
      setEditingId(comment.id);
      setEditContent(comment.content);
      setShowDropdown(false);
    };

    const handleDeleteClick = () => {
      handleDelete(comment.id);
      setShowDropdown(false);
    };

    const submitReply = () => {
      handleReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    };

    return (
      <div className={`${level > 0 ? 'ml-4 sm:ml-8 md:ml-12' : ''}`}>
        <div className="flex gap-2 sm:gap-3 md:gap-4 group mb-3 sm:mb-4">
          {avatarUrl ? (
            <img 
              src={avatarUrl}
              alt={authorName}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 sm:border-4 border-blue-500 shadow-lg flex-shrink-0 mt-2 sm:mt-4"
            />
          ) : (
            <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${getAvatarColor(authorName)} rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg flex-shrink-0 border-2 sm:border-4 border-blue-500 mt-2 sm:mt-4`}>
              {getAuthorInitial(authorName)}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start sm:items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap min-w-0 flex-1">
                  <span className="font-bold text-gray-800 text-sm sm:text-base truncate">{authorName}</span>
                  {isPinned && (
                    <span className="text-[10px] sm:text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold shadow-sm whitespace-nowrap">
                      <i className="fa-solid fa-thumbtack mr-0.5 sm:mr-1"></i><span className="hidden sm:inline">Đã ghim</span><span className="sm:hidden">Ghim</span>
                    </span>
                  )}
                  {(comment.author as { role?: string }).role === 'admin' && (
                    <span className="text-[10px] sm:text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold shadow-sm whitespace-nowrap">
                      <i className="fa-solid fa-shield-halved mr-0.5 sm:mr-1"></i><span className="hidden sm:inline">Quản trị viên</span><span className="sm:hidden">Admin</span>
                    </span>
                  )}
                  {isPostAuthor && (
                    <span className="text-[10px] sm:text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold shadow-sm whitespace-nowrap">
                      <i className="fa-solid fa-pen-nib mr-0.5 sm:mr-1"></i><span className="hidden sm:inline">Tác giả</span><span className="sm:hidden">TG</span>
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs text-gray-500 bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                    <i className="fa-solid fa-clock mr-1"></i>
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                {(isOwner || isCurrentUserPostAuthor) && (
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="text-gray-400 hover:text-gray-600 p-1 sm:p-2 rounded-full hover:bg-white/50 transition-all cursor-pointer"
                    >
                      <i className="fa-solid fa-ellipsis text-base sm:text-lg"></i>
                    </button>
                    {showDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setShowDropdown(false)}
                        />
                        <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[120px] sm:min-w-[160px]">
                          {isCurrentUserPostAuthor && level === 0 && !comment.parentId && (
                            <button
                              onClick={() => {
                                if (isPinned) {
                                  handleUnpinComment();
                                } else {
                                  handlePinComment(comment.id);
                                }
                                setShowDropdown(false);
                              }}
                              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-yellow-50 text-yellow-600 flex items-center gap-2 cursor-pointer"
                            >
                              <i className={`fa-solid ${isPinned ? 'fa-times' : 'fa-thumbtack'} w-4`}></i>
                              <span className="hidden sm:inline">{isPinned ? 'Bỏ ghim' : 'Ghim'}</span>
                              <span className="sm:hidden">{isPinned ? 'Bỏ ghim' : 'Ghim'}</span>
                            </button>
                          )}
                          {isOwner && (
                            <>
                              <button
                                onClick={handleEditClick}
                                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                              >
                                <i className="fa-solid fa-edit w-4"></i>
                                Sửa
                              </button>
                              <button
                                onClick={handleDeleteClick}
                                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                              >
                                <i className="fa-solid fa-trash w-4"></i>
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full border-2 sm:border-4 border-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-3 focus:border-blue-500 focus:outline-none resize-none text-sm sm:text-base"
                    rows={3}
                  />
                  <div className="flex gap-1.5 sm:gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                      className="bg-gray-200 text-gray-700 px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold hover:bg-gray-300 transition-all cursor-pointer"
                    >
                      <i className="fa-solid fa-xmark mr-1"></i><span className="hidden sm:inline">Hủy</span>
                    </button>
                    <button
                      onClick={() => handleEdit(comment.id, editContent)}
                      disabled={editContent.trim() === comment.content.trim()}
                      className="bg-blue-600 text-white px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fa-solid fa-floppy-disk mr-1"></i><span className="hidden sm:inline">Lưu</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed break-words">{comment.content}</p>
              )}

              {editingId !== comment.id && (
                <div className="flex items-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm mt-2 sm:mt-3 md:mt-4 flex-wrap">
                  <CommentReactionButton 
                    commentId={comment.id} 
                    initialReaction={comment.reactionType}
                    reactionCounts={comment.reactionCounts}
                  />

                  <button 
                    onClick={() => {
                      if (!user) {
                        return;
                      }
                      setShowReplyForm(!showReplyForm);
                    }}
                    disabled={!user}
                    className={`flex items-center gap-1 transition-all ${
                      !user 
                        ? 'text-gray-400 opacity-50 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-blue-600 cursor-pointer'
                    }`}
                    title={!user ? 'Đăng nhập để trả lời' : 'Trả lời bình luận'}
                  >
                    <i className="fa-solid fa-reply text-xs"></i>
                    <span className="font-medium">Trả lời</span>
                  </button>

                  {comment.replies && comment.replies.length > 0 && (
                    <button 
                      onClick={() => setShowReplies(!showReplies)}
                      className="text-gray-500 hover:text-gray-800 transition-all flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <i className={`fa-solid ${showReplies ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs`}></i>
                      <span className="hidden sm:inline">{showReplies ? 'Ẩn bớt' : `Xem ${comment.replies.length} phản hồi`}</span>
                      <span className="sm:hidden">{showReplies ? 'Ẩn' : `${comment.replies.length}`}</span>
                    </button>
                  )}

                  {!isOwner && user && (
                    <button 
                      onClick={() => handleReport(comment.id, comment.content, authorName)}
                      className="text-gray-500 hover:text-red-700 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-flag text-xs"></i>
                      <span className="font-medium hidden sm:inline">Báo cáo</span>
                    </button>
                  )}
                </div>
              )}
            </div>
   
            {showReplyForm && user && (
              <div className="mt-2 sm:mt-3">
                <div className="flex gap-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="flex-1 min-w-0 border-2 border-blue-200 rounded-lg p-2 sm:p-3 focus:border-blue-500 focus:outline-none resize-none text-xs sm:text-sm"
                    rows={2}
                    placeholder="Viết trả lời..."
                  />
                </div>
                <div className="flex gap-1.5 sm:gap-2 mt-2 justify-end">
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                    className="px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-600 font-medium rounded-lg cursor-pointer transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:bg-red-100 hover:text-red-600 hover:border-red-300 active:scale-95"
                  >
                    <i className="fa-solid fa-xmark mr-1"></i><span className="hidden sm:inline">Hủy</span>
                  </button>
                  <button
                    onClick={submitReply}
                    disabled={!replyContent.trim()}
                    className="bg-blue-600 text-white px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all duration-200 shadow-lg cursor-pointer border border-blue-600 hover:bg-blue-700 hover:border-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-paper-plane mr-1"></i><span className="hidden sm:inline">Gửi</span>
                  </button>
                </div>
              </div>
            )}
          
            {comment.replies && comment.replies.length > 0 && showReplies && (
              <div className="mt-2 sm:mt-3 md:mt-4 ml-2 sm:ml-6 md:ml-8 space-y-2 sm:space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    level={level + 1}
                    onLike={onLike}
                    currentUserId={currentUserId}
                    postAuthorId={postAuthorId}
                    editingId={editingId}
                    editContent={editContent}
                    setEditingId={setEditingId}
                    setEditContent={setEditContent}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleReply={handleReply}
                    handlePinComment={handlePinComment}
                    handleUnpinComment={handleUnpinComment}
                    handleReport={handleReport}
                    pinnedCommentId={pinnedCommentId}
                    user={user}
                    getAuthorInitial={getAuthorInitial}
                    getAvatarColor={getAvatarColor}
                    getAuthorName={getAuthorName}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
};


const CommentReactionButton = ({ 
  commentId, 
  initialReaction,
  reactionCounts 
}: { 
  commentId: string; 
  initialReaction?: ReactionType;
  reactionCounts?: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
    total: number;
  };
}) => {
  const { user } = useAuth();
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(initialReaction || null);
  const [counts, setCounts] = useState(reactionCounts || {
    like: 0,
    love: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    total: 0
  });

  useEffect(() => {
    // Use initial reaction from props, no need to fetch again
    setCurrentReaction(initialReaction || null);
  }, [initialReaction]);

  useEffect(() => {
    if (reactionCounts) {
      setCounts(reactionCounts);
    }
  }, [reactionCounts]);

  const handleReaction = async (reactionType: ReactionType) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thả biểu cảm!');
      return;
    }

    const oldReaction = currentReaction;

    try {
      const typeToSend = reactionType !== null ? reactionType : currentReaction;
      
      await axios.post(`/posts/comments/${commentId}/react`, { reactionType: typeToSend });
      
      // Update local state immediately for better UX
      const newCounts = { ...counts };
      
      // Remove old reaction count
      if (oldReaction) {
        newCounts[oldReaction] = Math.max(0, newCounts[oldReaction] - 1);
        newCounts.total = Math.max(0, newCounts.total - 1);
      }
      
      // Add new reaction count
      if (reactionType) {
        newCounts[reactionType] = newCounts[reactionType] + 1;
        newCounts.total = newCounts.total + 1;
      }
      
      setCounts(newCounts);
      setCurrentReaction(reactionType);
      
      if (reactionType === null) {
        toast.success('Đã bỏ biểu cảm của bình luận!');
      } else {
        toast.success('Đã thả biểu cảm của bình luận!');
      }
    } catch (error) {
      console.error('Error reacting to comment:', error);
      toast.error('Không thể thả biểu cảm!');
      // Revert state on error
      setCurrentReaction(oldReaction);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <ReactionPicker 
        onReact={handleReaction}
        currentReaction={currentReaction}
        disabled={false}
      />
      {counts.total > 0 && (
        <ReactionStats 
          stats={{
            like_count: counts.like,
            love_count: counts.love,
            haha_count: counts.haha,
            wow_count: counts.wow,
            sad_count: counts.sad,
            angry_count: counts.angry,
            total_reactions: counts.total
          }}
        />
      )}
    </div>
  );
};
