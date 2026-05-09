import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const QuizCard = ({ quiz, onPress, onEdit, showEditButton = false  }) => {
  const getGradientColors = () => {
    const gradients = [
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#11998e', '#38ef7d'],
      ['#FA8BFF', '#2BD2FF'],
      ['#4facfe', '#00f2fe'],
    ];
    
    const index = quiz.id ? quiz.id % gradients.length : 0;
    return gradients[index];
  };

  const formatTime = (minutes) => {
    if (!minutes) return '∞';
    return `${minutes} min`;
  };

  const getDifficultyInfo = () => {
    const score = quiz.passingScore || 70;
    if (score >= 80) {
      return { label: 'Difficile', color: '#f5576c', icon: 'fire' };
    }
    if (score >= 60) {
      return { label: 'Moyen', color: '#FFCC00', icon: 'star-half-full' };
    }
    return { label: 'Facile', color: '#38ef7d', icon: 'check-circle' };
  };

  const difficulty = getDifficultyInfo();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {quiz.title}
            </Text>
            {quiz.category && (
              <View style={styles.categoryBadge}>
                <Icon name="tag" size={12} color="#FFF" />
                <Text style={styles.categoryText} numberOfLines={1}>
                  {quiz.category}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <Icon
                name={quiz.isPublished ? "earth" : "file-document-outline"}
                size={16}
                color="#FFF"
              />
            </View>
          </View>
        </View>

        {quiz.description && (
          <Text style={styles.description} numberOfLines={2}>
            {quiz.description}
          </Text>
        )}

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Icon name="help-circle" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statText}>{quiz.questionCount || 0}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="clock" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statText}>{formatTime(quiz.timeLimit)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name={difficulty.icon} size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statText}>{difficulty.label}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.metaInfo}>
            <Icon name="calendar" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.metaText}>
              {quiz.createdAt 
                ? new Date(quiz.createdAt).toLocaleDateString('fr-FR', { 
                    day: 'numeric',
                    month: 'short' 
                  })
                : 'Date inconnue'}
            </Text>
          </View>
          
          <View style={styles.actions}>
           {showEditButton && onEdit && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Icon name="pencil" size={18} color="#FFF" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.startButton} 
              onPress={onPress}
            >
              <Text style={styles.startButtonText}>
                {quiz.isPublished ? 'Commencer' : 'Prévisualiser'}
              </Text>
              <Icon name="arrow-right" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.difficultyLine}>
          <View 
            style={[
              styles.difficultyProgress,
              { 
                width: `${quiz.passingScore || 70}%`,
                backgroundColor: difficulty.color 
              }
            ]} 
          />
        </View>
      </LinearGradient>

      <View style={styles.glassOverlay} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 20,
    padding: 20,
    position: 'relative',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    color: '#FFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  difficultyLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  difficultyProgress: {
    height: '100%',
    borderTopRightRadius: 3,
  },
});

export default QuizCard;