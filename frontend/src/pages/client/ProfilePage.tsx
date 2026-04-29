import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Package, Ticket, CheckCircle, Clock } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [islemler, setIslemler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id) {
      navigate('/login');
      return;
    }

    axios.get(`http://localhost:5000/api/islemler/kullanici/${user.id}`)
      .then(res => setIslemler(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate, user.id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const eserSiparisleri = islemler.filter(i => i.eser_id !== null);
  const etkinlikRezervasyonlari = islemler.filter(i => i.etkinlik_id !== null);

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
              <Link to="/etkinlikler" className="hover:text-indigo-600 transition-colors">Etkinlikler</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/profile" className="p-2 text-indigo-600 font-medium">
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

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-slate-200 flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold">
            {user.ad_soyad ? user.ad_soyad.charAt(0) : 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{user.ad_soyad}</h1>
            <p className="text-slate-500">{user.email}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Eser Siparişleri */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
                  <Package size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Eser Siparişlerim</h2>
              </div>
              
              {eserSiparisleri.length === 0 ? (
                <p className="text-slate-500 py-4">Henüz bir eser siparişiniz bulunmuyor.</p>
              ) : (
                <div className="space-y-4">
                  {eserSiparisleri.map(islem => (
                    <div key={islem.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
                      {islem.eser_gorsel ? (
                        <img src={islem.eser_gorsel} alt={islem.eser_baslik} className="w-20 h-20 object-cover rounded-xl" />
                      ) : (
                        <div className="w-20 h-20 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">Görsel Yok</div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800">{islem.eser_baslik || 'Silinmiş Eser'}</h3>
                        <p className="text-indigo-600 font-black mb-1">₺{islem.toplam_tutar}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span>{islem.durum}</span>
                          <span className="mx-1">•</span>
                          <Clock size={14} />
                          <span>{formatDate(islem.islem_tarihi)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Etkinlik Rezervasyonları */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                  <Ticket size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Rezervasyonlarım</h2>
              </div>

              {etkinlikRezervasyonlari.length === 0 ? (
                <p className="text-slate-500 py-4">Henüz bir etkinliğe rezervasyon yapmadınız.</p>
              ) : (
                <div className="space-y-4">
                  {etkinlikRezervasyonlari.map(islem => (
                    <div key={islem.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-800">{islem.etkinlik_baslik || 'Bilinmeyen Etkinlik'}</h3>
                        <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                          {islem.katilimci_sayisi} Kişilik
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        Etkinlik Tarihi: <span className="text-slate-800">{islem.etkinlik_tarih ? formatDate(islem.etkinlik_tarih) : '-'}</span>
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50">
                        <div className="text-indigo-600 font-black">₺{islem.toplam_tutar}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span>{islem.durum} ({islem.odeme_yontemi})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
