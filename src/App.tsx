import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductCatalog from './components/ProductCatalog';
import OrderForm from './components/OrderForm';
import OrderTracking from './components/OrderTracking';
import AdminDashboard from './components/AdminDashboard';
import { Citrus as Fruit } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ProductCatalog />} />
            <Route path="/order" element={<OrderForm />} />
            <Route path="/track" element={<OrderTracking />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;