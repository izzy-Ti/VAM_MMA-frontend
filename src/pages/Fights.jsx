import React, { useState, useEffect } from 'react';
import { Swords, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

const Fights = () => {
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedFight, setSelectedFight] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [betLoading, setBetLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchFights();
  }, []);

  const fetchFights = async () => {
    try {
      const res = await api.get('/fights');
      setFights(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openBetModal = (fight, option) => {
    setSelectedFight(fight);
    setSelectedOption(option);
    setBetAmount('');
    setStatus({ type: '', msg: '' });
  };

  const handlePlaceBet = async (e) => {
    e.preventDefault();
    if (Number(betAmount) < 50) {
      setStatus({ type: 'error', msg: 'Minimum bet is 50 ETB' });
      return;
    }

    setBetLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      await api.post('/bets', {
        fightId: selectedFight._id,
        optionId: selectedOption._id,
        amount: Number(betAmount)
      });
      setStatus({ type: 'success', msg: 'Bet placed successfully!' });
      setTimeout(() => {
        setSelectedFight(null);
        setSelectedOption(null);
        fetchFights(); // Refresh odds
      }, 2000);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to place bet' });
    } finally {
      setBetLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upcoming Fights</h2>
        <p className="text-gray-400 text-sm">Bet on your favorites. Odds change dynamically based on the pool.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
      ) : fights.length > 0 ? (
        <div className="space-y-4">
          {fights.map(fight => (
            <div key={fight._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">{fight.name}</span>
                  <span className="text-[10px] text-gray-400">{new Date(fight.date).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase block">Total Pool</span>
                  <span className="text-sm font-bold text-green-400">{fight.totalPool || 0} ETB</span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center w-[45%]">
                    <p className="font-bold text-lg leading-tight">{fight.fighter1?.name || 'Fighter 1'}</p>
                    <p className="text-xs text-gray-400 mt-1">{fight.fighter1?.stats?.record || '0-0-0'}</p>
                  </div>
                  <div className="flex justify-center w-[10%]">
                    <Swords className="text-red-500" size={24} />
                  </div>
                  <div className="text-center w-[45%]">
                    <p className="font-bold text-lg leading-tight">{fight.fighter2?.name || 'Fighter 2'}</p>
                    <p className="text-xs text-gray-400 mt-1">{fight.fighter2?.stats?.record || '0-0-0'}</p>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider text-center mb-2">Betting Options</p>
                  {fight.bettingOptions.map(opt => (
                    <button
                      key={opt._id}
                      onClick={() => openBetModal(fight, opt)}
                      disabled={fight.status !== 'upcoming'}
                      className="w-full flex justify-between items-center bg-gray-800 hover:bg-gray-750 p-3 rounded-xl border border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <span className="font-semibold text-sm group-hover:text-blue-400 transition-colors">{opt.option}</span>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-white">{opt.dynamicOdds > 0 ? `${opt.dynamicOdds}x` : '0.00x'}</span>
                        <span className="text-[10px] text-gray-500">Pool: {opt.totalBet || 0}</span>
                      </div>
                    </button>
                  ))}
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

      {/* Bet Modal */}
      {selectedOption && selectedFight && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-end sm:items-center">
          <div className="bg-gray-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-gray-800 p-6 animate-[slideUp_0.2s_ease-out]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold">Place Bet</h3>
                <p className="text-sm text-gray-400 mt-1">{selectedFight.name}</p>
              </div>
              <button onClick={() => setSelectedOption(null)} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Selection</span>
                <span className="font-bold text-white">{selectedOption.option}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Est. Odds</span>
                <span className="font-black text-blue-400">{selectedOption.dynamicOdds > 0 ? `${selectedOption.dynamicOdds}x` : 'N/A'}</span>
              </div>
            </div>

            <form onSubmit={handlePlaceBet} className="space-y-4">
              {status.msg && (
                <div className={`p-3 rounded-xl flex items-start gap-2 text-sm font-medium ${
                  status.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                }`}>
                  {status.type === 'error' ? <AlertCircle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
                  <p>{status.msg}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Amount (Min 50 ETB)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 font-bold text-lg"
                    placeholder="50"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">ETB</span>
                </div>
                {betAmount && selectedOption.dynamicOdds > 0 && (
                  <p className="text-xs text-green-400 mt-2 font-medium">
                    Est. Payout: {(Number(betAmount) * selectedOption.dynamicOdds).toFixed(2)} ETB
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={betLoading || !betAmount || Number(betAmount) < 50}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {betLoading ? 'Processing...' : 'Confirm Bet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fights;
