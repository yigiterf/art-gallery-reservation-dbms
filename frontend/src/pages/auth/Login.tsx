import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogIn, AtSign, Lock, User, Briefcase } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    sifre: '',
    rol: 'kullanici' // Müşteri veya Satıcı
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      const { rol } = res.data.user;
      if (rol === 'admin') navigate('/admin');
      else if (rol === 'satici') navigate('/seller/dashboard');
      else navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
            <LogIn size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Hoş Geldiniz</h2>
          <p className="text-slate-500 mt-2">Devam etmek istediğiniz hesap türünü seçin.</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-medium mb-6 border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          
          <div className="grid grid-cols-2 gap-4 mb-2">
            <button 
              type="button"
              onClick={() => setForm({...form, rol: 'kullanici'})}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                form.rol === 'kullanici' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <User size={20} />
              <span className="font-bold text-sm">Müşteri Girişi</span>
            </button>

            <button 
              type="button"
              onClick={() => setForm({...form, rol: 'satici'})}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                form.rol === 'satici' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Briefcase size={20} />
              <span className="font-bold text-sm">Satıcı Girişi</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">E-posta Adresi</label>
            <div className="relative">
              <AtSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="email" 
                required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="ornek@mail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Şifre</label>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                required
                value={form.sifre}
                onChange={e => setForm({...form, sifre: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="text-center text-slate-500 mt-8 text-sm">
          Hesabınız yok mu? <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Hemen Kayıt Olun</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
