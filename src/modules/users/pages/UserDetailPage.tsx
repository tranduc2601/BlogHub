import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "@/core/config/axios";
import toast from "react-hot-toast";
import { PostCard, ReactionModal } from "@/modules/posts";

interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

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

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [reactionModalState, setReactionModalState] = useState<{
    isOpen: boolean;
    postId: number;
    totalReactions: number;
  }>({ isOpen: false, postId: 0, totalReactions: 0 });

  useEffect(() => {
    const fetchUserData = async () => {
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
      fetchUserData();
    }
  }, [userId]);

  const handleOpenReactionModal = (postId: number, totalReactions: number) => {
    setReactionModalState({ isOpen: true, postId, totalReactions });
  };

  const handleCloseReactionModal = () => {
    setReactionModalState({ isOpen: false, postId: 0, totalReactions: 0 });
  };

  const handleFollow = async () => {
    if (followLoading) return; // Prevent spam clicking
    
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
    if (followLoading) return; // Prevent spam clicking
    
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
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
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
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8 animate-fade-in">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative w-32 h-32 flex-shrink-0">
            {user.avatarUrl ? (
              <>
                <img 
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-cyan-500 shadow-lg"
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
                  className="w-32 h-32 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold text-4xl border-4 border-cyan-500 shadow-lg absolute top-0 left-0"
                  style={{ display: 'none' }}
                >
                  {user.name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                </div>
              </>
            ) : (
              <div className="w-32 h-32 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold text-4xl border-4 border-cyan-500 shadow-lg">
                {user.name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0 animate-slide-in-right">
            {/* Name and Follow Button */}
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-4xl font-bold text-gray-800">{user.name}</h1>
              <button
                className={`py-2.5 px-6 rounded-xl font-semibold transition-all duration-300 transform cursor-pointer ${
                  following 
                    ? "bg-gray-100 text-gray-700 border-3 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300" 
                    : "bg-blue-600 text-white border-3 border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:shadow-lg hover:scale-105 active:scale-95"
                } ${followLoading ? 'opacity-50 cursor-wait' : ''}`}
                onClick={following ? handleUnfollow : handleFollow}
                disabled={followLoading}
              >
                {followLoading ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <i className="fa-solid fa-spinner fa-spin text-sm"></i>
                    Đang xử lý...
                  </span>
                ) : following ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <i className="fa-solid fa-user-minus text-sm mr-1"></i>
                    Bỏ theo dõi
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <i className="fa-solid fa-user-plus text-sm mr-1"></i>
                    Theo dõi
                  </span>
                )}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center bg-cyan-50 rounded-xl p-4">
                <div className="text-3xl font-bold text-cyan-600 mb-1">
                  {user.postsCount}
                </div>
                <div className="text-sm text-gray-600 font-medium">Bài viết</div>
              </div>
              <div className="text-center bg-cyan-50 rounded-xl p-4">
                <div className="text-3xl font-bold text-cyan-600 mb-1">
                  {user.followersCount || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Người theo dõi</div>
              </div>
              <div className="text-center bg-cyan-50 rounded-xl p-4">
                <div className="text-3xl font-bold text-cyan-600 mb-1">
                  {user.followingCount || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Đang theo dõi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mb-6 animate-fade-in-delay">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          <i className="fa-solid fa-newspaper mr-2 text-blue-600"></i>
          Bài viết của {user.name} ({posts.length})
        </h2>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
          <p className="text-gray-600 text-lg">Người dùng này chưa có bài viết nào!</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in-delay">
          {posts.map((post) => (
            <PostCard 
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
              onOpenReactionModal={handleOpenReactionModal}
            />
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mt-8">
        <button
          onClick={() => navigate('/users')}
          className="group w-full px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 font-semibold cursor-pointer flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <i className="fa-solid fa-arrow-left transition-transform duration-300 group-hover:-translate-x-1"></i>
          <span>Quay lại danh sách người dùng</span>
        </button>
      </div>

      <ReactionModal
        isOpen={reactionModalState.isOpen}
        onClose={handleCloseReactionModal}
        postId={reactionModalState.postId}
        totalReactions={reactionModalState.totalReactions}
      />
    </div>
  );
}
