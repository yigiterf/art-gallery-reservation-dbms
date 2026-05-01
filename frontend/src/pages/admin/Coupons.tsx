import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tag, Trash2, Plus, Percent, X } from 'lucide-react';

interface Coupon {
  id: number;
  kod: string;
  indirim_yuzdesi: number;
}

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ kod: '', indirim_yuzdesi: '' });
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/coupons');
      setCoupons(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu kuponu silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/coupons/${id}`);
        setCoupons(coupons.filter(c => c.id !== id));
      } catch {
        alert('Kupon silinirken hata oluştu.');
      }
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('http://localhost:5000/api/admin/coupons', {
        kod: form.kod.toUpperCase(),
        indirim_yuzdesi: parseFloat(form.indirim_yuzdesi),
      });
      setShowModal(false);
      setForm({ kod: '', indirim_yuzdesi: '' });
      fetchCoupons();
    } catch {
      alert('Kupon eklenirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const getDiscountColor = (pct: number) => {
    if (pct >= 50) return 'bg-rose-50 text-rose-600 border-rose-200';
    if (pct >= 25) return 'bg-orange-50 text-orange-600 border-orange-200';
    return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kupon Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">İndirim kuponlarını oluşturun ve yönetin.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={18} /> Yeni Kupon
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Toplam Kupon', value: coupons.length, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          {
            label: 'Ortalama İndirim',
            value: coupons.length > 0
              ? `%${(coupons.reduce((s, c) => s + c.indirim_yuzdesi, 0) / coupons.length).toFixed(1)}`
              : '—',
            color: 'text-amber-600 bg-amber-50 border-amber-100',
          },
          {
            label: 'En Yüksek İndirim',
            value: coupons.length > 0 ? `%${Math.max(...coupons.map(c => c.indirim_yuzdesi))}` : '—',
            color: 'text-rose-600 bg-rose-50 border-rose-100',
          },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 ${s.color.split(' ')[2]}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <Percent size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm border border-slate-100">Yükleniyor...</div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm border border-slate-100">
          <Tag size={40} className="mx-auto mb-3 opacity-30" />
          <p>Henüz kupon oluşturulmamış.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(coupon => (
            <div
              key={coupon.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              {/* Decorative dashed left edge (coupon feel) */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-dashed bg-gradient-to-b from-indigo-400 to-purple-400 rounded-l-2xl" />

              <div className="pl-3">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={16} className="text-indigo-400" />
                  <span className="font-mono font-bold text-lg text-slate-800 tracking-wider">{coupon.kod}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getDiscountColor(coupon.indirim_yuzdesi)}`}>
                  %{coupon.indirim_yuzdesi} İndirim
                </span>
              </div>

              <button
                onClick={() => handleDelete(coupon.id)}
                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 opacity-0 group-hover:opacity-100"
                title="Kuponu Sil"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Tag className="text-indigo-500" size={22} /> Yeni Kupon Oluştur
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Kupon Kodu</label>
                <input
                  type="text" required value={form.kod}
                  onChange={e => setForm({ ...form, kod: e.target.value.toUpperCase() })}
                  placeholder="Örn: YAZA2025"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono uppercase tracking-widest"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">İndirim Yüzdesi (%)</label>
                <input
                  type="number" required min="1" max="100" value={form.indirim_yuzdesi}
                  onChange={e => setForm({ ...form, indirim_yuzdesi: e.target.value })}
                  placeholder="10"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <button
                type="submit" disabled={saving}
                className="w-full mt-2 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-60"
              >
                {saving ? 'Oluşturuluyor...' : 'Kuponu Oluştur'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
