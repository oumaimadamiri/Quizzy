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
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Svg, { Circle } from 'react-native-svg';
import { quizService, attemptService, questionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

const ResultsScreen = ({ navigation, route }) => {
  const { 
    quizId, 
    quizTitle, 
    attemptId, 
    score, 
    userAnswers, 
    timeTaken,
    passed
  } = route.params || {};
  
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [detailedResults, setDetailedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadQuizDetails();
  }, []);

  const loadQuizDetails = async () => {
    try {
      setLoading(true);
      
      let quizData = null;
      let questionsData = [];
      
      try {
        if (user?.role === 'STUDENT' && attemptId) {
          const attempt = await attemptService.getAttemptById(attemptId);
          
          quizData = {
            id: quizId,
            title: quizTitle || 'Quiz',
            passingScore: route.params?.quiz?.passingScore || 70,
          };
          
          try {
            questionsData = await questionService.getQuestionsByQuizId(quizId);
          } catch (questionError) {
            console.warn('Impossible de charger les questions:', questionError);
            if (attempt.questions) {
              questionsData = attempt.questions;
            }
          }
          
          if (attempt.userAnswers && questionsData.length > 0) {
            const results = questionsData.map((question, index) => {
              const userAnswer = attempt.userAnswers[question.id] || 
                               attempt.userAnswers.find(a => a.questionId === question.id);
              
              const selectedOption = question.options?.find(opt => 
                opt.id === (userAnswer?.selectedOptionId || userAnswer)
              );
              
              const correctOption = question.options?.find(opt => opt.isCorrect);
              
              const isCorrect = selectedOption?.isCorrect || false;
              
              return {
                id: question.id,
                question: question.text || `Question ${index + 1}`,
                userAnswer: selectedOption?.text || 
                          (userAnswer ? `Option ${userAnswer.selectedOptionId || userAnswer}` : 'Non répondu'),
                correctAnswer: correctOption?.text || 'Non disponible',
                isCorrect: isCorrect,
                pointsEarned: isCorrect ? (question.points || 1) : 0,
                totalPoints: question.points || 1,
                explanation: question.explanation || '',
              };
            });
            
            setDetailedResults(results);
          }

        } else {
          const fullQuiz = await quizService.getQuizById(quizId);
          
          quizData = {
            id: fullQuiz.id,
            title: fullQuiz.title,
            passingScore: fullQuiz.passingScore || 70,
          };
          
          questionsData = fullQuiz.questions || [];
        }
        
        if (detailedResults.length === 0 && questionsData.length > 0) {
          
          const results = questionsData.map((question, index) => {
            const userAnswerId = userAnswers?.[question.id];
            const selectedOption = question.options?.find(opt => {
              return String(opt.id) === String(userAnswerId);
            });
            
            const correctOption = question.options?.find(opt => opt.isCorrect);
            
            const isCorrect = selectedOption?.isCorrect || false;
            
            return {
              id: question.id,
              question: question.text || `Question ${index + 1}`,
              userAnswer: selectedOption?.text || 
                         (userAnswerId ? `Option ${userAnswerId}` : 'Non répondu'),
              correctAnswer: correctOption?.text || 'Non disponible',
              isCorrect: isCorrect,
              pointsEarned: isCorrect ? (question.points || 1) : 0,
              totalPoints: question.points || 1,
              explanation: question.explanation || '',
            };
          });
          
          setDetailedResults(results);
        }
        
        setQuiz(quizData);
        
      } catch (apiError) {
        console.error('Erreur API:', apiError);
        
        if (route.params?.quiz) {
          setQuiz(route.params.quiz);
        } else {
          setQuiz({
            id: quizId,
            title: quizTitle || 'Quiz',
            passingScore: 70,
          });
        }
        
        if (userAnswers && Object.keys(userAnswers).length > 0) {
          const results = Object.keys(userAnswers).map((questionId, index) => ({
            id: questionId,
            question: `Question ${index + 1}`,
            userAnswer: `Option ${userAnswers[questionId]}`,
            correctAnswer: 'Non disponible',
            isCorrect: false, 
            pointsEarned: 0,
            totalPoints: 1,
            explanation: '',
          }));
          setDetailedResults(results);
        }
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('Erreur générale lors du chargement des résultats:', error);
      setLoading(false);
      
      if (route.params?.quiz) {
        setQuiz(route.params.quiz);
      }
    }
  };

  const getScoreColor = () => {
    const percentage = score ? score.percentage : 0;
    if (percentage >= 80) return ['#11998e', '#38ef7d'];
    if (percentage >= 60) return ['#FFCC00', '#FFB800'];
    return ['#f5576c', '#f093fb'];
  };

  const getScoreMessage = () => {
    const percentage = score ? score.percentage : 0;
    if (percentage >= 90) return { text: 'Excellent! 🎉', icon: 'trophy' };
    if (percentage >= 80) return { text: 'Très bien! 👏', icon: 'star' };
    if (percentage >= 70) return { text: 'Bon travail! 👍', icon: 'thumb-up' };
    if (percentage >= 60) return { text: 'Pas mal! 😊', icon: 'emoticon-happy' };
    if (percentage >= 50) return { text: 'Peut mieux faire 💪', icon: 'arm-flex' };
    return { text: 'Continue à apprendre! 📚', icon: 'book-open-variant' };
  };

  const handleShareResults = async () => {
    try {
      const message = `J'ai obtenu ${score?.percentage || 0}% au quiz "${quiz?.title || ''}"! 🎯\n\nScore: ${score?.score || 0}/${score?.totalPoints || 0}\nTemps: ${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}\n\nVenez tester vos connaissances!`;
      
      await Share.share({
        message,
        title: 'Mes résultats de quiz',
      });
    } catch (error) {
      console.error('Error sharing results:', error);
    }
  };

  const renderScoreCircle = () => {
    const percentage = score?.percentage !== undefined ? score.percentage : 0;
    const passed = quiz && percentage >= quiz.passingScore;
    const scoreColors = getScoreColor();
    
    const circleSize = width * 0.55;
    const strokeWidth = 15;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <Animatable.View 
        animation="zoomIn" 
        duration={800}
        style={styles.scoreCircleContainer}
      >
        <View style={[styles.scoreCircle, { width: circleSize, height: circleSize }]}>
          <Svg width={circleSize} height={circleSize}>
            <Circle
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={strokeWidth}
              fill="none"
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
            />
            <Circle
              stroke={scoreColors[0]}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              rotation="-90"
              origin={`${circleSize / 2}, ${circleSize / 2}`}
            />
          </Svg>
          
          <View style={styles.scoreCircleContent}>
            <Text style={[styles.scorePercentage, { color: scoreColors[0] }]}>
              {Math.round(percentage)}%
            </Text>
            <Text style={styles.scoreText}>
              {score?.score || 0}/{score?.totalPoints || 0} points
            </Text>
            <View style={styles.passBadge}>
              <LinearGradient
                colors={passed ? ['#11998e', '#38ef7d'] : ['#f5576c', '#f093fb']}
                style={styles.passBadgeGradient}
              >
                <Icon
                  name={passed ? "trophy" : "alert-circle"}
                  size={16}
                  color="#FFF"
                />
                <Text style={styles.passBadgeText}>
                  {passed ? 'Réussi' : 'Échoué'}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Animatable.View>
    );
  };

  const renderStats = () => {
    const message = getScoreMessage();
    const correctCount = detailedResults.filter(r => r.isCorrect).length;
    const incorrectCount = detailedResults.filter(r => !r.isCorrect).length;
    
    return (
      <View style={styles.statsContainer}>
        <Animatable.View 
          animation="fadeInUp" 
          delay={200}
          style={styles.messageCard}
        >
          <LinearGradient
            colors={getScoreColor()}
            style={styles.messageGradient}
          >
            <Icon name={message.icon} size={40} color="#FFF" />
            <Text style={styles.messageText}>{message.text}</Text>
          </LinearGradient>
        </Animatable.View>

        <View style={styles.statsGrid}>
          <Animatable.View animation="fadeInUp" delay={300} style={styles.statCard}>
            <LinearGradient
              colors={['#11998e', '#38ef7d']}
              style={styles.statGradient}
            >
              <Icon name="check-circle" size={28} color="#FFF" />
              <Text style={styles.statNumber}>
                {correctCount}
              </Text>
              <Text style={styles.statLabel}>Correctes</Text>
            </LinearGradient>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={400} style={styles.statCard}>
            <LinearGradient
              colors={['#f5576c', '#f093fb']}
              style={styles.statGradient}
            >
              <Icon name="close-circle" size={28} color="#FFF" />
              <Text style={styles.statNumber}>
                {incorrectCount}
              </Text>
              <Text style={styles.statLabel}>Incorrectes</Text>
            </LinearGradient>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={500} style={styles.statCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.statGradient}
            >
              <Icon name="clock-outline" size={28} color="#FFF" />
              <Text style={styles.statNumber}>
                {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}
              </Text>
              <Text style={styles.statLabel}>Temps</Text>
            </LinearGradient>
          </Animatable.View>
        </View>
      </View>
    );
  };

  const formatAnswer = (answer) => {
    if (!answer) return 'Non répondu';
    
    if (typeof answer === 'object') {
      return answer.text || `Option ${answer.id || answer}`;
    }
    
    if (typeof answer === 'string') {
      return answer;
    }
    
    return String(answer);
  };

  const renderQuestionResult = (result, index) => {
    if (!result) return null;
    
    const isCorrect = result.isCorrect || false;
    const userAnswer = formatAnswer(result.userAnswer);
    const correctAnswer = formatAnswer(result.correctAnswer);
    
    return (
      <Animatable.View
        key={result.id || index}
        animation="fadeInUp"
        delay={index * 100}
        style={styles.questionResult}
      >
        <LinearGradient
          colors={isCorrect 
            ? ['rgba(17, 153, 142, 0.2)', 'rgba(56, 239, 125, 0.1)']
            : ['rgba(245, 87, 108, 0.2)', 'rgba(240, 147, 251, 0.1)']}
          style={styles.questionResultGradient}
        >
          <View style={styles.questionResultHeader}>
            <View style={styles.questionNumber}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.questionNumberGradient}
              >
                <Text style={styles.questionNumberText}>Q{index + 1}</Text>
              </LinearGradient>
            </View>
            <View style={styles.questionPoints}>
              <Icon name="star" size={14} color="#FFCC00" />
              <Text style={styles.questionPointsText}>
                {result.pointsEarned || 0}/{result.totalPoints || 1} pts
              </Text>
            </View>
            <Icon 
              name={isCorrect ? "check-circle" : "close-circle"} 
              size={24} 
              color={isCorrect ? '#11998e' : '#f5576c'} 
            />
          </View>
          
          <Text style={styles.questionText}>
            {result.question || `Question ${index + 1}`}
          </Text>
          
          <View style={styles.answerSection}>
            <View style={styles.answerRow}>
              <Icon name="account-circle" size={16} color="#667eea" />
              <Text style={styles.answerLabel}>Votre réponse:</Text>
              <Text style={[
                styles.answerText,
                isCorrect ? styles.correctAnswer : styles.wrongAnswer
              ]}>
                {userAnswer}
              </Text>
            </View>
            
            {(!isCorrect) && correctAnswer && correctAnswer !== 'Non disponible' && (
              <View style={styles.answerRow}>
                <Icon name="check-circle" size={16} color="#11998e" />
                <Text style={styles.answerLabel}>Bonne réponse:</Text>
                <Text style={styles.correctAnswer}>
                  {correctAnswer}
                </Text>
              </View>
            )}
          </View>
          
          {result.explanation && (
            <View style={styles.explanation}>
              <Icon name="lightbulb-outline" size={16} color="#FFCC00" />
              <Text style={styles.explanationText}>{result.explanation}</Text>
            </View>
          )}
        </LinearGradient>
      </Animatable.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Analyse de vos résultats...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[
      styles.container,
      { 
        paddingTop: insets.top, 
        paddingBottom: insets.bottom 
      }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={['#1a1a2e', '#16213e']}
          style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 20 }]} 
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Icon name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Résultats</Text>
              <Text style={styles.headerSubtitle}>{quiz?.title || quizTitle}</Text>
            </View>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareResults}
            >
              <Icon name="share-variant" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.scoreSection}>
          {renderScoreCircle()}
        </View>

        {renderStats()}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Détails des réponses</Text>
            <Text style={styles.questionsCount}>
              {detailedResults.length} question{detailedResults.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          {detailedResults.length > 0 ? (
            detailedResults.map((result, index) => renderQuestionResult(result, index))
          ) : (
            <View style={styles.noResults}>
              <Icon name="information-outline" size={40} color="rgba(255,255,255,0.3)" />
              <Text style={styles.noResultsText}>
                Détails des réponses non disponibles
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => {
              if (quizId) {
                navigation.navigate('TakeQuiz', { 
                  quizId, 
                  quizTitle: quiz?.title || quizTitle 
                });
              } else {
                navigation.navigate('Home');
              }
            }}
          >
            <Icon name="refresh" size={20} color="#667eea" />
            <Text style={styles.retakeButtonText}>Recommencer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.homeButton}
            >
              <Icon name="home" size={20} color="#FFF" />
              <Text style={styles.homeButtonText}>Accueil</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  shareButton: {
    padding: 5,
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  scoreCircleContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCircleContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  passBadge: {
    marginTop: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  passBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  passBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  messageCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  messageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 15,
  },
  messageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  questionsCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  noResults: {
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  questionResult: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  questionResultGradient: {
    padding: 16,
  },
  questionResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  questionNumber: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  questionNumberGradient: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionNumberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  questionPointsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    marginBottom: 16,
    lineHeight: 22,
  },
  answerSection: {
    gap: 10,
    marginBottom: 12,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  answerLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    minWidth: 110,
  },
  answerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  correctAnswer: {
    color: '#11998e',
    fontWeight: '600',
  },
  wrongAnswer: {
    color: '#f5576c',
  },
  explanation: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 204, 0, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  explanationText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 30,
    marginHorizontal: 20,
    marginBottom: 40,
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#667eea',
    gap: 8,
  },
  retakeButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  homeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResultsScreen;