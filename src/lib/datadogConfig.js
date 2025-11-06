import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';

export const initializeDatadog = () => {

  datadogRum.init({
    applicationId: '26105bcb-d321-4a99-a893-c10ef09fce5c',
    clientToken: 'pub8098a6c3f1a95a9a3e1a981491451191',
    site: 'us5.datadoghq.com',
    service: 'voice-bridge-game',
    env: 'prod',
    // Specify a version number to identify the deployed version of your application in Datadog
    version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    defaultPrivacyLevel: 'mask-user-input',
    plugins: [reactPlugin({ router: false })],
  });

  console.log('Datadog RUM initialized successfully');
};