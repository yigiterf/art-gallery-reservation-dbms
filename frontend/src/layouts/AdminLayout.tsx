import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Palette, 
  Image as ImageIcon, 
  CalendarDays, 
  Ticket, 
  ShoppingCart, 
  MessageSquare, 
  HelpCircle,
  Settings,
  LogOut
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Kullanıcılar' },
    { path: '/admin/artists', icon: <Palette size={20} />, label: 'Sanatçılar' },
    { path: '/admin/artworks', icon: <ImageIcon size={20} />, label: 'Eserler' },
    { path: '/admin/events', icon: <CalendarDays size={20} />, label: 'Etkinlikler' },
    { path: '/admin/coupons', icon: <Ticket size={20} />, label: 'Kuponlar' },
    { path: '/admin/transactions', icon: <ShoppingCart size={20} />, label: 'İşlemler' },
    { path: '/admin/reviews', icon: <MessageSquare size={20} />, label: 'Yorumlar' },
    { path: '/admin/support', icon: <HelpCircle size={20} />, label: 'Destek' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shadow-2xl z-10 transition-all duration-300">
        <div className="p-6 flex items-center justify-center space-x-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-xl">A</div>
          <h1 className="text-xl font-bold tracking-wider text-slate-100">ArtAdmin</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'} transition-colors duration-200`}>
                  {item.icon}
                </div>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-all duration-200">
            <LogOut size={20} />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm backdrop-blur-sm bg-white/90 sticky top-0 z-20">
          <h2 className="text-xl font-semibold text-slate-800">
            {menuItems.find(m => m.path === location.pathname)?.label || 'Admin Paneli'}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
              <Settings size={20} />
            </button>
            <div className="flex items-center space-x-3 border-l pl-4 border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-sm"></div>
              <span className="text-sm font-medium text-slate-700">Yönetici</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none mix-blend-multiply"></div>
          <div className="relative z-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
