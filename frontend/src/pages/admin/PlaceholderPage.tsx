import React from 'react';
import { PackageOpen } from 'lucide-react';

interface Props {
  title: string;
}

const PlaceholderPage: React.FC<Props> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100 rotate-3">
        <PackageOpen size={48} />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
      <p className="text-slate-500 max-w-md text-center">Bu sayfanın geliştirilmesi devam etmektedir. Yakında tüm yönetim fonksiyonlarıyla aktif olacaktır.</p>
    </div>
  );
};

export default PlaceholderPage;
