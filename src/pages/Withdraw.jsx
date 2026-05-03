import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Phone, ArrowUpRight } from 'lucide-react';
import api from '../lib/api';

const Withdraw = () => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('TeleBirr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const methods = [
    { id: 'TeleBirr', name: 'TeleBirr', iconSrc: '/telebirr.jpg', color: 'border-green-500' },
    { id: 'CBE', name: 'CBE', iconSrc: '/CBE.ico', color: 'border-purple-500' },
    { id: 'CBE_birr', name: 'CBE Birr', iconSrc: '/cbe_birr.png', color: 'border-yellow-500' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(amount) < 50) {
      setStatus({ type: 'error', msg: 'Minimum withdrawal is 50 ETB' });
      return;
    }
    if (!phoneNumber.trim()) {
      setStatus({ type: 'error', msg: 'Please enter your account or phone number' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      await api.post('/transactions/withdraw', {
        amount: Number(amount),
        method,
        phoneNumber,
      });
      setStatus({ type: 'success', msg: 'Withdrawal request submitted successfully. Funds have been deducted from your balance and are pending admin transfer.' });
      setAmount('');
      setPhoneNumber('');
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to submit withdrawal request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <ArrowUpRight className="text-blue-500" />
          Withdraw Funds
        </h2>
        <p className="text-gray-400 text-sm">Request a withdrawal to your bank or mobile money account.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">Select Receiving Method</label>
          <div className="grid grid-cols-3 gap-2">
            {methods.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  method === m.id 
                  ? `bg-gray-800/80 ${m.color} ring-1 ring-blue-500` 
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                }`}
              >
                <img src={m.iconSrc} alt={m.name} className="w-10 h-10 object-contain mb-2 rounded" />
                <span className="text-xs font-bold text-center leading-tight">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {status.msg && (
          <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${
            status.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
          }`}>
            {status.type === 'error' ? <AlertCircle size={20} className="shrink-0" /> : <CheckCircle2 size={20} className="shrink-0" />}
            <p>{status.msg}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Withdrawal Amount (Min 50 ETB)</label>
          <div className="relative">
            <input
              type="number"
              min="50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
              placeholder="0"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">ETB</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Account / Phone Number</label>
          <div className="relative">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 pl-10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              placeholder={`Enter your ${methods.find(m => m.id === method)?.name} account number`}
              required
            />
            <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Submitting...' : 'Request Withdrawal'}
        </button>
      </form>
    </div>
  );
};

export default Withdraw;
