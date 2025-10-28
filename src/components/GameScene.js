import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Matter from 'matter-js';
import { useGame } from '../context/GameContext';
import { usePronunciationScoring } from '../hooks/usePronunciationScoring';
import useSound from '../hooks/useSound';
import PikaAvatar from './PikaAvatar';
import PlankObject from './PlankObject';

const SceneContainer = styled.div`
  flex: 1;
  position: relative;
  background: linear-gradient(180deg, 
    #87CEEB 0%,     /* Sky blue */
    #B0E0E6 20%,    /* Powder blue */
    #98FB98 40%,    /* Pale green */
    #228B22 60%,    /* Forest green */
    #4682B4 80%,    /* Steel blue (river) */
    #1E90FF 100%    /* Dodger blue (deep river) */
  );
  overflow: hidden;
  outline: none;
  
  &:focus {
    outline: none;
  }
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
`;

const GameElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
`;

const StartScreen = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  z-index: 10;
  border: 4px solid #f39c12;
`;

const StartButton = styled.button`
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  padding: 16px 32px;
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  border: 2px solid #a93226;
  
  &:hover {
    background: linear-gradient(45deg, #c0392b, #a93226);
  }
`;

const Instructions = styled.div`
  margin: 20px 0;
  font-size: 10px;
  line-height: 1.6;
  color: #bdc3c7;
`;

const DebugInfo = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 10px;
  font-size: 10px;
  border-radius: 4px;
  z-index: 20;
`;



const ProcessingIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.9);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  z-index: 25;
  font-size: 12px;
  
  ${props => props.show ? 'display: block;' : 'display: none;'}
`;

const CountdownDisplay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  z-index: 20;
  font-size: 48px;
  font-family: 'Press Start 2P', monospace;
  border: 4px solid #f39c12;
  min-width: 200px;
  
  ${props => props.show ? 'display: block;' : 'display: none;'}
`;

const CountdownText = styled.div`
  font-size: 12px;
  margin-top: 20px;
  color: #bdc3c7;
  line-height: 1.4;
`;

const VictoryScreen = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.9);
  color: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  z-index: 20;
  border: 4px solid #f39c12;
  
  ${props => props.show ? 'display: block;' : 'display: none;'}
`;

const VictoryButton = styled.button`
  background: linear-gradient(45deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  padding: 16px 32px;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin: 10px;
  border: 2px solid #1e8449;
  
  &:hover {
    background: linear-gradient(45deg, #2ecc71, #27ae60);
  }
  
  &:disabled {
    background: #95a5a6;
    border-color: #7f8c8d;
    cursor: not-allowed;
  }
`;

const GameOverScreen = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(139, 0, 0, 0.9);
  color: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  z-index: 20;
  border: 4px solid #8B0000;
  
  ${props => props.show ? 'display: block;' : 'display: none;'}
