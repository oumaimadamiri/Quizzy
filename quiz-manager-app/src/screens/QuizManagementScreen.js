import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { quizService, attemptService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const QuizManagementScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState({});

  useEffect(() => {
    loadMyQuizzes();
  }, []);

  const loadMyQuizzes = async () => {
    try {
      const quizzes = await quizService.getAllQuizzes();
      const filtered = quizzes.filter(q => q.createdBy === user.id);
      setMyQuizzes(filtered);
      
      for (const quiz of filtered) {
        const attempts = await attemptService.getQuizAttempts(quiz.id);
        setQuizAttempts(prev => ({
          ...prev,
          [quiz.id]: attempts
        }));
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  };

 const viewQuizAttempts = (quizId, quizTitle) => {
  navigation.navigate('StudentResults', { 
    quizId, 
    quizTitle 
  });
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Quiz (Professeur)</Text>
      <FlatList
        data={myQuizzes}
        renderItem={({ item }) => (
          <View style={styles.quizCard}>
            <Text style={styles.quizTitle}>{item.title}</Text>
            <Text>{item.category}</Text>
            <Text>Questions: {item.questionCount || 0}</Text>
            <Text>Tentatives: {quizAttempts[item.id]?.length || 0}</Text>
            
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => viewQuizAttempts(item.id, item.title)}
            >
              <Text style={styles.buttonText}>Voir les tentatives</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  quizCard: { 
    backgroundColor: 'white', 
    padding: 15, 
    marginBottom: 10, 
    borderRadius: 8 
  },
  quizTitle: { fontSize: 18, fontWeight: 'bold' },
  viewButton: {
    backgroundColor: '#667eea',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: { color: 'white', textAlign: 'center' }
});

export default QuizManagementScreen;