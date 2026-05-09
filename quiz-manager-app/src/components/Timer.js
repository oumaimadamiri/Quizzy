import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const Timer = ({ timeRemaining, totalTime, onTimeUp }) => {
  const [blinkAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (timeRemaining <= 60 && timeRemaining > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (timeRemaining <= 30 && timeRemaining > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 30) return ['#f5576c', '#f093fb'];
    if (timeRemaining <= 60) return ['#FFCC00', '#FFB800'];
    if (timeRemaining <= 300) return ['#667eea', '#764ba2'];
    return ['#11998e', '#38ef7d'];
  };

  const getTimerIcon = () => {
    if (timeRemaining <= 30) return 'timer-off';
    if (timeRemaining <= 60) return 'timer-alert';
    if (timeRemaining <= 300) return 'timer-sand';
    return 'timer-outline';
  };

  const progress = (timeRemaining / totalTime) * 100;
  const timerColors = getTimerColor();

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: blinkAnim,
          transform: [{ scale: pulseAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={timerColors}
        style={styles.timerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.timerContent}>
          <Icon
            name={getTimerIcon()}
            size={18}
            color="#FFF"
            style={styles.icon}
          />
          <Text style={styles.timeText}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      </LinearGradient>
      
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${Math.max(0, Math.min(100, progress))}%`,
            },
          ]}
        >
          <LinearGradient
            colors={timerColors}
            style={styles.progressGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </View>
      
      {timeRemaining <= 60 && (
        <Text style={styles.warningText}>
          {timeRemaining <= 30 ? '⚠️ Dernière minute!' : '⏰ Plus qu\'une minute'}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 90,
  },
  timerContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    marginRight: 2,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontVariant: ['tabular-nums'],
  },
  progressContainer: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  warningText: {
    fontSize: 9,
    color: '#FFF',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Timer;