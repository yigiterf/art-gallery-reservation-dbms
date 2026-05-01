import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CalendarDays, Trash2, Plus, Users, Clock, TicketIcon, X } from 'lucide-react';

interface Etkinlik {
  id: number;
  baslik: string;
  tarih_saat: string;
  ucret: number;
  kontenjan: number;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Etkinlik[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ baslik: '', tarih_saat: '', ucret: '', kontenjan: '' });
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/events');
      setEvents(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/events/${id}`);
        setEvents(events.filter(e => e.id !== id));
      } catch {
        alert('Etkinlik silinirken hata oluştu.');
      }
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('http://localhost:5000/api/admin/events', {
        baslik: form.baslik,
        tarih_saat: form.tarih_saat,
        ucret: parseFloat(form.ucret),
        kontenjan: parseInt(form.kontenjan),
      });
      setShowModal(false);
      setForm({ baslik: '', tarih_saat: '', ucret: '', kontenjan: '' });
      fetchEvents();
    } catch {
      alert('Etkinlik eklenirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Etkinlik Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">Atölye ve sergi etkinliklerini ekleyin, görüntüleyin ve yönetin.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={18} /> Yeni Etkinlik
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
            <CalendarDays size={16} />
            <span className="text-sm font-semibold">Toplam: {events.length} Etkinlik</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Başlık</th>
                <th className="px-6 py-4">Tarih & Saat</th>
                <th className="px-6 py-4">Ücret</th>
                <th className="px-6 py-4">Kontenjan</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Yükleniyor...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Hiç etkinlik bulunamadı.</td></tr>
              ) : (
                events.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
                        <TicketIcon size={16} />
                      </div>
                      {ev.baslik}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock size={14} className="text-slate-400" />
                        {new Date(ev.tarih_saat).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs border border-emerald-100">
                        ₺{ev.ucret}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users size={14} className="text-slate-400" />
                        {ev.kontenjan} kişi
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                        title="Etkinliği Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CalendarDays className="text-amber-500" size={22} /> Yeni Etkinlik Ekle
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Başlık</label>
                <input
                  type="text" required value={form.baslik}
                  onChange={e => setForm({ ...form, baslik: e.target.value })}
                  placeholder="Örn: Yağlı Boya Atölyesi"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tarih & Saat</label>
                <input
                  type="datetime-local" required value={form.tarih_saat}
                  onChange={e => setForm({ ...form, tarih_saat: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Ücret (₺)</label>
                  <input
                    type="number" required min="0" step="0.01" value={form.ucret}
                    onChange={e => setForm({ ...form, ucret: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Kontenjan</label>
                  <input
                    type="number" required min="1" value={form.kontenjan}
                    onChange={e => setForm({ ...form, kontenjan: e.target.value })}
                    placeholder="20"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit" disabled={saving}
                className="w-full mt-2 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-60"
              >
                {saving ? 'Ekleniyor...' : 'Etkinliği Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
