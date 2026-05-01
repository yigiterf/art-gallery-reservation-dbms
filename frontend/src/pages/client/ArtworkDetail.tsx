import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Brush, ShieldCheck, Truck, Clock, Heart, Star, ThumbsUp, CheckCircle, MessageSquare, Send } from 'lucide-react';

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

const ArtworkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [art, setArt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

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
      const res = await axios.get(`http://localhost:5000/api/yorumlar/eser/${id}`);
      setReviews(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/eserler')
      .then(res => {
        const found = res.data.find((item: any) => item.id === Number(id));
        setArt(found);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    if (user.id) {
      axios.get(`http://localhost:5000/api/favoriler/kullanici/${user.id}/idler`)
        .then(res => setIsFavorite((res.data as number[]).includes(Number(id))))
        .catch(console.error);
    }

    fetchReviews();
  }, [id]);

  const handlePurchase = async () => {
    if (!user.id) {
      alert('Satın almak için giriş yapmalısınız.');
      return navigate('/login');
    }
    setPurchasing(true);
    try {
      await axios.post('http://localhost:5000/api/islemler', {
        kullanici_id: user.id,
        eser_id: art.id,
        toplam_tutar: art.fiyat,
        katilimci_sayisi: 1,
        odeme_yontemi: 'Kredi Kartı'
      });
      alert('Satın alma başarılı! Eseriniz kargoya verilmek üzere hazırlanıyor.');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      alert('İşlem başarısız oldu.');
    } finally {
      setPurchasing(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user.id) return navigate('/login');
    setFavLoading(true);
    try {
      if (isFavorite) {
        await axios.delete(`http://localhost:5000/api/favoriler/${user.id}/${art.id}`);
        setIsFavorite(false);
      } else {
        await axios.post('http://localhost:5000/api/favoriler', { kullanici_id: user.id, eser_id: art.id });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFavLoading(false);
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
        eser_id: Number(id),
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

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.puan, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!art) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p>Eser bulunamadı.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
            <ArrowLeft size={20} />
            Vitrine Dön
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 mt-4 space-y-8">
        {/* Artwork Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          {/* Görsel */}
          <div className="w-full md:w-1/2 bg-slate-100 relative min-h-[400px]">
            {art.gorsel_url ? (
              <img src={art.gorsel_url} alt={art.baslik} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                <Brush size={80} />
              </div>
            )}
          </div>

          {/* Detaylar */}
          <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                {art.sanatci_adi ? art.sanatci_adi.charAt(0) : 'B'}
              </div>
              <span className="font-semibold text-slate-600">{art.sanatci_adi || 'Bilinmeyen Sanatçı'}</span>
            </div>

            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight mb-2">{art.baslik}</h1>

            {/* Ortalama puan */}
            {avgRating && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating value={Math.round(parseFloat(avgRating))} readonly />
                <span className="text-sm font-semibold text-amber-500">{avgRating}</span>
                <span className="text-sm text-slate-400">({reviews.length} yorum)</span>
              </div>
            )}

            <p className="text-slate-600 text-lg leading-relaxed mb-8 flex-1">
              {art.aciklama || 'Sanatçı bu eser için henüz bir hikaye veya açıklama eklememiştir. Tablonun dili kendi renklerindedir.'}
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Eser Değeri</div>
              <div className="text-4xl font-black text-indigo-600">₺{art.fiyat}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 text-slate-600">
                <ShieldCheck className="text-emerald-500" />
                <span className="text-sm font-medium">Orijinallik Garantisi</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Truck className="text-sky-500" />
                <span className="text-sm font-medium">Ücretsiz Özel Kargo</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Clock className="text-amber-500" />
                <span className="text-sm font-medium">3-5 İş Günü Teslimat</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="flex-1 bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-200 disabled:opacity-50"
              >
                {purchasing ? 'İşleniyor...' : 'Sepete Ekle ve Satın Al'}
              </button>
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                className={`p-4 rounded-xl border-2 transition-all shadow-sm disabled:opacity-60 ${
                  isFavorite
                    ? 'bg-rose-500 border-rose-500 text-white shadow-rose-200 shadow-md'
                    : 'border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-400'
                }`}
                title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              >
                {favLoading ? (
                  <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart size={24} className={isFavorite ? 'fill-white' : ''} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── YORUMLAR BÖLÜMÜ ── */}
        <div className="space-y-6">
          {/* Yorum Yaz Formu */}
          {user.id ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare className="text-indigo-500" size={22} />
                Değerlendirme Yaz
              </h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Puanınız</label>
                  <StarRating
                    value={reviewForm.puan}
                    onChange={v => setReviewForm(f => ({ ...f, puan: v }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Yorumunuz</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewForm.metin}
                    onChange={e => setReviewForm(f => ({ ...f, metin: e.target.value }))}
                    placeholder="Bu eser hakkında düşüncelerinizi paylaşın..."
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
                    type="submit"
                    disabled={submitting}
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
              Yorumlar
              {reviews.length > 0 && (
                <span className="text-sm font-normal text-slate-400">({reviews.length})</span>
              )}
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
                              <CheckCircle size={10} /> Doğrulanmış Alıcı
                            </span>
                          )}
                          <span className="text-xs text-slate-400 ml-auto">
                            {new Date(review.tarih).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <StarRating value={review.puan} readonly />
                        <p className="text-slate-700 text-sm leading-relaxed mt-2">{review.metin}</p>

                        {/* Admin yanıtı */}
                        {review.admin_yaniti && (
                          <div className="mt-3 pl-4 border-l-2 border-indigo-200 bg-indigo-50/60 rounded-r-xl p-3">
                            <p className="text-xs font-semibold text-indigo-500 mb-1 flex items-center gap-1">
                              <CheckCircle size={11} /> Galeri Yanıtı
                            </p>
                            <p className="text-sm text-slate-700">{review.admin_yaniti}</p>
                          </div>
                        )}

                        {/* Faydalı bul */}
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

export default ArtworkDetail;
