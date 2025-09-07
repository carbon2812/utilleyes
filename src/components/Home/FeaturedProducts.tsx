import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { useCheckout } from '../../contexts/CheckoutContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Product } from '../../lib/supabase';
import toast from 'react-hot-toast';

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { quickPurchase } = useCheckout();
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name),
            variants:product_variants(*)
          `)
          .eq('is_featured', true)
          .eq('is_active', true)
          .limit(8)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    const defaultVariant = product.variants?.find(v => v.stock_quantity > 0);
    if (defaultVariant) {
      await addToCart(product.id, defaultVariant.id);
    } else {
      toast.error('Product is out of stock');
    }
  };

  const handleQuickPurchase = async (product: Product) => {
    if (!user) {
      toast.error('Please log in to make a purchase');
      return;
    }

    const defaultVariant = product.variants?.find(v => v.stock_quantity > 0);
    if (defaultVariant) {
      await quickPurchase(product.id, defaultVariant.id, 1);
    } else {
      toast.error('Product is out of stock');
    }
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-10 bg-slate-200 rounded-lg w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="aspect-square bg-slate-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Handpicked items that are trending this season
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const discountedPrice = calculateDiscountedPrice(product.base_price, product.discount_percentage);
            const hasDiscount = product.discount_percentage > 0;
            const inStock = product.variants?.some(v => v.stock_quantity > 0) || false;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.images[0] || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {hasDiscount && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      -{product.discount_percentage}%
                    </div>
                  )}
                  
                  {!inStock && (
                    <div className="absolute top-4 right-4 bg-slate-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Out of Stock
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                    <button className="p-3 bg-white rounded-full text-slate-900 hover:bg-slate-100 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!inStock}
                      className="p-3 bg-orange-500 rounded-full text-white hover:bg-orange-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleQuickPurchase(product)}
                      disabled={!inStock}
                      className="p-3 bg-slate-900 rounded-full text-white hover:bg-slate-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                      title="Quick Purchase"
                    >
                      <Zap className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-2">
                    <span className="text-sm text-slate-500">{product.category?.name}</span>
                  </div>
                  
                  <Link
                    to={`/products/${product.slug}`}
                    className="block group-hover:text-orange-600 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-slate-500 ml-1">(4.8)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-slate-900">
                        ₹{discountedPrice.toFixed(0)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-slate-500 line-through">
                          ₹{product.base_price.toFixed(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-emerald-600 font-medium">
                      {inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;