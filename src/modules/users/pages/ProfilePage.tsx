import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import axios from "@/core/config/axios";
import toast from "react-hot-toast";

interface ExtendedUser {
  id: number;
  username: string;
  email?: string;
  avatarUrl?: string;
  about?: string;
  websites?: string[];
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const token = localStorage.getItem("token");
  const currentUser = user as ExtendedUser | null;

  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [about, setAbout] = useState("");
  const [name, setName] = useState(currentUser?.username || "");
  const [websites, setWebsites] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(currentUser?.email || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [followerCounts, setFollowerCounts] = useState({ followers: 0, following: 0 });
  const [originalValues, setOriginalValues] = useState({
    name: "",
    email: "",
    about: "",
    websites: [""],
    avatar: undefined as string | undefined
  });
  
  const fetchFollowerCounts = async () => {
    if (!currentUser?.id) return;
    
    try {
      const countsResponse = await axios.get(`/users/${currentUser.id}/follower-counts`);
      if (countsResponse.data.success) {
        setFollowerCounts({
          followers: countsResponse.data.followers,
          following: countsResponse.data.following
        });
      }
    } catch (error) {
      console.error('Error fetching follower counts:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.success && response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          const countsResponse = await axios.get(`/users/${response.data.user.id}/follower-counts`);
          if (countsResponse.data.success) {
            setFollowerCounts({
              followers: countsResponse.data.followers,
              following: countsResponse.data.following
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (token && currentUser?.id) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh follower counts when returning to this page
  useEffect(() => {
    fetchFollowerCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      const userName = currentUser.username;
      const userEmail = currentUser.email || "";
      const userAbout = currentUser.about || "";
      const userWebsites = currentUser.websites || [""];
      const userAvatar = currentUser.avatarUrl || undefined;

      setName(userName);
      setEmail(userEmail);
      setAbout(userAbout);
      setWebsites(userWebsites);
      setAvatar(userAvatar);
      setOriginalValues({
        name: userName,
        email: userEmail,
        about: userAbout,
        websites: userWebsites,
        avatar: userAvatar
      });
    }
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const hasChanges = () => {
    if (avatarFile) return true;
    if (name !== originalValues.name) return true;
    if (email !== originalValues.email) return true;
    if (about !== originalValues.about) return true;
    const websitesArray = Array.isArray(websites) ? websites : [];
    const origWebsitesArray = Array.isArray(originalValues.websites) ? originalValues.websites : [];
    const currentWebsites = websitesArray.filter(w => w.trim() !== "");
    const origWebsites = origWebsitesArray.filter(w => w.trim() !== "");
    if (currentWebsites.length !== origWebsites.length) return true;
    for (let i = 0; i < currentWebsites.length; i++) {
      if (currentWebsites[i] !== origWebsites[i]) return true;
    }
    
    return false;
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", name);
      formData.append("email", email);
      formData.append("about", about || "");
      if (avatarFile) formData.append("avatar", avatarFile);
      const websitesArray = Array.isArray(websites) ? websites : [];
      websitesArray
        .filter((w) => w.trim() !== "")
        .forEach((w, idx) => formData.append(`websites[${idx}]`, w));

      const res = await axios.put("/auth/me", formData);

      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        const updatedUser = res.data.user;
        setName(updatedUser.username);
        setEmail(updatedUser.email || "");
        setAbout(updatedUser.about || "");
        setWebsites(updatedUser.websites || [""]);
        const newAvatarUrl = updatedUser.avatarUrl || undefined;
        setAvatar(newAvatarUrl);
        setOriginalValues({
          name: updatedUser.username,
          email: updatedUser.email || "",
          about: updatedUser.about || "",
          websites: updatedUser.websites || [""],
          avatar: newAvatarUrl
        });
        setAvatarFile(null);
        checkAuth();
      }

      toast.success("Cập nhật hồ sơ thành công!", {
        duration: 3000,
        position: 'top-right',
      });
    } catch (error: unknown) {
      console.error("Profile update error:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Lỗi không xác định";
      toast.error("Cập nhật thất bại! " + errorMsg, {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowFollowers = () => {
    if (currentUser?.id) {
      navigate(`/follow-list?type=followers&userId=${currentUser.id}`);
    }
  };

  const handleShowFollowing = () => {
    if (currentUser?.id) {
      navigate(`/follow-list?type=following&userId=${currentUser.id}`);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl select-none">
        <h2 className="text-3xl font-bold mb-2 text-center">Chỉnh sửa hồ sơ của bạn</h2>
        <p className="mb-6 text-gray-600 text-center">
          Hồ sơ của bạn là cách mà người dùng khác nhìn thấy bạn trên toàn bộ trang web. Bạn có thể quyết định cung cấp bao nhiêu thông tin.
        </p>

        <div className="flex gap-8 items-start">
          <div className="flex flex-col items-center gap-4">

            {avatar ? (
              <img
                src={avatar}
                alt="User avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-4xl border-4 border-blue-500 shadow-lg">
                {name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
              </div>
            )}
            
            
            <div className="flex gap-4 text-center">
              <div 
                className="cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-colors"
                onClick={handleShowFollowers}
              >
                <div className="text-2xl font-bold text-blue-600">{followerCounts.followers}</div>
                <div className="text-xs text-gray-500">Người theo dõi</div>
              </div>
              <div 
                className="cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-colors"
                onClick={handleShowFollowing}
              >
                <div className="text-2xl font-bold text-blue-600">{followerCounts.following}</div>
                <div className="text-xs text-gray-500">Đang theo dõi</div>
              </div>
            </div>
            
            <button
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-200 hover:cursor-pointer transition-all duration-200 shadow hover:shadow-lg hover:scale-105"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fa-solid fa-upload mr-1"></i> Chọn ảnh
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <label className="block font-semibold mb-1">Họ và tên</label>
              <input
                type="text"
                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên mới..."
              />
            </div>

            <div>
              <label className="font-semibold mb-1 flex items-center gap-2">
                <span className="inline-block w-5 h-5 align-middle">
                  <i className="fa-light fa-envelope"></i>
                </span>
                Email
              </label>
              <input
                type="email"
                className="w-full p-3 rounded-xl bg-gray-100 border border-gray-200 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email mới..."
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Thông tin về bạn</label>
              <textarea
                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-300 shadow-sm min-h-[100px] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Nhập mô tả về bạn..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-3 mt-8">
          <Link 
            to="/change-password"
            className="group inline-flex items-center gap-0 hover:gap-2 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 font-semibold border border-blue-200 hover:border-blue-300 shadow hover:shadow-lg"
            title="Đổi mật khẩu"
          >
            <i className="fa-solid fa-key"></i>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">Đổi mật khẩu</span>
          </Link>
          <button
            className={`inline-flex items-center gap-0 px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow ${
              !hasChanges() || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'group bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer hover:shadow-xl hover:scale-105 hover:gap-2'
            }`}
            onClick={handleSave}
            disabled={isLoading || !hasChanges()}
            title={isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          >
            <i className="fa-solid fa-floppy-disk"></i>
            <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ml-0 ${
              !hasChanges() || isLoading ? 'max-w-0' : 'max-w-0 group-hover:max-w-xs group-hover:ml-2'
            }`}>
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
