import React from 'react';
import styled from 'styled-components';
import { GameProvider } from './context/GameContext';
import GameScene from './components/GameScene';
import TopHUD from './components/TopHUD';
import BottomUIBar from './components/BottomUIBar';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #F0E68C 100%);
  font-family: 'Press Start 2P', monospace;
  overflow: hidden;
`;

const GameContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

function App() {
  return (
    <GameProvider>
      <AppContainer>
        <GameContainer>
          <TopHUD />
          <GameScene />
          <BottomUIBar />
        </GameContainer>
      </AppContainer>
    </GameProvider>
  );
}

export default App;