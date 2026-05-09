import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const ScoreDisplay = ({ score, totalScore, passingScore }) => {
  const percentage = totalScore > 0 ? (score / totalScore) * 100 : 0;
  const passed = percentage >= passingScore;

const getScoreColor = () => {
  const percentage = score?.percentage !== undefined ? score.percentage : 0;
  if (percentage >= 80) return ['#11998e', '#38ef7d'];
  if (percentage >= 60) return ['#FFCC00', '#FFB800'];
  return ['#f5576c', '#f093fb'];
};

const getScoreMessage = () => {
  const percentage = score?.percentage !== undefined ? score.percentage : 0;
  if (percentage >= 90) return { text: 'Excellent! 🎉', icon: 'trophy' };
  if (percentage >= 80) return { text: 'Très bien! 👏', icon: 'star' };
  if (percentage >= 70) return { text: 'Bon travail! 👍', icon: 'thumb-up' };
  if (percentage >= 60) return { text: 'Pas mal! 😊', icon: 'emoticon-happy' };
  if (percentage >= 50) return { text: 'Peut mieux faire 💪', icon: 'arm-flex' };
  return { text: 'Continue à apprendre! 📚', icon: 'book-open-variant' };
};

  const getScoreGradient = () => {
    if (passed) {
      return ['#34C759', '#30D158'];
    } else {
      return ['#FF3B30', '#FF453A'];
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getScoreGradient()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.scoreCircle}>
          <Text style={styles.scorePercentage}>{Math.round(percentage)}%</Text>
          <Text style={styles.scoreText}>
            {score}/{totalScore} points
          </Text>
        </View>
        
        <View style={styles.statusBadge}>
          <Icon
            name={passed ? "trophy" : "alert-circle"}
            size={16}
            color="#FFF"
          />
          <Text style={styles.statusText}>
            {passed ? 'Réussi' : 'Échoué'}
          </Text>
        </View>
      </LinearGradient>
      
      <View style={styles.details}>
        <Text style={styles.message}>{getScoreMessage()}</Text>
        
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Icon name="target" size={16} color="#8E8E93" />
            <Text style={styles.statText}>
              Score: {score}/{totalScore}
            </Text>
          </View>
          <View style={styles.stat}>
            <Icon name="percent" size={16} color="#8E8E93" />
            <Text style={styles.statText}>
              {Math.round(percentage)}% ({passingScore}% requis)
            </Text>
          </View>
        </View>
        
        <View style={styles.passIndicator}>
          <View style={styles.passBar}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: getScoreColor(),
                },
              ]}
            />
            <View
              style={[
                styles.passMarker,
                { left: `${passingScore}%` },
              ]}
            >
              <Icon name="flag" size={12} color="#FF9500" />
              <Text style={styles.passMarkerText}>{passingScore}%</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  gradient: {
    padding: 30,
    alignItems: 'center',
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scorePercentage: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scoreText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  details: {
    padding: 24,
  },
  message: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D1D1F',
    textAlign: 'center',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  passIndicator: {
    marginBottom: 8,
  },
  passBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'visible',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  passMarker: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
    transform: [{ translateX: -12 }],
  },
  passMarkerText: {
    fontSize: 10,
    color: '#FF9500',
    marginTop: 2,
    fontWeight: '600',
  },
});

export default ScoreDisplay;