import { Link } from "react-router-dom";
import { useState } from "react";
import type { Post } from "../data/mockData";
import axios from '../config/axios';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false);
  async function handleLike() {
    if (!liked) {
      try {
        await axios.post(`/posts/${post.id}/like`);
        setLikes(likes + 1);
        setLiked(true);
      } catch (error) {
        console.error('Error liking post:', error);
        alert('Lỗi khi thả tim bài viết');
      }
    }
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatReadTime = (minutes: number) => {
    return `${minutes} phút đọc`;
  };

  const getAuthorInitial = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Công nghệ': 'from-blue-500 to-cyan-500',
      'Design': 'from-purple-500 to-pink-500',
      'Marketing': 'from-green-500 to-emerald-500',
      'Ẩm thực': 'from-orange-500 to-red-500',
      'Du lịch': 'from-indigo-500 to-blue-500',
      'Giáo dục': 'from-teal-500 to-green-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-white/20 group hover:scale-105 hover:bg-white/90">
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )}

      {/* Author Info */}
      <div className="flex items-center gap-3 mb-4">
        {/* Check for authorAvatar (from backend) or author.avatar (from mockData) */}
        {(post.authorAvatar || (post.author && typeof post.author === 'object' && post.author.avatar)) ? (
          <img
            src={
              post.authorAvatar 
                ? (post.authorAvatar.startsWith('http') ? post.authorAvatar : `http://localhost:5000${post.authorAvatar}`)
                : typeof post.author === 'object' && post.author.avatar.startsWith('http') 
                  ? post.author.avatar 
                  : `http://localhost:5000${typeof post.author === 'object' ? post.author.avatar : ''}`
            }
            alt={typeof post.author === 'string' ? post.author : post.author?.name || 'User'}
            className={`w-10 h-10 rounded-full object-cover border border-blue-200`}
          />
        ) : (
          <div className={`w-10 h-10 bg-gradient-to-r ${getCategoryColor(post.category || 'Khác')} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
            {getAuthorInitial(typeof post.author === 'string' ? post.author : post.author?.name || 'User')}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-800">{typeof post.author === 'string' ? post.author : post.author?.name || 'Không rõ'}</p>
          <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
        </div>
      </div>
      
      {/* Category Badge */}
      <div className="mb-3">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(post.category)} text-white`}>
          {post.category}
        </span>
      </div>
      
      {/* Title */}
      <h2 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
        <Link to={`/post/${post.id}`} className="hover:text-blue-600">
          {post.title}
        </Link>
      </h2>
      
      {/* Excerpt */}
      {post.excerpt && (
        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              #{tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              +{post.tags.length - 3}
            </span>
          )}
        </div>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <button className={`flex items-center gap-1 hover:text-red-500 transition-colors ${liked ? 'pointer-events-none opacity-60' : ''}`} title="Thích bài viết" onClick={handleLike} disabled={liked}>
            <svg className={`w-4 h-4 ${liked ? 'text-red-500' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            {likes}
          </button>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            {post.comments || 0}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.views || 0}
          </span>
        </div>
        {post.readTime && (
          <div className="text-xs text-gray-400">
            {formatReadTime(post.readTime)}
          </div>
        )}
      </div>

      {/* Read More Link */}
      <div className="mt-4">
        <Link 
          to={`/post/${post.id}`} 
          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300"
        >
          Đọc thêm
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

