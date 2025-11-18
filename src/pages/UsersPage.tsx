import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../context/AuthContext";
import axios from "../config/axios";
import toast from "react-hot-toast";


function FollowButton({ userId, onFollowChange }: { userId: number; onFollowChange: () => void }) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const response = await axios.get(`/users/${userId}/follow-status`);
        if (response.data.success) {
          setFollowing(response.data.isFollowing);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };
    checkFollowStatus();
  }, [userId]);

  const handleFollow = async () => {
    setLoading(true);
    try {
      await axios.post(`/users/${userId}/follow`);
      setFollowing(true);
      onFollowChange();
      toast.success("Đã theo dõi thành công!", {
        duration: 2000,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error following user:', error);
      toast.error("Đã xảy ra lỗi!", {
        duration: 2000,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setLoading(true);
    try {
      await axios.delete(`/users/${userId}/follow`);
      setFollowing(false);
      onFollowChange();
      toast.success("Đã hủy theo dõi thành công!", {
        duration: 2000,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error("Đã xảy ra lỗi!", {
        duration: 2000,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 transform cursor-pointer ${
        following 
          ? "bg-gray-100 text-gray-700 border-3 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300" 
          : "bg-blue-600 text-white border-3 border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:shadow-lg hover:scale-105 active:scale-95"
      } ${loading ? 'opacity-50 cursor-wait' : ''}`}
      onClick={following ? handleUnfollow : handleFollow}
      disabled={loading}
    >
      {loading ? (
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
  );
}

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Lấy giá trị từ URL query params
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState<"name" | "posts" | "comments" | "followers" | "likes">(
    (searchParams.get("sortBy") as "name" | "posts" | "comments" | "followers" | "likes") || "followers"
  );
  
  const { users, loading, error } = useUsers();
  const { user: currentUser } = useAuth();
  const [localUsers, setLocalUsers] = useState(users);
  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  // Cập nhật URL khi searchTerm hoặc sortBy thay đổi
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set("search", searchTerm);
    }
    if (sortBy !== "followers") {
      params.set("sortBy", sortBy);
    }
    setSearchParams(params, { replace: true });
  }, [searchTerm, sortBy, setSearchParams]);

  const handleFollowChange = async () => {
    // Refetch users list to get accurate follower counts
    try {
      const response = await axios.get('/users');
      if (response.data.success) {
        setLocalUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  const filteredAndSortedUsers = localUsers
    .filter(
      (user) =>
        user.id !== currentUser?.id &&
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "posts":
          return b.postsCount - a.postsCount;
        case "comments":
          return b.commentsCount - a.commentsCount;
        case "followers": {
          const aFollowers = a.followersCount || 0;
          const bFollowers = b.followersCount || 0;
          return bFollowers - aFollowers;
        }
        case "likes": {
          const aLikes = a.totalLikes || 0;
          const bLikes = b.totalLikes || 0;
          const aAvgLikes = a.postsCount > 0 ? aLikes / a.postsCount : 0;
          const bAvgLikes = b.postsCount > 0 ? bLikes / b.postsCount : 0;
          return bAvgLikes - aAvgLikes;
        }
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto select-none">
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Danh sách các tác giả
        </h1>
        <p className="text-gray-600 text-lg">
          Khám phá những tác giả tài năng trong cộng đồng BlogHub!
        </p>
      </div>

      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border-3 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="w-full md:w-80">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "posts" | "comments" | "followers" | "likes")
              }
              className="w-full p-3 border-3 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 cursor-pointer select-none"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="followers">Sắp xếp theo số người theo dõi</option>
              <option value="likes">Sắp xếp theo lượt tim/bài viết</option>
              <option value="posts">Sắp xếp theo số bài viết</option>
              <option value="comments">Sắp xếp theo số bình luận</option>
            </select>
          </div>
        </div>
      </div>

      
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      )}

      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      
      {!loading && !error && filteredAndSortedUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Không tìm thấy người dùng nào</p>
        </div>
      )}

      
      {!loading && !error && filteredAndSortedUsers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedUsers.map((user, index) => (
          <div
            key={user.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 animate-fadeInUp h-full flex flex-col cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => navigate(`/users/${user.id}/posts`)}
          >
            
            <div className="flex-grow">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  {user.avatarUrl ? (
                    <>
                      <img 
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-blue-500 shadow-lg"
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
                        className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center text-blue-700 font-bold text-xl border-4 border-blue-500 shadow-lg absolute top-0 left-0"
                        style={{ display: 'none' }}
                      >
                        {user.name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                      </div>
                    </>
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl border-4 border-blue-500 shadow-lg">
                      {user.name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-800 truncate">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Tham gia {formatDate(user.joinedAt)}
                  </p>
                </div>
              </div>

              
              <p className="text-gray-600 text-sm mb-4 leading-relaxed text-center flex items-center justify-center gap-2 truncate">
                <span className="inline-block w-5 h-5 align-middle flex-shrink-0">
                  <i className="fa-light fa-envelope"></i>
                </span>
                <span className="truncate">{user.email}</span>
              </p>

              
                <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.postsCount}
                  </div>
                  <div className="text-xs text-gray-500">Bài viết</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.followersCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">Người theo dõi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.commentsCount}
                  </div>
                  <div className="text-xs text-gray-500">Bình luận</div>
                </div>
              </div>
            </div>

            
            <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
              <FollowButton userId={user.id} onFollowChange={handleFollowChange} />
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
