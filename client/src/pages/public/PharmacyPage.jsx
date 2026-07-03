import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PrimaryButton from '../../components/buttons/PrimaryButton';

export default function PharmacyPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Pharmacy Hero */}
      <div className="bg-primary-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Sushi Poly Clinic Pharmacy</h1>
            <p className="text-primary-100 text-lg">Order medicines directly to your home. Upload your prescription or buy over-the-counter essentials.</p>
            <div className="flex gap-4 pt-4">
              <PrimaryButton>Upload Prescription</PrimaryButton>
              <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition">
                View My Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Categories */}
          <aside className="w-full md:w-64 space-y-2 flex-shrink-0">
            <h3 className="font-bold text-neutral-900 mb-4 px-2">Categories</h3>
            {['All Medicines', 'Prescription Drugs', 'Pain Relief', 'Cold & Flu', 'Supplements', 'First Aid'].map(cat => (
              <button key={cat} className="w-full text-left px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-primary-600 transition font-medium">
                {cat}
              </button>
            ))}
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-neutral-900">Featured Products</h2>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search medicines..."
                  className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-64"
                />
                <span className="absolute left-3 top-2.5 text-neutral-400">🔍</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-neutral-500">Loading medicines...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">No products available at the moment.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition group">
                    <div className="h-48 bg-neutral-100 flex items-center justify-center text-6xl group-hover:scale-105 transition duration-300">
                      {product.image}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">{product.category}</span>
                        {product.prescriptionRequired && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-medium">Rx Req</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-1">{product.name}</h3>
                      <p className="text-xl font-bold text-primary-600 mb-4">₹{product.price}</p>
                      <button className="w-full py-2 border border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
