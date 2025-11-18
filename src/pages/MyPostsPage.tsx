import { useEffect, useState } from "react";
import axios from "../config/axios";
import Modal from "../components/Modal";
import toast from "react-hot-toast";

interface Post {
  id: number;
  title: string;
  content: string;
  category?: string;
  status?: 'pending' | 'visible' | 'hidden';
  createdAt: string;
}

// Helper function to extract first image from HTML content
const extractFirstImage = (htmlContent: string): string | null => {
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = htmlContent.match(imgRegex);
  return match ? match[1] : null;
};

// Helper function to strip HTML and get text preview
const getTextPreview = (htmlContent: string, maxLength: number = 200): string => {
  const textOnly = htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return textOnly.length > maxLength ? textOnly.substring(0, maxLength) + '...' : textOnly;
};

export default function MyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    postId: number | null;
    postTitle: string;
  }>({
    isOpen: false,
    postId: null,
    postTitle: ''
  });

  useEffect(() => {
    const fetchMyPosts = async () => {
      setLoading(true);
      try {

        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
        const user = JSON.parse(userStr || "null");

        if (user && user.id) {
          const url = `/posts?authorId=${user.id}`;
          
          const res = await axios.get(url);
          
          if (res.data.success) {
            const userPosts = res.data.posts || [];
            setPosts(userPosts);
          } else {
            setPosts([]);
          }
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number; data?: unknown } };
          console.error('Response status:', axiosError.response?.status);
          console.error('Response data:', axiosError.response?.data);
        }
        setPosts([]);
      }
      setLoading(false);
    };
    fetchMyPosts();
  }, []);

  const handleDeleteClick = (postId: number, postTitle: string) => {
    setDeleteModal({
      isOpen: true,
      postId,
      postTitle
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.postId) return;

    try {
      await axios.delete(`/posts/${deleteModal.postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== deleteModal.postId));
      toast.success("Đã xóa bài viết thành công!");
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Xóa bài viết thất bại!");
    } finally {
      setDeleteModal({ isOpen: false, postId: null, postTitle: '' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Bài viết của tôi</h2>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 select-none">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Bài viết của tôi</h2>
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 mb-4">Bạn chưa có bài viết nào!</div>
          <button
            onClick={() => window.location.href = '/create'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-plus"></i>
            Tạo bài viết mới
          </button>
        </div>
      ) : (
        <div className={`gap-6 ${
          posts.length === 1 
            ? 'flex justify-center' 
            : posts.length === 2 
            ? 'grid grid-cols-1 md:grid-cols-2' 
            : 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        }`}>
          {posts.map((post, index) => (
            <div
              key={post.id}
              className={`bg-white rounded-xl shadow p-6 border border-gray-100 transition-transform duration-300 hover:scale-105 hover:shadow-lg ${
                posts.length === 1 
                  ? 'w-full max-w-2xl' 
                  : posts.length >= 3 && index === posts.length - 1 && posts.length % 3 === 1
                  ? 'md:col-start-2 xl:col-start-2'
                  : posts.length >= 3 && index >= posts.length - 2 && posts.length % 3 === 2
                  ? index === posts.length - 2 ? 'xl:col-start-2' : ''
                  : 'w-full'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <a
                  href={`/post/${post.id}`}
                  className="text-xl font-semibold text-blue-600 hover:underline flex-1"
                >
                  {post.title}
                </a>
                {post.status === 'pending' && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full whitespace-nowrap">
                    <i className="fa-regular fa-hourglass-half"></i> Chờ duyệt
                  </span>
                )}
                {post.status === 'visible' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full whitespace-nowrap">
                    ✓ Đã duyệt
                  </span>
                )}
                {post.status === 'hidden' && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full whitespace-nowrap">
                    <i className="fa-solid fa-eye-slash"></i> Đang bị ẩn
                  </span>
                )}
              </div>
              <div className="text-gray-500 text-sm mt-2">
                {post.category || "Không có danh mục"} •{" "}
                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
              </div>
              
              {/* Hiển thị ảnh đầu tiên nếu có */}
              {extractFirstImage(post.content) && (
                <div className="mt-4 rounded-lg overflow-hidden">
                  <img 
                    src={extractFirstImage(post.content)!} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Hiển thị preview text */}
              <div className="mt-4 text-gray-700 line-clamp-3">
                {getTextPreview(post.content, 150)}
              </div>
              
              <button 
                onClick={() => window.location.href = `/post/${post.id}`}
                className="text-blue-600 hover:text-blue-700 text-sm mt-2 font-medium hover:underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                Đọc thêm
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 cursor-pointer active:bg-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-lg transform hover:scale-105"
                  onClick={() => window.location.href = `/edit/${post.id}`}
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  <span>Chỉnh sửa</span>
                </button>
                <button
                  className="flex-1 bg-white text-red-600 px-5 py-2.5 rounded-lg font-medium border-2 border-red-600 hover:bg-red-50 cursor-pointer active:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-lg transform hover:scale-105"
                  onClick={() => handleDeleteClick(post.id, post.title)}
                >
                  <i className="fa-solid fa-trash"></i>
                  <span>Xoá bài viết</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, postId: null, postTitle: '' })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bài viết"
        message={`Bạn có chắc chắn muốn xóa bài viết "${deleteModal.postTitle}"? Hành động này không thể hoàn tác!`}
        type="warning"
        confirmText="Xóa bài viết"
        cancelText="Hủy"
      />
    </div>
  );
}
