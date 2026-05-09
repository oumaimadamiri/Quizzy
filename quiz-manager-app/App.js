import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await clearOldUser();
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const clearOldUser = async () => {
    try {
      console.log('🧹 Nettoyage AsyncStorage...');
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
      console.log('✅ AsyncStorage nettoyé');
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
    }
  };

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0f0f1e" 
        translucent={false}
      />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}