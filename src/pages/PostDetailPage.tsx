import { useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import CommentBox from "../components/CommentBox";
import axios from '../config/axios';
import type { Post } from "../data/mockData";

export default function PostDetailPage() {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  async function handleLike() {
    if (!liked && post) {
      try {
        await axios.post(`/posts/${post.id}/like`);
        setLikes(likes + 1);
        setLiked(true);
      } catch (error) {
        console.error('Error liking post:', error);
        alert('Lỗi khi thả tim bài viết');
      }
    }
  }
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  useEffect(() => {
    if (post) {
      setLikes(post.likes);
    }
  }, [post]);
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
        setError(error.response?.data?.message || 'Không thể tải bài viết');
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
        if (response.data.success && response.data.isLiked) {
          setLiked(true);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    if (post) {
      checkIfLiked();
    }
  }, [post]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatReadTime = (minutes: number) => {
    return `${minutes} phút đọc`;
  };

  const getAuthorInitial = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Công nghệ': 'from-blue-500 to-cyan-500',
      'Design': 'from-purple-500 to-pink-500',
      'Marketing': 'from-green-500 to-emerald-500',
      'Ẩm thực': 'from-orange-500 to-red-500',
      'Du lịch': 'from-indigo-500 to-blue-500',
      'Giáo dục': 'from-teal-500 to-green-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  // Loading State
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

  // Error State
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

  // Post not found
  if (!post) {
    return <Navigate to="/" replace />;
  }

  // Like state chỉ khởi tạo khi post đã có

  return (
    <div className="max-w-4xl mx-auto">
      <article className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            {post.authorAvatar && post.authorAvatar !== '' ? (
              <img 
                src={`http://localhost:5000${post.authorAvatar}`}
                alt={typeof post.author === 'string' ? post.author : post.author.name} 
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg" 
              />
            ) : (
              <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(post.category)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                {getAuthorInitial(typeof post.author === 'string' ? post.author : post.author.name)}
              </div>
            )}
            <div>
              <p className="font-semibold flex items-center gap-2">
                  {typeof post.author === 'string' ? post.author : post.author.name}
                {(() => {
                  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
                  if (!currentUser || currentUser.id === post.authorId) return null;
                  return (
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300" style={{marginLeft: 8}}>
                      Theo dõi
                    </button>
                  );
                })()}
              </p>
              <p className="text-blue-100 text-sm">
                {formatDate(post.createdAt)} • {formatReadTime(post.readTime)}
              </p>
            </div>
          </div>
          
          {/* Category Badge */}
          <div className="mb-4">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${getCategoryColor(post.category)} text-white`}>
              {post.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {post.title}
          </h1>
          {/* Nút sửa bài viết, chỉ hiển thị với tác giả */}
          {(() => {
            const currentUser = JSON.parse(localStorage.getItem("user") || "null");
            return currentUser && currentUser.id === post.authorId;
          })() && (
            <div className="mt-4">
              <a
                href={`/edit/${post.id}`}
                className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-semibold shadow hover:bg-yellow-500 transition-colors"
              >
                <i className="fa-solid fa-pen mr-2"></i>Sửa bài viết
              </a>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 md:p-12">
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }}></div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8 mt-8">
            {post.tags.map((tag: string, index: number) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                #{tag}
              </span>
            ))}
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-8 py-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <button
                className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-500 hover:text-red-600' : 'hover:text-gray-500'}`}
                title="Thích bài viết"
                onClick={handleLike}
                disabled={liked}
              >
                <svg
                  className={`w-5 h-5 ${liked ? 'text-red-500' : 'text-gray-500'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{likes} Lượt thích</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span>{post.comments} Bình luận</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{post.views} Lượt xem</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>Chia sẻ</span>
            </div>
            {/* Nút báo cáo vi phạm */}
            <div className="flex items-center gap-2 text-gray-600">
              <button
                className="flex items-center gap-1 hover:text-orange-600 transition-colors px-3 py-1 border border-orange-300 rounded-full"
                title="Báo cáo bài viết vi phạm"
                onClick={async () => {
                  try {
                    await fetch(`/posts/${post.id}/report`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ reason: 'Vi phạm nội dung' })
                    });
                    alert('Đã gửi báo cáo bài viết vi phạm!');
                  } catch {
                    alert('Gửi báo cáo thất bại!');
                  }
                }}
              >
                <i className="fa-solid fa-triangle-exclamation text-orange-500 w-5 h-5"></i>
                <span>Báo cáo vi phạm</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-12">
        <CommentBox postId={post.id} />
      </div>
    </div>
  );
}
