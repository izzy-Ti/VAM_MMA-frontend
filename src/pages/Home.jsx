import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../lib/api';

const Home = () => {
  const [user, setUser] = useState(null);
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real telegram mini app we would get the auth token via initData.
    // For now we'll mock or just attempt to fetch
    const fetchDashboard = async () => {
      try {
        // Assume user is already logged in for now, or just show a default UI
        // const userRes = await api.get('/auth/me');
        // setUser(userRes.data);
        setUser({ balance: 1500, username: 'Babi' }); // Mocking user for UI display

        const fightsRes = await api.get('/fights');
        setFights(fightsRes.data.slice(0, 3)); // Top 3 fights
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-900 to-gray-900 rounded-2xl p-6 shadow-lg border border-blue-800/30">
        <h2 className="text-sm text-blue-200 font-medium mb-1">Total Balance</h2>
        <div className="flex items-end gap-2 mb-4">
          <span className="text-4xl font-black text-white">{user?.balance || 0}</span>
          <span className="text-blue-300 font-bold mb-1">ETB</span>
        </div>
        <div className="flex gap-3 mt-6">
          <Link to="/deposit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-center py-3 rounded-xl font-bold transition-colors">
            Deposit
          </Link>
          <Link to="/fights" className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-center py-3 rounded-xl font-bold transition-colors">
            Bet Now
          </Link>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={20} />
            Hot Fights
          </h3>
          <Link to="/fights" className="text-sm text-blue-400 font-medium flex items-center">
            See all <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
        ) : fights.length > 0 ? (
          <div className="space-y-4">
            {fights.map(fight => (
              <div key={fight._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-md">
                <div className="flex justify-between items-center mb-3 text-sm text-gray-400">
                  <span className="font-semibold text-blue-400 text-xs uppercase tracking-wider">{new Date(fight.date).toLocaleDateString()}</span>
                  <span className="bg-gray-800 px-2 py-1 rounded text-xs">Pool: {fight.totalPool || 0} ETB</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center w-2/5">
                    <p className="font-bold text-lg truncate">{fight.fighter1?.name || 'Fighter 1'}</p>
                  </div>
                  <div className="text-center w-1/5">
                    <span className="text-red-500 font-black italic text-xl">VS</span>
                  </div>
                  <div className="text-center w-2/5">
                    <p className="font-bold text-lg truncate">{fight.fighter2?.name || 'Fighter 2'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center flex flex-col items-center">
            <AlertCircle className="text-gray-600 mb-2" size={32} />
            <p className="text-gray-400 font-medium">No upcoming fights found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
