import { useState, useEffect, useCallback } from "react";
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookmarks.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  hideShare={true}
                  onOpenReactionModal={() => {}}
                />
              ))}
            </div>


            {hasMore && (
              <div className="text-center mt-6 sm:mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className={`px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
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


            {!hasMore && bookmarks.length > 0 && (
              <div className="text-center mt-6 sm:mt-8 py-4 sm:py-6">
                <p className="text-sm sm:text-base text-gray-500 font-medium">
                  <i className="fa-solid fa-check-circle text-green-500 mr-2"></i>
                  Bạn đã xem hết tất cả bài viết đã lưu
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
