import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import Postcard from "../components/Postcard";
import toast from "react-hot-toast";

interface Post {
  id: string | number;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  authorId: number;
  author: string;
  authorName?: string;
  authorAvatar?: string;
  createdAt: string;
  readTime: number;
  likes: number;
  reaction_like?: number;
  reaction_love?: number;
  reaction_haha?: number;
  reaction_wow?: number;
  reaction_sad?: number;
  reaction_angry?: number;
  total_reactions?: number;
  views?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  postsCount: number;
  followersCount?: number;
  commentsCount: number;
  joinedAt: string;
}

export default function UserPostsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      setLoading(true);
      try {
        // Fetch user info
        const userResponse = await axios.get(`/users/${userId}`);
        if (userResponse.data.success) {
          setUser(userResponse.data.user);
        }

        // Fetch user's posts
        const postsResponse = await axios.get(`/posts?authorId=${userId}`);
        if (postsResponse.data.success) {
          setPosts(postsResponse.data.posts || []);
        }

        // Check follow status
        const followResponse = await axios.get(`/users/${userId}/follow-status`);
        if (followResponse.data.success) {
          setFollowing(followResponse.data.isFollowing);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error("Không thể tải thông tin người dùng!");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserAndPosts();
    }
  }, [userId]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      await axios.post(`/users/${userId}/follow`);
      setFollowing(true);
      
      // Refetch user data to get accurate follower count
      const userResponse = await axios.get(`/users/${userId}`);
      if (userResponse.data.success) {
        setUser(userResponse.data.user);
      }
      
      toast.success("Đã theo dõi thành công!", {
        duration: 2000,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error following user:', error);
      toast.error("Lỗi khi theo dõi người dùng!");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setFollowLoading(true);
    try {
      await axios.delete(`/users/${userId}/follow`);
      setFollowing(false);
      
      // Refetch user data to get accurate follower count
      const userResponse = await axios.get(`/users/${userId}`);
      if (userResponse.data.success) {
        setUser(userResponse.data.user);
      }
      
      toast.success("Đã hủy theo dõi thành công!", {
        duration: 2000,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error("Lỗi khi hủy theo dõi người dùng!");
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">Không tìm thấy người dùng!</p>
          <button
            onClick={() => navigate('/users')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách người dùng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto select-none">
      {/* User Profile Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative w-24 h-24 flex-shrink-0">
            {user.avatarUrl ? (
              <>
                <img 
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <div 
                  className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center text-blue-700 font-bold text-3xl border-4 border-blue-500 shadow-lg absolute top-0 left-0"
                  style={{ display: 'none' }}
                >
                  {user.name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                </div>
              </>
            ) : (
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-3xl border-4 border-blue-500 shadow-lg">
                {user.name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            {/* Name and Follow Button */}
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
              <button
                className={`group relative w-12 h-12 rounded-xl font-semibold transition-all duration-300 transform cursor-pointer overflow-hidden hover:shadow-rotating hover:w-auto hover:px-4 ${
                  following 
                    ? "bg-gray-700 text-gray-700 border-2 border-gray-300 hover:bg-gray-100 hover:text-red-600 hover:border-red-300" 
                    : "bg-white text-white border-2 border-blue-600 hover:bg-blue-600 hover:text-white hover:scale-105 active:scale-95"
                } ${followLoading ? 'opacity-50 cursor-wait' : ''}`}
                onClick={following ? handleUnfollow : handleFollow}
                disabled={followLoading}
              >
                {followLoading ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <i className="fa-solid fa-spinner fa-spin text-sm"></i>
                    <span className="opacity-100">Đang xử lý...</span>
                  </span>
                ) : following ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <i className="fa-solid fa-user-minus text-sm"></i>
                    <span className="max-w-0 group-hover:max-w-xs group-hover:ml-2 overflow-hidden transition-all duration-300 whitespace-nowrap">
                      Bỏ theo dõi
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <i className="fa-solid fa-user-plus text-sm text-blue-600 group-hover:text-white transition-colors duration-300"></i>
                    <span className="max-w-0 group-hover:max-w-xs group-hover:ml-2 overflow-hidden transition-all duration-300 whitespace-nowrap">
                      Theo dõi
                    </span>
                  </span>
                )}
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">{user.email}</p>
            <p className="text-sm text-gray-500 mb-4">
              Tham gia {formatDate(user.joinedAt)}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {user.postsCount}
                </div>
                <div className="text-sm text-gray-500">Bài viết</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {user.followersCount || 0}
                </div>
                <div className="text-sm text-gray-500">Người theo dõi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {user.commentsCount}
                </div>
                <div className="text-sm text-gray-500">Bình luận</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Bài viết của {user.name} ({posts.length})
        </h2>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
          <p className="text-gray-600 text-lg">Người dùng này chưa có bài viết nào</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Postcard 
              key={post.id} 
              post={{
                ...post,
                id: String(post.id),
                authorId: String(post.authorId),
                author: post.authorName || post.author || 'Unknown',
                readTime: 5,
                likes: post.total_reactions || 0,
                tags: post.tags || [],
                category: post.category || 'Uncategorized'
              }} 
            />
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/users')}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          Quay lại danh sách người dùng
        </button>
      </div>
    </div>
  );
}
