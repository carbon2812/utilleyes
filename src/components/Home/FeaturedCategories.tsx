import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 1,
    title: "Men's Collection",
    description: "Discover premium men's fashion",
    image: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg",
    link: "/products/men",
    color: "from-blue-600 to-blue-800"
  },
  {
    id: 2,
    title: "Women's Collection",
    description: "Elegant styles for modern women",
    image: "https://images.pexels.com/photos/972995/pexels-photo-972995.jpeg",
    link: "/products/women",
    color: "from-rose-500 to-pink-600"
  },
  {
    id: 3,
    title: "New Arrivals",
    description: "Latest trends just dropped",
    image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg",
    link: "/products?filter=new",
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: 4,
    title: "Sale Items",
    description: "Up to 50% off selected items",
    image: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg",
    link: "/products?filter=sale",
    color: "from-orange-500 to-red-500"
  }
];

const FeaturedCategories: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Explore our carefully curated collections designed for every style and occasion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={category.link}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              
              <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-70 transition-opacity duration-300`}></div>
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <h3 className="text-xl font-bold mb-2 group-hover:mb-3 transition-all duration-300">
                  {category.title}
                </h3>
                <p className="text-white/90 mb-4 group-hover:mb-6 transition-all duration-300">
                  {category.description}
                </p>
                
                <div className="flex items-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <span className="font-medium mr-2">Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              
              {/* Decorative element */}
              <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;