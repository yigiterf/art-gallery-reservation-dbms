import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HeadphonesIcon, CheckCircle, Clock, XCircle, MessageCircle, ChevronDown, ChevronUp, Send, ShoppingBag, CalendarDays } from 'lucide-react';

interface Ticket {
  id: number;
  kullanici_id: number;
  ad_soyad: string;
  konu: string;
  mesaj: string;
  durum: string;
  admin_yaniti: string | null;
  islem_id: number | null;
  eser_baslik: string | null;
  etkinlik_baslik: string | null;
  islem_tutar: number | null;
  islem_durum: string | null;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  'Beklemede':   { icon: <Clock size={14} />,        color: 'bg-amber-50 text-amber-600 border-amber-200',   label: 'Beklemede' },
  'Çözüldü':    { icon: <CheckCircle size={14} />,   color: 'bg-emerald-50 text-emerald-600 border-emerald-200', label: 'Çözüldü' },
  'Kapatıldı':   { icon: <XCircle size={14} />,      color: 'bg-slate-100 text-slate-500 border-slate-200',   label: 'Kapatıldı' },
};

const Support: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/support');
      setTickets(res.data);
      // pre-fill existing replies
      const replies: Record<number, string> = {};
      res.data.forEach((t: Ticket) => { if (t.admin_yaniti) replies[t.id] = t.admin_yaniti; });
      setReplyTexts(replies);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const updateTicket = async (id: number, durum: string, admin_yaniti: string) => {
    setSaving(id);
    try {
      await axios.put(`http://localhost:5000/api/admin/support/${id}`, { durum, admin_yaniti });
      fetchTickets();
      setExpandedId(null);
    } catch {
      alert('Güncelleme sırasında hata oluştu.');
    } finally {
      setSaving(null);
    }
  };

  const pendingCount   = tickets.filter(t => t.durum === 'Beklemede').length;
  const resolvedCount  = tickets.filter(t => t.durum === 'Çözüldü').length;
  const closedCount    = tickets.filter(t => t.durum === 'Kapatıldı').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Destek Talebi Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">Kullanıcı şikayet ve isteklerini yanıtlayın, talepleri kapatın.</p>
        </div>
        <div className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 px-4 py-2 rounded-xl font-semibold">
          <HeadphonesIcon size={18} />
          {pendingCount} Bekliyor
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Beklemede', value: pendingCount, color: 'text-amber-600 bg-amber-50 border-amber-200', icon: <Clock size={20} /> },
          { label: 'Çözüldü',   value: resolvedCount,  color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <CheckCircle size={20} /> },
          { label: 'Kapatıldı', value: closedCount,    color: 'text-slate-500 bg-slate-100 border-slate-200', icon: <XCircle size={20} /> },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 ${s.color.split(' ')[2]}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tickets */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm border border-slate-100">Yükleniyor...</div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm border border-slate-100">
            <HeadphonesIcon size={40} className="mx-auto mb-3 opacity-30" />
            <p>Henüz destek talebi bulunmuyor.</p>
          </div>
        ) : (
          tickets.map(ticket => {
            const isExpanded = expandedId === ticket.id;
            const statusCfg = STATUS_CONFIG[ticket.durum] || STATUS_CONFIG['Beklemede'];
            return (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Ticket Header — clickable */}
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(ticket.ad_soyad || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{ticket.ad_soyad}</span>
                      <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
                        {statusCfg.icon} {statusCfg.label}
                      </span>
                      {ticket.admin_yaniti && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-500 border border-indigo-100">
                          <MessageCircle size={11} /> Yanıtlandı
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-700 mt-0.5 truncate">{ticket.konu}</p>
                    {ticket.islem_id && (
                      <span className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full w-fit">
                        {ticket.eser_baslik ? <ShoppingBag size={10} /> : <CalendarDays size={10} />}
                        #{ticket.islem_id} — {ticket.eser_baslik || ticket.etkinlik_baslik}
                      </span>
                    )}
                  </div>
                  <div className="shrink-0 text-slate-400">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50/40">
                    {/* Linked transaction info */}
                    {ticket.islem_id && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-indigo-100">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ticket.eser_baslik ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                          {ticket.eser_baslik ? <ShoppingBag size={16} /> : <CalendarDays size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">İlişkili Sipariş</p>
                          <p className="text-sm font-semibold text-slate-700 truncate">#{ticket.islem_id} — {ticket.eser_baslik || ticket.etkinlik_baslik}</p>
                        </div>
                        {ticket.islem_tutar && <span className="text-sm font-bold text-slate-600 shrink-0">₺{ticket.islem_tutar}</span>}
                        {ticket.islem_durum && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                            ticket.islem_durum === 'Onaylandı' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            ticket.islem_durum === 'Bekliyor' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            'bg-rose-50 text-rose-600 border-rose-200'
                          }`}>{ticket.islem_durum}</span>
                        )}
                      </div>
                    )}

                    {/* User message */}
                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Kullanıcı Mesajı</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{ticket.mesaj}</p>
                    </div>

                    {/* Admin reply */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Admin Yanıtı</label>
                      <textarea
                        rows={3}
                        value={replyTexts[ticket.id] || ''}
                        onChange={e => setReplyTexts({ ...replyTexts, [ticket.id]: e.target.value })}
                        placeholder="Kullanıcıya yanıt yazın..."
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none bg-white"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => updateTicket(ticket.id, 'Beklemede', replyTexts[ticket.id] || '')}
                        disabled={saving === ticket.id}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-60"
                      >
                        <Clock size={15} /> Beklemede Bırak
                      </button>
                      <button
                        onClick={() => updateTicket(ticket.id, 'Çözüldü', replyTexts[ticket.id] || '')}
                        disabled={saving === ticket.id}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-60"
                      >
                        <CheckCircle size={15} /> Çözüldü
                      </button>
                      <button
                        onClick={() => updateTicket(ticket.id, 'Kapatıldı', replyTexts[ticket.id] || '')}
                        disabled={saving === ticket.id}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-60"
                      >
                        <XCircle size={15} /> Kapat
                      </button>
                      <button
                        onClick={() => updateTicket(ticket.id, ticket.durum, replyTexts[ticket.id] || '')}
                        disabled={saving === ticket.id}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-60"
                      >
                        <Send size={15} /> {saving === ticket.id ? 'Kaydediliyor...' : 'Yanıtı Gönder'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Support;
