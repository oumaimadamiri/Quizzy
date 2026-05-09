import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Alert, 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import QuizCard from '../components/QuizCard';
import { useAuth } from '../context/AuthContext'; 
import { quizService, attemptService } from '../services/api'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const QuizListScreen = ({ navigation, route }) => {
    const { user } = useAuth();
  const { filter = 'all' } = route.params || {};
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
const insets = useSafeAreaInsets();
  useEffect(() => {
    loadQuizzes();
  }, [filter]);

  useEffect(() => {
    filterQuizzes();
  }, [searchText, selectedCategory, quizzes]);

const loadQuizzes = async () => {
  try {
    setLoading(true);
    
    let data;
    switch (filter) {
      case 'published':
        data = await quizService.getPublishedQuizzes();
        break;
      case 'recent':
        data = await quizService.getAllQuizzes();
        data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'mine':
        if (user?.role === 'PROFESSOR' || user?.role === 'ADMIN') {
          data = await quizService.getMyQuizzes();
        } else {
          data = []; 
        }
        break;
      case 'myAttempts':
        if (user?.role === 'STUDENT') {
          try {
            const myAttempts = await attemptService.getUserAttempts(user.id);
            const quizIds = [...new Set(myAttempts.map(a => a.quizId))];
            const quizPromises = quizIds.map(id => quizService.getQuizById(id));
            data = await Promise.all(quizPromises);
          } catch (error) {
            console.error('Error loading attempted quizzes:', error);
            data = [];
          }
        } else {
          data = [];
        }
        break;
      default:
        data = await quizService.getAllQuizzes();
    }
    
    setQuizzes(data);
    setFilteredQuizzes(data);
    extractCategories(data);
    setLoading(false);
  } catch (error) {
    console.error('Error loading quizzes:', error);
    setLoading(false);
    
    setTimeout(() => {
      Alert.alert('Erreur', 'Impossible de charger les quiz');
    }, 100);
  }
};

  const extractCategories = (quizzes) => {
    const uniqueCategories = [...new Set(quizzes.map(q => q.category).filter(Boolean))];
    setCategories(['all', ...uniqueCategories]);
  };

  const filterQuizzes = () => {
    let filtered = [...quizzes];

    if (searchText) {
      filtered = filtered.filter(quiz =>
        quiz.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === selectedCategory);
    }

    setFilteredQuizzes(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuizzes();
    setRefreshing(false);
  };

  const handleQuizPress = (quiz) => {
    navigation.navigate('TakeQuiz', { 
      quizId: quiz.id,
      quizTitle: quiz.title 
    });
  };

const handleEditQuiz = (quiz) => {
  if (user?.role === 'PROFESSOR' || user?.role === 'ADMIN') {
    navigation.navigate('QuizEditor', { 
      quizId: quiz.id, 
      mode: 'edit'
    });
  }
};

  const getFilterTitle = () => {
    switch(filter) {
      case 'published': return 'Quiz Publiés';
      case 'recent': return 'Quiz Récents';
      case 'mine': return 'Mes Quiz';
      default: return 'Tous les Quiz';
    }
  };

const renderQuizItem = ({ item }) => (
  <QuizCard
    quiz={item}
    onPress={() => handleQuizPress(item)}
    onEdit={() => handleEditQuiz(item)}
    showEditButton={user?.role === 'PROFESSOR' || user?.role === 'ADMIN'} 
  />
);

  const renderCategoryChip = (category) => {
    const isActive = selectedCategory === category;
    const label = category === 'all' ? 'Tous' : category;
    
    return (
      <TouchableOpacity
        key={category}
        onPress={() => setSelectedCategory(category)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isActive ? ['#667eea', '#764ba2'] : ['#2a2a3e', '#2a2a3e']}
          style={styles.filterChip}
        >
          <Text style={[
            styles.filterChipText,
            isActive && styles.filterChipTextActive,
          ]}>
            {label}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

const renderEmptyState = () => (
  <View style={styles.emptyState}>
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.emptyIconContainer}
    >
      <Icon name="clipboard-text-outline" size={60} color="#FFF" />
    </LinearGradient>
    <Text style={styles.emptyStateTitle}>Aucun quiz trouvé</Text>
    <Text style={styles.emptyStateText}>
      {searchText
        ? 'Aucun quiz ne correspond à votre recherche'
        : user?.role === 'STUDENT' 
          ? 'Aucun quiz disponible pour le moment'
          : 'Commencez par créer votre premier quiz'}
    </Text>
    
    {(user?.role === 'PROFESSOR' || user?.role === 'ADMIN') && (
      <TouchableOpacity
        onPress={() => navigation.navigate('QuizEditor', { mode: 'create' })}
      >
        <LinearGradient
          colors={['#FA8BFF', '#2BD2FF']}
          style={styles.createButton}
        >
          <Icon name="plus" size={20} color="#FFF" />
          <Text style={styles.createButtonText}>Créer un Quiz</Text>
        </LinearGradient>
      </TouchableOpacity>
    )}
  </View>
);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Chargement des quiz...</Text>
      </View>
    );
  }

  return (
      <View style={[
      styles.container,
      { 
        paddingTop: insets.top, 
        paddingBottom: insets.bottom 
      }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
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
            <Text style={styles.headerTitle}>{getFilterTitle()}</Text>
            <Text style={styles.headerSubtitle}>
              {filteredQuizzes.length} quiz disponibles
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="rgba(255,255,255,0.7)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un quiz..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          ) : null}
        </View>

        {categories.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map(category => renderCategoryChip(category))}
          </ScrollView>
        )}
      </LinearGradient>

      <FlatList
        data={filteredQuizzes}
        renderItem={renderQuizItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#667eea"
          />
        }
      />

{(user?.role === 'PROFESSOR' || user?.role === 'ADMIN') && (
  <TouchableOpacity
    style={[styles.fab, { bottom: insets.bottom + 30 }]} 
    onPress={() => navigation.navigate('QuizEditor', { mode: 'create' })}
    activeOpacity={0.9}
  >
    <LinearGradient
      colors={['#FA8BFF', '#2BD2FF']}
      style={styles.fabGradient}
    >
      <Icon name="plus" size={30} color="#FFF" />
    </LinearGradient>
  </TouchableOpacity>
)}
    </View>
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
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
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
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 0,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 5,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 30,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    shadowColor: '#FA8BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QuizListScreen;