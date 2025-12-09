import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

interface TopPost {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  likes: number;
  commentCount: number;
  createdAt: string;
}

interface TopUser {
  id: number;
  name: string;
  avatarUrl: string;
  postsCount: number;
  totalLikes: number;
  commentsCount: number;
}

interface Activity {
  type: 'post' | 'comment' | 'report';
  id: number;
  content: string;
  userName: string;
  userAvatar: string;
  timestamp: string;
  postId?: number;
}

interface AdminDashboardProps {
  stats: {
    totalPosts: number;
    totalUsers: number;
    hotPosts: number;
    pendingReviewPosts: number;
    pendingReviewComments: number;
    activeUsers: number;
    lockedUsers: number;
    totalReports: number;
    pendingReports: number;
    approvedReports: number;
    rejectedReports: number;
  };
  monthlyStats?: Array<{ month: string; posts: number; users: number }>;
  topPosts?: TopPost[];
  topUsers?: TopUser[];
  activities?: Activity[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  stats, 
  monthlyStats = [], 
  topPosts = [], 
  topUsers = [], 
  activities = [] 
}) => {
  const navigate = useNavigate();
  const ACTIVITIES_PER_PAGE = 10;
  const [displayedActivities, setDisplayedActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);


  useEffect(() => {
    const initialActivities = activities.slice(0, ACTIVITIES_PER_PAGE);
    setDisplayedActivities(initialActivities);
    setHasMore(activities.length > ACTIVITIES_PER_PAGE);
    setPage(1);
  }, [activities]);


  useEffect(() => {
    const endIndex = page * ACTIVITIES_PER_PAGE;
    const activitiesToDisplay = activities.slice(0, endIndex);
    
    setDisplayedActivities(activitiesToDisplay);
    setHasMore(endIndex < activities.length);
  }, [page, activities]);


  useEffect(() => {
    const activityContainer = document.getElementById('activity-history-container');
    if (!activityContainer) return;

    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = activityContainer;


      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setLoadingMore(true);
        

        setTimeout(() => {
          setPage(prev => prev + 1);
          setLoadingMore(false);
        }, 500);
      }
    };

    activityContainer.addEventListener('scroll', handleScroll);
    return () => activityContainer.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return 'fa-blog';
      case 'comment': return 'fa-comment';
      case 'report': return 'fa-triangle-exclamation';
      default: return 'fa-circle';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'post': return 'text-blue-500 bg-blue-50';
      case 'comment': return 'text-purple-500 bg-purple-50';
      case 'report': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const getAvatarInitial = (name: string | null | undefined) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    const lastWord = words[words.length - 1];
    return lastWord.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Thống kê tổng quan</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Dashboard quản trị BlogHub</p>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">

        <div 
          onClick={() => navigate('/admin/post-management')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[16px] p-4 sm:p-6 text-white shadow-lg cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">Tổng bài viết</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{stats.totalPosts}</p>
            </div>
            <div className="text-3xl sm:text-5xl opacity-50">
              <i className="fa-solid fa-blog"></i>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-blue-100">
            {stats.pendingReviewPosts} bài cần kiểm duyệt
          </div>
        </div>


        <div 
          onClick={() => navigate('/admin/user-management')}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-[16px] p-4 sm:p-6 text-white shadow-lg cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs sm:text-sm font-medium">Tổng người dùng</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{stats.totalUsers}</p>
            </div>
            <div className="text-3xl sm:text-5xl opacity-50">
              <i className="fa-solid fa-user"></i>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-green-100">
            {stats.activeUsers} tài khoản bình thường
          </div>
        </div>


        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[16px] p-4 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium">Bài viết Hot</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{stats.hotPosts}</p>
            </div>
            <div className="text-3xl sm:text-5xl opacity-50">
              <i className="fa-solid fa-fire-flame-curved"></i>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-orange-100">
            ≥ 50 lượt thích
          </div>
        </div>


        <div 
          onClick={() => navigate('/admin/comment-report-management')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-[16px] p-4 sm:p-6 text-white shadow-lg cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm font-medium">Bình luận</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{stats.pendingReviewComments}</p>
            </div>
            <div className="text-3xl sm:text-5xl opacity-50">
              <i className="fa-solid fa-comments"></i>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-purple-100">
            Cần kiểm duyệt
          </div>
        </div>


        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-[16px] p-4 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs sm:text-sm font-medium">Báo cáo vi phạm</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{stats.totalReports}</p>
            </div>
            <div className="text-3xl sm:text-5xl opacity-50">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-red-100">
            {stats.pendingReports} chờ xử lý
          </div>
        </div>
      </div>


      <div className="bg-white rounded-[16px] p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Chi tiết hoạt động</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-600 font-medium">Tài khoản bình thường</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{stats.activeUsers}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <p className="text-sm text-red-600 font-medium">Tài khoản bị khóa</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{stats.lockedUsers}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl">
            <p className="text-sm text-yellow-600 font-medium">Tổng bài viết cần kiểm duyệt</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">
              {stats.pendingReviewPosts + stats.pendingReviewComments}
            </p>
          </div>
        </div>
      </div>


      <div className="bg-white rounded-[16px] p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Thống kê báo cáo vi phạm</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Tổng báo cáo bài viết</p>
            <p className="text-2xl font-bold text-gray-700 mt-1">{stats.totalReports}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
            <p className="text-sm text-yellow-600 font-medium">Bài viết đang chờ xử lý</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pendingReports}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
            <p className="text-sm text-red-600 font-medium">Bài viết đã duyệt</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{stats.approvedReports}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
            <p className="text-sm text-green-600 font-medium">Bài viết đã từ chối</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{stats.rejectedReports}</p>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        <div className="bg-white rounded-[16px] p-4 sm:p-6 shadow-lg">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Xu hướng bài viết theo tháng</h3>
          {monthlyStats.length === 0 || monthlyStats.every(m => m.posts === 0) ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500 text-center">Chưa có bài viết nào được đăng!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="posts" fill="#3b82f6" name="Bài viết" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>


        <div className="bg-white rounded-[16px] p-4 sm:p-6 shadow-lg">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Người dùng mới theo tháng</h3>
          {monthlyStats.length === 0 || monthlyStats.every(m => m.users === 0) ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500 text-center">Chưa có người dùng mới</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#10b981" name="Người dùng" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        <div className="bg-white rounded-[16px] p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <i className="fa-solid fa-fire text-orange-500"></i>
              Top bài viết
            </h3>
            <span className="text-sm text-gray-500">{topPosts.length} bài</span>
          </div>
          
          {topPosts.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <i className="fa-solid fa-face-sad-tear text-4xl mb-2"></i>
              <p>Chưa có bài viết nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topPosts.map((post, index) => (
                <Link 
                  key={post.id} 
                  to={`/post/${post.id}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  draggable="false"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  {post.authorAvatar ? (
                    <img 
                      src={post.authorAvatar} 
                      alt={post.author}
                      className="w-10 h-10 rounded-full object-cover"
                      draggable="false"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: '#2664eb' }}
                    >
                      {getAvatarInitial(post.author)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      bởi {post.author}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-red-500 text-sm font-semibold">
                      <i className="fa-solid fa-heart"></i>
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                      <i className="fa-solid fa-comment"></i>
                      <span>{post.commentCount}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>


        <div className="bg-white rounded-[16px] p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <i className="fa-solid fa-crown text-yellow-500"></i>
              Top người dùng
            </h3>
            <span className="text-sm text-gray-500">{topUsers.length} người dùng</span>
          </div>
          
          {topUsers.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <i className="fa-solid fa-face-sad-tear text-4xl mb-2"></i>
              <p>Chưa có người dùng nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <Link 
                  key={user.id} 
                  to={`/userdetail/${user.id}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                  draggable="false"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                      draggable="false"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: '#2664eb' }}
                    >
                      {getAvatarInitial(user.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.postsCount} bài viết • {user.commentsCount} bình luận
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-red-500 text-sm font-semibold">
                      <i className="fa-solid fa-heart"></i>
                      <span>{user.totalLikes}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>


      <div className="bg-white rounded-[16px] p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-blue-500"></i>
            Lịch sử hoạt động
          </h3>
          <span className="text-sm text-gray-500">Gần đây</span>
        </div>
        
        {activities.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <i className="fa-solid fa-face-sad-tear text-4xl mb-2"></i>
            <p>Chưa có hoạt động nào</p>
          </div>
        ) : (
          <>
            <div 
              id="activity-history-container"
              className="space-y-2 max-h-96 overflow-y-auto"
            >
              {displayedActivities.map((activity) => (
                <div 
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    <i className={`fa-solid ${getActivityIcon(activity.type)}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {activity.userAvatar ? (
                        <img 
                          src={activity.userAvatar} 
                          alt={activity.userName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#2664eb] flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {getAvatarInitial(activity.userName)}
                          </span>
                        </div>
                      )}
                      <span className="font-semibold text-gray-800 text-sm">
                        {activity.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activity.type === 'post' && 'đã đăng bài viết'}
                        {activity.type === 'comment' && 'đã bình luận'}
                        {activity.type === 'report' && 'đã báo cáo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                      {activity.postId && (
                        <Link 
                          to={`/post/${activity.postId}`}
                          className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                        >
                          Xem chi tiết →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              
              {loadingMore && (
                <div className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600 text-xs">Đang tải thêm hoạt động...</p>
                  </div>
                </div>
              )}

              
              {!hasMore && displayedActivities.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="h-px w-12 bg-gray-300"></div>
                    <i className="fa-solid fa-check-circle text-green-500"></i>
                    <span className="text-xs font-medium">Đã xem hết lịch sử hoạt động</span>
                    <div className="h-px w-12 bg-gray-300"></div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
