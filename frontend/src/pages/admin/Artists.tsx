import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Palette, Trash2, Plus } from 'lucide-react';

const Artists: React.FC = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ ad: '', biyografi: '' });

  const fetchArtists = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/admin/artists')
      .then(res => setArtists(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchArtists(); }, []);

  const handleDelete = (id: number) => {
    if(window.confirm('Bu sanatçıyı silmek istediğinize emin misiniz?')) {
      axios.delete(`http://localhost:5000/api/admin/artists/${id}`)
        .then(() => fetchArtists())
        .catch(console.error);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/admin/artists', form)
      .then(() => {
        setIsFormOpen(false);
        setForm({ ad: '', biyografi: '' });
        fetchArtists();
      })
      .catch(console.error);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sanatçı Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">Sistemdeki sanatçıları ekleyin ve düzenleyin.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Yeni Sanatçı
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleAdd} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sanatçı Adı</label>
              <input 
                required 
                type="text" 
                value={form.ad}
                onChange={e => setForm({...form, ad: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Örn: Leonardo da Vinci"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Biyografi</label>
              <textarea 
                rows={3}
                value={form.biyografi}
                onChange={e => setForm({...form, biyografi: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Sanatçı hakkında kısa bilgi..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition-colors">İptal</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">Kaydet</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
            <button 
              onClick={() => handleDelete(s.id)}
              className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all bg-white rounded-full p-2 hover:bg-rose-50"
            >
              <Trash2 size={18} />
            </button>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Palette size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{s.ad}</h3>
            <p className="text-slate-500 text-sm line-clamp-3">{s.biyografi || 'Biyografi bilgisi yok.'}</p>
          </div>
        ))}
        {artists.length === 0 && !loading && (
          <div className="col-span-full text-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
            Hiç sanatçı bulunamadı. Lütfen yeni bir sanatçı ekleyin.
          </div>
        )}
      </div>
    </div>
  );
};

export default Artists;
