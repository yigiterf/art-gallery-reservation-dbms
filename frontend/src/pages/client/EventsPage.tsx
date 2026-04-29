import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, Users, Ticket, Heart, Search, Filter, LogOut } from 'lucide-react';

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState<number | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id) {
      navigate('/login');
      return;
    }

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
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleReservation = async (eventItem: any) => {
    const attendees = prompt(`"${eventItem.baslik}" etkinliği için kaç kişi katılacaksınız? (Birim Fiyat: ₺${eventItem.ucret})`, "1");
    if (!attendees) return;

    const count = parseInt(attendees);
    if (isNaN(count) || count <= 0) {
      return alert('Geçerli bir sayı giriniz.');
    }
    
    if (count > eventItem.kontenjan) {
      return alert('Yeterli kontenjan bulunmamaktadır.');
    }

    setReserving(eventItem.id);
    try {
      await axios.post('http://localhost:5000/api/islemler', {
        kullanici_id: user.id,
        etkinlik_id: eventItem.id,
        toplam_tutar: eventItem.ucret * count,
        katilimci_sayisi: count,
        odeme_yontemi: 'Online Kredi Kartı'
      });
      alert(`Rezervasyon başarılı! ${count} kişi için yeriniz ayrıldı.`);
      // Refresh events to show updated capacity
      const res = await axios.get('http://localhost:5000/api/etkinlikler');
      setEvents(res.data);
      // Opsiyonel olarak profile yönlendirilebilir: navigate('/profile');
    } catch (err) {
      console.error(err);
      alert('İşlem başarısız oldu.');
    } finally {
      setReserving(null);
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
            
            <div className="flex gap-6 hidden md:flex items-center font-medium text-slate-600">
              <Link to="/home" className="hover:text-indigo-600 transition-colors">Eserler</Link>
              <Link to="/etkinlikler" className="text-indigo-600 border-b-2 border-indigo-600 pb-1">Etkinlikler</Link>
            </div>

            <div className="flex-1 max-w-sm mx-8 hidden lg:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Etkinlik ara..."
                  className="w-full pl-12 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
            <p className="text-slate-500 mt-1">Önümüzdeki günlerde planlanan atölye ve sergiler.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 shadow-sm">
            <Filter size={16} />
            Tarihe Göre
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group flex flex-col cursor-pointer">
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-slate-800 line-clamp-2 pr-4">{event.baslik}</h3>
                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold">
                      ₺{event.ucret}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Calendar size={16} />
                      </div>
                      <span className="font-medium">{formatDate(event.tarih_saat)}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock size={16} />
                      </div>
                      <span className="font-medium">{formatTime(event.tarih_saat)}</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Users size={16} />
                      </div>
                      <span className="font-medium">Kontenjan: <span className="text-slate-800 font-bold">{event.kontenjan}</span> Kişi</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-500">
                      Hemen yerinizi ayırtın!
                    </div>
                    <button 
                      onClick={() => handleReservation(event)}
                      disabled={reserving === event.id || event.kontenjan <= 0}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Ticket size={18} />
                      {reserving === event.id ? 'İşleniyor...' : (event.kontenjan > 0 ? 'Rezervasyon Yap' : 'Dolu')}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Etkinlik Bulunamadı</h3>
                <p>Yakın zamanda planlanmış bir atölye veya etkinlik bulunmuyor.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default EventsPage;
