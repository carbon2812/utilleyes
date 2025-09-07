import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, Share2, Plus, Minus, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import QuickPurchaseModal from '../../components/Products/QuickPurchaseModal';
import type { Product, ProductVariant, Review } from '../../lib/supabase';
import toast from 'react-hot-toast';

const ProductDetail: React.FC = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showQuickPurchase, setShowQuickPurchase] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (slug) {
      fetchProduct();
      fetchReviews();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug),
          variants:product_variants(*)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!slug) return;
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user_profiles(full_name)
        `)
        .eq('product.slug', slug)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    
    if (selectedVariant.stock_quantity < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    await addToCart(product.id, selectedVariant.id, quantity);
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  const getVariantPrice = () => {
    if (!product || !selectedVariant) return 0;
    const basePrice = calculateDiscountedPrice(product.base_price, product.discount_percentage);
    return basePrice + selectedVariant.additional_price;
  };

  const getOriginalPrice = () => {
    if (!product || !selectedVariant) return 0;
    return product.base_price + selectedVariant.additional_price;
  };

  const uniqueSizes = [...new Set(product?.variants?.map(v => v.size) || [])];
  const uniqueColors = [...new Set(product?.variants?.map(v => v.color) || [])];

  const getVariantsBySize = (size: string) => {
    return product?.variants?.filter(v => v.size === size) || [];
  };

  const getVariantsByColor = (color: string) => {
    return product?.variants?.filter(v => v.color === color) || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-slate-200 rounded-2xl"></div>
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                <div className="h-10 bg-slate-200 rounded w-1/3"></div>
                <div className="h-32 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Product Not Found</h2>
          <Link to="/products" className="text-orange-600 hover:text-orange-700">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-8">
          <Link to="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-slate-900">Products</Link>
          <span>/</span>
          <Link to={`/products/${product.category?.slug}`} className="hover:text-slate-900">
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={product.images[selectedImageIndex] || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {product.discount_percentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-full font-semibold">
                  -{product.discount_percentage}% OFF
                </div>
              )}

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    disabled={selectedImageIndex === 0}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(Math.min(product.images.length - 1, selectedImageIndex + 1))}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    disabled={selectedImageIndex === product.images.length - 1}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-orange-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-orange-600 font-medium">{product.category?.name}</span>
                {product.brand && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm text-slate-600">{product.brand}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-slate-600">(4.8)</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">{reviews.length} reviews</span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-slate-900">
                  ₹{getVariantPrice().toFixed(0)}
                </span>
                {product.discount_percentage > 0 && (
                  <span className="text-xl text-slate-500 line-through">
                    ₹{getOriginalPrice().toFixed(0)}
                  </span>
                )}
                {product.discount_percentage > 0 && (
                  <span className="text-emerald-600 font-semibold">
                    Save ₹{(getOriginalPrice() - getVariantPrice()).toFixed(0)}
                  </span>
                )}
              </div>
            </div>

            {/* Size Selection */}
            {uniqueSizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">Size</h3>
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    Size Chart
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {uniqueSizes.map(size => {
                    const sizeVariants = getVariantsBySize(size);
                    const hasStock = sizeVariants.some(v => v.stock_quantity > 0);
                    const isSelected = selectedVariant?.size === size;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          const variant = sizeVariants.find(v => v.stock_quantity > 0) || sizeVariants[0];
                          setSelectedVariant(variant);
                        }}
                        disabled={!hasStock}
                        className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-500'
                            : hasStock
                            ? 'bg-white text-slate-700 border-slate-300 hover:border-orange-500'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map(color => {
                    const colorVariants = getVariantsByColor(color);
                    const hasStock = colorVariants.some(v => v.stock_quantity > 0);
                    const isSelected = selectedVariant?.color === color;
                    
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          const variant = colorVariants.find(v => v.stock_quantity > 0) || colorVariants[0];
                          setSelectedVariant(variant);
                        }}
                        disabled={!hasStock}
                        className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-500'
                            : hasStock
                            ? 'bg-white text-slate-700 border-slate-300 hover:border-orange-500'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-slate-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant?.stock_quantity || 1, quantity + 1))}
                    className="p-2 hover:bg-slate-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-slate-600">
                  {selectedVariant?.stock_quantity || 0} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button className="p-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={() => setShowQuickPurchase(true)}
                disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Zap className="w-5 h-5" />
                <span>Buy Now - Quick Purchase</span>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-slate-200">
              <div className="text-center">
                <Truck className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">Free Shipping</p>
                <p className="text-xs text-slate-600">On orders over ₹999</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">Easy Returns</p>
                <p className="text-xs text-slate-600">30-day return policy</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">Secure Payment</p>
                <p className="text-xs text-slate-600">100% secure checkout</p>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h3 className="font-semibold text-slate-900">Product Details</h3>
              {product.description && (
                <p className="text-slate-700 leading-relaxed">{product.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.material && (
                  <div>
                    <span className="font-medium text-slate-900">Material:</span>
                    <span className="text-slate-600 ml-2">{product.material}</span>
                  </div>
                )}
                {product.care_instructions && (
                  <div>
                    <span className="font-medium text-slate-900">Care:</span>
                    <span className="text-slate-600 ml-2">{product.care_instructions}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-16 pt-16 border-t border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Customer Reviews</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {review.user_profiles?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {review.user_profiles?.full_name || 'Anonymous'}
                        </p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-slate-900 mb-2">{review.title}</h4>
                  )}
                  {review.comment && (
                    <p className="text-slate-700">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Purchase Modal */}
      {product && selectedVariant && (
        <QuickPurchaseModal
          isOpen={showQuickPurchase}
          onClose={() => setShowQuickPurchase(false)}
          product={product}
          selectedVariant={selectedVariant}
          quantity={quantity}
        />
      )}
    </div>
  );
};

export default ProductDetail;