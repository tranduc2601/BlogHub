import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "@/core/config/axios";
import toast from "react-hot-toast";
import { emailService } from "../services/emailService";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromChangePassword = (location.state as { from?: string })?.from === "change-password";
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [countdown, setCountdown] = useState(0);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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


  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };


  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: "Vui lòng nhập email" });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Email không hợp lệ" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/auth/forgot-password", { email });

      if (response.data.success) {
        const backendOTP = response.data.otp;

        if (backendOTP) {
          const emailResult = await emailService.sendOTPEmail(email, backendOTP);

          if (!emailResult.success) {
            console.error("Email send failed:", emailResult.message);
            toast.error(emailResult.message, {
              duration: 4000,
              position: "top-right",
            });
            return;
          }
        } else {
          console.warn("Backend did not return OTP (production mode)");
        }
        
        toast.success("Mã OTP đã được gửi đến email của bạn!", {
          duration: 4000,
          position: "top-right",
        });
        setStep("otp");
        startCountdown();
      }
    } catch (error: unknown) {
      console.error("Send OTP error:", error);
      const errorMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Không thể gửi mã OTP. Vui lòng thử lại!";
      toast.error(errorMsg, {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!otp) {
      setErrors({ otp: "Vui lòng nhập mã OTP" });
      return;
    }

    if (otp.length !== 6) {
      setErrors({ otp: "Mã OTP phải có 6 chữ số" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/auth/verify-otp", { email, otp });

      if (response.data.success) {
        toast.success("Xác thực thành công!", {
          duration: 3000,
          position: "top-right",
        });
        setStep("reset");
      }
    } catch (error: unknown) {
      console.error("Verify OTP error:", error);
      const errorMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn!";
      toast.error(errorMsg, {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!newPassword) {
      setErrors({ newPassword: "Vui lòng nhập mật khẩu mới" });
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrors({ newPassword: passwordError });
      return;
    }

    if (!confirmPassword) {
      setErrors({ confirmPassword: "Vui lòng xác nhận mật khẩu" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Mật khẩu xác nhận không khớp" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      if (response.data.success) {
        toast.success("Đổi mật khẩu thành công! Đang chuyển đến trang đăng nhập...", {
          duration: 3000,
          position: "top-right",
        });
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      const errorMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Đổi mật khẩu thất bại! Vui lòng thử lại.";
      toast.error(errorMsg, {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    try {

      const response = await axios.post("/auth/forgot-password", { email });

      if (response.data.success) {

        const backendOTP = response.data.otp;
        

        if (backendOTP) {
          const emailResult = await emailService.sendOTPEmail(email, backendOTP);

          if (!emailResult.success) {
            toast.error(emailResult.message, {
              duration: 4000,
              position: "top-right",
            });
            return;
          }
        }
        

        toast.success("Mã OTP mới đã được gửi!", {
          duration: 3000,
          position: "top-right",
        });
        startCountdown();
      }
    } catch (error: unknown) {
      console.error("Resend OTP error:", error);
      const errorMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Không thể gửi lại mã OTP!";
      toast.error(errorMsg, {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 select-none">

        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <i className="fa-solid fa-key text-3xl text-blue-600"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            {step === "email" && "Quên mật khẩu"}
            {step === "otp" && "Xác thực OTP"}
            {step === "reset" && "Đặt mật khẩu mới"}
          </h2>
          <p className="text-gray-600 mt-2">
            {step === "email" && "Nhập email để nhận mã OTP"}
            {step === "otp" && "Nhập mã OTP đã được gửi đến email"}
            {step === "reset" && "Tạo mật khẩu mới cho tài khoản"}
          </p>
        </div>


        {step === "email" && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-envelope mr-2 text-blue-600"></i>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3 rounded-xl bg-gray-50 border-3 shadow-sm focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="Nhập email của bạn..."
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">
                  <i className="fa-solid fa-circle-exclamation mr-1"></i>
                  {errors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
              }`}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Đang gửi...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane mr-2"></i>
                  Gửi mã OTP
                </>
              )}
            </button>

            <div className="text-center space-y-2">
              <Link
                to={fromChangePassword ? "/profile" : "/login"}
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  outline: "none"
                }}
              >
                <i className="fa-solid fa-arrow-left"></i>
                {fromChangePassword ? "Quay lại hồ sơ" : "Quay lại đăng nhập"}
              </Link>
            </div>
          </form>
        )}


        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-shield-halved mr-2 text-blue-600"></i>
                Mã OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={`w-full p-3 rounded-xl bg-gray-50 border-3 shadow-sm focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none text-center text-2xl tracking-widest font-mono ${
                  errors.otp
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-2">
                  <i className="fa-solid fa-circle-exclamation mr-1"></i>
                  {errors.otp}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-4 text-center">
                Mã OTP đã được gửi đến: <strong>{email}</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
              }`}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Đang xác thực...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check-circle mr-2"></i>
                  Xác thực
                </>
              )}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || isLoading}
                className={`font-medium inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  countdown > 0 || isLoading
                    ? "text-gray-400 cursor-not-allowed bg-gray-50"
                    : "text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer bg-blue-50 hover:-translate-y-0.5"
                }`}
              >
                {countdown > 0 ? (
                  <>
                    <i className="fa-solid fa-clock"></i>
                    <span>Gửi lại sau {countdown}s</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-rotate-right"></i>
                    <span>Gửi lại mã OTP</span>
                  </>
                )}
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-gray-600 font-medium cursor-pointer mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-500 hover:shadow-lg hover:scale-105 active:scale-95 bg-gray-100 hover:-translate-y-0.5"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  <span>Thay đổi email</span>
                </button>
              </div>
            </div>
          </form>
        )}


        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-lock mr-2 text-blue-600"></i>
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full p-3 pr-12 rounded-xl bg-gray-50 border-3 shadow-sm focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none ${
                    errors.newPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="Nhập mật khẩu mới..."
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                    newPassword
                      ? "text-gray-500 hover:text-gray-700 cursor-pointer"
                      : "text-gray-300 cursor-default pointer-events-none"
                  }`}
                  disabled={!newPassword}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-2">
                  <i className="fa-solid fa-circle-exclamation mr-1"></i>
                  {errors.newPassword}
                </p>
              )}
              {!errors.newPassword && newPassword && validatePassword(newPassword) === "" && (
                <p className="text-green-500 text-sm mt-2">
                  <i className="fa-solid fa-circle-check mr-1"></i>
                  Mật khẩu hợp lệ
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-lock mr-2 text-blue-600"></i>
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-3 pr-12 rounded-xl bg-gray-50 border-3 shadow-sm focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="Nhập lại mật khẩu mới..."
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                    confirmPassword
                      ? "text-gray-500 hover:text-gray-700 cursor-pointer"
                      : "text-gray-300 cursor-default pointer-events-none"
                  }`}
                  disabled={!confirmPassword}
                >
                  <i className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-2">
                  <i className="fa-solid fa-circle-exclamation mr-1"></i>
                  {errors.confirmPassword}
                </p>
              )}
              {!errors.confirmPassword && confirmPassword && newPassword === confirmPassword && (
                <p className="text-green-500 text-sm mt-2">
                  <i className="fa-solid fa-circle-check mr-1"></i>
                  Mật khẩu khớp
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
              }`}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-key mr-2"></i>
                  Đặt lại mật khẩu
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
