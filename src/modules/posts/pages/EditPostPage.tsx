import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "@/core/config/axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast from "react-hot-toast";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [tagError, setTagError] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalCategory, setOriginalCategory] = useState("");
  const [originalTags, setOriginalTags] = useState("");
  const [originalContent, setOriginalContent] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      setLoadingPost(true);
      try {
        const res = await axios.get(`/posts/${id}`);
        
        const post = res.data.post || res.data;
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
        const currentUser = JSON.parse(userStr || "null");
        
        if (currentUser && post.authorId && currentUser.id !== post.authorId) {
          toast.error("Bạn không có quyền chỉnh sửa bài viết này!");
          navigate('/my-posts');
          return;
        }
        
        const postTitle = post.title || '';
        const postCategory = post.category || '';
        const postContent = post.content || '';
        
        setTitle(postTitle);
        setCategory(postCategory);
        setContent(postContent);
        setOriginalTitle(postTitle);
        setOriginalCategory(postCategory);
        setOriginalContent(postContent);
        let postTags = '';
        if (Array.isArray(post.tags)) {
          postTags = post.tags.join(", ");
        } else if (typeof post.tags === 'string') {
          try {
            const parsedTags = JSON.parse(post.tags);
            postTags = Array.isArray(parsedTags) ? parsedTags.join(", ") : post.tags;
          } catch {
            postTags = post.tags;
          }
        } else {
          postTags = '';
        }
        
        setTags(postTags);
        setOriginalTags(postTags);
      } catch (error) {
        console.error('❌ Error loading post:', error);
        
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number; data?: unknown; statusText?: string } };
          console.error('Response status:', axiosError.response?.status);
          console.error('Response statusText:', axiosError.response?.statusText);
          console.error('Response data:', axiosError.response?.data);
          
          if (axiosError.response?.status === 404) {
            console.error('404: Bài viết không tồn tại');
            toast.error("Bài viết không tồn tại hoặc đã bị xóa!");
          } else {
            console.error('Other error:', axiosError.response?.status);
            toast.error("Không thể tải bài viết!");
          }
        } else {
          console.error('Non-axios error:', error);
          toast.error("Không thể tải bài viết!");
        }
        setTimeout(() => {
          navigate('/my-posts');
        }, 2000);
      } finally {
        setLoadingPost(false);
      }
    };
    if (id) fetchPost();
  }, [id, navigate]);
  
  // Normalize content để tránh false positive từ ReactQuill
  const normalizeContent = (str: string) => {
    return str.replace(/<p><br><\/p>/g, '').replace(/<p>\s*<\/p>/g, '').trim();
  };
  
  const hasChanges = 
    title.trim() !== originalTitle.trim() ||
    category !== originalCategory ||
    tags.trim() !== originalTags.trim() ||
    normalizeContent(content) !== normalizeContent(originalContent);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter' && hasChanges && !isLoading) {
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
      setTagError("Các tags không được trùng lặp!");
      toast.error("Các tags không được trùng lặp!");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.put(`/posts/${id}`, {
        title,
        category,
        tags: tagArr,
        content,
      });
      
      if (response.data.success) {
        toast.success("Cập nhật bài viết thành công!");
        setTimeout(() => navigate(`/post/${id}`), 1500);
      } else {
        toast.error(response.data.message || "Cập nhật bài viết thất bại!");
      }
    } catch (error) {
      console.error('Update error:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Cập nhật bài viết thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto select-none">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-[#2664eb] bg-clip-text text-transparent mb-2">
            Chỉnh sửa bài viết
          </h2>
          <p className="text-gray-600">Cập nhật nội dung, tiêu đề, danh mục, tags cho bài viết của bạn.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Tiêu đề bài viết</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
              className="w-full p-4 border-3 border-gray-200 rounded-xl focus:border-[#2664eb] focus:outline-none transition-all duration-300 text-lg font-medium hover:border-gray-300"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Danh mục</label>
              <select
                className="w-full p-4 border-3 border-gray-200 rounded-xl focus:border-[#2664eb] focus:outline-none transition-all duration-300 hover:border-gray-300 cursor-pointer"
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
                placeholder="Blogging, Tips, Technology..."
                className={`w-full p-4 border-3 rounded-xl focus:border-[#2664eb] focus:outline-none transition-all duration-300 hover:border-gray-300 ${tagError ? 'border-red-500' : 'border-gray-200'}`}
              />
              {tagError && (
                <p className="text-red-500 text-sm mt-1">{tagError}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Nội dung bài viết</label>
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 focus-within:border-yellow-500 transition-all duration-300">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                placeholder="Cập nhật nội dung bài viết của bạn ở đây..."
                className="bg-white"
                style={{ minHeight: '300px' }}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['link', 'image'],
                    ['clean']
                  ],
                }}
              />
            </div>
          </div>
          <div className="flex gap-4 pt-6">
            <button 
              type="submit"
              className={`flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 transform shadow-lg ${
                hasChanges && !isLoading
                  ? 'bg-[#2664eb] text-white hover:scale-105 hover:shadow-xl cursor-pointer'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
              }`}
              disabled={isLoading || !hasChanges}
            >
              <i className="fa-solid fa-floppy-disk mr-2"></i>
              {isLoading ? "Đang cập nhật..." : "Cập nhật bài viết"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
