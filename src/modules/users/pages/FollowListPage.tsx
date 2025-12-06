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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const type = searchParams.get("type") as "followers" | "following" | null;
  const userId = searchParams.get("userId");
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [displayCount, setDisplayCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_LOAD = 6;

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

  const displayedUsers = filteredUsers.slice(0, displayCount);
  const hasMore = displayCount < filteredUsers.length;


  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    setSearchParams(params, { replace: true });
    setDisplayCount(12);
  }, [searchTerm, setSearchParams]);


  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        if (displayCount < filteredUsers.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayCount(prev => prev + ITEMS_PER_LOAD);
            setIsLoadingMore(false);
          }, 500);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayCount, filteredUsers.length, isLoadingMore]);

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
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold cursor-pointer bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-400 transition-all duration-300 px-4 py-2 rounded-xl shadow-sm hover:shadow-lg hover:scale-105 group"
        >
          <i className="fa-solid fa-arrow-left mr-1 transition-transform duration-300 group-hover:-translate-x-1 group-hover:scale-110"></i>
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


      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      )}


      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            {searchTerm 
              ? 'Không tìm thấy người dùng nào phù hợp!' 
              : type === 'followers' 
                ? 'Chưa có người theo dõi!' 
                : 'Chưa theo dõi ai!'}
          </p>
        </div>
      )}


      {!loading && filteredUsers.length > 0 && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedUsers.map((user, index) => (
          <div
            key={user.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 animate-fadeInUp"
            style={{ animationDelay: `${index * 100}ms` }}
          >

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


            <p className="text-gray-600 text-sm mb-4 leading-relaxed text-center flex items-center justify-center gap-2">
              <i className="fa-solid fa-envelope mr-2"></i>
              {user.email}
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


            <div className="flex gap-2">
              <FollowButton userId={user.id} onFollowChange={handleFollowChange} />
            </div>
          </div>
          ))}
        </div>

        
        {isLoadingMore && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600 font-medium">Đang tải thêm...</p>
          </div>
        )}

        {!hasMore && filteredUsers.length > 12 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3 animate-bounce">
              <i className="fa-solid fa-check text-3xl text-green-600"></i>
            </div>
            <p className="text-gray-600 font-semibold text-lg">Đã hiển thị tất cả {filteredUsers.length} người dùng</p>
          </div>
        )}
        </>
      )}
    </div>
  );
}
