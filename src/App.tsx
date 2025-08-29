import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/layout/NavBar';
import Catalog from './pages/Catalog';
import ProductPage from './pages/ProductPage';
import Cart from './pages/Cart';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-beige-100">
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/catalog" replace />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}