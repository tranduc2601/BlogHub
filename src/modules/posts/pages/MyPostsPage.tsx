import { useEffect, useState } from "react";
import axios from "@/core/config/axios";
import { Modal } from "@/shared/ui";
import toast from "react-hot-toast";

interface Post {
  id: number;
  title: string;
  content: string;
  category?: string;
  status?: 'pending' | 'visible' | 'hidden';
  createdAt: string;
}

// Helper function to strip HTML and get text preview
const getTextPreview = (htmlContent: string, maxLength: number = 200): string => {
  const textOnly = htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return textOnly.length > maxLength ? textOnly.substring(0, maxLength) + '...' : textOnly;
};

// Helper function to get category color
const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'Công nghệ': 'bg-blue-500',
    'Design': 'bg-purple-500',
    'Marketing': 'bg-green-500',
    'Ẩm thực': 'bg-orange-500',
    'Du lịch': 'bg-indigo-500',
    'Giáo dục': 'bg-teal-500'
  };
  return colors[category] || 'bg-gray-500';
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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 select-none">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Bài viết của tôi
          </h2>
          <p className="text-gray-600">Quản lý và theo dõi tất cả bài viết của bạn</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-file-pen text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Chưa có bài viết nào</h3>
              <p className="text-gray-600 mb-6">Hãy bắt đầu chia sẻ câu chuyện của bạn với mọi người!</p>
              <button
                onClick={() => window.location.href = '/create'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-3 cursor-pointer"
              >
                <i className="fa-solid fa-plus text-lg"></i>
                Tạo bài viết đầu tiên
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => {
              const preview = getTextPreview(post.content, 150);
              
              return (
                <div
                  key={post.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full overflow-hidden cursor-pointer"
                  onClick={() => window.location.href = `/post/${post.id}`}
                >
                  {/* Content Section */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Status Badge */}
                    <div className="mb-3">
                      {post.status === 'pending' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-xs font-semibold rounded-full">
                          <i className="fa-regular fa-hourglass-half"></i>
                          Chờ duyệt
                        </span>
                      )}
                      {post.status === 'visible' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-semibold rounded-full">
                          <i className="fa-solid fa-check-circle"></i>
                          Đã duyệt
                        </span>
                      )}
                      {post.status === 'hidden' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 text-xs font-semibold rounded-full">
                          <i className="fa-solid fa-eye-slash"></i>
                          Đang bị ẩn
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 mb-3 line-clamp-2 transition-colors duration-200">
                      {post.title}
                    </h3>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 text-sm mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-white font-medium ${getCategoryColor(post.category || '')}`}>
                        {post.category || "Không có danh mục"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-gray-500">
                        <i className="fa-regular fa-calendar text-xs"></i>
                        {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    
                    {/* Preview Text */}
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                      {preview}
                    </p>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/post/${post.id}`;
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline transition-colors flex items-center gap-2 mb-6 cursor-pointer group/link"
                    >
                      Đọc thêm
                      <i className="fa-solid fa-arrow-right text-xs group-hover/link:translate-x-1 transition-transform"></i>
                    </button>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                      <button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/edit/${post.id}`;
                        }}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                        <span>Chỉnh sửa</span>
                      </button>
                      <button
                        className="flex-1 bg-white text-red-600 px-4 py-3 rounded-xl font-semibold border-2 border-red-500 hover:bg-red-50 cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(post.id, post.title);
                        }}
                      >
                        <i className="fa-solid fa-trash"></i>
                        <span>Xoá</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
