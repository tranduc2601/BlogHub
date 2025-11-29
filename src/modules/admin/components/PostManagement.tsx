import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Modal } from '@/shared/ui';
import type { AdminPost } from '@/shared/types';
import { getApiUrl } from '@/shared/utils/apiHelpers';
interface ReactionCounts {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
  total: number;
  [key: string]: number; 
}

interface Comment {
  id: number;
  author: string;
  authorId?: number;
  authorAvatar?: string;
  authorRole?: string;
  content: string;
  createdAt: string;
  isHidden: boolean;
  isPinned?: boolean;
  likes?: number;
  isLiked?: boolean;
  reactionCounts?: ReactionCounts;
  parentId?: number | null;
  replies?: Comment[];
}

interface PostManagementProps {
  posts: AdminPost[];
  onToggleStatus: (postId: number) => void;
  onApprovePost?: (postId: number) => void;
  onRejectPost?: (postId: number) => void;
  onDeletePost?: (postId: number) => void;
  onPendingCountChange?: (count: number) => void;
}

const PostManagement: React.FC<PostManagementProps> = ({ posts, onToggleStatus, onApprovePost, onRejectPost, onDeletePost, onPendingCountChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (onPendingCountChange) {
      const pendingCount = posts.filter(p => p.status === 'pending').length;
      onPendingCountChange(pendingCount);
    }
  }, [posts, onPendingCountChange]);


  useEffect(() => {
    const fetchPostReactions = async () => {
      const reactionsPromises = posts.map(async (post) => {
        try {
          const response = await fetch(getApiUrl(`posts/${post.id}/reaction-stats`));
          const data = await response.json();
          if (data.success) {
            return { postId: post.id, counts: data.counts };
          }
        } catch (err) {
          console.error('Error fetching reactions for post:', post.id, err);
        }
        return null;
      });

      const results = await Promise.all(reactionsPromises);
      const reactionsMap: Record<number, ReactionCounts> = {};
      results.forEach(result => {
        if (result) {
          reactionsMap[result.postId] = result.counts;
        }
      });
      setPostReactions(reactionsMap);
    };

    if (posts.length > 0) {
      fetchPostReactions();
    }
  }, [posts]);


  const getCommentAvatar = (avatarUrl?: string) => {

    return avatarUrl || null;
  };
  
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const POSTS_PER_PAGE = 5;


  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  };
  
  const [filter, setFilter] = useState<'all' | 'needsReview' | 'pending' | 'visible' | 'hidden'>(
    (searchParams.get('filter') as 'all' | 'needsReview' | 'pending' | 'visible' | 'hidden') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchDate, setSearchDate] = useState(searchParams.get('date') || '');
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [commentReactions, setCommentReactions] = useState<Record<number, ReactionCounts>>({});
  const [postReactions, setPostReactions] = useState<Record<number, ReactionCounts>>({});
  const [currentPostAuthorId, setCurrentPostAuthorId] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; commentId: number } | null>(null);
  const [toggledPostId, setToggledPostId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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


  const filteredPosts = posts
    .filter(post => {
      let matches = true;
      

      if (filter === 'needsReview') matches = matches && post.needsReview;
      else if (filter === 'pending') matches = matches && post.status === 'pending';
      else if (filter === 'visible') matches = matches && post.status === 'visible';
      else if (filter === 'hidden') matches = matches && post.status === 'hidden';
      
      if (searchQuery) {
        matches = matches && post.author.toLowerCase().includes(searchQuery.toLowerCase());
      }   

      if (searchDate) {
        matches = matches && post.createdAt.includes(searchDate);
      }
      
      return matches;
    })
    .sort((a, b) => {
      // Bài viết pending hiển thị trên đầu
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      
      // Nếu cả hai đều pending: bài tạo sau (mới hơn) ở trên, bài tạo trước (cũ hơn) ở dưới
      if (a.status === 'pending' && b.status === 'pending') {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Mới hơn trên đầu
      }
      
      // Nếu cả hai đều đã duyệt/ẩn: bài tạo trước (cũ hơn) ở trên, bài tạo sau (mới hơn) ở dưới
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB; // Cũ hơn trên đầu
    });


  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, searchDate]);

  // Cập nhật URL khi state thay đổi
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('filter', filter);
    if (searchQuery) params.set('search', searchQuery);
    if (searchDate) params.set('date', searchDate);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [filter, searchQuery, searchDate, currentPage, setSearchParams]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Tự động chuyển về trang trước nếu trang hiện tại không còn bài viết nào
  useEffect(() => {
    if (paginatedPosts.length === 0 && currentPage > 1 && filteredPosts.length > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [paginatedPosts.length, currentPage, filteredPosts.length]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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

  const handleReject = (postId: number) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Từ chối bài viết',
      message: 'Bạn có chắc muốn từ chối bài viết này? Bài viết sẽ bị ẩn và không hiển thị công khai.',
      onConfirm: () => {
        onRejectPost?.(postId);
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

  const handleViewPost = async (post: AdminPost) => {
    setSelectedPost(post);
    setPostComments([]); 
    setCommentReactions({}); 
    setIsLoading(true);
    
    // Thay đổi URL
    navigate(`/admin/post-management/post_${post.id}`, { replace: false });
    
    try {

      const postResponse = await fetch(getApiUrl(`posts/${post.id}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });
      const postData = await postResponse.json();
      if (postData.success && postData.post) {
        setCurrentPostAuthorId(postData.post.authorId);
      }


      const response = await fetch(getApiUrl(`posts/${post.id}/comments`), {
        headers:
         {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.comments) {
        // Fetch pinned comment ID
        let pinnedCommentId: string | null = null;
        try {
          const pinnedResponse = await fetch(getApiUrl(`posts/${post.id}/pinned-comment`), {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
            }
          });
          const pinnedData = await pinnedResponse.json();
          if (pinnedData.pinnedCommentId) {
            pinnedCommentId = pinnedData.pinnedCommentId.toString();
          }
        } catch (err) {
          console.error('Error fetching pinned comment:', err);
        }

        const transformedComments: Comment[] = data.comments.map((c: { id: string; authorId?: number; author: { username?: string; email: string; avatarUrl?: string; role?: string }; content: string; createdAt: string; likes?: number; isLiked?: boolean; parentId?: string | null }) => ({
          id: parseInt(c.id),
          author: c.author.username || c.author.email,
          authorId: c.authorId,
          authorAvatar: c.author.avatarUrl,
          authorRole: c.author.role,
          content: c.content,
          createdAt: c.createdAt, 
          isHidden: false,
          isPinned: pinnedCommentId === c.id,
          likes: c.likes || 0,
          isLiked: c.isLiked || false,
          parentId: c.parentId ? parseInt(c.parentId) : null,
          replies: []
        }));       

        const commentMap = new Map<number, Comment>();
        const rootComments: Comment[] = [];
        
        transformedComments.forEach(comment => {
          commentMap.set(comment.id, comment);
        });
        
        transformedComments.forEach(comment => {
          if (comment.parentId) {
            const parent = commentMap.get(comment.parentId);
            if (parent) {
              parent.replies!.push(comment);
            }
          } else {
            rootComments.push(comment);
          }
        });
        
        // Sắp xếp: comment được ghim lên đầu
        rootComments.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0;
        });
        
        setPostComments(rootComments);
        
        const reactionsPromises = transformedComments.map(async (comment) => {
          try {
            const reactionsResponse = await fetch(getApiUrl(`posts/comments/${comment.id}/reactions`), {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
              }
            });
            const reactionsData = await reactionsResponse.json();
            if (reactionsData.success) {
              return { commentId: comment.id, counts: reactionsData.counts };
            }
          } catch (err) {
            console.error('Error fetching reactions for comment:', comment.id, err);
          }
          return null;
        });
        
        const reactionsResults = await Promise.all(reactionsPromises);
        const reactionsMap: Record<number, ReactionCounts> = {};
        reactionsResults.forEach(result => {
          if (result) {
            reactionsMap[result.commentId] = result.counts;
          }
        });
        setCommentReactions(reactionsMap);

      } else {
        console.warn('⚠️ No comments found or API error');
        setPostComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setPostComments([]);
    } finally {
      setIsLoading(false);
    }
  };



  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPost(null);
      setIsClosing(false);
      // Quay lại URL gốc
      navigate('/admin/post-management', { replace: false });
    }, 300);
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

  // Xử lý khi URL thay đổi (back/forward button)
  useEffect(() => {
    const pathMatch = location.pathname.match(/\/admin\/post-management\/post_(\d+)/);
    if (pathMatch) {
      const postId = parseInt(pathMatch[1]);
      const post = posts.find(p => p.id === postId);
      if (post && (!selectedPost || selectedPost.id !== postId)) {
        // Gọi handleViewPost nhưng không cần navigate lại
        setSelectedPost(post);
        setPostComments([]); 
        setCommentReactions({}); 
        setIsLoading(true);
        
        // Fetch dữ liệu
        (async () => {
          try {
            const postResponse = await fetch(getApiUrl(`posts/${post.id}`), {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
              }
            });
            const postData = await postResponse.json();
            if (postData.success && postData.post) {
              setCurrentPostAuthorId(postData.post.authorId);
            }

            const response = await fetch(getApiUrl(`posts/${post.id}/comments`), {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
              }
            });
            
            const data = await response.json();
            
            if (data.success && data.comments) {
              // Fetch pinned comment ID
              let pinnedCommentId: string | null = null;
              try {
                const pinnedResponse = await fetch(getApiUrl(`posts/${post.id}/pinned-comment`));
                const pinnedData = await pinnedResponse.json();
                if (pinnedData.pinnedCommentId) {
                  pinnedCommentId = pinnedData.pinnedCommentId.toString();
                }
              } catch (err) {
                console.error('Error fetching pinned comment:', err);
              }

              const transformedComments: Comment[] = data.comments.map((c: { id: string; authorId?: number; author: { username?: string; email: string; avatarUrl?: string; role?: string }; content: string; createdAt: string; likes?: number; isLiked?: boolean; parentId?: string | null }) => ({
                id: parseInt(c.id),
                author: c.author.username || c.author.email,
                authorId: c.authorId,
                authorAvatar: c.author.avatarUrl,
                authorRole: c.author.role,
                content: c.content,
                createdAt: c.createdAt, 
                isHidden: false,
                isPinned: pinnedCommentId === c.id,
                likes: c.likes || 0,
                isLiked: c.isLiked || false,
                parentId: c.parentId ? parseInt(c.parentId) : null,
                replies: []
              }));

              const commentMap = new Map<number, Comment>();
              const rootComments: Comment[] = [];

              transformedComments.forEach(comment => {
                commentMap.set(comment.id, comment);
              });

              transformedComments.forEach(comment => {
                if (comment.parentId) {
                  const parent = commentMap.get(comment.parentId);
                  if (parent) {
                    parent.replies!.push(comment);
                  }
                } else {
                  rootComments.push(comment);
                }
              });
              
              // Sắp xếp: comment được ghim lên đầu
              rootComments.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return 0;
              });
              
              setPostComments(rootComments);

              const reactionsPromises = transformedComments.map(async (comment) => {
                try {
                  const reactionsResponse = await fetch(getApiUrl(`posts/comments/${comment.id}/reactions`));
                  const reactionsData = await reactionsResponse.json();
                  if (reactionsData.success) {
                    return { commentId: comment.id, counts: reactionsData.counts };
                  }
                } catch (err) {
                  console.error('Error fetching reactions for comment:', comment.id, err);
                }
                return null;
              });
              
              const reactionsResults = await Promise.all(reactionsPromises);
              const reactionsMap: Record<number, ReactionCounts> = {};
              reactionsResults.forEach(result => {
                if (result) {
                  reactionsMap[result.commentId] = result.counts;
                }
              });
              setCommentReactions(reactionsMap);
            } else {
              setPostComments([]);
            }
          } catch (error) {
            console.error('Error fetching comments:', error);
            setPostComments([]);
          } finally {
            setIsLoading(false);
          }
        })();
      }
    } else if (selectedPost && location.pathname === '/admin/post-management') {
      setSelectedPost(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, posts]);


  useEffect(() => {
    if (selectedPost) {

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      

      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {

        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [selectedPost]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Quản lý bài viết</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Kiểm duyệt và quản lý nội dung bài viết</p>
        </div>
        
        {/* Filter buttons - responsive */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            Tất cả ({posts.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all cursor-pointer whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            Chờ duyệt ({posts.filter(p => p.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('visible')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all cursor-pointer whitespace-nowrap ${
              filter === 'visible'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            Đã duyệt ({posts.filter(p => p.status === 'visible').length})
          </button>
          <button
            onClick={() => setFilter('hidden')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all cursor-pointer whitespace-nowrap ${
              filter === 'hidden'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            Đã ẩn ({posts.filter(p => p.status === 'hidden').length})
          </button>
        </div>
      </div>

      {/* Search form - responsive */}
      <div className="bg-white rounded-[16px] p-4 sm:p-6 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Tìm theo email/tên tài khoản
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập email hoặc tên..."
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-3 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Tìm theo ngày đăng
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border-3 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              />
              {searchDate && (
                <button
                  onClick={() => setSearchDate('')}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-red-500 text-white rounded-xl hover:bg-red-600 active:bg-red-700 transition-colors cursor-pointer"
                  title="Xóa lọc ngày"
                >
                  <i className="fa-solid fa-times text-sm sm:text-base"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      
      <div className="space-y-4">
        {paginatedPosts.length === 0 ? (
          <div className="bg-white rounded-[16px] p-8 text-center shadow-lg">
            <p className="text-gray-500">Chưa có bài viết nào!</p>
          </div>
        ) : (
          paginatedPosts.map(post => (
            <div
              key={post.id}
              className={`bg-white rounded-[16px] p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl ${
                post.status === 'pending' ? 'border-2 border-yellow-400' : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
                {/* Post content - responsive */}
                <div className="flex-1 w-full lg:w-auto">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 break-words">{post.title}</h3>
                    {post.hasReports && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <i className="fa-solid fa-triangle-exclamation"></i> Có báo cáo
                      </span>
                    )}
                    {post.status === 'pending' && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                        ⏳ Chờ duyệt
                      </span>
                    )}
                    {post.status === 'visible' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        ✓ Đã duyệt
                      </span>
                    )}
                    {post.status === 'hidden' && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        <i className="fa-solid fa-eye-slash mr-1"></i>Đang bị ẩn
                      </span>
                    )}
                  </div>
                  
                  <div className="prose prose-sm max-w-none text-gray-600 mb-3 line-clamp-2">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                      {post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '')}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
                    <div>
                      <p><span className="font-semibold">👤 Tác giả:</span> {post.author}</p>
                      <p className="mt-2"><span className="font-semibold"><i className="fa-solid fa-calendar mr-2"></i>Ngày đăng:</span> {formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  
                  {/* Footer with view button - responsive */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <p className="text-xs text-gray-500">
                      Ngày tạo: {formatDate(post.createdAt)}
                    </p>
                    
                    <button
                      onClick={() => handleViewPost(post)}
                      className="px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm sm:text-base font-medium transition-all shadow-md cursor-pointer hover:scale-105 hover:shadow-lg w-full sm:w-auto"
                      title="Xem chi tiết bài viết"
                    >
                      <i className="fa-solid fa-eye mr-2"></i>
                      Xem bài viết
                    </button>
                  </div>

                  {/* Action buttons - responsive */}
                  {post.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 mt-4 justify-end">
                      <button
                        onClick={() => handleApprove(post.id)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm sm:text-base font-medium transition-all shadow-md cursor-pointer hover:scale-105 hover:shadow-lg"
                        title="Duyệt bài viết"
                      >
                        <i className="fa-solid fa-check mr-1 sm:mr-2"></i>
                        Duyệt
                      </button>
                      
                      <button
                        onClick={() => handleReject(post.id)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm sm:text-base font-medium transition-all shadow-md cursor-pointer hover:scale-105 hover:shadow-lg"
                        title="Từ chối bài viết"
                      >
                        <i className="fa-solid fa-times mr-1 sm:mr-2"></i>
                        Từ chối
                      </button>
                    </div>
                  )}
                            
                  {post.status === 'visible' && (
                    <div className="flex flex-wrap gap-2 mt-4 justify-end">
                      <button
                        onClick={() => handleToggle(post.id, post.status)}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all shadow-md cursor-pointer hover:scale-105 hover:shadow-lg ${
                          toggledPostId === post.id
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 hover:bg-gray-600 text-white'
                        }`}
                        title="Ẩn bài viết"
                      >
                        {toggledPostId === post.id ? (
                          <>
                            <i className="fa-solid fa-check mr-1 sm:mr-2"></i>
                            Ẩn
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-eye-slash mr-1 sm:mr-2"></i>
                            Ẩn
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm sm:text-base font-medium transition-all shadow-md cursor-pointer hover:scale-105 hover:shadow-lg"
                        title="Xóa bài viết"
                      >
                        <i className="fa-solid fa-trash-can mr-1 sm:mr-2"></i>
                        Xóa
                      </button>
                    </div>
                  )}
                                 
                  {post.status === 'hidden' && (
                    <div className="flex flex-wrap gap-2 mt-4 justify-end">
                      <button
                        onClick={() => handleToggle(post.id, post.status)}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all shadow-md cursor-pointer hover:scale-105 hover:shadow-lg ${
                          toggledPostId === post.id
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                        title="Hiện bài viết"
                      >
                        {toggledPostId === post.id ? (
                          <>
                            <i className="fa-solid fa-check mr-1 sm:mr-2"></i>
                            Hiện
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-eye mr-1 sm:mr-2"></i>
                            Hiện
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm sm:text-base font-medium transition-all shadow-md cursor-pointer hover:scale-105 hover:shadow-lg"
                        title="Xóa bài viết"
                      >
                        <i className="fa-solid fa-trash-can mr-1 sm:mr-2"></i>
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      
        {totalPages > 1 && paginatedPosts.length > 0 && (
          <div className="bg-white rounded-[16px] shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Hiển thị <span className="font-semibold">{startIndex + 1}</span> đến{' '}
                <span className="font-semibold">{Math.min(endIndex, filteredPosts.length)}</span> trong tổng số{' '}
                <span className="font-semibold">{filteredPosts.length}</span> bài viết
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                  }`}
                >
                  <i className="fa-solid fa-chevron-left mr-1 sm:mr-2"></i>
                  <span className="hidden sm:inline">Trang trước</span>
                  <span className="sm:hidden">Trước</span>
                </button>
                <div className="flex items-center gap-2 px-2 sm:px-4">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                    Trang {currentPage} / {totalPages}
                  </span>
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                  }`}
                >
                  <span className="hidden sm:inline">Trang sau</span>
                  <span className="sm:hidden">Sau</span>
                  <i className="fa-solid fa-chevron-right ml-1 sm:ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      
      {selectedPost && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            isClosing ? 'opacity-0' : 'opacity-100 animate-fadeIn'
          }`}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', backdropFilter: isClosing ? 'blur(0px)' : 'blur(1px)' }}
          onClick={handleCloseModal}
        >
          <div 
            className={`bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden relative transition-all duration-300 ${
              isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0 animate-slideUp'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="sticky top-0 z-10 bg-blue-600 flex items-center justify-between px-8 py-5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-white rounded-full"></div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-file-lines"></i>
                    Chi tiết bài viết
                  </h2>
                  <p className="text-blue-100 text-sm mt-0.5">Người đăng: {selectedPost.author}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="group w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 hover:rotate-90 transition-all duration-300 cursor-pointer"
                title="Đóng"
              >
                <i className="fa-solid fa-xmark text-2xl text-white group-hover:scale-110 transition-transform"></i>
              </button>
            </div>
                  
            <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
                   
              <div className="p-8 border-b border-gray-200">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-blue-600 mb-2">
                    {selectedPost.title}
                  </h3>
                  
                  {/* Tags */}
                  {selectedPost.tags && (() => {
                    try {
                      let tags: string[] = [];
                      
                      // Check if already an array
                      if (Array.isArray(selectedPost.tags)) {
                        tags = selectedPost.tags;
                      } else if (typeof selectedPost.tags === 'string') {
                        // Try parsing as JSON first
                        try {
                          const parsed = JSON.parse(selectedPost.tags);
                          if (Array.isArray(parsed)) {
                            tags = parsed;
                          }
                        } catch {
                          // If not JSON, treat as comma-separated string
                          tags = selectedPost.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
                        }
                      }
                      
                      if (tags.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-2 mt-3 mb-4">
                            {tags.map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full shadow-md hover:bg-cyan-600 hover:shadow-lg hover:scale-105 transition-all duration-200"
                              >
                                <i className="fa-solid fa-tag text-xs"></i>
                                {tag}
                              </span>
                            ))}
                          </div>
                        );
                      }
                    } catch (e) {
                      console.error('Error parsing tags:', e);
                    }
                    return null;
                  })()}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                      <i className="fa-solid fa-user text-blue-600"></i>
                      <span className="font-medium">{selectedPost.author}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                      <i className="fa-solid fa-calendar text-blue-600"></i>
                      <span className="font-medium">{formatDate(selectedPost.createdAt)}</span>
                    </div>
                    {postReactions[selectedPost.id] && postReactions[selectedPost.id].total > 0 && (
                      <div className="flex items-center gap-2">
                        {(['like', 'love', 'haha', 'wow', 'sad', 'angry'] as const).map((reactionType) => {
                          const reactions = postReactions[selectedPost.id] as Record<string, number>;
                          const count = reactions[reactionType] || 0;
                          if (count > 0) {
                            const emojis: Record<string, string> = {
                              like: '👍',
                              love: '❤️',
                              haha: '😂',
                              wow: '😮',
                              sad: '😢',
                              angry: '😠'
                            };
                            return (
                              <span 
                                key={reactionType}
                                className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full text-xs border border-gray-200 hover:scale-110 transition-transform shadow-sm"
                                title={`${count} ${reactionType}`}
                              >
                                <span className="text-base">{emojis[reactionType]}</span>
                                <span className="font-bold text-gray-700">{count}</span>
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div 
                  className="prose prose-lg max-w-none bg-white rounded-2xl p-6 shadow-inner border border-gray-100"
                  dangerouslySetInnerHTML={{ 
                    __html: selectedPost.content 
                  }}
                  style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                />
              </div>
        
              <div className="p-8 bg-gray-50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                  <h4 className="text-xl font-bold text-gray-800">
                    <i className="fa-solid fa-comments text-blue-600 mr-2"></i>
                    Bình luận 
                    <span className="ml-2 text-lg text-black font-bold">
                      ({postComments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
                    </span>
                  </h4>
                </div>

              
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Đang tải...</p>
                    </div>
                  </div>
                ) : postComments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-comments text-4xl text-gray-400"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có bình luận nào</h3>
                    <p className="text-gray-500">Bài viết này chưa có bình luận hay phản hồi từ người dùng!</p>
                  </div>
                ) : (
                  postComments.map(comment => {
                    const commentAvatarUrl = getCommentAvatar(comment.authorAvatar);
                    const isAdmin = comment.authorRole === 'admin';
                    
                    return (
                      <div key={comment.id}>
                        
                        <div
                          onContextMenu={(e) => handleContextMenu(e, comment.id)}
                          className={`p-5 rounded-2xl border-2 shadow-md ${
                            comment.isHidden 
                              ? 'bg-gray-100 border-gray-300 opacity-50' 
                              : 'bg-white border-gray-200'
                          } cursor-context-menu`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3 flex-1">
                              
                              <div className="relative w-10 h-10 flex-shrink-0">
                                {commentAvatarUrl ? (
                                  <>
                                    <img 
                                      src={commentAvatarUrl} 
                                      alt={comment.author}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                                      onError={(e) => {
                                        console.error('❌ Comment avatar failed:', {
                                          url: commentAvatarUrl,
                                          author: comment.author
                                        });
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallback) {
                                          fallback.style.display = 'flex';
                                        }
                                      }}
                                      onLoad={() => {

                                      }}
                                    />
                                    <div style={{ display: 'none' }} className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center text-white font-bold border-2 border-blue-500">
                                      {comment.author.charAt(0).toUpperCase()}
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-blue-500">
                                    {comment.author.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-800">{comment.author}</p>
                                {comment.isPinned && (
                                  <span className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full font-semibold shadow-sm whitespace-nowrap">
                                    <i className="fa-solid fa-thumbtack mr-1"></i>Đã ghim
                                  </span>
                                )}
                                {isAdmin && (
                                  <span className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full font-semibold shadow-sm">
                                    <i className="fa-solid fa-shield-halved mr-1"></i>Quản trị viên
                                  </span>
                                )}
                                {currentPostAuthorId && comment.authorId && String(currentPostAuthorId) === String(comment.authorId) && (
                                  <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1 rounded-full font-semibold shadow-sm">
                                    <i className="fa-solid fa-pen-nib mr-1"></i>Tác giả
                                  </span>
                                )}
                              </div>
                                <p className="text-gray-600 text-sm mt-1">{comment.content}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <p className="text-gray-400 text-xs"><i className="fa-solid fa-calendar mr-2"></i> {formatDate(comment.createdAt)}</p>
                                  
                                  {commentReactions[comment.id] && commentReactions[comment.id].total > 0 && (
                                    <div className="flex items-center gap-2">
                                      {(['like', 'love', 'haha', 'wow', 'sad', 'angry'] as const).map((reactionType) => {
                                        const reactions = commentReactions[comment.id] as Record<string, number>;
                                        const count = reactions[reactionType] || reactions[reactionType + 's'] || 0;
                                        if (count > 0) {
                                          const emojis: Record<string, string> = {
                                            like: '👍',
                                            love: '❤️',
                                            haha: '😂',
                                            wow: '😮',
                                            sad: '😢',
                                            angry: '😠'
                                          };
                                          return (
                                            <span 
                                              key={reactionType}
                                              className="flex items-center gap-0.5 bg-gray-50 px-2 py-1 rounded-full shadow-sm border border-gray-300 text-xs"
                                              title={`${count} ${reactionType}`}
                                            >
                                              <span className="text-sm">{emojis[reactionType]}</span>
                                              <span className="font-semibold text-gray-700">{count}</span>
                                            </span>
                                          );
                                        }
                                        return null;
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {comment.isHidden && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                Đã ẩn
                              </span>
                            )}
                          </div>
                        </div>

                        
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-8 mt-3 space-y-3">
                            {comment.replies.map((reply) => {
                              const replyAvatarUrl = getCommentAvatar(reply.authorAvatar);
                              const isReplyAdmin = reply.authorRole === 'admin';
                              
                              return (
                                <div key={reply.id}>
                                  
                                  <div
                                    onContextMenu={(e) => handleContextMenu(e, reply.id)}
                                    className={`p-5 rounded-2xl border-2 shadow-md ${
                                      reply.isHidden 
                                        ? 'bg-gray-100 border-gray-300 opacity-50' 
                                        : 'bg-blue-50 border-blue-200'
                                    } cursor-context-menu`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex gap-3 flex-1">
                                        
                                        <div className="relative w-10 h-10 flex-shrink-0">
                                          {replyAvatarUrl ? (
                                            <>
                                              <img 
                                                src={replyAvatarUrl} 
                                                alt={reply.author}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                                                onError={(e) => {
                                                  e.currentTarget.style.display = 'none';
                                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                  if (fallback) {
                                                    fallback.style.display = 'flex';
                                                  }
                                                }}
                                              />
                                              <div style={{ display: 'none' }} className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center text-white font-bold border-2 border-blue-500">
                                                {reply.author.charAt(0).toUpperCase()}
                                              </div>
                                            </>
                                          ) : (
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-blue-500">
                                              {reply.author.charAt(0).toUpperCase()}
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-800">{reply.author}</p>
                                            {isReplyAdmin && (
                                              <span className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full font-semibold shadow-sm">
                                                <i className="fa-solid fa-shield-halved mr-1"></i>Quản trị viên
                                              </span>
                                            )}
                                            {currentPostAuthorId && reply.authorId && String(currentPostAuthorId) === String(reply.authorId) && (
                                              <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1 rounded-full font-semibold shadow-sm">
                                                <i className="fa-solid fa-pen-nib mr-1"></i>Tác giả
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-gray-600 text-sm mt-1">{reply.content}</p>
                                          <div className="flex items-center gap-4 mt-2">
                                            <p className="text-gray-400 text-xs"><i className="fa-solid fa-calendar mr-2"></i> {formatDate(reply.createdAt)}</p>
                                            {commentReactions[reply.id] && commentReactions[reply.id].total > 0 && (
                                              <div className="flex items-center gap-2">
                                                {(['like', 'love', 'haha', 'wow', 'sad', 'angry'] as const).map((reactionType) => {
                                                  const reactions = commentReactions[reply.id] as Record<string, number>;
                                                  const count = reactions[reactionType] || reactions[reactionType + 's'] || 0;
                                                  if (count > 0) {
                                                    const emojis: Record<string, string> = {
                                                      like: '👍',
                                                      love: '❤️',
                                                      haha: '😂',
                                                      wow: '😮',
                                                      sad: '😢',
                                                      angry: '😠'
                                                    };
                                                    return (
                                                      <span 
                                                        key={reactionType}
                                                        className="flex items-center gap-0.5 bg-gray-50 px-2 py-1 rounded-full shadow-sm border border-gray-300 text-xs"
                                                        title={`${count} ${reactionType}`}
                                                      >
                                                        <span className="text-sm">{emojis[reactionType]}</span>
                                                        <span className="font-semibold text-gray-700">{count}</span>
                                                      </span>
                                                    );
                                                  }
                                                  return null;
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      {reply.isHidden && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                          Đã ẩn
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      
      {contextMenu && (
        <div
          className="fixed bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-2 z-[60] animate-scaleIn overflow-hidden"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleToggleComment(contextMenu.commentId)}
            className="w-full px-5 py-3 text-left text-sm hover:bg-blue-50 flex items-center gap-3 transition-all duration-200 font-medium text-gray-700 hover:text-blue-600 cursor-pointer group"
          >
            <i className={`fa-solid ${postComments.find(c => c.id === contextMenu.commentId)?.isHidden ? 'fa-eye' : 'fa-eye-slash'} w-4 text-center group-hover:scale-110 transition-transform`}></i>
            <span>{postComments.find(c => c.id === contextMenu.commentId)?.isHidden ? 'Hiện' : 'Ẩn'} bình luận</span>
          </button>
        </div>
      )}

      
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

