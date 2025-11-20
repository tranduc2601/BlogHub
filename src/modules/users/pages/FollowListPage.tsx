import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/core/auth";
import axios from "@/core/config/axios";
import toast from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  postsCount: number;
  commentsCount: number;
  followersCount: number;
  totalLikes: number;
  joinedAt: string;
}

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

export default function FollowListPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const type = searchParams.get("type") as "followers" | "following" | null;
  const userId = searchParams.get("userId");
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!type || !userId) {
      navigate('/profile');
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const endpoint = type === 'followers' 
          ? `/users/${userId}/followers`
          : `/users/${userId}/following`;
        
        const response = await axios.get(endpoint);
        if (response.data.success) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        toast.error(`Lỗi khi tải danh sách ${type === 'followers' ? 'người theo dõi' : 'đang theo dõi'}!`, {
          duration: 3000,
          position: 'top-right',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [type, userId, navigate]);

  const handleFollowChange = async () => {
    // Refetch the list to get accurate follower counts
    try {
      const endpoint = type === 'followers' 
        ? `/users/${userId}/followers`
        : `/users/${userId}/following`;
      
      const response = await axios.get(endpoint);
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  const filteredUsers = (users || []).filter(
    (user) =>
      user.id !== currentUser?.id &&
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <button
          onClick={() => navigate('/profile')}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Quay lại
        </button>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          {type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'}
        </h1>
        <p className="text-gray-600 text-lg">
          {type === 'followers' 
            ? 'Danh sách những người đang theo dõi bạn' 
            : 'Danh sách những người bạn đang theo dõi'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
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
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            {searchTerm 
              ? 'Không tìm thấy người dùng nào!' 
              : type === 'followers' 
                ? 'Chưa có người theo dõi!' 
                : 'Chưa theo dõi ai!'}
          </p>
        </div>
      )}

      {/* Users Grid */}
      {!loading && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
          <div
            key={user.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 animate-fadeInUp"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* User Avatar & Info */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16">
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
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Tham gia {formatDate(user.joinedAt)}
                </p>
              </div>
            </div>

            {/* Email */}
            <p className="text-gray-600 text-sm mb-4 leading-relaxed text-center flex items-center justify-center gap-2">
              <span className="inline-block w-5 h-5 align-middle">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="8" fill="#fff"/>
                  <path d="M6 14.5V33.5C6 35.1569 7.34315 36.5 9 36.5H39C40.6569 36.5 42 35.1569 42 33.5V14.5C42 12.8431 40.6569 11.5 39 11.5H9C7.34315 11.5 6 12.8431 6 14.5Z" fill="#EA4335"/>
                  <path d="M42 14.5V33.5C42 35.1569 40.6569 36.5 39 36.5H9C7.34315 36.5 6 35.1569 6 33.5V14.5L24 27.5L42 14.5Z" fill="#fff"/>
                  <path d="M6 14.5L24 27.5L42 14.5" stroke="#EA4335" strokeWidth="2"/>
                  <path d="M6 14.5L24 27.5L42 14.5" stroke="#34A853" strokeWidth="2"/>
                  <path d="M6 14.5V33.5C6 35.1569 7.34315 36.5 9 36.5H39C40.6569 36.5 42 35.1569 42 33.5V14.5" stroke="#4285F4" strokeWidth="2"/>
                </svg>
              </span>
              {user.email}
            </p>

            {/* Stats */}
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

            {/* Follow Button */}
            <div className="flex gap-2">
              <FollowButton userId={user.id} onFollowChange={handleFollowChange} />
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
