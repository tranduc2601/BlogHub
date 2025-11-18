import { useParams, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import CommentBox from "../components/CommentBox";
import ReportModal from "../components/ReportModal";
import ShareModal from "../components/ShareModal";
import Modal from "../components/Modal";
import axios from '../config/axios';
import toast from 'react-hot-toast';
import type { Post } from "../data/mockData";
import { exportToPDF, exportToMarkdown } from '../utils/exportUtils';
import ReactionPicker, { type ReactionType } from "../components/ReactionPicker";

export default function PostDetailPage() {
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showReportSuccessModal, setShowReportSuccessModal] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [viewTracked, setViewTracked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [reactionStats, setReactionStats] = useState({
    like_count: 0,
    love_count: 0,
    haha_count: 0,
    wow_count: 0,
    sad_count: 0,
    angry_count: 0,
    total_reactions: 0
  });
  
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Công nghệ': 'bg-blue-500',
      'Design': 'bg-purple-500',
      'Marketing': 'bg-green-500',
      'Ẩm thực': 'bg-orange-500',
      'Du lịch': 'bg-indigo-500',
      'Giáo dục': 'bg-teal-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  async function handleReaction(reactionType: ReactionType) {
    if (post) {
      if (post.status === 'pending') {
        toast.error('Bài viết đang chờ duyệt, không thể thả biểu cảm!', {
          duration: 3000,
          position: 'top-right',
        });
        return;
      }
      
      try {
        const typeToSend = reactionType !== null ? reactionType : currentReaction;
        
        await axios.post(`/posts/${post.id}/react`, { reactionType: typeToSend });
        setCurrentReaction(reactionType);
        
        if (reactionType === null) {
          toast.success('Đã bỏ biểu cảm!');
        } else {
          toast.success('Đã thả biểu cảm!');
        }
        const statsRes = await axios.get(`/posts/${post.id}/reaction-stats`);
        if (statsRes.data.success) {
          const counts = statsRes.data.counts || {};
          setReactionStats({
            like_count: counts.like || 0,
            love_count: counts.love || 0,
            haha_count: counts.haha || 0,
            wow_count: counts.wow || 0,
            sad_count: counts.sad || 0,
            angry_count: counts.angry || 0,
            total_reactions: counts.total || 0
          });
        }
      } catch (error) {
        console.error('Error reacting to post:', error);
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 401) {
          toast.error('Vui lòng đăng nhập để thả biểu cảm!', {
            duration: 3000,
            position: 'top-right',
          });
        } else {
          toast.error('Vui lòng đăng nhập để thả biểu cảm!');
        }
      }
    }
  }

  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        if (id) {
          const response = await axios.get(`/posts/${id}`);
          if (response.data && response.data.success && response.data.post) {
            setPost(response.data.post);
          } else {
            setError('Không tìm thấy bài viết');
          }
        }
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Không thể tải bài viết!');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    const checkIfLiked = async () => {
      try {
        const response = await axios.get(`/posts/${post?.id}/isLiked`);
        if (response.data.success) {
          setCurrentReaction(response.data.reactionType);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    const fetchCommentsCount = async () => {
      try {
        const response = await axios.get(`/posts/${post?.id}/comments`);
        if (response.data.success) {
          const count = response.data.totalCount !== undefined 
            ? response.data.totalCount 
            : response.data.comments.length;
          setCommentsCount(count);
        }
      } catch (error) {
        console.error('Error fetching comments count:', error);
      }
    };

    const fetchReactionStats = async () => {
      try {
        const response = await axios.get(`/posts/${post?.id}/reaction-stats`);
        if (response.data.success) {
          const counts = response.data.counts || {};
          setReactionStats({
            like_count: counts.like || 0,
            love_count: counts.love || 0,
            haha_count: counts.haha || 0,
            wow_count: counts.wow || 0,
            sad_count: counts.sad || 0,
            angry_count: counts.angry || 0,
            total_reactions: counts.total || 0
          });
        }
      } catch (error) {
        console.error('Error fetching reaction stats:', error);
      }
    };

    const checkFollowStatus = async () => {
      if (!post || !post.authorId) return;
      try {
        const response = await axios.get(`/users/${post.authorId}/follow-status`);
        if (response.data.success) {
          setIsFollowing(response.data.isFollowing);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    if (post) {
      checkIfLiked();
      fetchCommentsCount();
      fetchReactionStats();
      checkFollowStatus();
    }
  }, [post]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleFollowToggle = async () => {
    if (!post || !post.authorId || followLoading) return;
    if (post.status === 'pending') {
      toast.error('Bài viết đang chờ duyệt, không thể theo dõi tác giả!', {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(`/users/${post.authorId}/follow`);
        setIsFollowing(false);
        toast.success("Đã hủy theo dõi thành công!", {
          duration: 2000,
          position: 'top-right',
        });
      } else {
        await axios.post(`/users/${post.authorId}/follow`);
        setIsFollowing(true);
        toast.success("Đã theo dõi thành công!", {
          duration: 2000,
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error("Có lỗi xảy ra!", {
        duration: 2000,
        position: 'top-right',
      });
    } finally {
      setFollowLoading(false);
    }
  };
  useEffect(() => {
    if (!post || viewTracked) {
      return;
    }
    if (post.status === 'pending') {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          sessionStorage.setItem('sessionId', sessionId);
        }
        
        const response = await axios.post(`/posts/${post.id}/view`, { sessionId });
        setViewTracked(true);
        if (response.data.success) {
          const refreshResponse = await axios.get(`/posts/${post.id}`);
          if (refreshResponse.data && refreshResponse.data.success && refreshResponse.data.post) {
            setPost(refreshResponse.data.post);
          }
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
  }, [post, viewTracked]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateReadTime = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const wordsPerMinute = 225;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, minutes);
  };

  const formatReadTime = (content: string) => {
    const minutes = calculateReadTime(content);
    return `${minutes} phút đọc`;
  };

  const getAuthorInitial = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden animate-pulse">
          <div className="bg-gradient-to-r from-gray-300 to-gray-400 h-64"></div>
          <div className="p-8 md:p-12">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Không thể tải bài viết</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!post) {
    return <Navigate to="/" replace />;
  }

  const handleReportSubmit = async (reason: string) => {
    try {
      const response = await axios.post(`/posts/${post?.id}/report`, { reason });
      if (response.data.success) {
        setShowReportSuccessModal(true);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Gửi báo cáo thất bại!');
      throw error;
    }
  };

  const handleExportPDF = async () => {
    if (!post) return;
    
    setIsExporting(true);
    setShowMenu(false);
    const toastId = toast.loading('Đang xuất PDF...', {
      position: 'top-right',
    });
    
    try {
      await exportToPDF(post);
      toast.success('Xuất PDF thành công!', {
        id: toastId,
        duration: 2000,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Không thể xuất PDF. Vui lòng thử lại!', {
        id: toastId,
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!post) return;
    
    setIsExporting(true);
    setShowMenu(false);
    const toastId = toast.loading('Đang xuất Markdown...', {
      position: 'top-right',
    });
    
    try {
      exportToMarkdown(post);
      toast.success('Xuất Markdown thành công!', {
        id: toastId,
        duration: 2000,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error exporting Markdown:', error);
      toast.error('Không thể xuất Markdown. Vui lòng thử lại!', {
        id: toastId,
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto select-none">
      <article className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden relative">
        
        {post.status !== 'pending' && (
          <div className="absolute top-6 right-6 z-20" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 hover:text-blue-600 border border-gray-200 cursor-pointer"
              aria-label="Menu tùy chọn"
              title="Menu tùy chọn"
            >
              <i className="fa-solid fa-ellipsis-vertical text-lg"></i>
            </button>

          
          {showMenu && (
            <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 animate-fadeIn overflow-hidden">
              {(() => {
                const currentUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
                return currentUser && currentUser.id === post.authorId && (
                  <>
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs text-center font-semibold text-gray-500 uppercase tracking-wide">Quản lý bài viết</p>
                    </div>
                    <a
                      href={`/edit/${post.id}`}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-yellow-50 transition-colors duration-200 flex items-center gap-3 cursor-pointer"
                      onClick={() => setShowMenu(false)}
                    >
                      <i className="fa-solid fa-pen text-yellow-600 text-lg w-5"></i>
                      <div>
                        <p className="font-medium">Sửa bài viết</p>
                        <p className="text-xs text-gray-500">Chỉnh sửa nội dung</p>
                      </div>
                    </a>
                    <div className="my-1 border-t border-gray-100"></div>
                  </>
                );
              })()}
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs text-center font-semibold text-gray-500 uppercase tracking-wide">Xuất bài viết</p>
              </div>
              <button
                onClick={handleExportMarkdown}
                disabled={isExporting}
                className={`w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 cursor-pointer ${
                  isExporting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <i className="fa-solid fa-file-code text-gray-600 text-lg w-5"></i>
                <div>
                  <p className="font-medium">Xuất Markdown</p>
                  <p className="text-xs text-gray-500">Định dạng .md</p>
                </div>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className={`w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3 cursor-pointer ${
                  isExporting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <i className="fa-solid fa-file-pdf text-red-600 text-lg w-5"></i>
                <div>
                  <p className="font-medium">Xuất PDF</p>
                  <p className="text-xs text-gray-500">Định dạng .pdf</p>
                </div>
              </button>
            </div>
          )}
          </div>
        )}

        
        {post.featuredImage && (
          <div className="relative h-64 md:h-80 overflow-hidden border-b border-gray-500">
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        )}

        
        <div className="bg-blue-700 p-8 text-white">
          
          {post.status === 'pending' && (
            <div className="mb-6 bg-orange-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
              <i className="fa-solid fa-hourglass-half text-2xl"></i>
              <div>
                <p className="font-bold text-lg">Bài viết đang chờ duyệt</p>
                <p className="text-sm text-orange-100">Bài viết này đang được admin xem xét. Các tính năng tương tác sẽ được kích hoạt sau khi bài viết được duyệt. Đây là bản xem trước</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 mb-4">
            {post.authorAvatar && post.authorAvatar !== '' ? (
              <img 
                src={post.authorAvatar}
                alt={typeof post.author === 'string' ? post.author : (post.author?.name || 'User')} 
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg" 
              />
            ) : (
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {getAuthorInitial(typeof post.author === 'string' ? post.author : (post.author?.name || 'User'))}
              </div>
            )}
            <div>
              <p className="font-semibold flex items-center gap-2">
                  {typeof post.author === 'string' ? post.author : (post.author?.name || 'User')}
                {(() => {
                  const currentUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
                  if (!currentUser || currentUser.id === post.authorId) return null;
                  return (
                    <button 
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer border-2 
                        ${followLoading
                          ? 'bg-gray-400 text-white cursor-wait border-gray-400'
                          : isFollowing
                            ? 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-400 hover:shadow-lg hover:scale-105 active:scale-95'
                            : 'bg-blue-800 text-white border-blue-900 hover:bg-blue-900 hover:shadow-lg hover:scale-105 active:scale-95'}
                      `}
                      style={{marginLeft: 8}}
                    >
                      {followLoading ? (
                        <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Đang xử lý...</>
                      ) : isFollowing ? (
                        <><i className="fa-solid fa-user-minus mr-2"></i>Bỏ theo dõi</>
                      ) : (
                        <><i className="fa-solid fa-user-plus mr-2"></i>Theo dõi</>
                      )}
                    </button>
                  );
                })()}
              </p>
              <p className="text-blue-200 text-sm">
                {formatDate(post.createdAt)} • {formatReadTime(post.content)}
              </p>
            </div>
          </div>
          
          
          <div className="mb-4">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(post.category)} text-white`}>
              {post.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {post.title}
          </h1>
        </div>

        
        <div className="p-8 md:p-12">
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }}></div>

          
          <div className="flex flex-wrap gap-2 mb-8 mt-8">
            {post.tags.map((tag: string, index: number) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                #{tag}
              </span>
            ))}
          </div>

          
          {post.status !== 'pending' && (
            <div className="flex flex-col gap-4 py-6 border-t border-gray-200">
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <ReactionPicker 
                  onReact={handleReaction}
                  currentReaction={currentReaction}
                  disabled={post.status === 'pending'}
                />
                {reactionStats && reactionStats.total_reactions > 0 && (
                  <span className="text-sm font-semibold text-gray-700" title={`Tổng ${reactionStats.total_reactions} biểu cảm`}>
                    {reactionStats.total_reactions}
                  </span>
                )}
                </div>
              {reactionStats && reactionStats.total_reactions > 0 && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-200">
                  {reactionStats.like_count > 0 && (
                    <span className="flex items-center gap-1" title="Thích">
                      <span className="text-lg">👍</span>
                      <span className="text-sm font-medium text-gray-700">{reactionStats.like_count}</span>
                    </span>
                  )}
                  {reactionStats.love_count > 0 && (
                    <span className="flex items-center gap-1" title="Yêu thích">
                      <span className="text-lg">❤️</span>
                      <span className="text-sm font-medium text-gray-700">{reactionStats.love_count}</span>
                    </span>
                  )}
                  {reactionStats.haha_count > 0 && (
                    <span className="flex items-center gap-1" title="Haha">
                      <span className="text-lg">😂</span>
                      <span className="text-sm font-medium text-gray-700">{reactionStats.haha_count}</span>
                    </span>
                  )}
                  {reactionStats.wow_count > 0 && (
                    <span className="flex items-center gap-1" title="Wow">
                      <span className="text-lg">😮</span>
                      <span className="text-sm font-medium text-gray-700">{reactionStats.wow_count}</span>
                    </span>
                  )}
                  {reactionStats.sad_count > 0 && (
                    <span className="flex items-center gap-1" title="Buồn">
                      <span className="text-lg">😢</span>
                      <span className="text-sm font-medium text-gray-700">{reactionStats.sad_count}</span>
                    </span>
                  )}
                  {reactionStats.angry_count > 0 && (
                    <span className="flex items-center gap-1" title="Phẫn nộ">
                      <span className="text-lg">😠</span>
                      <span className="text-sm font-medium text-gray-700">{reactionStats.angry_count}</span>
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span>{commentsCount} Bình luận</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{post.views} Lượt xem</span>
              </div>

              
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-full text-green-600 font-medium text-sm hover:from-green-100 hover:to-blue-100 hover:border-green-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
                title="Chia sẻ bài viết"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Chia sẻ
              </button>
              
              {(() => {
                const currentUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
                if (currentUser && currentUser.id === post.authorId) return null;
                
                return (
                  <div className="flex items-center gap-2 text-gray-600 ml-auto">
                    <button
                      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-full text-orange-600 font-medium text-sm transition-all duration-300 group ${
                        currentUser 
                          ? 'hover:from-orange-100 hover:to-red-100 hover:border-orange-300 hover:shadow-md cursor-pointer' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      title={currentUser ? "Báo cáo bài viết vi phạm" : "Đăng nhập để báo cáo"}
                      onClick={() => currentUser && setIsReportModalOpen(true)}
                      disabled={!currentUser}
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                      Báo cáo
                    </button>
                  </div>
                );
              })()}
              </div>
            </div>
          )}

          
        </div>
      </article>

      
      <div className="mt-12">
        {post.status === 'pending' ? (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-8 text-center">
            <i className="fa-solid fa-comment-slash text-4xl text-orange-400 mb-4"></i>
            <h3 className="text-xl font-bold text-orange-800 mb-2">Bình luận đã bị khóa!</h3>
            <p className="text-orange-600">Bài viết đang chờ duyệt. Bạn có thể bình luận sau khi bài viết được Admin duyệt!</p>
          </div>
        ) : (
          <CommentBox 
            postId={post.id}
            postAuthorId={typeof post.authorId === 'string' ? parseInt(post.authorId) : post.authorId}
            onCommentAdded={() => setCommentsCount(prev => prev + 1)}
          />
        )}
      </div>

      
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        postTitle={post.title}
      />

      
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        postId={parseInt(post.id.toString())}
        postTitle={post.title}
      />

      
      <Modal
        isOpen={showReportSuccessModal}
        onClose={() => setShowReportSuccessModal(false)}
        onConfirm={() => setShowReportSuccessModal(false)}
        title="Báo cáo thành công"
        message="Đã gửi báo cáo vi phạm thành công! Admin sẽ xem xét báo cáo của bạn trong thời gian sớm nhất."
        type="success"
        confirmText="Đóng"
      />
    </div>
  );
}
