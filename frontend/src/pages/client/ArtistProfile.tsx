import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Palette, Calendar } from 'lucide-react';

const ArtistProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:5000/api/sanatcilar/${id}/profil`)
      .then(res => setArtist(res.data))
      .catch(err => {
        console.error(err);
        alert('Sanatçı bulunamadı.');
        navigate('/home');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!artist) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar Minimal */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors">
              <ArrowLeft size={20} /> Geri Dön
            </button>
            <Link to="/home" className="text-xl font-black text-slate-800">ArtGallery</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200 mb-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-black text-5xl shadow-inner shrink-0">
            {artist.ad ? artist.ad.charAt(0) : 'S'}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-black text-slate-800 mb-3">{artist.ad}</h1>
            <p className="text-slate-600 text-lg leading-relaxed">{artist.biyografi || 'Bu sanatçı henüz bir biyografi eklememiş.'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Eserleri */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Palette className="text-indigo-600" size={24} />
              <h2 className="text-2xl font-bold text-slate-800">Eserleri ({artist.eserler?.length || 0})</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {artist.eserler?.map((art: any) => (
                <Link to={`/eser/${art.id}`} key={art.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-200 group">
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                     {art.gorsel_url ? (
                        <img src={art.gorsel_url} alt={art.baslik} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">Görsel Yok</div>
                      )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 line-clamp-1">{art.baslik}</h3>
                    <div className="flex justify-between items-center mt-2">
                       <span className="font-bold text-indigo-600">₺{art.fiyat}</span>
                       {art.stok === 0 && <span className="text-xs font-bold bg-rose-100 text-rose-600 px-2 py-1 rounded">Tükendi</span>}
                    </div>
                  </div>
                </Link>
              ))}
              {artist.eserler?.length === 0 && (
                <div className="col-span-full py-10 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                  <p>Henüz eseri bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>

          {/* Etkinlikleri */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="text-indigo-600" size={24} />
              <h2 className="text-2xl font-bold text-slate-800">Etkinlikleri ({artist.etkinlikler?.length || 0})</h2>
            </div>
            <div className="space-y-4">
              {artist.etkinlikler?.map((event: any) => (
                <Link to={`/etkinlik/${event.id}`} key={event.id} className="flex bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-slate-200 items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">{event.baslik}</h3>
                    <p className="text-sm text-slate-500 font-medium">
                      {new Date(event.tarih_saat).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-indigo-600">₺{event.ucret}</div>
                    <div className="text-xs text-slate-500 mt-1">Kontenjan: {event.kontenjan}</div>
                  </div>
                </Link>
              ))}
              {artist.etkinlikler?.length === 0 && (
                <div className="py-10 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                  <p>Planlanmış etkinliği bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArtistProfile;
