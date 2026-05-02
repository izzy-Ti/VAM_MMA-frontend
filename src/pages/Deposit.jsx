import React, { useState } from 'react';
import { Copy, CheckCircle2, AlertCircle, Building2, Phone } from 'lucide-react';
import api from '../lib/api';

const Deposit = () => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('TeleBirr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsConfirmation, setSmsConfirmation] = useState('');
  const [copied, setCopied] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const methods = [
    { id: 'TeleBirr', name: 'TeleBirr', account: '0992013392', icon: Phone, color: 'text-green-500' },
    { id: 'CBE', name: 'CBE', account: '1000596935234', icon: Building2, color: 'text-purple-500' },
    { id: 'CBE_birr', name: 'CBE Birr', account: '0992013392', icon: Phone, color: 'text-yellow-500' },
  ];

  const activeMethod = methods.find(m => m.id === method);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(amount) < 50) {
      setStatus({ type: 'error', msg: 'Minimum deposit is 50 ETB' });
      return;
    }
    if (!smsConfirmation.trim()) {
      setStatus({ type: 'error', msg: 'Please paste the SMS confirmation' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      await api.post('/transactions/deposit', {
        amount: Number(amount),
        method,
        phoneNumber,
        smsConfirmation
      });
      setStatus({ type: 'success', msg: 'Deposit request submitted successfully. Waiting for admin approval.' });
      setAmount('');
      setPhoneNumber('');
      setSmsConfirmation('');
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to submit deposit' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Deposit Funds</h2>
        <p className="text-gray-400 text-sm">Transfer money manually and submit the confirmation.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">Select Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {methods.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  method === m.id 
                  ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500' 
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                }`}
              >
                <m.icon className={`${m.color} mb-2`} size={24} />
                <span className="text-xs font-bold text-center leading-tight">{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">Transfer exactly to this account:</p>
          <div className="flex justify-between items-center mt-2">
            <div>
              <span className="text-2xl font-black tracking-widest text-white">{activeMethod.account}</span>
              <p className="text-xs text-blue-400 font-medium mt-1">{activeMethod.name} Account</p>
            </div>
            <button 
              onClick={() => handleCopy(activeMethod.account)}
              className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl transition-colors"
            >
              {copied === activeMethod.account ? <CheckCircle2 className="text-green-500" size={24} /> : <Copy className="text-gray-300" size={24} />}
            </button>
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
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Deposit Amount (Min 50 ETB)</label>
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
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Your Phone Number (Optional)</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="09..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">SMS Confirmation Message</label>
          <textarea
            value={smsConfirmation}
            onChange={(e) => setSmsConfirmation(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-sm"
            placeholder="Paste the full SMS message you received from your bank/wallet here..."
            required
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Submitting...' : 'Confirm Deposit'}
        </button>
      </form>
    </div>
  );
};

export default Deposit;
