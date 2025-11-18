import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        console.warn('Authentication failed, clearing tokens');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
      if (data.accountLocked) {
        console.warn('Account locked by admin, logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login?locked=true';
        
        return Promise.reject(data);
      }
      return Promise.reject(data);
    } else if (error.request) {
      return Promise.reject({
        success: false,
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối.'
      });
    } else {
      return Promise.reject({
        success: false,
        message: error.message || 'Có lỗi xảy ra'
      });
    }
  }
);

export default axiosInstance;
