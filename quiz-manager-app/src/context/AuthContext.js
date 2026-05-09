import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { authService } from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);


const checkUser = async () => {
  try {
    const currentUser = await authService.getCurrentUser();
    const currentToken = await authService.getToken();

    if (!currentUser || !currentUser.id || !currentUser.email) {
      await authService.logout();
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    if (currentToken && currentUser && currentUser.id) {
      const safeUser = {
        id: currentUser.id,
        email: currentUser.email || '',
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        role: currentUser.role || 'STUDENT',
        isEnabled: currentUser.isEnabled !== undefined ? currentUser.isEnabled : true
      };
      setUser(safeUser);
      setToken(currentToken);
    } else {
      await authService.logout();
      setUser(null);
      setToken(null);
    }
  } catch (error) {
    await authService.logout();
    setUser(null);
    setToken(null);
  } finally {
    setLoading(false);
  }
};

const login = async (credentials) => {
  try {
    const response = await authService.login(credentials);

    if (response.user && response.user.isEnabled === false) {
      throw new Error('Compte non activé. Veuillez vérifier votre email.');
    }

    setUser(response.user);
    setToken(response.token);

    return {
      success: true,
      data: response
    };
  } catch (error) {
    let errorMessage = 'Échec de la connexion';
    
    if (error.message.includes('non activé') || 
        error.message.includes('not verified') || 
        error.message.includes('isEnabled') ||
        error.message.includes('403')) {
      errorMessage = 'Compte non activé. Veuillez vérifier votre email.';
    } else if (error.message.includes('incorrect') || 
               error.message.includes('Invalid') ||
               error.message.includes('401')) {
      errorMessage = 'Email ou mot de passe incorrect';
    } else if (error.message.includes('network') || 
               error.message.includes('Network')) {
      errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

  const verifyEmailSuccess = async (token) => {
    try {
      const response = await authService.verifyEmail(token);
      
      if (response.user) {
        await authService.updateUserInStorage(response.user);
      }
      
      await checkUser();
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Erreur de vérification'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      Alert.alert(
        'Succès',
        'Inscription réussie! Veuillez vérifier votre email.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ]
      );
      
      return { success: true, data: response };
    } catch (error) {
      let errorMessage = "Erreur d'inscription";
      
      if (error.message.includes('already exists') || error.message.includes('déjà utilisé')) {
        errorMessage = 'Cet email est déjà utilisé';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      
      setUser(null);
      setToken(null);
      
      return { success: true };
    } catch (error) {
      setUser(null);
      setToken(null);
      
      return { 
        success: true, 
        error: error.message || 'Erreur de déconnexion' 
      };
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const isStudent = () => {
    return user?.role === 'STUDENT';
  };

  const isProfessor = () => {
    return user?.role === 'PROFESSOR';
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isStudent,
        isProfessor,
        isAdmin,
        checkUser,
        verifyEmailSuccess, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};