'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Backpack, 
  Calendar, 
  PlusCircle, 
  RefreshCw, 
  Trash2, 
  BookOpen, 
  Tag, 
  CheckCircle2, 
  Layers,
  Sparkles,
  Edit2,
  Check,
  X,
  Copy,
  Database
} from 'lucide-react';

interface JadwalItem {
  id: number;
  hari_id: number;
  nama_buku: string;
  uid_rfid: string;
}

export default function Dashboard() {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');

  // State untuk form tambah jadwal
  const [formData, setFormData] = useState({
    hari_id: '1',
    nama_buku: '',
    uid_rfid: ''
  });

  // State untuk Inline Edit pada Master Catalog
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');
  const [isUpdatingMaster, setIsUpdatingMaster] = useState(false);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Mengambil jadwal dari Supabase
  const fetchSchedule = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jadwal_pelajaran')
      .select('*')
      .order('hari_id', { ascending: true });

    if (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load schedule from database.');
    } else {
      setJadwal((data as JadwalItem[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hari_id' ? value : value.toUpperCase()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('jadwal_pelajaran')
      .insert([
        {
          hari_id: parseInt(formData.hari_id),
          nama_buku: formData.nama_buku.trim(),
          uid_rfid: formData.uid_rfid.trim().toUpperCase()
        }
      ]);

    if (error) {
      console.error('Error inserting data:', error);
      alert('Failed to add new book to schedule.');
    } else {
      setFormData({ hari_id: '1', nama_buku: '', uid_rfid: '' });
      fetchSchedule();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number, bookTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${bookTitle}" from this schedule?`)) return;

    const { error } = await supabase
      .from('jadwal_pelajaran')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete book entry.');
    } else {
      fetchSchedule();
    }
  };

  // Fungsi untuk memulai mode edit master buku
  const startEditingMaster = (uid: string, currentName: string) => {
    setEditingUid(uid);
    setEditedName(currentName);
  };

  // Fungsi menyimpan perubahan nama buku master ke semua baris yang memiliki UID tersebut
  const saveMasterBookName = async (uid: string) => {
    if (!editedName.trim()) {
      alert('Book title cannot be empty.');
      return;
    }

    setIsUpdatingMaster(true);
    const { error } = await supabase
      .from('jadwal_pelajaran')
      .update({ nama_buku: editedName.trim().toUpperCase() })
      .eq('uid_rfid', uid);

    if (error) {
      console.error('Error updating master book:', error);
      alert('Failed to update book name.');
    } else {
      setEditingUid(null);
      fetchSchedule();
    }
    setIsUpdatingMaster(false);
  };

  // Fungsi menyalin UID ke clipboard
  const copyToClipboard = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  // Filter jadwal harian
  const filteredJadwal = selectedDayFilter === 'all' 
    ? jadwal 
    : jadwal.filter(item => item.hari_id === selectedDayFilter);

  // Membuat Master Catalog unik berdasarkan UID RFID
  const masterBooks = Array.from(
    jadwal.reduce((map, item) => {
      if (!map.has(item.uid_rfid)) {
        map.set(item.uid_rfid, {
          uid_rfid: item.uid_rfid,
          nama_buku: item.nama_buku,
          assignedDays: [item.hari_id]
        });
      } else {
        const existing = map.get(item.uid_rfid)!;
        if (!existing.assignedDays.includes(item.hari_id)) {
          existing.assignedDays.push(item.hari_id);
        }
      }
      return map;
    }, new Map<string, { uid_rfid: string; nama_buku: string; assignedDays: number[] }>())
  ).map(([_, val]) => val);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/40 to-sky-50 text-slate-800 font-sans pb-16">
      {/* Header */}
      <header className="bg-gradient-to-r from-violet-600 via-purple-600 to-sky-500 text-white shadow-lg sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md shadow-inner border border-white/20 flex items-center justify-center">
              <Backpack className="text-white drop-shadow-md" size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-wider text-white">EZ-BAGGIE</h1>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-sky-400/30 text-sky-100 border border-sky-300/40 px-2 py-0.5 rounded-full">
                  IoT Smart Bag
                </span>
              </div>
              <p className="text-xs text-purple-100/80 font-medium">Smart Schedule & RFID Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm text-white shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              Cloud Live Sync
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        
        {/* Quick Insight Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-violet-100 text-violet-600 rounded-xl">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Scheduled</p>
              <h3 className="text-2xl font-black text-slate-800">{jadwal.length} Slots</h3>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
              <Database size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Master RFID Tags</p>
              <h3 className="text-2xl font-black text-slate-800">{masterBooks.length} Books</h3>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Bag Hardware Status</p>
              <h3 className="text-base font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={16} /> Online & Ready
              </h3>
            </div>
          </div>
        </div>

        {/* Form and Timetable */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Tambah */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-xl shadow-purple-900/5 border border-purple-100/80 p-6 sticky top-28">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                <div className="p-2 bg-gradient-to-tr from-violet-600 to-purple-500 text-white rounded-xl shadow-md shadow-purple-500/20">
                  <PlusCircle size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Add New Book</h2>
                  <p className="text-xs text-slate-400">Assign book & RFID tag to timetable</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Schedule Day
                  </label>
                  <select
                    name="hari_id"
                    value={formData.hari_id}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition duration-150"
                  >
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="0">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Book Subject / Title
                  </label>
                  <input
                    type="text"
                    name="nama_buku"
                    value={formData.nama_buku}
                    onChange={handleChange}
                    required
                    placeholder="e.g. PJOK, MTK, SCIENCE"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal transition duration-150"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    RFID UID Code (Hex)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="uid_rfid"
                      value={formData.uid_rfid}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 33DDF333"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-mono font-bold text-violet-700 uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal transition duration-150"
                    />
                    <Tag className="absolute left-3 top-3 text-slate-400" size={16} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-gradient-to-r from-violet-600 via-purple-600 to-sky-500 hover:from-violet-700 hover:to-sky-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/25 transition duration-200 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Save Book
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Timetable Mingguan */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-xl shadow-purple-900/5 border border-purple-100/80 p-6">
              
              <div className="flex flex-wrap justify-between items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sky-100 text-sky-600 rounded-xl">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Weekly Timetable</h2>
                    <p className="text-xs text-slate-400">Scheduled books assigned per school day</p>
                  </div>
                </div>

                <button
                  onClick={fetchSchedule}
                  disabled={loading}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin text-purple-600" : ""} />
                  Refresh
                </button>
              </div>

              {/* Day Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
                <button
                  onClick={() => setSelectedDayFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedDayFilter === 'all'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Days
                </button>
                {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => (
                  <button
                    key={dayIdx}
                    onClick={() => setSelectedDayFilter(dayIdx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedDayFilter === dayIdx
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {dayNames[dayIdx]}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="overflow-hidden border border-slate-100 rounded-xl">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Day</th>
                      <th className="px-5 py-3.5 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Book Subject</th>
                      <th className="px-5 py-3.5 text-left text-xs font-black text-slate-500 uppercase tracking-wider">RFID Tag</th>
                      <th className="px-5 py-3.5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-slate-400">
                          <RefreshCw className="animate-spin inline-block mr-2 text-violet-500" size={20} />
                          <span className="text-sm font-semibold">Updating schedule data...</span>
                        </td>
                      </tr>
                    ) : filteredJadwal.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-slate-400">
                          <BookOpen className="inline-block mb-2 opacity-30 text-slate-400" size={32} />
                          <p className="text-sm font-semibold">No schedule registered for this selection.</p>
                          <p className="text-xs text-slate-400">Use the form on the left to add textbooks.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredJadwal.map((item) => (
                        <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-50 text-violet-700 border border-violet-100">
                              {dayNames[item.hari_id]}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-slate-800 tracking-wide">
                              {item.nama_buku}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-md tracking-wider">
                              {item.uid_rfid}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleDelete(item.id, item.nama_buku)}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 mx-auto active:scale-95"
                              title="Delete Book from this Day"
                            >
                              <Trash2 size={15} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-between items-center text-xs text-slate-400 px-1">
                <span>Showing {filteredJadwal.length} scheduled items</span>
                <span>Auto-sync active</span>
              </div>

            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* BAGIAN BARU: MASTER CATALOG / BOOK REFERENCE & EDIT VAULT                 */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl shadow-xl shadow-purple-900/5 border border-purple-100/80 p-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-tr from-violet-600 to-sky-500 text-white rounded-2xl shadow-md shadow-violet-500/20">
                <Database size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Master RFID Catalog & Book Reference
                  <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-bold">
                    {masterBooks.length} Books Registered
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Permanent reference list of RFID tags. Edit book titles or copy UID codes if schedules are accidentally deleted.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden border border-slate-100 rounded-xl">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/90">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Book Title</th>
                  <th className="px-5 py-3.5 text-left text-xs font-black text-slate-500 uppercase tracking-wider">RFID UID (Hex)</th>
                  <th className="px-5 py-3.5 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Active Days Assigned</th>
                  <th className="px-5 py-3.5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {masterBooks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-400">
                      <Tag className="inline-block mb-2 opacity-30 text-slate-400" size={30} />
                      <p className="text-sm font-semibold">No books registered yet.</p>
                      <p className="text-xs text-slate-400">Add a book above to populate this catalog.</p>
                    </td>
                  </tr>
                ) : (
                  masterBooks.map((item) => {
                    const isEditing = editingUid === item.uid_rfid;

                    return (
                      <tr key={item.uid_rfid} className="hover:bg-purple-50/20 transition-colors">
                        
                        {/* Book Subject with Inline Edit */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value.toUpperCase())}
                                className="bg-white border-2 border-purple-500 rounded-lg px-2.5 py-1 text-sm font-bold text-slate-800 uppercase focus:outline-none shadow-sm"
                                autoFocus
                              />
                              <button
                                onClick={() => saveMasterBookName(item.uid_rfid)}
                                disabled={isUpdatingMaster}
                                className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                                title="Save changes"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setEditingUid(null)}
                                className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg transition"
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <span className="text-sm font-black text-slate-800 tracking-wide">
                                {item.nama_buku}
                              </span>
                              <button
                                onClick={() => startEditingMaster(item.uid_rfid, item.nama_buku)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-purple-600 transition p-1"
                                title="Edit Title"
                              >
                                <Edit2 size={13} />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* UID Code with Copy Button */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-md">
                            <span className="font-mono text-xs font-bold text-sky-700 tracking-wider">
                              {item.uid_rfid}
                            </span>
                            <button
                              onClick={() => copyToClipboard(item.uid_rfid)}
                              className="text-sky-500 hover:text-sky-700 transition"
                              title="Copy UID to Clipboard"
                            >
                              {copiedUid === item.uid_rfid ? (
                                <Check size={12} className="text-emerald-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Assigned Days Badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {item.assignedDays.sort().map((dayIdx) => (
                              <span
                                key={dayIdx}
                                className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200"
                              >
                                {dayNames[dayIdx].substring(0, 3)}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Action Edit */}
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => startEditingMaster(item.uid_rfid, item.nama_buku)}
                            className="text-violet-600 hover:text-violet-800 hover:bg-violet-50 border border-transparent hover:border-violet-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 mx-auto active:scale-95"
                          >
                            <Edit2 size={14} />
                            <span>Rename</span>
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Tip: Click <strong>Rename</strong> to update the book subject across all scheduled days automatically.</span>
            <span>Master Catalog</span>
          </div>
        </div>

      </main>
    </div>
  );
}