import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Artists from './pages/admin/Artists';
// Placeholder component imports
import PlaceholderPage from './pages/admin/PlaceholderPage';

import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to admin for now since we are building admin panel */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="artists" element={<Artists />} />
          
          {/* Missing Pages using a placeholder for now to prevent breaking */}
          <Route path="artworks" element={<PlaceholderPage title="Eserler Yönetimi" />} />
          <Route path="events" element={<PlaceholderPage title="Etkinlikler Yönetimi" />} />
          <Route path="coupons" element={<PlaceholderPage title="Kuponlar Yönetimi" />} />
          <Route path="transactions" element={<PlaceholderPage title="İşlemler (Sipariş/Rezervasyon)" />} />
          <Route path="reviews" element={<PlaceholderPage title="Yorumlar ve Değerlendirmeler" />} />
          <Route path="support" element={<PlaceholderPage title="Müşteri Destek Talepleri" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
