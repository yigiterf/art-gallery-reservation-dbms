import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, GitCompare, Trash2, BookmarkPlus, CheckSquare, Square,
  BarChart2, Users, DollarSign, CalendarDays, Brush, X
} from 'lucide-react';

const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ── Sekmeler ──
  const [activeTab, setActiveTab] = useState<'eser' | 'etkinlik'>('eser');

  // ── Veriler ──
  const [artworks, setArtworks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Seçilenler ──
  const [selectedArtworks, setSelectedArtworks] = useState<number[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);

  // ── Kaydedilen karşılaştırmalar ──
  const [savedComparisons, setSavedComparisons] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedCompId, setExpandedCompId] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<any[]>([]);

  // ── Karşılaştırma modalı ──
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user.id) { navigate('/login'); return; }
    Promise.all([
      axios.get('http://localhost:5000/api/eserler'),
      axios.get('http://localhost:5000/api/etkinlikler'),
      axios.get(`http://localhost:5000/api/karsilastirma/kullanici/${user.id}`),
    ]).then(([artRes, evtRes, compRes]) => {
      setArtworks(artRes.data);
      setEvents(evtRes.data);
      setSavedComparisons(compRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleArtwork = (id: number) => {
    setSelectedArtworks(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const toggleEvent = (id: number) => {
    setSelectedEvents(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const selectedItems = activeTab === 'eser'
    ? artworks.filter(a => selectedArtworks.includes(a.id))
    : events.filter(e => selectedEvents.includes(e.id));

  const currentSelected = activeTab === 'eser' ? selectedArtworks : selectedEvents;

  const handleSave = async () => {
    if (currentSelected.length < 2) return alert('En az 2 öğe seçin.');
    setSaving(true);
    try {
      const res = await axios.post('http://localhost:5000/api/karsilastirma', {
        kullanici_id: user.id,
        tip: activeTab,
        oge_idler: currentSelected,
      });
      setSavedComparisons(prev => [res.data, ...prev]);
      alert('Karşılaştırma kaydedildi!');
    } catch {
      alert('Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSaved = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/karsilastirma/${id}`);
      setSavedComparisons(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Silinemedi.');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const loadCompDetail = async (comp: any) => {
    if (expandedCompId === comp.id) { setExpandedCompId(null); setExpandedItems([]); return; }
    const ids: number[] = Array.isArray(comp.oge_idler) ? comp.oge_idler : JSON.parse(comp.oge_idler);
    const pool = comp.tip === 'eser' ? artworks : events;
    const items = pool.filter((x: any) => ids.includes(x.id));
    setExpandedItems(items);
    setExpandedCompId(comp.id);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
            <ArrowLeft size={20} /> Geri
          </button>
          <div className="flex items-center gap-2 ml-2">
            <GitCompare size={22} className="text-indigo-600" />
            <span className="text-xl font-bold text-slate-800">Karşılaştırma</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Sekmeler */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm w-fit">
          {(['eser', 'etkinlik'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowModal(false); }}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {tab === 'eser' ? '🎨 Eserler' : '📅 Etkinlikler'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Seçim Listesi ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {activeTab === 'eser' ? 'Eser' : 'Etkinlik'} Seç
                <span className="ml-2 text-sm font-normal text-slate-400">(en fazla 3)</span>
              </h2>
              {currentSelected.length >= 2 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                  >
                    <BarChart2 size={16} /> Karşılaştır
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 border border-indigo-200 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-all disabled:opacity-60"
                  >
                    <BookmarkPlus size={16} /> {saving ? '...' : 'Kaydet'}
                  </button>
                </div>
              )}
            </div>

            {activeTab === 'eser' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {artworks.map(art => {
                  const selected = selectedArtworks.includes(art.id);
                  const maxed = selectedArtworks.length >= 3 && !selected;
                  return (
                    <button
                      key={art.id}
                      onClick={() => !maxed && toggleArtwork(art.id)}
                      disabled={maxed}
                      className={`text-left p-4 rounded-2xl border-2 transition-all flex gap-4 items-start ${selected ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100' : maxed ? 'border-slate-100 bg-white opacity-40 cursor-not-allowed' : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm'}`}
                    >
                      <div className="shrink-0">
                        {selected ? <CheckSquare size={22} className="text-indigo-600" /> : <Square size={22} className="text-slate-300" />}
                      </div>
                      {art.gorsel_url ? (
                        <img src={art.gorsel_url} alt={art.baslik} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                          <Brush size={20} className="text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{art.baslik}</p>
                        <p className="text-xs text-slate-500 truncate">{art.sanatci_adi || 'Bilinmeyen'}</p>
                        <p className="text-indigo-600 font-black mt-1">₺{art.fiyat}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {events.map(evt => {
                  const selected = selectedEvents.includes(evt.id);
                  const maxed = selectedEvents.length >= 3 && !selected;
                  return (
                    <button
                      key={evt.id}
                      onClick={() => !maxed && toggleEvent(evt.id)}
                      disabled={maxed}
                      className={`text-left p-4 rounded-2xl border-2 transition-all ${selected ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100' : maxed ? 'border-slate-100 bg-white opacity-40 cursor-not-allowed' : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {selected ? <CheckSquare size={22} className="text-indigo-600" /> : <Square size={22} className="text-slate-300" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 line-clamp-2">{evt.baslik}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><CalendarDays size={11} />{formatDate(evt.tarih_saat)}</span>
                            <span className="flex items-center gap-1"><DollarSign size={11} />₺{evt.ucret}</span>
                            <span className="flex items-center gap-1"><Users size={11} />{evt.kontenjan} kişi</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Kaydedilen Karşılaştırmalar ── */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Kayıtlı Karşılaştırmalar</h2>
            {savedComparisons.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
                <BookmarkPlus size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Henüz kayıtlı karşılaştırma yok.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedComparisons.map(comp => {
                  const ids: number[] = Array.isArray(comp.oge_idler) ? comp.oge_idler : JSON.parse(comp.oge_idler);
                  const isExpanded = expandedCompId === comp.id;
                  return (
                    <div key={comp.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <div className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${comp.tip === 'eser' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                            {comp.tip === 'eser' ? '🎨 Eser' : '📅 Etkinlik'}
                          </span>
                          <p className="text-sm text-slate-600 mt-1">{ids.length} öğe karşılaştırması</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => loadCompDetail(comp)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${isExpanded ? 'bg-indigo-600 text-white' : 'border border-indigo-200 text-indigo-600 hover:bg-indigo-50'}`}
                          >
                            {isExpanded ? 'Kapat' : 'Detayları Gör'}
                          </button>
                          <button
                            onClick={() => handleDeleteSaved(comp.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {/* Expanded detail */}
                      {isExpanded && expandedItems.length > 0 && (
                        <div className="border-t border-slate-100 p-4 overflow-x-auto bg-slate-50">
                          <table className="w-full border-collapse text-sm">
                            <thead>
                              <tr>
                                <th className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase"></th>
                                {expandedItems.map((item: any) => (
                                  <th key={item.id} className="text-center py-2 px-3">
                                    <div className="flex flex-col items-center gap-1">
                                      {comp.tip === 'eser' && item.gorsel_url
                                        ? <img src={item.gorsel_url} alt={item.baslik} className="w-14 h-14 rounded-lg object-cover" />
                                        : <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-400 text-xs font-bold">{comp.tip === 'eser' ? '🎨' : '📅'}</div>
                                      }
                                      <span className="font-bold text-slate-800 text-xs">{item.baslik}</span>
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {comp.tip === 'eser' ? (
                                <>
                                  <tr><td className="py-2 px-3 text-slate-500 font-semibold">Sanatçı</td>{expandedItems.map((i: any) => <td key={i.id} className="py-2 px-3 text-center">{i.sanatci_adi || '—'}</td>)}</tr>
                                  <tr><td className="py-2 px-3 text-slate-500 font-semibold">Fiyat</td>{expandedItems.map((i: any) => <td key={i.id} className="py-2 px-3 text-center font-black text-indigo-600">₺{i.fiyat}</td>)}</tr>
                                  <tr><td className="py-2 px-3 text-slate-500 font-semibold">Stok</td>{expandedItems.map((i: any) => <td key={i.id} className="py-2 px-3 text-center">{i.stok}</td>)}</tr>
                                  <tr><td className="py-2 px-3 text-slate-500 font-semibold">Detay</td>{expandedItems.map((i: any) => <td key={i.id} className="py-2 px-3 text-center"><Link to={`/eser/${i.id}`} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700">İncele</Link></td>)}</tr>
                                </>
                              ) : (
                                <>
                                  <tr><td className="py-2 px-3 text-slate-500 font-semibold">Tarih</td>{expandedItems.map((i: any) => <td key={i.id} className="py-2 px-3 text-center text-xs">{formatDate(i.tarih_saat)}</td>)}</tr>
                                  <tr><td className="py-2 px-3 text-slate-500 font-semibold">Ücret</td>{expandedItems.map((i: any) => <td key={i.id} className="py-2 px-3 text-center font-black text-indigo-600">₺{i.ucret}</td>)}</tr>
                                  <tr><td className="py-2 px-3 text-slate-500 font-semibold">Kontenjan</td>{expandedItems.map((i: any) => <td key={i.id} className="py-2 px-3 text-center">{i.kontenjan} kişi</td>)}</tr>
                                  <tr><td className="py-2 px-3 text-slate-500 font-semibold">Rezervasyon</td>{expandedItems.map((i: any) => <td key={i.id} className="py-2 px-3 text-center"><Link to={`/etkinlik/${i.id}`} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700">Rezervasyon</Link></td>)}</tr>
                                </>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Karşılaştırma Modalı ── */}
      {showModal && selectedItems.length >= 2 && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl relative">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 className="text-indigo-500" size={24} />
                {activeTab === 'eser' ? 'Eser' : 'Etkinlik'} Karşılaştırması
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={22} />
              </button>
            </div>

            <div className="p-6 overflow-x-auto">
              {activeTab === 'eser' ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider w-32"></th>
                      {selectedItems.map(art => (
                        <th key={art.id} className="text-center py-3 px-4">
                          <div className="flex flex-col items-center gap-2">
                            {art.gorsel_url ? (
                              <img src={art.gorsel_url} alt={art.baslik} className="w-20 h-20 rounded-xl object-cover shadow-sm" />
                            ) : (
                              <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center"><Brush size={28} className="text-slate-400" /></div>
                            )}
                            <span className="font-bold text-slate-800 text-sm">{art.baslik}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { label: 'Sanatçı', key: 'sanatci_adi', render: (v: any) => v || 'Bilinmeyen' },
                      { label: 'Fiyat', key: 'fiyat', render: (v: any) => <span className="font-black text-indigo-600 text-lg">₺{v}</span> },
                      { label: 'Açıklama', key: 'aciklama', render: (v: any) => <span className="text-xs text-slate-500 line-clamp-3">{v || '—'}</span> },
                    ].map(row => (
                      <tr key={row.key} className="hover:bg-slate-50/60">
                        <td className="py-4 px-4 text-sm font-semibold text-slate-500">{row.label}</td>
                        {selectedItems.map(art => (
                          <td key={art.id} className="py-4 px-4 text-center text-sm text-slate-700">{row.render(art[row.key])}</td>
                        ))}
                      </tr>
                    ))}
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-4 px-4 text-sm font-semibold text-slate-500">Detay</td>
                      {selectedItems.map(art => (
                        <td key={art.id} className="py-4 px-4 text-center">
                          <Link to={`/eser/${art.id}`} className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                            İncele
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider w-32"></th>
                      {selectedItems.map(evt => (
                        <th key={evt.id} className="text-center py-3 px-4">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl flex items-center justify-center">
                              <CalendarDays size={28} className="text-indigo-300" />
                            </div>
                            <span className="font-bold text-slate-800 text-sm line-clamp-2">{evt.baslik}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { label: 'Tarih', key: 'tarih_saat', render: (v: any) => formatDate(v) },
                      { label: 'Ücret', key: 'ucret', render: (v: any) => <span className="font-black text-indigo-600 text-lg">₺{v}</span> },
                      { label: 'Kontenjan', key: 'kontenjan', render: (v: any) => (
                        <div className="flex items-center justify-center gap-1">
                          <Users size={14} className="text-emerald-500" />
                          <span className={`font-bold ${v <= 5 ? 'text-rose-500' : 'text-emerald-600'}`}>{v} kişi</span>
                        </div>
                      )},
                    ].map(row => (
                      <tr key={row.key} className="hover:bg-slate-50/60">
                        <td className="py-4 px-4 text-sm font-semibold text-slate-500">{row.label}</td>
                        {selectedItems.map(evt => (
                          <td key={evt.id} className="py-4 px-4 text-center text-sm text-slate-700">{row.render(evt[row.key])}</td>
                        ))}
                      </tr>
                    ))}
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-4 px-4 text-sm font-semibold text-slate-500">Rezervasyon</td>
                      {selectedItems.map(evt => (
                        <td key={evt.id} className="py-4 px-4 text-center">
                          <Link to={`/etkinlik/${evt.id}`} className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                            Rezervasyon Yap
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
