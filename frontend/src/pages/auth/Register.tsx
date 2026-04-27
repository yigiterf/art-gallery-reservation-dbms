import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, User, AtSign, Lock, Briefcase } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ad_soyad: '',
    email: '',
    sifre: '',
    rol: 'kullanici', // Müşteri
    yas: '',
    cinsiyet: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.rol === 'satici') navigate('/seller/dashboard');
      else navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt işlemi başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
            <UserPlus size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Hesap Oluştur</h2>
          <p className="text-slate-500 mt-2">Bize katılın ve keşfetmeye başlayın.</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-medium mb-6 border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              type="button"
              onClick={() => setForm({...form, rol: 'kullanici'})}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                form.rol === 'kullanici' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <User size={24} />
              <span className="font-bold text-sm">Müşteri</span>
            </button>

            <button 
              type="button"
              onClick={() => setForm({...form, rol: 'satici'})}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                form.rol === 'satici' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Briefcase size={24} />
              <span className="font-bold text-sm">Satıcı (Sanatçı)</span>
            </button>
          </div>

          <div>
            <div className="relative">
              <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                required
                value={form.ad_soyad}
                onChange={e => setForm({...form, ad_soyad: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Ad Soyad"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <AtSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="email" 
                required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="E-posta Adresi"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                required
                value={form.sifre}
                onChange={e => setForm({...form, sifre: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Şifre"
              />
            </div>
          </div>

          {form.rol === 'kullanici' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input 
                  type="number" 
                  min="10"
                  max="100"
                  required
                  value={form.yas}
                  onChange={e => setForm({...form, yas: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Yaşınız"
                />
              </div>
              <div>
                <select 
                  required
                  value={form.cinsiyet}
                  onChange={e => setForm({...form, cinsiyet: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-600"
                >
                  <option value="" disabled>Cinsiyet Seçin</option>
                  <option value="Kadin">Kadın</option>
                  <option value="Erkek">Erkek</option>
                  <option value="Diger">Diğer / Belirtmek İstemiyorum</option>
                </select>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-200 transition-all shadow-lg shadow-emerald-200 mt-2"
          >
            {loading ? 'İşleniyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="text-center text-slate-500 mt-8 text-sm">
          Zaten hesabınız var mı? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Giriş Yapın</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
