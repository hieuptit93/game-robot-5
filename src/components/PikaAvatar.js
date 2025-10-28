import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import SpriteCharacter from './SpriteCharacter';

const CharacterContainer = styled(motion.div)`
  position: absolute;
  z-index: 5;
`;

function PikaAvatar() {
  const { state } = useGame();
  const { currentPhraseIndex, gamePhase, planks } = state;
  const [pikaPosition, setPikaPosition] = useState(0);

  // Calculate target position based on successful planks
  const successfulPlanks = planks.filter(p => p.status !== 'BROKEN').length;

  // Update Pika position with delay when new successful plank is added
  useEffect(() => {
    if (gamePhase === 'RESULT') {
      // Wait for plank animation to complete before moving Pika
      const timer = setTimeout(() => {
        setPikaPosition(successfulPlanks);
      }, 800); // Delay Pika movement by 800ms

      return () => clearTimeout(timer);
    }
  }, [successfulPlanks, gamePhase]);

  // Reset Pika position when level changes or game restarts
  useEffect(() => {
    setPikaPosition(0);
  }, [state.currentLevel, state.isGameStarted]);
  const currentLevelConfig = state.levelConfig.find(l => l.level === state.currentLevel);
  const totalPlanks = currentLevelConfig?.requiredPlanks || 5;
  
  // Calculate responsive cliff dimensions
  const getCliffDimensions = () => {
    if (window.innerWidth <= 480) {
      return {
        width: Math.min(80, window.innerWidth * 0.1),
        height: 200
      };
    }
    if (window.innerWidth <= 768) {
      return {
        width: Math.min(120, window.innerWidth * 0.12),
        height: 240
      };
    }
    return {
      width: Math.min(170, window.innerWidth * 0.15),
      height: 280
    };
  };
  
  const cliffDimensions = getCliffDimensions();
  const cliffWidth = cliffDimensions.width;
  const cliffHeight = cliffDimensions.height;
  const bridgeWidth = window.innerWidth - (cliffWidth * 2);
  const plankSpacing = bridgeWidth / totalPlanks;

  const baseX = cliffWidth - 30; // Start on left cliff
  const pikaX = baseX + (pikaPosition * plankSpacing);
  // Position Pika on TOP of cliff surface (cliff height from bottom)
  const pikaY = cliffHeight;

  const isSpeaking = gamePhase === 'SPEAKING';
  const isVictory = gamePhase === 'VICTORY';
  const isGameOver = gamePhase === 'GAME_OVER';
  
  // Detect if Pika is moving
  const isMoving = pikaPosition !== successfulPlanks;

  return (
    <CharacterContainer
      animate={{
        x: isVictory ? pikaPosition * plankSpacing + 150 : pikaPosition * plankSpacing, // Move extra when victory
        y: isGameOver ? 500 : 0, // Fall down further when game over (visible)
        scale: isVictory ? 1.3 : 1, // Bigger scale for victory
        rotate: isGameOver ? 720 : 0 // Double rotation when falling
      }}
      transition={{
        x: { duration: isVictory ? 4 : 2.5, ease: "easeInOut" }, // Much slower when victory
        y: { duration: isGameOver ? 4 : 0.8, ease: isGameOver ? "easeIn" : "easeInOut" }, // Slower fall, visible
        rotate: { duration: isGameOver ? 4 : 0.8, ease: "easeInOut" },
        scale: { duration: 0.8 }
      }}
      style={{
        left: `${baseX}px`, // Base position on left cliff
        bottom: `${pikaY}px`
      }}
    >
      <SpriteCharacter
        isVictory={isVictory}
        isGameOver={isGameOver}
        isSpeaking={isSpeaking}
        isMoving={isMoving}
      />
    </CharacterContainer>
  );
}

export default PikaAvatar;