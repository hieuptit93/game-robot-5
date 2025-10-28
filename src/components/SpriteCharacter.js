import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Import sprite images
import walkSprite from '../assets/character/standard/walk.png';

const CharacterContainer = styled(motion.div)`
  position: relative;
  width: 64px;
  height: 64px;
  z-index: 5;
  overflow: hidden; /* Hide other frames */
`;

const SpriteImage = styled.img`
  width: auto;
  height: auto;
  max-width: none;
  image-rendering: pixelated;
  position: absolute;
  top: ${props => -props.frameY * 64}px;
  left: ${props => -props.frameX * 64}px;
  clip: rect(${props => props.frameY * 64}px, ${props => (props.frameX + 1) * 64}px, ${props => (props.frameY + 1) * 64}px, ${props => props.frameX * 64}px);
`;



function SpriteCharacter({
  isVictory = false,
  isGameOver = false,
  isSpeaking = false,
  isMoving = false, // New prop to detect movement
  style = {},
  animate = {},
  transition = {}
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentSprite, setCurrentSprite] = useState(walkSprite);

  // Always use the same sprite sheet (idle.png contains all animations)
  useEffect(() => {
    setCurrentSprite(walkSprite); // Use idle.png as the main sprite sheet
  }, []);

  // Smooth walk animation with more frames
  useEffect(() => {
    let interval;

    if (isVictory) {
      // Emote animation - 4 frames
      interval = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % 4);
      }, 400);
    } else if (isGameOver) {
      // Single frame for hurt
      setCurrentFrame(0);
    } else if (isMoving || isSpeaking) {
      // Walking animation when moving: 8 frames (smooth and slow)
      interval = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % 8);
      }, 200); // Smooth walking when moving
    } else {
      // Walking animation when standing: 6 frames (slightly faster)
      interval = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % 6);
      }, 150); // Slightly faster when standing
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking, isVictory, isGameOver, isMoving]);

  // More frames for smoother animation
  const getFramePosition = () => {
    if (isGameOver) {
      return { frameX: 0, frameY: 20 }; // Hurt animation row
    } else if (isVictory) {
      return { frameX: currentFrame % 4, frameY: 19 }; // Emote animation row, 4 frames
    } else if (isMoving || isSpeaking) {
      // Walking animation when moving: 8 frames in row 2 (facing right)
      return { frameX: currentFrame % 8, frameY: 3 };
    } else {
      // Walking animation when standing: 6 frames in row 2 (facing right)
      return { frameX: currentFrame % 6, frameY: 3 };
    }
  };

  const { frameX, frameY } = getFramePosition();

  return (
    <CharacterContainer
      style={style}
      animate={animate}
      transition={transition}
    >
      <SpriteImage
        src={currentSprite}
        frameX={frameX}
        frameY={frameY}
        alt="Character sprite"
      />

      {/* {isVictory && <VictoryEffect>🎉</VictoryEffect>} */}
    </CharacterContainer>
  );
}

export default SpriteCharacter;