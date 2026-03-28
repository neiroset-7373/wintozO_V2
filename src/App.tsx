import React, { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import SplashScreen from './components/UI-wintozo/SplashScreen';
import DeviceSelect from './components/UI-wintozo/DeviceSelect';
import Onboarding from './components/UI-wintozo/Onboarding';
import AuthScreen from './components/UI-wintozo/AuthScreen';
import MessengerLayout from './components/UI-wintozo/MessengerLayout';
import { themes } from './data/themes';

type AppScreen = 'splash' | 'device' | 'onboarding' | 'auth' | 'messenger';

function App() {
  const {
    theme,
    isAuthenticated,
    deviceType,
    hasSeenOnboarding,
  } = useAppStore();

  const [currentScreen, setCurrentScreen] = React.useState<AppScreen>('splash');

  const currentTheme = themes[theme];

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', currentTheme.bg);
    root.style.setProperty('--sidebar', currentTheme.sidebar);
    root.style.setProperty('--chat', currentTheme.chat);
    root.style.setProperty('--accent', currentTheme.accent);
    root.style.setProperty('--accent-gradient', currentTheme.accentGradient);
    root.style.setProperty('--text', currentTheme.text);
    root.style.setProperty('--text-secondary', currentTheme.textSecondary);
    root.style.setProperty('--bubble', currentTheme.bubble);
    root.style.setProperty('--bubble-own', currentTheme.bubbleOwn);
    root.style.setProperty('--bubble-own-text', currentTheme.bubbleOwnText);
    root.style.setProperty('--bubble-text', currentTheme.bubbleText);
    root.style.setProperty('--input-bg', currentTheme.inputBg);
    root.style.setProperty('--border', currentTheme.border);
    root.style.setProperty('--hover', currentTheme.hover);
  }, [currentTheme]);

  // Screen navigation logic
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        if (!deviceType) {
          setCurrentScreen('device');
        } else if (!hasSeenOnboarding) {
          setCurrentScreen('onboarding');
        } else if (!isAuthenticated) {
          setCurrentScreen('auth');
        } else {
          setCurrentScreen('messenger');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, deviceType, hasSeenOnboarding, isAuthenticated]);

  // Watch for auth changes
  useEffect(() => {
    if (currentScreen === 'auth' && isAuthenticated) {
      setCurrentScreen('messenger');
    }
  }, [isAuthenticated, currentScreen]);

  const handleDeviceSelect = () => {
    if (!hasSeenOnboarding) {
      setCurrentScreen('onboarding');
    } else if (!isAuthenticated) {
      setCurrentScreen('auth');
    } else {
      setCurrentScreen('messenger');
    }
  };

  const handleOnboardingComplete = () => {
    if (!isAuthenticated) {
      setCurrentScreen('auth');
    } else {
      setCurrentScreen('messenger');
    }
  };

  // Render screens
  switch (currentScreen) {
    case 'splash':
      return <SplashScreen />;
    case 'device':
      return <DeviceSelect onComplete={handleDeviceSelect} />;
    case 'onboarding':
      return <Onboarding onComplete={handleOnboardingComplete} />;
    case 'auth':
      return <AuthScreen />;
    case 'messenger':
      return <MessengerLayout />;
    default:
      return <SplashScreen />;
  }
}

export default App;
