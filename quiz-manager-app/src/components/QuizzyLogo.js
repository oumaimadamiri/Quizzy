import React from 'react';
import Svg, { Circle, Ellipse, Path, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

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
        
        <G>
          <Ellipse cx="-15" cy="-15" rx="8" ry="12" fill="#667eea" />
          <Ellipse cx="-13" cy="-17" rx="3" ry="4" fill="white" />
          
          <Ellipse cx="15" cy="-15" rx="8" ry="12" fill="#667eea" />
          <Ellipse cx="17" cy="-17" rx="3" ry="4" fill="white" />
        </G>
        
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
      
      <G opacity="0.8">
        <Path 
          d="M 30 40 L 33 47 L 40 47 L 35 52 L 37 59 L 30 54 L 23 59 L 25 52 L 20 47 L 27 47 Z" 
          fill="#FFCC00"
        />
        <Path 
          d="M 165 35 L 167 40 L 172 40 L 168 44 L 170 49 L 165 45 L 160 49 L 162 44 L 158 40 L 163 40 Z" 
          fill="#11998e"
        />
        <Path 
          d="M 175 165 L 177 170 L 182 170 L 178 174 L 180 179 L 175 175 L 170 179 L 172 174 L 168 170 L 173 170 Z" 
          fill="#f093fb"
        />
        <Path 
          d="M 25 165 L 27 170 L 32 170 L 28 174 L 30 179 L 25 175 L 20 179 L 22 174 L 18 170 L 23 170 Z" 
          fill="#667eea"
        />
      </G>
      
      <G opacity="0.6">
        <Circle cx="45" cy="80" r="2" fill="white"/>
        <Circle cx="155" cy="75" r="2" fill="white"/>
        <Circle cx="50" cy="120" r="1.5" fill="white"/>
        <Circle cx="150" cy="125" r="1.5" fill="white"/>
      </G>
    </Svg>
  );
};

export default QuizzyLogo;