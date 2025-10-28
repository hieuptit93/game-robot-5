import { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const flash = keyframes`
  0% { color: #ff4444; }
  50% { color: #ffffff; }
  100% { color: #ff4444; }
`;

const HUDContainer = styled.div`
  height: 80px;
  background: linear-gradient(90deg, #2c3e50 0%, #34495e 100%);
  border-bottom: 4px solid #1a252f;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ecf0f1;
  font-size: 12px;
`;

const StatLabel = styled.div`
  margin-bottom: 4px;
  color: #bdc3c7;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: bold;
  
  ${props => props.combo >= 3 && css`
    animation: ${pulse} 0.8s infinite;
    color: #f39c12;
  `}
  
  ${props => props.isLowTimer && css`
    animation: ${flash} 1s infinite;
  `}
`;

const LevelIndicator = styled.div`
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  padding: 8px 16px;
  border-radius: 8px;
  border: 2px solid #a93226;
  color: white;
  font-size: 14px;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.2);
`;

const SoundToggle = styled.button`
  background: ${props => props.enabled ? 'linear-gradient(45deg, #27ae60, #2ecc71)' : 'linear-gradient(45deg, #95a5a6, #7f8c8d)'};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  border: 2px solid ${props => props.enabled ? '#1e8449' : '#5d6d7e'};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 14px;
  }
`;

function TopHUD() {
  const { state } = useGame();
  const { score, timer, combo, currentLevel } = state;
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const isLowTimer = timer < 30;
  
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    // Store sound preference in localStorage
    localStorage.setItem('voiceBridgeSoundEnabled', (!soundEnabled).toString());
  };
  
  // Load sound preference on mount
  useState(() => {
    const savedPreference = localStorage.getItem('voiceBridgeSoundEnabled');
    if (savedPreference !== null) {
      setSoundEnabled(savedPreference === 'true');
    }
  }, []);
  
  return (
    <HUDContainer>
      <StatItem>
        <StatLabel>SCORE</StatLabel>
        <StatValue>{score.toLocaleString()}</StatValue>
      </StatItem>
      
      <LevelIndicator>
        LEVEL {currentLevel}
      </LevelIndicator>
      
      <StatItem>
        <StatLabel>COMBO</StatLabel>
        <StatValue combo={combo}>
          {combo > 0 ? `x${combo}` : '0'}
        </StatValue>
      </StatItem>
      
      <StatItem>
        <StatLabel>TIME</StatLabel>
        <StatValue isLowTimer={isLowTimer}>
          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </StatValue>
      </StatItem>
    </HUDContainer>
  );
}

export default TopHUD;