import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Edit2, CheckCircle } from 'lucide-react';

const AdminFights = () => {
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedFight, setSelectedFight] = useState(null);

  // Form states
  const [newFight, setNewFight] = useState({ fighter1Name: '', fighter1Image: '', fighter2Name: '', fighter2Image: '', date: '' });
  const [updateData, setUpdateData] = useState({ status: '', winner: '' });

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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fights', newFight);
      setCreateModalOpen(false);
      setNewFight({ fighter1Name: '', fighter1Image: '', fighter2Name: '', fighter2Image: '', date: '' });
      fetchFights();
    } catch (err) {
      console.error(err);
      alert('Failed to create fight');
    }
  };

  const openUpdateModal = (fight) => {
    setSelectedFight(fight);
    setUpdateData({ status: fight.status, winner: '' });
    setUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        status: updateData.status,
        result: updateData.status === 'completed' ? { winner: updateData.winner } : undefined
      };
      await api.patch(`/fights/${selectedFight._id}`, payload);
      setUpdateModalOpen(false);
      fetchFights();
    } catch (err) {
      console.error(err);
      alert('Failed to update fight');
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Manage Fights</h2>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          <span>Add Fight</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {fights.map(fight => (
          <div key={fight._id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">{fight.fighter1Name} vs {fight.fighter2Name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  fight.status === 'upcoming' ? 'bg-blue-500/10 text-blue-500' :
                  fight.status === 'ongoing' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-green-500/10 text-green-500'
                }`}>
                  {fight.status.toUpperCase()}
                </span>
              </div>
              
              <div className="flex justify-between items-center bg-gray-950 p-4 rounded-lg mb-4 relative overflow-hidden h-32">
                <div className="absolute left-0 bottom-0 w-1/2 h-full">
                  {fight.fighter1Image && <img src={fight.fighter1Image} alt={fight.fighter1Name} className="h-full w-full object-contain object-bottom" />}
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-full">
                  {fight.fighter2Image && <img src={fight.fighter2Image} alt={fight.fighter2Name} className="h-full w-full object-contain object-bottom" />}
                </div>
                <div className="z-10 mx-auto bg-gray-900/80 px-2 py-1 rounded text-xs font-black italic text-gray-400">VS</div>
              </div>
              
              <div className="text-sm text-gray-400 mb-6 flex items-center justify-between">
                <span>{new Date(fight.date).toLocaleString()}</span>
                {fight.status === 'completed' && fight.result?.winner && (
                  <span className="text-green-500 font-bold flex items-center"><CheckCircle size={16} className="mr-1" /> Winner: {fight.result.winner}</span>
                )}
              </div>

              <button 
                onClick={() => openUpdateModal(fight)}
                className="w-full flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
                <span>Update Status</span>
              </button>
            </div>
          </div>
        ))}
        {fights.length === 0 && <p className="text-gray-500 col-span-3">No fights available.</p>}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-bold mb-6">Create New Fight</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fighter 1 Name</label>
                  <input required type="text" value={newFight.fighter1Name} onChange={e => setNewFight({...newFight, fighter1Name: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fighter 1 Image URL</label>
                  <input type="text" value={newFight.fighter1Image} onChange={e => setNewFight({...newFight, fighter1Image: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="https://..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fighter 2 Name</label>
                  <input required type="text" value={newFight.fighter2Name} onChange={e => setNewFight({...newFight, fighter2Name: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fighter 2 Image URL</label>
                  <input type="text" value={newFight.fighter2Image} onChange={e => setNewFight({...newFight, fighter2Image: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date & Time</label>
                <input required type="datetime-local" value={newFight.date} onChange={e => setNewFight({...newFight, date: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
              </div>

              <div className="flex space-x-3 mt-6">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {updateModalOpen && selectedFight && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Update Fight</h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select 
                  value={updateData.status} 
                  onChange={e => setUpdateData({...updateData, status: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {updateData.status === 'completed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Winner</label>
                  <select 
                    required
                    value={updateData.winner} 
                    onChange={e => setUpdateData({...updateData, winner: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                  >
                    <option value="">Select Winner...</option>
                    {selectedFight.bettingOptions.map((opt, i) => (
                      <option key={i} value={opt.option}>{opt.option}</option>
                    ))}
                  </select>
                  <p className="text-xs text-yellow-500 mt-2">Warning: Marking as completed and selecting a winner will settle all pending bets permanently.</p>
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <button type="button" onClick={() => setUpdateModalOpen(false)} className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFights;
