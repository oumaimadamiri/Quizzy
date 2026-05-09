import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, Path, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const QuizzyLogo = ({ size = 120 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <SvgLinearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#667eea" />
          <Stop offset="50%" stopColor="#764ba2" />
          <Stop offset="100%" stopColor="#f093fb" />
        </SvgLinearGradient>
        
        <SvgLinearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#11998e" />
          <Stop offset="100%" stopColor="#38ef7d" />
        </SvgLinearGradient>
      </Defs>
      
      <Circle cx="100" cy="100" r="95" fill="url(#mainGradient)" opacity="0.9" />
      
      <G transform="translate(100, 100)">
        <Circle cx="0" cy="-10" r="45" fill="white" opacity="0.95" />
        
        <Path 
          d="M 25 15 Q 35 25, 40 35 Q 42 40, 38 43 Q 35 45, 32 42 Q 30 38, 28 35 L 20 20 Z" 
          fill="white"
          opacity="0.95"
        />
        
        <Ellipse cx="-15" cy="-15" rx="8" ry="12" fill="#667eea" />
        <Ellipse cx="-13" cy="-17" rx="3" ry="4" fill="white" />
        
        <Ellipse cx="15" cy="-15" rx="8" ry="12" fill="#667eea" />
        <Ellipse cx="17" cy="-17" rx="3" ry="4" fill="white" />
        
        <Path 
          d="M -15 5 Q 0 15, 15 5" 
          stroke="#667eea" 
          strokeWidth="3" 
          strokeLinecap="round"
          fill="none"
        />
        
        <Ellipse cx="-30" cy="0" rx="6" ry="4" fill="#f093fb" opacity="0.4" />
        <Ellipse cx="30" cy="0" rx="6" ry="4" fill="#f093fb" opacity="0.4" />
        
        <G transform="translate(0, -70)">
          <Path 
            d="M -5 0 Q -5 -15, 5 -15 Q 15 -15, 15 -5 Q 15 5, 5 10 L 5 20" 
            stroke="url(#accentGradient)" 
            strokeWidth="5" 
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="5" cy="28" r="3" fill="url(#accentGradient)" />
        </G>
      </G>
      
      <Path 
        d="M 30 40 L 33 47 L 40 47 L 35 52 L 37 59 L 30 54 L 23 59 L 25 52 L 20 47 L 27 47 Z" 
        fill="#FFCC00"
        opacity="0.8"
      />
      <Path 
        d="M 165 35 L 167 40 L 172 40 L 168 44 L 170 49 L 165 45 L 160 49 L 162 44 L 158 40 L 163 40 Z" 
        fill="#11998e"
        opacity="0.8"
      />
      <Path 
        d="M 175 165 L 177 170 L 182 170 L 178 174 L 180 179 L 175 175 L 170 179 L 172 174 L 168 170 L 173 170 Z" 
        fill="#f093fb"
        opacity="0.8"
      />
      <Path 
        d="M 25 165 L 27 170 L 32 170 L 28 174 L 30 179 L 25 175 L 20 179 L 22 174 L 18 170 L 23 170 Z" 
        fill="#667eea"
        opacity="0.8"
      />
      
      <Circle cx="45" cy="80" r="2" fill="white" opacity="0.6" />
      <Circle cx="155" cy="75" r="2" fill="white" opacity="0.6" />
      <Circle cx="50" cy="120" r="1.5" fill="white" opacity="0.6" />
      <Circle cx="150" cy="125" r="1.5" fill="white" opacity="0.6" />
    </Svg>
  );
};

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(300),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0f0f1e" 
        translucent={false}
      />
      
      <LinearGradient
        colors={['#0f0f1e', '#1a1a2e', '#16213e', '#1a1a2e', '#0f0f1e']}
        style={[styles.gradient, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.circlesContainer}>
          <Animated.View 
            style={[
              styles.circle, 
              styles.circle1,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.circle, 
              styles.circle2,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.circle, 
              styles.circle3,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]} 
          />
        </View>

        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: spin }
              ],
            },
          ]}
        >
          <QuizzyLogo size={150} />
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.appName}>Quizzy</Text>
          <Text style={styles.tagline}>Test Your Knowledge ✨</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.loadingContainer,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.loadingBar}>
            <LinearGradient
              colors={['#667eea', '#764ba2', '#f093fb']}
              style={styles.loadingProgress}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.footer,
            { opacity: fadeAnim }
          ]}
        >
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.1,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: '#667eea',
    top: -100,
    left: -100,
  },
  circle2: {
    width: 250,
    height: 250,
    backgroundColor: '#f093fb',
    bottom: -80,
    right: -80,
  },
  circle3: {
    width: 200,
    height: 200,
    backgroundColor: '#11998e',
    top: height / 2 - 100,
    right: -50,
  },
  logoContainer: {
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  appName: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(102, 126, 234, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
    letterSpacing: 1,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    width: width * 0.6,
  },
  loadingBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
  },
  loadingGradient: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
});

export default SplashScreen;