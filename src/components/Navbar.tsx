import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

// Logo SVG không dùng ảnh hoặc gradient
function BlogHubLogoSVG() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#2563eb" />
      <text
        x="50%"
        y="56%"
        textAnchor="middle"
        fontFamily="'Inter', 'Segoe UI', 'Arial', sans-serif"
        fontWeight="bold"
        fontSize="16"
        fill="#fff"
        dominantBaseline="middle"
      >
        BH
      </text>
    </svg>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowDropdown(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center select-none">
        {location.pathname === "/" ? (
          <div className="flex items-center gap-2 cursor-default select-none">
            <BlogHubLogoSVG />
            <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#2563eb', letterSpacing: '2px', fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif" }}>BlogHub</span>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <BlogHubLogoSVG />
            <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#2563eb', letterSpacing: '2px', fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif" }}>BlogHub</span>
          </div>
        )}
        
        <div className="flex gap-6 items-center">
          {location.pathname !== "/" && (
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 relative group flex items-center gap-2">
                <i className="fa-solid fa-house text-gray-700 group-hover:text-blue-600 text-lg transition-colors duration-300"></i>
              Trang chủ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <>
              <Link 
                to="/users" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 relative group"
              >
                  <i className="fa-solid fa-user-pen mr-2"></i>
                  Tác giả
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                to="/admin" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 relative group"
              >
                <i className="fa-solid fa-shield-halved mr-2"></i>
                Quản lý
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </>
          )}

          {isAuthenticated && location.pathname !== "/create" && (
            <Link 
              to="/create" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              <i className="fa-solid fa-file-alt mr-2"></i>
              Tạo bài viết
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}

          {!isAuthenticated ? (
            <div className="flex gap-3">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-full border border-gray-300 hover:border-blue-600 transition-all duration-300 flex items-end gap-2"
              >
                <i className="fa-solid fa-right-to-bracket" style={{ alignSelf: 'flex-end', fontSize: '1.1em' }}></i>
                Đăng nhập
              </Link>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-end gap-2 cursor-pointer"
                type="button"
              >
                <i className="fa-solid fa-user-plus" style={{ position: 'relative', top: '-3px', fontSize: '1.1em' }}></i>
                Tạo tài khoản miễn phí
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 bg-white border-2 border-blue-500 px-4 py-2 rounded-full font-medium text-blue-900 shadow-md hover:shadow-lg transition-all duration-200 hover:border-blue-700 hover:bg-blue-50 cursor-pointer"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover border border-blue-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                    <span className="text-base font-bold text-blue-700">{user?.username.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span className="font-semibold text-base text-blue-900">{user?.username}</span>
                {user?.role === 'admin' && (
                  <span className="text-xs bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full font-bold border border-yellow-300 ml-2 shadow-sm">
                    Admin
                  </span>
                )}
                {user?.role === 'user' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-300 ml-2 shadow-sm">
                    User
                  </span>
                )}
                <svg className={`w-4 h-4 text-blue-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                    <p className="font-semibold text-gray-800">{user?.username}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Hồ sơ của tôi
                      </span>
                    </Link>
                    <Link
                      to="/my-posts"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Bài viết của tôi
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="flex items-center gap-2 cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
