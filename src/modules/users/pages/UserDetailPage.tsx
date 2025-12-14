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
  about?: string;
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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
        const userResponse = await axios.get(`/users/${userId}`);
        if (userResponse.data.success) {
          setUser(userResponse.data.user);
        }

        const postsResponse = await axios.get(`/posts?authorId=${userId}&page=1&limit=10`);
        if (postsResponse.data.success) {
          const fetchedPosts = postsResponse.data.posts || [];
          setPosts(fetchedPosts);
          setHasMore(fetchedPosts.length === 10);
          setPage(1);
        }

        const followResponse = await axios.get(
          `/users/${userId}/follow-status`
        );
        if (followResponse.data.success) {
          setFollowing(followResponse.data.isFollowing);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Không thể tải thông tin người dùng!");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await axios.get(`/posts?authorId=${userId}&page=${nextPage}&limit=10`);
      
      if (response.data.success) {
        const newPosts = response.data.posts || [];
        setPosts(prev => [...prev, ...newPosts]);
        setPage(nextPage);
        setHasMore(newPosts.length === 10);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
      toast.error("Không thể tải thêm bài viết!");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleOpenReactionModal = (postId: number, totalReactions: number) => {
    setReactionModalState({ isOpen: true, postId, totalReactions });
  };

  const handleCloseReactionModal = () => {
    setReactionModalState({ isOpen: false, postId: 0, totalReactions: 0 });
  };

  const handleFollow = async () => {
    if (followLoading) return;

    setFollowLoading(true);
    try {
      await axios.post(`/users/${userId}/follow`);
      setFollowing(true);


      const userResponse = await axios.get(`/users/${userId}`);
      if (userResponse.data.success) {
        setUser(userResponse.data.user);
      }

      toast.success("Đã theo dõi thành công!", {
        duration: 2000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Lỗi khi theo dõi người dùng!");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (followLoading) return;

    setFollowLoading(true);
    try {
      await axios.delete(`/users/${userId}/follow`);
      setFollowing(false);


      const userResponse = await axios.get(`/users/${userId}`);
      if (userResponse.data.success) {
        setUser(userResponse.data.user);
      }

      toast.success("Đã hủy theo dõi thành công!", {
        duration: 2000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Error unfollowing user:", error);
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
            onClick={() => navigate("/users")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Quay lại danh sách người dùng
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto select-none relative" style={{ isolation: 'auto' }}>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-white/20 p-4 md:p-8 mb-6 md:mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
          
          <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
            {user.avatarUrl ? (
              <>
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";     
                    const fallback = e.currentTarget
                      .nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = "flex";
                    }
                  }}
                />
                <div
                  className="w-24 h-24 md:w-32 md:h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-3xl md:text-4xl border-4 border-blue-500 shadow-lg absolute top-0 left-0"
                  style={{ display: "none" }}
                >
                  {user.name
                    .trim()
                    .split(" ")
                    .slice(-1)[0]
                    .charAt(0)
                    .toUpperCase()}
                </div>
              </>
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-3xl md:text-4xl border-4 border-blue-500 shadow-lg">
                {user.name
                  .trim()
                  .split(" ")
                  .slice(-1)[0]
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          
          <div className="flex-1 min-w-0 w-full animate-slide-in-right">
            
            <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-3 mb-4">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800 text-center md:text-left">
                {user.name}
              </h1>
              <button
                className={`py-2.5 px-6 rounded-xl font-semibold transition-all duration-300 transform cursor-pointer text-sm md:text-base w-full md:w-auto ${
                  following
                    ? "bg-gray-100 text-gray-700 border-3 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    : "bg-blue-600 text-white border-3 border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:shadow-lg hover:scale-105 active:scale-95"
                } ${followLoading ? "opacity-50 cursor-wait" : ""}`}
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

            
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              <div className="bg-blue-50 rounded-xl p-3 md:p-4">
                <div className="flex flex-col items-center gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-newspaper text-blue-600 text-lg md:text-xl"></i>
                    <span className="text-2xl md:text-3xl font-bold text-blue-600">
                      {user.postsCount}
                    </span>
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium text-center">
                    Bài viết
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 md:p-4">
                <div className="flex flex-col items-center gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-users text-blue-600 text-lg md:text-xl"></i>
                    <span className="text-2xl md:text-3xl font-bold text-blue-600">
                      {user.followersCount || 0}
                    </span>
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium text-center">
                    Người theo dõi
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 md:p-4">
                <div className="flex flex-col items-center gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-user-check text-blue-600 text-lg md:text-xl"></i>
                    <span className="text-2xl md:text-3xl font-bold text-blue-600">
                      {user.followingCount || 0}
                    </span>
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium text-center">
                    Đang theo dõi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-white/20 p-4 md:p-8 mb-6 md:mb-8 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-user-circle text-blue-600 text-xl"></i>
          </div>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
              Giới thiệu
            </h2>
            {user.about ? (
              <div className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-4 border border-gray-200">
                {user.about}
              </div>
            ) : (
              <div className="text-gray-500 text-sm md:text-base italic bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center gap-2">
                <i className="fa-solid fa-info-circle text-gray-400"></i>
                <span>Người dùng này chưa có thông tin giới thiệu bản thân.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      
      <div className="mb-4 md:mb-6 animate-fade-in-delay">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center md:text-left">
          <i className="fa-solid fa-newspaper mr-2 md:mr-3 text-blue-600"></i>
          Bài viết của {user.name} ({posts.length})
        </h2>
      </div>

      
      {posts.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 md:p-8 text-center">
          <p className="text-gray-600 text-base md:text-lg">
            Người dùng này chưa có bài viết nào!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 md:space-y-6 animate-fade-in-delay">
            {posts
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    id: String(post.id),
                    authorId: String(post.authorId),
                    author: post.authorName || post.author || "Unknown",
                    readTime: 5,
                    likes: post.total_reactions || 0,
                    tags: post.tags || [],
                    category: post.category || "Uncategorized",
                  }}
                  onOpenReactionModal={handleOpenReactionModal}
                />
              ))}
          </div>

          
          {hasMore && (
            <div className="mt-6 md:mt-8 text-center">
              <button
                onClick={loadMorePosts}
                disabled={loadingMore}
                className={`px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                  loadingMore
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                }`}
              >
                {loadingMore ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Đang tải...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-chevron-down"></i>
                    Xem thêm bài viết
                  </span>
                )}
              </button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="flex items-center justify-center py-8 mt-6">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="h-px w-16 bg-gray-300"></div>
                <i className="fa-solid fa-check-circle text-green-500"></i>
                <span className="text-sm font-medium">Bạn đã xem hết tất cả bài viết của {user?.name}</span>
                <div className="h-px w-16 bg-gray-300"></div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 mt-6 md:mt-8">
        <button
          onClick={() => navigate("/users")}
          className="group w-full px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 font-semibold cursor-pointer flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-sm md:text-base"
        >
          <i className="fa-solid fa-arrow-left transition-transform duration-300 group-hover:-translate-x-1"></i>
          <span>Quay lại danh sách người dùng</span>
        </button>
      </div>

      </div>

      <ReactionModal
        isOpen={reactionModalState.isOpen}
        onClose={handleCloseReactionModal}
        postId={reactionModalState.postId}
        totalReactions={reactionModalState.totalReactions}
      />
    </>
  );
}
