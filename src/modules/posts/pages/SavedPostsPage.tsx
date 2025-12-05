import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { bookmarkService } from "../services/bookmarkService";
import type { Post } from "@/shared/types";
import toast from "react-hot-toast";
import PostCard from "../components/PostCard";

export default function SavedPostsPage() {
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookmarkService.getBookmarks(page, 9);
      
      if (response.success) {
        if (page === 1) {
          setBookmarks(response.bookmarks);
        } else {
          setBookmarks(prev => [...prev, ...response.bookmarks]);
        }
        
        setHasMore(page < response.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      toast.error('Không thể tải danh sách bài viết đã lưu!');
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Get unique categories from all bookmarks
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    bookmarks.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => categories.add(tag));
      }
    });
    return Array.from(categories).sort();
  }, [bookmarks]);

  // Filter bookmarks based on search and category
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(post => {
      const matchSearch = searchTerm
        ? post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      const matchCategory = selectedCategory
        ? post.tags && post.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase())
        : true;
      
      return matchSearch && matchCategory;
    });
  }, [bookmarks, searchTerm, selectedCategory]);

  // Reset filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  // Check if filters are active
  const hasActiveFilters = searchTerm || selectedCategory;

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 rounded-2xl">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6 sm:mb-8">
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              Bài viết đã lưu
            </h1>
          </div>

          {/* Search and Filter Section */}
          {bookmarks.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 mt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm bài viết..."
                    className="w-full pl-12 pr-4 py-3 border-3 border-gray-300 focus:border-blue-600 rounded-xl bg-white shadow focus:shadow-lg transition-all duration-300 font-medium placeholder:text-gray-400 hover:border-gray-400 outline-none"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative w-full lg:w-80">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                    <i className="fa-solid fa-filter"></i>
                  </span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-3 border-gray-300 focus:border-blue-600 rounded-xl bg-white shadow focus:shadow-lg transition-all duration-300 font-medium hover:border-gray-400 outline-none cursor-pointer appearance-none"
                  >
                    <option value="">Tất cả danh mục</option>
                    {allCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <i className="fa-solid fa-chevron-down"></i>
                  </span>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="px-5 py-3 bg-white border-3 border-red-400 text-red-600 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 w-full lg:w-auto hover:bg-red-50 hover:border-red-500 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <i className="fa-solid fa-filter-circle-xmark text-lg"></i>
                    <span>Xoá bộ lọc</span>
                  </button>
                )}
              </div>

              {/* Filter Results Summary */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <i className="fa-solid fa-info-circle mr-2 text-blue-500"></i>
                    Tìm thấy <span className="font-bold text-blue-600">{filteredBookmarks.length}</span> bài viết
                    {searchTerm && <span> với từ khóa "<span className="font-semibold">{searchTerm}</span>"</span>}
                    {selectedCategory && <span> trong danh mục "<span className="font-semibold">{selectedCategory}</span>"</span>}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>


        {bookmarks.length === 0 && !loading && (
          <div className="text-center py-12 sm:py-16 md:py-20 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gray-100 rounded-full mb-4 sm:mb-6">
              <i className="fa-solid fa-bookmark text-4xl sm:text-5xl md:text-6xl text-gray-400"></i>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
              Chưa có bài viết nào được lưu!
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto px-4">
              Khám phá và lưu các bài viết yêu thích để đọc lại sau. Nhấn vào icon bookmark trên bài viết để lưu.
            </p>
            <Link
              to="/posts"
              style={{ backgroundColor: '#2664eb' }}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:brightness-110 cursor-pointer group"
            >
              <i className="fa-solid fa-compass group-hover:rotate-45 transition-transform duration-500"></i>
              Khám phá ngay
            </Link>
          </div>
        )}


        {bookmarks.length > 0 && (
          <>
            {/* No Results Message */}
            {filteredBookmarks.length === 0 && hasActiveFilters && (
              <div className="text-center py-12 sm:py-16 px-4">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full mb-4 sm:mb-6">
                  <i className="fa-solid fa-search text-4xl sm:text-5xl text-gray-400"></i>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Không tìm thấy bài viết phù hợp!
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto px-4">
                  Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-blue-700 cursor-pointer"
                >
                  <i className="fa-solid fa-rotate-left"></i>
                  Xoá bộ lọc
                </button>
              </div>
            )}

            {/* Posts Grid */}
            {filteredBookmarks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBookmarks.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    hideShare={true}
                    onOpenReactionModal={() => {}}
                  />
                ))}
              </div>
            )}


            {hasMore && !hasActiveFilters && (
              <div className="text-center mt-6 sm:mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className={`px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 cursor-pointer ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  }`}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-chevron-down mr-2"></i>
                      Xem thêm
                    </>
                  )}
                </button>
              </div>
            )}


            {!hasMore && filteredBookmarks.length > 0 && !hasActiveFilters && (
              <div className="flex items-center justify-center py-8 mt-6">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="h-px w-16 bg-gray-300"></div>
                  <i className="fa-solid fa-check-circle text-green-500"></i>
                  <span className="text-sm font-medium">Bạn đã xem hết tất cả bài viết đã lưu</span>
                  <div className="h-px w-16 bg-gray-300"></div>
                </div>
              </div>
            )}

            {filteredBookmarks.length > 0 && hasActiveFilters && (
              <div className="flex items-center justify-center py-8 mt-6">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="h-px w-16 bg-gray-300"></div>
                  <i className="fa-solid fa-check-circle text-green-500"></i>
                  <span className="text-sm font-medium">Đã hiển thị tất cả kết quả phù hợp</span>
                  <div className="h-px w-16 bg-gray-300"></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
