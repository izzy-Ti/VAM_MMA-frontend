import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../lib/api';

const Home = () => {
  const [user, setUser] = useState(null);
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        try {
          const userRes = await api.get('/auth/me');
          setUser(userRes.data);
        } catch (authErr) {
          console.warn('Could not fetch user, using fallback', authErr);
          // Fallback if not logged in
          setUser({ balance: 0, username: 'Guest' });
        }

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
          <div className="space-y-6">
            {fights.map(fight => (
              <div key={fight._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl hover:border-blue-900/50 transition-all group">
                <div className="relative h-48 bg-gradient-to-t from-gray-900 to-transparent overflow-hidden">
                  {/* Fighter 1 Image */}
                  <div className="absolute left-0 bottom-0 w-[55%] h-[110%] transition-transform duration-500 group-hover:scale-105 origin-bottom-left">
                    {fight.fighter1Image && (
                      <img src={fight.fighter1Image} alt={fight.fighter1Name} className="h-full w-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
                    )}
                  </div>
                  {/* Fighter 2 Image */}
                  <div className="absolute right-0 bottom-0 w-[55%] h-[110%] transition-transform duration-500 group-hover:scale-105 origin-bottom-right">
                    {fight.fighter2Image && (
                      <img src={fight.fighter2Image} alt={fight.fighter2Name} className="h-full w-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
                    )}
                  </div>
                  {/* VS Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <span className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-red-600 via-red-500 to-orange-400 drop-shadow-2xl">VS</span>
                  </div>
                </div>
                
                <div className="p-4 pt-2">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-left">
                      <p className="font-black text-lg uppercase tracking-tighter text-white">{fight.fighter1Name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg uppercase tracking-tighter text-white">{fight.fighter2Name}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest border-t border-gray-800 pt-3">
                    <span className="text-blue-400">{new Date(fight.date).toLocaleDateString()}</span>
                    <span>Pool: <span className="text-green-500">{fight.totalPool || 0} ETB</span></span>
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
