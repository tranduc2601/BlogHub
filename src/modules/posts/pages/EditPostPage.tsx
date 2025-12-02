import { useEffect, useState, useRef, useMemo } from "react";
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
  const [privacy, setPrivacy] = useState<'public' | 'private' | 'followers'>('public');
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalCategory, setOriginalCategory] = useState("");
  const [originalTags, setOriginalTags] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [originalPrivacy, setOriginalPrivacy] = useState<'public' | 'private' | 'followers'>('public');
  const privacyMenuRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<ReactQuill>(null);

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    

    value = value.replace(/[^a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ,]/g, '');
    

    const parts = value.split(',');
    const formattedParts = parts.map((part, index) => {

      part = part.trim();

      return index < parts.length - 1 ? part + ', ' : part;
    });
    
    value = formattedParts.join('');
    

    if (value.startsWith(',') || value.startsWith(' ')) {
      value = value.trimStart().replace(/^,+/, '');
    }
    

    value = value.replace(/,+/g, ',');
    
    setTags(value);
    if (tagError) setTagError('');
  };

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


  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;


      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB!');
        return;
      }


      if (!file.type.startsWith('image/')) {
        toast.error('Chỉ chấp nhận file ảnh!');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      setIsUploadingImage(true);
      const loadingToast = toast.loading('Đang tải ảnh lên...');

      try {
        const response = await axios.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const uploadData = response.data as { success?: boolean; url?: string };
        if (uploadData.success) {
          const imageUrl = uploadData.url;
          

          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', imageUrl);
            quill.setSelection(range.index + 1, 0);
          }

          toast.success('Tải ảnh lên thành công!', { id: loadingToast });
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
        toast.error('Tải ảnh lên thất bại!', { id: loadingToast });
      } finally {
        setIsUploadingImage(false);
      }
    };
  };


  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image', 'video'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align',
  ];

  useEffect(() => {
    const fetchPost = async () => {
      setLoadingPost(true);
      try {
        const res = await axios.get(`/posts/${id}`);
        const resData = res.data as { post?: { title?: string; category?: string; content?: string; privacy?: string; tags?: string[]; authorId?: number } };
        const post = resData.post || res.data as { title?: string; category?: string; content?: string; privacy?: string; tags?: string[]; authorId?: number };
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
        const postPrivacy = (post.privacy || 'public') as 'public' | 'private' | 'followers';
        
        setTitle(postTitle);
        setCategory(postCategory);
        setContent(postContent);
        setPrivacy(postPrivacy);
        setOriginalTitle(postTitle);
        setOriginalCategory(postCategory);
        setOriginalPrivacy(postPrivacy);
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
        console.error('Error loading post:', error);
        
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
  

  const normalizeContent = (str: string) => {
    if (!str) return '';
    
    return str

      .replace(/<p><br\s*\/?><\/p>/gi, '')
      .replace(/<p>\s*<\/p>/gi, '')

      .replace(/\s+/g, ' ')

      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

      .trim();
  };
  

  useEffect(() => {
    if (content && !originalContent && !loadingPost) {
      setOriginalContent(normalizeContent(content));
    }
  }, [content, originalContent, loadingPost]);
  
  const hasChanges = 
    title.trim() !== originalTitle.trim() ||
    category !== originalCategory ||
    tags.trim() !== originalTags.trim() ||
    privacy !== originalPrivacy ||
    normalizeContent(content) !== originalContent;

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
      setTagError("Các thẻ không được trùng lặp!");
      toast.error("Các thẻ không được trùng lặp!");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.put(`/posts/${id}`, {
        title,
        category,
        tags: tagArr,
        content,
        privacy,
      });
      const updateData = response.data as { success?: boolean; message?: string };
      if (updateData.success) {
        toast.success("Cập nhật bài viết thành công!");
        setTimeout(() => navigate(`/post/${id}`), 1500);
      } else {
        toast.error(updateData.message || "Cập nhật bài viết thất bại!");
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-[#2664eb] bg-clip-text text-transparent mb-2">
              Chỉnh sửa bài viết
            </h2>
            <p className="text-gray-600">Cập nhật nội dung, tiêu đề, danh mục, thẻ cho bài viết của bạn!</p>
          </div>
          

          <div className="relative" ref={privacyMenuRef}>
            <button
              type="button"
              onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
              className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 cursor-pointer"
              title="Cài đặt quyền riêng tư"
            >
              <i className={`text-xl text-gray-700 fa-solid ${
                privacy === 'public' ? 'fa-globe' : 
                privacy === 'followers' ? 'fa-user-group' : 
                'fa-lock'
              }`}></i>
            </button>

            {showPrivacyMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
                <div className="p-3 bg-[#2664eb]">
                  <h3 className="text-white font-semibold text-sm">Quyền riêng tư bài viết</h3>
                </div>
                
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPrivacy('public');
                      setShowPrivacyMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-start gap-3 cursor-pointer group ${
                      privacy === 'public' 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-500 shadow-md' 
                        : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-2 border-transparent hover:border-blue-300 hover:shadow-lg hover:scale-[1.02]'
                    }`}
                  >
                    <i className={`fa-solid fa-globe text-lg mt-0.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 ${privacy === 'public' ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-500'}`}></i>
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
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-start gap-3 mt-2 cursor-pointer group ${
                      privacy === 'followers' 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-500 shadow-md' 
                        : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 border-2 border-transparent hover:border-green-300 hover:shadow-lg hover:scale-[1.02]'
                    }`}
                  >
                    <i className={`fa-solid fa-user-group text-lg mt-0.5 transition-transform duration-300 group-hover:scale-110 ${privacy === 'followers' ? 'text-blue-600' : 'text-gray-600 group-hover:text-green-500'}`}></i>
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
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-start gap-3 mt-2 cursor-pointer group ${
                      privacy === 'private' 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-500 shadow-md' 
                        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-100 border-2 border-transparent hover:border-gray-400 hover:shadow-lg hover:scale-[1.02]'
                    }`}
                  >
                    <i className={`fa-solid fa-lock text-lg mt-0.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${privacy === 'private' ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-700'}`}></i>
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
              <label className="text-sm font-semibold text-gray-700">Thẻ</label>
              <input
                type="text"
                value={tags}
                onChange={handleTagsChange}
                placeholder="Blogging, Tips, Technology..."
                className={`w-full p-4 border-3 rounded-xl focus:border-[#2664eb] focus:outline-none transition-all duration-300 hover:border-gray-300 ${tagError ? 'border-red-500' : 'border-gray-200'}`}
              />
              {tagError && (
                <p className="text-red-500 text-sm mt-1">{tagError}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Nội dung bài viết
              {isUploadingImage && (
                <span className="ml-3 text-sm text-blue-600">
                  <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                  Đang tải ảnh lên...
                </span>
              )}
            </label>
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 focus-within:border-yellow-500 transition-all duration-300">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Cập nhật nội dung bài viết của bạn ở đây..."
                className="bg-white"
                style={{ minHeight: '300px' }}
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
