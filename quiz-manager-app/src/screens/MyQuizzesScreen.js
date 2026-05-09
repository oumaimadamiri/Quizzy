import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { quizService, attemptService } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MyQuizzesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [quizStats, setQuizStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadMyQuizzes();
  }, []);

  const loadMyQuizzes = async () => {
    try {
      setLoading(true);
      
      const myQuizzes = await quizService.getMyQuizzes();
      setQuizzes(myQuizzes);
      
      const stats = {};
      for (const quiz of myQuizzes) {
        try {
          const attempts = await attemptService.getQuizAttempts(quiz.id);
          stats[quiz.id] = {
            attempts: attempts.length,
            avgScore: attempts.length > 0 
              ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
              : 0,
            passed: attempts.filter(a => a.passed).length,
          };
        } catch (error) {
          console.error(`Error loading stats for quiz ${quiz.id}:`, error);
          stats[quiz.id] = { attempts: 0, avgScore: 0, passed: 0 };
        }
      }
      
      setQuizStats(stats);
      setLoading(false);
    } catch (error) {
      console.error('Error loading my quizzes:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyQuizzes();
    setRefreshing(false);
  };

  const getQuizStatusColor = (quiz) => {
    if (!quiz.isPublished) return ['#8E8E93', '#8E8E93']; 
    if (quizStats[quiz.id]?.attempts > 0) return ['#11998e', '#38ef7d']; 
    return ['#667eea', '#764ba2']; 
  };

  const handleDeleteQuiz = (quizId) => {
    Alert.alert(
      'Supprimer le quiz',
      'Êtes-vous sûr de vouloir supprimer ce quiz? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await quizService.deleteQuiz(quizId);
              Alert.alert('Succès', 'Quiz supprimé avec succès');
              loadMyQuizzes(); 
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le quiz');
            }
          }
        }
      ]
    );
  };

  const renderQuizItem = ({ item: quiz, index }) => {
    const stats = quizStats[quiz.id] || { attempts: 0, avgScore: 0, passed: 0 };
    
    return (
      <TouchableOpacity
        style={styles.quizCard}
        onPress={() => {
          navigation.navigate('QuizEditor', { 
            quizId: quiz.id,
            mode: 'edit'
          });
        }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={getQuizStatusColor(quiz)}
          style={styles.quizCardGradient}
        >
          <View style={styles.quizHeader}>
            <View style={styles.quizTitleContainer}>
              <Text style={styles.quizTitle} numberOfLines={2}>
                {quiz.title || 'Sans titre'}
              </Text>
              <View style={styles.quizStatus}>
                <Icon 
                  name={quiz.isPublished ? "earth" : "file-document-outline"} 
                  size={14} 
                  color="rgba(255,255,255,0.8)" 
                />
                <Text style={styles.quizStatusText}>
                  {quiz.isPublished ? 'Publié' : 'Brouillon'}
                </Text>
              </View>
            </View>
            <View style={styles.quizNumberContainer}>
              <LinearGradient
                colors={['#FFFFFF', '#F5F5F5']}
                style={styles.quizNumber}
              >
                <Text style={styles.quizNumberText}>#{index + 1}</Text>
              </LinearGradient>
            </View>
          </View>

          {quiz.category && (
            <Text style={styles.quizCategory}>
              Catégorie: {quiz.category}
            </Text>
          )}

          {quiz.description && (
            <Text style={styles.quizDescription} numberOfLines={2}>
              {quiz.description}
            </Text>
          )}

          <View style={styles.quizStats}>
            <View style={styles.statItem}>
              <Icon name="help-circle" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>
                {quiz.questionCount || 0} questions
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="account-group" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>
                {stats.attempts} tentatives
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="chart-line" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>
                {stats.avgScore}% moyen
              </Text>
            </View>
          </View>

          {stats.attempts > 0 && (
            <View style={styles.performance}>
              <View style={styles.performanceItem}>
                <Icon name="check-circle" size={14} color="#38ef7d" />
                <Text style={styles.performanceText}>
                  {stats.passed} réussites
                </Text>
              </View>
              
              <View style={styles.performanceItem}>
                <Icon name="close-circle" size={14} color="#f5576c" />
                <Text style={styles.performanceText}>
                  {stats.attempts - stats.passed} échecs
                </Text>
              </View>
            </View>
          )}

          <View style={styles.quizActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('QuizEditor', { 
                  quizId: quiz.id,
                  mode: 'edit'
                });
              }}
            >
              <Icon name="pencil" size={16} color="#667eea" />
              <Text style={styles.actionButtonText}>Modifier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('StudentResults', { 
                  quizId: quiz.id,
                  quizTitle: quiz.title
                });
              }}
            >
              <Icon name="account-group" size={16} color="#11998e" />
              <Text style={styles.actionButtonText}>Résultats</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: 'rgba(245, 87, 108, 0.1)' }]}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteQuiz(quiz.id);
              }}
            >
              <Icon name="delete" size={16} color="#f5576c" />
              <Text style={[styles.actionButtonText, { color: '#f5576c' }]}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Chargement de vos quiz...</Text>
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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Mes Quiz</Text>
            <Text style={styles.headerSubtitle}>
              {quizzes.length} quiz créé{quizzes.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('QuizEditor', { mode: 'create' })}
          >
            <Icon name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {quizzes.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="puzzle-outline" size={80} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyStateTitle}>Aucun quiz créé</Text>
          <Text style={styles.emptyStateText}>
            Commencez par créer votre premier quiz pour vos étudiants
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate('QuizEditor', { mode: 'create' })}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.createFirstButtonGradient}
            >
              <Icon name="plus" size={20} color="#FFF" />
              <Text style={styles.createFirstButtonText}>Créer un quiz</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={quizzes}
          renderItem={renderQuizItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#667eea"
            />
          }
          ListHeaderComponent={
            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                Gérer et modifier vos quiz. Cliquez sur un quiz pour voir les détails.
              </Text>
            </View>
          }
        />
      )}
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
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 30,
  },
  createFirstButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  createFirstButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  createFirstButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  summary: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  summaryText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  quizCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  quizCardGradient: {
    padding: 20,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quizTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  quizStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quizStatusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  quizNumberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quizNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  quizCategory: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  quizDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 15,
    lineHeight: 18,
  },
  quizStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  performance: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  performanceText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  quizActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default MyQuizzesScreen;