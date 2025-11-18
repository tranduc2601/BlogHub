import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import type { Post } from "../data/mockData";
import { exportToMarkdown, exportToPDF } from "../utils/exportUtils";
import ReactionPicker, { ReactionStats, type ReactionType } from "./ReactionPicker";
import ShareModal from "./ShareModal";
import axios from "../config/axios";
import toast from "react-hot-toast";

interface PostCardProps {
  post: Post;
  hideShare?: boolean;
}

export default function PostCard({ post, hideShare = false }: PostCardProps) {
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
  useEffect(() => {
    const fetchReactionData = async () => {
      try {
        console.log('Fetching reaction data for post:', post.id);
        const userReactionRes = await axios.get(`/posts/${post.id}/user-reaction`);
        console.log('User reaction response:', userReactionRes.data);
        if (userReactionRes.data.success) {
          setCurrentReaction(userReactionRes.data.reactionType);
        }
        const statsRes = await axios.get(`/posts/${post.id}/reaction-stats`);
        console.log('Stats response:', statsRes.data);
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
          console.log('✅ Reaction stats for post', post.id, ':', stats);
          setReactionStats(stats);
        } else {
          console.log('⚠️ No stats data or success=false');
        }
      } catch (error) {
        console.error('❌ Error fetching reaction data:', error);
      }
    };

    fetchReactionData();
  }, [post.id]);

  const handleReaction = async (reactionType: ReactionType) => {
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
      console.error('Error reacting to post:', error);
      toast.error('Hãy đăng nhâp để thả biểu cảm cho bài viết này!');
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
      'Giáo dục': 'bg-teal-500'
    };
    return colors[category] || 'bg-gray-500';
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Không navigate nếu click vào các phần tử tương tác
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
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-fadeIn">
            <button
              onClick={handleExportMarkdown}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-file-code"></i>
              <span>Xuất Markdown</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-file-pdf"></i>
              <span>Xuất PDF</span>
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

        
        <div className="flex items-center gap-3 mb-4">
        
        {(post.authorAvatar || (post.author && typeof post.author === 'object' && post.author.avatar)) ? (
          <img
            src={
              post.authorAvatar 
                ? (post.authorAvatar.startsWith('http') ? post.authorAvatar : `http://localhost:5000${post.authorAvatar}`)
                : typeof post.author === 'object' && post.author.avatar.startsWith('http') 
                  ? post.author.avatar 
                  : `http://localhost:5000${typeof post.author === 'object' ? post.author.avatar : ''}`
            }
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
          <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
        </div>
      </div>
      
      
      <div className="mb-3">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)} text-white`}>
          {post.category}
        </span>
      </div>
      
      
      <h2 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
        <Link to={`/post/${post.id}`} className="hover:text-blue-600">
          {post.title}
        </Link>
      </h2>
      
      
      {post.excerpt && (
        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
      )}

        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-300 mt-auto">
        <div className="flex items-center gap-4 text-sm text-gray-500" data-no-navigate>
          <div className="flex items-center gap-2">
            <ReactionPicker 
              onReact={handleReaction}
              currentReaction={currentReaction}
            />
            {reactionStats && reactionStats.total_reactions > 0 && (
              <span className="text-sm font-semibold text-gray-700" title={`Tổng ${reactionStats.total_reactions} biểu cảm`}>
                {reactionStats.total_reactions}
              </span>
            )}
          </div>
          {/* {reactionStats && reactionStats.total_reactions > 0 && (
            <div className="flex items-center gap-2">
              {reactionStats.like_count > 0 && (
                <span className="flex items-center gap-0.5" title="Thích">
                  <span className="text-base">👍</span>
                  <span className="text-xs font-medium">{reactionStats.like_count}</span>
                </span>
              )}
              {reactionStats.love_count > 0 && (
                <span className="flex items-center gap-0.5" title="Yêu thích">
                  <span className="text-base">❤️</span>
                  <span className="text-xs font-medium">{reactionStats.love_count}</span>
                </span>
              )}
              {reactionStats.haha_count > 0 && (
                <span className="flex items-center gap-0.5" title="Haha">
                  <span className="text-base">😂</span>
                  <span className="text-xs font-medium">{reactionStats.haha_count}</span>
                </span>
              )}
              {reactionStats.wow_count > 0 && (
                <span className="flex items-center gap-0.5" title="Wow">
                  <span className="text-base">😮</span>
                  <span className="text-xs font-medium">{reactionStats.wow_count}</span>
                </span>
              )}
              {reactionStats.sad_count > 0 && (
                <span className="flex items-center gap-0.5" title="Buồn">
                  <span className="text-base">😢</span>
                  <span className="text-xs font-medium">{reactionStats.sad_count}</span>
                </span>
              )}
              {reactionStats.angry_count > 0 && (
                <span className="flex items-center gap-0.5" title="Phẫn nộ">
                  <span className="text-base">😠</span>
                  <span className="text-xs font-medium">{reactionStats.angry_count}</span>
                </span>
              )}
            </div>
          )} */}
          <span className="flex items-center gap-1 hover:text-gray-700 transition-colors" title="Số lượng comments">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            {post.comments || 0}
          </span>
          {!hideShare && location.pathname !== '/' && (
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer" 
              title="Chia sẻ bài viết"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Chia sẻ
            </button>
          )}
          <span className="flex items-center gap-1 hover:text-gray-700 transition-colors" title="Số lượt xem">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.views || 0}
          </span>
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getTimeAgo(post.createdAt)}
          </div>
        </div>
        
          {reactionStats && reactionStats.total_reactions > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <ReactionStats stats={reactionStats} />
            </div>
          )}
      
          <div className="mt-auto pt-4">
            <Link 
              to={`/post/${post.id}`} 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300"
            >
              Đọc thêm
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
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

