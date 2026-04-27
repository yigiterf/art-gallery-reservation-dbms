import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trash2, ImageIcon, Plus, Search } from 'lucide-react';

const Artworks: React.FC = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Eser Yönetimi</h2>
          <p className="text-slate-500 mt-1">Sistemdeki tüm yayınlanmış sanat eserlerini görüntüleyin ve yönetin.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Eser veya sanatçı ara..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <span className="text-sm font-semibold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">Topam: {artworks.length} Eser</span>
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
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Yükleniyor...</td>
                </tr>
              ) : artworks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Hiç eser bulunamadı.</td>
                </tr>
              ) : (
                artworks.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="w-16 h-12 rounded bg-slate-200 overflow-hidden flex items-center justify-center">
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
    </div>
  );
};

export default Artworks;
