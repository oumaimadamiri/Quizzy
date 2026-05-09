import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Animated,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import Timer from '../components/Timer';
import { quizService, questionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AccessCodeModal from '../components/AccessCodeModal';
const { width } = Dimensions.get('window');
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  "The action 'GO_BACK' was not handled by any navigator",
  "Is there any screen to go back to?"
]);

const TakeQuizScreen = ({ navigation, route }) => {
  const { quizId, quizTitle, accessCode: initialAccessCode } = route.params || {};
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState({
    id: quizId,
    title: quizTitle || 'Quiz',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    isPublished: false,
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
  
  const [hasValidAccessCode, setHasValidAccessCode] = useState(!!initialAccessCode);
  const [accessCode, setAccessCode] = useState(initialAccessCode || '');

const loadQuiz = async (providedAccessCode = null) => {
  try {
    const shouldShowInitialLoading = !providedAccessCode;
    if (shouldShowInitialLoading) {
      setLoading(true);
    }

    const finalAccessCode = providedAccessCode || accessCode;
    let quizData = null;
    let loadedQuestions = [];

    if (user?.role === 'STUDENT') {
      try {
        if (!finalAccessCode) {
          setShowAccessCodeModal(true);
          setLoading(false);
          return;
        }

        const takingQuizData = await quizService.getQuizForTaking(quizId, true, finalAccessCode);

        quizData = {
          id: takingQuizData.id,
          title: takingQuizData.title,
          description: takingQuizData.description || '',
          timeLimit: takingQuizData.timeLimit || 30,
          passingScore: takingQuizData.passingScore || 70,
          isPublished: true,
        };
        loadedQuestions = takingQuizData.questions || [];

        setQuiz(quizData);

        const transformedQuestions = loadedQuestions.map((q, index) => ({
          id: q.id || `question-${index}`,
          text: q.text || `Question ${index + 1}`,
          points: q.points || 1,
          type: q.type || 'MULTIPLE_CHOICE',
          explanation: q.explanation || '',
          options: (q.options || []).map((opt, optIndex) => ({
            id: opt.id || `option-${optIndex}`,
            text: opt.text || `Option ${optIndex + 1}`,
            isCorrect: opt.isCorrect || false,
            order: opt.order || optIndex + 1,
          })),
        }));

        setQuestions(transformedQuestions);
        setTimeRemaining((quizData.timeLimit || 30) * 60);
        setAccessCode(finalAccessCode);
        setHasValidAccessCode(true);
        setQuizStarted(true);
        setLoading(false);
        return;

      } catch (takingError) {
        if (takingError.response?.status === 400) {
          setLoading(false);
          Alert.alert(
            "Code d'accès requis",
            "Veuillez entrer le code d'accès pour ce quiz.",
            [{ text: 'OK', onPress: () => setShowAccessCodeModal(true) }]
          );
          return;
        }

        setLoading(false);
        throw new Error(takingError.message || 'Impossible de charger le quiz');
      }
    } else {
      try {
        const fullQuiz = await quizService.getQuizById(quizId);
        
        quizData = {
          id: fullQuiz.id,
          title: fullQuiz.title,
          description: fullQuiz.description || '',
          timeLimit: fullQuiz.timeLimit || 30,
          passingScore: fullQuiz.passingScore || 70,
          isPublished: fullQuiz.isPublished || false,
        };
        
        if (fullQuiz.questions && fullQuiz.questions.length > 0) {
          loadedQuestions = fullQuiz.questions;
        } else {
          try {
            loadedQuestions = await questionService.getQuestionsByQuizId(quizId);
          } catch (questionError) {
            console.error('Error loading questions:', questionError);
          }
        }
        
        const transformedQuestions = loadedQuestions.map((q, index) => ({
          id: q.id || `question-${index}`,
          text: q.text || `Question ${index + 1}`,
          points: q.points || 1,
          type: q.type || 'MULTIPLE_CHOICE',
          explanation: q.explanation || '',
          options: (q.options || []).map((opt, optIndex) => ({
            id: opt.id || `option-${optIndex}`,
            text: opt.text || `Option ${optIndex + 1}`,
            isCorrect: opt.isCorrect || false,
            order: opt.order || optIndex + 1,
          })),
        }));

        setQuiz(quizData);
        setQuestions(transformedQuestions);
        setTimeRemaining((quizData.timeLimit || 30) * 60);
        setLoading(false);
        
      } catch (error) {
        console.error('Professor/Admin: Error loading quiz:', error);
        setLoading(false);
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Final error loading quiz:', error);
    setLoading(false);
    
    let errorMessage = 'Impossible de charger le quiz';
    let detailedMessage = error.message || 'Erreur inconnue';
    
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = 'Accès refusé';
        detailedMessage = 'Ce quiz n\'est pas accessible pour votre rôle.';
      } else if (error.response.status === 404) {
        errorMessage = 'Quiz non trouvé';
        detailedMessage = 'Ce quiz n\'existe pas ou a été supprimé.';
      } else if (error.response.status === 401) {
        errorMessage = 'Authentification requise';
        detailedMessage = 'Veuillez vous connecter pour accéder à ce quiz.';
      }
    }

    Alert.alert(
      errorMessage,
      detailedMessage,
      [{ 
        text: 'OK', 
        onPress: () => navigation.goBack()
      }]
    );
  }
};

  useEffect(() => {
    if (initialAccessCode) {
      setAccessCode(initialAccessCode);
      setHasValidAccessCode(true);
      loadQuiz(initialAccessCode);
    } else {
      loadQuiz();
    }
  }, [quizId, initialAccessCode]);
const handleTimeUp = () => {
  Alert.alert(
    'Temps écoulé!',
    'Le temps est écoulé. Votre quiz va être soumis automatiquement.',
    [{ text: 'OK', onPress: handleSubmitQuiz }]
  );
};
const handleSubmitQuiz = async () => {
  try {
    if (!quiz || !quiz.id) {
      Alert.alert('Erreur', 'Le quiz n\'a pas été chargé correctement');
      return;
    }
    
    if (!user || !user.id) {
      Alert.alert('Erreur', 'Utilisateur non identifié');
      return;
    }

    if (user?.role === 'STUDENT' && !quiz.isPublished) {
      Alert.alert(
        'Erreur',
        'Vous ne pouvez pas soumettre un quiz non publié'
      );
      return;
    }

    const submitData = {
      userId: user.id,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur',
      timeTaken: quiz.timeLimit * 60 - timeRemaining,
      answers: userAnswers, 
    };

    const result = await quizService.submitQuiz(quiz.id, submitData);
    
    navigation.replace('Results', {
      quizId: quiz.id,
      quizTitle: quiz.title,
      attemptId: result.id,
      score: {
        score: result.score || 0,
        totalPoints: result.totalPoints || 0,
        percentage: result.percentage || 0,
      },
      userAnswers: submitData.answers,
      timeTaken: submitData.timeTaken,
      passed: result.passed || false,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        passingScore: quiz.passingScore || 70,
      },
    });
    
  } catch (error) {
    console.error('Error submitting quiz:', error);
    
    let errorMessage = 'Impossible de soumettre le quiz';
    if (error.response?.status === 403) {
      errorMessage = 'Permission refusée pour soumettre ce quiz';
    } else if (error.response?.status === 404) {
      errorMessage = 'Quiz non trouvé';
    }
    
    Alert.alert('Erreur', errorMessage);
  }
};
useEffect(() => {
  if (quizStarted && timeRemaining > 0) {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }
}, [quizStarted, timeRemaining]);
useEffect(() => {
  if (questions.length > 0 && user?.role === 'STUDENT' && hasValidAccessCode && !quizStarted) {
    const timer = setTimeout(() => setQuizStarted(true), 100);
    return () => clearTimeout(timer);
  }
}, [questions.length, hasValidAccessCode, quizStarted, user?.role]);
const handleAnswerSelect = (questionId, optionId, isMultiple) => {
  if (isMultiple) {
    setUserAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (Array.isArray(currentAnswers)) {
        if (currentAnswers.includes(optionId)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter(id => id !== optionId),
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, optionId],
          };
        }
      }
      return { ...prev, [questionId]: [optionId] };
    });
  } else {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  }
};

