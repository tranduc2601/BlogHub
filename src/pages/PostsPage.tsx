import { useEffect, useState } from "react";
import axios from "../config/axios";
import PostCard from "../components/Postcard";
import type { Post } from "../data/mockData";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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
      <h2 className="text-3xl font-bold mb-6">Các bài viết</h2>
      {posts.length === 0 ? (
        <div className="text-gray-600">Hiện tại không có bài viết nào. Hãy là người đầu tiên viết lên ý tưởng của bạn!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <div
              key={post.id}
              className="animate-fadeInUp"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <PostCard post={post} hideShare={true} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
