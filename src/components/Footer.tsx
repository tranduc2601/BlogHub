import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white/60 backdrop-blur-sm border-t border-white/20 py-8 mt-16">
      <div className="container mx-auto px-4 select-none">
        <div className="text-center">
          <span className="text-2xl font-extrabold text-blue-700 drop-shadow flex items-center justify-center gap-2">
            <i className="fa-solid fa-feather" style={{ fontSize: '1.1em', color: '#2563eb', textShadow: '0 2px 8px #a5b4fc' }}></i>
            BlogHub © 2025
          </span>
        </div>
        
        <div className="flex justify-center gap-6 mt-4">
          <Link 
            to="/terms" 
            className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
          >
            Điều khoản sử dụng
          </Link>
          <span className="text-gray-300">|</span>
          <Link 
            to="/privacy" 
            className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
          >
            Chính sách bảo mật
          </Link>
        </div>
        
        <div className="text-center text-gray-400 mt-4 pt-4 border-t border-gray-200 text-base">
          <i className="fa-solid fa-users mr-3"></i>Made By Group 4 - Trần Hoàng Duy, Trần Minh Đức, Đoàn Nhật Cường và Nguyễn Gia Huy
        </div>
      </div>
    </footer>
  );
}
