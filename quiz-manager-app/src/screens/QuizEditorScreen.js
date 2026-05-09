import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import QuestionForm from '../components/QuestionForm';
import { quizService, questionService } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const QuizEditorScreen = ({ navigation, route }) => {
  const { mode = 'create', quizId } = route.params || {};
  const isEditing = mode === 'edit';

  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    category: '',
    timeLimit: '30',
    passingScore: '70',
    isPublished: false,
    isRandomized: false,
    maxQuestions: '10',
    questions: [],
     accessCode: '',
  });

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [categories, setCategories] = useState([
    'Programming',
    'Mathematics',
    'Science',
    'History',
    'Languages',
    'Art',
    'Business',
    'Technology',
  ]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
const insets = useSafeAreaInsets();
  useEffect(() => {
    if (isEditing && quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      
      const quizData = await quizService.getQuizById(quizId);
      
      setQuiz({
        title: quizData.title,
        description: quizData.description,
        category: quizData.category,
        timeLimit: quizData.timeLimit?.toString() || '30',
        passingScore: quizData.passingScore?.toString() || '70',
        isPublished: quizData.isPublished || false,
        isRandomized: quizData.isRandomized || false,
        maxQuestions: quizData.maxQuestions?.toString() || '10',
        questions: [],
      });
      
      const questions = await questionService.getQuestionsByQuizId(quizId);
      
      const transformedQuestions = questions.map(q => ({
        id: q.id,
        text: q.text,
        category: q.category,
        points: q.points?.toString() || '1',
        type: q.type || 'MULTIPLE_CHOICE',
        explanation: q.explanation || '',
        options: q.options?.map((opt, index) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order || index + 1,
        })) || [],
      }));
      
      setQuiz(prev => ({ ...prev, questions: transformedQuestions }));
      setLoading(false);
    } catch (error) {
      console.error('Error loading quiz:', error);
      Alert.alert('Erreur', 'Impossible de charger le quiz');
      setLoading(false);
    }
  };

