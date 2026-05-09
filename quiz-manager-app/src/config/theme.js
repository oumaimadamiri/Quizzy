
export const colors = {
  background: {
    primary: '#0f0f1e',
    secondary: '#1a1a2e',
    tertiary: '#2a2a3e',
    quaternary: '#16213e',
  },

  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.8)',
    tertiary: 'rgba(255, 255, 255, 0.6)',
    quaternary: 'rgba(255, 255, 255, 0.4)',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },

  gradients: {
    purple: ['#667eea', '#764ba2'],
    green: ['#11998e', '#38ef7d'],
    pink: ['#f093fb', '#f5576c'],
    rainbow: ['#FA8BFF', '#2BD2FF', '#2BFF88'],
    blue: ['#4facfe', '#00f2fe'],
    orange: ['#FFCC00', '#FFB800'],
    red: ['#f5576c', '#f093fb'],
  },

  success: '#11998e',
  warning: '#FFCC00',
  error: '#f5576c',
  info: '#667eea',

  correct: '#11998e',
  incorrect: '#f5576c',
  neutral: '#667eea',

  overlay: 'rgba(0, 0, 0, 0.8)',
  glass: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.1)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 9999,
};

export const typography = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 32,
    massive: 48,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: 'bold',
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const getRandomGradient = () => {
  const gradientKeys = Object.keys(colors.gradients);
  const randomKey = gradientKeys[Math.floor(Math.random() * gradientKeys.length)];
  return colors.gradients[randomKey];
};

export const getGradientByIndex = (index) => {
  const gradientKeys = Object.keys(colors.gradients);
  const key = gradientKeys[index % gradientKeys.length];
  return colors.gradients[key];
};

export const getScoreColor = (percentage) => {
  if (percentage >= 80) return colors.gradients.green;
  if (percentage >= 60) return colors.gradients.orange;
  return colors.gradients.red;
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  getRandomGradient,
  getGradientByIndex,
  getScoreColor,
};