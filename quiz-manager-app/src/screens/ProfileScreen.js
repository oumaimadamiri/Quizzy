import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userService } from '../services/api'; 
const ProfileScreen = ({ navigation }) => {
  const { user, logout, isProfessor, isAdmin, isStudent } = useAuth();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionImpact, setDeletionImpact] = useState(null);
  const [deletionReason, setDeletionReason] = useState('');
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

const loadDeletionImpact = async () => {
  try {
    if (userService && typeof userService.getDeletionImpact === 'function') {
      const impact = await userService.getDeletionImpact();
      setDeletionImpact(impact);
    } else {
      console.warn('Fonction getDeletionImpact non disponible');
      setDeletionImpact({
        quizAttempts: 0,
        quizzesCreated: 0,
        warning: "Impossible de récupérer les détails"
      });
    }
  } catch (error) {
    console.error('Erreur chargement impact:', error);
    setDeletionImpact({
      quizAttempts: 0,
      quizzesCreated: 0,
      warning: "Erreur lors du chargement des détails"
    });
  }
};
const handleDeleteAccount = () => {
  Alert.alert(
    'Supprimer votre compte',
    'Êtes-vous sûr de vouloir supprimer votre compte?\n\n' +
    'Cette action est irréversible. Vos données seront anonymisées.',
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Voir les détails',
        onPress: () => setShowDeleteModal(true),
      },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => confirmAccountDeletion(),
      },
    ]
  );
};

const confirmAccountDeletion = () => {
  Alert.alert(
    'Raison (optionnel)',
    'Pourquoi souhaitez-vous supprimer votre compte? Vous pouvez entrer une raison ci-dessous ou simplement confirmer.',
    [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Sans raison',
        style: 'default',
        onPress: () => performAccountDeletion('') 
      },
      {
        text: 'Entrer une raison',
        style: 'default',
        onPress: () => showReasonInputDialog()
      }
    ]
  );
};

const showReasonInputDialog = () => {
  setShowDeleteModal(false); 
  Alert.prompt(
    'Raison de suppression',
    'Pourquoi souhaitez-vous supprimer votre compte? (optionnel)',
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        onPress: (reason) => performAccountDeletion(reason || '')
      }
    ],
    'plain-text',
    ''
  );
};

const performAccountDeletion = async (reason) => {
  try {
    setDeleting(true);
    const result = await userService.deleteMyAccount(reason);

    if (result.success) {
      Alert.alert(
        'Compte supprimé',
        'Votre compte a été supprimé avec succès.',
        [{ text: 'OK', onPress: () => logout() }]
      );
    } else {
      Alert.alert('Erreur', result.message || 'Suppression échouée');
    }
  } catch (error) {
    console.error('❌ Erreur suppression:', error);
    Alert.alert(
      'Erreur', 
      'Impossible de supprimer le compte: ' + (error.message || 'Erreur inconnue')
    );
  } finally {
    setDeleting(false);
  }
};
useEffect(() => {

  if (user) {
    loadDeletionImpact();
  }
}, [user]);
  const getRoleIcon = () => {
    if (!user) return 'account';
    
    switch(user.role) {
      case 'ADMIN': return 'shield-account';
      case 'PROFESSOR': return 'account-tie';
      case 'STUDENT': return 'school';
      default: return 'account';
    }
  };

  const getRoleColor = () => {
    if (!user) return ['#8E8E93', '#8E8E93'];
    
    switch(user.role) {
      case 'ADMIN': return ['#f5576c', '#f093fb'];
      case 'PROFESSOR': return ['#11998e', '#38ef7d'];
      case 'STUDENT': return ['#667eea', '#764ba2'];
      default: return ['#8E8E93', '#8E8E93'];
    }
  };

  const getRoleName = () => {
    if (!user) return '';
    
    switch(user.role) {
      case 'ADMIN': return 'Administrateur';
      case 'PROFESSOR': return 'Professeur';
      case 'STUDENT': return 'Étudiant';
      default: return 'Utilisateur';
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Veuillez vous connecter</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[
      styles.container,
      { paddingTop: insets.top, paddingBottom: insets.bottom }
    ]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 20 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileSection}>
          <LinearGradient
            colors={getRoleColor()}
            style={styles.avatarContainer}
          >
            <Text style={styles.avatarText}>
              {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'S'}
            </Text>
          </LinearGradient>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {user?.firstName || ''} {user?.lastName || ''}
            </Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            
            <View style={styles.roleBadge}>
              <LinearGradient
                colors={getRoleColor()}
                style={styles.roleBadgeGradient}
              >
                <Icon name={getRoleIcon()} size={16} color="#FFF" />
                <Text style={styles.roleText}>
                  {getRoleName()}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <View style={styles.menuList}>
            {isStudent() && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('QuizList', { filter: 'published' })}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.menuIconContainer}
                >
                  <Icon name="puzzle" size={24} color="#FFF" />
                </LinearGradient>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Passer un quiz</Text>
                  <Text style={styles.menuDescription}>Trouver des quiz à passer</Text>
                </View>
                <Icon name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            )}

            {isProfessor() && (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigation.navigate('QuizEditor', { mode: 'create' })}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.menuIconContainer}
                  >
                    <Icon name="plus-circle" size={24} color="#FFF" />
                  </LinearGradient>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Créer un quiz</Text>
                    <Text style={styles.menuDescription}>Créer un nouveau quiz</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigation.navigate('MyQuizzes')}
                >
                  <LinearGradient
                    colors={['#11998e', '#38ef7d']}
                    style={styles.menuIconContainer}
                  >
                    <Icon name="clipboard-list" size={24} color="#FFF" />
                  </LinearGradient>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Mes quiz</Text>
                    <Text style={styles.menuDescription}>Gérer mes quiz</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigation.navigate('QuizList', { filter: 'published' })}
                >
                  <LinearGradient
                    colors={['#FA8BFF', '#2BD2FF']}
                    style={styles.menuIconContainer}
                  >
                    <Icon name="earth" size={24} color="#FFF" />
                  </LinearGradient>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Quiz publiés</Text>
                    <Text style={styles.menuDescription}>Voir tous les quiz publics</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </>
            )}

            {isAdmin() && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('AdminDashboard')}
              >
                <LinearGradient
                  colors={['#f5576c', '#f093fb']}
                  style={styles.menuIconContainer}
                >
                  <Icon name="shield-account" size={24} color="#FFF" />
                </LinearGradient>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Tableau de bord</Text>
                  <Text style={styles.menuDescription}>Administration système</Text>
                </View>
                <Icon name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LinearGradient
            colors={['#f5576c', '#f093fb']}
            style={styles.logoutButtonGradient}
          >
            <Icon name="logout" size={20} color="#FFF" />
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </LinearGradient>
        </TouchableOpacity>
