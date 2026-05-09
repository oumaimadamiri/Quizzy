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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { attemptService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
const StudentResultsScreen = ({ navigation, route }) => {
  const { quizId, quizTitle } = route.params || {};
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadStudentResults();
  }, [quizId]);

  const loadStudentResults = async () => {
    try {
      setLoading(true);
      
      let attempts = [];
      try {
        attempts = await attemptService.getQuizAttempts(quizId);
      } catch {
        attempts = [];
      }
      
      const studentMap = {};
      
      attempts.forEach(attempt => {
        const studentId = attempt.userId || attempt.user?.id;
        const studentName = attempt.userName || `${attempt.user?.firstName || ''} ${attempt.user?.lastName || ''}`.trim() || 'Étudiant inconnu';
        
        if (!studentMap[studentId]) {
          studentMap[studentId] = {
            id: studentId,
            name: studentName,
            attempts: [],
            bestScore: 0,
            lastAttempt: null,
            avgScore: 0,
          };
        }
        
        studentMap[studentId].attempts.push(attempt);
        
        if (attempt.percentage > studentMap[studentId].bestScore) {
          studentMap[studentId].bestScore = attempt.percentage;
        }
        
        if (!studentMap[studentId].lastAttempt || 
            new Date(attempt.completedAt) > new Date(studentMap[studentId].lastAttempt.completedAt)) {
          studentMap[studentId].lastAttempt = attempt;
        }
      });
      
      Object.values(studentMap).forEach(student => {
        const total = student.attempts.reduce((sum, a) => sum + a.percentage, 0);
        student.avgScore = student.attempts.length > 0 ? Math.round(total / student.attempts.length) : 0;
      });
      
      setStudents(Object.values(studentMap));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return ['#11998e', '#38ef7d'];
    if (score >= 60) return ['#FFCC00', '#FFB800'];
    return ['#f5576c', '#f093fb'];
  };

  const viewStudentDetails = (student) => {
    navigation.navigate('StudentDetails', {
      studentId: student.id,
      studentName: student.name,
      quizId: quizId,
      quizTitle: quizTitle,
    });
  };
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadStudentResults();
    } catch (error) {
    }
    setRefreshing(false);
  };
  const renderStudentItem = ({ item: student }) => {
    const scoreColors = getScoreColor(student.bestScore);
    
    return (
      <TouchableOpacity
        style={styles.studentCard}
        onPress={() => viewStudentDetails(student)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={scoreColors}
          style={styles.studentCardGradient}
        >
          <View style={styles.studentHeader}>
            <View style={styles.studentAvatar}>
              <Text style={styles.avatarText}>
                {student.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName} numberOfLines={1}>
                {student.name}
              </Text>
              <View style={styles.studentMeta}>
                <View style={styles.metaItem}>
                  <Icon name="repeat" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>
                    {student.attempts.length} tentative{student.attempts.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                {student.lastAttempt && (
                  <View style={styles.metaItem}>
                    <Icon name="calendar" size={12} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.metaText}>
                      {new Date(student.lastAttempt.completedAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
          </View>
          
          <View style={styles.scoreSection}>
            <View style={styles.scoreItem}>
              <Icon name="trophy" size={16} color="#FFCC00" />
              <Text style={styles.scoreLabel}>Meilleur score</Text>
              <Text style={styles.scoreValue}>{Math.round(student.bestScore)}%</Text>
            </View>
            
            <View style={styles.scoreItem}>
              <Icon name="chart-line" size={16} color="#667eea" />
              <Text style={styles.scoreLabel}>Moyenne</Text>
              <Text style={styles.scoreValue}>{student.avgScore}%</Text>
            </View>
          </View>
          
          <View style={styles.attemptsList}>
            {student.attempts.slice(0, 3).map((attempt, index) => (
              <View key={attempt.id || index} style={styles.attemptItem}>
                <Text style={styles.attemptNumber}>Tentative {index + 1}</Text>
                <View style={styles.attemptDetails}>
                  <Text style={[
                    styles.attemptScore,
                    { color: getScoreColor(attempt.percentage)[0] }
                  ]}>
                    {Math.round(attempt.percentage)}%
                  </Text>
                  <Text style={styles.attemptDate}>
                    {new Date(attempt.completedAt).toLocaleDateString()}
                  </Text>
                  <Icon 
                    name={attempt.passed ? "check-circle" : "close-circle"} 
                    size={14} 
                    color={attempt.passed ? '#11998e' : '#f5576c'} 
                  />
                </View>
              </View>
            ))}
            
            {student.attempts.length > 3 && (
              <Text style={styles.moreAttempts}>
                +{student.attempts.length - 3} autres tentatives
              </Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Chargement des résultats...</Text>
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
            <Text style={styles.headerTitle}>Résultats étudiants</Text>
            <Text style={styles.headerSubtitle}>{quizTitle}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {students.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="account-group" size={80} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyStateTitle}>Aucun résultat</Text>
          <Text style={styles.emptyStateText}>
            Aucun étudiant n'a encore tenté ce quiz
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          renderItem={renderStudentItem}
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
                {students.length} étudiant{students.length !== 1 ? 's' : ''} ont tenté ce quiz
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
  headerSpacer: {
    width: 40,
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
  studentCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  studentCardGradient: {
    padding: 20,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  studentMeta: {
    flexDirection: 'row',
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  scoreSection: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  attemptsList: {
    gap: 10,
  },
  attemptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
  },
  attemptNumber: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  attemptDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attemptScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  attemptDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  moreAttempts: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 5,
  },
});
LogBox.ignoreLogs(['Request failed with status code', 'Error loading']);
export default StudentResultsScreen;