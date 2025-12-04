import db from '../config/database.js';
import { getFullAvatarUrl } from '../utils/urlHelper.js';


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
        n.anonymousId,
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


    const formattedNotifications = notifications.map(notif => {
      let senderName = notif.senderName;
      

      if (notif.senderId === null && notif.type === 'comment' && notif.anonymousId) {
        senderName = `Người dùng ẩn danh ${notif.anonymousId}`;
      }
      
      return {
        ...notif,
        senderName,
        senderAvatar: getFullAvatarUrl(notif.senderAvatar),
        isRead: Boolean(notif.isRead)
      };
    });

    res.json({
      success: true,
      notifications: formattedNotifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông báo!'
    });
  }
};


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
      message: 'Lỗi khi đếm thông báo chưa đọc!'
    });
  }
};


export const markAsRead = async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;


    const [notifications] = await db.query(
      'SELECT id FROM notifications WHERE id = ? AND userId = ?',
      [notificationId, userId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo!'
      });
    }

    await db.query(
      'UPDATE notifications SET isRead = TRUE WHERE id = ?',
      [notificationId]
    );

    res.json({
      success: true,
      message: 'Đã đánh dấu đã đọc!'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu đã đọc!'
    });
  }
};


export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(
      'UPDATE notifications SET isRead = TRUE WHERE userId = ? AND isRead = FALSE',
      [userId]
    );

    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả đã đọc!'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu tất cả đã đọc!'
    });
  }
};


export const createNotification = async (userId, type, senderId, message, postId = null, anonymousId = null) => {
  try {

    if (senderId !== null && userId === senderId) {
      return true;
    }
    
    await db.query(`
      INSERT INTO notifications (userId, type, senderId, message, postId, anonymousId)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, type, senderId, message, postId, anonymousId]);
    
    return true;
  } catch (error) {
    console.error('Create notification error:', error);
    return false;
  }
};


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
        message: 'Không tìm thấy thông báo!'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa thông báo!'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thông báo!'
    });
  }
};
