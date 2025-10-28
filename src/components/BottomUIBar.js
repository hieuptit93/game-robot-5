import { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const UIContainer = styled.div`
  height: 120px;
  background: linear-gradient(90deg, #2c3e50 0%, #34495e 100%);
  border-top: 4px solid #1a252f;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  box-shadow: 0 -4px 8px rgba(0,0,0,0.3);
  
  @media (max-width: 768px) {
    height: 110px;
    padding: 12px 16px;
  }
  
  @media (max-width: 480px) {
    height: 100px;
    padding: 8px 12px;
  }
`;

const PhraseSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
`;

const PhraseText = styled.div`
  font-size: 16px;
  color: #ecf0f1;
  text-align: center;
  margin-bottom: 8px;
  min-height: 20px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    min-height: 18px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    min-height: 16px;
    margin-bottom: 6px;
  }
`;

const PhaseIndicator = styled.div`
  font-size: 12px;
  color: #bdc3c7;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 10px;
    letter-spacing: 0.5px;
  }
  
  @media (max-width: 480px) {
    font-size: 9px;
    letter-spacing: 0.3px;
  }
`;

const ControlsSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    gap: 15px;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const FluencyBar = styled.div`
  width: 200px;
  height: 8px;
  background: #34495e;
  border-radius: 4px;
  border: 2px solid #2c3e50;
  overflow: hidden;
  position: relative;
  
  @media (max-width: 768px) {
    width: 150px;
    height: 6px;
  }
  
  @media (max-width: 480px) {
    width: 100px;
    height: 5px;
  }
`;

const FluencyFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #e74c3c 0%, #f39c12 50%, #2ecc71 100%);
  border-radius: 2px;
`;

const ActionButton = styled(motion.button)`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  cursor: pointer;
  border: 2px solid;
  
  ${props => props.variant === 'mic' && css`
    background: ${props.active ? 'linear-gradient(45deg, #e74c3c, #c0392b)' : 'linear-gradient(45deg, #95a5a6, #7f8c8d)'};
    color: white;
    border-color: ${props.active ? '#a93226' : '#5d6d7e'};
    ${props.active ? css`animation: ${pulse} 1s infinite;` : ''}
  `}
  
  ${props => props.variant === 'replay' && css`
    background: linear-gradient(45deg, #3498db, #2980b9);
    color: white;
    border-color: #1f4e79;
  `}
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    font-size: 8px;
    padding: 6px 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 7px;
    padding: 4px 8px;
  }
`;

const KeyHints = styled.div`
  display: flex;
  gap: 12px;
  font-size: 8px;
  color: #bdc3c7;
  
  @media (max-width: 768px) {
    font-size: 7px;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 6px;
    gap: 6px;
  }
`;

const KeyHint = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  span {
    background: #34495e;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #2c3e50;
  }
`;

const ProgressInfo = styled.div`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #bdc3c7;
  text-align: right;
  
  @media (max-width: 768px) {
    font-size: 8px;
    right: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 7px;
    right: 10px;
  }
`;

function BottomUIBar() {
  const { state, dispatch } = useGame();
  const { 
    gamePhase, 
    currentPhraseIndex, 
    currentLevel, 
    levelConfig,
    planks 
  } = state;
  
  const currentLevelConfig = levelConfig.find(l => l.level === currentLevel);
  const currentPhrase = currentLevelConfig?.phrases[currentPhraseIndex] || '';
  const totalPlanks = currentLevelConfig?.requiredPlanks || 0;
  const completedPlanks = planks.filter(p => p.status !== 'BROKEN').length;
  
  const handleMicClick = () => {
    if (gamePhase === 'PROMPT') {
      dispatch({ type: 'SET_PHASE', payload: 'SPEAKING' });
    }
  };
  
  const handleReplayClick = () => {
    // Replay current phrase (reset to PROMPT phase)
    dispatch({ type: 'SET_PHASE', payload: 'PROMPT' });
  };
  
  const getPhaseText = () => {
    switch (gamePhase) {
      case 'PROMPT':
        return 'Nhấn nút MIC để bắt đầu nghe!';
      case 'SPEAKING':
        return 'Đang nghe... Hãy phát âm câu trên! (Tự động dừng khi im lặng)';
      case 'RESULT':
        return 'Đang phân tích phát âm của bạn...';
      case 'VICTORY':
        return 'Hoàn thành level!';
      default:
        return '';
    }
  };
  
  const fluencyProgress = gamePhase === 'SPEAKING' ? 
    Math.min(100, (Date.now() % 3000) / 30) : 0;
  
  return (
    <UIContainer>
      <PhraseSection>
        <PhraseText>
          {gamePhase === 'VICTORY' ? 
            '🎉 Chúc mừng! Pika đã băng qua cầu thành công!' : 
            currentPhrase
          }
        </PhraseText>
        <PhaseIndicator>{getPhaseText()}</PhaseIndicator>
      </PhraseSection>
      
      <ControlsSection>
        <ActionButton
          variant="mic"
          active={gamePhase === 'SPEAKING'}
          onClick={handleMicClick}
          disabled={gamePhase === 'RESULT' || gamePhase === 'VICTORY'}
          whileTap={{ scale: 0.95 }}
        >
          {gamePhase === 'SPEAKING' ? '🎤 ĐANG NGHE' : '🎤 MIC'}
        </ActionButton>
        
        <FluencyBar>
          <FluencyFill
            initial={{ width: '0%' }}
            animate={{ width: `${fluencyProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </FluencyBar>
        
        <ActionButton
          variant="replay"
          onClick={handleReplayClick}
          disabled={gamePhase === 'SPEAKING' || gamePhase === 'VICTORY'}
          whileTap={{ scale: 0.95 }}
        >
          🔄 REPLAY
        </ActionButton>
      </ControlsSection>
      
      <KeyHints>
        <KeyHint>
          <span>≥70</span> Tốt (+100)
        </KeyHint>
        <KeyHint>
          <span>≥50</span> Tạm được (+50)
        </KeyHint>
        <KeyHint>
          <span>&lt;50</span> Cần cải thiện (0)
        </KeyHint>
      </KeyHints>
      
      <ProgressInfo>
        Tiến độ: {completedPlanks}/{totalPlanks} ván<br/>
        Câu: {currentPhraseIndex + 1}/{currentLevelConfig?.phrases.length || 0}
      </ProgressInfo>
    </UIContainer>
  );
}

export default BottomUIBar;