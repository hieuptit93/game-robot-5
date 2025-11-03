import React, { useState, useEffect } from 'react';
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
  const [urlParams, setUrlParams] = useState({});
  const [userId, setUserId] = useState(null);
  const [age, setAge] = useState(null);
  const [gameId, setGameId] = useState(null);

  // Parse URL params once on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const all = {};
      params.forEach((value, key) => {
        all[key] = value;
      });
      // Extract dedicated fields
      const extractedUserId = all.user_id ?? all.userId ?? null;
      const extractedAgeRaw = all.age ?? null;
      const extractedGameId = all.game_id ?? all.gameId ?? null;

      if (extractedUserId != null) setUserId(extractedUserId);
      if (extractedGameId != null) setGameId(extractedGameId);
      if (extractedAgeRaw != null) {
        const n = Number(extractedAgeRaw);
        setAge(Number.isFinite(n) ? n : extractedAgeRaw);
      }

      // Remove extracted keys from general params
      const { user_id, userId: userIdKey, age: ageKey, game_id, gameId: gameIdKey, ...rest } = all;
      setUrlParams(rest);
    } catch (e) {
      // noop
    }
  }, []);

  return (
    <GameProvider userId={userId} age={age} gameId={gameId} urlParams={urlParams}>
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