import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/apiConfig';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération du token:', error);
    }
    return config;
  },
  (error) => {
    console.error('Erreur intercepteur requête:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Erreur API:', error.response?.status, error.message);
    

    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.warn('Non authentifié - Redirection vers login');
          break;
        case 403:
          console.warn('Accès refusé - Permission insuffisante');
          break;
        case 404:
          console.warn('Ressource non trouvée');
          break;
        case 500:
          console.warn('Erreur serveur');
          break;
        default:
          console.warn('Erreur HTTP:', error.response.status);
      }
    } else if (error.request) {
      console.warn('Pas de réponse du serveur. Vérifiez votre connexion internet.');
    } else {
      console.warn('Erreur de configuration:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const quizService = {
  getAllQuizzes: async () => {
    try {
      const response = await api.get('/quizzes');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des quiz:', error);
      throw error;
    }
  },

  getPublishedQuizzes: async () => {
    try {
      const response = await api.get('/quizzes/published');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des quiz publiés:', error);
      throw error;
    }
  },

  getQuizById: async (id) => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du quiz ${id}:`, error);
      throw error;
    }
  },

  createQuiz: async (quizData) => {
    try {
      const response = await api.post('/quizzes', quizData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du quiz:', error);
      throw error;
    }
  },

  updateQuiz: async (id, quizData) => {
    try {
      const response = await api.put(`/quizzes/${id}`, quizData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du quiz ${id}:`, error);
      throw error;
    }
  },

  deleteQuiz: async (id) => {
    try {
      await api.delete(`/quizzes/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Erreur lors de la suppression du quiz ${id}:`, error);
      throw error;
    }
  },

  generateRandomQuiz: async (category, questions = 10, userId = null) => {
    try {
      const params = { category, questions };
      if (userId) params.userId = userId;
      
      const response = await api.post('/quizzes/generate-random', null, { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération du quiz aléatoire:', error);
      throw error;
    }
  },

  submitQuiz: async (quizId, submitData) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/submit`, submitData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la soumission du quiz ${quizId}:`, error);
      throw error;
    }
  },

  getQuizStatistics: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/statistics`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des statistiques du quiz ${quizId}:`, error);
      throw error;
    }
  },

  searchQuizzes: async (title = null, category = null, published = null) => {
    try {
      const params = {};
      if (title) params.title = title;
      if (category) params.category = category;
      if (published !== null) params.published = published;
      
      const response = await api.get('/quizzes/search', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche des quiz:', error);
      throw error;
    }
  },
verifyQuizAccessCode: async (quizId, accessCode) => {
  try {
    const response = await api.post(`/quizzes/${quizId}/verify-access-code`, { accessCode });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la vérification du code d'accès pour le quiz ${quizId}:`, error);
    throw error;
  }
},
getQuizForTaking: async (quizId, randomize = false, accessCode = null) => {
  try {
    const params = { randomize };
    if (accessCode) {
      params.accessCode = accessCode;
    }
    
    const response = await api.get(`/quizzes/${quizId}/take`, { params });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du quiz ${quizId} pour passage:`, error);
    throw error;
  }
},
getQuizzesForProfessor: async (professorId) => {
    try {
      const response = await api.get(`/quizzes/professor/${professorId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des quiz du professeur ${professorId}:`, error);
      throw error;
    }
  },

  getMyQuizzes: async () => {
    try {
      const response = await api.get('/quizzes/mine');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de mes quiz:', error);
      throw error;
    }
  },

  getQuizAttemptsForProfessor: async (professorId) => {
    try {
      const response = await api.get(`/quizzes/professor/${professorId}/attempts`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des tentatives du professeur ${professorId}:`, error);
      throw error;
    }
  },

  getQuizAttemptsForProfessorQuiz: async (professorId, quizId) => {
    try {
      const response = await api.get(`/quizzes/professor/${professorId}/quiz/${quizId}/attempts`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des tentatives du quiz ${quizId}:`, error);
      throw error;
    }
  },

  getStudentsResultsForProfessor: async (professorId) => {
    try {
      const response = await api.get(`/quizzes/professor/${professorId}/students-results`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des résultats étudiants pour le professeur ${professorId}:`, error);
      throw error;
    }
  },

  getQuizAttemptsByStudent: async (quizId, studentId) => {
    try {
      const response = await api.get(`/quizzes/quiz/${quizId}/students`, {
        params: { studentId }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des tentatives de l'étudiant ${studentId}:`, error);
      throw error;
    }
  }
};
export const questionService = {
  getQuestionById: async (id) => {
    try {
      const response = await api.get(`/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la question ${id}:`, error);
      throw error;
    }
  },

  getQuestionsByQuizId: async (quizId) => {
    try {
      const response = await api.get(`/questions/quiz/${quizId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des questions du quiz ${quizId}:`, error);
      throw error;
    }
  },

  getQuestionsByCategory: async (category) => {
    try {
      const response = await api.get(`/questions/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des questions de la catégorie ${category}:`, error);
      throw error;
    }
  },

  getRandomQuestionsByCategory: async (category, limit = 10) => {
    try {
      const response = await api.get(`/questions/random/${category}`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des questions aléatoires pour ${category}:`, error);
      throw error;
    }
  },

  countQuestionsByQuizId: async (quizId) => {
    try {
      const response = await api.get(`/questions/count/${quizId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du comptage des questions du quiz ${quizId}:`, error);
      throw error;
    }
  },
};

export const attemptService = {
  getUserAttempts: async (userId) => {
    try {
      const response = await api.get(`/attempts/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des tentatives de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  getAttemptById: async (attemptId) => {
    try {
      const response = await api.get(`/attempts/${attemptId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la tentative ${attemptId}:`, error);
      throw error;
    }
  },

  getQuizAttempts: async (quizId) => {
    try {
      const response = await api.get(`/attempts/quiz/${quizId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des tentatives du quiz ${quizId}:`, error);
      throw error;
    }
  },
getQuizAttemptsByStudent: async (quizId, studentId) => {
    try {
      const response = await api.get(`/attempts/quiz/${quizId}/students`, {
        params: { studentId }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des tentatives de l'étudiant ${studentId}:`, error);
      throw error;
    }
  },
  getUserStatistics: async (userId) => {
    try {
      const response = await api.get(`/attempts/user/${userId}/statistics`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des statistiques de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  getQuizLeaderboard: async (quizId) => {
    try {
      const response = await api.get(`/attempts/quiz/${quizId}/leaderboard`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du leaderboard du quiz ${quizId}:`, error);
      throw error;
    }
  },
getQuizAttemptsByProfessor: async (professorId) => {
    try {
      const response = await api.get(`/attempts/professor/${professorId}/students-results`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des tentatives du professeur ${professorId}:`, error);
      throw error;
    }
  },

  getQuizAttemptsByProfessorAndQuiz: async (professorId, quizId) => {
    try {
      const response = await api.get(`/attempts/professor/${professorId}/quiz/${quizId}/attempts`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des tentatives du quiz ${quizId} pour le professeur ${professorId}:`, error);
      throw error;
    }
  }
};

export const testConnection = async () => {
  try {
    const response = await api.get('/quizzes');
    return {
      success: true,
      message: `Connecté avec succès! ${response.data.length} quiz disponibles.`,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erreur de connexion au serveur',
      error: error.message,
    };
  }
};


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
  getDeletionImpact: async () => {
    try {
      const response = await api.get('/users/me/deletion-impact');
      return response.data;
    } catch (error) {
      return {
        quizAttempts: 0,
        quizzesCreated: 0,
        warning: "Impossible de charger les détails"
      };
    }
  },
  deleteMyAccount: async (reason) => {
    try {
      const response = await api.delete('/users/me', {
        data: { reason: reason || 'Demande utilisateur' }
      });
      return response.data;
    } catch (error) {
      throw error;
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



export const formatError = (error) => {
  if (error.response) {
    return error.response.data?.message || `Erreur ${error.response.status}`;
  } else if (error.request) {
    return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
  } else {
    return error.message || 'Une erreur est survenue';
  }
};
