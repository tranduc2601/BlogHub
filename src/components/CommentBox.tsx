import { useState, useMemo, useEffect } from "react";
import { useComments } from "../hooks/useComments";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import type { Comment } from '../data/mockData';
import Modal from './Modal';
import ReactionPicker, { type ReactionType } from './ReactionPicker';
import axios from '../config/axios';

interface CommentBoxProps {
  postId: string;
  postAuthorId?: number;
  onCommentAdded?: () => void;
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
  pinnedCommentId: string | null;
  user: { id: number; username: string; avatarUrl?: string } | null;
  getAuthorInitial: (name: string) => string;
  getAvatarColor: (name: string) => string;
  getAuthorName: (author: { username?: string; name?: string; email?: string }) => string;
  formatDate: (dateString: string) => string;
}

export default function CommentBox({ postId, postAuthorId, onCommentAdded }: CommentBoxProps) {
  const { comments, loading, error, addComment, updateComment, deleteComment, likeComment } = useComments(postId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [pinnedCommentId, setPinnedCommentId] = useState<string | null>(null);

  // Fetch pinned comment khi component mount
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

  const commentTree = useMemo(() => {
    const tree: Comment[] = [];
    const commentMap = new Map<string, Comment>();
    

    comments.forEach(comment => {
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

    setSubmitting(true);
    try {
      await addComment(newComment.trim());
      setNewComment("");
      toast.success('Đã bình luận thành công!');
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

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <i className="fa-solid fa-comments text-gray-600 mr-2"></i>
        Bình luận ({comments.length})
      </h3>
         
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-4 mb-4">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover border-4 border-blue-500 shadow-lg flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-500 shadow-lg">
                <span className="text-base font-bold text-blue-700">
                  {user.username.split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border-3 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:outline-none transition-all resize-none hover:border-gray-300"
                rows={4}
                placeholder="Hãy chia sẻ suy nghĩ của bạn về bài viết này..."
                disabled={submitting}
              />
              <div className="flex justify-end gap-2 mt-3">
                {newComment.trim() && (
                  <button 
                    type="button"
                    onClick={() => setNewComment('')}
                    className="px-4 py-2 text-gray-600 font-medium rounded-xl cursor-pointer transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:bg-red-100 hover:text-red-600 hover:border-red-300 hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                    <i className="fa-solid fa-xmark mr-2"></i>Hủy
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg cursor-pointer border border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-paper-plane mr-2"></i>{submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-blue-100 rounded-xl text-center border-2 border-blue-200">
          <p className="text-gray-700 mb-3 font-medium">Hãy đăng nhập để bình luận!</p>
          <a href="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl transition-transform duration-300 shadow-lg">
            <i className="fa-solid fa-right-to-bracket mr-2"></i>Đăng nhập ngay
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
              pinnedCommentId={pinnedCommentId}
              user={user}
              getAuthorInitial={getAuthorInitial}
              getAvatarColor={getAvatarColor}
              getAuthorName={getAuthorName}
              formatDate={formatDate}
            />
          ))}
   
          {commentTree.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có bình luận nào</h3>
              <p className="text-gray-600">Hãy là người đầu tiên chia sẻ suy nghĩ về bài viết này!</p>
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
      <div className={`${level > 0 ? 'ml-8 sm:ml-12' : ''}`}>
        <div className="flex gap-2 sm:gap-4 group mb-4">
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
                    <i className="fa-regular fa-clock mr-1"></i>
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
                        <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px] sm:min-w-[160px]">
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
                              className="w-full px-4 py-2 text-left text-sm hover:bg-yellow-50 text-yellow-600 flex items-center gap-2 cursor-pointer"
                            >
                              <i className={`fa-solid ${isPinned ? 'fa-times' : 'fa-thumbtack'} w-4`}></i>
                              {isPinned ? 'Bỏ ghim bình luận' : 'Ghim bình luận'}
                            </button>
                          )}
                          {isOwner && (
                            <>
                              <button
                                onClick={handleEditClick}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                              >
                                <i className="fa-solid fa-edit w-4"></i>
                                Chỉnh sửa
                              </button>
                              <button
                                onClick={handleDeleteClick}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
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
                    className="w-full border-4 border-blue-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-1.5 text-sm rounded-lg font-semibold hover:bg-gray-300 hover:scale-105 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <i className="fa-solid fa-xmark w-4 mr-2"></i>Hủy
                    </button>
                    <button
                      onClick={() => handleEdit(comment.id, editContent)}
                      disabled={editContent.trim() === comment.content.trim()}
                      className="bg-blue-600 text-white px-4 py-1.5 text-sm rounded-lg font-semibold hover:bg-blue-700 hover:scale-105 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                      <i className="fa-solid fa-floppy-disk w-4 mr-2"></i>Lưu
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed break-words">{comment.content}</p>
              )}

              {editingId !== comment.id && (
                <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm mt-3 sm:mt-4">
                  <CommentReactionButton commentId={comment.id} />

                  <button 
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="text-gray-500 hover:text-blue-600 transition-all flex items-center gap-1 sm:gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-reply text-xs sm:text-sm"></i>
                    <span className="font-medium">Trả lời</span>
                  </button>

                  {comment.replies && comment.replies.length > 0 && (
                    <button 
                      onClick={() => setShowReplies(!showReplies)}
                      className="text-gray-500 hover:text-gray-800 transition-all flex items-center gap-1 sm:gap-2 cursor-pointer font-medium"
                    >
                      <i className={`fa-solid ${showReplies ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs sm:text-sm`}></i>
                      <span>{showReplies ? 'Ẩn bớt' : `Xem thêm (${comment.replies.length} ${comment.replies.length === 1 ? 'phản hồi' : 'phản hồi'})`}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
   
            {showReplyForm && user && (
              <div className="mt-3 ml-0 sm:ml-4">
                <div className="flex gap-2 sm:gap-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="flex-1 min-w-0 border-2 sm:border-3 border-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-3 focus:border-blue-500 focus:outline-none resize-none text-sm"
                    rows={2}
                    placeholder="Viết trả lời..."
                  />
                </div>
                <div className="flex gap-2 mt-2 justify-end">
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                    className="px-4 py-1.5 text-sm text-gray-600 font-medium rounded-lg cursor-pointer transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:bg-red-100 hover:text-red-600 hover:border-red-300 hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                    <i className="fa-solid fa-xmark w-4 mr-2"></i>Hủy
                  </button>
                  <button
                    onClick={submitReply}
                    disabled={!replyContent.trim()}
                    className="bg-blue-600 text-white px-4 py-1.5 text-sm rounded-lg font-semibold transition-all duration-200 shadow-lg cursor-pointer border border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-paper-plane w-4 mr-2"></i>Gửi
                  </button>
                </div>
              </div>
            )}
          
            {comment.replies && comment.replies.length > 0 && showReplies && (
              <div className="mt-3 sm:mt-4 ml-6 sm:ml-12 space-y-2 sm:space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="relative">
                    
                    <svg 
                      className="absolute left-[-24px] sm:left-[-48px] top-[12px] sm:top-[20px]" 
                      width="24" 
                      height="32" 
                      style={{ overflow: 'visible' }}
                    >
                      <path
                        d="M 0,-12 L 0,16 Q 0,22 6,22 L 24,22"
                        fill="none"
                        stroke="#93c5fd"
                        strokeWidth="2"
                        className="sm:hidden"
                      />
                    </svg>
                    <svg 
                      className="hidden sm:block absolute left-[-48px] top-[20px]" 
                      width="48" 
                      height="40" 
                      style={{ overflow: 'visible' }}
                    >
                      <path
                        d="M 0,-20 L 0,20 Q 0,30 10,30 L 48,30"
                        fill="none"
                        stroke="#93c5fd"
                        strokeWidth="2.5"
                      />
                    </svg>
                    <div>
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
                        pinnedCommentId={pinnedCommentId}
                        user={user}
                        getAuthorInitial={getAuthorInitial}
                        getAvatarColor={getAvatarColor}
                        getAuthorName={getAuthorName}
                        formatDate={formatDate}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
};


const CommentReactionButton = ({ commentId }: { commentId: string }) => {
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchReaction = async () => {
      try {
        const response = await axios.get(`/posts/comments/${commentId}/user-reaction`);
        if (response.data.success) {
          setCurrentReaction(response.data.reactionType);
        }
      } catch (error) {
        console.error('Error fetching comment reaction:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReaction();
  }, [commentId]);

  const handleReaction = async (reactionType: ReactionType) => {
    try {
      const typeToSend = reactionType !== null ? reactionType : currentReaction;
      
      await axios.post(`/posts/comments/${commentId}/react`, { reactionType: typeToSend });
      
      setCurrentReaction(reactionType);
      
      if (reactionType === null) {
        toast.success('Đã bỏ biểu cảm của bình luận!');
      } else {
        toast.success('Đã thả biểu cảm của bình luận!');
      }
    } catch (error) {
      console.error('Error reacting to comment:', error);
      toast.error('Vui lòng đăng nhập để thả biểu cảm!');
    }
  };

  if (loading) {
    return <div className="text-gray-400 text-sm">...</div>;
  }

  return (
    <ReactionPicker 
      onReact={handleReaction}
      currentReaction={currentReaction}
      disabled={false}
    />
  );
};
