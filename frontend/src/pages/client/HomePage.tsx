import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, Search, Filter, LogOut, Brush } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if customer
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login');
      return;
    }

    axios.get('http://localhost:5000/api/eserler')
      .then(res => setArtworks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
            
            <div className="flex gap-6 hidden md:flex items-center font-medium text-slate-600">
              <Link to="/home" className="text-indigo-600 border-b-2 border-indigo-600 pb-1">Eserler</Link>
              <Link to="/etkinlikler" className="hover:text-indigo-600 transition-colors">Etkinlikler</Link>
            </div>
            
            <div className="flex-1 max-w-xl mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Eser veya sanatçı ara..."
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-500 hover:text-indigo-600 transition-colors">
                <Heart size={24} />
              </button>
              <Link to="/profile" className="p-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
                Profilim
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-medium transition-colors">
                <LogOut size={18} />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Göz Alan Eserleri Keşfedin</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">Dünyanın dört bir yanından yetenekli sanatçıların özel koleksiyonlarına anında erişin. Hemen favorilerinize ekleyin, satın alın.</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Yeni Eklenenler</h2>
            <p className="text-slate-500 mt-1">Galeriye yeni katılan göz alıcı parçalar.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 shadow-sm">
            <Filter size={16} />
            Filtrele
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {artworks.map((art) => (
              <Link to={`/eser/${art.id}`} key={art.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group flex flex-col cursor-pointer">
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {art.gorsel_url ? (
                    <img src={art.gorsel_url} alt={art.baslik} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Brush size={48} />
                    </div>
                  )}
                  <button onClick={(e) => { e.preventDefault(); /* Favori ekleme mantigi buraya eklenebilir */ }} className="absolute top-4 right-4 p-2.5 bg-white/50 backdrop-blur-md rounded-full text-slate-600 hover:text-rose-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                    <Heart size={20} />
                  </button>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{art.baslik}</h3>
                    <span className="font-black text-indigo-600">₺{art.fiyat}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 mt-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {art.sanatci_adi ? art.sanatci_adi.charAt(0) : 'B'}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">{art.sanatci_adi || 'Bilinmeyen Sanatçı'}</p>
                  </div>
                  
                  <div className="mt-auto pt-2">
                    <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-md">
                      İncele ve Satın Al
                    </button>
                  </div>
                </div>
              </Link>
            ))}

            {artworks.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500">
                <p>Henüz satışta bir eser bulunmuyor.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
