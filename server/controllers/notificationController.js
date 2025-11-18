import db from '../config/database.js';
import { getFullAvatarUrl } from '../utils/urlHelper.js';

// Get notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const [notifications] = await db.query(`
      SELECT 
        n.id,
        n.userId,
        n.type,
        n.postId,
        n.senderId,
        n.message,
        n.isRead,
        n.createdAt,
        u.username as senderName,
        u.avatarUrl as senderAvatar,
        p.title as postTitle
      FROM notifications n
      LEFT JOIN users u ON n.senderId = u.id
      LEFT JOIN posts p ON n.postId = p.id
      WHERE n.userId = ?
      ORDER BY n.createdAt DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), parseInt(offset)]);

    // Convert avatar URLs
    const formattedNotifications = notifications.map(notif => ({
      ...notif,
      senderAvatar: getFullAvatarUrl(notif.senderAvatar),
      isRead: Boolean(notif.isRead)
    }));

    res.json({
      success: true,
      notifications: formattedNotifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông báo'
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await db.query(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE userId = ? AND isRead = FALSE
    `, [userId]);

    res.json({
      success: true,
      count: result[0].count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đếm thông báo chưa đọc'
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    // Check if notification belongs to user
    const [notifications] = await db.query(
      'SELECT id FROM notifications WHERE id = ? AND userId = ?',
      [notificationId, userId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }

    await db.query(
      'UPDATE notifications SET isRead = TRUE WHERE id = ?',
      [notificationId]
    );

    res.json({
      success: true,
      message: 'Đã đánh dấu đã đọc'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu đã đọc'
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(
      'UPDATE notifications SET isRead = TRUE WHERE userId = ? AND isRead = FALSE',
      [userId]
    );

    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả đã đọc'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu tất cả đã đọc'
    });
  }
};

// Create notification (helper function)
export const createNotification = async (userId, type, senderId, message, postId = null) => {
  try {
    // Don't create notification if user is notifying themselves
    if (userId === senderId) {
      return true;
    }
    
    await db.query(`
      INSERT INTO notifications (userId, type, senderId, message, postId)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, type, senderId, message, postId]);
    
    return true;
  } catch (error) {
    console.error('Create notification error:', error);
    return false;
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    const [result] = await db.query(
      'DELETE FROM notifications WHERE id = ? AND userId = ?',
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa thông báo'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thông báo'
    });
  }
};
