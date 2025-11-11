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
        console.log("API Response:", res.data);
        if (res.data.success && Array.isArray(res.data.posts)) {
          console.log("Posts received:", res.data.posts);
          setPosts(res.data.posts);
        } else {
          console.log("No posts array in response");
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

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 select-none">
      <h2 className="text-3xl font-bold mb-6">Khám phá bài viết</h2>
      {posts.length === 0 ? (
        <div className="text-gray-600">Không có bài viết nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
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
    </div>
  );
}
