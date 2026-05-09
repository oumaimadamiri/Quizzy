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

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    const { firstName, lastName, email, password, confirmPassword, role } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

      setLoading(true);
  try {
    await authService.register({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    Alert.alert(
      'Succès',
      'Inscription réussie! Veuillez vérifier votre email pour activer votre compte.',
      [
        {
          text: 'Vérifier maintenant',
          onPress: () => {
            navigation.replace('VerifyEmail', { email });
          },
        },
        {
          text: 'Plus tard',
          onPress: () => navigation.replace('Login'),
          style: 'cancel'
        },
      ]
    );
  } catch (error) {
    Alert.alert('Erreur', error.message || 'Échec de l\'inscription');
  } finally {
    setLoading(false);
  }
};
  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Créer un compte</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={styles.nameInput}>
              <Text style={styles.inputLabel}>Prénom *</Text>
              <View style={styles.inputGroup}>
                <Icon name="account-outline" size={20} color="#667eea" />
                <TextInput
                  style={styles.input}
                  placeholder="Prénom"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                />
              </View>
            </View>

            <View style={styles.nameInput}>
              <Text style={styles.inputLabel}>Nom *</Text>
              <View style={styles.inputGroup}>
                <Icon name="account-outline" size={20} color="#667eea" />
                <TextInput
                  style={styles.input}
                  placeholder="Nom"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Icon name="email-outline" size={20} color="#667eea" />
            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Icon name="lock-outline" size={20} color="#667eea" />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe *"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#667eea"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Icon name="lock-check-outline" size={20} color="#667eea" />
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe *"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color="#667eea"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.roleSelection}>
            <Text style={styles.roleLabel}>Je suis un :</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={styles.roleButton}
                onPress={() => handleRoleChange('STUDENT')}
              >
                <LinearGradient
                  colors={formData.role === 'STUDENT' ? ['#667eea', '#764ba2'] : ['#2a2a3e', '#2a2a3e']}
                  style={styles.roleButtonGradient}
                >
                  <Icon name="school" size={24} color="#FFF" />
                  <Text style={styles.roleButtonText}>Étudiant</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roleButton}
                onPress={() => handleRoleChange('PROFESSOR')}
              >
                <LinearGradient
                  colors={formData.role === 'PROFESSOR' ? ['#11998e', '#38ef7d'] : ['#2a2a3e', '#2a2a3e']}
                  style={styles.roleButtonGradient}
                >
                  <Icon name="account-tie" size={24} color="#FFF" />
                  <Text style={styles.roleButtonText}>Professeur</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={styles.registerButton}
          >
            <LinearGradient
              colors={['#11998e', '#38ef7d']}
              style={styles.registerButtonGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Icon name="account-plus" size={20} color="#FFF" />
                  <Text style={styles.registerButtonText}>S'inscrire</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Déjà un compte ?{' '}
              <Text style={styles.loginTextBold}>Se connecter</Text>
            </Text>
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
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  header: {
 marginBottom: 25,
marginTop:25,  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  form: {
    marginBottom: 30,
    marginTop: 13, 
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  nameInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  roleSelection: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  roleButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    gap: 8,
  },
  roleButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  loginText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  loginTextBold: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default RegisterScreen;