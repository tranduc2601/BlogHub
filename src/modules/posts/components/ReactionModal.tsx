import { useEffect, useState } from "react";
import axios from "@/core/config/axios";
import toast from "react-hot-toast";

interface ReactionUser {
  id: number;
  username: string;
  fullName: string;
  avatar?: string;
  reactionType: string;
}

interface ReactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  totalReactions: number;
}

const reactionEmojis: { [key: string]: string } = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😠"
};

export default function ReactionModal({ isOpen, onClose, postId, totalReactions }: ReactionModalProps) {
  const [users, setUsers] = useState<ReactionUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [reactionCounts, setReactionCounts] = useState<{ [key: string]: number }>({});

  const fetchReactionUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/posts/${postId}/reactions/users`, {
        params: { reactionType: activeTab === "all" ? undefined : activeTab }
      });
      
      if (response.data.success) {
        setUsers(response.data.users || []);
        setReactionCounts(response.data.counts || {});
      }
    } catch (error) {
      console.error("Error fetching reaction users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReactionUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, postId, activeTab]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return null;
    return avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`;
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  const availableReactions = Object.entries(reactionCounts)
    .filter(([, count]) => count > 0)
    .map(([type]) => type);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[600px] flex flex-col animate-fadeIn">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 overflow-x-auto flex-1 mr-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeTab === "all"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="text-base mr-2">Tất cả</span>
              <span className="relative top-[1px]">{totalReactions}</span>
            </button>
            {availableReactions.map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  activeTab === type
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-base">{reactionEmojis[type]}</span>
                <span>{reactionCounts[type]}</span>
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Đóng"
          >
            <i className="fa-solid fa-xmark text-gray-600 text-xl"></i>
          </button>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có ai thả biểu cảm
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between hover:bg-gray-50 rounded-xl p-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getAvatarUrl(user.avatar) ? (
                      <img
                        src={getAvatarUrl(user.avatar)!}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(user.fullName)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{user.fullName || user.username}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{reactionEmojis[user.reactionType]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
