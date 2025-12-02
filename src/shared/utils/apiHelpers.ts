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
    return '/default-avatar.png';
  }
  
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  const serverUrl = getServerUrl();
  const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  return `${serverUrl}${cleanPath}`;
};