const handleNextQuestion = () => {
  if (currentQuestionIndex < questions.length - 1) {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentQuestionIndex(prev => prev + 1);
      slideAnim.setValue(width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }
};

const handlePrevQuestion = () => {
  if (currentQuestionIndex > 0) {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentQuestionIndex(prev => prev - 1);
      slideAnim.setValue(-width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }
};
const handleAccessCodeVerify = async (code) => {
  try {
    setShowAccessCodeModal(false);
    await quizService.getQuizForTaking(quizId, true, code);
    
    if (navigation.canGoBack()) {
      try {
        navigation.goBack();  
      } catch (goBackError) {}
      
      setTimeout(() => {
        navigation.navigate('TakeQuiz', {
          quizId: quizId,
          quizTitle: quiz?.title || 'Quiz',
          accessCode: code,
          timestamp: Date.now()
        });
      }, 100);
    } else {
      navigation.navigate('TakeQuiz', {
        quizId: quizId,
        quizTitle: quiz?.title || 'Quiz',
        accessCode: code,
        timestamp: Date.now()
      });
    }
    
  } catch (error) {
    console.error('❌ Error with access code:', error);
    Alert.alert('Erreur', 'Code d\'accès incorrect');
    setShowAccessCodeModal(true);
  }
};

  const handleStartQuiz = () => {
    if (user?.role === 'STUDENT' && !hasValidAccessCode) {
      setShowAccessCodeModal(true);
      return;
    }
    
    setQuizStarted(true);
    
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: timeRemaining * 1000,
      useNativeDriver: false,
    }).start();
  };


