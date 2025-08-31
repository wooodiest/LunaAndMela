import React from 'react';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import CachedImage from '../components/ui/CachedImage';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { isAuthenticated, user } = useAuthStore();
  const userCarts = useCartStore(s => s.userCarts);
  const removeItem = useCartStore(s => s.removeItem);
  const setQuantity = useCartStore(s => s.setQuantity);
  
  const entries = React.useMemo(() => {
    if (!user?.id) return [];
    const currentUserCart = userCarts[user.id] || {};
    return Object.values(currentUserCart);
  }, [userCarts, user?.id]);

  const total = React.useMemo(() => {
    return entries.reduce((sum, it) => {
      const discountedPrice = it.product.price - (it.product.price * it.product.discountPercentage / 100);
      return sum + it.quantity * discountedPrice;
    }, 0);
  }, [entries]);

  const formatPrice = (price: number, discountPercentage: number) => {
    const discountedPrice = price - (price * discountPercentage / 100);
    return {
      original: price.toFixed(2),
      discounted: discountedPrice.toFixed(2),
      hasDiscount: discountPercentage > 0
    };
  };

  const getStockStatus = (stock: number, availabilityStatus: string) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600' };
    if (stock <= 5 || availabilityStatus === 'Low Stock') return { text: 'Low Stock', color: 'text-yellow-600' };
    return { text: 'In Stock', color: 'text-green-600' };
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in to view your cart</h2>
          <p className="text-gray-600 mb-8">You need to be logged in to access your shopping cart.</p>
          <Link 
            to="/login" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link 
            to="/catalog" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          Welcome back, {user?.firstName || user?.username || 'User'}! You have {entries.length} item{entries.length !== 1 ? 's' : ''} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {entries.map(({ product, quantity }) => {
                const priceInfo   = formatPrice(product.price, product.discountPercentage);
                const stockStatus = getStockStatus(product.stock, product.availabilityStatus);
                
                return (
                  <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <Link to={`/product/${product.id}`} className="flex-shrink-0 hover:opacity-80 transition-opacity">
                        <CachedImage 
                          src={product.thumbnail} 
                          alt={product.title} 
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200" 
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm text-blue-600 font-medium">{product.brand}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-500 capitalize">{product.category}</span>
                        </div>
                        <Link to={`/product/${product.id}`}>
                          <h3 className="text-lg font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">{product.title}</h3>
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                        
                        {/* Price and Stock */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-pink-600">${priceInfo.discounted}</span>
                            {priceInfo.hasDiscount && (
                              <span className="text-sm text-gray-500 line-through">${priceInfo.original}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${stockStatus.color}`}>
                              {stockStatus.text}
                            </span>
                            <span className="text-sm text-gray-500">({product.stock} left)</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.tags.slice(0, 2).map((tag, index) => (
                            <span 
                              key={index} 
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => setQuantity(product.id, Math.max(1, quantity - 1))}
                            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            className="w-16 text-center py-2 border-0 focus:ring-0 focus:outline-none"
                            min={1}
                            max={product.stock}
                            value={quantity}
                            onChange={(e) => {
                              const newValue = Math.max(1, Math.min(Number(e.target.value), product.stock));
                              setQuantity(product.id, newValue);
                            }}
                          />
                          <button
                            onClick={() => {
                              if (quantity < product.stock) {
                                setQuantity(product.id, quantity + 1);
                              }
                            }}
                            className={`px-3 py-2 transition-colors duration-200 ${
                              quantity >= product.stock 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button 
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          onClick={() => removeItem(product.id)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Item Total</span>
                        {priceInfo.hasDiscount && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            Save ${((parseFloat(priceInfo.original) - parseFloat(priceInfo.discounted)) * quantity).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-lg font-semibold text-gray-900">${(parseFloat(priceInfo.discounted) * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({entries.length} items)</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              
              {/* Discount Savings */}
              {entries.some(item => item.product.discountPercentage > 0) && (
                <div className="flex justify-between text-sm">
                  <span className="text-pink-600">Total Savings</span>
                  <span className="text-pink-600 font-medium">
                    -${entries.reduce((sum, item) => {
                      const savings = (item.product.price * item.product.discountPercentage / 100) * item.quantity;
                      return sum + savings;
                    }, 0).toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-pink-600 font-medium">Free</span>
              </div>         
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-pink-600">${(total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button onClick={
              () => {
               alert('Proceed to Checkout...');
              }
            } className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center space-x-2 cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Proceed to Checkout</span>
            </button>

            <div className="mt-4 text-center">
              <a 
                href="/catalog" 
                className="text-pink-600 hover:text-pink-700 font-medium transition-colors duration-200"
              >
                ← Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}