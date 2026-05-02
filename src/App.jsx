import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Fights from './pages/Fights';
import Deposit from './pages/Deposit';
import Profile from './pages/Profile';
import api from './lib/api';

function App() {
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      const initData = tg.initData;
      
      if (initData) {
        api.post('/auth/login', { initData })
          .then(res => {
            localStorage.setItem('vamos_token', res.data.token);
            setAuthReady(true);
          })
          .catch(err => {
            console.error('Auth error:', err);
            setAuthError(err.response?.data?.message || err.message || 'Unknown auth error');
            setAuthReady(true);
          });
      } else {
        setAuthError('No initData found. Please open inside Telegram.');
        setAuthReady(true);
      }
    } else {
      setAuthError('Telegram WebApp not found.');
      setAuthReady(true);
    }
  }, []);

  if (!authReady) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-500"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <BrowserRouter>
      {authError && (
        <div className="bg-red-500 text-white p-2 text-xs text-center z-50 relative">
          Debug Error: {authError}
        </div>
      )}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="fights" element={<Fights />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