<TouchableOpacity
  style={styles.deleteAccountButton}
  onPress={handleDeleteAccount}
  disabled={deleting}
>
  <LinearGradient
    colors={['#ff416c', '#ff4b2b']}
    style={styles.deleteAccountButtonGradient}
  >
    {deleting ? (
      <ActivityIndicator size="small" color="#FFF" />
    ) : (
      <Icon name="delete-forever" size={20} color="#FFF" />
    )}
    <Text style={styles.deleteAccountButtonText}>
      {deleting ? 'Suppression...' : 'Supprimer mon compte'}
    </Text>
  </LinearGradient>
</TouchableOpacity>
<Modal
  visible={showDeleteModal}
  transparent
  animationType="slide"
  onRequestClose={() => setShowDeleteModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Impact de la suppression</Text>
      
      {deletionImpact && (
        <View style={styles.impactList}>
          <Text style={styles.impactItem}>
            • {deletionImpact.quizAttempts || 0} tentative(s) seront anonymisées
          </Text>
          {deletionImpact.quizzesCreated > 0 && (
            <Text style={styles.impactItem}>
              • {deletionImpact.quizzesCreated} quiz(s) resteront accessibles
            </Text>
          )}
          <Text style={styles.impactItem}>
            • Vos informations personnelles seront supprimées
          </Text>
          <Text style={styles.impactItem}>
            • Vous ne pourrez plus vous connecter
          </Text>
        </View>
      )}
      
      <Text style={styles.modalWarning}>
        ⚠️ Cette action est irréversible
      </Text>
      
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.modalButtonCancel}
          onPress={() => setShowDeleteModal(false)}
        >
          <Text style={styles.modalButtonCancelText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modalButtonDelete}
          onPress={() => {
            setShowDeleteModal(false);
            confirmAccountDeletion();
          }}
        >
          <Text style={styles.modalButtonDeleteText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
      </ScrollView>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1e',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFF',
    fontSize: 16,
  },
  header: {
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
   deleteAccountButton: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteAccountButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  deleteAccountButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  impactList: {
    marginBottom: 20,
  },
  impactItem: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    paddingLeft: 10,
  },
  modalWarning: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff416c',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonDelete: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#ff416c',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonDeleteText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 15,
  },
  roleBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  roleBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  roleText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  menuList: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 15,
    gap: 12,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;