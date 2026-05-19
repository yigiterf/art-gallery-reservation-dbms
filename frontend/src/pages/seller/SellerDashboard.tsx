import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogOut, ImagePlus, UserCircle, Send, LayoutDashboard, UploadCloud, CalendarPlus, BarChart3, HelpCircle, AlertCircle, Home } from 'lucide-react';

const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'yayinla' | 'eserlerim' | 'etkinlik' | 'etkinliklerim' | 'siparisler' | 'analiz' | 'destek'>('yayinla');
  
  // Eser States
  const [form, setForm] = useState({ baslik: '', aciklama: '', fiyat: '', stok: '1' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [myArtworks, setMyArtworks] = useState<any[]>([]);
  
  // Etkinlik States
  const [etkinlikForm, setEtkinlikForm] = useState({ baslik: '', ucret: '', kontenjan: '' });
  const [tarihler, setTarihler] = useState<string[]>(['']);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);

  // Analiz States
  const [istatistikler, setIstatistikler] = useState({ etkinlikler: [], analiz: [] });
  
  // Destek States
  const [destekForm, setDestekForm] = useState({ konu: '', mesaj: '' });
  const [taleplerim, setTaleplerim] = useState<any[]>([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Sadece ilk Component did mount
  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(rawUser);
    if (parsedUser.rol !== 'satici' && parsedUser.rol !== 'admin') {
      navigate('/home'); 
      return;
    }
    setUser(parsedUser);
  }, [navigate]);

  // Tablara göre veri çekme
  useEffect(() => {
    if (!user) return;

    if (activeTab === 'eserlerim') {
      axios.get('http://localhost:5000/api/eserler').then(res => {
         setMyArtworks(res.data.filter((a: any) => a.sanatci_id === user.sanatci_id));
      });
    } else if (activeTab === 'analiz') {
      axios.get(`http://localhost:5000/api/etkinlikler/istatistik?sanatci_id=${user.sanatci_id}`).then(res => {
         setIstatistikler(res.data);
      });
      axios.get(`http://localhost:5000/api/destek?kullanici_id=${user.id}`).then(res => {
         setTaleplerim(res.data);
      });
    } else if (activeTab === 'etkinliklerim') {
      axios.get(`http://localhost:5000/api/etkinlikler/satici/${user.sanatci_id}`).then(res => {
         setMyEvents(res.data);
      });
    } else if (activeTab === 'siparisler') {
      axios.get(`http://localhost:5000/api/islemler/satici/${user.sanatci_id}`).then(res => {
         setMyOrders(res.data);
      });
    }
  }, [activeTab, user]);

  const handlePublishEser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setSuccess('');
    try {
      let gorsel_url = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        gorsel_url = uploadRes.data.url;
      }

      await axios.post('http://localhost:5000/api/admin/artworks', {
        sanatci_id: user.sanatci_id,
        baslik: form.baslik,
        aciklama: form.aciklama,
        fiyat: parseFloat(form.fiyat),
        stok: parseInt(form.stok, 10),
        gorsel_url: gorsel_url
      });
      setSuccess('Eseriniz başarıyla yayınlandı!');
      setForm({ baslik: '', aciklama: '', fiyat: '', stok: '1' });
      setImageFile(null); setImagePreview('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Eser yayınlanırken hata oluştu.');
    } finally { setLoading(false); }
  };

  const handleEtkinlik = async (e: React.FormEvent) => {
    e.preventDefault();
    const validTarihler = tarihler.filter(t => t.trim() !== '');
    if (validTarihler.length === 0) {
      return alert('En az bir tarih girmelisiniz.');
    }
    setLoading(true); setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/etkinlikler', {
        ...etkinlikForm,
        tarih_saat_listesi: validTarihler,
        sanatci_id: user.sanatci_id
      });
      setSuccess('Etkinlik başarıyla oluşturuldu!');
      setEtkinlikForm({ baslik: '', ucret: '', kontenjan: '' });
      setTarihler(['']);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Etkinlik oluşturulamadı.');
    } finally { setLoading(false); }
  };

  const handleUpdateKontenjan = async (etkinlikId: number, newKontenjan: number) => {
    try {
      await axios.put(`http://localhost:5000/api/etkinlikler/${etkinlikId}/kontenjan`, {
        kontenjan: newKontenjan
      });
      setMyEvents(myEvents.map(e => e.id === etkinlikId ? { ...e, kontenjan: newKontenjan } : e));
      alert('Kontenjan güncellendi.');
    } catch (err) {
      alert('Kontenjan güncellenemedi.');
    }
  };

  const handleUpdateIslemDurum = async (islemId: number, durum: string) => {
    try {
      await axios.put(`http://localhost:5000/api/islemler/${islemId}/durum`, { durum });
      setMyOrders(myOrders.map(o => o.id === islemId ? { ...o, durum } : o));
    } catch (err) {
      alert('Durum güncellenemedi.');
    }
  };

  const handleDestek = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setSuccess('');
    try {
      const res = await axios.post('http://localhost:5000/api/destek', { ...destekForm, kullanici_id: user.id });
      setSuccess('Destek talebeniz yöneticiye iletildi!');
      setDestekForm({ konu: '', mesaj: '' });
      setTaleplerim([res.data, ...taleplerim]); // Prepend new ticket
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { alert('Destek talebi yollanamadı.'); } 
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-lg">S</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Satıcı Paneli</h1>
            <p className="text-xs text-slate-400">ArtGallery Studio</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-3 mb-2 mt-2">Eser Yönetimi</p>
          <button onClick={() => setActiveTab('yayinla')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'yayinla' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <ImagePlus size={20} /> Eser Yayınla
          </button>
          <button onClick={() => setActiveTab('eserlerim')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'eserlerim' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={20} /> Eserlerim
          </button>

          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-3 mb-2 mt-6">Etkinlik & Biletler</p>
          <button onClick={() => setActiveTab('etkinlik')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'etkinlik' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <CalendarPlus size={20} /> Etkinlik Oluştur
          </button>
          <button onClick={() => setActiveTab('etkinliklerim')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'etkinliklerim' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <CalendarPlus size={20} /> Etkinliklerim
          </button>
          
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-3 mb-2 mt-6">Sipariş Yönetimi</p>
          <button onClick={() => setActiveTab('siparisler')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'siparisler' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <BarChart3 size={20} /> Gelen Siparişler
          </button>
          <button onClick={() => setActiveTab('analiz')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'analiz' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <BarChart3 size={20} /> Katılımcı Analizi
          </button>

          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-3 mb-2 mt-6">Sistem Destek</p>
          <button onClick={() => setActiveTab('destek')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'destek' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <HelpCircle size={20} /> Yöneticiye Destek
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex justify-between items-center bg-slate-800 rounded-xl p-3 mb-2">
            <div className="flex items-center gap-2">
              <UserCircle size={24} className="text-emerald-400"/>
              <span className="text-sm font-semibold truncate w-[140px]">{user.ad_soyad}</span>
            </div>
          </div>
          <Link to="/home" className="flex items-center gap-3 w-full p-3 mb-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 font-medium transition-colors">
            <Home size={20} /> Ana Sayfaya Dön
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 font-medium transition-colors">
            <LogOut size={20} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto w-full relative">
        <div className="max-w-4xl mx-auto">
          
          {success && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-8 border border-emerald-200 font-medium flex items-center gap-3 animate-in fade-in zoom-in slide-in-from-top-4 absolute top-8 right-8 z-50">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">✓</div>
              {success}
            </div>
          )}

          {activeTab === 'yayinla' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Yeni Eser Yayınla</h2>
                <p className="text-slate-500">Dünyayla paylaşmak istediğiniz harika bir eseriniz mi var? Hemen vitrine çıkarın.</p>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <form onSubmit={handlePublishEser} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Eser Başlığı <span className="text-rose-500">*</span></label>
                    <input type="text" required value={form.baslik} onChange={e => setForm({...form, baslik: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Örn: Yıldızlı Gece" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Eser Açıklaması ve Hikayesi</label>
                    <textarea rows={4} value={form.aciklama} onChange={e => setForm({...form, aciklama: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Eserinizin ardındaki ilhamı anlatın..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Fiyat (₺) <span className="text-rose-500">*</span></label>
                      <input type="number" required min="0" step="0.01" value={form.fiyat} onChange={e => setForm({...form, fiyat: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="2500.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Stok (Adet) <span className="text-rose-500">*</span></label>
                      <input type="number" required min="1" step="1" value={form.stok} onChange={e => setForm({...form, stok: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="1" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Görsel Yükle</label>
                      <div className="relative group w-full px-4 py-3 bg-slate-50 border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl transition-all h-full min-h-[60px] flex items-center justify-center cursor-pointer overflow-hidden">
                        <input type="file" accept="image/*" onChange={e => { if(e.target.files && e.target.files[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); } }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        {imagePreview && <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />}
                        <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors z-0">
                          <UploadCloud size={24} className="mb-1" />
                          <span className="text-sm font-medium text-center">{imageFile ? imageFile.name : 'Bilgisayardan bir resim seçin'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button disabled={loading} type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed">
                      <Send size={18} /> {loading ? 'Yayınlanıyor...' : 'Eseri Yayınla'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'eserlerim' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Yayınladığım Eserler</h2>
                <p className="text-slate-500">Bugüne kadar vitrine eklediğiniz tüm eserler.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myArtworks.map(art => (
                  <Link to={`/eser/${art.id}`} key={art.id} className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-slate-200 cursor-pointer">
                    <div className="aspect-video bg-slate-100 relative">
                      {art.gorsel_url ? <img src={art.gorsel_url} alt={art.baslik} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">Görsel Yok</div>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{art.baslik}</h3>
                      <p className="text-indigo-600 font-bold mb-3">₺{art.fiyat}</p>
                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-medium border border-emerald-200 text-xs">Yayında</span>
                    </div>
                  </Link>
                ))}
                {myArtworks.length === 0 && (
                  <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                    <ImagePlus size={48} className="mb-4 text-slate-300" />
                    <p>Henüz yayınlanmış bir eseriniz bulunmuyor.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'etkinlik' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Yeni Etkinlik Düzenle</h2>
                <p className="text-slate-500">Atölye, Canlı Sunum veya Gösterileriniz için biletli etkinlik oluşturun.</p>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <form onSubmit={handleEtkinlik} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Etkinlik Başlığı</label>
                    <input type="text" required value={etkinlikForm.baslik} onChange={e => setEtkinlikForm({...etkinlikForm, baslik: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Örn: Sulu Boya Temel Atölyesi" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Oturum Tarih ve Saatleri</label>
                      {tarihler.map((t, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input type="datetime-local" required value={t} onChange={e => {
                            const newTarihler = [...tarihler];
                            newTarihler[idx] = e.target.value;
                            setTarihler(newTarihler);
                          }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                          {idx === tarihler.length - 1 ? (
                            <button type="button" onClick={() => setTarihler([...tarihler, ''])} className="px-4 py-3 bg-indigo-100 text-indigo-700 rounded-xl font-bold">+</button>
                          ) : (
                            <button type="button" onClick={() => setTarihler(tarihler.filter((_, i) => i !== idx))} className="px-4 py-3 bg-rose-100 text-rose-700 rounded-xl font-bold">-</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Bilet Ücreti (₺)</label>
                        <input type="number" required min="0" step="0.01" value={etkinlikForm.ucret} onChange={e => setEtkinlikForm({...etkinlikForm, ucret: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="150.00" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Kontenjan (Kişi)</label>
                        <input type="number" required min="1" step="1" value={etkinlikForm.kontenjan} onChange={e => setEtkinlikForm({...etkinlikForm, kontenjan: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="20" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button disabled={loading} type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed">
                      <CalendarPlus size={18} /> {loading ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'etkinliklerim' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Oluşturduğum Etkinlikler</h2>
                <p className="text-slate-500">Yaklaşan ve geçmiş tüm etkinliklerinizin kontenjanlarını buradan yönetebilirsiniz.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map(event => (
                  <div key={event.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-1">{event.baslik}</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {new Date(event.tarih_saat).toLocaleString('tr-TR')}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-semibold text-sm text-slate-700">Güncel Kontenjan:</span>
                      <input 
                        type="number" 
                        min="0"
                        value={event.kontenjan} 
                        onChange={(e) => handleUpdateKontenjan(event.id, parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-slate-200 rounded focus:ring-indigo-500" 
                      />
                    </div>
                  </div>
                ))}
                {myEvents.length === 0 && (
                  <div className="col-span-full py-20 text-center text-slate-400 border border-dashed border-slate-300 rounded-3xl">
                    <p>Henüz etkinlik oluşturmadınız.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'siparisler' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Gelen Siparişler & Rezervasyonlar</h2>
                <p className="text-slate-500">Müşterilerin eser ve etkinlik siparişlerini onaylayın.</p>
              </div>
              <div className="space-y-4">
                {myOrders.map(order => (
                  <div key={order.id} className="bg-white border text-left border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        #{order.id} - {order.eser_id ? 'Eser Siparişi' : 'Etkinlik Rezervasyonu'}
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          order.durum === 'Bekliyor' ? 'bg-amber-100 text-amber-700' : 
                          order.durum === 'Onaylandı' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {order.durum}
                        </span>
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        <b>{order.eser_id ? order.eser_baslik : order.etkinlik_baslik}</b>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Müşteri: {order.musteri_adi} | Tutar: ₺{order.toplam_tutar} | Tarih: {new Date(order.islem_tarihi).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    {order.durum === 'Bekliyor' && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleUpdateIslemDurum(order.id, 'Onaylandı')} className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-colors">Onayla</button>
                        <button onClick={() => handleUpdateIslemDurum(order.id, 'Reddedildi')} className="px-4 py-2 bg-rose-100 text-rose-700 font-bold rounded-xl hover:bg-rose-200 transition-colors">Reddet</button>
                      </div>
                    )}
                  </div>
                ))}
                {myOrders.length === 0 && (
                  <div className="col-span-full py-20 text-center text-slate-400 border border-dashed border-slate-300 rounded-3xl">
                    <p>Henüz sipariş/rezervasyon yok.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analiz' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Katılımcı ve Kitle Analizi</h2>
                <p className="text-slate-500">Etkinliklerinizden rezerve edilen biletlere dayanarak oluşan demografik kitleniz.</p>
              </div>
              <div className="space-y-6">
                {istatistikler.analiz.map((an: any) => (
                  <div key={an.etkinlik_id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div>
                       <h3 className="text-xl font-bold text-slate-800">{an.baslik}</h3>
                       <div className="mt-2 flex items-center gap-4 text-sm font-medium">
                         <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">Satılan Bilet: {an.satilan_bilet_sayisi || 0}</span>
                         <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-lg">Yaş Ortalaması: {an.yas_ortalamasi ? an.yas_ortalamasi : 'Hesaplanamadı'}</span>
                       </div>
                     </div>
                     <div className="flex gap-4">
                       <div className="bg-slate-50 p-4 rounded-2xl text-center min-w-[80px]">
                         <p className="text-xs font-bold text-slate-400 mb-1">KADIN</p>
                         <p className="text-xl font-black text-rose-500">{an.kadin_uye_sayisi || 0}</p>
                       </div>
                       <div className="bg-slate-50 p-4 rounded-2xl text-center min-w-[80px]">
                         <p className="text-xs font-bold text-slate-400 mb-1">ERKEK</p>
                         <p className="text-xl font-black text-blue-500">{an.erkek_uye_sayisi || 0}</p>
                       </div>
                     </div>
                  </div>
                ))}
                {istatistikler.analiz.length === 0 && (
                  <div className="py-20 bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                    <BarChart3 size={48} className="mb-4 text-slate-300" />
                    <p>Size ait Analiz edilebilecek kapasitede bir etkinlik/bilet satışı bulunamadı.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'destek' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Sistem Destek Talebi</h2>
                <p className="text-slate-500">Sipariş süreci, Rezervasyon iptalleri veya teknik sorunlarda Admine bilet (Ticket) açın.</p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-10">
                <form onSubmit={handleDestek} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Talep Konusu (Sipariş/Etkinlik ID Belirtin)</label>
                    <input type="text" required value={destekForm.konu} onChange={e => setDestekForm({...destekForm, konu: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Örn: Sipariş #1024 Hakkında İptal Talebi" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Açıklayıcı Mesajınız</label>
                    <textarea rows={4} required value={destekForm.mesaj} onChange={e => setDestekForm({...destekForm, mesaj: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Detayları buraya yazın..." />
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button disabled={loading} type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-rose-200 disabled:opacity-70 disabled:cursor-not-allowed">
                      <AlertCircle size={18} /> {loading ? 'İletiliyor...' : 'Talebi Yöneticilere Gönder'}
                    </button>
                  </div>
                </form>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-6">Önceki Talepleriniz</h3>
              <div className="space-y-4">
                {taleplerim.map(talep => (
                  <div key={talep.id} className="bg-white border text-left border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{talep.konu}</h4>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${talep.durum === 'Açık' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{talep.durum}</span>
                    </div>
                    <p className="text-slate-600 text-sm">{talep.mesaj}</p>
                    {talep.admin_yaniti && (
                      <div className="mt-4 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                        <p className="text-xs font-bold text-emerald-800 mb-1">Yönetici Yanıtı:</p>
                        <p className="text-emerald-700 text-sm">{talep.admin_yaniti}</p>
                      </div>
                    )}
                  </div>
                ))}
                {taleplerim.length === 0 && <p className="text-slate-500 text-sm italic">Geçmiş destek talebiniz bulunmuyor.</p>}
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
