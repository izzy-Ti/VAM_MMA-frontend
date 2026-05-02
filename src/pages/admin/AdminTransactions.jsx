import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Check, X, MessageSquare } from 'lucide-react';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' or 'decline'
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

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
      fetchTransactions(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Manage Transactions</h2>
      
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Phone / SMS</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {transactions.map(tx => (
                <tr key={tx._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{tx.userId?.firstName || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">@{tx.userId?.username || 'no-username'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-400">{tx.amount} ETB</td>
                  <td className="px-6 py-4 uppercase text-sm">{tx.method}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    <p>{tx.phoneNumber}</p>
                    <p className="text-xs">{tx.smsConfirmation}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tx.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                      tx.status === 'declined' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tx.status === 'pending' && (
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => openModal(tx, 'approve')} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors" title="Approve">
                          <Check size={18} />
                        </button>
                        <button onClick={() => openModal(tx, 'decline')} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors" title="Decline">
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              {actionType === 'approve' ? <Check className="text-green-500 mr-2" /> : <X className="text-red-500 mr-2" />}
              {actionType === 'approve' ? 'Approve Transaction' : 'Decline Transaction'}
            </h3>
            <p className="text-gray-400 mb-4 text-sm">
              You are about to {actionType} a deposit of <strong className="text-white">{selectedTx?.amount} ETB</strong> for <strong className="text-white">{selectedTx?.userId?.firstName}</strong>.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                <MessageSquare size={16} className="mr-2" />
                Custom Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave blank to send default message..."
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors min-h-[100px]"
              ></textarea>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAction}
                className={`flex-1 py-3 text-white rounded-lg font-medium transition-colors ${
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
