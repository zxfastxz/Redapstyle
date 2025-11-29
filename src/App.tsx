import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { PublicDashboard } from './components/PublicDashboard';
import { AdminDashboard } from './components/AdminDashboard';

type Screen = 'home' | 'public' | 'login' | 'admin';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Funções de navegação
  const navigateToHome = () => {
    setCurrentScreen('home');
    setIsAuthenticated(false);
  };

  const navigateToPublic = () => {
    setCurrentScreen('public');
  };

  const navigateToLogin = () => {
    setCurrentScreen('login');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('admin');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('home');
  };

  // Renderizar a tela apropriada
  switch (currentScreen) {
    case 'home':
      return (
        <HomePage 
          onNavigateToPublic={navigateToPublic}
          onNavigateToLogin={navigateToLogin}
        />
      );

    case 'public':
      return (
        <PublicDashboard 
          onBack={navigateToHome}
        />
      );

    case 'login':
      return (
        <LoginPage 
          onLogin={handleLogin}
          onBack={navigateToHome}
        />
      );

    case 'admin':
      if (!isAuthenticated) {
        setCurrentScreen('home');
        return null;
      }
      return (
        <AdminDashboard 
          onLogout={handleLogout}
        />
      );

    default:
      return (
        <HomePage 
          onNavigateToPublic={navigateToPublic}
          onNavigateToLogin={navigateToLogin}
        />
      );
  }
}
