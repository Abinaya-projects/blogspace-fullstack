import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { PostDetailPage } from './pages/PostDetailPage';
import { CreateEditPostPage } from './pages/CreateEditPostPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';

type TabType =
  | 'home'
  | 'explore'
  | 'create-post'
  | 'edit-post'
  | 'post-detail'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'profile';

export function AppContent() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [param, setParam] = useState<string | undefined>(undefined);

  // Sync with window hash for simple reliable routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) {
        setCurrentTab('home');
        setParam(undefined);
        return;
      }

      const [route, routeParam] = hash.split('/');
      if (
        [
          'home',
          'explore',
          'create-post',
          'edit-post',
          'post-detail',
          'login',
          'register',
          'dashboard',
          'profile',
        ].includes(route)
      ) {
        setCurrentTab(route as TabType);
        setParam(routeParam);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (tab: string, routeParam?: string) => {
    setCurrentTab(tab as TabType);
    setParam(routeParam);
    if (routeParam) {
      window.location.hash = `${tab}/${routeParam}`;
    } else {
      window.location.hash = tab === 'home' ? '' : tab;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar currentTab={currentTab} onNavigate={navigateTo} />

      <main className="flex-1">
        {currentTab === 'home' && <HomePage onNavigate={navigateTo} />}

        {currentTab === 'explore' && (
          <ExplorePage initialFilter={param} onNavigate={navigateTo} />
        )}

        {currentTab === 'post-detail' && param && (
          <PostDetailPage postId={param} onNavigate={navigateTo} />
        )}

        {currentTab === 'create-post' && (
          <CreateEditPostPage onNavigate={navigateTo} />
        )}

        {currentTab === 'edit-post' && param && (
          <CreateEditPostPage editPostId={param} onNavigate={navigateTo} />
        )}

        {currentTab === 'login' && <LoginPage onNavigate={navigateTo} />}

        {currentTab === 'register' && <RegisterPage onNavigate={navigateTo} />}

        {currentTab === 'dashboard' && <DashboardPage onNavigate={navigateTo} />}

        {currentTab === 'profile' && (
          <ProfilePage userId={param} onNavigate={navigateTo} />
        )}
      </main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
