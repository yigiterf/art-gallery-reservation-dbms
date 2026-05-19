import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, Search, LogOut, Brush, GitCompare, LifeBuoy, X, ChevronDown, SlidersHorizontal, UserPlus, LogIn } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'yeni', label: 'En Yeni' },
  { value: 'fiyat_asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'fiyat_desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'isim', label: 'İsme Göre (A–Z)' },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Auth
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {};
  const isLoggedIn = !!user.id;

  // ── Filter & Search State ──
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('yeni');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [filterKuponlu, setFilterKuponlu] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    // Herkes eserleri görebilir (login gerekmez)
    axios.get('http://localhost:5000/api/eserler')
      .then(res => setArtworks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Favorileri sadece giriş yapmışlar için çek
    if (isLoggedIn) {
      axios.get(`http://localhost:5000/api/favoriler/kullanici/${user.id}/idler`)
        .then(res => setFavoriteIds(new Set(res.data)))
        .catch(console.error);
    }
  }, []);

  const toggleFavorite = async (e: React.MouseEvent, artId: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!isLoggedIn) return navigate('/login');
    setTogglingId(artId);
    try {
      if (favoriteIds.has(artId)) {
        await axios.delete(`http://localhost:5000/api/favoriler/${user.id}/${artId}`);
        setFavoriteIds(prev => { const s = new Set(prev); s.delete(artId); return s; });
      } else {
        await axios.post('http://localhost:5000/api/favoriler', { kullanici_id: user.id, eser_id: artId });
        setFavoriteIds(prev => new Set(prev).add(artId));
      }
    } catch (err) { console.error(err); }
    finally { setTogglingId(null); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // ── Filtered + Sorted artworks ──
  const filteredArtworks = artworks
    .filter(art => {
      const q = searchQuery.toLocaleLowerCase('tr-TR');
      const matchesSearch = !q ||
        art.baslik?.toLocaleLowerCase('tr-TR').includes(q) ||
        art.sanatci_adi?.toLocaleLowerCase('tr-TR').includes(q);
      const matchesMin = !priceMin || parseFloat(art.fiyat) >= parseFloat(priceMin);
      const matchesMax = !priceMax || parseFloat(art.fiyat) <= parseFloat(priceMax);
      const matchesKupon = !filterKuponlu || art.has_kupon;
      return matchesSearch && matchesMin && matchesMax && matchesKupon;
    })
    .sort((a, b) => {
      if (sortBy === 'fiyat_asc') return parseFloat(a.fiyat) - parseFloat(b.fiyat);
      if (sortBy === 'fiyat_desc') return parseFloat(b.fiyat) - parseFloat(a.fiyat);
      if (sortBy === 'isim') return a.baslik.localeCompare(b.baslik, 'tr');
      return b.id - a.id; // yeni (default)
    });

  const activeFiltersCount = [searchQuery, priceMin, priceMax, filterKuponlu, sortBy !== 'yeni'].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery('');
    setPriceMin('');
    setPriceMax('');
    setFilterKuponlu(false);
    setSortBy('yeni');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-200">A</div>
                <span className="text-xl font-bold tracking-tight text-slate-800">ArtGallery</span>
              </Link>

              <div className="hidden md:flex gap-6 items-center font-medium text-slate-600">
                <Link to="/" className="text-indigo-600 border-b-2 border-indigo-600 pb-1">Eserler</Link>
                <Link to="/etkinlikler" className="hover:text-indigo-600 transition-colors">Etkinlikler</Link>
                {isLoggedIn && (
                  <Link to="/karsilastir" className="hover:text-indigo-600 transition-colors flex items-center gap-1"><GitCompare size={16} />Karşılaştır</Link>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Eser veya sanatçı ara..."
                  className="w-full pl-12 pr-10 py-2.5 bg-slate-100 border-transparent focus:bg-white border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Right side - Auth aware */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <Link to="/favorites" className="p-2 text-slate-500 hover:text-rose-500 transition-colors relative">
                    <Heart size={24} className={favoriteIds.size > 0 ? 'fill-rose-400 text-rose-400' : ''} />
                    {favoriteIds.size > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {favoriteIds.size > 9 ? '9+' : favoriteIds.size}
                      </span>
                    )}
                  </Link>
                  <Link to="/destek" className="p-2 text-slate-500 hover:text-indigo-600 transition-colors" title="Destek">
                    <LifeBuoy size={22} />
                  </Link>
                  {(user.rol === 'satici' || user.rol === 'admin') && (
                    <Link to={user.rol === 'satici' ? "/seller/dashboard" : "/admin"} className="px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      {user.rol === 'satici' ? 'Satıcı Paneli' : 'Admin Paneli'}
                    </Link>
                  )}
                  <Link to="/profile" className="px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium">Profilim</Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-medium transition-colors text-sm">
                    <LogOut size={16} /> Çıkış
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-indigo-600 font-semibold transition-colors text-sm"
                  >
                    <LogIn size={16} /> Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 text-sm"
                  >
                    <UserPlus size={16} /> Üye Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Göz Alan Eserleri Keşfedin</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">Dünyanın dört bir yanından yetenekli sanatçıların özel koleksiyonlarına anında erişin.</p>
          {!isLoggedIn && (
            <div className="flex gap-4 justify-center">
              <Link to="/register" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-500 transition-colors shadow-xl shadow-indigo-900/50">
                Ücretsiz Üye Ol
              </Link>
              <Link to="/login" className="px-8 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm">
                Giriş Yap
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {searchQuery ? `"${searchQuery}" araması` : 'Tüm Eserler'}
            </h2>
            <p className="text-slate-500 mt-0.5 text-sm">
              {loading ? 'Yükleniyor...' : `${filteredArtworks.length} eser bulundu`}
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="ml-2 text-indigo-500 hover:text-indigo-700 font-medium text-xs underline underline-offset-2">
                  Filtreleri temizle ({activeFiltersCount})
                </button>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Filter panel toggle */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border shadow-sm transition-all ${showFilterPanel || (priceMin || priceMax || filterKuponlu) ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-600 bg-white border-slate-200 hover:border-slate-300'}`}
            >
              <SlidersHorizontal size={16} />
              Filtreler
              {(priceMin || priceMax || filterKuponlu) && <span className="w-2 h-2 bg-amber-400 rounded-full"></span>}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Min Fiyat (₺)</label>
              <input
                type="number"
                min="0"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                placeholder="0"
                className="w-32 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Max Fiyat (₺)</label>
              <input
                type="number"
                min="0"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                placeholder="99999"
                className="w-32 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2 pb-2 mr-4">
              <input 
                type="checkbox" 
                id="kuponlu" 
                checked={filterKuponlu} 
                onChange={e => setFilterKuponlu(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 cursor-pointer" 
              />
              <label htmlFor="kuponlu" className="text-sm font-bold text-slate-700 cursor-pointer">Kuponlu Eserler</label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilterPanel(false)}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Filtrele
              </button>
              <button
                onClick={() => { setPriceMin(''); setPriceMax(''); setFilterKuponlu(false); }}
                className="px-4 py-2 text-sm text-slate-500 hover:text-rose-500 font-medium transition-colors"
              >
                Sıfırla
              </button>
            </div>
          </div>
        )}

        {/* Artworks Grid */}
        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredArtworks.map((art) => (
              <Link to={`/eser/${art.id}`} key={art.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group flex flex-col cursor-pointer">
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {art.gorsel_url ? (
                    <img src={art.gorsel_url} alt={art.baslik} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Brush size={48} />
                    </div>
                  )}
                  {art.stok === 0 && (
                    <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg z-10 tracking-widest uppercase">
                      Tükendi
                    </div>
                  )}
                  {art.has_kupon && (
                    <div className={`absolute left-4 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-1 rounded shadow-md z-10 tracking-widest uppercase ${art.stok === 0 ? 'top-14' : 'top-4'}`}>
                      🎟️ Kuponlu
                    </div>
                  )}
                  {isLoggedIn && (
                    <button
                      onClick={(e) => toggleFavorite(e, art.id)}
                      disabled={togglingId === art.id}
                      className={`absolute top-4 right-4 p-2.5 backdrop-blur-md rounded-full transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 disabled:opacity-60 ${
                        favoriteIds.has(art.id)
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-300'
                          : 'bg-white/60 text-slate-600 hover:text-rose-500 hover:bg-white'
                      }`}
                      title={favoriteIds.has(art.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                    >
                      {togglingId === art.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Heart size={18} className={favoriteIds.has(art.id) ? 'fill-white' : ''} />
                      )}
                    </button>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{art.baslik}</h3>
                    <span className="font-black text-indigo-600 shrink-0 ml-2">₺{Number(art.fiyat).toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4 mt-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {art.sanatci_adi ? art.sanatci_adi.charAt(0) : 'B'}
                    </div>
                    <p className="text-sm text-slate-500 font-medium flex-1">{art.sanatci_adi || 'Bilinmeyen Sanatçı'}</p>
                    <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      Stok: {art.stok}
                    </div>
                  </div>
                  <div className="mt-auto pt-2">
                    <button disabled={art.stok === 0} className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-md disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed">
                      {art.stok === 0 ? 'Tükendi' : 'İncele ve Satın Al'}
                    </button>
                  </div>
                </div>
              </Link>
            ))}

            {filteredArtworks.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500">
                <Search size={40} className="mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-semibold text-slate-700 mb-1">
                  {searchQuery ? `"${searchQuery}" için sonuç bulunamadı` : 'Henüz satışta bir eser bulunmuyor.'}
                </p>
                {(searchQuery || priceMin || priceMax) && (
                  <button onClick={clearFilters} className="mt-3 text-indigo-500 font-medium hover:underline">
                    Filtreleri temizle
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
