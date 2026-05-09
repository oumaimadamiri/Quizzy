import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { quizService, attemptService } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfessorDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    myQuizzes: [],
    recentAttempts: [],
    studentStats: {},
    loading: true,
    refreshing: false,
  });
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));

      const [myQuizzes, attempts] = await Promise.all([
        quizService.getMyQuizzes(),
        attemptService.getQuizAttemptsByProfessor(user.id),
      ]);

      const studentStats = {};
      attempts.forEach(attempt => {
        if (attempt.user && attempt.user.id) {
          const studentId = attempt.user.id;
          if (!studentStats[studentId]) {
            studentStats[studentId] = {
              name: attempt.userName || 'Étudiant',
              attempts: 0,
              totalScore: 0,
              passed: 0,
              recentQuizzes: new Set(),
            };
          }
          studentStats[studentId].attempts++;
          studentStats[studentId].totalScore += attempt.score || 0;
          if (attempt.passed) studentStats[studentId].passed++;
          if (attempt.quizTitle) studentStats[studentId].recentQuizzes.add(attempt.quizTitle);
        }
      });

      setDashboardData({
        myQuizzes,
        recentAttempts: attempts.slice(0, 5),
        studentStats: Object.entries(studentStats).map(([id, stats]) => ({
          id,
          ...stats,
          recentQuizzes: Array.from(stats.recentQuizzes).slice(0, 3),
        })),
        loading: false,
        refreshing: false,
      });
    } catch (error) {
      console.error('Erreur chargement dashboard professeur:', error);
      setDashboardData(prev => ({ ...prev, loading: false, refreshing: false }));
    }
  };

  const onRefresh = async () => {
    setDashboardData(prev => ({ ...prev, refreshing: true }));
    await loadDashboardData();
  };

  const renderQuizCard = (quiz) => (
    <TouchableOpacity
      key={quiz.id}
      style={styles.quizCard}
      onPress={() => navigation.navigate('QuizDetails', { quizId: quiz.id })}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.quizIcon}
      >
        <Icon name="puzzle" size={20} color="#FFF" />
      </LinearGradient>
      <View style={styles.quizInfo}>
        <Text style={styles.quizTitle}>{quiz.title}</Text>
        <Text style={styles.quizCategory}>{quiz.category}</Text>
        <View style={styles.quizStats}>
          <Icon name="account-group" size={12} color="rgba(255,255,255,0.6)" />
          <Text style={styles.quizStatsText}>{quiz.attemptCount || 0} tentatives</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
    </TouchableOpacity>
  );

  const renderStudentCard = (student) => (
    <TouchableOpacity
      key={student.id}
      style={styles.studentCard}
      onPress={() => navigation.navigate('StudentDetails', { studentId: student.id })}
    >
      <LinearGradient
        colors={['#11998e', '#38ef7d']}
        style={styles.studentAvatar}
      >
        <Text style={styles.studentAvatarText}>
          {student.name.charAt(0)}
        </Text>
      </LinearGradient>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentStats}>
          {student.attempts} tentatives • {student.passed} réussites
        </Text>
        <Text style={styles.studentQuizzes}>
          Moyenne: {student.attempts > 0 ? Math.round(student.totalScore / student.attempts) : 0} pts
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderAttemptCard = (attempt) => (
    <TouchableOpacity
      key={attempt.id}
      style={styles.attemptCard}
      onPress={() => navigation.navigate('AttemptDetails', { attemptId: attempt.id })}
    >
      <View style={[
        styles.attemptStatus,
        { backgroundColor: attempt.passed ? '#11998e' : '#f5576c' }
      ]}>
        <Icon name={attempt.passed ? "check" : "close"} size={16} color="#FFF" />
      </View>
      <View style={styles.attemptInfo}>
        <Text style={styles.attemptQuiz}>{attempt.quizTitle}</Text>
        <Text style={styles.attemptStudent}>{attempt.userName}</Text>
        <Text style={styles.attemptScore}>
          Score: {attempt.score}/{attempt.totalPoints} ({Math.round(attempt.percentage)}%)
        </Text>
      </View>
      <Text style={styles.attemptDate}>
        {new Date(attempt.completedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (dashboardData.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Chargement du tableau de bord...</Text>
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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Tableau de bord Professeur</Text>
            <Text style={styles.headerSubtitle}>Bienvenue, {user.firstName}</Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('QuizEditor', { mode: 'create' })}
          >
            <Icon name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={dashboardData.refreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
          />
        }
      >
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Mes statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.statGradient}
              >
                <Icon name="puzzle" size={28} color="#FFF" />
                <Text style={styles.statNumber}>{dashboardData.myQuizzes.length}</Text>
                <Text style={styles.statLabel}>Quiz créés</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#11998e', '#38ef7d']}
                style={styles.statGradient}
              >
                <Icon name="account-group" size={28} color="#FFF" />
                <Text style={styles.statNumber}>{dashboardData.studentStats.length}</Text>
                <Text style={styles.statLabel}>Étudiants actifs</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.statGradient}
              >
                <Icon name="history" size={28} color="#FFF" />
                <Text style={styles.statNumber}>{dashboardData.recentAttempts.length}</Text>
                <Text style={styles.statLabel}>Tentatives récentes</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes quiz</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyQuizzes')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {dashboardData.myQuizzes.length > 0 ? (
            <View style={styles.quizzesList}>
              {dashboardData.myQuizzes.slice(0, 3).map(quiz => renderQuizCard(quiz))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="puzzle-outline" size={40} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyStateText}>Aucun quiz créé</Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => navigation.navigate('QuizEditor', { mode: 'create' })}
              >
                <Text style={styles.createFirstButtonText}>Créer mon premier quiz</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes étudiants</Text>
            <TouchableOpacity onPress={() => navigation.navigate('StudentsList')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {dashboardData.studentStats.length > 0 ? (
            <View style={styles.studentsList}>
              {dashboardData.studentStats.slice(0, 5).map(student => renderStudentCard(student))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="account-group-outline" size={40} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyStateText}>Aucun étudiant actif</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tentatives récentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AttemptsList')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {dashboardData.recentAttempts.length > 0 ? (
            <View style={styles.attemptsList}>
              {dashboardData.recentAttempts.map(attempt => renderAttemptCard(attempt))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="history" size={40} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyStateText}>Aucune tentative</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('QuizEditor', { mode: 'create' })}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.quickActionGradient}
              >
                <Icon name="pencil" size={24} color="#FFF" />
                <Text style={styles.quickActionText}>Créer quiz</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('QuizManagement')}
            >
              <LinearGradient
                colors={['#11998e', '#38ef7d']}
                style={styles.quickActionGradient}
              >
                <Icon name="chart-bar" size={24} color="#FFF" />
                <Text style={styles.quickActionText}>Statistiques</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('StudentsList')}
            >
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.quickActionGradient}
              >
                <Icon name="account-group" size={24} color="#FFF" />
                <Text style={styles.quickActionText}>Étudiants</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
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
  scrollView: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  quizzesList: {
    gap: 10,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 15,
    gap: 12,
  },
  quizIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  quizCategory: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  quizStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quizStatsText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  studentsList: {
    gap: 10,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 15,
    gap: 12,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  studentStats: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  studentQuizzes: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  attemptsList: {
    gap: 10,
  },
  attemptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 15,
    gap: 12,
  },
  attemptStatus: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attemptInfo: {
    flex: 1,
  },
  attemptQuiz: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  attemptStudent: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  attemptScore: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  attemptDate: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
  },
  createFirstButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 15,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ProfessorDashboardScreen;