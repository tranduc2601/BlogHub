import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDropdown } from "../context/DropdownContext";
import { useState, useEffect, useRef } from "react";
import NotificationDropdown from "./NotificationDropdown";

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
  const { activeDropdown, setActiveDropdown } = useDropdown();
  const navigate = useNavigate();
  const location = useLocation();
  const showDropdown = activeDropdown === 'profile';
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, setActiveDropdown]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setActiveDropdown(null);
    setShowMobileMenu(false);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center select-none">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button - Left Side */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Logo */}
          {location.pathname === "/" ? (
            <div className="flex items-center gap-2 cursor-default select-none">
              <BlogHubLogoSVG />
              <span className="hidden sm:inline" style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#2563eb', letterSpacing: '2px', fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif" }}>BlogHub</span>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 cursor-pointer select-none transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/")}
            >
              <BlogHubLogoSVG />
              <span className="hidden sm:inline" style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#2563eb', letterSpacing: '2px', fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif" }}>BlogHub</span>
            </div>
          )}
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-6 items-center">
          {location.pathname !== "/" && (
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 relative group flex items-center gap-0 hover:gap-2">
                <i className="fa-solid fa-house text-gray-700 group-hover:text-blue-600 text-lg transition-colors duration-300"></i>
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-gray-700 group-hover:text-blue-600 font-medium">Trang chủ</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link 
              to="/admin" 
              className="group relative flex items-center gap-0 hover:gap-2 transition-all duration-300 hover:scale-105"
              title="Quản lý"
            >
              <i className="fa-solid fa-shield-halved text-gray-700 group-hover:text-blue-600 text-lg transition-colors duration-300"></i>
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-gray-700 group-hover:text-blue-600 font-medium">Quản lý</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}

          {isAuthenticated && (
            <Link 
              to="/users" 
              className="group relative flex items-center gap-0 hover:gap-2 transition-all duration-300 hover:scale-105"
              title="Tác giả"
            >
              <i className="fa-solid fa-user-pen text-gray-700 group-hover:text-blue-600 text-lg transition-colors duration-300"></i>
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-gray-700 group-hover:text-blue-600 font-medium">Tác giả</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}

          {isAuthenticated && location.pathname !== "/create" && (
            <Link 
              to="/create" 
              className="group relative flex items-center gap-0 hover:gap-2 transition-all duration-300 hover:scale-105"
              title="Tạo bài viết"
            >
              <i className="fa-solid fa-file-alt text-gray-700 group-hover:text-blue-600 text-lg transition-colors duration-300"></i>
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-gray-700 group-hover:text-blue-600 font-medium">Tạo bài viết</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}

          {isAuthenticated && (
            <NotificationDropdown />
          )}

          {!isAuthenticated ? (
            <div className="flex gap-3">
              <Link 
                to="/login" 
                className="bg-white text-blue-700 px-6 py-2 rounded-full font-semibold border-2 border-blue-600 shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer
                  hover:bg-blue-600 hover:text-white hover:scale-105 hover:shadow-xl hover:border-blue-700"
                style={{ fontFamily: 'Inter, Arial, sans-serif' }}
              >
                <i className="fa-solid fa-right-to-bracket text-lg"></i>
                Đăng nhập
              </Link>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
                type="button"
              >
                <i className="fa-solid fa-user-plus text-lg"></i>
                Tạo tài khoản miễn phí
              </button>
            </div>
          ) : (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setActiveDropdown(showDropdown ? null : 'profile')}
                className="flex items-center gap-3 bg-white rgb-border px-4 py-2 rounded-full font-medium text-blue-900 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-blue-50 cursor-pointer"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover border border-blue-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                    <span className="text-base font-bold text-blue-700">
                      {user?.username.split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="font-semibold text-base text-blue-900">{user?.username}</span>
                <svg className={`w-4 h-4 text-blue-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeInDown z-50">
                  <div className="p-5 border-b border-gray-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                    <div className="flex items-center gap-3 mb-2">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-300 shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-2 border-blue-300 shadow-md">
                          <span className="text-lg font-bold text-white">
                            {user?.username.split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-base">{user?.username}</p>
                        {user?.role === 'admin' && (
                          <span className="inline-block text-xs bg-yellow-400 text-black-500 px-2 py-1 rounded-full font-bold mt-2">
                            <i className="fa-solid fa-shield-halved mr-1"></i>ADMIN
                          </span>
                        )}
                        {user?.role === 'user' && (
                          <span className="inline-block text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold mt-2">
                            <i className="fa-solid fa-user mr-1"></i>USER
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-4"><i className="fa-light fa-envelope mr-2"></i>{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="font-medium">Hồ sơ của tôi</span>
                    </Link>
                    <Link
                      to="/my-posts"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">Bài viết của tôi</span>
                    </Link>
                    <div className="my-2 border-t border-gray-200"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors cursor-pointer">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span className="font-medium cursor-pointer">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Right Side - Only for non-authenticated users */}
        <div className="lg:hidden flex items-center gap-2">
          {!isAuthenticated && (
            <div className="flex gap-2">
              <Link 
                to="/login" 
                className="bg-white text-blue-700 px-3 py-2 rounded-full font-semibold border-2 border-blue-600 shadow-md transition-all duration-300 flex items-center gap-1 cursor-pointer
                  hover:bg-blue-600 hover:text-white hover:scale-105 hover:shadow-xl hover:border-blue-700 text-sm"
                style={{ fontFamily: 'Inter, Arial, sans-serif' }}
              >
                <i className="fa-solid fa-right-to-bracket text-base"></i>
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white px-3 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-1 cursor-pointer text-sm"
                type="button"
              >
                <i className="fa-solid fa-user-plus text-base"></i>
                <span className="hidden sm:inline">Đăng ký</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="lg:hidden absolute left-0 right-0 top-full bg-white shadow-2xl border-t border-gray-200 z-40">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {/* User info section for authenticated users */}
              {isAuthenticated && (
                <div className="p-4 mb-2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-300 shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-2 border-blue-300 shadow-md">
                        <span className="text-lg font-bold text-white">
                          {user?.username.split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-base">{user?.username}</p>
                      {user?.role === 'admin' && (
                        <span className="inline-block text-xs bg-yellow-400 text-black-500 px-2 py-1 rounded-full font-bold mt-1">
                          <i className="fa-solid fa-shield-halved mr-1"></i>ADMIN
                        </span>
                      )}
                      {user?.role === 'user' && (
                        <span className="inline-block text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold mt-1">
                          <i className="fa-solid fa-user mr-1"></i>USER
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {location.pathname !== "/" && location.pathname !== "/terms" && location.pathname !== "/privacy" && (
                <Link 
                  to="/" 
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:bg-blue-50 p-3 rounded-lg flex items-center gap-3"
                >
                  <i className="fa-solid fa-house text-lg"></i>
                  Trang chủ
                </Link>
              )}

              {isAuthenticated && user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:bg-blue-50 p-3 rounded-lg flex items-center gap-3"
                >
                  <i className="fa-solid fa-shield-halved text-lg"></i>
                  Quản lý
                </Link>
              )}

              {isAuthenticated && (
                <Link 
                  to="/users" 
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:bg-blue-50 p-3 rounded-lg flex items-center gap-3"
                >
                  <i className="fa-solid fa-user-pen text-lg"></i>
                  Tác giả
                </Link>
              )}

              {isAuthenticated && location.pathname !== "/create" && (
                <Link 
                  to="/create" 
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:bg-blue-50 p-3 rounded-lg flex items-center gap-3"
                >
                  <i className="fa-solid fa-file-alt text-lg"></i>
                  Tạo bài viết
                </Link>
              )}

              {/* Notifications - Mobile */}
              {isAuthenticated && (
                <Link 
                  to="/notifications" 
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:bg-blue-50 p-3 rounded-lg flex items-center gap-3 cursor-pointer"
                >
                  <i className="fa-solid fa-bell text-lg cursor-pointer"></i>
                  Thông báo
                </Link>
              )}

              {/* Divider */}
              {isAuthenticated && (
                <div className="my-2 border-t border-gray-200"></div>
              )}

              {/* Profile and My Posts */}
              {isAuthenticated && (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:bg-blue-50 p-3 rounded-lg flex items-center gap-3"
                  >
                    <i className="fa-solid fa-user text-lg"></i>
                    Hồ sơ của tôi
                  </Link>
                  <Link
                    to="/my-posts"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:bg-blue-50 p-3 rounded-lg flex items-center gap-3"
                  >
                    <i className="fa-solid fa-file-lines text-lg"></i>
                    Bài viết của tôi
                  </Link>
                  
                  <div className="my-2 border-t border-gray-200"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 font-medium transition-all duration-300 hover:bg-red-50 p-3 rounded-lg flex items-center gap-3 w-full text-left"
                  >
                    <i className="fa-solid fa-right-from-bracket text-lg"></i>
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
