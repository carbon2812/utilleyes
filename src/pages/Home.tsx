import React from 'react';
import HeroSection from '../components/Home/HeroSection';
import FeaturedCategories from '../components/Home/FeaturedCategories';
import FeaturedProducts from '../components/Home/FeaturedProducts';

const Home: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
    </div>
  );
};

export default Home;