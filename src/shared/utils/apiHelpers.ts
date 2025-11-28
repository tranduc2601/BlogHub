import { config } from '../../core/config/env';

/**
 * Get the full API URL
 * @param path - API path (with or without leading slash)
 * @returns Full API URL
 */
export const getApiUrl = (path: string = ''): string => {
  const baseUrl = config.apiBaseUrl;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
};

/**
 * Get the server base URL (without /api)
 * For serving static files like avatars
 */
export const getServerUrl = (): string => {
  return config.apiBaseUrl.replace('/api', '');
};

/**
 * Get the full URL for an avatar
 * @param avatarPath - Avatar path (can be full URL or relative path)
 * @returns Full avatar URL
 */
export const getAvatarUrl = (avatarPath: string | null | undefined): string => {
  if (!avatarPath) {
    return '/default-avatar.png'; // Fallback to default avatar
  }
  
  // If already a full URL (starts with http), return as is
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  // Otherwise, prepend server URL
  const serverUrl = getServerUrl();
  const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  return `${serverUrl}${cleanPath}`;
};
