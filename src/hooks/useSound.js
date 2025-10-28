import { useRef, useCallback } from 'react';

// Web Audio API based sound generator
const useSound = () => {
  const audioContextRef = useRef(null);

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Generate beep sound
  const playBeep = useCallback((frequency = 440, duration = 200, type = 'sine') => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, [getAudioContext]);

  // Countdown beep (3-2-1)
  const playCountdown = useCallback((count) => {
    if (count === 1) {
      // Final countdown - higher pitch
      playBeep(800, 300, 'square');
    } else {
      // Regular countdown
      playBeep(600, 200, 'sine');
    }
  }, [playBeep]);

  // Success sound (good pronunciation)
  const playSuccess = useCallback(() => {
    // Happy ascending notes
    setTimeout(() => playBeep(523, 150, 'sine'), 0);   // C5
    setTimeout(() => playBeep(659, 150, 'sine'), 150); // E5
    setTimeout(() => playBeep(784, 200, 'sine'), 300); // G5
  }, [playBeep]);

  // Warning sound (medium pronunciation)
  const playWarning = useCallback(() => {
    // Neutral double beep
    playBeep(440, 150, 'triangle');
    setTimeout(() => playBeep(440, 150, 'triangle'), 200);
  }, [playBeep]);

  // Error sound (bad pronunciation)
  const playError = useCallback(() => {
    // Descending sad notes
    setTimeout(() => playBeep(400, 200, 'sawtooth'), 0);
    setTimeout(() => playBeep(300, 200, 'sawtooth'), 150);
    setTimeout(() => playBeep(200, 300, 'sawtooth'), 300);
  }, [playBeep]);

  // Victory sound
  const playVictory = useCallback(() => {
    // Victory fanfare
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((note, index) => {
      setTimeout(() => playBeep(note, 300, 'sine'), index * 150);
    });
  }, [playBeep]);

  // Game over sound
  const playGameOver = useCallback(() => {
    // Dramatic descending sequence
    const notes = [440, 370, 311, 262]; // A4, F#4, D#4, C4
    notes.forEach((note, index) => {
      setTimeout(() => playBeep(note, 400, 'sawtooth'), index * 200);
    });
  }, [playBeep]);

  // Start recording sound
  const playStartRecording = useCallback(() => {
    playBeep(880, 100, 'sine'); // Quick high beep
  }, [playBeep]);

  // Stop recording sound
  const playStopRecording = useCallback(() => {
    playBeep(440, 150, 'sine'); // Lower beep
  }, [playBeep]);

  // Processing sound (analyzing pronunciation)
  const playProcessing = useCallback(() => {
    // Gentle processing sound
    playBeep(330, 100, 'triangle');
    setTimeout(() => playBeep(370, 100, 'triangle'), 150);
    setTimeout(() => playBeep(330, 100, 'triangle'), 300);
  }, [playBeep]);

  // Plank placement sound
  const playPlankPlace = useCallback((status) => {
    switch (status) {
      case 'SOLID':
        playBeep(523, 200, 'sine'); // Solid thunk
        break;
      case 'CRACKED':
        playBeep(392, 250, 'triangle'); // Creaky sound
        break;
      case 'BROKEN':
        playBeep(220, 300, 'sawtooth'); // Breaking sound
        break;
      default:
        playBeep(440, 150, 'sine');
    }
  }, [playBeep]);

  return {
    playCountdown,
    playSuccess,
    playWarning,
    playError,
    playVictory,
    playGameOver,
    playStartRecording,
    playStopRecording,
    playProcessing,
    playPlankPlace,
    playBeep
  };
};

export default useSound;