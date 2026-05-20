import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TITLE_MAP: Record<string, string> = {
  '/': 'Ana Sayfa',
  '/home': 'Ana Sayfa',
  '/login': 'Giriş Yap',
  '/register': 'Kayıt Ol',
  '/profile': 'Profilim',
  '/favorites': 'Favorilerim',
  '/etkinlikler': 'Etkinlikler',
  '/karsilastir': 'Karşılaştırma',
  '/destek': 'Müşteri Destek',
  '/seller/dashboard': 'Satıcı Paneli',
  '/admin': 'Dashboard — Admin',
  '/admin/users': 'Kullanıcılar — Admin',
  '/admin/artists': 'Sanatçılar — Admin',
  '/admin/artworks': 'Eserler — Admin',
  '/admin/events': 'Etkinlikler — Admin',
  '/admin/coupons': 'Kuponlar — Admin',
  '/admin/transactions': 'İşlemler — Admin',
  '/admin/reviews': 'Yorumlar — Admin',
  '/admin/support': 'Destek — Admin',
};

const DYNAMIC_PATTERNS: { pattern: RegExp; title: string }[] = [
  { pattern: /^\/eser\/\d+$/, title: 'Eser Detay' },
  { pattern: /^\/etkinlik\/\d+$/, title: 'Etkinlik Detay' },
  { pattern: /^\/sanatci\/\d+$/, title: 'Sanatçı Profili' },
];

const PageTitleUpdater: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // Exact match
    if (TITLE_MAP[path]) {
      document.title = `${TITLE_MAP[path]} | ArtGallery`;
      return;
    }

    // Dynamic pattern match
    for (const { pattern, title } of DYNAMIC_PATTERNS) {
      if (pattern.test(path)) {
        document.title = `${title} | ArtGallery`;
        return;
      }
    }

    // Fallback
    document.title = 'ArtGallery';
  }, [location.pathname]);

  return null;
};

export default PageTitleUpdater;
