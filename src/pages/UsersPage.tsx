import { useState } from "react";
import { useUsers } from "../hooks/useUsers";


function FollowButton({ userId }: { userId: number }) {
  // Lưu trạng thái theo dõi từng user vào localStorage
  const [following, setFollowing] = useState(() => {
    const followed = localStorage.getItem("followedUsers");
    if (followed) {
      try {
        const arr = JSON.parse(followed);
        return Array.isArray(arr) && arr.includes(userId);
      } catch {
        return false;
      }
    }
    return false;
  });

  const handleFollow = () => {
    setFollowing(true);
    // Lưu vào localStorage
    const followed = localStorage.getItem("followedUsers");
    let arr: number[] = [];
    if (followed) {
      try {
        arr = JSON.parse(followed);
        if (!Array.isArray(arr)) arr = [];
      } catch {
        arr = [];
      }
    }
    if (!arr.includes(userId)) {
      arr.push(userId);
      localStorage.setItem("followedUsers", JSON.stringify(arr));
    }
  };

  return (
    <button
      className={`flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 ${following ? "opacity-60 pointer-events-none" : ""}`}
      onClick={handleFollow}
      disabled={following}
    >
      {following ? "Đã theo dõi" : "Theo dõi"}
    </button>
  );
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "posts" | "comments">("name");
  const { users, loading, error } = useUsers();

  const filteredAndSortedUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "posts":
          return b.postsCount - a.postsCount;
        case "comments":
          return b.commentsCount - a.commentsCount;
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

  const getAuthorInitial = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Danh sách tác giả
        </h1>
        <p className="text-gray-600 text-lg">
          Khám phá những tác giả tài năng trong cộng đồng BlogHub
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
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

          <div className="md:w-64">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "posts" | "comments")
              }
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="posts">Sắp xếp theo số bài viết</option>
              <option value="comments">Sắp xếp theo số bình luận</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {users.length}
          </div>
          <div className="text-gray-600">Tổng số người dùng</div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {users.reduce((sum: number, u) => sum + u.postsCount, 0)}
          </div>
          <div className="text-gray-600">Tổng số bài viết</div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
          <div className="text-3xl font-bold text-indigo-600 mb-2">
            {users
              .reduce((sum: number, u) => sum + u.commentsCount, 0)
              .toLocaleString()}
          </div>
          <div className="text-gray-600">Tổng số bình luận</div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAndSortedUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Không tìm thấy người dùng nào</p>
        </div>
      )}

      {/* Users Grid */}
      {!loading && !error && filteredAndSortedUsers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedUsers.map((user, index) => (
          <div
            key={user.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 animate-fadeInUp"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {getAuthorInitial(user.name)}
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
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              📧 {user.email}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {user.postsCount}
                </div>
                <div className="text-xs text-gray-500">Bài viết</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {user.commentsCount}
                </div>
                <div className="text-xs text-gray-500">Bình luận</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <FollowButton userId={user.id} />
              <button className="px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-xl hover:border-gray-300 transition-all duration-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
