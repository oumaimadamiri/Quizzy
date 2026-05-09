import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/authService'; 

const VerifyEmailScreen = ({ navigation, route }) => {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState(route.params?.email || '');
  const [loading, setLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const handleVerifyEmail = async () => {
    if (!token.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le code de vérification');
      return;
    }

    setLoading(true);

    try {
      await authService.verifyEmail(token);
      setVerificationSuccess(true);
      Alert.alert(
        'Succès!',
        'Votre email a été vérifié avec succès! Vous pouvez maintenant vous connecter.',
        [{ text: 'Se connecter', onPress: () => navigation.replace('Login') }],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert(
        'Erreur de vérification',
        error.message || 'Le code de vérification est invalide ou a expiré'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    try {
      Alert.alert(
        'Info',
        'Pour renvoyer le code, veuillez réessayer l\'inscription ou contacter le support.'
      );
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de renvoyer le code');
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.logoContainer}
          >
            <Icon name="email-check" size={60} color="#FFF" />
          </LinearGradient>
          <Text style={styles.title}>Vérification d'email</Text>
          <Text style={styles.subtitle}>
            {verificationSuccess 
              ? 'Vérification réussie!'
              : 'Entrez le code reçu par email'}
          </Text>
        </View>

        <View style={styles.form}>
          {!verificationSuccess ? (
            <>
              {!route.params?.email && (
                <View style={styles.inputGroup}>
                  <Icon name="email-outline" size={24} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Votre adresse email"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Icon name="key" size={24} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Code de vérification"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={token}
                  onChangeText={setToken}
                  maxLength={50}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Text style={styles.instructions}>
                Entrez le code de vérification que vous avez reçu par email.
                Vérifiez également votre dossier spam.
              </Text>

              <TouchableOpacity
                onPress={() => {
                  const testToken = "b8dcaf1e-7a0a-4765-a750-ce379494455b";
                  setToken(testToken);
                  Alert.alert('Info', 'Token de test rempli');
                }}
                style={styles.testButton}
              >
                <Text style={styles.testButtonText}>
                  Utiliser le token de test
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleVerifyEmail}
                disabled={loading}
                style={styles.verifyButton}
              >
                <LinearGradient
                  colors={['#11998e', '#38ef7d']}
                  style={styles.verifyButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Icon name="check-circle" size={20} color="#FFF" />
                      <Text style={styles.verifyButtonText}>Vérifier l'email</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

            </>
          ) : (
            <View style={styles.successMessage}>
              <Icon name="check-circle" size={80} color="#11998e" />
              <Text style={styles.successTitle}>Vérification réussie!</Text>
              <Text style={styles.successText}>
                Votre compte a été activé avec succès. 
                Vous pouvez maintenant vous connecter.
              </Text>
              
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.replace('Login')}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>Se connecter maintenant</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate('Login')}
          >
            <Icon name="arrow-left" size={20} color="#667eea" />
            <Text style={styles.backToLoginText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 15,
  },
  instructions: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFC107',
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFC107',
    fontSize: 14,
    fontWeight: '600',
  },
  verifyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  verifyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  successMessage: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#11998e',
    marginVertical: 15,
  },
  successText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  loginButton: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 10,
    marginTop: 20,
  },
  backToLoginText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VerifyEmailScreen;