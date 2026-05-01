import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, MessageSquare, Trash2, Reply, X, CheckCircle } from 'lucide-react';

interface Review {
  id: number;
  kullanici_id: number;
  ad_soyad: string;
  eser_basligi: string | null;
  etkinlik_basligi: string | null;
  puan: number;
  yorum: string;
  tarih: string;
  admin_yaniti: string | null;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/reviews');
      setReviews(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/reviews/${id}`);
        setReviews(reviews.filter(r => r.id !== id));
      } catch {
        alert('Yorum silinirken hata oluştu.');
      }
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTarget) return;
    setSaving(true);
    try {
      await axios.put(`http://localhost:5000/api/admin/reviews/${replyTarget.id}/reply`, {
        admin_yaniti: replyText,
      });
      setReplyTarget(null);
      setReplyText('');
      fetchReviews();
    } catch {
      alert('Yanıt kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const openReply = (review: Review) => {
    setReplyTarget(review);
    setReplyText(review.admin_yaniti || '');
  };

  const StarDisplay: React.FC<{ puan: number }> = ({ puan }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={14}
          className={i <= puan ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Yorum & Değerlendirme Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">Kullanıcı yorumlarını moderasyondan geçirin ve yanıtlayın.</p>
        </div>
        <div className="flex items-center gap-2 bg-violet-50 text-violet-600 border border-violet-100 px-4 py-2 rounded-xl font-semibold">
          <MessageSquare size={18} />
          {reviews.length} Yorum
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm border border-slate-100">Yükleniyor...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm border border-slate-100">Henüz yorum bulunmuyor.</div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                {/* Left: User info & content */}
                <div className="flex gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(review.ad_soyad || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-slate-800">{review.ad_soyad || 'Anonim'}</span>
                      <StarDisplay puan={review.puan || 0} />
                      <span className="text-xs text-slate-400">{new Date(review.tarih).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 mb-2">
                      {review.eser_basligi
                        ? `Eser: ${review.eser_basligi}`
                        : review.etkinlik_basligi
                        ? `Etkinlik: ${review.etkinlik_basligi}`
                        : 'Genel'}
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">{review.yorum}</p>

                    {/* Admin Reply */}
                    {review.admin_yaniti && (
                      <div className="mt-3 pl-4 border-l-2 border-indigo-200 bg-indigo-50/60 rounded-r-xl p-3">
                        <p className="text-xs font-semibold text-indigo-500 mb-1 flex items-center gap-1">
                          <CheckCircle size={12} /> Admin Yanıtı
                        </p>
                        <p className="text-sm text-slate-700">{review.admin_yaniti}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openReply(review)}
                    className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                    title="Yanıtla"
                  >
                    <Reply size={17} />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                    title="Sil"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative">
            <button
              onClick={() => setReplyTarget(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Reply className="text-indigo-500" size={22} /> Admin Yanıtı
            </h2>
            <p className="text-sm text-slate-500 mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">{replyTarget.ad_soyad}:</span>{' '}
              "{replyTarget.yorum}"
            </p>
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={4}
                required
                placeholder="Yanıtınızı buraya yazın..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
              <button
                type="submit" disabled={saving}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-60"
              >
                {saving ? 'Kaydediliyor...' : 'Yanıtı Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
