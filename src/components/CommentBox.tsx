import { useState } from "react";
import { useComments } from "../hooks/useComments";
import { useAuth } from "../context/AuthContext";

interface CommentBoxProps {
  postId: string;
}

export default function CommentBox({ postId }: CommentBoxProps) {
  const { comments, loading, error, addComment, likeComment } = useComments(postId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Vừa xong";
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
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
      console.log('=== Sending Comment ===');
      console.log('Post ID:', postId);
      console.log('User:', user);
      console.log('Comment content:', newComment.trim());
      
      const commentData = {
        postId,
        authorId: String(user.id),
        author: {
          ...user,
          id: String(user.id),
          name: user.username,
          avatar: user.avatarUrl || '',
          bio: '',
          joinDate: new Date().toISOString().split('T')[0],
          postsCount: 0,
          followersCount: 0
        },
        content: newComment.trim()
      };
      
      console.log('Comment data to send:', commentData);
      
      await addComment(commentData);
      setNewComment("");
      console.log('Comment sent successfully!');
    } catch (error) {
      console.error('=== Error submitting comment ===');
      console.error('Error details:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      alert('Không thể gửi bình luận. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Bình luận ({comments.length})
      </h3>
      
      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-4 mb-4">
            {user.avatarUrl ? (
              <img 
                src={`http://localhost:5000${user.avatarUrl}`}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover shadow-lg flex-shrink-0 ring-4 ring-white"
              />
            ) : (
              <div className={`w-12 h-12 bg-gradient-to-r ${getAvatarColor(user.username)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
                {getAuthorInitial(user.username)}
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:outline-none transition-all duration-300 resize-none hover:border-gray-300"
                rows={4}
                placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="text-sm text-gray-500">
                  {newComment.length > 0 && `${newComment.length} ký tự`}
                </div>
                <div className="flex gap-2">
                  {newComment.trim() && (
                    <button 
                      type="button"
                      onClick={() => setNewComment('')}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-100"
                    >
                      Hủy
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang gửi...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-paper-plane"></i>
                        Gửi bình luận
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl text-center border-2 border-blue-200">
          <svg className="w-12 h-12 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-700 mb-3 font-medium">Đăng nhập để bình luận</p>
          <a href="/login" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Đăng nhập ngay
          </a>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-xl p-4">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Comments List */}
      {!loading && !error && (
        <div className="space-y-6">
          {comments.map((comment, index) => {
            const authorName = getAuthorName(comment.author);
            const avatarUrl = (comment.author as { avatarUrl?: string; avatar?: string }).avatarUrl || 
                             (comment.author as { avatarUrl?: string; avatar?: string }).avatar;
            return (
              <div key={comment.id} className="flex gap-4 group">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:5000${avatarUrl}`}
                    alt={authorName}
                    className="w-12 h-12 rounded-full object-cover shadow-lg flex-shrink-0 ring-4 ring-white transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className={`w-12 h-12 bg-gradient-to-r ${getAvatarColor(authorName)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0 ring-4 ring-white transition-transform group-hover:scale-110`}>
                    {getAuthorInitial(authorName)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{authorName}</span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                        <i className="fa-regular fa-clock mr-1"></i>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    {index === 0 && (
                      <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full font-semibold shadow-sm">
                        Mới nhất
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">{comment.content}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <button 
                      onClick={() => likeComment(comment.id)}
                      className="hover:text-red-500 transition-all flex items-center gap-2 group/like"
                    >
                      <div className="p-2 rounded-full hover:bg-red-50 transition-colors">
                        <svg className="w-5 h-5 group-hover/like:scale-125 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium">{comment.likes > 0 ? comment.likes : 'Thích'}</span>
                    </button>
                    <button className="hover:text-blue-600 transition-all flex items-center gap-2 group/reply">
                      <div className="p-2 rounded-full hover:bg-blue-50 transition-colors">
                        <svg className="w-5 h-5 group-hover/reply:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </div>
                      <span className="font-medium">Trả lời</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
          })}

          {/* Empty State */}
          {comments.length === 0 && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có bình luận nào</h3>
              <p className="text-gray-600">Hãy là người đầu tiên chia sẻ suy nghĩ về bài viết này!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
