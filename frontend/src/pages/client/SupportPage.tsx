import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, LifeBuoy, Send, MessageSquare, CheckCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, ShoppingBag, CalendarDays, Package
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  'Açık': 'bg-amber-50 text-amber-600 border-amber-200',
  'İşlemde': 'bg-blue-50 text-blue-600 border-blue-200',
  'Çözüldü': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'Kapatıldı': 'bg-slate-100 text-slate-500 border-slate-200',
};

interface UserTransaction {
  id: number;
  eser_id: number | null;
  etkinlik_id: number | null;
  eser_baslik: string | null;
  etkinlik_baslik: string | null;
  toplam_tutar: number;
  durum: string;
  islem_tarihi: string;
}

const ClientSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Müşterinin işlemleri
  const [myTransactions, setMyTransactions] = useState<UserTransaction[]>([]);

  // Form
  const [form, setForm] = useState({ konu: '', mesaj: '', islem_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/destek?kullanici_id=${user.id}`);
      setTickets(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchMyTransactions = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/islemler/kullanici/${user.id}`);
      setMyTransactions(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!user.id) { navigate('/login'); return; }
    fetchTickets();
    fetchMyTransactions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.konu.trim() || !form.mesaj.trim()) return;
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await axios.post('http://localhost:5000/api/destek', {
        kullanici_id: user.id,
        konu: form.konu,
        mesaj: form.mesaj,
        islem_id: form.islem_id ? parseInt(form.islem_id) : null,
      });
      setForm({ konu: '', mesaj: '', islem_id: '' });
      setSuccessMsg('✅ Destek talebiniz başarıyla gönderildi! En kısa sürede yanıt alacaksınız.');
      await fetchTickets();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || '❌ Gönderme başarısız. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (durum: string) => {
    switch (durum) {
      case 'Çözüldü': return <CheckCircle size={14} />;
      case 'İşlemde': return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  // Seçilen işlemin bilgisini oluştur
  const getTransactionLabel = (tx: UserTransaction) => {
    const type = tx.eser_id ? '🖼️ Eser' : '🎫 Etkinlik';
    const name = tx.eser_baslik || tx.etkinlik_baslik || 'Bilinmiyor';
    const date = new Date(tx.islem_tarihi).toLocaleDateString('tr-TR');
    return `${type}: ${name} — ₺${tx.toplam_tutar} (${date})`;
  };

  // Seçilen işlem detayı kartı
  const selectedTx = myTransactions.find(t => String(t.id) === form.islem_id);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
            <ArrowLeft size={20} /> Profile Dön
          </button>
          <div className="flex items-center gap-2 ml-2">
            <LifeBuoy size={22} className="text-indigo-600" />
            <span className="text-xl font-bold text-slate-800">Müşteri Destek</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* ── Yeni Talep Formu ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white">
            <h1 className="text-2xl font-black mb-1 flex items-center gap-3">
              <LifeBuoy size={28} /> Size Nasıl Yardımcı Olabiliriz?
            </h1>
            <p className="text-indigo-200 text-sm">Satın aldığınız bir eser veya etkinlikle ilgili sorun yaşıyorsanız, ilgili siparişi seçerek destek talebi oluşturun.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* İlgili Sipariş Seçimi */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                İlgili Sipariş / Rezervasyon
                <span className="text-slate-400 font-normal ml-1">(opsiyonel)</span>
              </label>
              <div className="relative">
                <Package size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={form.islem_id}
                  onChange={e => setForm(f => ({ ...f, islem_id: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white appearance-none"
                >
                  <option value="">-- Sipariş seçin (opsiyonel) --</option>
                  {myTransactions.map(tx => (
                    <option key={tx.id} value={tx.id}>
                      #{tx.id} — {getTransactionLabel(tx)}
                    </option>
                  ))}
                </select>
              </div>
              {myTransactions.length === 0 && (
                <p className="text-xs text-slate-400 mt-1.5 italic">Henüz bir satın alma veya rezervasyon işleminiz bulunmuyor.</p>
              )}
            </div>

            {/* Seçilen Sipariş Detay Kartı */}
            {selectedTx && (
              <div className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedTx.eser_id ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                  {selectedTx.eser_id ? <ShoppingBag size={20} /> : <CalendarDays size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">
                    {selectedTx.eser_baslik || selectedTx.etkinlik_baslik}
                  </p>
                  <p className="text-xs text-slate-500">
                    İşlem #{selectedTx.id} · ₺{selectedTx.toplam_tutar} · {new Date(selectedTx.islem_tarihi).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${
                  selectedTx.durum === 'Onaylandı' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  selectedTx.durum === 'Bekliyor' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-rose-50 text-rose-600 border-rose-200'
                }`}>
                  {selectedTx.durum}
                </span>
              </div>
            )}

            {/* Konu */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Konu *</label>
              <select
                value={form.konu}
                onChange={e => setForm(f => ({ ...f, konu: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="">-- Konu seçin --</option>
                <option value="Rezervasyon Sorunu">Rezervasyon Sorunu</option>
                <option value="Ödeme Sorunu">Ödeme Sorunu</option>
                <option value="Sipariş Sorunu">Sipariş Sorunu</option>
                <option value="Hesap Sorunu">Hesap Sorunu</option>
                <option value="İade ve İptal">İade ve İptal</option>
                <option value="Teknik Sorun">Teknik Sorun</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            {/* Mesaj */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mesajınız *</label>
              <textarea
                rows={5}
                required
                value={form.mesaj}
                onChange={e => setForm(f => ({ ...f, mesaj: e.target.value }))}
                placeholder="Sorununuzu veya isteğinizi detaylı olarak açıklayın..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
              <p className="text-xs text-slate-400 mt-1.5">{form.mesaj.length} / 1000 karakter</p>
            </div>

            {successMsg && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
                <CheckCircle size={18} className="shrink-0 mt-0.5" /> {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
                <AlertCircle size={18} className="shrink-0 mt-0.5" /> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !form.konu || !form.mesaj.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              <Send size={18} /> {submitting ? 'Gönderiliyor...' : 'Talebi Gönder'}
            </button>
          </form>
        </div>

        {/* ── Mevcut Talepler ── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <MessageSquare className="text-indigo-500" size={22} />
            <h2 className="text-xl font-bold text-slate-800">Taleplerim</h2>
            {tickets.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">{tickets.length}</span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p>Henüz bir destek talebiniz yok.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div key={ticket.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <button
                    onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                        <LifeBuoy size={20} className="text-indigo-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{ticket.konu}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-400 truncate">{ticket.mesaj}</p>
                          {/* İlişkili işlem badge */}
                          {ticket.islem_id && (
                            <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100 shrink-0">
                              {ticket.eser_baslik ? <ShoppingBag size={10} /> : <CalendarDays size={10} />}
                              #{ticket.islem_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[ticket.durum] || STATUS_COLORS['Açık']}`}>
                        {getStatusIcon(ticket.durum)} {ticket.durum}
                      </span>
                      {expandedId === ticket.id ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </div>
                  </button>

                  {expandedId === ticket.id && (
                    <div className="px-5 pb-5 pt-0 border-t border-slate-50 space-y-4">

                      {/* İlişkili Sipariş Bilgisi */}
                      {ticket.islem_id && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ticket.eser_baslik ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                            {ticket.eser_baslik ? <ShoppingBag size={16} /> : <CalendarDays size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-400 uppercase">İlişkili Sipariş</p>
                            <p className="text-sm font-semibold text-slate-700 truncate">
                              #{ticket.islem_id} — {ticket.eser_baslik || ticket.etkinlik_baslik || 'Bilinmiyor'}
                            </p>
                          </div>
                          {ticket.islem_tutar && (
                            <span className="text-sm font-bold text-slate-600 shrink-0">₺{ticket.islem_tutar}</span>
                          )}
                          {ticket.islem_durum && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                              ticket.islem_durum === 'Onaylandı' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                              ticket.islem_durum === 'Bekliyor' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-rose-50 text-rose-600 border-rose-200'
                            }`}>
                              {ticket.islem_durum}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Mesaj */}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Mesajınız</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{ticket.mesaj}</p>
                      </div>

                      {/* Admin yanıtı */}
                      {ticket.admin_yaniti && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                          <p className="text-xs font-bold text-indigo-500 uppercase mb-2 flex items-center gap-1.5">
                            <CheckCircle size={12} /> Galeri Yanıtı
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">{ticket.admin_yaniti}</p>
                        </div>
                      )}
                      {!ticket.admin_yaniti && (
                        <div className="flex items-center gap-2 text-sm text-slate-400 bg-amber-50 border border-amber-100 rounded-xl p-3">
                          <Clock size={15} className="text-amber-400 shrink-0" />
                          <span>Talebiniz inceleniyor. En kısa sürede yanıt verilecektir.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hızlı İletişim Bilgileri */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-6 text-white">
          <h3 className="font-bold text-lg mb-3">Diğer İletişim Kanalları</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <p className="font-semibold text-indigo-300 mb-1">📧 E-posta</p>
              <p className="text-slate-300">destek@artgallery.com</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <p className="font-semibold text-indigo-300 mb-1">📞 Telefon</p>
              <p className="text-slate-300">+90 212 123 45 67</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <p className="font-semibold text-indigo-300 mb-1">🕐 Çalışma Saatleri</p>
              <p className="text-slate-300">Pzt-Cmt 09:00–18:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSupportPage;