`;

const GameOverButton = styled.button`
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  padding: 16px 32px;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin: 10px;
  border: 2px solid #a93226;
  
  &:hover {
    background: linear-gradient(45deg, #c0392b, #a93226);
  }
`;

const BridgeStructure = styled.div`
  position: absolute;
  bottom: 200px;
  left: min(170px, 15vw);
  width: calc(100vw - min(340px, 30vw));
  height: 100px;
  z-index: 1;
  
  @media (max-width: 768px) {
    left: min(120px, 12vw);
    width: calc(100vw - min(240px, 24vw));
    bottom: 160px;
  }
  
  @media (max-width: 480px) {
    left: min(80px, 10vw);
    width: calc(100vw - min(160px, 20vw));
    bottom: 120px;
  }
`;

const BridgeSupport = styled.div`
  position: absolute;
  width: 4px;
  height: 60px;
  background: #8B4513;
  bottom: 20px;
  
  ${props => `left: ${props.position}px;`}
`;

const Cliff = styled.div`
  position: absolute;
  bottom: 0;
  width: min(170px, 15vw);
  height: 280px;
  background: linear-gradient(45deg, #8B4513, #A0522D);
  border: 3px solid #654321;
  
  ${props => props.side === 'left' ? 'left: 0px;' : 'right: 0px;'}
  
  &::before {
    content: '';
    position: absolute;
    top: 0px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 20px;
    background: #228B22;
    border-radius: 10px;
  }
  
  @media (max-width: 768px) {
    width: min(120px, 12vw);
    height: 240px;
  }
  
  @media (max-width: 480px) {
    width: min(80px, 10vw);
    height: 200px;
  }
`;

const Mountain = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  z-index: -1;
  
  ${props => props.size === 'large' && `
    border-left: 150px solid transparent;
    border-right: 150px solid transparent;
    border-bottom: 300px solid #696969;
    left: ${props.left}px;
    bottom: 40%;
    
    &::before {
      content: '';
      position: absolute;
      bottom: -300px;
      left: -120px;
      width: 0;
      height: 0;
      border-left: 120px solid transparent;
      border-right: 120px solid transparent;
      border-bottom: 200px solid #808080;
    }
  `}
  
  ${props => props.size === 'medium' && `
    border-left: 100px solid transparent;
    border-right: 100px solid transparent;
    border-bottom: 200px solid #778899;
    left: ${props.left}px;
    bottom: 45%;
  `}
  
  ${props => props.size === 'small' && `
    border-left: 80px solid transparent;
    border-right: 80px solid transparent;
    border-bottom: 150px solid #A9A9A9;
    left: ${props.left}px;
    bottom: 50%;
  `}
`;

const Cloud = styled.div`
  position: absolute;
  background: white;
  border-radius: 50px;
  opacity: 0.8;
  z-index: 1;
  
  ${props => `
    width: ${props.width}px;
    height: ${props.height}px;
    top: ${props.top}px;
    left: ${props.left}px;
  `}
  
  &::before {
    content: '';
    position: absolute;
    background: white;
    border-radius: 50px;
    ${props => `
      width: ${props.width * 0.6}px;
      height: ${props.height * 0.6}px;
      top: -${props.height * 0.3}px;
      left: ${props.width * 0.2}px;
    `}
  }
  
  &::after {
    content: '';
    position: absolute;
    background: white;
    border-radius: 50px;
    ${props => `
      width: ${props.width * 0.8}px;
      height: ${props.height * 0.8}px;
      top: -${props.height * 0.4}px;
      right: ${props.width * 0.1}px;
    `}
  }
`;

const River = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 160px;
  background: linear-gradient(180deg, 
    #4682B4 0%,
    #1E90FF 50%,
    #0000CD 100%
  );
  z-index: 0;
`;

function GameScene() {
  const { state, dispatch } = useGame();
  const canvasRef = useRef();
  const engineRef = useRef();
  const renderRef = useRef();
  const [planks, setPlanks] = useState([]);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  // Get current phrase to speak
  const currentLevelConfig = state.levelConfig.find(l => l.level === state.currentLevel);
  const currentPhrase = currentLevelConfig?.phrases[state.currentPhraseIndex] || '';

  // Initialize sound effects
  const {
    playCountdown,
    playSuccess,
    playWarning,
    playError,
    playVictory,
    playGameOver,
    playStartRecording,
    playProcessing,
    playPlankPlace
  } = useSound();

  // Initialize pronunciation scoring with VAD
  const {
    isListening,
    isRecording,
    isProcessing,
    error: pronunciationError,
    startListening,
    stopListening
  } = usePronunciationScoring({
    mode: 'vad',
    autoAnalyze: true,
    textToAnalyze: currentPhrase,
    enableLogging: true,
    onAnalysisComplete: (result) => {
      console.log('🎯 VAD Analysis completed:', result);
      handlePronunciationResult(result);
    }
  });

  // Initialize Matter.js
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight - 160, // Subtract HUD heights
        wireframes: false,
        background: 'transparent',
        showAngleIndicator: false,
        showVelocity: false
      }
    });

    // Create ground and cliffs
    const ground = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight - 100,
      window.innerWidth,
      50,
      { isStatic: true, render: { fillStyle: '#654321' } }
    );

    Matter.World.add(engine.world, [ground]);

    engineRef.current = engine;
    renderRef.current = render;

    Matter.Runner.run(Matter.Runner.create(), engine);
    Matter.Render.run(render);

    return () => {
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
    };
  }, []);

  // Handle pronunciation result from VAD callback
  const handlePronunciationResult = (result) => {
    if (!result || result.total_score === undefined) {
      console.error('Invalid pronunciation result:', result);
      createBrokenPlank();
      return;
    }

    // Convert score to 0-100 range (API returns 0-1)
    const score = Math.round(result.total_score * 100);
    console.log('📊 Pronunciation score:', score);

    // Determine plank status based on score
    let plankResult;
    if (score >= 70) {
      plankResult = { type: 'FLUENT', score: 100, status: 'SOLID' };
      playSuccess(); // Good pronunciation sound
    } else if (score >= 50) {
      plankResult = { type: 'CHOPPY', score: 50, status: 'CRACKED' };
      playWarning(); // Medium pronunciation sound
    } else {
      plankResult = { type: 'WRONG', score: 0, status: 'BROKEN' };
      playError(); // Bad pronunciation sound
    }

    createPlank(plankResult, score);
  };

  // Helper function to create a plank
  const createPlank = (plankResult, actualScore = 0) => {
    // Calculate dynamic plank positioning with responsive cliff dimensions
    const totalPlanks = currentLevelConfig?.requiredPlanks || 5;
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
    const plankWidth = bridgeWidth / totalPlanks;
    const plankSpacing = plankWidth;

    // Find the next available position
    const successfulPlanks = planks.filter(p => p.status !== 'BROKEN');
    const nextPosition = successfulPlanks.length;

    // Create plank for React rendering
    const plankX = cliffWidth + (nextPosition * plankSpacing) + (plankWidth / 2);
    // Position plank at cliff height - 20px to be on bridge level
    const plankY = cliffHeight - 20;

    const newPlank = {
      id: Date.now(),
      status: plankResult.status,
      position: { x: plankX, y: plankY },
      width: plankWidth,
      isNew: true,
      score: actualScore
    };

    console.log('Creating plank with score:', actualScore, 'status:', plankResult.status);

    // Add new plank and reorganize positions
    setPlanks(prev => {
      const updatedPlanks = [...prev, newPlank];

      // Reorganize successful planks to fill gaps
      const successfulPlanks = updatedPlanks.filter(p => p.status !== 'BROKEN');
      const brokenPlanks = updatedPlanks.filter(p => p.status === 'BROKEN');

      // Reassign positions for successful planks
      const reorganizedSuccessful = successfulPlanks.map((plank, index) => ({
        ...plank,
        position: {
          ...plank.position,
          x: cliffWidth + (index * plankSpacing) + (plankWidth / 2)
        }
      }));

      return [...reorganizedSuccessful, ...brokenPlanks];
    });

    dispatch({ type: 'ADD_PLANK', payload: newPlank });
    dispatch({ type: 'ADD_SCORE', payload: plankResult.score });
    dispatch({ type: 'SET_PHASE', payload: 'RESULT' });
    
    // Play plank placement sound
    setTimeout(() => {
      playPlankPlace(plankResult.status);
    }, 500); // Delay to sync with visual animation

    // Auto transition to next phrase after 3 seconds
    setTimeout(() => {
      dispatch({ type: 'NEXT_PHRASE' });
    }, 3000);
  };

  // Helper function to create broken plank on error
  const createBrokenPlank = () => {
    const plankResult = { type: 'WRONG', score: 0, status: 'BROKEN' };
    createPlank(plankResult, 0);
  };



  // Stop listening when game phase changes away from SPEAKING
  useEffect(() => {
    if (state.gamePhase !== 'SPEAKING' && isListening) {
      console.log('🛑 Stopping VAD listening due to phase change');
      stopListening();
    }
  }, [state.gamePhase, isListening, stopListening]);

  // Play sounds when game phase changes
  useEffect(() => {
    switch (state.gamePhase) {
      case 'VICTORY':
        setTimeout(() => playVictory(), 500); // Delay for dramatic effect
        break;
      case 'GAME_OVER':
        setTimeout(() => playGameOver(), 500);
        break;
      case 'RESULT':
        playProcessing();
        break;
      default:
        break;
    }
  }, [state.gamePhase, playVictory, playGameOver, playProcessing]);

  // Auto-start countdown when entering PROMPT phase
  useEffect(() => {
    if (state.gamePhase === 'PROMPT' && countdown === 0) {
      console.log('🕐 Starting countdown for new phrase');
      setCountdown(3);
    }
  }, [state.gamePhase, countdown]);

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          // Countdown finished, start listening
          console.log('🎤 Countdown finished, starting VAD listening');
          playCountdown(1); // Final countdown sound
          dispatch({ type: 'SET_PHASE', payload: 'SPEAKING' });
          setCountdown(0);
        } else {
          playCountdown(countdown - 1); // Regular countdown sound
          setCountdown(prev => prev - 1);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown, dispatch]);

  // Start listening when entering SPEAKING phase
  useEffect(() => {
    if (state.gamePhase === 'SPEAKING' && !isListening) {
      console.log('🎤 Starting VAD listening...');
      playStartRecording();
      startListening();
    }
  }, [state.gamePhase, isListening, startListening, playStartRecording]);

  // Timer countdown
  useEffect(() => {
    if (!state.isGameStarted || state.gamePhase === 'VICTORY' || state.gamePhase === 'GAME_OVER') return;

    const timer = setInterval(() => {
      dispatch({ type: 'UPDATE_TIMER' });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isGameStarted, state.gamePhase, dispatch]);

  // Reset planks when level changes or game starts
  useEffect(() => {
    setPlanks([]);
  }, [state.currentLevel, state.isGameStarted]);

  const handleStartGame = () => {
    dispatch({ type: 'START_GAME' });
  };

  const handleNextLevel = () => {
    const nextLevel = state.currentLevel + 1;
    const hasNextLevel = state.levelConfig.find(l => l.level === nextLevel);

    if (hasNextLevel) {
      setPlanks([]); // Reset planks in component
      dispatch({ type: 'NEXT_LEVEL' });
    } else {
      // Game completed
      alert('Chúc mừng! Bạn đã hoàn thành tất cả các level!');
      setPlanks([]); // Reset planks in component
      dispatch({ type: 'RESET_GAME' });
    }
  };

  const handleReplayLevel = () => {
    setPlanks([]); // Reset planks in component
    dispatch({ type: 'RESET_GAME' });
    dispatch({ type: 'START_GAME' });
  };

  const handleRetryLevel = () => {
    setPlanks([]); // Reset planks in component
    dispatch({ type: 'RESET_GAME' });
    // Keep the same level
    dispatch({ type: 'START_GAME' });
  };

  if (!state.isGameStarted) {
    return (
      <SceneContainer>
        <StartScreen>
          <h2>VOICE BRIDGE</h2>
          <Instructions>
            Giúp Pika băng qua cầu bằng cách phát âm chính xác!<br />
            <br />
            Điều khiển:<br />
            A = Phát âm tốt (Ván xanh, +100 điểm)<br />
            S = Phát âm tạm được (Ván vàng, +50 điểm)<br />
            D = Phát âm sai (Ván đỏ, rơi xuống)<br />
            <br />
            Hoàn thành đủ số ván để qua level!
          </Instructions>
          <StartButton onClick={handleStartGame}>
            BẮT ĐẦU GAME
          </StartButton>
        </StartScreen>
      </SceneContainer>
    );
  }

  // Generate bridge support positions - only at the ends
  const bridgeSupports = [];
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
  const bridgeWidth = window.innerWidth - (cliffWidth * 2);

  // Only add supports at the two ends of the bridge
  bridgeSupports.push(0); // Left end
  bridgeSupports.push(bridgeWidth); // Right end

  return (
    <SceneContainer
      tabIndex={0}
      onClick={() => document.activeElement.blur()}
    >
      <Canvas ref={canvasRef} />

      {/* Background Mountains */}
      <Mountain size="large" left={-100} />
      <Mountain size="medium" left={100} />
      <Mountain size="small" left={window.innerWidth - 300} />
      <Mountain size="large" left={window.innerWidth - 50} />

      {/* Clouds */}
      <Cloud width={80} height={40} top={20} left={100} />
      <Cloud width={60} height={30} top={50} left={300} />
      <Cloud width={70} height={35} top={10} left={window.innerWidth - 200} />
      <Cloud width={90} height={45} top={40} left={window.innerWidth - 400} />

      {/* River */}
      <River />

      {/* Bridge Structure */}
      {/* <BridgeStructure>
        {bridgeSupports.map((position, index) => (
          <BridgeSupport key={index} position={position} />
        ))}
      </BridgeStructure> */}

      {/* Cliffs */}
      <Cliff side="left" />
      <Cliff side="right" />

      <GameElements>
        <PikaAvatar />
        {planks.map(plank => (
          <PlankObject key={plank.id} plank={plank} />
        ))}
      </GameElements>

      <DebugInfo>
        Phase: {state.gamePhase}<br />
        Phrase: {state.currentPhraseIndex + 1}<br />
        Planks: {planks.length}<br />
        Countdown: {countdown}<br />
        IsListening: {isListening ? 'Yes' : 'No'}<br />
        {pronunciationError && <div style={{ color: '#e74c3c' }}>Error: {pronunciationError}</div>}
      </DebugInfo>

      <CountdownDisplay show={state.gamePhase === 'PROMPT' && countdown > 0}>
        <div style={{ color: '#f39c12', marginBottom: '20px', fontSize: '16px' }}>
          "{currentPhrase}"
        </div>
        <div style={{ color: countdown <= 1 ? '#e74c3c' : '#2ecc71' }}>
          {countdown}
        </div>
        <CountdownText>
          {countdown > 1 ? 'Chuẩn bị phát âm...' : 'BẮT ĐẦU!'}
        </CountdownText>
      </CountdownDisplay>

      <ProcessingIndicator show={isProcessing}>
        <div>🔄 Đang phân tích phát âm...</div>
        <div style={{ fontSize: '10px', marginTop: '10px', color: '#bdc3c7' }}>
          Vui lòng đợi...
        </div>
      </ProcessingIndicator>

      <VictoryScreen show={state.gamePhase === 'VICTORY'}>
        <h2>🎉 HOÀN THÀNH LEVEL {state.currentLevel}! 🎉</h2>
        <div style={{ margin: '20px 0', fontSize: '10px', color: '#bdc3c7' }}>
          Điểm số: {state.score}<br />
          Combo tối đa: {state.combo}
        </div>

        {state.levelConfig.find(l => l.level === state.currentLevel + 1) ? (
          <div>
            <VictoryButton onClick={handleNextLevel}>
              LEVEL TIẾP THEO
            </VictoryButton>
            <br />
            <VictoryButton onClick={handleReplayLevel}>
              CHƠI LẠI
            </VictoryButton>
          </div>
        ) : (
          <div>
            <h3 style={{ color: '#f39c12', margin: '20px 0' }}>
              🏆 HOÀN THÀNH TẤT CẢ! 🏆
            </h3>
            <VictoryButton onClick={handleReplayLevel}>
              CHƠI LẠI TỪ ĐẦU
            </VictoryButton>
          </div>
        )}
      </VictoryScreen>

      <GameOverScreen show={state.gamePhase === 'GAME_OVER'}>
        <h2>💀 GAME OVER 💀</h2>
        <div style={{ margin: '20px 0', fontSize: '10px', color: '#ffcccc' }}>
          Pika đã rơi xuống sông!<br />
          Cần {state.levelConfig.find(l => l.level === state.currentLevel)?.requiredPlanks} tấm ván<br />
          Chỉ có {state.planks.filter(p => p.status !== 'BROKEN').length} tấm thành công
        </div>

        <div>
          <GameOverButton onClick={handleRetryLevel}>
            THỬ LẠI LEVEL {state.currentLevel}
          </GameOverButton>
          <br />
          <GameOverButton onClick={handleReplayLevel}>
            VỀ LEVEL 1
          </GameOverButton>
        </div>
      </GameOverScreen>
    </SceneContainer>
  );
}

export default GameScene;