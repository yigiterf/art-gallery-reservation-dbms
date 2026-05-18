import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  LogOut, Package, Ticket, CheckCircle, Clock, XCircle, Edit2, Save,
  X, Lock, User, LifeBuoy, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [islemler, setIslemler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ── Rezervasyon yönetimi ──
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [editKatilimci, setEditKatilimci] = useState<{ [id: number]: number }>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // ── Profil düzenleme ──
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ ad_soyad: user.ad_soyad || '', email: user.email || '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // ── Şifre değiştirme ──
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ eski_sifre: '', yeni_sifre: '', tekrar: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const fetchIslemler = async () => {
    if (!user.id) { navigate('/login'); return; }
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/islemler/kullanici/${user.id}`);
      setIslemler(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!user.id) { navigate('/login'); return; }
    fetchIslemler();
  }, [navigate, user.id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // ─── Rezervasyon iptal ───
  const handleCancel = async (id: number) => {
    if (!window.confirm('Bu rezervasyonu iptal etmek istediğinize emin misiniz? Kontenjan geri verilecektir.')) return;
    setCancellingId(id);
    try {
      await axios.put(`http://localhost:5000/api/islemler/${id}/iptal`);
      await fetchIslemler();
    } catch (err: any) {
      alert(err.response?.data?.message || 'İptal başarısız.');
    } finally {
      setCancellingId(null);
    }
  };

  // ─── Rezervasyon güncelleme ───
  const handleUpdate = async (id: number) => {
    const yeni = editKatilimci[id];
    if (!yeni || yeni < 1) return alert('Geçerli bir katılımcı sayısı giriniz.');
    setUpdatingId(id);
    try {
      const res = await axios.put(`http://localhost:5000/api/islemler/${id}/guncelle`, { yeni_katilimci_sayisi: yeni });
      alert(`Rezervasyon güncellendi! Yeni tutar: ₺${res.data.yeni_tutar}`);
      setExpandedId(null);
      await fetchIslemler();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Güncelleme başarısız.');
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── Profil güncelleme ───
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const res = await axios.put(`http://localhost:5000/api/auth/profil/${user.id}`, profileForm);
      const updatedUser = { ...user, ad_soyad: profileForm.ad_soyad, email: profileForm.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileMsg('✅ Bilgiler güncellendi!');
      setTimeout(() => { setShowProfileEdit(false); setProfileMsg(''); window.location.reload(); }, 1500);
    } catch (err: any) {
      setProfileMsg(err.response?.data?.message || '❌ Güncelleme başarısız.');
    } finally {
      setProfileSaving(false);
    }
  };

  // ─── Şifre değiştirme ───
  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.yeni_sifre !== pwForm.tekrar) return setPwMsg('❌ Şifreler eşleşmiyor.');
    if (pwForm.yeni_sifre.length < 6) return setPwMsg('❌ Yeni şifre en az 6 karakter olmalı.');
    setPwSaving(true);
    setPwMsg('');
    try {
      await axios.put(`http://localhost:5000/api/auth/sifre/${user.id}`, {
        eski_sifre: pwForm.eski_sifre,
        yeni_sifre: pwForm.yeni_sifre,
      });
      setPwMsg('✅ Şifre başarıyla değiştirildi!');
      setTimeout(() => { setShowPasswordForm(false); setPwMsg(''); setPwForm({ eski_sifre: '', yeni_sifre: '', tekrar: '' }); }, 2000);
    } catch (err: any) {
      setPwMsg(err.response?.data?.message || '❌ Şifre değiştirilemedi.');
    } finally {
      setPwSaving(false);
    }
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
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-200">A</div>
              <span className="text-xl font-bold tracking-tight text-slate-800">ArtGallery</span>
            </Link>
            <div className="flex gap-4 items-center">
              <Link to="/home" className="hidden md:block text-slate-600 hover:text-indigo-600 font-medium transition-colors">Eserler</Link>
              <Link to="/etkinlikler" className="hidden md:block text-slate-600 hover:text-indigo-600 font-medium transition-colors">Etkinlikler</Link>
              <Link to="/destek" className="hidden md:block text-slate-600 hover:text-indigo-600 font-medium transition-colors flex items-center gap-1">
                <LifeBuoy size={16} /> Destek
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-medium transition-colors">
                <LogOut size={18} /> Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">

        {/* ── Profil Kartı ── */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
              {user.ad_soyad ? user.ad_soyad.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800">{user.ad_soyad}</h1>
              <p className="text-slate-500">{user.email}</p>
              <span className="mt-1 inline-block text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full capitalize">{user.rol || 'kullanıcı'}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowProfileEdit(!showProfileEdit)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-all font-medium text-sm"
              >
                <Edit2 size={15} /> Bilgileri Düzenle
              </button>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:border-rose-400 hover:text-rose-600 transition-all font-medium text-sm"
              >
                <Lock size={15} /> Şifre Değiştir
              </button>
            </div>
          </div>

          {/* ── Profil Düzenleme Formu ── */}
          {showProfileEdit && (
            <form onSubmit={handleProfileSave} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2"><User size={18} className="text-indigo-500" /> Bilgileri Güncelle</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Ad Soyad</label>
                  <input
                    type="text" required value={profileForm.ad_soyad}
                    onChange={e => setProfileForm(f => ({ ...f, ad_soyad: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta</label>
                  <input
                    type="email" required value={profileForm.email}
                    onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
              {profileMsg && <p className={`text-sm font-medium ${profileMsg.startsWith('✅') ? 'text-emerald-600' : 'text-rose-500'}`}>{profileMsg}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={profileSaving} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-60 text-sm">
                  <Save size={16} /> {profileSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button type="button" onClick={() => setShowProfileEdit(false)} className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all text-sm">
                  <X size={16} /> Vazgeç
                </button>
              </div>
            </form>
          )}

          {/* ── Şifre Değiştirme Formu ── */}
          {showPasswordForm && (
            <form onSubmit={handlePwChange} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2"><Lock size={18} className="text-rose-500" /> Şifre Değiştir</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Mevcut Şifre', key: 'eski_sifre' },
                  { label: 'Yeni Şifre', key: 'yeni_sifre' },
                  { label: 'Yeni Şifre (Tekrar)', key: 'tekrar' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
                    <input
                      type="password" required minLength={key === 'eski_sifre' ? 1 : 6}
                      value={(pwForm as any)[key]}
                      onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                    />
                  </div>
                ))}
              </div>
              {pwMsg && <p className={`text-sm font-medium ${pwMsg.startsWith('✅') ? 'text-emerald-600' : 'text-rose-500'}`}>{pwMsg}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={pwSaving} className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-all disabled:opacity-60 text-sm">
                  <Lock size={16} /> {pwSaving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                </button>
                <button type="button" onClick={() => setShowPasswordForm(false)} className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all text-sm">
                  <X size={16} /> Vazgeç
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── İşlemler ── */}
        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Eser Siparişleri */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-3 bg-rose-50 text-rose-500 rounded-xl"><Package size={24} /></div>
                <h2 className="text-2xl font-bold text-slate-800">Eser Siparişlerim</h2>
              </div>
              {eserSiparisleri.length === 0 ? (
                <p className="text-slate-500 py-4">Henüz bir eser siparişiniz bulunmuyor.</p>
              ) : (
                <div className="space-y-4">
                  {eserSiparisleri.map(islem => (
                    <div key={islem.id} className={`p-4 rounded-2xl border flex gap-4 transition-all ${islem.durum === 'İptal Edildi' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-slate-50 border-slate-100'}`}>
                      {islem.eser_gorsel ? (
                        <img src={islem.eser_gorsel} alt={islem.eser_baslik} className="w-20 h-20 object-cover rounded-xl" />
                      ) : (
                        <div className="w-20 h-20 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">Görsel Yok</div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800">{islem.eser_baslik || 'Silinmiş Eser'}</h3>
                        <p className="text-indigo-600 font-black mb-1">₺{islem.toplam_tutar}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {islem.durum === 'İptal Edildi'
                            ? <XCircle size={14} className="text-rose-400" />
                            : <CheckCircle size={14} className="text-emerald-500" />}
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
                <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><Ticket size={24} /></div>
                <h2 className="text-2xl font-bold text-slate-800">Rezervasyonlarım</h2>
              </div>
              {etkinlikRezervasyonlari.length === 0 ? (
                <p className="text-slate-500 py-4">Henüz bir etkinliğe rezervasyon yapmadınız.</p>
              ) : (
                <div className="space-y-4">
                  {etkinlikRezervasyonlari.map(islem => (
                    <div key={islem.id} className={`rounded-2xl border overflow-hidden transition-all ${islem.durum === 'İptal Edildi' ? 'opacity-60 border-slate-100' : 'border-slate-100'}`}>
                      <div className="p-4 bg-slate-50">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-800 text-sm">{islem.etkinlik_baslik || 'Bilinmeyen Etkinlik'}</h3>
                          <div className={`px-2 py-0.5 rounded text-xs font-bold ${islem.durum === 'İptal Edildi' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-700'}`}>
                            {islem.katilimci_sayisi} Kişilik
                          </div>
                        </div>
                        <p className="text-xs font-medium text-slate-600 mb-2">
                          Etkinlik: <span className="text-slate-800">{islem.etkinlik_tarih ? formatDate(islem.etkinlik_tarih) : '-'}</span>
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-indigo-600 font-black text-sm">₺{islem.toplam_tutar}</div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            {islem.durum === 'İptal Edildi'
                              ? <XCircle size={13} className="text-rose-400" />
                              : <CheckCircle size={13} className="text-emerald-500" />}
                            <span>{islem.durum}</span>
                          </div>
                        </div>

                        {/* Aksiyon butonları — sadece aktif rezervasyonlar */}
                        {islem.durum !== 'İptal Edildi' && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                            <button
                              onClick={() => setExpandedId(expandedId === islem.id ? null : islem.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                              <Edit2 size={12} /> Kişi Güncelle
                              {expandedId === islem.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                            <button
                              onClick={() => handleCancel(islem.id)}
                              disabled={cancellingId === islem.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                            >
                              {cancellingId === islem.id ? (
                                <div className="w-3 h-3 border border-rose-600 border-t-transparent rounded-full animate-spin" />
                              ) : <XCircle size={12} />}
                              İptal Et
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Katılımcı güncelleme paneli */}
                      {expandedId === islem.id && islem.durum !== 'İptal Edildi' && (
                        <div className="px-4 py-3 bg-indigo-50 border-t border-indigo-100 flex items-center gap-3">
                          <AlertTriangle size={14} className="text-indigo-400 shrink-0" />
                          <label className="text-xs text-slate-600 font-medium whitespace-nowrap">Yeni katılımcı sayısı:</label>
                          <input
                            type="number" min="1" max="50"
                            defaultValue={islem.katilimci_sayisi}
                            onChange={e => setEditKatilimci(prev => ({ ...prev, [islem.id]: parseInt(e.target.value) }))}
                            className="w-20 px-2 py-1.5 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => handleUpdate(islem.id)}
                            disabled={updatingId === islem.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                          >
                            <Save size={12} /> {updatingId === islem.id ? '...' : 'Kaydet'}
                          </button>
                        </div>
                      )}
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
