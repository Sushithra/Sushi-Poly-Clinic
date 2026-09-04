import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { withApiBase } from '../../config/env.js';
import { resolveRecordUrl } from '../../utils/recordUrl.js';

const resolveImage = (product) => {
  if (product.imageUrl) return resolveRecordUrl(product.imageUrl);
  return '';
};

let razorpayScriptPromise = null;

const loadRazorpayScript = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

export default function PharmacyPage() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersView, setOrdersView] = useState(
    () =>
      Boolean(location.state?.openOrders) ||
      new URLSearchParams(location.search).get('view') === 'orders'
  );
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('address'); // 'address' | 'review'
  const [placedOrder, setPlacedOrder] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [busyProductId, setBusyProductId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [savedAddressId, setSavedAddressId] = useState('');
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState('');
  const [placesaving, setPlacesaving] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [shipping, setShipping] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [toast, setToast] = useState('');

  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || 'null');
    } catch {
      return null;
    }
  })();

  const authHeaders = userInfo?.token
    ? { Authorization: `Bearer ${userInfo.token}` }
    : {};

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(withApiBase('/api/products')),
          axios.get(withApiBase('/api/categories')).catch(() => ({ data: [] }))
        ]);
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      } catch (error) {
        console.error('Failed to fetch pharmacy data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (userInfo?.token) {
      fetchCart();
    }
  }, [userInfo?.token]);

  useEffect(() => {
    if (userInfo?.token) {
      fetchAddresses();
    }
  }, [userInfo?.token]);

  useEffect(() => {
    let mounted = true;
    loadRazorpayScript().then((loaded) => {
      if (mounted) setRazorpayReady(loaded);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (ordersView && userInfo?.token) {
      fetchOrders();
    }
  }, [ordersView, userInfo?.token]);

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(withApiBase('/api/addresses'), { headers: authHeaders });
      setAddresses(Array.isArray(data) ? data : []);
      const dflt = (Array.isArray(data) ? data : []).find((a) => a.isDefault);
      if (dflt) {
        setSavedAddressId(dflt._id);
        setShipping({
          fullName: dflt.fullName || '',
          phone: dflt.phone || '',
          addressLine1: dflt.addressLine1 || '',
          addressLine2: dflt.addressLine2 || '',
          city: dflt.city || '',
          state: dflt.state || '',
          pincode: dflt.pincode || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch addresses', error);
    }
  };

  const fetchCart = async () => {
    try {
      const { data } = await axios.get(withApiBase('/api/cart'), { headers: authHeaders });
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data } = await axios.get(withApiBase('/api/orders'), { headers: authHeaders });
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!userInfo?.token) {
      alert('Please sign in to add items to your cart.');
      return;
    }
    if (product.prescriptionRequired) {
      alert('This medicine requires a prescription. Please upload your prescription to order this item.');
      return;
    }
    try {
      setBusyProductId(product._id);
      const { data } = await axios.post(
        withApiBase('/api/cart'),
        { productId: product._id, quantity: 1 },
        { headers: authHeaders }
      );
      setCart(data);
      showToast(`${product.name} added to cart`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setBusyProductId(null);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      setCartLoading(true);
      const { data } = await axios.delete(withApiBase(`/api/cart/${productId}`), { headers: authHeaders });
      setCart(data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove item');
    } finally {
      setCartLoading(false);
    }
  };

  const handleUpdateQty = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      setCartLoading(true);
      const { data } = await axios.put(
        withApiBase(`/api/cart/${productId}`),
        { quantity },
        { headers: authHeaders }
      );
      setCart(data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setCartLoading(false);
    }
  };

  const selectSavedAddress = (addr) => {
    setSavedAddressId(addr._id);
    setEditingAddressId('');
    setShipping({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || ''
    });
    if (checkoutStep === 'review') setCheckoutStep('address');
  };

  const startCheckout = () => {
    setCheckout(true);
    setCheckoutStep('address');
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this saved address?')) return;
    try {
      await axios.delete(withApiBase(`/api/addresses/${id}`), { headers: authHeaders });
      const remaining = addresses.filter((a) => a._id !== id);
      setAddresses(remaining);
      if (savedAddressId === id) setSavedAddressId('');
      fetchAddresses();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    const addr = addresses.find((a) => a._id === id);
    if (!addr) return;
    try {
      await axios.put(withApiBase(`/api/addresses/${id}`), { ...addr, isDefault: true }, { headers: authHeaders });
      fetchAddresses();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to set default address');
    }
  };

  const saveAddressIfNeeded = async (orderAddress) => {
    if (saveNewAddress || editingAddressId || (savedAddressId && shipping.addressLine1 && !addresses.some((a) => a._id === savedAddressId && a.addressLine1 === shipping.addressLine1))) {
      if (editingAddressId) {
        await axios.put(
          withApiBase(`/api/addresses/${editingAddressId}`),
          orderAddress,
          { headers: authHeaders }
        );
      } else {
        await axios.post(
          withApiBase('/api/addresses'),
          orderAddress,
          { headers: authHeaders }
        );
      }
      fetchAddresses();
    }
  };

  const handlePayWithRazorpay = async () => {
    if (!userInfo?.token) {
      alert('Please sign in to continue.');
      return;
    }

    const scriptLoaded = razorpayReady || (await loadRazorpayScript());
    if (!scriptLoaded || !window.Razorpay) {
      setPaymentError('Razorpay checkout failed to load. Please refresh and try again.');
      return;
    }

    const orderAddress = { ...shipping };

    try {
      setPlacesaving(true);
      setPaymentError('');

      await saveAddressIfNeeded(orderAddress);

      const { data: orderData } = await axios.post(
        withApiBase('/api/orders/create-razorpay-order'),
        { shippingAddress: orderAddress, currency: 'INR', receipt: `pharmacy_${Date.now()}` },
        { headers: authHeaders }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Sushi Polyclinic',
        description: 'Medicine order payment',
        order_id: orderData.order_id,
        prefill: {
          name: userInfo.name || shipping.fullName || '',
          email: userInfo.email || '',
          contact: shipping.phone || '',
        },
        theme: { color: '#06b6d4' },
        handler: async (response) => {
          try {
            const { data } = await axios.post(
              withApiBase('/api/orders/verify-payment'),
              {
                orderId: orderData.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: authHeaders }
            );
            setPlacedOrder(data.order);
            setCart({ items: [], totalAmount: 0 });
            setCheckout(false);
            setCartOpen(false);
            setCheckoutStep('address');
            setEditingAddressId('');
            setSaveNewAddress(false);
            fetchOrders();
            fetchCart();
            showToast('Payment successful! Order placed.');
          } catch (verifyError) {
            setPaymentError(verifyError.response?.data?.message || 'Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentError('Payment was cancelled before completion. Your cart is still intact.');
          },
        },
        notes: { orderId: orderData.orderId },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        setPaymentError(response?.error?.description || 'Payment failed. Please try again.');
      });
      razorpay.open();
    } catch (error) {
      setPaymentError(error.response?.data?.message || 'Payment could not be completed');
    } finally {
      setPlacesaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const inCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const inSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return inCategory && inSearch;
  });

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-primary-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Sushi Polyclinic Pharmacy</h1>
            <p className="text-primary-100 text-lg">Order medicines directly to your home. Upload your prescription or buy over-the-counter essentials.</p>
            <div className="flex gap-4 pt-4">
              <PrimaryButton onClick={() => setOrdersView(true)}>View My Orders</PrimaryButton>
              <button
                onClick={() => setOrdersView(false)}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition"
              >
                Shop Medicines
              </button>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="mt-6 md:mt-0 flex items-center gap-2 bg-white text-primary-900 px-5 py-3 rounded-xl font-semibold hover:bg-primary-100 transition"
          >
            <span>🛒</span>
            Cart ({cartCount})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* My Orders */}
        {ordersView && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-neutral-900">My Orders</h2>
              <button onClick={() => setOrdersView(false)} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                ← Back to shop
              </button>
            </div>
            {placedOrder && (
              <div className="m-6 bg-green-50 border border-green-200 text-green-800 rounded-xl p-4">
                <p className="font-semibold">Order #{placedOrder._id} placed successfully!</p>
                <p className="text-sm mt-1">Total: ₹{placedOrder.totalAmount} · {placedOrder.orderStatus}</p>
              </div>
            )}
            <div className="p-6">
              {!userInfo?.token ? (
                <div className="text-center py-10 text-neutral-500">
                  Please <span className="text-primary-600 font-medium">sign in</span> to view your orders.
                </div>
              ) : ordersLoading ? (
                <div className="text-center py-10 text-neutral-500">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10 text-neutral-500">You haven't placed any orders yet.</div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-neutral-200 rounded-2xl p-5">
                      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                        <div>
                          <span className="font-semibold text-neutral-900">Order #{order._id}</span>
                          <span className="ml-3 text-sm text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-primary-600">₹{order.totalAmount}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                            order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <span className="text-xl">{item.image && item.image.length <= 4 ? item.image : '💊'}</span>
                            <span className="flex-1 font-medium text-neutral-800">{item.name}</span>
                            <span className="text-neutral-500">×{item.quantity}</span>
                            <span className="font-semibold text-neutral-900">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between pt-2 border-t border-neutral-100 mt-1 text-sm">
                        <span className="font-medium text-neutral-600">Total</span>
                        <span className="font-semibold text-neutral-900">₹{order.totalAmount}</span>
                      </div>
                      <div className="pt-2 mt-1 space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-600">Payment:</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {order.paymentStatus || 'pending'}
                          </span>
                          <span className="text-neutral-500">· Method: Razorpay</span>
                        </div>
                        {order.shippingAddress && (
                          <p className="text-neutral-600">Deliver to: {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shop */}
        {!ordersView && (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Categories */}
            <aside className="w-full md:w-64 space-y-2 flex-shrink-0">
              <h3 className="font-bold text-neutral-900 mb-4 px-2">Categories</h3>
              {['All', ...categories.map((c) => c.name), ...['Prescription Drugs', 'Pain Relief', 'Cold & Flu', 'Supplements', 'First Aid'].filter((c) => !categories.some((cat) => cat.name === c))]
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${
                    selectedCategory === cat
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-primary-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </aside>

            {/* Product Grid */}
            <main className="flex-1">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-neutral-900">{selectedCategory === 'All' ? 'Featured Products' : selectedCategory}</h2>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search medicines..."
                    className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-64"
                  />
                  <span className="absolute left-3 top-2.5 text-neutral-400">🔍</span>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-neutral-500">Loading medicines...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">No products available in this category.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const imageUrl = resolveImage(product);
                    return (
                      <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition group">
                        <div className="h-48 bg-neutral-100 flex items-center justify-center overflow-hidden">
                          {imageUrl ? (
                            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          ) : (
                            <span className="text-6xl group-hover:scale-105 transition duration-300">{product.image}</span>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">{product.category}</span>
                            {product.prescriptionRequired && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-medium">Rx Req</span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-neutral-900 mb-1">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-neutral-500 mb-2 line-clamp-2">{product.description}</p>
                          )}
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-xl font-bold text-primary-600">₹{product.price}</p>
                            {typeof product.stock === 'number' && (
                              <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={busyProductId === product._id || product.stock === 0}
                            className="w-full py-2 border border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {busyProductId === product._id ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-neutral-900">Your Cart ({cartCount} items)</h2>
              <button onClick={() => setCartOpen(false)} className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none">&times;</button>
            </div>

            {!userInfo?.token ? (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-6 text-center">
                <p>Please sign in to add items and checkout.</p>
              </div>
            ) : cart.items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-6 text-center">
                <p className="text-4xl mb-3">🛒</p>
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.product} className="flex items-start gap-4 border border-neutral-200 rounded-xl p-3">
                      <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image && String(item.image).startsWith('/') || item.image && String(item.image).startsWith('http') ? (
                          <img src={resolveRecordUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{item.image && item.image.length <= 4 ? item.image : '💊'}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900">{item.name}</p>
                        <p className="text-sm text-primary-600 font-bold">₹{item.price}</p>
                        {item.prescriptionRequired && (
                          <p className="text-xs text-amber-600 mt-0.5">Prescription required</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateQty(item.product, item.quantity - 1)}
                            disabled={cartLoading}
                            className="w-7 h-7 border border-neutral-300 rounded-md disabled:opacity-50"
                          >−</button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQty(item.product, item.quantity + 1)}
                            disabled={cartLoading}
                            className="w-7 h-7 border border-neutral-300 rounded-md disabled:opacity-50"
                          >+</button>
                          <button
                            onClick={() => handleRemoveFromCart(item.product)}
                            disabled={cartLoading}
                            className="ml-auto text-sm text-red-500 hover:text-red-700"
                          >Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-200 p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-neutral-600">Total</span>
                    <span className="text-xl font-bold text-neutral-900">₹{cart.totalAmount}</span>
                  </div>
                  {!checkout ? (
                    <button
                      onClick={startCheckout}
                      className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition"
                    >
                      Checkout
                    </button>
                  ) : (
                    <>
                      {checkoutStep === 'address' ? (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-neutral-700">Select Delivery Address</p>
                          {addresses.length > 0 && (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {addresses.map((addr) => (
                                <div key={addr._id}
                                  className={`border rounded-lg p-3 cursor-pointer text-sm transition ${
                                    savedAddressId === addr._id ? 'border-primary-600 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'
                                  }`}
                                >
                                  <div onClick={() => selectSavedAddress(addr)}>
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold text-neutral-800">{addr.fullName}</span>
                                      {addr.isDefault && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Default</span>}
                                    </div>
                                    <p className="text-neutral-600 mt-1">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                                    <p className="text-neutral-600">{addr.city}, {addr.state} {addr.pincode} · {addr.phone}</p>
                                  </div>
                                  <div className="flex items-center gap-3 mt-2 text-xs">
                                    <button onClick={() => selectSavedAddress(addr)} className="text-primary-600 hover:text-primary-700 font-medium">Use</button>
                                    <button onClick={() => { setShipping({
                                      fullName: addr.fullName || '', phone: addr.phone || '', addressLine1: addr.addressLine1 || '',
                                      addressLine2: addr.addressLine2 || '', city: addr.city || '', state: addr.state || '', pincode: addr.pincode || ''
                                    }); setSaveNewAddress(true); setEditingAddressId(addr._id); setSavedAddressId(''); }} className="text-neutral-600 hover:text-neutral-800 font-medium">Edit</button>
                                    {!addr.isDefault && <button onClick={() => handleSetDefaultAddress(addr._id)} className="text-neutral-600 hover:text-neutral-800 font-medium">Set Default</button>}
                                    <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="text-sm text-neutral-500">{addresses.length > 0 ? 'Or add a new address:' : 'No saved addresses yet. Add one:'}</div>
                          <input placeholder="Full name" value={shipping.fullName} onChange={(e) => { setShipping({ ...shipping, fullName: e.target.value }); setSavedAddressId(''); setEditingAddressId(''); }} className="w-full p-2 border border-neutral-300 rounded-lg text-sm" required />
                          <input placeholder="Phone number" value={shipping.phone} onChange={(e) => { setShipping({ ...shipping, phone: e.target.value }); setSavedAddressId(''); setEditingAddressId(''); }} className="w-full p-2 border border-neutral-300 rounded-lg text-sm" required />
                          <input placeholder="Address line 1" value={shipping.addressLine1} onChange={(e) => { setShipping({ ...shipping, addressLine1: e.target.value }); setSavedAddressId(''); setEditingAddressId(''); }} className="w-full p-2 border border-neutral-300 rounded-lg text-sm" required />
                          <input placeholder="Address line 2" value={shipping.addressLine2} onChange={(e) => { setShipping({ ...shipping, addressLine2: e.target.value }); setSavedAddressId(''); setEditingAddressId(''); }} className="w-full p-2 border border-neutral-300 rounded-lg text-sm" />
                          <div className="grid grid-cols-2 gap-3">
                            <input placeholder="City" value={shipping.city} onChange={(e) => { setShipping({ ...shipping, city: e.target.value }); setSavedAddressId(''); setEditingAddressId(''); }} className="w-full p-2 border border-neutral-300 rounded-lg text-sm" required />
                            <input placeholder="State" value={shipping.state} onChange={(e) => { setShipping({ ...shipping, state: e.target.value }); setSavedAddressId(''); setEditingAddressId(''); }} className="w-full p-2 border border-neutral-300 rounded-lg text-sm" required />
                          </div>
                          <input placeholder="Pincode" value={shipping.pincode} onChange={(e) => { setShipping({ ...shipping, pincode: e.target.value }); setSavedAddressId(''); setEditingAddressId(''); }} className="w-full p-2 border border-neutral-300 rounded-lg text-sm" required />
                          <label className="flex items-center gap-2 text-sm text-neutral-600">
                            <input type="checkbox" checked={saveNewAddress} onChange={(e) => setSaveNewAddress(e.target.checked)} />
                            Save this address for future orders
                          </label>
                          <button
                            onClick={() => {
                              if (!shipping.fullName || !shipping.phone || !shipping.addressLine1 || !shipping.city || !shipping.state || !shipping.pincode) {
                                alert('Please complete all required address fields.');
                                return;
                              }
                              setCheckoutStep('review');
                            }}
                            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition"
                          >
                            Continue to Review
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-neutral-700">Review Your Order</p>
                          <div className="rounded-lg border border-neutral-200 p-3 text-sm">
                            <p className="font-semibold text-neutral-800">{shipping.fullName}</p>
                            <p className="text-neutral-600">{shipping.addressLine1}{shipping.addressLine2 ? `, ${shipping.addressLine2}` : ''}</p>
                            <p className="text-neutral-600">{shipping.city}, {shipping.state} {shipping.pincode}</p>
                            <p className="text-neutral-600">{shipping.phone}</p>
                          </div>
                          <div className="rounded-lg border border-neutral-200 p-3">
                            <p className="text-sm font-semibold text-neutral-700 mb-2">Payment Method</p>
                            <div className="flex items-center gap-2 border border-primary-200 bg-primary-50 rounded-lg px-3 py-2">
                              <span className="text-lg">💳</span>
                              <span className="text-sm font-medium text-neutral-800">Pay Online with Razorpay</span>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-neutral-600">Total</span>
                            <span className="text-lg font-bold text-neutral-900">₹{cart.totalAmount}</span>
                          </div>
                          {paymentError && (
                            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                              {paymentError}
                            </div>
                          )}
                          <button onClick={() => { setPaymentError(''); setCheckoutStep('address'); }} className="w-full py-2 border border-neutral-300 text-neutral-600 font-semibold rounded-xl hover:bg-neutral-50 transition">
                            ← Change Address
                          </button>
                          <button onClick={handlePayWithRazorpay} disabled={placesaving} className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition disabled:opacity-50">
                            {placesaving ? 'Opening Razorpay...' : `Pay ₹${cart.totalAmount} with Razorpay`}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
