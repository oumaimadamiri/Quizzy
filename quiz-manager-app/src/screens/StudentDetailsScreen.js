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
import { attemptService, userService } from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StudentDetailsScreen = ({ navigation, route }) => {
  const { studentId, studentName, quizId, quizTitle } = route.params || {};
  const { user } = useAuth();
  const [studentDetails, setStudentDetails] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadStudentDetails();
  }, [studentId, quizId]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);
      
      let studentData = { id: studentId, name: studentName };

      try {
        const userDetails = await userService.getUserById(studentId);
        studentData = { ...studentData, ...userDetails };
      } catch (userError) {
      }

      let quizAttempts = [];
      try {
        quizAttempts = await attemptService.getQuizAttemptsByStudent(quizId, studentId);
      } catch (specificError) {
        console.warn('Erreur endpoint spécifique, fallback:', specificError);
        try {
          const allAttempts = await attemptService.getQuizAttempts(quizId);
          quizAttempts = allAttempts.filter(attempt => 
            attempt.userId === studentId || 
            attempt.user?.id === studentId
          );
        } catch (fallbackError) {
          console.error('Erreur fallback:', fallbackError);
        }
      }

      setStudentDetails(studentData);
      setAttempts(quizAttempts);
      setLoading(false);

    } catch (error) {
      console.error('Erreur générale chargement détails étudiant:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudentDetails();
    setRefreshing(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return ['#11998e', '#38ef7d'];
    if (score >= 60) return ['#FFCC00', '#FFB800'];
    return ['#f5576c', '#f093fb'];
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString || 'Date inconnue';
    }
  };

  const calculateStats = () => {
    if (attempts.length === 0) {
      return {
        bestScore: 0,
        avgScore: 0,
        totalAttempts: 0,
        passedCount: 0,
        failedCount: 0
      };
    }

    const scores = attempts.map(a => a.percentage || 0);
    const bestScore = Math.max(...scores);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const passedCount = attempts.filter(a => a.passed).length;
    const failedCount = attempts.length - passedCount;

    return {
      bestScore: Math.round(bestScore),
      avgScore: Math.round(avgScore),
      totalAttempts: attempts.length,
      passedCount,
      failedCount
    };
  };

  const renderAttemptItem = (attempt, index) => {
    const scoreColors = getScoreColor(attempt.percentage || 0);
    const isBest = attempt.percentage === Math.max(...attempts.map(a => a.percentage || 0));

    return (
      <TouchableOpacity
        key={attempt.id || index}
        style={styles.attemptCard}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={scoreColors}
          style={styles.attemptCardGradient}
        >
          <View style={styles.attemptHeader}>
            <View style={styles.attemptNumber}>
              <Text style={styles.attemptNumberText}>Tentative {index + 1}</Text>
              {isBest && (
                <View style={styles.bestBadge}>
                  <Icon name="trophy" size={12} color="#FFCC00" />
                  <Text style={styles.bestBadgeText}>Meilleur</Text>
                </View>
              )}
            </View>
            <Text style={styles.attemptDate}>
              {formatDate(attempt.completedAt)}
            </Text>
          </View>

          <View style={styles.attemptStats}>
            <View style={styles.statItem}>
              <Icon name="percent" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>{Math.round(attempt.percentage || 0)}%</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>

            <View style={styles.statItem}>
              <Icon name="scoreboard" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>{attempt.score || 0}/{attempt.totalPoints || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>

            <View style={styles.statItem}>
              <Icon 
                name={attempt.passed ? "check-circle" : "close-circle"} 
                size={16} 
                color={attempt.passed ? '#11998e' : '#f5576c'} 
              />
              <Text style={[
                styles.statValue,
                { color: attempt.passed ? '#11998e' : '#f5576c' }
              ]}>
                {attempt.passed ? 'Réussi' : 'Échoué'}
              </Text>
              <Text style={styles.statLabel}>Statut</Text>
            </View>
          </View>

          {attempt.timeTaken && (
            <View style={styles.timeInfo}>
              <Icon name="clock-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.timeText}>
                Temps: {Math.floor(attempt.timeTaken / 60)}:{(attempt.timeTaken % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  const stats = calculateStats();

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
            <Text style={styles.headerTitle} numberOfLines={1}>
              {studentDetails?.name || studentName}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {quizTitle}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
          />
        }
      >
        <View style={styles.studentInfoSection}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.studentInfoCard}
          >
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>
                {(studentDetails?.name || studentName).charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>
                {studentDetails?.name || studentName}
              </Text>
              {studentDetails?.email && (
                <Text style={styles.studentEmail}>
                  {studentDetails.email}
                </Text>
              )}
              <Text style={styles.quizTitle}>
                Quiz: {quizTitle}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#11998e', '#38ef7d']}
                style={styles.statCardGradient}
              >
                <Icon name="trophy" size={24} color="#FFF" />
                <Text style={styles.statCardNumber}>{stats.bestScore}%</Text>
                <Text style={styles.statCardLabel}>Meilleur score</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.statCardGradient}
              >
                <Icon name="chart-line" size={24} color="#FFF" />
                <Text style={styles.statCardNumber}>{stats.avgScore}%</Text>
                <Text style={styles.statCardLabel}>Moyenne</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.statCardGradient}
              >
                <Icon name="repeat" size={24} color="#FFF" />
                <Text style={styles.statCardNumber}>{stats.totalAttempts}</Text>
                <Text style={styles.statCardLabel}>Tentatives</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={stats.passedCount > stats.failedCount ? 
                  ['#34C759', '#30D158'] : 
                  ['#FF3B30', '#FF453A']}
                style={styles.statCardGradient}
              >
                <Icon 
                  name={stats.passedCount > stats.failedCount ? "check-circle" : "close-circle"} 
                  size={24} 
                  color="#FFF" 
                />
                <Text style={styles.statCardNumber}>
                  {stats.passedCount}/{stats.totalAttempts}
                </Text>
                <Text style={styles.statCardLabel}>Réussites</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historique des tentatives</Text>
            <Text style={styles.attemptsCount}>
              {attempts.length} tentative{attempts.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          {attempts.length === 0 ? (
            <View style={styles.noAttempts}>
              <Icon name="clipboard-text-outline" size={60} color="rgba(255,255,255,0.2)" />
              <Text style={styles.noAttemptsText}>
                Aucune tentative pour ce quiz
              </Text>
            </View>
          ) : (
            <>
              {attempts.map((attempt, index) => renderAttemptItem(attempt, index))}
              
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Résumé des performances</Text>
                <View style={styles.summaryStats}>
                  <View style={styles.summaryStat}>
                    <Icon name="trending-up" size={16} color="#11998e" />
                    <Text style={styles.summaryStatText}>
                      Meilleur score: {stats.bestScore}%
                    </Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Icon name="chart-bar" size={16} color="#667eea" />
                    <Text style={styles.summaryStatText}>
                      Moyenne: {stats.avgScore}%
                    </Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Icon name="check-circle" size={16} color="#34C759" />
                    <Text style={styles.summaryStatText}>
                      Réussites: {stats.passedCount}/{stats.totalAttempts}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.spacer} />
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  studentInfoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  studentInfoCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  studentAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  quizTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  attemptsCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
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
  statCardGradient: {
    padding: 15,
    alignItems: 'center',
  },
  statCardNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: 5,
  },
  statCardLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },
  noAttempts: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
  },
  noAttemptsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  attemptCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  attemptCardGradient: {
    padding: 20,
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  attemptNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attemptNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  bestBadgeText: {
    fontSize: 10,
    color: '#FFCC00',
    fontWeight: '600',
  },
  attemptDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  attemptStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryStats: {
    gap: 10,
  },
  summaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryStatText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  spacer: {
    height: 100,
  },
});

export default StudentDetailsScreen;