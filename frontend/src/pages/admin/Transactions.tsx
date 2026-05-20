import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingBag, ShoppingCart, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';

interface Transaction {
  id: number;
  kullanici_id: number;
  ad_soyad: string;
  eser_basligi: string | null;
  etkinlik_basligi: string | null;
  toplam_tutar: number;
  durum: string;
  odeme_yontemi: string;
  islem_tarihi: string;
  kupon_kodu: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'Onaylandı':    { label: 'Onaylandı',    color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  'Beklemede':    { label: 'Beklemede',    color: 'bg-amber-50 text-amber-600 border-amber-200' },
  'İptal Edildi': { label: 'İptal Edildi', color: 'bg-rose-50 text-rose-600 border-rose-200' },
};

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tümü');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/transactions');
      setTransactions(res.data);
      setFiltered(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  useEffect(() => {
    let result = transactions;
    if (statusFilter !== 'Tümü') {
      result = result.filter(t => t.durum === statusFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(t =>
        (t.ad_soyad || '').toLowerCase().includes(s) ||
        (t.eser_basligi || '').toLowerCase().includes(s) ||
        (t.etkinlik_basligi || '').toLowerCase().includes(s)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, transactions]);

  const updateStatus = async (id: number, durum: string) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/transactions/${id}/status`, { durum });
      fetchTransactions();
    } catch {
      alert('Durum güncellenirken hata oluştu.');
    }
  };

  const totalRevenue = transactions
    .filter(t => t.durum === 'Onaylandı')
    .reduce((sum, t) => sum + parseFloat(String(t.toplam_tutar)), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">İşlem & Sipariş Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">Tüm satın alma ve rezervasyon işlemlerini takip edin. <span className="text-amber-600 font-semibold">Yönetici müdahalesi</span> ile satıcı kararlarını geçersiz kılabilirsiniz.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Onaylı Gelir</p>
          <p className="text-2xl font-bold text-emerald-600">₺{totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kullanıcı adı, eser veya etkinlik ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
          <Filter size={16} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm text-slate-700 font-medium focus:outline-none bg-transparent"
          >
            <option>Tümü</option>
            <option>Onaylandı</option>
            <option>Beklemede</option>
            <option>İptal Edildi</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Kullanıcı</th>
                <th className="px-6 py-4">Ürün / Etkinlik</th>
                <th className="px-6 py-4">Tutar</th>
                <th className="px-6 py-4">Ödeme</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-right">Yönetici Müdahalesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Yükleniyor...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Hiç işlem bulunamadı.</td></tr>
              ) : (
                filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">#{tx.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{tx.ad_soyad || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {tx.eser_basligi ? (
                          <><ShoppingBag size={14} className="text-indigo-400 shrink-0" /><span className="truncate max-w-[180px]">{tx.eser_basligi}</span></>
                        ) : tx.etkinlik_basligi ? (
                          <><ShoppingCart size={14} className="text-amber-400 shrink-0" /><span className="truncate max-w-[180px]">{tx.etkinlik_basligi}</span></>
                        ) : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">₺{parseFloat(String(tx.toplam_tutar)).toLocaleString('tr-TR')}</td>
                    <td className="px-6 py-4 text-slate-500 capitalize">{tx.odeme_yontemi || '—'}</td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(tx.islem_tarihi).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[tx.durum]?.color || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {tx.durum}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateStatus(tx.id, 'Onaylandı')}
                          title="Onayla"
                          className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <CheckCircle size={17} />
                        </button>
                        <button
                          onClick={() => updateStatus(tx.id, 'İptal Edildi')}
                          title="İptal Et"
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <XCircle size={17} />
                        </button>
                        <button
                          onClick={() => updateStatus(tx.id, 'Beklemede')}
                          title="Beklemede"
                          className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Clock size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
