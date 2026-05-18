import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Artists from './pages/admin/Artists';
import Artworks from './pages/admin/Artworks';
import Events from './pages/admin/Events';
import Transactions from './pages/admin/Transactions';
import Reviews from './pages/admin/Reviews';
import Coupons from './pages/admin/Coupons';
import Support from './pages/admin/Support';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Client & Seller Pages
import HomePage from './pages/client/HomePage';
import ArtworkDetail from './pages/client/ArtworkDetail';
import EventsPage from './pages/client/EventsPage';
import EventDetail from './pages/client/EventDetail';
import ProfilePage from './pages/client/ProfilePage';
import FavoritesPage from './pages/client/FavoritesPage';
import ComparePage from './pages/client/ComparePage';
import ClientSupportPage from './pages/client/SupportPage';
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

        {/* Client Routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/eser/:id" element={<ArtworkDetail />} />
        <Route path="/etkinlikler" element={<EventsPage />} />
        <Route path="/etkinlik/:id" element={<EventDetail />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/karsilastir" element={<ComparePage />} />
        <Route path="/destek" element={<ClientSupportPage />} />

        {/* Seller Route */}
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="artists" element={<Artists />} />
          <Route path="artworks" element={<Artworks />} />
          <Route path="events" element={<Events />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="support" element={<Support />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
