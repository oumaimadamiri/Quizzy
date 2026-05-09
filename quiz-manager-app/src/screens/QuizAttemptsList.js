import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { attemptService } from '../services/api';

const QuizAttemptsList = ({ route }) => {
  const { quizId, quizTitle } = route.params;
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const data = await attemptService.getQuizAttempts(quizId);
      setAttempts(data);
    } catch (error) {
      console.error('Error loading attempts:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tentatives pour: {quizTitle}</Text>
      
      <FlatList
        data={attempts}
        renderItem={({ item }) => (
          <View style={styles.attemptCard}>
            <Text>Étudiant: {item.userName || 'Anonyme'}</Text>
            <Text>Score: {item.score}/{item.totalPoints}</Text>
            <Text>Pourcentage: {item.percentage}%</Text>
            <Text>Date: {new Date(item.completedAt).toLocaleDateString()}</Text>
            <Text>Statut: {item.passed ? 'Réussi ✓' : 'Échoué ✗'}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  attemptCard: { 
    backgroundColor: 'white', 
    padding: 15, 
    marginBottom: 10, 
    borderRadius: 8 
  }
});

export default QuizAttemptsList;