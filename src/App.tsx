/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Connect from './pages/Connect';
import AppDashboard from './pages/AppDashboard';
import Chat from './pages/Chat';
import Apps from './pages/Apps';
import BottomNav from './components/vpn/BottomNav';
import FirestoreHealthCheck from './components/vpn/FirestoreHealthCheck';
import { getStoredUser, setStoredUser } from './lib/vpnAuth';
import { Capacitor } from '@capacitor/core';

const queryClient = new QueryClient();

function generateRandomNodeId() {
  return 'node_' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function MainLayout({ children, isApp }: { children: React.ReactNode, isApp: boolean }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#030712] text-[#e2e2e9]">
      <main className="flex-1 overflow-y-auto pb-[100px]">{children}</main>
      {!isApp && <BottomNav />}
    </div>
  );
}

export default function App() {
  const [isInit, setIsInit] = useState(false);
  const [simulatedNative, setSimulatedNative] = useState(localStorage.getItem('simulatedNative') === 'true');
  const isApp = Capacitor.isNativePlatform() || simulatedNative;

  useEffect(() => {
    localStorage.setItem('simulatedNative', simulatedNative.toString());
  }, [simulatedNative]);

  useEffect(() => {
    // Auto-initialize a local user profile if one doesn't exist
    const ensureUser = async () => {
      let user = getStoredUser();
      if (!user) {
        user = {
          username: generateRandomNodeId(),
          mode: 'none',
          status: 'disconnected',
        };
        setStoredUser(user);
        
        // Ensure user doc exists in firestore
        try {
          const { db } = await import('./lib/firebase');
          const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
          await setDoc(doc(db, 'users', user.username), {
            username: user.username,
            mode: 'none',
            status: 'disconnected',
            is_active: true,
            createdAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.error("Auto setup failed:", err);
        }
      }
      setIsInit(true);
    };
    ensureUser();
  }, []);

  if (!isInit) return <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">Initializing Identity...</div>;

  const homeElement = isApp ? <AppDashboard /> : <MainLayout isApp={isApp}><Connect /></MainLayout>;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[#030712] text-[#e2e2e9] selection:bg-[#004a77]">
        <FirestoreHealthCheck />
        <Router>
          <Routes>
            <Route path="/" element={homeElement} />
            <Route path="/connect" element={<Navigate to="/" replace />} />
            {!isApp && <Route path="/chat" element={<MainLayout isApp={isApp}><Chat /></MainLayout>} />}
            {!isApp && <Route path="/apps" element={<MainLayout isApp={isApp}><Apps /></MainLayout>} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-center" theme="dark" richColors />
      </div>
    </QueryClientProvider>
  );
}
