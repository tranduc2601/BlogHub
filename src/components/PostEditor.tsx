import { useState } from "react";
import axios from "../config/axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast from "react-hot-toast";

export default function PostEditor() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [tagError, setTagError] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTagError("");
    // Process tags: remove # if present, split by comma
    const tagArr = tags
      .split(",")
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t);
    
    setIsLoading(true);
    try {
      // Gửi bài viết lên backend
      const response = await axios.post("/posts", {
        title,
        category,
        tags: tagArr,
        content,
      });
      if (response.data.success) {
        toast.success("Đăng bài viết thành công!");
        // Reset tất cả các trường nhập liệu
        setTitle("");
        setCategory("");
        setTags("");
        setContent("");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Đăng bài viết thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#2563eb', fontFamily: 'Inter, Arial, sans-serif' }}>
            Tạo bài viết mới
          </h2>
          <p className="text-gray-600">Chia sẻ ý tưởng và câu chuyện của bạn với cộng đồng</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-base font-semibold text-gray-700">Tiêu đề bài viết</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-lg font-medium hover:border-gray-300"
              required
            />
          </div>

          {/* Category/Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-base font-semibold text-gray-700">Danh mục</label>
              <select
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 hover:border-gray-300 cursor-pointer"
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
              <label className="text-base font-semibold text-gray-700">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="#Blogging, #Tips, #Technology..."
                className={`w-full p-4 border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 hover:border-gray-300 ${tagError ? 'border-red-500' : 'border-gray-200'}`}
              />
              {tagError && (
                <p className="text-red-500 text-sm mt-1">{tagError}</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-base font-semibold text-gray-700">Nội dung bài viết ( Rich Text Document )</label>
            <ReactQuill
              value={content}
              onChange={setContent}
              theme="snow"
              className="bg-white rounded-xl"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-white border-2 border-blue-500 text-blue-700 py-4 px-8 rounded-xl font-bold shadow-md transition-all duration-300 flex items-center justify-center gap-3 text-lg cursor-pointer hover:scale-101 hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-700"
              disabled={isLoading}
              style={{ fontFamily: 'Inter, Arial, sans-serif' }}
            >
              <i className="fa-solid fa-paper-plane mr-2"></i>
              {isLoading ? "Đang đăng..." : "Đăng bài viết"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
