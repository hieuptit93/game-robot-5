import { datadogRum } from '@datadog/browser-rum';

// Custom event tracking utilities for the voice bridge game
export const trackGameEvent = (eventName, properties = {}) => {
  try {
    if (datadogRum.getInitConfiguration()) {
      datadogRum.addAction(eventName, properties);
      console.log('📊 Datadog event tracked:', eventName, properties);
    } else {
      console.log('📊 Datadog not initialized, event not tracked:', eventName, properties);
    }
  } catch (error) {
    console.error('❌ Error tracking Datadog event:', eventName, error);
  }
};

export const trackUserInteraction = (action, element, properties = {}) => {
  if (datadogRum.getInitConfiguration()) {
    datadogRum.addAction(`user_${action}`, {
      element,
      ...properties
    });
  }
};

export const trackPronunciationScore = (score, word, attempts) => {
  trackGameEvent('pronunciation_scored', {
    score,
    word,
    attempts,
    timestamp: new Date().toISOString()
  });
};

export const trackGameProgress = (level, progress, timeSpent) => {
  trackGameEvent('game_progress', {
    level,
    progress,
    timeSpent,
    timestamp: new Date().toISOString()
  });
};

export const setUserContext = (userId, userProperties = {}) => {
  try {
    if (datadogRum.getInitConfiguration()) {
      const userData = {
        id: userId,
        ...userProperties
      };
      datadogRum.setUser(userData);
      console.log('👤 Datadog user context set:', userData);
    } else {
      console.log('👤 Datadog not initialized, user context not set:', { userId, ...userProperties });
    }
  } catch (error) {
    console.error('❌ Error setting Datadog user context:', error);
  }
};

export const addErrorContext = (error, context = {}) => {
  if (datadogRum.getInitConfiguration()) {
    datadogRum.addError(error, context);
  }
};