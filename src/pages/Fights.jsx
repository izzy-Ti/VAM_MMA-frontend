import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../lib/api';

const Fights = () => {
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedFight, setSelectedFight] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [betLoading, setBetLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [expandedFight, setExpandedFight] = useState(null); // stores _id of expanded fight

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
        <div className="space-y-6">
          {fights.map(fight => {
            // Group options by category
            const groups = {};
            fight.bettingOptions.forEach(opt => {
              if (!groups[opt.category]) groups[opt.category] = [];
              groups[opt.category].push(opt);
            });

            return (
              <div key={fight._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl group">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-blue-400">{new Date(fight.date).toLocaleString()}</span>
                  <span className="text-gray-400">Total Pool: <span className="text-green-500">{fight.totalPool || 0} ETB</span></span>
                </div>

                <div className="relative h-44 bg-black overflow-hidden">
                  <div className="absolute left-0 bottom-0 w-[55%] h-[110%] transition-transform duration-500 group-hover:scale-105 origin-bottom-left">
                    {fight.fighter1Image && <img src={fight.fighter1Image} alt={fight.fighter1Name} className="h-full w-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />}
                  </div>
                  <div className="absolute right-0 bottom-0 w-[55%] h-[110%] transition-transform duration-500 group-hover:scale-105 origin-bottom-right">
                    {fight.fighter2Image && <img src={fight.fighter2Image} alt={fight.fighter2Name} className="h-full w-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <span className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-red-600 to-orange-400 drop-shadow-2xl">VS</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-black text-base uppercase tracking-tighter text-white truncate max-w-[45%]">{fight.fighter1Name}</p>
                    <p className="font-black text-base uppercase tracking-tighter text-white truncate max-w-[45%]">{fight.fighter2Name}</p>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => setExpandedFight(expandedFight === fight._id ? null : fight._id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 rounded-xl text-sm font-bold transition-colors"
                  >
                    {expandedFight === fight._id ? (
                      <><ChevronUp size={16} /> Hide Betting Options</>
                    ) : (
                      <><ChevronDown size={16} /> View Betting Options ({fight.bettingOptions.length})</>
                    )}
                  </button>

                  {/* Grouped Betting Options — only show when expanded */}
                  {expandedFight === fight._id && (
                    <div className="space-y-4 mt-4">
                    {Object.entries(groups).map(([category, options]) => (
                      <div key={category}>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2 px-1">{category}</p>
                        <div className="space-y-1.5">
                          {options.map(opt => (
                            <button
                              key={opt._id}
                              onClick={() => openBetModal(fight, opt)}
                              disabled={fight.status !== 'upcoming' || opt.status !== 'open'}
                              className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all
                                ${opt.status !== 'open'
                                  ? opt.status === 'won'
                                    ? 'bg-green-500/5 border-green-500/20 cursor-not-allowed'
                                    : 'bg-gray-800/30 border-gray-800 opacity-50 cursor-not-allowed'
                                  : 'bg-gray-800 hover:bg-blue-900/20 border-gray-700 hover:border-blue-500/50 group'
                                }`}
                            >
                              <span className={`font-bold text-xs uppercase tracking-wider ${opt.status !== 'open' ? 'text-gray-500' : 'group-hover:text-blue-400 text-gray-200'}`}>
                                {opt.option}
                                {opt.status === 'won' && <span className="ml-2 text-green-400 normal-case">✓ Won</span>}
                                {opt.status === 'lost' && <span className="ml-2 text-red-400 normal-case">✗ Lost</span>}
                              </span>
                              {opt.status === 'open' && (
                                <div className="flex flex-col items-end shrink-0 ml-2">
                                  <span className="text-sm font-black text-white">{opt.dynamicOdds ? `${opt.dynamicOdds}x` : '—'}</span>
                                  <span className="text-[10px] font-bold" style={{ color: opt.totalBet > 0 ? '#22c55e' : '#6b7280' }}>
                                    {opt.totalBet > 0 ? `${opt.totalBet} ETB` : 'est.'}
                                  </span>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">{selectedFight.fighter1Name} vs {selectedFight.fighter2Name}</p>
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
