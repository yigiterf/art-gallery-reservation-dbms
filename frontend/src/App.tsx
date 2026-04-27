import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Artists from './pages/admin/Artists';
import Artworks from './pages/admin/Artworks';
import PlaceholderPage from './pages/admin/PlaceholderPage';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Client & Seller Pages
import HomePage from './pages/client/HomePage';
import ArtworkDetail from './pages/client/ArtworkDetail';
import SellerDashboard from './pages/seller/SellerDashboard';

import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Client Route */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/eser/:id" element={<ArtworkDetail />} />

        {/* Seller Route */}
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="artists" element={<Artists />} />
          <Route path="artworks" element={<Artworks />} />
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
