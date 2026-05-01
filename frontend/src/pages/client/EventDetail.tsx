import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Clock, Users, Ticket, Star, MessageSquare, Send, CheckCircle, ThumbsUp } from 'lucide-react';

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

const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; readonly?: boolean }> = ({ value, onChange, readonly }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <button
        key={i}
        type="button"
        disabled={readonly}
        onClick={() => onChange && onChange(i)}
        className={`transition-colors ${readonly ? 'cursor-default' : 'hover:scale-110 active:scale-95'}`}
      >
        <Star
          size={readonly ? 14 : 22}
          className={i <= value
            ? 'text-amber-400 fill-amber-400'
            : readonly ? 'text-slate-200 fill-slate-200' : 'text-slate-300 fill-slate-300 hover:text-amber-300'}
        />
      </button>
    ))}
  </div>
);

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ puan: 5, metin: '' });
  const [submitting, setSubmitting] = useState(false);
  const [votingId, setVotingId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/yorumlar/etkinlik/${id}`);
      setReviews(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/etkinlikler')
      .then(res => {
        const found = res.data.find((item: any) => item.id === Number(id));
        setEventData(found);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchReviews();
  }, [id]);

  const handleReservation = async () => {
    if (!user.id) {
      alert('Rezervasyon için giriş yapmalısınız.');
      return navigate('/login');
    }

    const attendees = prompt(`"${eventData.baslik}" etkinliği için kaç kişi katılacaksınız? (Birim Fiyat: ₺${eventData.ucret})`, "1");
    if (!attendees) return;

    const count = parseInt(attendees);
    if (isNaN(count) || count <= 0) return alert('Geçerli bir sayı giriniz.');
    if (count > eventData.kontenjan) return alert('Yeterli kontenjan bulunmamaktadır.');

    setReserving(true);
    try {
      await axios.post('http://localhost:5000/api/islemler', {
        kullanici_id: user.id,
        etkinlik_id: eventData.id,
        toplam_tutar: eventData.ucret * count,
        katilimci_sayisi: count,
        odeme_yontemi: 'Online Kredi Kartı'
      });
      alert(`Rezervasyon başarılı! ${count} kişi için yeriniz ayrıldı.`);
      // Update local quota
      setEventData(prev => ({ ...prev, kontenjan: prev.kontenjan - count }));
    } catch (err) {
      console.error(err);
      alert('İşlem başarısız oldu.');
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
      setReviews(prev => prev.map(r => r.id === reviewId
        ? { ...r, faydali_oy_sayisi: res.data.faydali_oy_sayisi }
        : r
      ));
    } catch (e) {
      console.error(e);
    } finally {
      setVotingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.puan, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!eventData) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p>Etkinlik bulunamadı.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/etkinlikler')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
            <ArrowLeft size={20} />
            Etkinliklere Dön
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
            <div className="mb-2">
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold tracking-wide uppercase">
                {eventData.tur === 'Atölye' ? '🎨 Sanat Atölyesi' : '🏛️ Sergi'}
              </span>
            </div>

            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight mt-4 mb-2">
              {eventData.baslik}
            </h1>

            {avgRating && (
              <div className="flex items-center gap-2 mb-6">
                <StarRating value={Math.round(parseFloat(avgRating))} readonly />
                <span className="text-sm font-semibold text-amber-500">{avgRating}</span>
                <span className="text-sm text-slate-400">({reviews.length} yorum)</span>
              </div>
            )}

            <p className="text-slate-600 text-lg leading-relaxed mb-8 flex-1">
              {eventData.aciklama || 'Bu etkinlik için henüz detaylı bir açıklama eklenmemiştir. Ancak sanat dolu harika bir deneyim olacağından emin olabilirsiniz!'}
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

            <button
              onClick={handleReservation}
              disabled={reserving || eventData.kontenjan <= 0}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-200 disabled:opacity-50"
            >
              <Ticket size={24} />
              {reserving ? 'İşleniyor...' : (eventData.kontenjan > 0 ? 'Hemen Rezervasyon Yap' : 'Kontenjan Dolu')}
            </button>
          </div>
        </div>

        {/* ── YORUMLAR BÖLÜMÜ ── */}
        <div className="space-y-6">
          {/* Yorum Yaz Formu */}
          {user.id ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare className="text-indigo-500" size={22} />
                Etkinliği Değerlendir
              </h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Puanınız</label>
                  <StarRating value={reviewForm.puan} onChange={v => setReviewForm(f => ({ ...f, puan: v }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Yorumunuz</label>
                  <textarea
                    rows={3} required value={reviewForm.metin}
                    onChange={e => setReviewForm(f => ({ ...f, metin: e.target.value }))}
                    placeholder="Bu etkinlikle ilgili deneyimlerinizi paylaşın..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  />
                </div>
                {submitError && <p className="text-sm text-rose-500">{submitError}</p>}
                {submitSuccess && (
                  <p className="text-sm text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={16} /> Yorumunuz başarıyla eklendi!
                  </p>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit" disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-300 disabled:opacity-60"
                  >
                    <Send size={16} />
                    {submitting ? 'Gönderiliyor...' : 'Yorum Gönder'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-center">
              <p className="text-slate-600 text-sm">
                Yorum yapmak için{' '}
                <button onClick={() => navigate('/login')} className="text-indigo-600 font-semibold hover:underline">
                  giriş yapın
                </button>
              </p>
            </div>
          )}

          {/* Yorumlar Listesi */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Star className="text-amber-400 fill-amber-400" size={22} />
              Yorumlar {reviews.length > 0 && <span className="text-sm font-normal text-slate-400">({reviews.length})</span>}
            </h2>

            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
                <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
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
                          <span className="text-xs text-slate-400 ml-auto">
                            {new Date(review.tarih).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <StarRating value={review.puan} readonly />
                        <p className="text-slate-700 text-sm leading-relaxed mt-2">{review.metin}</p>

                        {review.admin_yaniti && (
                          <div className="mt-3 pl-4 border-l-2 border-indigo-200 bg-indigo-50/60 rounded-r-xl p-3">
                            <p className="text-xs font-semibold text-indigo-500 mb-1 flex items-center gap-1">
                              <CheckCircle size={11} /> Organizatör Yanıtı
                            </p>
                            <p className="text-sm text-slate-700">{review.admin_yaniti}</p>
                          </div>
                        )}

                        <button
                          onClick={() => handleVote(review.id)}
                          disabled={votingId === review.id}
                          className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
                        >
                          <ThumbsUp size={13} />
                          Faydalı ({review.faydali_oy_sayisi})
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
    </div>
  );
};

export default EventDetail;
