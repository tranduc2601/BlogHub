import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "@/core/auth";
import axios from "@/core/config/axios";
import toast from "react-hot-toast";

interface UserInfo {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  postsCount: number;
  commentsCount: number;
  followersCount: number;
  followingCount: number;
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
      // toast.success("Đã theo dõi thành công!", {
      //   duration: 2000,
      //   position: 'top-right',
      // });
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
      // toast.success("Đã hủy theo dõi thành công!", {
      //   duration: 2000,
      //   position: 'top-right',
      // });
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
  

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState<"name" | "posts" | "comments" | "followers" | "likes" | "joinedEarliest" | "joinedLatest">(
    (searchParams.get("sortBy") as "name" | "posts" | "comments" | "followers" | "likes" | "joinedEarliest" | "joinedLatest") || "followers"
  );
  
  const { users, loading, error } = useUsers();
  const { user: currentUser } = useAuth();
  const [localUsers, setLocalUsers] = useState(users);
  const [displayedUsers, setDisplayedUsers] = useState<UserInfo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const USERS_PER_PAGE = 9;
  

  const [showModal, setShowModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');
  const [modalUsers, setModalUsers] = useState<UserInfo[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  
  useEffect(() => {
    setLocalUsers(users);
  }, [users]);


  const filteredAndSortedUsers = useMemo(() => {
    return localUsers
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
          case "joinedEarliest": {
            const aDate = new Date(a.joinedAt).getTime();
            const bDate = new Date(b.joinedAt).getTime();
            return aDate - bDate; 
          }
          case "joinedLatest": {
            const aDate = new Date(a.joinedAt).getTime();
            const bDate = new Date(b.joinedAt).getTime();
            return bDate - aDate;
          }
          default:
            return 0;
        }
      });
  }, [localUsers, searchTerm, sortBy, currentUser?.id]);


  useEffect(() => {
    setPage(1);
  }, [searchTerm, sortBy]);


  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * USERS_PER_PAGE;
    const usersToDisplay = filteredAndSortedUsers.slice(startIndex, endIndex);
    const hasMoreUsers = endIndex < filteredAndSortedUsers.length;
    
    setDisplayedUsers(usersToDisplay);
    setHasMore(hasMoreUsers);
  }, [filteredAndSortedUsers, page]);


  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;


      if (scrollTop + clientHeight >= scrollHeight - 300) {
        setLoadingMore(true);
        

        setTimeout(() => {
          setPage(prev => prev + 1);
          setLoadingMore(false);
        }, 500);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore]);


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


  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const handleFollowChange = async () => {

    try {
      const response = await axios.get('/users');
      if (response.data.success) {
        setLocalUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  const handleOpenFollowersModal = async (userId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalType('followers');
    setShowModal(true);
    setModalLoading(true);
    
    try {
      const response = await axios.get(`/users/${userId}/followers`);
      if (response.data.success) {
        setModalUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast.error("Không thể tải danh sách người theo dõi!");
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenFollowingModal = async (userId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalType('following');
    setShowModal(true);
    setModalLoading(true);
    
    try {
      const response = await axios.get(`/users/${userId}/following`);
      if (response.data.success) {
        setModalUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
      toast.error("Không thể tải danh sách đang theo dõi!");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setModalUsers([]);
    }, 300);
  };

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
      
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold bg-[#2664eb] bg-clip-text text-transparent mb-4">
          Danh sách các người dùng
        </h1>
        <p className="text-gray-600 text-base md:text-lg">
          Khám phá những người dùng tài năng trong cộng đồng BlogHub!
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
                setSortBy(e.target.value as "name" | "posts" | "comments" | "followers" | "likes" | "joinedEarliest" | "joinedLatest")
              }
              className="w-full p-3 border-3 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 cursor-pointer select-none"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="followers">Sắp xếp theo số người theo dõi</option>
              <option value="likes">Sắp xếp theo lượt tim/bài viết</option>
              <option value="posts">Sắp xếp theo số bài viết</option>
              <option value="comments">Sắp xếp theo số bình luận</option>
              <option value="joinedEarliest">Sắp xếp theo ngày tham gia sớm nhất</option>
              <option value="joinedLatest">Sắp xếp theo ngày tham gia mới đây</option>
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
          <p className="text-gray-600 text-lg">Không tìm thấy người dùng nào!</p>
        </div>
      )}

      
      {!loading && !error && filteredAndSortedUsers.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedUsers.map((user, index) => (
              <div
                key={user.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 animate-fadeInUp h-full flex flex-col cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(`/userdetail/${user.id}`)}
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
                      <i className="fa-solid fa-envelope"></i>
                    </span>
                    <span className="truncate">{user.email}</span>
                  </p>


                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center mt-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.postsCount}
                  </div>
                  <div className="text-xs text-gray-500">Bài viết</div>
                </div>
                    <div 
                      className="text-center cursor-pointer hover:bg-blue-50 rounded-lg p-2 transition-colors"
                      onClick={(e) => handleOpenFollowersModal(user.id, e)}
                    >
                      <div className="text-2xl font-bold text-blue-600">
                        {user.followersCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">Người theo dõi</div>
                    </div>
                    <div 
                      className="text-center cursor-pointer hover:bg-blue-50 rounded-lg p-2 transition-colors"
                      onClick={(e) => handleOpenFollowingModal(user.id, e)}
                    >
                      <div className="text-2xl font-bold text-blue-600">
                        {user.followingCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">Đang theo dõi</div>
                    </div>
                  </div>
                </div>

                
                <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                  <FollowButton userId={user.id} onFollowChange={handleFollowChange} />
                </div>
              </div>
            ))}
          </div>


          {loadingMore && (
            <div className="flex items-center justify-center py-8 mt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-gray-600 text-sm">Đang tải thêm người dùng...</p>
              </div>
            </div>
          )}


          {!hasMore && displayedUsers.length > 0 && (
            <div className="flex items-center justify-center py-8 mt-6">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="h-px w-16 bg-gray-300"></div>
                <i className="fa-solid fa-check-circle text-green-500"></i>
                <span className="text-sm font-medium">Đã hiển thị tất cả người dùng</span>
                <div className="h-px w-16 bg-gray-300"></div>
              </div>
            </div>
          )}
        </>
      )}
      

      {showModal && (
        <div 
          className={`fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4 transition-all duration-300 ${
            isClosingModal ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleCloseModal}
        >
          <div 
            className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden transition-all duration-300 ${
              isClosingModal ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >

            <div className="bg-[#2664eb] text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <i className={`fa-solid ${modalType === 'followers' ? 'fa-users' : 'fa-user-check'} mr-2`}></i>
                {modalType === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 hover:rotate-90 transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>


            <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
              {modalLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
              ) : modalUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4"><i className={`fa-solid ${modalType === 'followers' ? 'fa-users' : 'fa-user-check'}`}></i></div>
                  <p className="text-gray-600 text-lg">
                    {modalType === 'followers' 
                      ? 'Chưa có người theo dõi nào!' 
                      : 'Chưa theo dõi ai!'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {modalUsers.map((modalUser) => (
                    <div
                      key={modalUser.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-all duration-300 cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseModal();
                        navigate(`/userdetail/${modalUser.id}`);
                      }}
                    >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {modalUser.avatarUrl ? (
                          <>
                            <img 
                              src={modalUser.avatarUrl}
                              alt={modalUser.name}
                              className="w-16 h-16 rounded-full object-cover border-4 border-blue-500 shadow-lg group-hover:scale-110 transition-transform"
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
                              className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center text-blue-700 font-bold text-xl border-4 border-blue-500 shadow-lg absolute top-0 left-0 group-hover:scale-110 transition-transform"
                              style={{ display: 'none' }}
                            >
                              {modalUser.name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                            </div>
                          </>
                        ) : (
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl border-4 border-blue-500 shadow-lg group-hover:scale-110 transition-transform">
                            {modalUser.name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-800 truncate">
                          {modalUser.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {modalUser.postsCount} bài viết
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
