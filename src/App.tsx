import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { CheckoutProvider } from './contexts/CheckoutContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AdminLayout from './components/Admin/Layout/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import AdminCategories from './pages/Admin/Categories';
import ProductListing from './pages/Products/ProductListing';
import ProductDetail from './pages/Products/ProductDetail';
import AddressManagement from './pages/Account/AddressManagement';
import CompleteProfile from './pages/CompleteProfile';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CheckoutProvider>
          <Router>
            <div className="min-h-screen bg-white">
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1e293b',
                    color: '#fff',
                  },
                  success: {
                    style: {
                      background: '#10b981',
                    },
                  },
                  error: {
                    style: {
                      background: '#ef4444',
                    },
                  },
                }}
              />
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                } />
                <Route path="/admin/products" element={
                  <AdminLayout>
                    <AdminProducts />
                  </AdminLayout>
                } />
                <Route path="/admin/categories" element={
                  <AdminLayout>
                    <AdminCategories />
                  </AdminLayout>
                } />
                
                {/* Customer Routes */}
                <Route path="/*" element={
                  <>
                    <Header />
                    <main>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<ProductListing />} />
                        <Route path="/products/men" element={<ProductListing />} />
                        <Route path="/products/women" element={<ProductListing />} />
                        <Route path="/products/:slug" element={<ProductDetail />} />
                        <Route path="/addresses" element={<AddressManagement />} />
                        <Route path="/login" element={<Login />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                } />
              </Routes>
            </div>
          </Router>
        </CheckoutProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;