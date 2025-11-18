/**
 * Helper function to convert relative avatar URL to full URL
 * @param {string|null} avatarUrl - The relative avatar URL from database
 * @returns {string|null} - Full URL or null
 */
export const getFullAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `http://localhost:5000${avatarUrl}`;
};

/**
 * Convert avatar URLs in an array of objects
 * @param {Array} items - Array of objects with avatarUrl property
 * @returns {Array} - Array with converted avatar URLs
 */
export const convertAvatarUrls = (items) => {
  if (!Array.isArray(items)) return items;
  return items.map(item => ({
    ...item,
    avatarUrl: getFullAvatarUrl(item.avatarUrl)
  }));
};

/**
 * Convert avatar URL in a single object
 * @param {Object} item - Object with avatarUrl property
 * @returns {Object} - Object with converted avatar URL
 */
export const convertAvatarUrl = (item) => {
  if (!item) return item;
  return {
    ...item,
    avatarUrl: getFullAvatarUrl(item.avatarUrl)
  };
};
