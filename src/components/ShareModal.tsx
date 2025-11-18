import { useState, useEffect } from 'react';
import axios from '../config/axios';
import toast from 'react-hot-toast';
import Modal from './Modal';

interface User {
  id: number;
  name: string;
  avatarUrl?: string;
  role?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  postTitle: string;
}

export default function ShareModal({ isOpen, onClose, postId, postTitle }: ShareModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchFollowUsers = async () => {
    try {
      setLoading(true);
      
      // Try to get user from localStorage first, then sessionStorage
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      
      if (!userStr || userStr === "null" || userStr === "undefined") {
        console.error('No user found in storage');
        toast.error('Vui lòng đăng nhập để chia sẻ bài viết!');
        onClose();
        return;
      }

      let currentUser;
      try {
        currentUser = JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user:', e);
        toast.error('Vui lòng đăng nhập lại!');
        onClose();
        return;
      }

      if (!currentUser || !currentUser.id) {
        console.error('Invalid user data:', currentUser);
        toast.error('Vui lòng đăng nhập để chia sẻ bài viết!');
        onClose();
        return;
      }

      console.log('Fetching followers/following for user:', currentUser.id);

      // Get both followers and following
      const [followersRes, followingRes] = await Promise.all([
        axios.get(`/users/${currentUser.id}/followers`),
        axios.get(`/users/${currentUser.id}/following`)
      ]);

      const followers = followersRes.data.users || [];
      const following = followingRes.data.users || [];

      // Combine and remove duplicates
      const allUsers = [...followers, ...following];
      const uniqueUsers = allUsers.filter((user, index, self) =>
        index === self.findIndex((u) => u.id === user.id)
      );

      // Filter out admin users
      const nonAdminUsers = uniqueUsers.filter((user) => user.role !== 'admin');

      console.log('Found users to share with:', nonAdminUsers.length);
      setUsers(nonAdminUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFollowUsers();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const handleConfirmShare = async () => {
    if (!selectedUser) return;

    try {
      await axios.post(`/posts/${postId}/share`, {
        recipientId: selectedUser.id
      });

      toast.success(`Đã chia sẻ bài viết cho ${selectedUser.name} thành công!`, {
        duration: 3000,
        position: 'top-right',
      });

      setShowConfirmModal(false);
      setSelectedUser(null);
      onClose();
    } catch (error) {
      console.error('Error sharing post:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Không thể chia sẻ bài viết';
      toast.error(errorMessage);
      setShowConfirmModal(false);
    }
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
    toast.success('Đã sao chép link bài viết!', {
      duration: 2000,
      position: 'top-right',
    });
  };

  const getAuthorInitial = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          
          <div className="bg-blue-600 text-white p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Chia sẻ bài viết</h2>
              <button
                onClick={onClose}
                className="text-white hover:bg-blue-700 rounded-full p-2 transition-all duration-200"
              >
                <svg className="w-6 h-6 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-blue-100 text-sm mt-2 line-clamp-1">{postTitle}</p>
          </div>

          
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Chia sẻ với bạn bè
              </h3>

              {loading ? (
                <div className="flex flex-col justify-center items-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="font-medium">Chưa có người theo dõi hoặc đang theo dõi</p>
                  <p className="text-sm mt-1">Hãy theo dõi người dùng khác để chia sẻ bài viết</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className="flex flex-col items-center cursor-pointer group"
                      title={`Chia sẻ cho ${user.name}`}
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`}
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover border-3 border-blue-500 group-hover:border-blue-600 transition-all duration-200 group-hover:scale-110 shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg border-3 border-blue-500 group-hover:border-blue-600 transition-all duration-200 group-hover:scale-110 shadow-md">
                          {getAuthorInitial(user.name)}
                        </div>
                      )}
                      <p className="text-xs text-center mt-2 text-gray-700 group-hover:text-blue-600 font-medium line-clamp-1 w-full px-1">
                        {user.name.trim().split(' ').pop()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
         
            <div className="border-t border-gray-200 my-6"></div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Hoặc sao chép link
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={`${window.location.origin}/post/${postId}`}
                    readOnly
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:bg-blue-700 hover:scale-105 hover:shadow-xl cursor-pointer group"
                  >
                    <svg className="w-4 h-4 cursor-pointer transition-colors duration-200 group-hover:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Sao chép
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmShare}
        title="Xác nhận chia sẻ"
        message={`Bạn có muốn chia sẻ bài viết "${postTitle}" cho ${selectedUser?.name} không?`}
        type="confirm"
        confirmText="Chia sẻ"
        cancelText="Hủy"
      />
    </>
  );
}
