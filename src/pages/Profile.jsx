import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Wallet, History, AlertCircle } from 'lucide-react';
import api from '../lib/api';

const Profile = () => {
  const [user, setUser] = useState({ balance: 0, username: 'Loading...' });
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBets();
  }, []);

  const fetchMyBets = async () => {
    try {
      try {
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
      } catch (authErr) {
        console.warn('Could not fetch user', authErr);
        setUser({ balance: 0, username: 'Guest' });
      }

      const res = await api.get('/bets/my-bets');
      setBets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <UserCircle size={40} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Wallet size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-gray-300">{user.balance} ETB</span>
            </div>
          </div>
        </div>
        <Link 
          to="/withdraw"
          className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold py-2 px-4 rounded-xl border border-gray-700 transition-colors"
        >
          Withdraw
        </Link>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <History className="text-blue-500" size={20} />
          Betting History
        </h3>

        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
        ) : bets.length > 0 ? (
          <div className="space-y-3">
            {bets.map(bet => (
              <div key={bet._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-white mb-1">Fight: {bet.fightId?.fighter1Name} vs {bet.fightId?.fighter2Name}</p>
                  <p className="text-xs text-blue-400 font-bold mb-1">{bet.fightId?.bettingOptions?.find(opt => opt._id === bet.optionId)?.option || 'Unknown Option'}</p>
                  <p className="text-xs text-gray-400">Amount: <span className="font-bold text-white">{bet.amount} ETB</span></p>
                  {bet.status === 'pending' && bet.potentialPayout > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">Est. Prize: <span className="font-bold text-green-400">{bet.potentialPayout.toFixed(2)} ETB</span></p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    bet.status === 'won' ? 'bg-green-500/20 text-green-400' :
                    bet.status === 'lost' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {bet.status}
                  </span>
                  {bet.status === 'won' && (
                    <p className="text-xs text-green-400 mt-1 font-bold">+{bet.potentialPayout.toFixed(2)} ETB</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center flex flex-col items-center">
            <AlertCircle className="text-gray-600 mb-2" size={32} />
            <p className="text-gray-400 font-medium text-sm">No bets placed yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
