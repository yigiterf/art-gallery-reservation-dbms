import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Users, Ticket, Star, MessageSquare, Send, CheckCircle, ThumbsUp, Tag, X, ChevronDown, XCircle } from 'lucide-react';

interface Review {
  id: number;
  kullanici_id: number;
  ad_soyad: string;
  puan: number;
  metin: string;
  admin_yaniti: string | null;
  faydali_oy_sayisi: number;
  dogrulanmis_satin_alma: boolean;
  tarih: string;
}

type SortOption = 'yeni' | 'puan' | 'faydali';

const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; readonly?: boolean }> = ({ value, onChange, readonly }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <button key={i} type="button" disabled={readonly} onClick={() => onChange && onChange(i)} className={`transition-colors ${readonly ? 'cursor-default' : 'hover:scale-110 active:scale-95'}`}>
        <Star size={readonly ? 14 : 22} className={i <= value ? 'text-amber-400 fill-amber-400' : readonly ? 'text-slate-200 fill-slate-200' : 'text-slate-300 fill-slate-300 hover:text-amber-300'} />
      </button>
    ))}
  </div>
);

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState<any>(null);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  // ── Rezervasyon modalı ──
  const [showResModal, setShowResModal] = useState(false);
  const [katilimciSayisi, setKatilimciSayisi] = useState(1);
  const [odemeYontemi, setOdemeYontemi] = useState('Online Kredi Kartı');
  const [kuponKod, setKuponKod] = useState('');
  const [kuponData, setKuponData] = useState<{ id: number; indirim_yuzdesi: number } | null>(null);
  const [kuponLoading, setKuponLoading] = useState(false);
  const [kuponMsg, setKuponMsg] = useState('');

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ puan: 5, metin: '' });
  const [submitting, setSubmitting] = useState(false);
  const [votingId, setVotingId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('yeni');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/yorumlar/etkinlik/${id}`);
      setReviews(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/etkinlikler')
      .then(res => {
        setAllEvents(res.data);
        const found = res.data.find((item: any) => item.id === Number(id));
        setEventData(found);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    fetchReviews();
  }, [id]);

  // ── Kupon doğrula ──
  const handleKuponUygula = async () => {
    if (!kuponKod.trim()) return;
    setKuponLoading(true);
    setKuponMsg('');
    setKuponData(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/islemler/kupon/${kuponKod.trim()}`);
      setKuponData(res.data);
      setKuponMsg(`✅ Kupon uygulandı! %${res.data.indirim_yuzdesi} indirim`);
    } catch (err: any) {
      setKuponMsg('❌ ' + (err.response?.data?.message || 'Geçersiz kupon.'));
    } finally {
      setKuponLoading(false);
    }
  };

  const birimFiyat = eventData?.ucret || 0;
  const araToplam = birimFiyat * katilimciSayisi;
  const indirimTutar = kuponData ? (araToplam * kuponData.indirim_yuzdesi / 100) : 0;
  const finalToplam = (araToplam - indirimTutar).toFixed(2);

  const handleReservation = async () => {
    if (!user.id) { alert('Rezervasyon için giriş yapmalısınız.'); return navigate('/login'); }
    if (katilimciSayisi < 1) return alert('Geçerli bir katılımcı sayısı giriniz.');
    if (katilimciSayisi > eventData.kontenjan) return alert('Yeterli kontenjan bulunmamaktadır.');

    setReserving(true);
    try {
      await axios.post('http://localhost:5000/api/islemler', {
        kullanici_id: user.id,
        etkinlik_id: eventData.id,
        toplam_tutar: finalToplam,
        katilimci_sayisi: katilimciSayisi,
        odeme_yontemi: odemeYontemi,
        kupon_id: kuponData?.id || null,
      });
      setShowResModal(false);
      alert(`Rezervasyon başarılı! ${katilimciSayisi} kişi için yeriniz ayrıldı.`);
      setEventData((prev: any) => ({ ...prev, kontenjan: prev.kontenjan - katilimciSayisi }));
    } catch (err: any) {
      console.error(err);
      setPayError(err.response?.data?.message || 'İşlem başarısız oldu.');
    } finally {
      setReserving(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.id) return navigate('/login');
    if (!reviewForm.metin.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await axios.post('http://localhost:5000/api/yorumlar', {
        kullanici_id: user.id,
        etkinlik_id: Number(id),
        puan: reviewForm.puan,
        metin: reviewForm.metin,
      });
      setReviewForm({ puan: 5, metin: '' });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      fetchReviews();
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Yorum gönderilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (reviewId: number) => {
    if (votingId) return;
    setVotingId(reviewId);
    try {
      const res = await axios.put(`http://localhost:5000/api/yorumlar/${reviewId}/vote`);
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, faydali_oy_sayisi: res.data.faydali_oy_sayisi } : r));
    } catch (e) { console.error(e); }
    finally { setVotingId(null); }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'puan') return b.puan - a.puan;
    if (sortBy === 'faydali') return b.faydali_oy_sayisi - a.faydali_oy_sayisi;
    return new Date(b.tarih).getTime() - new Date(a.tarih).getTime();
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.puan, 0) / reviews.length).toFixed(1) : null;

  const availableSessions = allEvents.filter(e => e.baslik === eventData?.baslik).sort((a, b) => new Date(a.tarih_saat).getTime() - new Date(b.tarih_saat).getTime());

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!eventData) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p>Etkinlik bulunamadı.</p></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/etkinlikler')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
            <ArrowLeft size={20} /> Etkinliklere Dön
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 mt-4 space-y-8">
        {/* Etkinlik Detay Kartı */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 bg-gradient-to-br from-indigo-900 to-slate-900 relative min-h-[400px] flex flex-col items-center justify-center p-8 text-center text-white">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
              <Calendar size={40} className="text-indigo-300" />
            </div>
            <h2 className="text-3xl font-black mb-2">{formatDate(eventData.tarih_saat)}</h2>
            <p className="text-indigo-200 text-xl font-medium">{formatTime(eventData.tarih_saat)}</p>
          </div>

          <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold tracking-wide uppercase">
                {eventData.tur === 'Atölye' ? '🎨 Sanat Atölyesi' : '🏛️ Sergi'}
              </span>
              {eventData.sanatci_adi && (
                <a href={`/sanatci/${eventData.sanatci_id}`} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-2 ml-4">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {eventData.sanatci_adi.charAt(0)}
                  </div>
                  {eventData.sanatci_adi}
                </a>
              )}
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight mt-4 mb-2">{eventData.baslik}</h1>

            {avgRating && (
              <div className="flex items-center gap-2 mb-6">
                <StarRating value={Math.round(parseFloat(avgRating))} readonly />
                <span className="text-sm font-semibold text-amber-500">{avgRating}</span>
                <span className="text-sm text-slate-400">({reviews.length} yorum)</span>
              </div>
            )}

            <p className="text-slate-600 text-lg leading-relaxed mb-8 flex-1">
              {eventData.aciklama || 'Bu etkinlik için henüz detaylı bir açıklama eklenmemiştir.'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Katılım Ücreti</div>
                <div className="text-2xl font-black text-indigo-600">₺{eventData.ucret}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Kalan Kontenjan</div>
                <div className="text-2xl font-black text-emerald-600 flex items-center gap-2">
                  <Users size={20} /> {eventData.kontenjan} <span className="text-base font-medium">Kişi</span>
                </div>
              </div>
            </div>

            {availableSessions.length > 1 && (
              <div className="mb-6 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                <label className="block text-sm font-bold text-purple-700 mb-2">Farklı Bir Oturum Seçin</label>
                <div className="relative">
                  <select
                    value={eventData.id}
                    onChange={(e) => navigate(`/etkinlik/${e.target.value}`)}
                    className="w-full appearance-none pl-4 pr-10 py-3 border border-purple-200 rounded-xl text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm"
                  >
                    {availableSessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {formatDate(session.tarih_saat)} - {formatTime(session.tarih_saat)} (Kalan: {session.kontenjan})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none" />
                </div>
              </div>
            )}

            <button
              onClick={() => setShowResModal(true)}
              disabled={eventData.kontenjan <= 0}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-200 disabled:opacity-50"
            >
              <Ticket size={24} /> {eventData.kontenjan > 0 ? 'Rezervasyon Yap' : 'Kontenjan Dolu'}
            </button>
          </div>
        </div>

        {/* ── YORUMLAR ── */}
        <div className="space-y-6">
          {user.id ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare className="text-indigo-500" size={22} /> Etkinliği Değerlendir
              </h2>
              {/* Katılım zorunluluğu uyarısı */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-sm text-amber-700">
                <CheckCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <span><strong>Not:</strong> Etkinliğe yorum yapabilmek için önce rezervasyon yapmış olmanız gerekmektedir. Rezervasyon yapmadan gönderilen yorumlar reddedilir.</span>
              </div>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Puanınız</label>
                  <StarRating value={reviewForm.puan} onChange={v => setReviewForm(f => ({ ...f, puan: v }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Yorumunuz</label>
                  <textarea rows={3} required value={reviewForm.metin} onChange={e => setReviewForm(f => ({ ...f, metin: e.target.value }))} placeholder="Bu etkinlikle ilgili deneyimlerinizi paylaşın..." className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
                </div>
                {submitError && (
                  <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">
                    <XCircle size={16} className="text-rose-500 mt-0.5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}
                {submitSuccess && <p className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle size={16} /> Yorumunuz başarıyla eklendi!</p>}
                <div className="flex justify-end">
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-300 disabled:opacity-60">
                    <Send size={16} /> {submitting ? 'Gönderiliyor...' : 'Yorum Gönder'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-center">
              <p className="text-slate-600 text-sm">Yorum yapmak için <button onClick={() => navigate('/login')} className="text-indigo-600 font-semibold hover:underline">giriş yapın</button></p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Star className="text-amber-400 fill-amber-400" size={22} /> Yorumlar
                {reviews.length > 0 && <span className="text-sm font-normal text-slate-400">({reviews.length})</span>}
              </h2>
              {reviews.length > 1 && (
                <div className="relative">
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)} className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                    <option value="yeni">En Yeni</option>
                    <option value="puan">En Yüksek Puan</option>
                    <option value="faydali">En Faydalı</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
                <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedReviews.map(review => (
                  <div key={review.id} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(review.ad_soyad || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-slate-800">{review.ad_soyad}</span>
                          {review.dogrulanmis_satin_alma && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              <CheckCircle size={10} /> Doğrulanmış Katılımcı
                            </span>
                          )}
                          <span className="text-xs text-slate-400 ml-auto">{new Date(review.tarih).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <StarRating value={review.puan} readonly />
                        <p className="text-slate-700 text-sm leading-relaxed mt-2">{review.metin}</p>
                        {review.admin_yaniti && (
                          <div className="mt-3 pl-4 border-l-2 border-indigo-200 bg-indigo-50/60 rounded-r-xl p-3">
                            <p className="text-xs font-semibold text-indigo-500 mb-1 flex items-center gap-1"><CheckCircle size={11} /> Organizatör Yanıtı</p>
                            <p className="text-sm text-slate-700">{review.admin_yaniti}</p>
                          </div>
                        )}
                        <button onClick={() => handleVote(review.id)} disabled={votingId === review.id} className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-500 transition-colors disabled:opacity-50">
                          <ThumbsUp size={13} /> Faydalı ({review.faydali_oy_sayisi})
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Rezervasyon Modalı ── */}
      {showResModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
            <button onClick={() => { setShowResModal(false); setKuponData(null); setKuponKod(''); setKuponMsg(''); setPayError(''); }} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>

            <h2 className="text-2xl font-black text-slate-800 mb-1">Rezervasyon Yap</h2>
            <p className="text-slate-500 text-sm mb-6">{eventData.baslik}</p>

            {/* Oturum seçeneği (Modal İçi) */}
            {availableSessions.length > 1 && (
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Oturum (Tarih & Saat)</label>
                <div className="relative">
                  <select
                    value={eventData.id}
                    onChange={(e) => navigate(`/etkinlik/${e.target.value}`)}
                    className="w-full appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                  >
                    {availableSessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {formatDate(session.tarih_saat)} - {formatTime(session.tarih_saat)} (Kalan: {session.kontenjan})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Katılımcı sayısı */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Katılımcı Sayısı</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setKatilimciSayisi(Math.max(1, katilimciSayisi - 1))} className="w-10 h-10 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:border-indigo-400 transition-colors">-</button>
                <span className="text-2xl font-black text-slate-800 w-12 text-center">{katilimciSayisi}</span>
                <button type="button" onClick={() => setKatilimciSayisi(Math.min(eventData.kontenjan, katilimciSayisi + 1))} className="w-10 h-10 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:border-indigo-400 transition-colors">+</button>
                <span className="text-sm text-slate-400">/ Maks. {eventData.kontenjan}</span>
              </div>
            </div>

            {/* Ödeme yöntemi */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ödeme Yöntemi</label>
              <div className="grid grid-cols-3 gap-2">
                {['Online Kredi Kartı', 'Havale/EFT', 'Kapıda Ödeme'].map(y => (
                  <button key={y} type="button" onClick={() => setOdemeYontemi(y)} className={`py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${odemeYontemi === y ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{y}</button>
                ))}
              </div>
            </div>

            {/* Kupon */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">İndirim Kuponu</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={kuponKod} onChange={e => { setKuponKod(e.target.value.toUpperCase()); setKuponData(null); setKuponMsg(''); }} placeholder="KUPON KODU" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <button type="button" onClick={handleKuponUygula} disabled={kuponLoading || !kuponKod.trim()} className="px-4 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50">{kuponLoading ? '...' : 'Uygula'}</button>
              </div>
              {kuponMsg && <p className={`text-xs font-medium mt-1.5 ${kuponMsg.startsWith('✅') ? 'text-emerald-600' : 'text-rose-500'}`}>{kuponMsg}</p>}
            </div>

            {/* Fiyat özeti */}
            <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100 space-y-2">
              <div className="flex justify-between text-sm text-slate-600"><span>Birim Fiyat</span><span>₺{birimFiyat}</span></div>
              <div className="flex justify-between text-sm text-slate-600"><span>Katılımcı</span><span>× {katilimciSayisi}</span></div>
              <div className="flex justify-between text-sm text-slate-600"><span>Ara Toplam</span><span>₺{araToplam.toFixed(2)}</span></div>
              {kuponData && (
                <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                  <span>İndirim (%{kuponData.indirim_yuzdesi})</span>
                  <span>-₺{indirimTutar.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-slate-800 pt-2 border-t border-slate-200">
                <span>Toplam</span>
                <span className="text-indigo-600">₺{finalToplam}</span>
              </div>
            </div>

            {payError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-semibold mb-6 flex items-center gap-2">
                <X size={18} className="shrink-0" />
                <span>{payError}</span>
              </div>
            )}

            <button onClick={handleReservation} disabled={reserving} className="w-full py-4 bg-indigo-600 text-white font-black text-lg rounded-xl hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-200 disabled:opacity-60">
              {reserving ? 'İşleniyor...' : `₺${finalToplam} Öde ve Rezervasyon Yap`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
