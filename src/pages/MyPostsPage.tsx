import { useEffect, useState } from "react";
import axios from "../config/axios";

interface Post {
  id: number;
  title: string;
  content: string;
  category?: string;
  createdAt: string;
}

export default function MyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosts = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        console.log('Current user:', user);
        if (user) {
          const res = await axios.get(`/posts?authorId=${user.id}`);
          console.log('API response:', res.data);
          if (res.data.success) {
            console.log('Posts received:', res.data.posts);
            setPosts(res.data.posts || []);
          } else {
            setPosts([]);
          }
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      }
      setLoading(false);
    };
    fetchMyPosts();
  }, []);

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="max-w-8xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6">Bài viết của tôi</h2>
      {posts.length === 0 ? (
        <div className="text-gray-600">Bạn chưa có bài viết nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow p-6 border border-gray-100 w-[400px]"
            >
              <a
                href={`/post/${post.id}`}
                className="text-xl font-semibold text-blue-600 hover:underline"
              >
                {post.title}
              </a>
              <div className="text-gray-500 text-sm mt-2">
                {post.category || "Không có danh mục"} •{" "}
                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
              </div>
              <div className="mt-2 text-gray-700 whitespace-pre-line" style={{ minHeight: '120px', maxHeight: '600px', overflow: 'auto' }}>
                {post.content?.replace(/<[^>]+>/g, "") || ""}
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors flex items-center gap-2"
                  onClick={() => window.location.href = `/edit/${post.id}`}
                >
                  <i className="fa-solid fa-pen-to-square"></i>Chỉnh sửa
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
                  onClick={async () => {
                    if (window.confirm("Bạn có chắc muốn xoá bài viết này?")) {
                      try {
                        await axios.delete(`/posts/${post.id}`);
                        setPosts((prev) => prev.filter((p) => p.id !== post.id));
                      } catch {
                        alert("Xoá bài viết thất bại!");
                      }
                    }
                  }}
                >
                  <i className="fa-solid fa-trash"></i>Xoá bài viết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
