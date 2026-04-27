import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Brush, ShieldCheck, Truck, Clock } from 'lucide-react';

const ArtworkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [art, setArt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Eserleri çek, içlerinden eşleşeni bul. Normalde id bazlı backend endpoint'i olur
    // Ödev/prototip mantığı için genel veriden filtreleyebilir veya özel id ile alabiliriz.
    // Şimdilik liste çekip filtreliyorum. İleride GET /api/eserler/:id yapılabilir.
    axios.get('http://localhost:5000/api/eserler')
      .then(res => {
        const found = res.data.find((item: any) => item.id === Number(id));
        setArt(found);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!art) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p>Eser bulunamadı.</p></div>;
  }

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

      <div className="max-w-6xl mx-auto px-4 py-8 mt-4">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          {/* Eser Görseli */}
          <div className="w-full md:w-1/2 bg-slate-100 relative min-h-[400px]">
             {art.gorsel_url ? (
               <img src={art.gorsel_url} alt={art.baslik} className="absolute inset-0 w-full h-full object-cover" />
             ) : (
               <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                 <Brush size={80} />
               </div>
             )}
          </div>

          {/* Eser Detayları */}
          <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col">
             <div className="mb-2 flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                 {art.sanatci_adi ? art.sanatci_adi.charAt(0) : 'B'}
               </div>
               <span className="font-semibold text-slate-600">{art.sanatci_adi || 'Bilinmeyen Sanatçı'}</span>
             </div>

             <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight mb-4">{art.baslik}</h1>
             
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

             <button className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-200">
               Sepete Ekle ve Satın Al
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;
