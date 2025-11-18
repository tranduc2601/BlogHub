import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import backgroundImage from "../../assets/Login_Register_Background.jpg";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên người dùng";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 ký tự viết hoa";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 chữ số";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (!agreeTerms) {
      newErrors.terms = "Bạn phải đồng ý với điều khoản sử dụng";
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
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      toast.success('Đăng ký thành công! Chào mừng bạn đến với BlogHub.', {
        duration: 3000,
        position: 'top-right',
      });
      
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { locked?: boolean } } };
      if (err.response?.data?.locked) {
        toast.error('🔒 Email này đã bị khóa. Vui lòng liên hệ admin để biết thêm chi tiết.', {
          duration: 5000,
          position: 'top-right',
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : "Đăng ký thất bại";
        toast.error(errorMessage, {
          duration: 4000,
          position: 'top-right',
        });
        setErrors({ 
          submit: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center select-none bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="bg-white backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-700 mb-2">
              Tham gia BlogHub
            </h1>
            <p className="text-gray-600">Tạo tài khoản để bắt đầu chia sẻ câu chuyện của bạn!</p>
          </div>

          
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {errors.submit}
            </div>
          )}

          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Tên người dùng</label>
              <div className="relative">
                <input 
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên người dùng"
                  className={`w-full p-4 pl-12 border-3 ${errors.username ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300`}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <div className="relative">
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email của bạn"
                  autoComplete="email"
                  className={`w-full p-4 pl-12 border-3 ${errors.email ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300`}
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
                  autoComplete="new-password"
                  placeholder="Tạo mật khẩu mạnh"
                  className={`w-full p-4 pl-12 pr-12 border-3 ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300`}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button
                  type="button"
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-200 
                    ${formData.password
                      ? 'text-gray-400 hover:text-blue-500 cursor-pointer opacity-100'
                      : 'text-gray-200 cursor-default opacity-50 pointer-events-none'}
                  `}
                  tabIndex={formData.password ? 0 : -1}
                  onClick={formData.password ? () => setShowPassword(v => !v) : undefined}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  aria-disabled={!formData.password}
                >
                  <i className={`fa-solid ${formData.password ? 'cursor-pointer' : 'cursor-default'} ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              {/* {!errors.password && (
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Mật khẩu phải có ít nhất:</div>
                  <ul className="list-disc list-inside pl-2">
                    <li>6 ký tự</li>
                    <li>1 ký tự viết hoa (A-Z)</li>
                    <li>1 chữ số (0-9)</li>
                    <li>1 ký tự đặc biệt (!@#$%^&*...)</li>
                  </ul>
                </div>
              )} */}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Xác nhận mật khẩu</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                  className={`w-full p-4 pl-12 pr-12 border-3 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300`}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <button
                  type="button"
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-200 
                    ${formData.confirmPassword
                      ? 'text-gray-400 hover:text-blue-500 cursor-pointer opacity-100'
                      : 'text-gray-200 cursor-default opacity-50 pointer-events-none'}
                  `}
                  tabIndex={formData.confirmPassword ? 0 : -1}
                  onClick={formData.confirmPassword ? () => setShowConfirmPassword(v => !v) : undefined}
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  aria-disabled={!formData.confirmPassword}
                >
                  <i className={`fa-solid ${formData.confirmPassword ? 'cursor-pointer' : 'cursor-default'} ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.terms) setErrors(prev => ({ ...prev, terms: "" }));
                  }}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                />
                <label className="text-sm text-gray-600 cursor-pointer">
                  Tôi đồng ý với 
                  <Link to="/terms" className="text-blue-600 hover:text-blue-700 ml-1 mr-1" target="_blank">Điều khoản sử dụng</Link> 
                  và 
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-700 ml-1" target="_blank">Chính sách bảo mật</Link>
                </label>
              </div>
              {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white border-3 border-blue-600 text-blue-700 py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:border-blue-700 hover:bg-blue-50 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
              style={{ fontFamily: 'Inter, Arial, sans-serif' }}
            >
              <i className="fa-solid fa-user-plus"></i>
              {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
          </form>

          

          
          <p className="text-center text-sm text-gray-600 mt-6">
            Đã có tài khoản? 
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold ml-1 transition-colors">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
