import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { quizService } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AdminDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProfessors: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    recentUsers: [],
    recentQuizzes: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [users, quizzes, professors] = await Promise.all([
        userService.getAllUsers(),
        quizService.getAllQuizzes(),
        userService.getProfessors(),
      ]);

      const students = users.filter(u => u.role === 'STUDENT');
      
      setDashboardData({
        totalUsers: users.length,
        totalProfessors: professors.length,
        totalStudents: students.length,
        totalQuizzes: quizzes.length,
        recentUsers: users.slice(0, 5),
        recentQuizzes: quizzes.slice(0, 5),
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'ADMIN': return 'shield-account';
      case 'PROFESSOR': return 'account-tie';
      case 'STUDENT': return 'school';
      default: return 'account';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'ADMIN': return ['#f5576c', '#f093fb'];
      case 'PROFESSOR': return ['#11998e', '#38ef7d'];
      case 'STUDENT': return ['#667eea', '#764ba2'];
      default: return ['#8E8E93', '#8E8E93'];
    }
  };

  const renderUserCard = (user) => (
    <TouchableOpacity
      key={user.id}
      style={styles.userCard}
      onPress={() => navigation.navigate('UserDetails', { userId: user.id })}
    >
      <LinearGradient
        colors={getRoleColor(user.role)}
        style={styles.userAvatar}
      >
        <Text style={styles.userAvatarText}>
          {user.firstName?.[0]}{user.lastName?.[0]}
        </Text>
      </LinearGradient>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.userRole}>
          <Icon name={getRoleIcon(user.role)} size={12} color="#FFF" />
          <Text style={styles.userRoleText}>
            {user.role === 'PROFESSOR' ? 'Professeur' : 
             user.role === 'ADMIN' ? 'Administrateur' : 'Étudiant'}
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
    </TouchableOpacity>
  );

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
        <Text style={styles.quizCategory}>{quiz.category || 'Non catégorisé'}</Text>
        <View style={styles.quizMeta}>
          <Icon name={quiz.isPublished ? "earth" : "file-document-outline"} size={12} color="rgba(255,255,255,0.6)" />
          <Text style={styles.quizMetaText}>
            {quiz.isPublished ? 'Publié' : 'Brouillon'} • {quiz.questionCount || 0} questions
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
    </TouchableOpacity>
  );

  if (loading) {
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Tableau de bord</Text>
            <Text style={styles.headerSubtitle}>Administration</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadDashboardData}
          >
            <Icon name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
          />
        }
      >
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Aperçu général</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.statGradient}
              >
                <Icon name="account-group" size={28} color="#FFF" />
                <Text style={styles.statNumber}>{dashboardData.totalUsers}</Text>
                <Text style={styles.statLabel}>Utilisateurs</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#11998e', '#38ef7d']}
                style={styles.statGradient}
              >
                <Icon name="account-tie" size={28} color="#FFF" />
                <Text style={styles.statNumber}>{dashboardData.totalProfessors}</Text>
                <Text style={styles.statLabel}>Professeurs</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.statGradient}
              >
                <Icon name="school" size={28} color="#FFF" />
                <Text style={styles.statNumber}>{dashboardData.totalStudents}</Text>
                <Text style={styles.statLabel}>Étudiants</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#FA8BFF', '#2BD2FF']}
                style={styles.statGradient}
              >
                <Icon name="puzzle" size={28} color="#FFF" />
                <Text style={styles.statNumber}>{dashboardData.totalQuizzes}</Text>
                <Text style={styles.statLabel}>Quiz</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('UserManagement')}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.quickActionGradient}
              >
                <Icon name="account-multiple-plus" size={28} color="#FFF" />
                <Text style={styles.quickActionText}>Gérer les utilisateurs</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('QuizList', { filter: 'all' })}
            >
              <LinearGradient
                colors={['#11998e', '#38ef7d']}
                style={styles.quickActionGradient}
              >
                <Icon name="clipboard-list" size={28} color="#FFF" />
                <Text style={styles.quickActionText}>Gérer les quiz</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Utilisateurs récents</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UserManagement')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {dashboardData.recentUsers.length > 0 ? (
            <View style={styles.usersList}>
              {dashboardData.recentUsers.map(user => renderUserCard(user))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="account-group-outline" size={40} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyStateText}>Aucun utilisateur</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quiz récents</Text>
            <TouchableOpacity onPress={() => navigation.navigate('QuizList', { filter: 'all' })}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {dashboardData.recentQuizzes.length > 0 ? (
            <View style={styles.quizzesList}>
              {dashboardData.recentQuizzes.map(quiz => renderQuizCard(quiz))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="clipboard-text-outline" size={40} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyStateText}>Aucun quiz</Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('SystemSettings')}
          >
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              style={styles.actionButtonGradient}
            >
              <Icon name="cog" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Paramètres système</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Reports')}
          >
            <LinearGradient
              colors={['#FA8BFF', '#2BD2FF']}
              style={styles.actionButtonGradient}
            >
              <Icon name="chart-bar" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Rapports</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  refreshButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
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
    padding: 20,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 10,
    textAlign: 'center',
  },
  usersList: {
    gap: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 15,
    gap: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  userRole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userRoleText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
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
  quizMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quizMetaText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;