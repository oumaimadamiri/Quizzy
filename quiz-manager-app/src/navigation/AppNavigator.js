import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';

import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import QuizListScreen from '../screens/QuizListScreen';
import TakeQuizScreen from '../screens/TakeQuizScreen';
import ResultsScreen from '../screens/ResultsScreen';
import ProfileScreen from '../screens/ProfileScreen';

import ProfessorDashboardScreen from '../screens/ProfessorDashboardScreen';
import MyQuizzesScreen from '../screens/MyQuizzesScreen';
import QuizEditorScreen from '../screens/QuizEditorScreen';
import QuizAttemptsList from '../screens/QuizAttemptsList';
import QuizManagementScreen from '../screens/QuizManagementScreen';
import StudentResults from '../screens/StudentResultsScreen';

import StudentDetailsScreen from '../screens/StudentDetailsScreen';

import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f0f1e' },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="QuizList" component={QuizListScreen} />
            <Stack.Screen name="TakeQuiz" component={TakeQuizScreen} />
            <Stack.Screen name="Results" component={ResultsScreen} />
            
            {(user.role === 'PROFESSOR' || user.role === 'ADMIN') && (
              <>
              <Stack.Screen name="StudentResults" component={StudentResults} />
                <Stack.Screen name="ProfessorDashboard" component={ProfessorDashboardScreen} />
                <Stack.Screen name="MyQuizzes" component={MyQuizzesScreen} />
                <Stack.Screen name="QuizEditor" component={QuizEditorScreen} />
                <Stack.Screen name="QuizAttemptsList" component={QuizAttemptsList} />
                <Stack.Screen name="QuizManagement" component={QuizManagementScreen} />
                <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
              </>
            )}
            
            {user.role === 'ADMIN' && (
              <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;