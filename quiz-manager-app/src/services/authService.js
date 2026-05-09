import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.warn('Accès refusé - Compte peut-être non vérifié');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, refreshToken, user } = response.data;

      try {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } catch (storageError) {
        throw new Error('Failed to save login data');
      }

      return response.data;
    } catch (error) {
      let errorMessage = 'Échec de la connexion';

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = error.response.data?.message || 'Email ou mot de passe incorrect';
        } else if (error.response.status === 403) {
          errorMessage = 'Compte non activé. Veuillez vérifier votre email.';
        } else if (error.response.status === 404) {
          errorMessage = 'Utilisateur non trouvé';
        } else if (error.response.status >= 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else {
          errorMessage = error.response.data?.message || `Erreur ${error.response.status}`;
        }
      } else if (error.request) {
        if (error.message.includes('timeout')) {
          errorMessage = "Délai d'attente dépassé. Vérifiez votre connexion internet.";
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
        } else {
          errorMessage = 'Impossible de se connecter au serveur.';
        }
      }

      throw new Error(errorMessage);
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      let errorMessage = "Échec de l'inscription";

      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Données d'inscription invalides";
        } else if (error.response.status === 409) {
          errorMessage = 'Cet email est déjà utilisé';
        } else if (error.response.status >= 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else {
          errorMessage = error.response.data?.message || `Erreur ${error.response.status}`;
        }
      } else if (error.request) {
        if (error.message.includes('timeout')) {
          errorMessage = "Délai d'attente dépassé. Vérifiez votre connexion internet.";
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
        } else {
          errorMessage = 'Impossible de se connecter au serveur.';
        }
      }

      throw new Error(errorMessage);
    }
  },

  resendVerificationEmail: async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      let errorMessage = "Impossible de renvoyer l'email de vérification";

      if (error.response?.status === 404) {
        errorMessage = 'Utilisateur non trouvé';
      } else if (error.response?.status === 400) {
        errorMessage = 'Compte déjà vérifié';
      }

      throw new Error(errorMessage);
    }
  },

  updateUserInStorage: async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
      return true;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch {
      return null;
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch {
      return null;
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });

      if (response.data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      let errorMessage = 'Erreur de vérification';

      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Token invalide ou expiré';
      } else if (error.response?.status === 404) {
        errorMessage = 'Utilisateur non trouvé';
      } else if (error.response?.status === 409) {
        errorMessage = 'Compte déjà vérifié';
      }

      throw new Error(errorMessage);
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Erreur de réinitialisation';
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Erreur de réinitialisation';
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh-token', null, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
      const { token } = response.data;
      await AsyncStorage.setItem('authToken', token);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Erreur de rafraîchissement';
    }
  },

  testConnection: async () => {
    try {
      const response = await api.get('/auth/test');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        response: error.response?.data,
      };
    }
  },
};

export default authService;
