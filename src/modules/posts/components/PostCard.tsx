import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import type { Post } from "@/shared/types";
import { exportToMarkdown, exportToPDF } from "@/shared/utils";
import ReactionPicker, { ReactionStats, type ReactionType } from "./ReactionPicker";
import ShareModal from "./ShareModal";
import axios from "@/core/config/axios";
import toast from "react-hot-toast";
import { bookmarkService } from "../services/bookmarkService";
import { getAvatarUrl } from "@/shared/utils/apiHelpers";

interface PostCardProps {
  post: Post;
  hideShare?: boolean;
  onOpenReactionModal?: (postId: number, totalReactions: number) => void;
}

export default function PostCard({ post, hideShare = false, onOpenReactionModal }: PostCardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(null);
  const [reactionStats, setReactionStats] = useState({
    like_count: 0,
    love_count: 0,
    haha_count: 0,
    wow_count: 0,
    sad_count: 0,
    angry_count: 0,
    total_reactions: 0
  });
  const [isReacting, setIsReacting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const reactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  
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

      if (reactionTimeoutRef.current) {
        clearTimeout(reactionTimeoutRef.current);
      }
    };
  }, [showMenu]);
  useEffect(() => {
    const fetchReactionData = async () => {
      try {
        const userReactionRes = await axios.get(`/posts/${post.id}/user-reaction`);
        if (userReactionRes.data.success) {
          setCurrentReaction(userReactionRes.data.reactionType);
        }
        const statsRes = await axios.get(`/posts/${post.id}/reaction-stats`);
        if (statsRes.data.success) {
          const counts = statsRes.data.counts || {};
          const stats = {
            like_count: counts.like || 0,
            love_count: counts.love || 0,
            haha_count: counts.haha || 0,
            wow_count: counts.wow || 0,
            sad_count: counts.sad || 0,
            angry_count: counts.angry || 0,
            total_reactions: counts.total || 0
          };
          setReactionStats(stats);
        }
      } catch (error) {
        console.error('Error fetching reaction data:', error);
      }
    };

    fetchReactionData();
  }, [post.id]);


  useEffect(() => {
    const fetchCommentsCount = async () => {
      try {

        const response = await axios.get(`/posts/${post.id}/comments?_t=${Date.now()}`);
        if (response.data.success) {

          const count = response.data.totalCount !== undefined 
            ? response.data.totalCount 
            : response.data.comments.filter((c: { status?: string }) => c.status !== 'hidden').length;
          setCommentsCount(count);
        }
      } catch (error) {
        console.error('Error fetching comments count:', error);

        setCommentsCount(0);
      }
    };

    fetchCommentsCount();
    

    const interval = setInterval(fetchCommentsCount, 10000);
    
    return () => clearInterval(interval);
  }, [post.id]);


  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (!userStr) return;

        const response = await bookmarkService.checkBookmark(typeof post.id === 'string' ? parseInt(post.id) : post.id);
        if (response.success) {
          setIsBookmarked(response.isBookmarked);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    checkBookmarkStatus();
  }, [post.id]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isBookmarking) return;

    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!userStr) {
      toast.error('Vui lòng đăng nhập để lưu bài viết!');
      return;
    }

    setIsBookmarking(true);
    const postId = typeof post.id === 'string' ? parseInt(post.id) : post.id;

    try {
      if (isBookmarked) {
        await bookmarkService.removeBookmark(postId);
        setIsBookmarked(false);
        toast.success('Đã xóa bài viết khỏi danh sách lưu!');
      } else {
        await bookmarkService.addBookmark(postId);
        setIsBookmarked(true);
        toast.success('Đã lưu bài viết!');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleReaction = async (reactionType: ReactionType) => {

    if (isReacting) {
      toast.error('Vui lòng chờ một chút trước khi thực hiện lại!', { duration: 1000 });
      return;
    }

    const previousReaction = currentReaction;
    const previousStats = { ...reactionStats };
    
    try {
      setIsReacting(true);
      

      setCurrentReaction(reactionType);
      

      const newStats = { ...reactionStats };
      

      if (previousReaction) {
        const oldKey = `${previousReaction}_count` as keyof typeof newStats;
        if (newStats[oldKey] > 0) {
          newStats[oldKey]--;
          newStats.total_reactions--;
        }
      }
      

      if (reactionType) {
        const newKey = `${reactionType}_count` as keyof typeof newStats;
        newStats[newKey]++;
        newStats.total_reactions++;
      }
      
      setReactionStats(newStats);
      

      const typeToSend = reactionType !== null ? reactionType : currentReaction;
      await axios.post(`/posts/${post.id}/react`, { reactionType: typeToSend });
      





      

      const statsRes = await axios.get(`/posts/${post.id}/reaction-stats`);
      if (statsRes.data.success && statsRes.data.stats) {
        setReactionStats({
          like_count: statsRes.data.stats.like_count || 0,
          love_count: statsRes.data.stats.love_count || 0,
          haha_count: statsRes.data.stats.haha_count || 0,
          wow_count: statsRes.data.stats.wow_count || 0,
          sad_count: statsRes.data.stats.sad_count || 0,
          angry_count: statsRes.data.stats.angry_count || 0,
          total_reactions: statsRes.data.stats.total_reactions || 0
        });
      }
    } catch (error) {

      setCurrentReaction(previousReaction);
      setReactionStats(previousStats);
      
      console.error('Error reacting to post:', error);
      toast.error('Hãy đăng nhâp để thả biểu cảm cho bài viết này!');
    } finally {

      if (reactionTimeoutRef.current) {
        clearTimeout(reactionTimeoutRef.current);
      }
      reactionTimeoutRef.current = setTimeout(() => {
        setIsReacting(false);
      }, 500);
    }
  };

  const handleExportMarkdown = () => {
    exportToMarkdown(post);
    setShowMenu(false);
  };

  const handleExportPDF = () => {
    exportToPDF(post);
    setShowMenu(false);
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffMs / 2592000000);
    const diffYears = Math.floor(diffMs / 31536000000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 30) return `${diffDays} ngày trước`;
    if (diffMonths < 12) return `${diffMonths} tháng trước`;
    return `${diffYears} năm trước`;
  };

  const getAuthorInitial = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Công nghệ': 'bg-blue-500',
      'Design': 'bg-purple-500',
      'Marketing': 'bg-green-500',
      'Ẩm thực': 'bg-orange-500',
      'Du lịch': 'bg-indigo-500',
      'Giáo dục': 'bg-teal-500',
      'Lifestyle': 'bg-pink-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Công nghệ': 'fa-solid fa-microchip',
      'Design': 'fa-solid fa-palette',
      'Marketing': 'fa-solid fa-bullhorn',
      'Lifestyle': 'fa-solid fa-heart',
      'Du lịch': 'fa-solid fa-plane-departure',
      'Ẩm thực': 'fa-solid fa-utensils',
      'Giáo dục': 'fa-solid fa-graduation-cap'
    };
    return icons[category] || 'fa-solid fa-folder';
  };

  const getAvatarColor = (category: string) => {
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


  const isHotPost = () => {
    const totalReactions = reactionStats.total_reactions || 0;
    const totalComments = commentsCount || 0;
    const totalViews = post.views || 0;
    


    const engagementScore = totalReactions + (totalComments * 2) + (totalViews / 10);
    
    return totalReactions >= 10 || totalComments >= 5 || totalViews >= 100 || engagementScore >= 15;
  };

  const handleCardClick = (e: React.MouseEvent) => {

    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('.reaction-picker') ||
      target.closest('[data-no-navigate]')
    ) {
      return;
    }
    navigate(`/post/${post.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-white/20 group hover:scale-105 hover:bg-white/90 relative h-full flex flex-col cursor-pointer">
      
      <div className="absolute top-4 right-4 z-10" ref={menuRef} data-no-navigate>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 hover:text-blue-600 border border-gray-200 cursor-pointer"
          aria-label="Menu xuất bài viết"
          title="Menu xuất bài viết"
        >
          <i className="fa-solid fa-ellipsis-vertical text-lg"></i>
        </button>

        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 animate-fadeIn overflow-y-auto max-h-[70vh]">
            <button
              onClick={handleBookmark}
              disabled={isBookmarking}
              className={`group w-full px-4 py-3 text-left text-sm transition-all duration-300 flex items-center gap-3 cursor-pointer hover:pl-5 hover:shadow-md border-l-4 border-transparent ${
                isBookmarked 
                  ? 'text-yellow-600 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:border-yellow-500' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:text-yellow-600 hover:border-yellow-500'
              } ${isBookmarking ? 'opacity-50 cursor-wait' : ''}`}
            >
              <i className={`${isBookmarked ? 'fa-solid' : 'fa-solid'} fa-bookmark text-lg w-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300`}></i>
              <div>
                <p className="font-medium group-hover:text-yellow-700">{isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}</p>
                <p className="text-xs text-gray-500 group-hover:text-yellow-600">{isBookmarked ? 'Xóa khỏi danh sách' : 'Lưu để đọc sau'}</p>
              </div>
            </button>
            <div className="my-1 border-t border-gray-100"></div>
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs text-center font-semibold text-gray-500 uppercase tracking-wide">Xuất bài viết</p>
            </div>
            <button
              onClick={handleExportMarkdown}
              className="group w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 flex items-center gap-3 cursor-pointer hover:pl-5 hover:shadow-md border-l-4 border-transparent hover:border-gray-500"
            >
              <i className="fa-solid fa-file-code text-gray-600 text-lg w-5 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300"></i>
              <div>
                <p className="font-medium group-hover:text-gray-800">Xuất Markdown</p>
                <p className="text-xs text-gray-500 group-hover:text-gray-600">Định dạng .md</p>
              </div>
            </button>
            <button
              onClick={handleExportPDF}
              className="group w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 flex items-center gap-3 cursor-pointer hover:pl-5 hover:shadow-md border-l-4 border-transparent hover:border-red-500"
            >
              <i className="fa-solid fa-file-pdf text-red-600 text-lg w-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300"></i>
              <div>
                <p className="font-medium group-hover:text-red-700">Xuất PDF</p>
                <p className="text-xs text-gray-500 group-hover:text-red-600">Định dạng .pdf</p>
              </div>
            </button>
          </div>
        )}
      </div>

      
      <div className="flex-grow flex flex-col">
        {post.featuredImage && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        )}

        
        <div className="flex items-center gap-3 mb-4 justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/userdetail/${post.authorId}`);
            }}
            data-no-navigate
          >
            {(post.authorAvatar || (post.author && typeof post.author === 'object' && post.author.avatar)) ? (
              <img
                src={getAvatarUrl(
                  post.authorAvatar || (typeof post.author === 'object' ? post.author.avatar : undefined)
                )}
                alt={typeof post.author === 'string' ? post.author : post.author?.name || 'User'}
                className={`w-10 h-10 rounded-full object-cover border border-blue-200`}
              />
            ) : (
              <div className={`w-10 h-10 ${getAvatarColor(post.category || 'Khác')} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                {getAuthorInitial(typeof post.author === 'string' ? post.author : post.author?.name || 'User')}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-800">{typeof post.author === 'string' ? post.author : post.author?.name || 'Không rõ'}</p>
              <p className="text-xs text-gray-500"><i className="fa-solid fa-calendar mr-2"></i>{formatDate(post.createdAt)}</p>
            </div>
          </div>
        </div>
      
      
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)} text-white`}>
          <i className={getCategoryIcon(post.category)}></i>
          {post.category}
        </span>
        {isHotPost() && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
            <i className="fa-solid fa-fire"></i>
            <span>Hot</span>
          </div>
        )}

        {post.privacy && post.privacy !== 'public' && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            post.privacy === 'private' ? 'bg-gray-600' : 'bg-indigo-600'
          } text-white`} title={post.privacy === 'private' ? 'Chỉ bạn có thể xem' : 'Chỉ người theo dõi có thể xem'}>
            <i className={`fa-solid ${post.privacy === 'private' ? 'fa-lock' : 'fa-user-group'} text-[10px]`}></i>
            {post.privacy === 'private' ? 'Riêng tư' : 'Người theo dõi'}
          </span>
        )}
      </div>
      
      
      <h2 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
        <Link to={`/post/${post.id}`} className="hover:text-blue-600">
          {post.title}
        </Link>
      </h2>
      
      
      <div className="text-gray-600 text-sm mb-4 leading-relaxed relative">
        <p className="line-clamp-3">
          {(() => {
            const plainText = post.content.replace(/<[^>]*>/g, '').substring(0, 100);
            return plainText;
          })()}
          <span className="text-gray-400 ml-1">... </span>
          <span className="text-blue-500 italic transition-all duration-300 hover:text-blue-700 hover:underline hover:underline-offset-2 hover:opacity-100 opacity-60 cursor-pointer">xem thêm</span>
        </p>
      </div>

        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md flex items-center gap-1">
                <i className="fa-solid fa-tag text-[10px] mr-1"></i>
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md flex items-center gap-1">
                <i className="fa-solid fa-tags text-[10px] mr-1"></i>
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        
        <div className="flex flex-col gap-2 pt-4 border-t border-gray-300 mt-auto">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-4 text-sm text-gray-500 flex-wrap" data-no-navigate>
            <div className="flex items-center gap-2">
              <ReactionPicker 
                onReact={handleReaction}
                currentReaction={currentReaction}
              />
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${post.id}`, { state: { scrollToComments: true } });
              }}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
              title="Xem bình luận"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span className="hidden xs:inline">{commentsCount}</span>
              <span className="inline xs:hidden">{commentsCount}</span>
            </button>
            {!hideShare && location.pathname !== '/' && (
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer" 
                title="Chia sẻ bài viết"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="hidden sm:inline">Chia sẻ</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1 hover:text-gray-700 transition-colors" title="Số lượt xem">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.views || 0}
            </span>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="whitespace-nowrap">{getTimeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
        </div>
        
          {reactionStats && reactionStats.total_reactions > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <ReactionStats 
                stats={reactionStats} 
                onClick={() => onOpenReactionModal?.(typeof post.id === 'string' ? parseInt(post.id) : post.id, reactionStats.total_reactions)}
              />
            </div>
          )}
        </div>

      {!hideShare && location.pathname !== '/' && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          postId={typeof post.id === 'string' ? parseInt(post.id) : post.id}
          postTitle={post.title}
        />
      )}
    </div>
  );
}

