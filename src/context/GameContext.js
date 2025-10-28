import { createContext, useContext, useReducer } from 'react';

const GameContext = createContext();

const LEVEL_CONFIGS = [
    {
        level: 1,
        requiredPlanks: 5,
        phrases: [
            "Hello world",
            "How are you",
            "Nice to meet you",
            "Good morning",
            "Thank you",
            "What is your name",
            "I am fine",
            "See you later"
        ]
    },
    {
        level: 2,
        requiredPlanks: 7,
        phrases: [
            "I am learning English",
            "This is a beautiful day",
            "Can you help me please",
            "Where is the library",
            "I would like some coffee",
            "What time is it now",
            "See you tomorrow",
            "How much does it cost",
            "I need some help",
            "Where are you from"
        ]
    },
    {
        level: 3,
        requiredPlanks: 8,
        phrases: [
            "The weather is wonderful today",
            "I enjoy reading books very much",
            "Could you please repeat that",
            "I am excited about this project",
            "Learning new languages is fun",
            "Technology makes life easier",
            "Practice makes perfect always",
            "Dreams can become reality",
            "Education is very important",
            "I love traveling around the world",
            "Music brings people together"
        ]
    }
];

const initialState = {
    currentLevel: 1,
    score: 0,
    timer: 120,
    combo: 0,
    gamePhase: 'PROMPT', // 'PROMPT' | 'SPEAKING' | 'RESULT' | 'VICTORY' | 'GAME_OVER'
    levelConfig: LEVEL_CONFIGS,
    currentPhraseIndex: 0,
    planks: [],
    pikaPosition: { x: 50, y: 300 },
    isGameStarted: false
};

function gameReducer(state, action) {
    switch (action.type) {
        case 'START_GAME':
            return {
                ...state,
                isGameStarted: true,
                gamePhase: 'PROMPT',
                timer: 120,
                planks: []
            };

        case 'SET_PHASE':
            return {
                ...state,
                gamePhase: action.payload
            };

        case 'ADD_PLANK':
            return {
                ...state,
                planks: [...state.planks, action.payload]
            };

        case 'UPDATE_PLANK':
            return {
                ...state,
                planks: state.planks.map(plank =>
                    plank.id === action.payload.id ? { ...plank, ...action.payload.updates } : plank
                )
            };

        case 'ADD_SCORE':
            return {
                ...state,
                score: state.score + action.payload,
                combo: action.payload > 0 ? state.combo + 1 : 0
            };

        case 'NEXT_PHRASE':
            const nextIndex = state.currentPhraseIndex + 1;
            const currentLevelConfig = state.levelConfig.find(l => l.level === state.currentLevel);
            const successfulPlanks = state.planks.filter(p => p.status !== 'BROKEN').length;

            // Check if we have enough successful planks to win
            if (successfulPlanks >= currentLevelConfig.requiredPlanks) {
                return {
                    ...state,
                    gamePhase: 'VICTORY',
                    currentPhraseIndex: nextIndex
                };
            }

            // Check if we've run out of phrases without completing the bridge
            if (nextIndex >= currentLevelConfig.phrases.length) {
                return {
                    ...state,
                    gamePhase: 'GAME_OVER',
                    currentPhraseIndex: nextIndex
                };
            }

            return {
                ...state,
                currentPhraseIndex: nextIndex,
                gamePhase: 'PROMPT'
            };

        case 'NEXT_LEVEL':
            return {
                ...state,
                currentLevel: state.currentLevel + 1,
                currentPhraseIndex: 0,
                gamePhase: 'PROMPT',
                planks: [],
                pikaPosition: { x: 50, y: 300 }
            };

        case 'UPDATE_TIMER':
            return {
                ...state,
                timer: Math.max(0, state.timer - 1)
            };

        case 'UPDATE_PIKA_POSITION':
            return {
                ...state,
                pikaPosition: action.payload
            };

        case 'RESET_GAME':
            return {
                ...initialState,
                isGameStarted: false
            };

        default:
            return state;
    }
}

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}