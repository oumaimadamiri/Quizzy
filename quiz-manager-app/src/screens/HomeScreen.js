import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, logout, isProfessor, isAdmin, isStudent } = useAuth();
  const [publishedQuizzes, setPublishedQuizzes] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (isStudent()) {
        try {
          const published = await quizService.getPublishedQuizzes();
          
          setPublishedQuizzes(published.slice(0, 3));
          
          const recentPublished = published
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
          setRecentQuizzes(recentPublished);
          
        } catch (publishedError) {
          console.error('Erreur chargement quiz publiés:', publishedError);
          setPublishedQuizzes([]);
          setRecentQuizzes([]);
        }
        
      } else {
        try {
          const published = await quizService.getPublishedQuizzes();
          setPublishedQuizzes(published.slice(0, 3));
          
          const allQuizzes = await quizService.getAllQuizzes();
          const recent = allQuizzes
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
          setRecentQuizzes(recent);
          
          if (isProfessor() || isAdmin()) {
            try {
              const myQuizData = await quizService.getMyQuizzes();
              setMyQuizzes(myQuizData.slice(0, 3));
            } catch (myQuizError) {
              console.error('Erreur chargement mes quiz:', myQuizError);
            }
          }
          
        } catch (quizError) {
          console.error('Erreur chargement quiz:', quizError);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur générale chargement données:', error);
      setLoading(false);
      
      let errorMessage = 'Erreur de chargement';
      if (error.response?.status === 403) {
        if (isStudent()) {
          errorMessage = 'Accès non autorisé. Contactez votre administrateur.';
        } else {
          errorMessage = 'Permission insuffisante.';
        }
      }
      
      console.error(errorMessage);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

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

  const renderQuizCards = (quizzes, title, onPressSeeAll, emptyMessage) => {
    if (quizzes.length === 0) {
      return (
        <View style={styles.emptySection}>
          <Icon name="clipboard-text-outline" size={40} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {quizzes.length > 0 && (
            <TouchableOpacity onPress={onPressSeeAll}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {quizzes.map((quiz) => (
            <TouchableOpacity
              key={quiz.id}
              style={styles.quizCard}
              onPress={() => {
                if (isStudent() && !quiz.isPublished) {
                  Alert.alert(
                    'Quiz non disponible',
                    'Ce quiz est en mode brouillon.'
                  );
                  return;
                }
                navigation.navigate('TakeQuiz', { 
                  quizId: quiz.id,
                  quizTitle: quiz.title 
                });
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.quizCardGradient}
              >
                <Text style={styles.quizCardTitle} numberOfLines={2}>
                  {quiz.title}
                </Text>
                <View style={styles.quizCardFooter}>
                  <View style={styles.quizCardMeta}>
                    <Icon name="help-circle" size={12} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.quizCardMetaText}>
                      {quiz.questionCount || 0} questions
                    </Text>
                  </View>
                  <View style={styles.quizCardMeta}>
                    <Icon name="clock" size={12} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.quizCardMetaText}>
                      {quiz.timeLimit || 30} min
                    </Text>
                  </View>
                </View>
                
                {!isStudent() && (
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: quiz.isPublished ? 'rgba(17, 153, 142, 0.3)' : 'rgba(255, 204, 0, 0.3)' }
                  ]}>
                    <Icon 
                      name={quiz.isPublished ? "earth" : "file-document-outline"} 
                      size={10} 
                      color="#FFF" 
                    />
                    <Text style={styles.statusText}>
                      {quiz.isPublished ? 'Publié' : 'Brouillon'}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </>
    );
  };

  const renderStudentContent = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor="#667eea"
        />
      }
    >
      <View style={styles.welcomeCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.welcomeGradient}
        >
          <Text style={styles.welcomeTitle}>Bonjour {user?.firstName || 'Étudiant'}!</Text>
          <Text style={styles.welcomeText}>
            Testez vos connaissances avec nos quiz
          </Text>
          <Icon name="school" size={60} color="rgba(255,255,255,0.2)" 
            style={styles.welcomeIcon} />
        </LinearGradient>
      </View>

      {renderQuizCards(
        publishedQuizzes,
        'Quiz disponibles',
        () => navigation.navigate('QuizList', { filter: 'published' }),
        'Aucun quiz disponible pour le moment'
      )}

   

      <View style={styles.spacer} />
    </ScrollView>
  );

  const renderProfessorContent = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor="#667eea"
        />
      }
    >
      <View style={styles.welcomeCard}>
        <LinearGradient
          colors={['#11998e', '#38ef7d']}
          style={styles.welcomeGradient}
        >
          <Text style={styles.welcomeTitle}>Bonjour Professeur {user?.firstName || ''}!</Text>
          <Text style={styles.welcomeText}>
            Gérez vos quiz et suivez vos étudiants
          </Text>
          <Icon name="account-tie" size={60} color="rgba(255,255,255,0.2)" 
            style={styles.welcomeIcon} />
        </LinearGradient>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('QuizEditor', { mode: 'create' })}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.quickActionGradient}
          >
            <Icon name="plus-circle" size={30} color="#FFF" />
            <Text style={styles.quickActionText}>Créer un quiz</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('MyQuizzes')}
        >
          <LinearGradient
            colors={['#11998e', '#38ef7d']}
            style={styles.quickActionGradient}
          >
            <Icon name="clipboard-list" size={30} color="#FFF" />
            <Text style={styles.quickActionText}>Mes quiz</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('QuizList', { filter: 'published' })}
        >
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.quickActionGradient}
          >
            <Icon name="earth" size={30} color="#FFF" />
            <Text style={styles.quickActionText}>Quiz publiés</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {renderQuizCards(
        myQuizzes,
        'Mes quiz',
        () => navigation.navigate('MyQuizzes'),
        'Créez votre premier quiz'
      )}

      {renderQuizCards(
        publishedQuizzes,
        'Quiz publiés',
        () => navigation.navigate('QuizList', { filter: 'published' }),
        'Aucun quiz publié'
      )}

    

      <View style={styles.spacer} />
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Chargement...</Text>
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
          <View style={styles.headerLeft}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'S'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.firstName || ''} {user?.lastName || ''}
              </Text>
              <Text style={styles.userRole}>
                {user?.role === 'STUDENT' ? 'Étudiant' : 
                 user?.role === 'PROFESSOR' ? 'Professeur' : 'Administrateur'}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Icon name="account" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {isStudent() ? renderStudentContent() : renderProfessorContent()}
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
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userRole: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  welcomeCard: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeGradient: {
    padding: 25,
    position: 'relative',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  welcomeIcon: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    opacity: 0.5,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    paddingRight: 10,
  },
  quizCard: {
    width: width * 0.6,
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  quizCardGradient: {
    padding: 20,
    height: 140,
    justifyContent: 'space-between',
  },
  quizCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  quizCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  quizCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quizCardMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  emptySection: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    marginBottom: 20,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  spacer: {
    height: 100,
  },
});

export default HomeScreen;