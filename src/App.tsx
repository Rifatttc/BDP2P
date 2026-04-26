/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Connect from './pages/Connect';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import BottomNav from './components/vpn/BottomNav';
import FirestoreHealthCheck from './components/vpn/FirestoreHealthCheck';
import { getStoredUser, setStoredUser } from './lib/vpnAuth';

const queryClient = new QueryClient();

function generateRandomNodeId() {
  return 'node_' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function App() {
  const [isInit, setIsInit] = useState(false);

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
          const { setDoc, doc } = await import('firebase/firestore');
          await setDoc(doc(db, 'users', user.username), {
            username: user.username,
            mode: 'none',
            status: 'disconnected',
            is_active: true,
            createdAt: new Date().toISOString()
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

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] animated-bg selection:bg-primary/30">
        <FirestoreHealthCheck />
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout><Connect /></MainLayout>} />
            <Route path="/connect" element={<Navigate to="/" replace />} />
            <Route path="/chat" element={<MainLayout><Chat /></MainLayout>} />
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-center" theme="dark" richColors />
      </div>
    </QueryClientProvider>
  );
}