const renderQuestion = (question) => {
  if (!question) {
    return null;
  }
  
  const userAnswer = userAnswers[question.id];
  const isMultiple = question.type === 'MULTIPLE_ANSWER';

  return (
    <Animated.View
      key={question.id}
      style={[
        styles.questionContainer,
        { transform: [{ translateX: slideAnim }] }
      ]}
    >
      <View style={styles.questionHeader}>
        <View style={styles.questionMeta}>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1}/{questions.length}
          </Text>
          <View style={styles.pointsBadge}>
            <Icon name="star" size={14} color="#FFCC00" />
            <Text style={styles.pointsText}>{question.points} pts</Text>
          </View>
        </View>
      </View>

      <Text style={styles.questionText}>{question.text}</Text>

      <View style={styles.optionsContainer}>
        {question.options && question.options.map((option) => {
          const isSelected = isMultiple
            ? Array.isArray(userAnswer) && userAnswer.includes(option.id)
            : userAnswer === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              style={styles.option}
              onPress={() => handleAnswerSelect(question.id, option.id, isMultiple)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isSelected 
                  ? ['#667eea', '#764ba2'] 
                  : ['#2a2a3e', '#1f1f2e']}
                style={styles.optionGradient}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.optionSelector,
                    isMultiple && styles.optionSelectorSquare,
                  ]}>
                    {isSelected && (
                      <Icon name="check" size={16} color="#FFF" />
                    )}
                  </View>
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}>
                    {option.text}
                  </Text>
                </View>
                {isSelected && (
                  <Icon
                    name={isMultiple ? "checkbox-marked" : "check-circle"}
                    size={24}
                    color="#FFF"
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};
if (loading && questions.length === 0 && !hasValidAccessCode) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#667eea" />
      <Text style={styles.loadingText}>Chargement du quiz...</Text>
    </View>
  );
}

const hasQuestions = questions.length > 0;
const isStudentWithCode = user?.role === 'STUDENT' && hasValidAccessCode;
const shouldShowQuizScreen = hasQuestions && (isStudentWithCode || quizStarted);

