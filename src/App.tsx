/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Family } from './pages/Family';
import { Agenda } from './pages/Agenda';
import { Tasks } from './pages/Tasks';
import { Shopping } from './pages/Shopping';
import { Finance } from './pages/Finance';
import { Meals } from './pages/Meals';
import { Recipes } from './pages/Recipes';
import { Documents } from './pages/Documents';
import { HomeMaintenance } from './pages/HomeMaintenance';
import { Contacts } from './pages/Contacts';
import { Board } from './pages/Board';
import { Memories } from './pages/Memories';
import { Integrations } from './pages/Integrations';
import { Toaster } from './components/ui/sonner';
import { useAuthStore } from './store/useAuthStore';
import { AuthForm } from './components/auth/AuthForm';

export default function App() {
  const { session, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <AuthForm />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/tarefas" element={<Tasks />} />
            <Route path="/compras" element={<Shopping />} />
            <Route path="/mural" element={<Board />} />
            <Route path="/memorias" element={<Memories />} />
            <Route path="/financeiro" element={<Finance />} />
            <Route path="/refeicoes" element={<Meals />} />
            <Route path="/receitas" element={<Recipes />} />
            <Route path="/documentos" element={<Documents />} />
            <Route path="/casa" element={<HomeMaintenance />} />
            <Route path="/contatos" element={<Contacts />} />
            <Route path="/familia" element={<Family />} />
            <Route path="/configuracoes/integracoes" element={<Integrations />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}
