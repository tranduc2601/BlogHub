import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'info' | 'warning' | 'error' | 'success' | 'confirm';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await login(formData.email, formData.password);
      if (result && result.token) {
        // Always save to localStorage for consistency
          // Save token/user based on rememberMe
          if (rememberMe) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
          } else {
            sessionStorage.setItem('token', result.token);
            sessionStorage.setItem('user', JSON.stringify(result.user));
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        
        // Check if user has warnings
        if (result.user.warningCount && result.user.warningCount > 0) {
          setModal({
            isOpen: true,
            type: 'warning',
            title: 'Cảnh báo vi phạm',
            message: `Bạn đã nhận ${result.user.warningCount}/3 cảnh báo do vi phạm quy định cộng đồng. ${result.user.warningCount >= 3 ? 'Tài khoản sẽ bị khóa.' : 'Nếu tiếp tục vi phạm, tài khoản của bạn sẽ bị khóa.'}`
          });
          // Still navigate after showing warning
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          navigate("/");
        }
      }
    } catch (error: unknown) {
      // Check if account is locked
      const err = error as { response?: { data?: { locked?: boolean } } };
      if (err.response?.data?.locked) {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Tài khoản bị khóa',
          message: 'Tài khoản của bạn đã bị khóa do vi phạm quy định cộng đồng 3 lần. Vui lòng liên hệ admin để biết thêm chi tiết.'
        });
      } else {
        setErrors({ 
          submit: error instanceof Error ? error.message : "Đăng nhập thất bại" 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-700 flex items-center justify-center gap-2 mb-2">
              Chào mừng trở lại
            </h1>
            <p className="text-gray-600">Đăng nhập để tiếp tục chia sẻ câu chuyện của bạn</p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {errors.submit}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <div className="relative">
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email của bạn"
                  className={`w-full p-4 pl-12 border-2 ${errors.email ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300`}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Mật khẩu</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className={`w-full p-4 pl-12 pr-12 border-2 ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300`}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                Ghi nhớ đăng nhập
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white border-2 border-blue-600 text-blue-700 py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:border-blue-700 hover:bg-blue-50 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              style={{ fontFamily: 'Inter, Arial, sans-serif' }}
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Social login options have been removed as requested */}

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Chưa có tài khoản? 
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold ml-1 transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>

      {/* Modal Component */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
