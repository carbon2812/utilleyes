import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, SlidersHorizontal, Star, Heart, ShoppingCart, ChevronDown, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { useCheckout } from '../../contexts/CheckoutContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Product, Category } from '../../lib/supabase';
import toast from 'react-hot-toast';

const ProductListing: React.FC = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    sizes: [] as string[],
    colors: [] as string[],
    brands: [] as string[],
    rating: 0,
    sortBy: 'newest'
  });

  const { addToCart } = useCart();
  const { quickPurchase } = useCheckout();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [category, filter, filters.sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug),
          variants:product_variants(*)
        `)
        .eq('is_active', true);

      // Apply category filter
      if (category === 'men' || category === 'women') {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', `%${category}%`)
          .single();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      // Apply special filters
      if (filter === 'new') {
        query = query.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      } else if (filter === 'sale') {
        query = query.gt('discount_percentage', 0);
      } else if (filter === 'featured') {
        query = query.eq('is_featured', true);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price-low':
          query = query.order('base_price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('base_price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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

  const getPageTitle = () => {
    if (category === 'men') return "Men's Collection";
    if (category === 'women') return "Women's Collection";
    if (filter === 'new') return 'New Arrivals';
    if (filter === 'sale') return 'Sale Items';
    if (filter === 'featured') return 'Featured Products';
    return 'All Products';
  };

  const getPageDescription = () => {
    if (category === 'men') return 'Discover premium men\'s fashion and clothing';
    if (category === 'women') return 'Elegant styles for modern women';
    if (filter === 'new') return 'Latest trends and new arrivals';
    if (filter === 'sale') return 'Amazing deals and discounts up to 50% off';
    if (filter === 'featured') return 'Handpicked items that are trending this season';
    return 'Browse our complete collection';
  };

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown'];
  const availableBrands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="aspect-square bg-slate-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{getPageTitle()}</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">{getPageDescription()}</p>
            <div className="mt-6 flex items-center justify-center space-x-4 text-sm">
              <span className="bg-white/10 px-3 py-1 rounded-full">
                {products.length} Products
              </span>
              {filter === 'sale' && (
                <span className="bg-red-500 px-3 py-1 rounded-full font-semibold">
                  Up to 50% Off
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Sort Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Sort by:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">View:</span>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters({
                        ...filters,
                        priceRange: [0, parseInt(e.target.value)]
                      })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>₹0</span>
                      <span>₹{filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => {
                          const newSizes = filters.sizes.includes(size)
                            ? filters.sizes.filter(s => s !== size)
                            : [...filters.sizes, size];
                          setFilters({ ...filters, sizes: newSizes });
                        }}
                        className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                          filters.sizes.includes(size)
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-orange-500'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          const newColors = filters.colors.includes(color)
                            ? filters.colors.filter(c => c !== color)
                            : [...filters.colors, color];
                          setFilters({ ...filters, colors: newColors });
                        }}
                        className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                          filters.colors.includes(color)
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-orange-500'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Brands</h3>
                  <div className="space-y-2">
                    {availableBrands.map(brand => (
                      <label key={brand} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={(e) => {
                            const newBrands = e.target.checked
                              ? [...filters.brands, brand]
                              : filters.brands.filter(b => b !== brand);
                            setFilters({ ...filters, brands: newBrands });
                          }}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-300 rounded"
                        />
                        <span className="ml-2 text-sm text-slate-700">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {products.map((product) => {
              const discountedPrice = calculateDiscountedPrice(product.base_price, product.discount_percentage);
              const hasDiscount = product.discount_percentage > 0;
              const inStock = product.variants?.some(v => v.stock_quantity > 0) || false;

              return (
                <div
                  key={product.id}
                  className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'
                  }`}>
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

                  <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="mb-2">
                      <span className="text-sm text-slate-500">{product.category?.name}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>

                    {product.brand && (
                      <p className="text-sm text-slate-600 mb-2">{product.brand}</p>
                    )}

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
                      <span className={`text-sm font-medium ${
                        inStock ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {viewMode === 'list' && product.description && (
                      <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {products.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors">
              Load More Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListing;