import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Check, X, MessageSquare, Phone, Calendar, CreditCard } from 'lucide-react';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [actionType, setActionType] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'declined'

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (tx, type) => {
    setSelectedTx(tx);
    setActionType(type);
    setMessage('');
    setModalOpen(true);
  };

  const handleAction = async () => {
    if (!selectedTx) return;
    try {
      await api.post(`/transactions/${selectedTx._id}/${actionType}`, { message });
      setModalOpen(false);
      fetchTransactions();
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.status === filter);

  const statusStyle = {
    approved: 'bg-green-500/10 text-green-500 border-green-500/20',
    declined: 'bg-red-500/10 text-red-500 border-red-500/20',
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  const counts = {
    all: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    approved: transactions.filter(t => t.status === 'approved').length,
    declined: transactions.filter(t => t.status === 'declined').length,
  };

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Manage Transactions</h2>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'approved', 'declined'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors border ${
              filter === f
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600'
            }`}
          >
            {f} <span className="ml-1 opacity-60">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Transaction Cards */}
      <div className="space-y-4">
        {filtered.map(tx => (
          <div key={tx._id} className={`bg-gray-900 border rounded-xl p-5 transition-all ${
            tx.status === 'pending' ? 'border-yellow-500/30' : 'border-gray-800'
          }`}>
            {/* Top Row: User + Status */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-white text-lg">{tx.userId?.firstName || 'Unknown'}</p>
                <p className="text-xs text-gray-500">@{tx.userId?.username || 'no-username'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle[tx.status] || statusStyle.pending}`}>
                {tx.status?.toUpperCase()}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Amount</p>
                <p className="text-blue-400 font-black text-xl">{tx.amount} <span className="text-sm font-medium">ETB</span></p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Method</p>
                <p className="text-white font-bold uppercase flex items-center gap-1.5"><CreditCard size={14} className="text-gray-400" />{tx.method}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Phone</p>
                <p className="text-white text-sm font-medium flex items-center gap-1.5"><Phone size={12} className="text-gray-400" />{tx.phoneNumber || '—'}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Date</p>
                <p className="text-white text-sm font-medium flex items-center gap-1.5"><Calendar size={12} className="text-gray-400" />{new Date(tx.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* SMS Confirmation */}
            {tx.smsConfirmation && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 mb-4">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MessageSquare size={11} /> SMS Confirmation
                </p>
                <p className="text-white text-sm break-all">{tx.smsConfirmation}</p>
              </div>
            )}

            {/* Action Buttons — only for pending */}
            {tx.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => openModal(tx, 'approve')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors"
                >
                  <Check size={18} /> Approve
                </button>
                <button
                  onClick={() => openModal(tx, 'decline')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                >
                  <X size={18} /> Decline
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center text-gray-500">
            No {filter === 'all' ? '' : filter} transactions found.
          </div>
        )}
      </div>

      {/* Action Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-2 flex items-center">
              {actionType === 'approve'
                ? <Check className="text-green-500 mr-2" />
                : <X className="text-red-500 mr-2" />}
              {actionType === 'approve' ? 'Approve' : 'Decline'} Transaction
            </h3>

            {/* Transaction summary */}
            <div className="bg-gray-800 rounded-lg p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">User</span>
                <span className="text-white font-bold">{selectedTx?.userId?.firstName} (@{selectedTx?.userId?.username})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount</span>
                <span className="text-blue-400 font-black">{selectedTx?.amount} ETB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Method</span>
                <span className="text-white uppercase font-medium">{selectedTx?.method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Phone</span>
                <span className="text-white">{selectedTx?.phoneNumber}</span>
              </div>
              {selectedTx?.smsConfirmation && (
                <div className="pt-2 border-t border-gray-700">
                  <p className="text-gray-400 text-xs mb-1">SMS Confirmation</p>
                  <p className="text-white text-sm break-all">{selectedTx?.smsConfirmation}</p>
                </div>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                <MessageSquare size={14} className="mr-2" /> Custom Message to User (Optional)
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Leave blank to send default notification..."
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors min-h-[90px] text-sm"
              />
            </div>

            <div className="flex space-x-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">Cancel</button>
              <button
                onClick={handleAction}
                className={`flex-1 py-3 text-white rounded-lg font-bold transition-colors ${
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {actionType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
