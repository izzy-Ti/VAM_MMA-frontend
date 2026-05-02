import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Swords, Wallet, UserCircle } from 'lucide-react';

const Layout = () => {
  const isAdmin = localStorage.getItem('vamos_user_role') === 'admin';

  return (
    <div className="max-w-md mx-auto w-full min-h-screen bg-gray-950 text-white relative shadow-2xl flex flex-col font-sans">
      <header className="py-4 px-6 bg-gray-900 border-b border-gray-800 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
          VAMOS MMA
        </h1>
        <div className="flex gap-2 items-center">
          {isAdmin && (
            <NavLink to="/admin" className="px-3 py-1 bg-red-600 rounded text-white text-xs font-bold tracking-wider hover:bg-red-700 transition-colors">
              ADMIN
            </NavLink>
          )}
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shadow-lg">
            VM
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto pb-24 p-4">
        <Outlet />
      </main>

      <nav className="absolute bottom-0 w-full max-w-md bg-gray-900 border-t border-gray-800 py-3 px-6 flex justify-between items-center rounded-t-xl z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
          <Home size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
        </NavLink>
        <NavLink to="/fights" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
          <Swords size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Fights</span>
        </NavLink>
        <NavLink to="/deposit" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
          <Wallet size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Deposit</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
          <UserCircle size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Layout;
