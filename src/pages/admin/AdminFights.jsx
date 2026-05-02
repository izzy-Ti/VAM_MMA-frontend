import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Edit2, CheckCircle, Upload } from 'lucide-react';

const AdminFights = () => {
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedFight, setSelectedFight] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [fighter1Name, setFighter1Name] = useState('');
  const [fighter2Name, setFighter2Name] = useState('');
  const [fighter1Image, setFighter1Image] = useState(null);
  const [fighter2Image, setFighter2Image] = useState(null);
  const [fighter1Preview, setFighter1Preview] = useState(null);
  const [fighter2Preview, setFighter2Preview] = useState(null);
  const [date, setDate] = useState('');
  const [updateData, setUpdateData] = useState({ status: '', winner: '' });

  useEffect(() => { fetchFights(); }, []);

  const fetchFights = async () => {
    try {
      const res = await api.get('/fights');
      setFights(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleImageChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const resetCreateForm = () => {
    setFighter1Name(''); setFighter2Name('');
    setFighter1Image(null); setFighter2Image(null);
    setFighter1Preview(null); setFighter2Preview(null);
    setDate('');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fighter1Name', fighter1Name);
      formData.append('fighter2Name', fighter2Name);
      formData.append('date', date);
      if (fighter1Image) formData.append('fighter1Image', fighter1Image);
      if (fighter2Image) formData.append('fighter2Image', fighter2Image);

      await api.post('/fights', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCreateModalOpen(false);
      resetCreateForm();
      fetchFights();
    } catch (err) {
      console.error(err);
      alert('Failed to create fight: ' + (err.response?.data?.message || err.message));
    } finally { setSubmitting(false); }
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
        <button onClick={() => setCreateModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={20} /><span>Add Fight</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {fights.map(fight => (
          <div key={fight._id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-bold">{fight.fighter1Name} vs {fight.fighter2Name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ml-2 ${
                  fight.status === 'upcoming' ? 'bg-blue-500/10 text-blue-500' :
                  fight.status === 'ongoing' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-green-500/10 text-green-500'
                }`}>{fight.status.toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between items-center bg-gray-950 rounded-lg mb-3 relative overflow-hidden h-28">
                <div className="absolute left-0 bottom-0 w-1/2 h-full">
                  {fight.fighter1Image && <img src={fight.fighter1Image} alt={fight.fighter1Name} className="h-full w-full object-contain object-bottom" />}
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-full">
                  {fight.fighter2Image && <img src={fight.fighter2Image} alt={fight.fighter2Name} className="h-full w-full object-contain object-bottom" />}
                </div>
                <div className="z-10 mx-auto text-sm font-black italic text-gray-500 bg-gray-900/70 px-2 py-1 rounded">VS</div>
              </div>
              
              <div className="text-xs text-gray-400 mb-4 flex items-center justify-between">
                <span>{new Date(fight.date).toLocaleString()}</span>
                {fight.status === 'completed' && fight.result?.winner && (
                  <span className="text-green-500 font-bold flex items-center"><CheckCircle size={12} className="mr-1" /> {fight.result.winner}</span>
                )}
              </div>

              <button onClick={() => openUpdateModal(fight)} className="w-full flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors text-sm">
                <Edit2 size={14} /><span>Update Status</span>
              </button>
            </div>
          </div>
        ))}
        {fights.length === 0 && <p className="text-gray-500 col-span-3">No fights available.</p>}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-bold mb-6">Create New Fight</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              
              {/* Fighter 1 */}
              <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3">Fighter 1</p>
                <div className="flex gap-4 items-start">
                  <label className="cursor-pointer shrink-0">
                    <div className={`w-20 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors overflow-hidden ${fighter1Preview ? 'border-blue-500' : 'border-gray-700 hover:border-blue-500'}`}>
                      {fighter1Preview ? (
                        <img src={fighter1Preview} alt="preview" className="w-full h-full object-contain" />
                      ) : (
                        <>
                          <Upload size={20} className="text-gray-500 mb-1" />
                          <span className="text-[10px] text-gray-500 text-center">Upload</span>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, setFighter1Image, setFighter1Preview)} />
                  </label>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                    <input required type="text" value={fighter1Name} onChange={e => setFighter1Name(e.target.value)} placeholder="e.g. Conor McGregor" className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                    <p className="text-xs text-gray-600 mt-1">Click the box to upload photo</p>
                  </div>
                </div>
              </div>

              {/* Fighter 2 */}
              <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                <p className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-3">Fighter 2</p>
                <div className="flex gap-4 items-start">
                  <label className="cursor-pointer shrink-0">
                    <div className={`w-20 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors overflow-hidden ${fighter2Preview ? 'border-blue-500' : 'border-gray-700 hover:border-blue-500'}`}>
                      {fighter2Preview ? (
                        <img src={fighter2Preview} alt="preview" className="w-full h-full object-contain" />
                      ) : (
                        <>
                          <Upload size={20} className="text-gray-500 mb-1" />
                          <span className="text-[10px] text-gray-500 text-center">Upload</span>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, setFighter2Image, setFighter2Preview)} />
                  </label>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                    <input required type="text" value={fighter2Name} onChange={e => setFighter2Name(e.target.value)} placeholder="e.g. Dustin Poirier" className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                    <p className="text-xs text-gray-600 mt-1">Click the box to upload photo</p>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date & Time</label>
                <input required type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => { setCreateModalOpen(false); resetCreateForm(); }} className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center">
                  {submitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Uploading...</> : 'Create Fight'}
                </button>
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
                <select value={updateData.status} onChange={e => setUpdateData({...updateData, status: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {updateData.status === 'completed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Winner</label>
                  <select required value={updateData.winner} onChange={e => setUpdateData({...updateData, winner: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                    <option value="">Select Winner...</option>
                    {selectedFight.bettingOptions.map((opt, i) => (
                      <option key={i} value={opt.option}>{opt.option}</option>
                    ))}
                  </select>
                  <p className="text-xs text-yellow-500 mt-2">⚠️ This will permanently settle all pending bets.</p>
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
