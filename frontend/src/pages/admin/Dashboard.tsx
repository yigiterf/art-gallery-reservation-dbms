import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, ImageIcon, CalendarDays, ShoppingCart, TrendingUp, Settings } from 'lucide-react';

interface Stats {
  users: number;
  artworks: number;
  events: number;
  transactions: number;
  recentTransactions: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, configure axios base URL
    axios.get('http://localhost:5000/api/admin/stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch stats', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Toplam Kullanıcı', value: stats?.users || 0, icon: <Users size={24} />, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Kayıtlı Eser', value: stats?.artworks || 0, icon: <ImageIcon size={24} />, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Aktif Etkinlik', value: stats?.events || 0, icon: <CalendarDays size={24} />, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Toplam İşlem', value: stats?.transactions || 0, icon: <ShoppingCart size={24} />, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className={`bg-white rounded-2xl p-6 border ${card.border} shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-4`}>
            <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-indigo-500" size={20} />
              Son İşlemler
            </h3>
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">Tümünü gör</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 uppercase text-xs font-semibold text-slate-400">
                  <th className="pb-3 font-medium">Kullanıcı</th>
                  <th className="pb-3 font-medium">Tarih</th>
                  <th className="pb-3 font-medium">Tutar</th>
                  <th className="pb-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats?.recentTransactions?.map((tx, idx) => (
                  <tr key={idx} className="text-sm hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-medium text-slate-700">{tx.ad_soyad || 'Bilinmiyor'}</td>
                    <td className="py-4 text-slate-500">{new Date(tx.islem_tarihi).toLocaleDateString('tr-TR')}</td>
                    <td className="py-4 font-semibold text-slate-700">₺{tx.toplam_tutar}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        tx.durum === 'Onaylandı' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        tx.durum === 'İptal Edildi' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {tx.durum}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">Henüz işlem bulunmuyor.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health / Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Settings size={100} />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10">Sistem Durumu</h3>
            <p className="text-indigo-100 text-sm mb-6 relative z-10">Tüm servisler sorunsuz çalışıyor. Veritabanı entegrasyonu aktif.</p>
            <div className="flex flex-col gap-3 relative z-10">
              <div className="bg-white/10 rounded-lg p-3 flex justify-between items-center backdrop-blur-sm border border-white/10">
                <span className="text-sm font-medium">Veritabanı</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="bg-white/10 rounded-lg p-3 flex justify-between items-center backdrop-blur-sm border border-white/10">
                <span className="text-sm font-medium">API Servisi</span>
                <span className="flex h-2 w-2 relative">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
