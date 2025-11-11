/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../config/axios";

interface ExtendedUser {
  id: number;
  username: string;
  email?: string;
  avatarUrl?: string;
  about?: string;
  websites?: string[];
}

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const token = localStorage.getItem("token");
  const currentUser = user as ExtendedUser | null;

  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [about, setAbout] = useState("");
  const [name, setName] = useState(currentUser?.username || "");
  const [websites, setWebsites] = useState<string[]>([""]);
  const [success, setSuccess] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const notifTimeout = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(currentUser?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.username);
      setEmail(currentUser.email || "");
      setAbout(currentUser.about || "");
      setWebsites(currentUser.websites || [""]);
      if (currentUser.avatarUrl) {
        setAvatar(
          currentUser.avatarUrl.startsWith("http")
            ? currentUser.avatarUrl
            : `http://localhost:5000${currentUser.avatarUrl}`
        );
      } else {
        setAvatar(undefined);
      }
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

  const handleSave = async () => {
    setIsLoading(true);
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("username", name);
      formData.append("about", about);
      if (avatarFile) formData.append("avatar", avatarFile);
      
      // Đảm bảo websites là mảng trước khi filter
      const websitesArray = Array.isArray(websites) ? websites : [];
      websitesArray
        .filter((w) => w.trim() !== "")
        .forEach((w, idx) => formData.append(`websites[${idx}]`, w));
      
      if (newPassword.trim().length > 0) formData.append("password", newPassword);

      const res = await axios.put("/auth/me", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        await checkAuth();
      }

      setSuccess("Cập nhật hồ sơ thành công!");
      setShowNotif(true);
      if (notifTimeout.current) clearTimeout(notifTimeout.current);
      notifTimeout.current = setTimeout(() => setShowNotif(false), 2000);
    } catch (error: unknown) {
      console.error("Profile update error:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Lỗi không xác định";
      setSuccess("Cập nhật thất bại! " + errorMsg);
      setShowNotif(true);
      if (notifTimeout.current) clearTimeout(notifTimeout.current);
      notifTimeout.current = setTimeout(() => setShowNotif(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed top-25 right-8 z-50 transition-all duration-500 ${
          showNotif ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        } pointer-events-none`}
        style={{ minWidth: 320 }}
      >
        {success && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-base">
            <span className="text-2xl">
              <i className="fa-solid fa-circle-check"></i>
            </span>
            <span>{success}</span>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-2">Chỉnh sửa hồ sơ của bạn</h2>
        <p className="mb-6 text-gray-600">
          Hồ sơ của bạn là cách mà người dùng khác nhìn thấy bạn trên toàn bộ
          trang web. Bạn có thể quyết định cung cấp bao nhiêu thông tin.
        </p>

        <div className="flex gap-8 items-start">
          <div className="flex flex-col items-center gap-4">
            <img
              src={
                avatar
                  ? avatar
                  : "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(name)
              }
              alt="User avatar"
              className="w-28 h-28 rounded-full object-cover border border-gray-300"
            />
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
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full p-3 rounded-xl bg-gray-100 border border-gray-200 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email mới..."
              />
            </div>


            {/* Input mật khẩu mới có icon con mắt */}
            <div className="relative">
              <label className="block font-semibold mb-1">Mật khẩu mới (nếu muốn đổi)</label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 pr-10 rounded-xl bg-gray-50 border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
              />
              <button
                type="button"
                className="absolute right-3 top-[40px] text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <i
                  className={`fa-solid ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  }`}
                ></i>
              </button>
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

        <div className="flex gap-3 mt-8">
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 hover:cursor-pointer transition-all duration-200 shadow hover:shadow-xl hover:scale-105"
            onClick={handleSave}
            disabled={isLoading}
          >
            <i className="fa-solid fa-floppy-disk mr-2.5"></i>
            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </>
  );
}
