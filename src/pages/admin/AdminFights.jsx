import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Edit2, CheckCircle, Trash2, Upload, Settings, ChevronDown, ChevronUp } from 'lucide-react';

const OPTION_STATUS_COLORS = {
  open: 'text-gray-400 bg-gray-800',
  won: 'text-green-400 bg-green-500/10 border border-green-500/30',
  lost: 'text-red-400 bg-red-500/10 border border-red-500/30',
  cancelled: 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/30',
};

const AdminFights = () => {
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedFight, setSelectedFight] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Create form
  const [fighter1Name, setFighter1Name] = useState('');
  const [fighter2Name, setFighter2Name] = useState('');
  const [fighter1Image, setFighter1Image] = useState(null);
  const [fighter2Image, setFighter2Image] = useState(null);
  const [fighter1Preview, setFighter1Preview] = useState(null);
  const [fighter2Preview, setFighter2Preview] = useState(null);
  const [date, setDate] = useState('');

  // Update status
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateWinner, setUpdateWinner] = useState('');

  // Expanded categories in manage modal
  const [expandedCategories, setExpandedCategories] = useState({});

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
    if (file) { setFile(file); setPreview(URL.createObjectURL(file)); }
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
      await api.post('/fights', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCreateModalOpen(false);
      resetCreateForm();
      fetchFights();
    } catch (err) {
      alert('Failed to create fight: ' + (err.response?.data?.message || err.message));
    } finally { setSubmitting(false); }
  };

  const openManageModal = (fight) => {
    setSelectedFight(fight);
    setUpdateStatus(fight.status);
    setUpdateWinner('');
    // Auto-expand all categories
    const cats = {};
    fight.bettingOptions.forEach(opt => { cats[opt.category] = true; });
    setExpandedCategories(cats);
    setManageModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        status: updateStatus,
        result: updateStatus === 'completed' ? { winner: updateWinner } : undefined,
      };
      await api.patch(`/fights/${selectedFight._id}`, payload);
      fetchFights();
      // Update local state
      setSelectedFight(prev => ({ ...prev, status: updateStatus }));
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSettleOption = async (optionId, result) => {
    try {
      await api.patch(`/fights/${selectedFight._id}/options/${optionId}`, { result });
      // Update local selectedFight state
      setSelectedFight(prev => ({
        ...prev,
        bettingOptions: prev.bettingOptions.map(opt =>
          opt._id === optionId ? { ...opt, status: result } : opt
        )
      }));
      fetchFights();
    } catch (err) {
      alert('Failed to settle option: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteFight = async (fightId) => {
    try {
      await api.delete(`/fights/${fightId}`);
      setDeleteConfirm(null);
      setManageModalOpen(false);
      fetchFights();
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  // Group betting options by category
  const groupByCategory = (options = []) => {
    const groups = {};
    options.forEach(opt => {
      if (!groups[opt.category]) groups[opt.category] = [];
      groups[opt.category].push(opt);
    });
    return groups;
  };

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  const optionStatusBadge = (status) => (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${OPTION_STATUS_COLORS[status]}`}>
      {status}
    </span>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Manage Fights</h2>
        <button onClick={() => setCreateModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={20} /><span>Add Fight</span>
        </button>
      </div>

      {/* Fight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {fights.map(fight => (
          <div key={fight._id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-bold">{fight.fighter1Name} vs {fight.fighter2Name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ml-2 ${
                  fight.status === 'upcoming' ? 'bg-blue-500/10 text-blue-500' :
                  fight.status === 'ongoing' ? 'bg-yellow-500/10 text-yellow-500' :
                  fight.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                  'bg-red-500/10 text-red-500'
                }`}>{fight.status.toUpperCase()}</span>
              </div>

              <div className="relative h-28 bg-gray-950 rounded-lg mb-3 overflow-hidden">
                <div className="absolute left-0 bottom-0 w-1/2 h-full">
                  {fight.fighter1Image && <img src={fight.fighter1Image} alt={fight.fighter1Name} className="h-full w-full object-contain object-bottom" />}
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-full">
                  {fight.fighter2Image && <img src={fight.fighter2Image} alt={fight.fighter2Name} className="h-full w-full object-contain object-bottom" />}
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <span className="text-2xl font-black italic text-gray-600/50">VS</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">{new Date(fight.date).toLocaleString()}</div>

              <div className="flex gap-2">
                <button onClick={() => openManageModal(fight)} className="flex-1 flex items-center justify-center space-x-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 py-2 rounded-lg transition-colors text-sm font-medium">
                  <Settings size={14} /><span>Manage</span>
                </button>
                <button onClick={() => setDeleteConfirm(fight)} className="flex items-center justify-center px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {fights.length === 0 && <p className="text-gray-500 col-span-3">No fights available.</p>}
      </div>

      {/* ── CREATE MODAL ── */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-bold mb-6">Create New Fight</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              {[
                { label: 'Fighter 1', color: 'text-red-400', name: fighter1Name, setName: setFighter1Name, preview: fighter1Preview, setFile: setFighter1Image, setPreview: setFighter1Preview },
                { label: 'Fighter 2', color: 'text-blue-400', name: fighter2Name, setName: setFighter2Name, preview: fighter2Preview, setFile: setFighter2Image, setPreview: setFighter2Preview },
              ].map(f => (
                <div key={f.label} className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                  <p className={`text-sm font-bold uppercase tracking-widest mb-3 ${f.color}`}>{f.label}</p>
                  <div className="flex gap-4 items-start">
                    <label className="cursor-pointer shrink-0">
                      <div className={`w-20 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${f.preview ? 'border-blue-500' : 'border-gray-700 hover:border-blue-500'}`}>
                        {f.preview ? <img src={f.preview} alt="preview" className="w-full h-full object-contain" /> : (
                          <><Upload size={18} className="text-gray-500 mb-1" /><span className="text-[10px] text-gray-500">Upload</span></>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, f.setFile, f.setPreview)} />
                    </label>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400 mb-1">Name</label>
                      <input required type="text" value={f.name} onChange={e => f.setName(e.target.value)} placeholder="Fighter name..." className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                      <p className="text-xs text-gray-600 mt-1">Click box to upload background-removed photo</p>
                    </div>
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date & Time</label>
                <input required type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
              </div>
              <p className="text-xs text-gray-600">✓ 23 betting options will be auto-generated (Fight Winner, Method, Round, Distance…)</p>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => { setCreateModalOpen(false); resetCreateForm(); }} className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60 flex items-center justify-center">
                  {submitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Uploading...</> : 'Create Fight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MANAGE FIGHT MODAL ── */}
      {manageModalOpen && selectedFight && (
        <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-start shrink-0">
              <div>
                <h3 className="text-2xl font-bold">{selectedFight.fighter1Name} vs {selectedFight.fighter2Name}</h3>
                <p className="text-sm text-gray-400 mt-1">{new Date(selectedFight.date).toLocaleString()}</p>
              </div>
              <button onClick={() => setManageModalOpen(false)} className="text-gray-500 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">

              {/* Fight Status Section */}
              <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Fight Status</h4>
                <form onSubmit={handleUpdateStatus} className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select value={updateStatus} onChange={e => setUpdateStatus(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm">
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing (Live)</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  {updateStatus === 'completed' && (
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-xs text-gray-500 mb-1">Overall Winner</label>
                      <select required value={updateWinner} onChange={e => setUpdateWinner(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm">
                        <option value="">Select...</option>
                        <option value={selectedFight.fighter1Name}>{selectedFight.fighter1Name}</option>
                        <option value={selectedFight.fighter2Name}>{selectedFight.fighter2Name}</option>
                        <option value="Draw">Draw</option>
                      </select>
                    </div>
                  )}
                  <button type="submit" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Save Status
                  </button>
                </form>
                {updateStatus === 'cancelled' && (
                  <p className="text-xs text-yellow-500 mt-2">⚠️ All pending bets will be refunded automatically when you settle options as Cancelled.</p>
                )}
              </div>

              {/* Betting Options Section */}
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Betting Options — Settle Results
                </h4>
                <p className="text-xs text-gray-600 mb-4">Mark each option as <span className="text-green-400">Won</span>, <span className="text-red-400">Lost</span>, or <span className="text-yellow-400">Cancelled</span> to settle bets and pay out winners automatically.</p>

                <div className="space-y-3">
                  {Object.entries(groupByCategory(selectedFight.bettingOptions)).map(([category, options]) => (
                    <div key={category} className="border border-gray-800 rounded-xl overflow-hidden">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex justify-between items-center px-4 py-3 bg-gray-800 hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm">{category}</span>
                          <span className="text-xs text-gray-500">{options.length} options</span>
                          <span className="text-xs text-green-500">{options.filter(o => o.status === 'won').length} settled</span>
                        </div>
                        {expandedCategories[category] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </button>

                      {/* Options List */}
                      {expandedCategories[category] && (
                        <div className="divide-y divide-gray-800/50">
                          {options.map(opt => (
                            <div key={opt._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {optionStatusBadge(opt.status)}
                                <span className="text-sm truncate">{opt.option}</span>
                              </div>
                              {opt.status === 'open' ? (
                                <div className="flex gap-1.5 ml-3 shrink-0">
                                  <button onClick={() => handleSettleOption(opt._id, 'won')} className="px-2.5 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold transition-colors">Won</button>
                                  <button onClick={() => handleSettleOption(opt._id, 'lost')} className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-colors">Lost</button>
                                  <button onClick={() => handleSettleOption(opt._id, 'cancelled')} className="px-2.5 py-1 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-bold transition-colors">Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => handleSettleOption(opt._id, 'open')} className="ml-3 px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-400 rounded-lg text-xs font-medium transition-colors shrink-0">Reopen</button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 flex justify-between items-center shrink-0">
              <button onClick={() => setDeleteConfirm(selectedFight)} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                <Trash2 size={16} /> Delete Fight & Refund Bets
              </button>
              <button onClick={() => setManageModalOpen(false)} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-red-500/30 p-6 rounded-xl w-full max-w-sm shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Delete Fight?</h3>
            <p className="text-gray-400 text-sm mb-2">{deleteConfirm.fighter1Name} vs {deleteConfirm.fighter2Name}</p>
            <p className="text-yellow-500 text-xs mb-6">All pending bets will be automatically refunded to users.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={() => handleDeleteFight(deleteConfirm._id)} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFights;
