import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, ArrowLeft, Brush, ShoppingBag } from 'lucide-react';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    if (!user.id) return navigate('/login');
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/favoriler/kullanici/${user.id}`);
      setFavorites(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (eserId: number) => {
    setRemoving(eserId);
    try {
      await axios.delete(`http://localhost:5000/api/favoriler/${user.id}/${eserId}`);
      setFavorites(prev => prev.filter(f => f.id !== eserId));
    } catch (e) {
      alert('Favoriden çıkarılırken hata oluştu.');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/home" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-200">
                A
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">ArtGallery</span>
            </Link>
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
            >
              <ArrowLeft size={18} />
              Vitrine Dön
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-100 border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 py-12 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-300">
            <Heart size={32} className="fill-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800">Favorilerim</h1>
            <p className="text-slate-500 mt-1">Beğendiğiniz ve kaydettiğiniz sanat eserleri.</p>
          </div>
          <div className="ml-auto bg-white px-5 py-2.5 rounded-full shadow-sm border border-rose-100 text-rose-600 font-bold">
            {favorites.length} Eser
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-rose-50 rounded-3xl flex items-center justify-center mb-6 border border-rose-100">
              <Heart size={48} className="text-rose-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Henüz favoriniz yok</h2>
            <p className="text-slate-400 max-w-sm mb-8">
              Eserler sayfasındaki kalp ikonuna tıklayarak sevdiğiniz eserleri buraya ekleyin.
            </p>
            <Link
              to="/home"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-300"
            >
              <ShoppingBag size={18} />
              Eserleri Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favorites.map(art => (
              <div
                key={art.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group flex flex-col"
              >
                {/* Image */}
                <Link to={`/eser/${art.id}`} className="aspect-[4/3] bg-slate-100 relative overflow-hidden block">
                  {art.gorsel_url ? (
                    <img
                      src={art.gorsel_url}
                      alt={art.baslik}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Brush size={48} />
                    </div>
                  )}
                  {/* Overlay heart (remove) button */}
                  <button
                    onClick={() => handleRemove(art.id)}
                    disabled={removing === art.id}
                    className="absolute top-3 right-3 p-2.5 bg-rose-500 rounded-full text-white shadow-lg hover:bg-rose-600 transition-all active:scale-90 disabled:opacity-60"
                    title="Favorilerden Çıkar"
                  >
                    {removing === art.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Heart size={18} className="fill-white" />
                    )}
                  </button>
                </Link>

                {/* Details */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{art.baslik}</h3>
                    <span className="font-black text-indigo-600 shrink-0 ml-2">₺{art.fiyat}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4 mt-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {art.sanatci_adi ? art.sanatci_adi.charAt(0) : 'B'}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">{art.sanatci_adi || 'Bilinmeyen Sanatçı'}</p>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <Link
                      to={`/eser/${art.id}`}
                      className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors text-center text-sm"
                    >
                      İncele ve Satın Al
                    </Link>
                    <button
                      onClick={() => handleRemove(art.id)}
                      disabled={removing === art.id}
                      className="p-2.5 border border-rose-100 text-rose-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-colors disabled:opacity-50"
                      title="Favorilerden Çıkar"
                    >
                      <Heart size={18} className="fill-rose-300" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
