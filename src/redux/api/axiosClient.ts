import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '', // Uses relative path for Next.js internal /api routes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('arpan_auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages & catch 401 session revocation
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const data = error.response.data;
      if (typeof window !== 'undefined') {
        const isOtherDevice = !!data?.loggedOutByOtherDevice;
        const msg =
          data?.message ||
          (isOtherDevice
            ? 'Your account has been logged in on another device. You have been automatically logged out.'
            : 'Session expired. Please log in again.');

        // Clear local storage
        localStorage.removeItem('arpan_auth_token');
        localStorage.removeItem('arpan_auth_user');

        // Dispatch window event so AuthContext & UI immediately handles logout
        window.dispatchEvent(
          new CustomEvent('session-terminated-by-other-device', {
            detail: {
              loggedOutByOtherDevice: isOtherDevice,
              sessionExpired: !!data?.sessionExpired,
              message: msg,
            },
          })
        );
      }
    }

    const customMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default axiosClient;
