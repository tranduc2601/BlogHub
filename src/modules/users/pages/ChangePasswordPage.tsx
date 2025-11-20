import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/core/config/axios";
import toast from "react-hot-toast";
import { Modal } from "@/shared/ui";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState<boolean | null>(null);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const validatePassword = (password: string): string => {
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase) {
      return "Mật khẩu phải có ít nhất 1 ký tự hoa";
    }
    if (!hasNumber) {
      return "Mật khẩu phải có ít nhất 1 chữ số";
    }
    if (!hasSpecialChar) {
      return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    }
    
    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else {
      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) {
        newErrors.newPassword = passwordError;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới không được trùng với mật khẩu hiện tại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Kiểm tra form có hợp lệ để enable/disable nút submit
  const isFormValid = (): boolean => {
    // Kiểm tra tất cả trường đã được điền
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      return false;
    }

    // Kiểm tra mật khẩu hiện tại có đúng không
    if (isCurrentPasswordValid !== true) {
      return false;
    }

    // Kiểm tra mật khẩu mới hợp lệ
    if (validatePassword(formData.newPassword) !== "") {
      return false;
    }

    // Kiểm tra mật khẩu xác nhận khớp với mật khẩu mới
    if (formData.newPassword !== formData.confirmPassword) {
      return false;
    }

    // Không kiểm tra mật khẩu hiện tại === mật khẩu mới ở đây
    // vì backend sẽ so sánh với hash trong database
    
    return true;
  };

  // Verify current password with backend
  const verifyCurrentPassword = async (password: string) => {
    if (!password) {
      setIsCurrentPasswordValid(null);
      return;
    }

    setIsCheckingPassword(true);
    try {
      const response = await axios.post("/auth/verify-current-password", {
        currentPassword: password,
      });

      if (response.data.success) {
        setIsCurrentPasswordValid(response.data.isValid);
      }
    } catch (error) {
      console.error("Verify password error:", error);
      setIsCurrentPasswordValid(false);
    } finally {
      setIsCheckingPassword(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Verify current password when user types
    if (name === "currentPassword") {
      // Clear previous timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      
      // Reset validation state
      setIsCurrentPasswordValid(null);
      
      // Debounce the verification
      if (value) {
        const timeoutId = setTimeout(() => {
          verifyCurrentPassword(value);
        }, 800);
        setDebounceTimeout(timeoutId);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmChange = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);

    try {
      const response = await axios.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data.success) {
        toast.success("Đổi mật khẩu thành công!", {
          duration: 3000,
          position: "top-right",
        });
        navigate("/profile");
      }
    } catch (error: unknown) {
      console.error("Change password error:", error);
      const errorMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Đổi mật khẩu thất bại!";
      toast.error(errorMsg, {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl select-none">
      <h2 className="text-3xl font-bold mb-2 text-center">Đổi mật khẩu</h2>
      <p className="mb-6 text-gray-600 text-center">
        Vui lòng nhập mật khẩu hiện tại và mật khẩu mới của bạn
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hidden username field for password managers */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          style={{ display: "none" }}
          aria-hidden="true"
          tabIndex={-1}
        />
        
        <div>
          <label className="block font-semibold mb-1">Mật khẩu hiện tại</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`w-full p-3 pr-10 rounded-xl bg-gray-50 shadow-sm focus:ring-2 border-3 focus:ring-blue-100 transition-all duration-200 outline-none ${
                errors.currentPassword
                  ? "border-red-500 border-3 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:border-3"
              }`}
              placeholder="Nhập mật khẩu hiện tại..."
              autoComplete="current-password"
            />
            <button
              type="button"
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 
                ${formData.currentPassword
                  ? 'text-gray-500 hover:text-gray-700 cursor-pointer opacity-100'
                  : 'text-gray-300 cursor-default opacity-50 pointer-events-none'}
              `}
              onClick={formData.currentPassword ? () => setShowCurrentPassword((prev) => !prev) : undefined}
              tabIndex={formData.currentPassword ? 0 : -1}
              aria-disabled={!formData.currentPassword}
            >
              <i
                className={`fa-solid ${formData.currentPassword ? 'cursor-pointer' : 'cursor-default'} ${
                  showCurrentPassword ? "fa-eye-slash" : "fa-eye"
                }`}
              ></i>
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">
              <i className="fa-solid fa-circle-exclamation mr-1"></i>
              {errors.currentPassword}
            </p>
          )}
          {!errors.currentPassword && formData.currentPassword && isCheckingPassword && (
            <p className="text-gray-500 text-sm mt-1">
              <i className="fa-solid fa-spinner fa-spin mr-1"></i>
              Đang kiểm tra...
            </p>
          )}
          {!errors.currentPassword && formData.currentPassword && !isCheckingPassword && isCurrentPasswordValid === true && (
            <p className="text-green-500 text-sm mt-1">
              <i className="fa-solid fa-circle-check mr-1"></i>
              Mật khẩu hiện tại đúng
            </p>
          )}
          {!errors.currentPassword && formData.currentPassword && !isCheckingPassword && isCurrentPasswordValid === false && (
            <p className="text-red-500 text-sm mt-1">
              <i className="fa-solid fa-circle-exclamation mr-1"></i>
              Mật khẩu hiện tại không đúng
            </p>
          )}
        </div>

        <div>
          <label className="block font-semibold mb-1">Mật khẩu mới</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full p-3 pr-10 rounded-xl bg-gray-50 border-3 shadow-sm focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none ${
                errors.newPassword
                  ? "border-red-500 border-3 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:border-3"
              }`}
              placeholder="Nhập mật khẩu mới..."
              autoComplete="new-password"
            />
            <button
              type="button"
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 
                ${formData.newPassword
                  ? 'text-gray-500 hover:text-gray-700 cursor-pointer opacity-100'
                  : 'text-gray-300 cursor-default opacity-50 pointer-events-none'}
              `}
              onClick={formData.newPassword ? () => setShowNewPassword((prev) => !prev) : undefined}
              tabIndex={formData.newPassword ? 0 : -1}
              aria-disabled={!formData.newPassword}
            >
              <i
                className={`fa-solid ${formData.newPassword ? 'cursor-pointer' : 'cursor-default'} ${
                  showNewPassword ? "fa-eye-slash" : "fa-eye"
                }`}
              ></i>
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">
              <i className="fa-solid fa-circle-exclamation mr-1"></i>
              {errors.newPassword}
            </p>
          )}
          {!errors.newPassword && formData.newPassword.length > 0 && validatePassword(formData.newPassword) === "" && (
            <p className="text-green-500 text-sm mt-1">
              <i className="fa-solid fa-circle-check mr-1"></i>
              Mật khẩu hợp lệ
            </p>
          )}
        </div>

        <div>
          <label className="block font-semibold mb-1">Xác nhận mật khẩu mới</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-3 pr-10 rounded-xl bg-gray-50 border-3 shadow-sm focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none ${
                errors.confirmPassword
                  ? "border-red-500 border-3 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:border-3"
              }`}
              placeholder="Nhập lại mật khẩu mới..."
              autoComplete="new-password"
            />
            <button
              type="button"
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 
                ${formData.confirmPassword
                  ? 'text-gray-500 hover:text-gray-700 cursor-pointer opacity-100'
                  : 'text-gray-300 cursor-default opacity-50 pointer-events-none'}
              `}
              onClick={formData.confirmPassword ? () => setShowConfirmPassword((prev) => !prev) : undefined}
              tabIndex={formData.confirmPassword ? 0 : -1}
              aria-disabled={!formData.confirmPassword}
            >
              <i
                className={`fa-solid ${formData.confirmPassword ? 'cursor-pointer' : 'cursor-default'} ${
                  showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                }`}
              ></i>
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              <i className="fa-solid fa-circle-exclamation mr-1"></i>
              {errors.confirmPassword}
            </p>
          )}
          {!errors.confirmPassword && formData.confirmPassword.length > 0 && formData.newPassword === formData.confirmPassword && (
            <p className="text-green-500 text-sm mt-1">
              <i className="fa-solid fa-circle-check mr-1"></i>
              Mật khẩu khớp
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            type="button"
            className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400 hover:text-gray-900 hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <i className="fa-solid fa-xmark mr-2"></i>
            Hủy
          </button>
          <button
            type="submit"
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow ${
              isLoading || !isFormValid()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-2xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
            }`}
            disabled={isLoading || !isFormValid()}
          >
            <i className="fa-solid fa-key mr-2"></i>
            {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmChange}
        title="Xác nhận đổi mật khẩu"
        message="Bạn có chắc chắn muốn đổi mật khẩu?"
        type="confirm"
        confirmText="Xác nhận"
        cancelText="Hủy"
      />
    </div>
  );
}
