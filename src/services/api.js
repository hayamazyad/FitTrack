// API service layer - handles all HTTP requests to the backend
// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('auth_token') || localStorage.getItem('token');
};

// Helper function to get headers with auth token
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

// Generic fetch wrapper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(options.requireAuth !== false),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'An error occurred');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If it's already our error with status, re-throw it
    if (error.status) {
      throw error;
    }
    // Otherwise, it's a network error or JSON parse error
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      requireAuth: false,
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requireAuth: false,
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },

  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Exercise API
export const exerciseAPI = {
  getAll: async (options = {}) => {
    const requireAuth = options.requireAuth ?? true;
    return apiRequest('/exercises', { requireAuth });
  },

  getById: async (id) => {
    return apiRequest(`/exercises/${id}`, { requireAuth: false });
  },

  create: async (exerciseData) => {
    return apiRequest('/exercises', {
      method: 'POST',
      body: JSON.stringify(exerciseData),
    });
  },

  update: async (id, exerciseData) => {
    return apiRequest(`/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(exerciseData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/exercises/${id}`, {
      method: 'DELETE',
    });
  },
};

// Workout API
export const workoutAPI = {
  getAll: async (options = {}) => {
    const requireAuth = options.requireAuth ?? true;
    return apiRequest('/workouts', { requireAuth });
  },

  getById: async (id) => {
    return apiRequest(`/workouts/${id}`, { requireAuth: false });
  },

  create: async (workoutData) => {
    return apiRequest('/workouts', {
      method: 'POST',
      body: JSON.stringify(workoutData),
    });
  },

  update: async (id, workoutData) => {
    return apiRequest(`/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workoutData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/workouts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Progress Log API
export const progressAPI = {
  getAll: async () => {
    return apiRequest('/progress');
  },

  getById: async (id) => {
    return apiRequest(`/progress/${id}`);
  },

  create: async (logData) => {
    return apiRequest('/progress', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  },

  update: async (id, logData) => {
    return apiRequest(`/progress/${id}`, {
      method: 'PUT',
      body: JSON.stringify(logData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/progress/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async () => {
    return apiRequest('/progress/stats');
  },
};

export const defaultExerciseAPI = {
  getAll: async () => apiRequest('/default-exercises'),
  create: async (exerciseData) =>
    apiRequest('/default-exercises', {
      method: 'POST',
      body: JSON.stringify(exerciseData),
    }),
  update: async (id, exerciseData) =>
    apiRequest(`/default-exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(exerciseData),
    }),
  delete: async (id) =>
    apiRequest(`/default-exercises/${id}`, {
      method: 'DELETE',
    }),
};

export const defaultWorkoutAPI = {
  getAll: async () => apiRequest('/default-workouts'),
  create: async (workoutData) =>
    apiRequest('/default-workouts', {
      method: 'POST',
      body: JSON.stringify(workoutData),
    }),
  update: async (id, workoutData) =>
    apiRequest(`/default-workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workoutData),
    }),
  delete: async (id) =>
    apiRequest(`/default-workouts/${id}`, {
      method: 'DELETE',
    }),
};

