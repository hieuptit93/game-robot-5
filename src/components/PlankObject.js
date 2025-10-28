import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
`;

const PlankContainer = styled(motion.div)`
  position: absolute;
  height: 20px;
  z-index: 3;
  pointer-events: none;
  
  ${props => `width: ${props.width || 70}px;`}
`;

const PlankBody = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 4px;
  border: 2px solid;
  position: relative;
  
  ${props => {
    switch (props.status) {
      case 'SOLID':
        return css`
          background: linear-gradient(45deg, #2ecc71, #27ae60);
          border-color: #1e8449;
          box-shadow: 0 2px 4px rgba(46, 204, 113, 0.3);
        `;
      case 'CRACKED':
        return css`
          background: linear-gradient(45deg, #f39c12, #e67e22);
          border-color: #d68910;
          box-shadow: 0 2px 4px rgba(243, 156, 18, 0.3);
          animation: ${shake} 0.5s infinite;
        `;
      case 'BROKEN':
        return css`
          background: linear-gradient(45deg, #e74c3c, #c0392b);
          border-color: #a93226;
          box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
        `;
      default:
        return css`
          background: #95a5a6;
          border-color: #7f8c8d;
        `;
    }
  }}
  
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`;

const CrackEffect = styled.div`
  position: absolute;
  top: 50%;
  left: 20%;
  width: 60%;
  height: 2px;
  background: #8b4513;
  transform: translateY(-50%) rotate(-15deg);
  opacity: ${props => props.status === 'CRACKED' ? 1 : 0};
  transition: opacity 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 30%;
    width: 40%;
    height: 2px;
    background: #8b4513;
    transform: rotate(30deg);
  }
`;

const ScorePopup = styled(motion.div)`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: bold;
  color: ${props => props.score > 50 ? '#2ecc71' : props.score > 0 ? '#f39c12' : '#e74c3c'};
  z-index: 10;
  pointer-events: none;
`;

function PlankObject({ plank }) {
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  
  useEffect(() => {
    // Show score popup when plank is created
    const scoreValue = plank.status === 'SOLID' ? 100 : 
                      plank.status === 'CRACKED' ? 50 : 0;
    setScore(scoreValue);
    setShowScore(true);
    
    const timer = setTimeout(() => {
      setShowScore(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [plank.status]);
  
  return (
    <PlankContainer
      width={plank.width}
      style={{
        left: `${plank.position.x - (plank.width || 70) / 2}px`,
        bottom: `${plank.position.y}px`
      }}
      initial={{ scale: 0, rotate: 0, y: -50 }}
      animate={{ 
        scale: 1,
        y: plank.status === 'BROKEN' ? 200 : 0,
        rotate: plank.status === 'BROKEN' ? [0, -15, 15, -10, 0] : 0
      }}
      transition={{ 
        scale: { duration: 0.3, ease: "backOut" }, // Quick scale up with bounce
        y: { 
          duration: plank.status === 'BROKEN' ? 2 : 0.3,
          delay: plank.status === 'BROKEN' ? 0.5 : 0 // Delay fall for broken planks
        },
        rotate: { duration: 2, repeat: plank.status === 'BROKEN' ? Infinity : 0 }
      }}
    >
      <PlankBody status={plank.status}>
        <CrackEffect status={plank.status} />
      </PlankBody>
      
      {showScore && (
        <ScorePopup
          score={score}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: -20, opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          {score > 0 ? `+${score}` : 'MISS'}
        </ScorePopup>
      )}
    </PlankContainer>
  );
}

export default PlankObject;