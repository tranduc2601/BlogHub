import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PostCard from "../components/Postcard";
import { usePosts } from "../hooks/usePosts";
import axios from "../config/axios";
export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Lấy giá trị từ URL query params
  const [activeTab, setActiveTab] = useState<"recent" | "popular">(
    (searchParams.get("tab") as "recent" | "popular") || "recent"
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [searchTag, setSearchTag] = useState(searchParams.get("tag") || "");
  
  const { posts, loading, error, refreshPosts } = usePosts(activeTab, 3);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalAuthors, setTotalAuthors] = useState(0);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/posts");
        if (res.data.success && Array.isArray(res.data.posts)) {
          const allPosts = res.data.posts;
          setTotalPosts(allPosts.length);
          setTotalViews(allPosts.reduce((sum: number, post: { views?: number }) => sum + (post.views || 0), 0));
          const authorIds = Array.from(new Set(allPosts.map((post: { authorId: number }) => post.authorId)));
          setTotalAuthors(authorIds.length);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  // Cập nhật URL khi state thay đổi
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== "recent") {
      params.set("tab", activeTab);
    }
    if (search) {
      params.set("search", search);
    }
    if (searchTag) {
      params.set("tag", searchTag);
    }
    setSearchParams(params, { replace: true });
  }, [activeTab, search, searchTag, setSearchParams]);
  const filteredPosts = posts.filter(post => {
    const matchTitle = post.title.toLowerCase().includes(search.toLowerCase());
    const matchTag = searchTag
      ? post.tags.some(tag => tag.toLowerCase().includes(searchTag.toLowerCase()))
      : true;
    return matchTitle && matchTag;
  });

  return (
    <div className="space-y-12 select-none">
      
      <section className="text-center py-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-700 drop-shadow-lg mb-6 animate-fadeInUp leading-tight flex items-center justify-center gap-4">
          <i className="fa-solid fa-blog" style={{ fontSize: '1.2em', color: '#3b82f6', textShadow: '0 2px 8px #a5b4fc', marginRight: '10px' }}></i>
          Chào mừng đến với BlogHub
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed animate-fadeInUp animation-delay-200">
          Nơi chia sẻ những câu chuyện, ý tưởng và kinh nghiệm quý báu từ cộng đồng
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp animation-delay-400">
          <button
            className="bg-white border-3 border-blue-600 text-blue-700 px-8 py-3 rounded-full font-bold shadow-md transition-all duration-300 flex items-center gap-3 text-lg cursor-pointer hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-700"
            onClick={() => navigate("/create")}
            style={{ fontFamily: 'Inter, Arial, sans-serif' }}
          >
            <i className="fa-solid fa-pen-nib"></i>
            Bắt đầu viết Blog
          </button>
          <button
            className="bg-white border-3 border-blue-600 text-blue-700 px-8 py-3 rounded-full font-bold shadow-md transition-all duration-300 flex items-center gap-3 text-lg cursor-pointer hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-100 hover:border-blue-700"
            onClick={() => navigate("/posts")}
            style={{ fontFamily: 'Inter, Arial, sans-serif' }}
          >
            <i className="fa-solid fa-compass"></i>
            Khám phá các bài viết
          </button>
        </div>
      </section>

      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/80 transition-all duration-300">
          <div className="text-3xl font-bold text-blue-600 mb-2 flex items-center justify-center gap-2">
            <i className="fa-solid fa-file-lines" style={{ color: '#2563eb' }}></i>
            <span style={{ color: '#2563eb' }}>{totalPosts.toLocaleString()}</span>
          </div>
          <div className="text-gray-600">Bài viết</div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/80 transition-all duration-300">
          <div className="text-3xl font-bold text-blue-600 mb-2 flex items-center justify-center gap-2">
            <i className="fa-solid fa-eye" style={{ color: '#2563eb' }}></i>
            <span style={{ color: '#2563eb' }}>{totalViews.toLocaleString()}</span>
          </div>
          <div className="text-gray-600">Lượt xem</div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/80 transition-all duration-300">
          <div className="text-3xl font-bold text-blue-600 mb-2 flex items-center justify-center gap-2">
            <i className="fa-solid fa-user-pen" style={{ color: '#2563eb' }}></i>
            <span style={{ color: '#2563eb' }}>{totalAuthors.toLocaleString()}</span>
          </div>
          <div className="text-gray-600">Tác giả</div>
        </div>
      </section>

      
      <section>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            {activeTab === "recent" ? "Bài viết mới nhất" : "Bài viết nổi bật"}
          </h2>

          
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative min-w-0 flex-shrink">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tiêu đề..."
                className="pl-12 pr-5 py-3 border-3 border-gray-300 focus:border-blue-600 rounded-2xl w-full md:min-w-[220px] bg-white shadow focus:shadow-lg transition-all duration-300 text-lg font-medium placeholder:text-gray-400 hover:border-gray-400 outline-none"
              />
            </div>
            <div className="relative min-w-0 flex-shrink">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <i className="fa-solid fa-hashtag"></i>
              </span>
              <input
                type="text"
                value={searchTag}
                onChange={e => setSearchTag(e.target.value)}
                placeholder="Tìm theo thẻ (tags)..."
                className="pl-12 pr-5 py-3 border-3 border-gray-300 focus:border-blue-600 rounded-2xl w-full md:min-w-[180px] bg-white shadow focus:shadow-lg transition-all duration-300 text-lg font-medium placeholder:text-gray-400 hover:border-gray-400 outline-none"
              />
            </div>
          </div>

          
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("recent")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                activeTab === "recent"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <i className="fa-solid fa-clock mr-2"></i>
              Mới nhất
            </button>
            <button
              onClick={() => setActiveTab("popular")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                activeTab === "popular"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <i className="fa-solid fa-star mr-2"></i>
              Nổi bật
            </button>
          </div>
        </div>

        
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <svg
                className="w-12 h-12 text-red-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Không thể tải bài viết...
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={refreshPosts}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        
        {!loading && !error && (
          <div className={`grid gap-8 ${
            filteredPosts.length === 1 
              ? 'grid-cols-1 max-w-md mx-auto' 
              : filteredPosts.length === 2 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredPosts.map((post, i) => (
              <div
                key={post.id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}

        
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Không tìm thấy bài viết phù hợp
            </h3>
            <p className="text-gray-600">
              Hãy thử lại với từ khoá hoặc thẻ khác!
            </p>
          </div>
        )}
      </section>

      
      <section className="text-center py-16 bg-[white] rounded-3xl">
        <h3 className="text-3xl font-bold" style={{ color: '#2563eb' }}>
          Sẵn sàng chia sẻ câu chuyện của bạn?
        </h3>
        <p className="text-gray-600 mb-8 mt-7 max-w-xl mx-auto italic">
          Hãy tham gia cộng đồng BlogHub và bắt đầu viết bài viết đầu tiên ngay hôm nay!
        </p>
      </section>
    </div>
  );
}
