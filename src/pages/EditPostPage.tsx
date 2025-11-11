import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../config/axios";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Lấy dữ liệu bài viết hiện tại
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/posts/${id}`);
        const post = res.data;
        setTitle(post.title);
        setCategory(post.category);
        setTags(post.tags.join(", "));
        setContent(post.content);
      } catch {
        setSuccess("Không thể tải bài viết!");
      }
    };
    if (id) fetchPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess("");
    try {
      await axios.put(`/posts/${id}`, {
        title,
        category,
        tags: tags.split(",").map(t => t.trim()),
        content,
      });
      setSuccess("Cập nhật bài viết thành công!");
      setTimeout(() => navigate(`/posts/${id}`), 1200);
    } catch {
      setSuccess("Cập nhật bài viết thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
            Chỉnh sửa bài viết
          </h2>
          <p className="text-gray-600">Cập nhật nội dung, tiêu đề, danh mục, tags cho bài viết của bạn.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Tiêu đề bài viết</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition-all duration-300 text-lg font-medium hover:border-gray-300"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Danh mục</label>
              <select
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              >
                <option value="">Chọn danh mục</option>
                <option value="Công nghệ">Công nghệ</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Du lịch">Du lịch</option>
                <option value="Ẩm thực">Ẩm thực</option>
                <option value="Giáo dục">Giáo dục</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="blogging, tips, technology..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Nội dung bài viết (Markdown)</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Cập nhật nội dung bài viết của bạn ở đây... Hỗ trợ Markdown!"
              rows={12}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none resize-none"
              required
            ></textarea>
          </div>
          <div className="flex gap-4 pt-6">
            <button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật bài viết"}
            </button>
          </div>
        </form>
        {success && <div className="mt-4 p-3 bg-green-50 text-green-700 rounded">{success}</div>}
      </div>
    </div>
  );
}
