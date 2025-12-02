/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import axios from "@/core/config/axios";
import toast from "react-hot-toast";
import DeleteAccountModal from "@/shared/ui/DeleteAccountModal";

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
  const { userId } = useParams<{ userId: string }>();
  const { user, checkAuth } = useAuth();
  const token = localStorage.getItem("token");
  const currentUser = user as ExtendedUser | null;
  const isViewingOwnProfile = !userId || (currentUser && userId === String(currentUser.id));

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
  const [viewedUser, setViewedUser] = useState<ExtendedUser | null>(null);
  const displayUser = isViewingOwnProfile ? currentUser : viewedUser;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const fetchFollowerCounts = async (targetUserId?: number) => {
    const userIdToFetch = targetUserId || currentUser?.id;
    if (!userIdToFetch) return;
    
    try {
      const countsResponse = await axios.get(`/users/${userIdToFetch}/follower-counts`);
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
      if (userId) {
        try {
          const response = await axios.get(`/users/${userId}`);
          if (response.data.success && response.data.user) {
            const userData = response.data.user;

            const userName = userData.username || userData.name || '';
            const userObj: ExtendedUser = {
              id: userData.id,
              username: userName,
              email: userData.email,
              avatarUrl: userData.avatarUrl,
              about: userData.about,
              websites: userData.websites
            };
            setViewedUser(userObj);
            setName(userName);
            setEmail(userData.email || "");
            setAbout(userData.about || "");
            setWebsites(userData.websites || [""]);
            setAvatar(userData.avatarUrl || undefined);
            fetchFollowerCounts(Number(userId));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Không thể tải thông tin người dùng');
        }
      } else {
        try {
          const response = await axios.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.data.success && response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            fetchFollowerCounts(response.data.user.id);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    if ((token && currentUser?.id) || userId) {
      fetchUserData();
    }

  }, [userId]);


  useEffect(() => {
    const targetUserId = userId ? Number(userId) : currentUser?.id;
    if (targetUserId) {
      fetchFollowerCounts(targetUserId);
    }

  }, [currentUser?.id, userId]);

  useEffect(() => {

    if (isViewingOwnProfile && currentUser && !userId) {
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
  }, [currentUser, isViewingOwnProfile, userId]);

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
    const targetUserId = userId || currentUser?.id;
    if (targetUserId) {
      navigate(`/follow-list?type=followers&userId=${targetUserId}`);
    }
  };

  const handleShowFollowing = () => {
    const targetUserId = userId || currentUser?.id;
    if (targetUserId) {
      navigate(`/follow-list?type=following&userId=${targetUserId}`);
    }
  };

  const handleDeleteAccount = async (password: string) => {
    try {
      const response = await axios.delete('/auth/delete-account', {
        data: { password },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Tài khoản đã được xóa thành công!', {
          duration: 3000,
          icon: '✅'
        });
        

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
    } catch (error: unknown) {
      console.error('Delete account error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'Lỗi khi xóa tài khoản';
        toast.error(errorMsg, {
          duration: 4000,
          icon: '❌'
        });
      } else {
        toast.error('Lỗi khi xóa tài khoản', {
          duration: 4000,
          icon: '❌'
        });
      }
      throw error;
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto mt-4 md:mt-10 p-6 md:p-10 bg-white rounded-2xl shadow-xl select-none">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
          {isViewingOwnProfile ? 'Chỉnh sửa hồ sơ của bạn' : `Hồ sơ của ${displayUser?.username || 'người dùng'}`}
        </h2>
        <p className="mb-6 text-sm md:text-base text-gray-600 text-center px-2">
          {isViewingOwnProfile 
            ? 'Hồ sơ của bạn là cách mà người dùng khác nhìn thấy bạn trên toàn bộ trang web. Bạn có thể quyết định cung cấp bao nhiêu thông tin.'
            : 'Thông tin hồ sơ của người dùng này.'}
        </p>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
          <div className="flex flex-col items-center gap-4 w-full md:w-auto">

            {avatar ? (
              <img
                src={avatar}
                alt="User avatar"
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                draggable={false}
              />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-3xl md:text-4xl border-4 border-blue-500 shadow-lg">
                {(displayUser?.username || name).trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
              </div>
            )}
            
            
            <div className="flex gap-4 md:gap-6 text-center">
              <div 
                className="cursor-pointer hover:bg-blue-50 p-2 md:p-3 rounded-lg transition-colors"
                onClick={handleShowFollowers}
              >
                <div className="text-xl md:text-2xl font-bold text-blue-600">{followerCounts.followers}</div>
                <div className="text-xs md:text-sm text-gray-500">Người theo dõi</div>
              </div>
              <div 
                className="cursor-pointer hover:bg-blue-50 p-2 md:p-3 rounded-lg transition-colors"
                onClick={handleShowFollowing}
              >
                <div className="text-xl md:text-2xl font-bold text-blue-600">{followerCounts.following}</div>
                <div className="text-xs md:text-sm text-gray-500">Đang theo dõi</div>
              </div>
            </div>
            
            {isViewingOwnProfile && (
              <>
                <button
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-200 hover:cursor-pointer transition-all duration-200 shadow hover:shadow-lg hover:scale-105 w-full md:w-auto text-sm md:text-base"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="fa-solid fa-upload"></i> <span>Chọn ảnh</span>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </>
            )}
          </div>

          <div className="flex-1 space-y-4 md:space-y-6 w-full">
            <div>
              <label className="block font-semibold mb-1 text-sm md:text-base"><i className="fa-solid fa-user mr-2"></i>Họ và tên</label>
              <input
                type="text"
                className="w-full p-2.5 md:p-3 rounded-xl bg-gray-50 border-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:border-3 focus:ring-blue-100 transition-all duration-200 outline-none text-sm md:text-base"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên mới..."
                disabled={!isViewingOwnProfile}
              />
            </div>

            <div>
              <label className="font-semibold mb-1 flex items-center gap-2 text-sm md:text-base">
                <span className="inline-block w-4 h-4 md:w-5 md:h-5 align-middle">
                  <i className="fa-solid fa-envelope"></i>
                </span>
                Email
              </label>
              <input
                type="email"
                className="w-full p-2.5 md:p-3 rounded-xl bg-gray-100 border-3 border-gray-200 shadow-sm focus:border-blue-400 focus:border-3 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none text-sm md:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email mới..."
                disabled={!isViewingOwnProfile}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-sm md:text-base"><i className="fa-solid fa-info-circle mr-2"></i>Thông tin về bạn</label>
              <textarea
                className="w-full p-2.5 md:p-3 rounded-xl bg-gray-50 border-3 border-gray-300 shadow-sm min-h-[80px] md:min-h-[100px] focus:border-blue-500 focus:border-3 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none text-sm md:text-base"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Nhập mô tả về bạn..."
                maxLength={100}
                disabled={!isViewingOwnProfile}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{about.length}/100 ký tự</div>
            </div>
          </div>
        </div>

        {isViewingOwnProfile && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-6 md:mt-8">
              <Link 
                to="/change-password"
                className="group inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 font-semibold border border-blue-200 hover:border-blue-300 shadow hover:shadow-lg text-sm md:text-base"
                title="Đổi mật khẩu"
              >
                <i className="fa-solid fa-key mr-1"></i>
                <span>Đổi mật khẩu</span>
              </Link>
              <button
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow text-sm md:text-base ${
                  !hasChanges() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer hover:shadow-xl hover:scale-105'
                }`}
                onClick={handleSave}
                disabled={isLoading || !hasChanges()}
                title={isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              >
                <i className="fa-solid fa-floppy-disk mr-1"></i>
                <span>{isLoading ? "Đang lưu..." : "Lưu thay đổi"}</span>
              </button>
            </div>


            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 md:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-triangle-exclamation text-red-600"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-1">Vùng nguy hiểm</h3>
                    <p className="text-sm text-red-700">
                      Xóa tài khoản của bạn sẽ xóa vĩnh viễn tất cả dữ liệu. Thao tác này không thể hoàn tác.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="group w-full sm:w-auto px-6 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 hover:shadow-xl hover:scale-105 transition-all duration-200 text-sm md:text-base cursor-pointer"
                >
                  <i className="fa-solid fa-trash mr-2 group-hover:animate-pulse"></i>
                  Xóa tài khoản vĩnh viễn
                </button>
              </div>
            </div>
          </>
        )}
      </div>


      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </>
  );
}
