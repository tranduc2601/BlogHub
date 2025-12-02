export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  appName: 'BlogHub',
  appVersion: '1.0.0',
} as const;

if (config.apiBaseUrl && !config.apiBaseUrl.startsWith('http')) {
  console.warn('API URL missing protocol, adding https://');
}
