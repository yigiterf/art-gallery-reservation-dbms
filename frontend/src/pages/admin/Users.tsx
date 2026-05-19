import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserCog } from 'lucide-react';

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/admin/users')
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = (id: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'kullanici' : 'admin';
    if(window.confirm(`Kullanıcı rolünü "${newRole}" yapmak istediğinize emin misiniz?`)) {
      axios.put(`http://localhost:5000/api/admin/users/${id}/role`, { rol: newRole })
        .then(() => fetchUsers())
        .catch(console.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kullanıcı Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">Sistemdeki tüm üyeleri ve yetkilerini yönetin.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          <UserCog size={20} />
          Toplam: {users.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Yükleniyor...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-4 font-semibold rounded-tl-xl">ID</th>
                <th className="p-4 font-semibold">Ad Soyad</th>
                <th className="p-4 font-semibold">E-posta</th>
                <th className="p-4 font-semibold">Yetki</th>
                <th className="p-4 font-semibold text-right rounded-tr-xl">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-500 font-medium">#{u.id}</td>
                  <td className="p-4 text-slate-800 font-semibold">{u.ad_soyad}</td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      u.rol === 'admin' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {u.rol?.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => changeRole(u.id, u.rol)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                      Yetki Değiştir
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Hiç kullanıcı bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;
