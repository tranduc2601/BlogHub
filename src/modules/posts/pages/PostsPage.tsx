import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "@/core/config/axios";
import PostCard from "../components/PostCard";
import ReactionModal from "../components/ReactionModal";
import type { Post } from "@/shared/types";

export default function PostsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "hot");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reactionModalState, setReactionModalState] = useState<{
    isOpen: boolean;
    postId: number;
    totalReactions: number;
  }>({ isOpen: false, postId: 0, totalReactions: 0 });

  const POSTS_PER_PAGE = 9;

  // Fetch posts từ server
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/posts");
        if (res.data.success && Array.isArray(res.data.posts)) {
          setPosts(res.data.posts);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  // Xử lý tìm kiếm và lọc
  useEffect(() => {
    // Hàm tính điểm engagement
    const calculateEngagementScore = (post: Post) => {
      const totalReactions = post.total_reactions || post.likes || 0;
      const totalComments = post.comments || 0;
      const totalViews = post.views || 0;
      
      return totalReactions + (totalComments * 2) + (totalViews / 10);
    };

    // Hàm kiểm tra bài viết có hot không
    const isHotPost = (post: Post) => {
      const totalReactions = post.total_reactions || post.likes || 0;
      const totalComments = post.comments || 0;
      const totalViews = post.views || 0;
      const engagementScore = calculateEngagementScore(post);
      
      return totalReactions >= 10 || totalComments >= 5 || totalViews >= 100 || engagementScore >= 15;
    };

    let result = [...posts];

    // Lọc theo tìm kiếm
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Lọc theo danh mục
    if (selectedCategory !== "all") {
      result = result.filter(post => post.category === selectedCategory);
    }

    // Sắp xếp
    result.sort((a, b) => {
      if (sortBy === "hot") {
        const aIsHot = isHotPost(a);
        const bIsHot = isHotPost(b);
        
        if (aIsHot && !bIsHot) return -1;
        if (!aIsHot && bIsHot) return 1;
        
        return calculateEngagementScore(b) - calculateEngagementScore(a);
      } else if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "views") {
        return (b.views || 0) - (a.views || 0);
      } else if (sortBy === "comments") {
        return (b.comments || 0) - (a.comments || 0);
      }
      return 0;
    });

    setFilteredPosts(result);
    setPage(1); // Reset về trang 1 khi filter thay đổi
  }, [posts, searchQuery, selectedCategory, sortBy]);

  // Cập nhật displayed posts khi filteredPosts hoặc page thay đổi
  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * POSTS_PER_PAGE;
    const postsToDisplay = filteredPosts.slice(startIndex, endIndex);
    
    setDisplayedPosts(postsToDisplay);
    setHasMore(endIndex < filteredPosts.length);
  }, [filteredPosts, page]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Khi scroll gần đến cuối trang (còn 300px)
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        setLoadingMore(true);
        
        // Simulate loading delay
        setTimeout(() => {
          setPage(prev => prev + 1);
          setLoadingMore(false);
        }, 500);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore]);

  // Cập nhật URL params khi filter thay đổi
  useEffect(() => {
    const params: Record<string, string> = {};
    
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (sortBy !== "hot") params.sort = sortBy;
    
    setSearchParams(params);
  }, [searchQuery, selectedCategory, sortBy, setSearchParams]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("hot");
  };

  const handleOpenReactionModal = (postId: number, totalReactions: number) => {
    setReactionModalState({ isOpen: true, postId, totalReactions });
  };

  const handleCloseReactionModal = () => {
    setReactionModalState({ isOpen: false, postId: 0, totalReactions: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 select-none">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-[#2563eb]">
            Khám phá bài viết
          </h2>
          {(searchQuery || selectedCategory !== "all" || sortBy !== "hot") && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <i className="fa-solid fa-times-circle"></i>
              <span className="hidden sm:inline">Xóa bộ lọc</span>
            </button>
          )}
        </div>
        
        {/* Search và Filter Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* Search Input */}
          <div className="mb-5">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung hoặc thẻ..."
                className="w-full px-5 py-4 pl-14 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 text-gray-700 placeholder-gray-400 bg-white shadow-sm hover:shadow-md hover:border-cyan-200"
              />
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#2563eb] transition-colors">
                <i className="fa-solid fa-search text-lg"></i>
              </div>
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
                >
                  <i className="fa-solid fa-times text-lg"></i>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category Filter */}
            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <i className="fa-solid fa-layer-group text-[#2563eb]"></i>
                <span>Danh mục</span>
              </label>
              <div className="relative group">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-white appearance-none cursor-pointer text-gray-700 font-medium shadow-sm hover:shadow-md hover:border-cyan-300"
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="Công nghệ">Công nghệ</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Du lịch">Du lịch</option>
                  <option value="Ẩm thực">Ẩm thực</option>
                  <option value="Giáo dục">Giáo dục</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-cyan-500 transition-colors"></i>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <i className="fa-solid fa-arrow-down-wide-short text-[#2563eb]"></i>
                <span>Sắp xếp</span>
              </label>
              <div className="relative group">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-white appearance-none cursor-pointer text-gray-700 font-medium shadow-sm hover:shadow-md hover:border-cyan-300"
                >
                  <option value="hot">Hot nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="views">Xem nhiều</option>
                  <option value="comments">Nhiều bình luận</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-cyan-500 transition-colors"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#2563eb] rounded-full"></div>
            <p className="text-gray-700 font-medium">
              {filteredPosts.length === 0 
                ? "Không tìm thấy bài viết nào" 
                : (
                  <>
                    Tìm thấy <span className="text-[#2563eb] font-bold">{filteredPosts.length}</span> bài viết
                    {searchQuery && <span className="text-gray-500"> cho "<span className="text-[#2563eb] font-semibold">{searchQuery}</span>"</span>}
                  </>
                )
              }
            </p>
          </div>
          {filteredPosts.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <i className="fa-solid fa-newspaper"></i>
              <span>Danh sách bài viết</span>
            </div>
          )}
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <i className="fa-solid fa-inbox text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-600 text-lg">
            {posts.length === 0 
              ? "Hiện tại không có bài viết nào. Hãy là người đầu tiên viết lên ý tưởng của bạn!"
              : "Không tìm thấy bài viết nào phù hợp với bộ lọc của bạn."
            }
          </p>
          {(searchQuery || selectedCategory !== "all" || sortBy !== "hot") && (
            <button
              onClick={handleClearFilters}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedPosts.map((post, i) => (
              <div
                key={post.id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <PostCard post={post} hideShare={true} onOpenReactionModal={handleOpenReactionModal} />
              </div>
            ))}
          </div>

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-gray-600 text-sm">Đang tải thêm bài viết...</p>
              </div>
            </div>
          )}

          {/* End of List Indicator */}
          {!hasMore && displayedPosts.length > 0 && (
            <div className="flex items-center justify-center py-8 mt-4">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="h-px w-16 bg-gray-300"></div>
                <i className="fa-solid fa-check-circle text-green-500"></i>
                <span className="text-sm font-medium">Đã hiển thị tất cả bài viết</span>
                <div className="h-px w-16 bg-gray-300"></div>
              </div>
            </div>
          )}
        </>
      )}

      <ReactionModal
        isOpen={reactionModalState.isOpen}
        onClose={handleCloseReactionModal}
        postId={reactionModalState.postId}
        totalReactions={reactionModalState.totalReactions}
      />
    </div>
  );
}