if (shouldShowQuizScreen) {
  return (
    <View style={[
      styles.container,
      { 
        paddingTop: insets.top, 
        paddingBottom: insets.bottom 
      }
    ]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 15 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => setShowConfirmModal(true)}
          >
            <Icon name="close" size={24} color="#f5576c" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {quiz.title}
            </Text>
            <Text style={styles.headerSubtitle}>
              {currentQuestionIndex + 1}/{questions.length}
            </Text>
          </View>
          
          <Timer
            timeRemaining={timeRemaining}
            totalTime={quiz.timeLimit * 60}
            onTimeUp={handleTimeUp}
          />
        </View>

        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              { 
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` 
              }
            ]}
          >
            <LinearGradient
              colors={['#11998e', '#38ef7d']}
              style={styles.progressBarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.questionsScroll}
        contentContainerStyle={styles.questionsContent}
        showsVerticalScrollIndicator={false}
      >
        {renderQuestion(questions[currentQuestionIndex])}
      </ScrollView>

      <View style={[
        styles.navigation,
        { 
          paddingBottom: Math.max(insets.bottom, 15),
          paddingTop: 15
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestionIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Icon name="chevron-left" size={24} color="#667eea" />
          <Text style={styles.navButtonText}>Précédent</Text>
        </TouchableOpacity>

        <View style={styles.progressDots}>
          {questions.slice(0, 10).map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentQuestionIndex(index)}
            >
              <View
                style={[
                  styles.progressDot,
                  index === currentQuestionIndex && styles.progressDotActive,
                  userAnswers[questions[index]?.id] && styles.progressDotAnswered,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {currentQuestionIndex < questions.length - 1 ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.navButtonText}>Suivant</Text>
            <Icon name="chevron-right" size={24} color="#667eea" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setShowConfirmModal(true)}
          >
            <LinearGradient
              colors={['#11998e', '#38ef7d']}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Terminer</Text>
              <Icon name="send" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.modalIconContainer}
            >
              <Icon name="alert-circle-outline" size={50} color="#FFF" />
            </LinearGradient>
            <Text style={styles.modalTitle}>Soumettre le quiz?</Text>
            <Text style={styles.modalText}>
              {Object.keys(userAnswers).length === questions.length
                ? 'Vous avez répondu à toutes les questions.'
                : `Vous avez répondu à ${Object.keys(userAnswers).length} sur ${questions.length} questions.`}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Continuer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowConfirmModal(false);
                  handleSubmitQuiz();
                }}
              >
                <LinearGradient
                  colors={['#11998e', '#38ef7d']}
                  style={styles.modalButtonSubmit}
                >
                  <Text style={styles.modalButtonSubmitText}>Soumettre</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AccessCodeModal
        visible={showAccessCodeModal}
        onClose={() => {
          setShowAccessCodeModal(false);
          try {
      navigation.goBack(); 
    } catch (error) {}
        }}
        onVerify={handleAccessCodeVerify}
        quizTitle={quiz?.title || 'Quiz'}
      />
    </View>
  );
}

return (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
    
    <LinearGradient
      colors={['#1a1a2e', '#16213e']}
      style={styles.instructionsHeader}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color="#FFF" />
      </TouchableOpacity>
      <Text style={styles.instructionsTitle}>
        {loading ? 'Chargement...' : 'Prêt à commencer?'}
      </Text>
      <View style={styles.headerSpacer} />
    </LinearGradient>

    <ScrollView style={styles.instructionsContent}>
      <View style={styles.quizInfoCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.quizInfoGradient}
        >
          <Text style={styles.quizTitle}>{quiz?.title || 'Quiz'}</Text>
          {quiz?.description && (
            <Text style={styles.quizDescription}>{quiz.description}</Text>
          )}
        </LinearGradient>
        
        <View style={styles.quizStats}>
          <View style={styles.statItem}>
            <Icon name="help-circle-outline" size={24} color="#667eea" />
            <Text style={styles.statText}>
              {questions.length > 0 ? `${questions.length} questions` : 'Chargement...'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="clock-outline" size={24} color="#f5576c" />
            <Text style={styles.statText}>{quiz.timeLimit} minutes</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="trophy-outline" size={24} color="#FFCC00" />
            <Text style={styles.statText}>{quiz.passingScore}% requis</Text>
          </View>
        </View>
      </View>

      {loading && hasValidAccessCode ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Préparation du quiz...</Text>
        </View>
      ) : (
        <>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionsTitle2}>Instructions</Text>
            
            <View style={styles.instructionItem}>
              <Icon name="check-circle" size={20} color="#11998e" />
              <Text style={styles.instructionText}>
                Lisez attentivement chaque question
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <Icon name="clock-alert" size={20} color="#f5576c" />
              <Text style={styles.instructionText}>
                Le chronomètre démarre dès que vous commencez
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <Icon name="arrow-left-right" size={20} color="#667eea" />
              <Text style={styles.instructionText}>
                Naviguez entre les questions librement
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <Icon name="checkbox-multiple-marked" size={20} color="#f093fb" />
              <Text style={styles.instructionText}>
                Certaines questions ont plusieurs bonnes réponses
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleStartQuiz}
            disabled={questions.length === 0}
          >
            <LinearGradient
              colors={['#11998e', '#38ef7d']}
              style={[styles.startButton, questions.length === 0 && { opacity: 0.5 }]}
            >
              <Icon name="play-circle" size={28} color="#FFF" />
              <Text style={styles.startButtonText}>
                {user?.role === 'STUDENT' ? 'Entrer le code d\'accès' : 'Commencer le quiz'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>

    <AccessCodeModal
      visible={showAccessCodeModal}
      onClose={() => {
        setShowAccessCodeModal(false);
        if (!hasValidAccessCode) {
         try {
      navigation.goBack();  
    } catch (error) {}
        }
      }}
      onVerify={handleAccessCodeVerify}
      quizTitle={quiz?.title || 'Quiz'}
    />
  </SafeAreaView>
);};
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
  instructionsHeader: {
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  instructionsTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  instructionsContent: {
    flex: 1,
    padding: 20,
  },
  quizInfoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  quizInfoGradient: {
    padding: 25,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  quizDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  quizStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
  instructionsList: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  instructionsTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 40,
    gap: 10,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    paddingVertical: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerBackButton: {
    marginRight: 15,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    overflow: 'hidden',
  },
  progressBarGradient: {
    flex: 1,
  },
  questionsScroll: {
    flex: 1,
  },
  questionsContent: {
    padding: 20,
  },
  questionContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 20,
  },
  questionHeader: {
    marginBottom: 20,
  },
  questionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    color: '#FFCC00',
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFF',
    lineHeight: 26,
    marginBottom: 25,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionSelector: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelectorSquare: {
    borderRadius: 6,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  optionTextSelected: {
    color: '#FFF',
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15, 
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  progressDots: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressDotActive: {
    backgroundColor: '#667eea',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressDotAnswered: {
    backgroundColor: '#11998e',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 14,
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
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
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
  modalButtonSubmit: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonSubmitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TakeQuizScreen;