import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import backgroundImage from "../../assets/Login_Register_Background.jpg";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (searchParams.get('locked') === 'true') {
      toast.error('Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ Admin để biết thêm chi tiết!', {
        duration: 5000,
        position: 'top-center',
      });
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ!";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu!";
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
        toast.success('Đăng nhập thành công. Chào mừng bạn trở lại!', {
          duration: 3000,
          position: 'top-right',
        });
        if (result.user.warningCount && result.user.warningCount > 0) {
          toast.error(
            `⚠️ Bạn đã nhận ${result.user.warningCount}/3 cảnh báo do vi phạm quy định cộng đồng. ${result.user.warningCount >= 3 ? 'Tài khoản sẽ bị khóa.' : 'Nếu tiếp tục vi phạm, tài khoản của bạn sẽ bị khóa.'}`,
            {
              duration: 5000,
              position: 'top-right',
            }
          );
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          if (result.user.role === 'admin') {
            navigate('/admin');
            return;
          }
          setTimeout(() => {
            navigate("/");
          }, 1000);
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { locked?: boolean; message?: string } } };
      if (err.response?.data?.locked) {
        toast.error('Bạn đã bị khóa tài khoản!', {
          duration: 6000,
          position: 'top-right',
        });
      } else {
        const errorMessage = err.response?.data?.message || (error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại sau.");
        toast.error(errorMessage, {
          duration: 4000,
          position: 'top-right',
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
            <h1 className="text-3xl font-bold text-blue-700 flex items-center justify-center gap-2 mb-2">
              Chào mừng trở lại
            </h1>
            <p className="text-gray-600">Đăng nhập để tiếp tục chia sẻ câu chuyện của bạn!</p>
          </div>

          
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
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
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
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                />
                Ghi nhớ đăng nhập
              </label>
              {/* <a href="#" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                Quên mật khẩu?
              </a> */}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white border-3 border-blue-600 text-blue-700 py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:border-blue-700 hover:bg-blue-50 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
              style={{ fontFamily: 'Inter, Arial, sans-serif' }}
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
    
          <p className="text-center text-sm text-gray-600 mt-6">
            Chưa có tài khoản? 
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold ml-1 transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
