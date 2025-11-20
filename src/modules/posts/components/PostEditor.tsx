import { useState, useRef, useEffect } from "react";
import axios from "@/core/config/axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast from "react-hot-toast";

export default function PostEditor() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [tagError, setTagError] = useState("");
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState<'public' | 'private' | 'followers'>('public');
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const privacyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (privacyMenuRef.current && !privacyMenuRef.current.contains(event.target as Node)) {
        setShowPrivacyMenu(false);
      }
    };

    if (showPrivacyMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPrivacyMenu]);

  const isFormValid = () => {
    const hasTitle = title.trim().length > 0;
    const hasCategory = category.trim().length > 0;
    const hasContent = content.trim().length > 0;
    return hasTitle && hasCategory && hasContent;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter' && isFormValid() && !isLoading) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTagError("");
    const tagArr = tags
      .split(",")
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t);
    const uniqueTags = new Set(tagArr.map(tag => tag.toLowerCase()));
    if (uniqueTags.size !== tagArr.length) {
      setTagError("Các tags của bài viết không được trùng lặp!");
      toast.error("Các tags của bài viết không được trùng lặp!");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post("/posts", {
        title,
        category,
        tags: tagArr,
        content,
        privacy,
      });
      if (response.data.success) {
        toast.success(response.data.message || "Bài viết đã được gửi và đang chờ admin duyệt!");
        setTitle("");
        setCategory("");
        setTags("");
        setContent("");
        setTimeout(() => {
          window.location.href = "/my-posts";
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Đăng bài viết thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto select-none">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#2563eb', fontFamily: 'Inter, Arial, sans-serif' }}>
              Tạo bài viết mới
            </h2>
            <p className="text-gray-600">Hãy chia sẻ ý tưởng và câu chuyện của bạn với cộng đồng</p>
          </div>
          
          {/* Privacy Menu */}
          <div className="relative" ref={privacyMenuRef}>
            <button
              type="button"
              onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
              className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
              title="Cài đặt quyền riêng tư"
            >
              <i className="fa-regular fa-ellipsis-vertical text-xl text-gray-700"></i>
            </button>

            {showPrivacyMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500">
                  <h3 className="text-white font-semibold text-sm">Quyền riêng tư bài viết</h3>
                </div>
                
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPrivacy('public');
                      setShowPrivacyMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-start gap-3 ${
                      privacy === 'public' ? 'bg-blue-50 border-2 border-blue-500' : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <i className={`fa-solid fa-globe text-lg mt-0.5 ${privacy === 'public' ? 'text-blue-600' : 'text-gray-600'}`}></i>
                    <div className="flex-1">
                      <div className={`font-semibold ${privacy === 'public' ? 'text-blue-700' : 'text-gray-800'}`}>
                        Công khai
                      </div>
                      <div className="text-xs text-gray-500">Tất cả mọi người có thể xem</div>
                    </div>
                    {privacy === 'public' && (
                      <i className="fa-solid fa-check text-blue-600 mt-1"></i>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPrivacy('followers');
                      setShowPrivacyMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-start gap-3 mt-2 ${
                      privacy === 'followers' ? 'bg-blue-50 border-2 border-blue-500' : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <i className={`fa-solid fa-user-group text-lg mt-0.5 ${privacy === 'followers' ? 'text-blue-600' : 'text-gray-600'}`}></i>
                    <div className="flex-1">
                      <div className={`font-semibold ${privacy === 'followers' ? 'text-blue-700' : 'text-gray-800'}`}>
                        Người theo dõi
                      </div>
                      <div className="text-xs text-gray-500">Chỉ người theo dõi bạn mới xem được</div>
                    </div>
                    {privacy === 'followers' && (
                      <i className="fa-solid fa-check text-blue-600 mt-1"></i>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPrivacy('private');
                      setShowPrivacyMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-start gap-3 mt-2 ${
                      privacy === 'private' ? 'bg-blue-50 border-2 border-blue-500' : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <i className={`fa-solid fa-lock text-lg mt-0.5 ${privacy === 'private' ? 'text-blue-600' : 'text-gray-600'}`}></i>
                    <div className="flex-1">
                      <div className={`font-semibold ${privacy === 'private' ? 'text-blue-700' : 'text-gray-800'}`}>
                        Riêng tư
                      </div>
                      <div className="text-xs text-gray-500">Chỉ mình bạn có thể xem</div>
                    </div>
                    {privacy === 'private' && (
                      <i className="fa-solid fa-check text-blue-600 mt-1"></i>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          
          <div className="space-y-2">
            <label className="text-base font-semibold text-gray-700">Tiêu đề bài viết</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
              className="w-full p-4 border-3 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-lg font-medium hover:border-gray-300"
              required
            />
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-base font-semibold text-gray-700">Danh mục</label>
              <select
                className="w-full p-4 border-3 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 hover:border-gray-300 cursor-pointer"
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
                placeholder="Blogging, Tips, Technology..."
                className={`w-full p-4 border-3 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 hover:border-gray-300 ${tagError ? 'border-red-500' : 'border-gray-200'}`}
              />
              {tagError && (
                <p className="text-red-500 text-sm mt-1">{tagError}</p>
              )}
            </div>
          </div>

          
          <div className="space-y-2">
            <label className="text-base font-semibold text-gray-700">Nội dung bài viết </label>
            <ReactQuill
              value={content}
              onChange={setContent}
              theme="snow"
              className="bg-white rounded-xl"
            />
          </div>
      
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className={`flex-1 bg-white border-3 border-blue-500 text-blue-700 py-4 px-8 rounded-xl font-bold shadow-md transition-all duration-300 flex items-center justify-center gap-3 text-lg ${
                isFormValid() && !isLoading
                  ? 'cursor-pointer hover:scale-101 hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-700'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={isLoading || !isFormValid()}
              style={{ fontFamily: 'Inter, Arial, sans-serif' }}
            >
              <i className="fa-solid fa-paper-plane"></i>
              {isLoading ? "Đang đăng..." : "Đăng bài viết"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
