import React from 'react';
import { Link } from 'react-router-dom';
import { Citrus as Fruit, ShoppingCart, Truck, Settings } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Fruit className="h-8 w-8" />
            <span className="text-xl font-bold">Fresh Bulk</span>
          </Link>
          <div className="flex space-x-6">
            <Link to="/" className="flex items-center space-x-1 hover:text-green-200">
              <ShoppingCart className="h-5 w-5" />
              <span>Products</span>
            </Link>
            <Link to="/track" className="flex items-center space-x-1 hover:text-green-200">
              <Truck className="h-5 w-5" />
              <span>Track Order</span>
            </Link>
            <Link to="/admin" className="flex items-center space-x-1 hover:text-green-200">
              <Settings className="h-5 w-5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;