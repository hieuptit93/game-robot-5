import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

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

export function GameProvider({ children, userId, age, gameId, urlParams }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [gameSessionId, setGameSessionId] = useState(null);
    const [isSurveyOpen, setIsSurveyOpen] = useState(false);

    // Create a game_session row only when game actually starts
    useEffect(() => {
        const createSession = async () => {
            if (!state.isGameStarted) return;
            if (gameSessionId) return; // Already have a session
            if (!userId) return; // Need userId to create session

            const numericAge = Number.isFinite(Number(age)) ? Number(age) : null;
            const numericGameId = Number.isFinite(Number(gameId)) ? Number(gameId) : null;

            const payload = {
                user_id: userId,
                age: numericAge,
                game_id: numericGameId,
                start_time: new Date().toISOString(),
                score: 0,
                profile_data: urlParams || {}
            };

            try {
                const { data, error } = await supabase
                    .from('game_sessions')
                    .insert(payload)
                    .select('id')
                    .single();

                if (error) {
                    console.error('Failed to create game session:', error);
                    return;
                }

                setGameSessionId(data?.id || null);
                console.log('Created game session:', data?.id);
            } catch (err) {
                console.error('Unexpected error creating game session:', err);
            }
        };

        createSession();
    }, [state.isGameStarted, userId, age, gameId, urlParams, gameSessionId]);

    // Open survey when game over ONLY if user hasn't completed survey for this game before
    useEffect(() => {
        const checkAndOpenSurvey = async () => {
            if (state.gamePhase !== 'VICTORY' && state.gamePhase !== 'GAME_OVER') {
                setIsSurveyOpen(false);
                return;
            }
            
            console.log('🔍 Checking survey display:', { gamePhase: state.gamePhase, gameSessionId, userId, gameId, score: state.score });
            
            try {
                const numericGameId = Number.isFinite(Number(gameId)) ? Number(gameId) : null;

                // If we know the user and game, check historical completion
                if (userId && numericGameId != null) {
                    const { data: history, error: historyError } = await supabase
                        .from('game_sessions')
                        .select('id')
                        .eq('user_id', userId)
                        .eq('game_id', numericGameId)
                        .eq('survey_completed', true)
                        .limit(1);

                    if (!historyError && Array.isArray(history) && history.length > 0) {
                        console.log('❌ Survey already completed for this user and game. Not showing.');
                        setIsSurveyOpen(false);
                        return;
                    }
                }

                // Fallback to current session's completion flag if available
                if (gameSessionId) {
                    const { data, error } = await supabase
                        .from('game_sessions')
                        .select('survey_completed')
                        .eq('id', gameSessionId)
                        .single();
                    if (!error && data) {
                        const completed = Boolean(data?.survey_completed);
                        console.log('📊 Current session survey_completed:', completed, 'Setting isSurveyOpen to:', !completed);
                        setIsSurveyOpen(!completed);
                        return;
                    } else {
                        console.log('⚠️ Could not fetch current session, will show survey');
                    }
                } else {
                    console.log('⚠️ No gameSessionId, will show survey');
                }

                // Default: show if we couldn't verify completion
                console.log('✅ Showing survey (default - no restrictions found)');
                setIsSurveyOpen(true);
            } catch (e) {
                console.error('⚠️ Error checking survey completion:', e);
                console.log('✅ Showing survey (fallback due to error)');
                setIsSurveyOpen(true);
            }
        };

        // Add small delay to ensure end_time update completes first
        const timer = setTimeout(() => {
            checkAndOpenSurvey();
        }, 200);
        
        return () => clearTimeout(timer);
    }, [state.gamePhase, gameSessionId, userId, gameId, state.score]);

    // When game ends, update end_time and final score on the session
    useEffect(() => {
        const markEndTime = async () => {
            if ((state.gamePhase !== 'VICTORY' && state.gamePhase !== 'GAME_OVER') || !gameSessionId) return;
            try {
                await supabase
                    .from('game_sessions')
                    .update({ end_time: new Date().toISOString(), score: state.score })
                    .eq('id', gameSessionId);
            } catch (e) {
                // noop
            }
        };
        markEndTime();
    }, [state.gamePhase, gameSessionId, state.score]);

    // Wrapper dispatch to reset gameSessionId when starting new game
    const originalDispatch = dispatch;
    const wrappedDispatch = useCallback((action) => {
        if (action.type === 'START_GAME' || action.type === 'RESET_GAME') {
            setGameSessionId(null);
        }
        originalDispatch(action);
    }, [originalDispatch]);

    const handleCloseSurvey = useCallback(() => {
        setIsSurveyOpen(false);
    }, []);

    const handlePlayAgain = useCallback(() => {
        setIsSurveyOpen(false);
        wrappedDispatch({ type: 'RESET_GAME' });
        wrappedDispatch({ type: 'START_GAME' });
    }, [wrappedDispatch]);

    const handleExitGame = useCallback(async () => {
        // Update game_sessions to mark that user exited via button
        if (gameSessionId) {
            try {
                await supabase
                    .from('game_sessions')
                    .update({ exited_via_button: true, end_time: new Date().toISOString(), score: state.score })
                    .eq('id', gameSessionId);
            } catch (e) {
                console.error('Error updating exited_via_button:', e);
            }
        }
        // Redirect after updating
        window.location.href = 'https://robot-record-web.hacknao.edu.vn/games';
    }, [gameSessionId, state.score]);

    return (
        <GameContext.Provider value={{ 
            state, 
            dispatch: wrappedDispatch,
            gameSessionId,
            isSurveyOpen,
            handleCloseSurvey,
            handlePlayAgain,
            handleExitGame,
            userId,
            age,
            gameId,
            urlParams
        }}>
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