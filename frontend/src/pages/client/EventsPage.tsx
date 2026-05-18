import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, Users, Ticket, Heart, Search, Filter, LogOut, X, Tag, ChevronDown } from 'lucide-react';

type SortOrder = 'asc' | 'desc';

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateSortOrder, setDateSortOrder] = useState<SortOrder>('asc');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ── Rezervasyon Modalı State ──
  const [modalEvent, setModalEvent] = useState<any | null>(null);
  const [katilimci, setKatilimci] = useState(1);
  const [odemeYontemi, setOdemeYontemi] = useState('Online Kredi Kartı');
  const [kuponKod, setKuponKod] = useState('');
  const [kuponData, setKuponData] = useState<{ id: number; indirim_yuzdesi: number } | null>(null);
  const [kuponLoading, setKuponLoading] = useState(false);
  const [kuponMsg, setKuponMsg] = useState('');
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    if (!user.id) { navigate('/login'); return; }
    axios.get('http://localhost:5000/api/etkinlikler')
      .then(res => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  // ── Modal Aç ──
  const openModal = (event: any) => {
    setModalEvent(event);
    setKatilimci(1);
    setOdemeYontemi('Online Kredi Kartı');
    setKuponKod('');
    setKuponData(null);
    setKuponMsg('');
  };

  const closeModal = () => {
    setModalEvent(null);
  };

  // ── Kupon Doğrula ──
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

  // ── Rezervasyon Yap ──
  const handleReservation = async () => {
    if (!modalEvent) return;
    if (katilimci < 1) return alert('Geçerli bir katılımcı sayısı giriniz.');
    if (katilimci > modalEvent.kontenjan) return alert('Yeterli kontenjan bulunmamaktadır.');

    const araToplam = modalEvent.ucret * katilimci;
    const indirim = kuponData ? (araToplam * kuponData.indirim_yuzdesi / 100) : 0;
    const finalToplam = (araToplam - indirim).toFixed(2);

    setReserving(true);
    try {
      await axios.post('http://localhost:5000/api/islemler', {
        kullanici_id: user.id,
        etkinlik_id: modalEvent.id,
        toplam_tutar: finalToplam,
        katilimci_sayisi: katilimci,
        odeme_yontemi: odemeYontemi,
        kupon_id: kuponData?.id || null,
      });
      closeModal();
      alert(`Rezervasyon başarılı! ${katilimci} kişi için yeriniz ayrıldı.`);
      // Kontenjanı güncelle
      const res = await axios.get('http://localhost:5000/api/etkinlikler');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
      alert('İşlem başarısız oldu.');
    } finally {
      setReserving(false);
    }
  };

  // ── Filtrelenmiş Etkinlikler ──
  const filteredEvents = events.filter(e =>
    e.baslik.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR'))
  ).sort((a, b) => {
    const timeA = new Date(a.tarih_saat).getTime();
    const timeB = new Date(b.tarih_saat).getTime();
    return dateSortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  // ── Fiyat Hesaplama ──
  const araToplam = modalEvent ? modalEvent.ucret * katilimci : 0;
  const indirimTutar = kuponData ? (araToplam * kuponData.indirim_yuzdesi / 100) : 0;
  const finalToplam = (araToplam - indirimTutar).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/home" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-200">A</div>
              <span className="text-xl font-bold tracking-tight text-slate-800">ArtGallery</span>
            </Link>

            <div className="flex gap-6 hidden md:flex items-center font-medium text-slate-600">
              <Link to="/home" className="hover:text-indigo-600 transition-colors">Eserler</Link>
              <Link to="/etkinlikler" className="text-indigo-600 border-b-2 border-indigo-600 pb-1">Etkinlikler</Link>
            </div>

            <div className="flex-1 max-w-sm mx-8 hidden lg:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Etkinlik ara..."
                  className="w-full pl-12 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/favorites" className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                <Heart size={24} />
              </Link>
              {(user.rol === 'satici' || user.rol === 'admin') && (
                <Link to={user.rol === 'satici' ? "/seller/dashboard" : "/admin"} className="p-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
                  {user.rol === 'satici' ? 'Satıcı Paneli' : 'Admin Paneli'}
                </Link>
              )}
              <Link to="/profile" className="p-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">Profilim</Link>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-medium transition-colors">
                <LogOut size={18} /> Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Yaratıcılığınızı Keşfedin</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">Uzman sanatçılar eşliğinde atölyelere katılın, sanat dolu etkinliklerde yerinizi ayırtın. Sınırlı kontenjanları kaçırmayın!</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Yaklaşan Etkinlikler</h2>
            <p className="text-slate-500 mt-1">
              {filteredEvents.length} etkinlik bulundu
              {searchQuery && ` — "${searchQuery}" araması`}
            </p>
          </div>
          <button 
            onClick={() => setDateSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 shadow-sm">
            <Filter size={16} /> Tarihe Göre ({dateSortOrder === 'asc' ? 'Yakın' : 'Uzak'})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group flex flex-col">
                <Link to={`/etkinlik/${event.id}`} className="p-6 flex flex-col flex-1 cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-slate-800 line-clamp-2 pr-4">{event.baslik}</h3>
                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold shrink-0">₺{event.ucret}</div>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Calendar size={16} /></div>
                      <span className="font-medium text-sm">{formatDate(event.tarih_saat)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><Clock size={16} /></div>
                      <span className="font-medium">{formatTime(event.tarih_saat)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Users size={16} /></div>
                      <span className="font-medium">
                        Kontenjan: <span className={`font-bold ${event.kontenjan <= 5 && event.kontenjan > 0 ? 'text-amber-600' : event.kontenjan === 0 ? 'text-rose-500' : 'text-slate-800'}`}>{event.kontenjan}</span> Kişi
                        {event.kontenjan <= 5 && event.kontenjan > 0 && <span className="ml-1 text-xs text-amber-500 font-semibold">Son yerler!</span>}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="p-6 pt-0 mt-auto border-t border-slate-100 flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-500">Hemen yerinizi ayırtın!</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); openModal(event); }}
                    disabled={event.kontenjan <= 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Ticket size={18} />
                    {event.kontenjan > 0 ? 'Rezervasyon Yap' : 'Dolu'}
                  </button>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Etkinlik Bulunamadı</h3>
                <p>{searchQuery ? `"${searchQuery}" için sonuç yok.` : 'Yakın zamanda planlanmış bir atölye veya etkinlik bulunmuyor.'}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Rezervasyon Modalı ── */}
      {modalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={closeModal} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black text-slate-800 mb-1">Rezervasyon Yap</h2>
            <p className="text-slate-500 text-sm mb-6 line-clamp-1">{modalEvent.baslik}</p>

            {/* Katılımcı sayısı */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Katılımcı Sayısı</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setKatilimci(Math.max(1, katilimci - 1))}
                  className="w-10 h-10 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-lg"
                >−</button>
                <span className="text-2xl font-black text-slate-800 w-12 text-center">{katilimci}</span>
                <button
                  type="button"
                  onClick={() => setKatilimci(Math.min(modalEvent.kontenjan, katilimci + 1))}
                  className="w-10 h-10 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-lg"
                >+</button>
                <span className="text-sm text-slate-400">/ Maks. <b>{modalEvent.kontenjan}</b></span>
              </div>
            </div>

            {/* Ödeme yöntemi */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ödeme Yöntemi</label>
              <div className="grid grid-cols-3 gap-2">
                {['Online Kredi Kartı', 'Havale/EFT', 'Kapıda Ödeme'].map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setOdemeYontemi(y)}
                    className={`py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all text-center leading-tight ${odemeYontemi === y ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Kupon kodu */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">İndirim Kuponu <span className="text-slate-400 font-normal">(opsiyonel)</span></label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={kuponKod}
                    onChange={e => { setKuponKod(e.target.value.toUpperCase()); setKuponData(null); setKuponMsg(''); }}
                    placeholder="KUPON KODU"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleKuponUygula}
                  disabled={kuponLoading || !kuponKod.trim()}
                  className="px-4 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {kuponLoading ? '...' : 'Uygula'}
                </button>
              </div>
              {kuponMsg && (
                <p className={`text-xs font-medium mt-1.5 ${kuponMsg.startsWith('✅') ? 'text-emerald-600' : 'text-rose-500'}`}>{kuponMsg}</p>
              )}
            </div>

            {/* Fiyat özeti */}
            <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Birim Fiyat</span><span>₺{modalEvent.ucret}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Katılımcı</span><span>× {katilimci}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Ara Toplam</span><span>₺{araToplam.toFixed(2)}</span>
              </div>
              {kuponData && (
                <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                  <span>İndirim (%{kuponData.indirim_yuzdesi})</span>
                  <span>−₺{indirimTutar.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-black text-slate-800 pt-2 border-t border-slate-200">
                <span>Toplam</span>
                <span className="text-indigo-600">₺{finalToplam}</span>
              </div>
            </div>

            <button
              onClick={handleReservation}
              disabled={reserving}
              className="w-full py-4 bg-indigo-600 text-white font-black text-lg rounded-xl hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-200 disabled:opacity-60"
            >
              {reserving ? 'İşleniyor...' : `₺${finalToplam} Öde ve Rezerve Et`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
