/**
 * Unified API Client for CareerLens
 * Uses HttpOnly cookie session credentials ('include'), normalizes errors,
 * and manages 401 unauthorized session transitions.
 */

const rawBase = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

class ApiError extends Error {
  constructor(message, status, code = 'API_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const headers = { ...options.headers };

  // Only set Content-Type to JSON if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Ensure leading slash consistency with API_BASE
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const config = {
    ...options,
    credentials: 'include', // Transmit and receive HttpOnly session cookies
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${path}`, config);

    // 204 No Content
    if (response.status === 204) {
      return null;
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      // 401 Unauthorized handling
      if (response.status === 401) {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }

      const errorCode = data?.error?.code || `HTTP_${response.status}`;
      const errorMessage = data?.error?.message || data?.message || 'A network error occurred. Please try again.';
      const errorDetails = data?.error?.details || null;

      throw new ApiError(errorMessage, response.status, errorCode, errorDetails);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Offline or network connection failure
    throw new ApiError(
      'Unable to connect to server. Please check your network connection.',
      0,
      'NETWORK_OFFLINE'
    );
  }
}

export const api = {
  // Authentication
  auth: {
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: () => request('/auth/me', { method: 'GET' }),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  // Profile Management
  profile: {
    get: () => request('/profile', { method: 'GET' }),
    update: (profileData) =>
      request('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
  },

  // Resume Analyses
  analyses: {
    create: (data) => {
      if (data instanceof FormData) {
        return request('/analyses', {
          method: 'POST',
          body: data,
        });
      }
      return request('/analyses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    createMultipart: (formData) => {
      return request('/analyses', {
        method: 'POST',
        body: formData,
      });
    },
    createFromProfile: (data = {}) => {
      return request('/analyses/profile', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    list: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value);
        }
      });
      const queryString = query.toString();
      return request(`/analyses${queryString ? `?${queryString}` : ''}`, {
        method: 'GET',
      });
    },
    getById: (id) => request(`/analyses/${id}`, { method: 'GET' }),
    delete: (id) => request(`/analyses/${id}`, { method: 'DELETE' }),
  },
};

export { ApiError };
