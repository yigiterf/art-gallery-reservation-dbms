import { useEffect, useState } from 'react';

interface Eser {
  id: number;
  baslik: string;
  sanatci_adi: string;
  fiyat: string;
  gorsel_url: string;
  aciklama: string;
}

function App() {
  const [eserler, setEserler] = useState<Eser[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/eserler')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEserler(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <header className="mb-12 text-center mt-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4 tracking-tight">
          Modern Sanat Galerisi
        </h1>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Dünyanın dört bir yanından eşsiz eserleri inceleyin ve favorilerinize ekleyin.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {eserler.map(eser => (
          <div key={eser.id} className="bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-700/50 shadow-xl group hover:shadow-2xl transition-all duration-300 flex flex-col">
            <div className="h-72 overflow-hidden bg-black flex items-center justify-center">
              <img src={eser.gorsel_url} alt={eser.baslik} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-2xl font-bold mb-1">{eser.baslik}</h2>
              <p className="text-emerald-400 font-medium mb-4">{eser.sanatci_adi}</p>
              <p className="text-neutral-400 text-sm line-clamp-3 mb-6">{eser.aciklama}</p>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xl font-bold text-white">${parseFloat(eser.fiyat).toLocaleString()}</span>
                <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-xl font-medium shadow-lg hover:shadow-emerald-500/25 transition-all">
                  İncele
                </button>
              </div>
            </div>
          </div>
        ))}
        {eserler.length === 0 && (
          <div className="col-span-full text-center text-neutral-500 py-12 text-lg">
            Eserler yükleniyor veya veritabanında eser bulunmuyor...
          </div>
        )}
      </div>
    </div>
  )
}

export default App;