const handleSave = async () => {
  try {
    setSaving(true);
    
    if (!quiz.title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      setSaving(false);
      return;
    }

    if (!quiz.category) {
      Alert.alert('Erreur', 'La catégorie est requise');
      setSaving(false);
      return;
    }

    if (quiz.questions.length === 0) {
      const confirmed = await new Promise(resolve => {
        Alert.alert(
          'Avertissement',
          'Le quiz ne contient aucune question. Voulez-vous continuer?',
          [
            { text: 'Annuler', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Continuer', onPress: () => resolve(true) },
          ]
        );
      });
      
      if (!confirmed) {
        setSaving(false);
        return;
      }
    }

    const quizData = {
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      timeLimit: parseInt(quiz.timeLimit) || 30,
      passingScore: parseInt(quiz.passingScore) || 70,
      isPublished: quiz.isPublished,
      isRandomized: quiz.isRandomized,
      maxQuestions: parseInt(quiz.maxQuestions) || 10,
      accessCode: quiz.accessCode || "",
      questions: quiz.questions.map(q => ({
        text: q.text,
        category: q.category,
        points: parseInt(q.points) || 1,
        type: q.type,
        explanation: q.explanation,
        options: q.options.map(opt => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order,
        })),
      })),
    };

    if (isEditing) {
      await quizService.updateQuiz(quizId, quizData);
      Alert.alert('Succès', 'Quiz mis à jour avec succès!');
    } else {
      await quizService.createQuiz(quizData);
      Alert.alert('Succès', 'Quiz créé avec succès!');
    }

    navigation.navigate('QuizList', { filter: 'mine' });
    
  } catch (error) {
    console.error('Error saving quiz:', error);
    console.error('Error details:', error.response?.data);
    Alert.alert('Erreur', 'Impossible de sauvegarder le quiz');
  } finally {
    setSaving(false);
  }
};

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      category: quiz.category || categories[0] || 'General',
      points: '1',
      type: 'MULTIPLE_CHOICE',
      explanation: '',
      options: [
        { id: Date.now() + 1, text: '', isCorrect: true, order: 1 },
        { id: Date.now() + 2, text: '', isCorrect: false, order: 2 },
      ],
    };
    
    setCurrentQuestion(newQuestion);
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question) => {
    setCurrentQuestion({ ...question });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = (updatedQuestion) => {
    const newQuestions = [...quiz.questions];
    const index = newQuestions.findIndex(q => q.id === updatedQuestion.id);
    
    if (index > -1) {
      newQuestions[index] = updatedQuestion;
    } else {
      newQuestions.push(updatedQuestion);
    }

    setQuiz({ ...quiz, questions: newQuestions });
    setShowQuestionModal(false);
    setCurrentQuestion(null);
    
    Alert.alert('Succès', 'Question sauvegardée!');
  };

  const handleDeleteQuestion = (questionId) => {
    Alert.alert(
      'Supprimer la question',
      'Êtes-vous sûr de vouloir supprimer cette question?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setQuiz({
              ...quiz,
              questions: quiz.questions.filter(q => q.id !== questionId)
            });
          }
        }
      ]
    );
  };

  const renderQuestionItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.questionItem}
      onPress={() => handleEditQuestion(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#2a2a3e', '#1f1f2e']}
        style={styles.questionGradient}
      >
        <View style={styles.questionHeader}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.questionNumber}
          >
            <Text style={styles.questionNumberText}>Q{index + 1}</Text>
          </LinearGradient>
          <View style={styles.questionInfo}>
            <Text style={styles.questionText} numberOfLines={2}>
              {item.text || 'Question sans titre'}
            </Text>
            <View style={styles.questionMeta}>
              <Icon name="star" size={12} color="#FFCC00" />
              <Text style={styles.questionMetaText}>
                {item.points} pt
              </Text>
              <Text style={styles.questionMetaText}>•</Text>
              <Icon name="format-list-checks" size={12} color="#667eea" />
              <Text style={styles.questionMetaText}>
                {item.options?.length || 0} options
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.questionActions}>
          <TouchableOpacity
            style={styles.questionAction}
            onPress={() => handleEditQuestion(item)}
          >
            <Icon name="pencil" size={18} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.questionAction}
            onPress={() => handleDeleteQuestion(item.id)}
          >
            <Icon name="delete" size={18} color="#f5576c" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
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
      { 
        paddingTop: insets.top, 
        paddingBottom: insets.bottom 
      }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
           <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 20 }]} >
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-left" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>
                  {isEditing ? 'Modifier le Quiz' : 'Nouveau Quiz'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
              >
                <LinearGradient
                  colors={['#11998e', '#38ef7d']}
                  style={styles.saveButtonGradient}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Icon name="check" size={20} color="#FFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.formContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informations du Quiz</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre *</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="format-title" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez le titre du quiz"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={quiz.title}
                    onChangeText={(text) => setQuiz({ ...quiz, title: text })}
                    maxLength={200}
                  />
                </View>
                <Text style={styles.inputCounter}>{quiz.title.length}/200</Text>
              </View>
<View style={styles.inputGroup}>
  <Text style={styles.inputLabel}>Code d'Accès </Text>
  <View style={styles.inputWrapper}>
    <Icon name="key" size={20} color="#667eea" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder="Ex: MATHS2024"
      placeholderTextColor="rgba(255,255,255,0.3)"
      value={quiz.accessCode}
      onChangeText={(text) => setQuiz({ ...quiz, accessCode: text })}
      maxLength={10}
      autoCapitalize="characters"
    />
  </View>
  <Text style={styles.inputHelp}>
    Les étudiants devront entrer ce code pour accéder au quiz
  </Text>
</View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="text" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Décrivez le contenu du quiz"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={quiz.description}
                    onChangeText={(text) => setQuiz({ ...quiz, description: text })}
                    multiline
                    numberOfLines={3}
                    maxLength={1000}
                  />
                </View>
                <Text style={styles.inputCounter}>{quiz.description.length}/1000</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catégorie *</Text>
                <TouchableOpacity
                  style={styles.categorySelector}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Icon name="tag" size={20} color="#667eea" />
                  <Text style={[
                    styles.categorySelectorText,
                    !quiz.category && styles.categoryPlaceholder
                  ]}>
                    {quiz.category || 'Sélectionnez une catégorie'}
                  </Text>
                  <Icon name="chevron-down" size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Paramètres</Text>
              
              <View style={styles.settingsGrid}>
                <View style={styles.settingItem}>
                  <Icon name="clock-outline" size={20} color="#667eea" />
                  <Text style={styles.settingLabel}>Temps (min)</Text>
                  <TextInput
                    style={styles.numberInput}
                    placeholder="30"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={quiz.timeLimit}
                    onChangeText={(text) => setQuiz({ ...quiz, timeLimit: text })}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
                
                <View style={styles.settingItem}>
                  <Icon name="trophy-outline" size={20} color="#FFCC00" />
                  <Text style={styles.settingLabel}>Score (%)</Text>
                  <TextInput
                    style={styles.numberInput}
                    placeholder="70"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={quiz.passingScore}
                    onChangeText={(text) => setQuiz({ ...quiz, passingScore: text })}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
              </View>

              <View style={styles.switchGroup}>
                <View style={styles.switchItem}>
                  <View style={styles.switchLabelContainer}>
                    <Icon name="earth" size={20} color="#11998e" />
                    <Text style={styles.switchLabel}>Publier le quiz</Text>
                  </View>
                  <Switch
                    value={quiz.isPublished}
                    onValueChange={(value) => setQuiz({ ...quiz, isPublished: value })}
                    trackColor={{ false: '#2a2a3e', true: '#11998e' }}
                    thumbColor="#FFF"
                  />
                </View>
                
                <View style={styles.switchItem}>
                  <View style={styles.switchLabelContainer}>
                    <Icon name="shuffle-variant" size={20} color="#f5576c" />
                    <Text style={styles.switchLabel}>Questions aléatoires</Text>
                  </View>
                  <Switch
                    value={quiz.isRandomized}
                    onValueChange={(value) => setQuiz({ ...quiz, isRandomized: value })}
                    trackColor={{ false: '#2a2a3e', true: '#f5576c' }}
                    thumbColor="#FFF"
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.questionsHeader}>
                <Text style={styles.sectionTitle}>
                  Questions ({quiz.questions.length})
                </Text>
                <TouchableOpacity
                  onPress={handleAddQuestion}
                >
                  <LinearGradient
                    colors={['#FA8BFF', '#2BD2FF']}
                    style={styles.addQuestionButton}
                  >
                    <Icon name="plus" size={20} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {quiz.questions.length === 0 ? (
                <View style={styles.emptyQuestions}>
                  <Icon name="help-circle-outline" size={60} color="rgba(255,255,255,0.1)" />
                  <Text style={styles.emptyQuestionsTitle}>Aucune question</Text>
                  <Text style={styles.emptyQuestionsText}>
                    Ajoutez des questions à votre quiz
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={quiz.questions}
                  renderItem={renderQuestionItem}
                  keyExtractor={item => item.id.toString()}
                  scrollEnabled={false}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showQuestionModal}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => {
          setShowQuestionModal(false);
          setCurrentQuestion(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {currentQuestion ? (
              <QuestionForm
                question={currentQuestion}
                onSave={handleSaveQuestion}
                onCancel={() => {
                  setShowQuestionModal(false);
                  setCurrentQuestion(null);
                }}
                categories={categories}
              />
            ) : (
              <ActivityIndicator size="large" color="#667eea" />
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une catégorie</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Icon name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => {
                    setQuiz({ ...quiz, category: item });
                    setShowCategoryModal(false);
                  }}
                >
                  <Icon name="tag" size={20} color="#667eea" />
                  <Text style={styles.categoryItemText}>{item}</Text>
                  {quiz.category === item && (
                    <Icon name="check" size={20} color="#11998e" />
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      </Modal>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  inputCounter: {
    textAlign: 'right',
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  categorySelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
  },
  categoryPlaceholder: {
    color: 'rgba(255,255,255,0.3)',
  },
  settingsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  settingItem: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginVertical: 8,
  },
  numberInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    width: '100%',
  },
  switchGroup: {
    gap: 15,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 15,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#FFF',
  },
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addQuestionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyQuestions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyQuestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyQuestionsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  questionItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  questionGradient: {
    padding: 15,
  },
  questionHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  questionNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questionNumberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionInfo: {
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 6,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  questionMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  questionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  questionAction: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 15,
  },
  categoryItemText: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
  },
});

export default QuizEditorScreen;