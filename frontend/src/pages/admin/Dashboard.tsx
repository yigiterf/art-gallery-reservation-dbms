import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users, ImageIcon, CalendarDays, ShoppingCart, TrendingUp,
  Heart, MessageSquare, Star, Percent, XCircle, BarChart2,
  DollarSign, Package, Activity
} from 'lucide-react';

interface Stats {
  users: number;
  artworks: number;
  events: number;
  transactions: number;
  cancelledTransactions: number;
  toplamGelir: number;
  recentTransactions: any[];
  odemeYontemiDagilimi: { odeme_yontemi: string; sayi: string }[];
  topEserler: {
    id: number; baslik: string; fiyat: number;
    favori_sayisi: string; yorum_sayisi: string;
    satis_sayisi: string; ort_puan: string;
  }[];
  etkinlikIstatistikleri: {
    id: number; baslik: string; ucret: number; kalan_kontenjan: number;
    toplam_katilimci: string; rezervasyon_sayisi: string;
    ort_puan: string; yorum_sayisi: string;
  }[];
  gelirTrendi: { gun: string; gunluk_gelir: string; islem_sayisi: string }[];
}

// Mini bar chart bileşeni (CSS-only)
const MiniBarChart: React.FC<{ data: { gun: string; gunluk_gelir: string }[] }> = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="h-16 flex items-center justify-center text-slate-300 text-xs">Veri yok</div>
  );
  const max = Math.max(...data.map(d => parseFloat(d.gunluk_gelir)));
  return (
    <div className="flex items-end gap-0.5 h-16">
      {data.map((d, i) => {
        const h = max > 0 ? (parseFloat(d.gunluk_gelir) / max) * 100 : 0;
        return (
          <div key={i} className="flex-1 relative group">
            <div
              className="bg-indigo-400 hover:bg-indigo-500 rounded-sm transition-all cursor-default"
              style={{ height: `${Math.max(h, 4)}%` }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
              {new Date(d.gun).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              <br />₺{parseFloat(d.gunluk_gelir).toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Doluluk çubuğu
const OccupancyBar: React.FC<{ dolu: number; toplam: number }> = ({ dolu, toplam }) => {
  const pct = toplam > 0 ? Math.min((dolu / toplam) * 100, 100) : 0;
  const color = pct >= 80 ? 'bg-rose-500' : pct >= 50 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{dolu} / {toplam} kişi</span>
        <span className="font-bold">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// Yıldız gösterimi
const StarDisplay: React.FC<{ puan: number }> = ({ puan }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={11} className={i <= Math.round(puan) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
    ))}
    <span className="text-xs font-bold text-slate-600 ml-1">{parseFloat(puan as any).toFixed(1)}</span>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'eserler' | 'etkinlikler'>('eserler');

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/stats')
      .then(res => { setStats(res.data); setLoading(false); })
      .catch(err => { console.error('Failed to fetch stats', err); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const topCards = [
    { label: 'Toplam Kullanıcı', value: stats?.users || 0, icon: <Users size={22} />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Kayıtlı Eser', value: stats?.artworks || 0, icon: <ImageIcon size={22} />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Aktif Etkinlik', value: stats?.events || 0, icon: <CalendarDays size={22} />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Tamamlanan İşlem', value: stats?.transactions || 0, icon: <ShoppingCart size={22} />, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    {
      label: 'Toplam Gelir',
      value: `₺${(stats?.toplamGelir || 0).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: <DollarSign size={22} />, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100'
    },
    { label: 'İptal Edilen', value: stats?.cancelledTransactions || 0, icon: <XCircle size={22} />, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── KPI Kartları ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {topCards.map((card, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 border ${card.border} shadow-sm hover:shadow-md transition-all duration-200`}>
            <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">{card.label}</p>
            <h3 className="text-xl font-black text-slate-800">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* ── Gelir Trendi + Ödeme Yöntemleri ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gelir Trendi */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" /> Son 30 Günlük Gelir Trendi
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              ₺{(stats?.toplamGelir || 0).toLocaleString('tr-TR')} toplam
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Günlük işlem gelirleri (hover ile detay)</p>
          <MiniBarChart data={stats?.gelirTrendi || []} />
          {(stats?.gelirTrendi?.length || 0) === 0 && (
            <p className="text-center text-slate-400 text-sm mt-2">Henüz işlem verisi yok.</p>
          )}
        </div>

        {/* Ödeme Yöntemi Dağılımı */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Percent size={18} className="text-amber-500" /> Ödeme Yöntemleri
          </h3>
          {(!stats?.odemeYontemiDagilimi || stats.odemeYontemiDagilimi.length === 0) ? (
            <p className="text-slate-400 text-sm text-center py-6">Henüz işlem yok.</p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const total = stats!.odemeYontemiDagilimi.reduce((s, o) => s + parseInt(o.sayi), 0);
                const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                return stats!.odemeYontemiDagilimi.map((o, i) => {
                  const pct = total > 0 ? ((parseInt(o.sayi) / total) * 100).toFixed(0) : '0';
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 truncate">{o.odeme_yontemi || 'Belirtilmemiş'}</span>
                        <span className="text-slate-500 shrink-0 ml-2">{o.sayi} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>

      {/* ── Eser & Etkinlik İstatistikleri Tabloları ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Sekme başlıkları */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('eserler')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === 'eserler' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Package size={16} /> En Popüler Eserler
          </button>
          <button
            onClick={() => setActiveTab('etkinlikler')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === 'etkinlikler' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <BarChart2 size={16} /> Etkinlik Performansı
          </button>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'eserler' ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="text-left py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Eser</th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center justify-center gap-1"><Heart size={11} /> Favori</span>
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center justify-center gap-1"><MessageSquare size={11} /> Yorum</span>
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center justify-center gap-1"><ShoppingCart size={11} /> Satış</span>
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center justify-center gap-1"><Star size={11} /> Ort. Puan</span>
                  </th>
                  <th className="text-right py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Fiyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(!stats?.topEserler || stats.topEserler.length === 0) ? (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">Henüz eser verisi yok.</td></tr>
                ) : stats.topEserler.map((eser, i) => (
                  <tr key={eser.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
                        <span className="font-semibold text-slate-800 text-sm truncate max-w-[180px]">{eser.baslik}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-rose-500 font-bold text-sm">
                        <Heart size={13} className="fill-rose-400" /> {eser.favori_sayisi}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-indigo-500 font-bold text-sm">
                        <MessageSquare size={13} /> {eser.yorum_sayisi}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 font-bold text-sm ${parseInt(eser.satis_sayisi) > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <ShoppingCart size={13} /> {eser.satis_sayisi}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {parseFloat(eser.ort_puan) > 0
                        ? <StarDisplay puan={parseFloat(eser.ort_puan)} />
                        : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="py-4 px-5 text-right font-black text-indigo-600 text-sm">₺{eser.fiyat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="text-left py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Etkinlik</th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rezervasyon</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider" style={{ minWidth: 140 }}>Doluluk</th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center justify-center gap-1"><Star size={11} /> Ort. Puan</span>
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center justify-center gap-1"><MessageSquare size={11} /> Yorum</span>
                  </th>
                  <th className="text-right py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ücret</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(!stats?.etkinlikIstatistikleri || stats.etkinlikIstatistikleri.length === 0) ? (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">Henüz etkinlik verisi yok.</td></tr>
                ) : stats.etkinlikIstatistikleri.map((evt, i) => {
                  const toplam = parseInt(evt.toplam_katilimci as any) + evt.kalan_kontenjan;
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
                          <span className="font-semibold text-slate-800 text-sm truncate max-w-[160px]">{evt.baslik}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-violet-600 font-bold text-sm">
                          <Users size={13} /> {evt.rezervasyon_sayisi}
                        </span>
                      </td>
                      <td className="py-4 px-4" style={{ minWidth: 140 }}>
                        <OccupancyBar dolu={parseInt(evt.toplam_katilimci as any)} toplam={toplam} />
                      </td>
                      <td className="py-4 px-4 text-center">
                        {parseFloat(evt.ort_puan) > 0
                          ? <StarDisplay puan={parseFloat(evt.ort_puan)} />
                          : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-indigo-500 font-bold text-sm">
                          <MessageSquare size={13} /> {evt.yorum_sayisi}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-black text-indigo-600 text-sm">₺{evt.ucret}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Son İşlemler ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5">
          <TrendingUp className="text-indigo-500" size={18} /> Son İşlemler
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 uppercase text-xs font-semibold text-slate-400">
                <th className="pb-3 font-medium">Kullanıcı</th>
                <th className="pb-3 font-medium">Ürün / Etkinlik</th>
                <th className="pb-3 font-medium">Tarih</th>
                <th className="pb-3 font-medium">Tutar</th>
                <th className="pb-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats?.recentTransactions?.map((tx, idx) => (
                <tr key={idx} className="text-sm hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 font-medium text-slate-700">{tx.ad_soyad || 'Bilinmiyor'}</td>
                  <td className="py-3 text-slate-500 max-w-[160px] truncate">
                    {tx.eser_basligi || tx.etkinlik_basligi || '—'}
                  </td>
                  <td className="py-3 text-slate-500">{new Date(tx.islem_tarihi).toLocaleDateString('tr-TR')}</td>
                  <td className="py-3 font-bold text-slate-700">₺{tx.toplam_tutar}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      tx.durum === 'Onaylandı' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      tx.durum === 'İptal Edildi' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>{tx.durum}</span>
                  </td>
                </tr>
              ))}
              {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Henüz işlem bulunmuyor.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
