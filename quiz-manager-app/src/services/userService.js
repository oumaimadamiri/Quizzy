import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.11.106:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const userService = {

getCurrentUser: async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    
    if (error.response?.status === 403) {
      console.warn('403 Forbidden - Using stored user data');
      try {
        const userString = await AsyncStorage.getItem('user');
        return userString ? JSON.parse(userString) : null;
      } catch (storageError) {
        console.error('Error getting user from storage:', storageError);
        return null;
      }
    }
    
    throw error.response?.data || error.message;
  }
},
 getUserAttempts: async (userId) => {
    try {
      const response = await api.get(`/attempts/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserDetailedStats: async (userId) => {
    try {
      const response = await api.get(`/attempts/user/${userId}/statistics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/me', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getStudents: async () => {
    try {
      const response = await api.get('/users/students');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
getStudentsByQuizId: async (quizId) => {
    try {
      const response = await api.get(`/users/quiz/${quizId}/attempts`);
      return response.data;
    } catch (error) {
      console.error('Error loading students for quiz:', error);
      throw error;
    }
  },
  getProfessors: async () => {
    try {
      const response = await api.get('/users/professors');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateUserRole: async (id, role) => {
    try {
      const response = await api.put(`/users/${id}/role?role=${role}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateUserStatus: async (id, enabled) => {
    try {
      const response = await api.put(`/users/${id}/status?enabled=${enabled}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
 
  
  deleteMyAccount: async (reason) => {
    try {
      const response = await api.delete('/users/me', {
        data: { reason: reason || 'Demande utilisateur' }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur suppression compte:', error);
      throw error;
    }
  },
 getDeletionImpact: async () => {
    try {
      const response = await api.get('/users/me/deletion-impact');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération impact:', error);
      return {
        quizAttempts: 0,
        quizzesCreated: 0,
        warning: "Impossible de charger les détails"
      };
    }
  },
  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`);
      return { success: true };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getStudentsByQuizAttempts: async (quizId) => {
    try {
      const response = await api.get(`/users/quiz/${quizId}/attempts`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};