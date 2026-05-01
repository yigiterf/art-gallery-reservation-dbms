import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trash2, ImageIcon, Plus, Search, X, Brush, UploadCloud } from 'lucide-react';

const Artworks: React.FC = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    sanatci_id: '',
    baslik: '',
    aciklama: '',
    fiyat: '',
  });

  useEffect(() => {
    fetchArtworks();
    // Sanatçı listesini dropdown için çek
    axios.get('http://localhost:5000/api/admin/artists')
      .then(res => setArtists(res.data))
      .catch(console.error);
  }, []);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/artworks');
      setArtworks(res.data);
    } catch (error) {
      console.error('Eserler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu eseri silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/artworks/${id}`);
        setArtworks(artworks.filter(a => a.id !== id));
      } catch (error) {
        alert('Eser silinirken bir hata oluştu');
      }
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let gorsel_url = '';
      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append('image', imageFile);
        const uploadRes = await axios.post('http://localhost:5000/api/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        gorsel_url = uploadRes.data.url;
        setUploading(false);
      }
      await axios.post('http://localhost:5000/api/admin/artworks', {
        sanatci_id: parseInt(form.sanatci_id),
        baslik: form.baslik,
        aciklama: form.aciklama,
        fiyat: parseFloat(form.fiyat),
        gorsel_url,
      });
      setShowModal(false);
      setForm({ sanatci_id: '', baslik: '', aciklama: '', fiyat: '' });
      setImageFile(null);
      setImagePreview('');
      fetchArtworks();
    } catch {
      alert('Eser eklenirken hata oluştu.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const filtered = search.trim()
    ? artworks.filter(a =>
        a.baslik.toLowerCase().includes(search.toLowerCase()) ||
        (a.sanatci_ad || '').toLowerCase().includes(search.toLowerCase())
      )
    : artworks;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Eser Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">Sistemdeki tüm yayınlanmış sanat eserlerini görüntüleyin ve yönetin.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={18} /> Yeni Eser Ekle
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Eser veya sanatçı ara..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <span className="text-sm font-semibold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
            Toplam: {filtered.length} Eser
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Görsel</th>
                <th className="px-6 py-4">Başlık</th>
                <th className="px-6 py-4">Sanatçı</th>
                <th className="px-6 py-4">Fiyat</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Yükleniyor...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Hiç eser bulunamadı.</td></tr>
              ) : (
                filtered.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                        {art.gorsel_url ? (
                          <img src={art.gorsel_url} alt={art.baslik} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <Link to={`/eser/${art.id}`} className="hover:text-indigo-600 hover:underline transition-colors" target="_blank">
                        {art.baslik}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {art.sanatci_ad || 'Bilinmeyen Sanatçı'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">₺{art.fiyat}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(art.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                        title="Eseri Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Artwork Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Brush className="text-indigo-500" size={22} /> Yeni Eser Ekle
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Sanatçı <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={form.sanatci_id}
                  onChange={e => setForm({ ...form, sanatci_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option value="">— Sanatçı Seçin —</option>
                  {artists.map(a => (
                    <option key={a.id} value={a.id}>{a.ad}</option>
                  ))}
                </select>
                {artists.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Önce "Sanatçılar" bölümünden bir sanatçı ekleyin.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Eser Başlığı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text" required value={form.baslik}
                  onChange={e => setForm({ ...form, baslik: e.target.value })}
                  placeholder="Örn: Yıldızlı Gece"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Açıklama</label>
                <textarea
                  rows={3} value={form.aciklama}
                  onChange={e => setForm({ ...form, aciklama: e.target.value })}
                  placeholder="Eser hakkında kısa bir açıklama..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Fiyat (₺) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number" required min="0" step="0.01" value={form.fiyat}
                    onChange={e => setForm({ ...form, fiyat: e.target.value })}
                    placeholder="1500.00"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
              {/* Görsel Yükle */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Görsel Yükle</label>
                <div className="relative group w-full border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl transition-colors overflow-hidden cursor-pointer min-h-[100px] flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Önizleme" className="w-full h-36 object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-6 text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <UploadCloud size={28} />
                      <span className="text-sm font-medium">Dosya seçmek için tıklayın</span>
                      <span className="text-xs">JPG, PNG, WEBP — Max 10MB</span>
                    </div>
                  )}
                </div>
                {imageFile && (
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-slate-500 truncate">{imageFile.name}</span>
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(''); }}
                      className="text-xs text-rose-400 hover:text-rose-600 ml-2 shrink-0"
                    >Kaldır</button>
                  </div>
                )}
              </div>
              <button
                type="submit" disabled={saving || uploading}
                className="w-full mt-2 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-60"
              >
                {uploading ? 'Görsel yükleniyor...' : saving ? 'Ekleniyor...' : 'Eseri Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Artworks;
