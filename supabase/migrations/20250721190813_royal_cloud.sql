/*
  # Sample Data for E-commerce Store

  This migration adds sample categories, products, and an admin user
  to get the store started with demo data.
*/

-- Insert categories
INSERT INTO categories (id, name, slug, parent_id, image_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Men', 'men', NULL, 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Women', 'women', NULL, 'https://images.pexels.com/photos/972995/pexels-photo-972995.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Shirts', 'mens-shirts', '550e8400-e29b-41d4-a716-446655440001', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440004', 'T-Shirts', 'mens-tshirts', '550e8400-e29b-41d4-a716-446655440001', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Jeans', 'mens-jeans', '550e8400-e29b-41d4-a716-446655440001', 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Dresses', 'womens-dresses', '550e8400-e29b-41d4-a716-446655440002', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Tops', 'womens-tops', '550e8400-e29b-41d4-a716-446655440002', 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Jeans', 'womens-jeans', '550e8400-e29b-41d4-a716-446655440002', 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg');

-- Insert sample products
INSERT INTO products (id, name, slug, description, category_id, brand, material, care_instructions, base_price, discount_percentage, is_featured, images) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Premium Cotton Shirt', 'premium-cotton-shirt', 'Classic white cotton shirt perfect for formal and casual occasions', '550e8400-e29b-41d4-a716-446655440003', 'StyleCraft', '100% Cotton', 'Machine wash cold, hang dry', 2499.00, 20, true, 
   ARRAY['https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg', 'https://images.pexels.com/photos/298864/pexels-photo-298864.jpeg']),
  
  ('660e8400-e29b-41d4-a716-446655440002', 'Casual Cotton T-Shirt', 'casual-cotton-tshirt', 'Comfortable cotton t-shirt for everyday wear', '550e8400-e29b-41d4-a716-446655440004', 'ComfortWear', '100% Cotton', 'Machine wash cold', 899.00, 15, true,
   ARRAY['https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg']),
   
  ('660e8400-e29b-41d4-a716-446655440003', 'Slim Fit Jeans', 'slim-fit-jeans', 'Modern slim fit jeans with stretch comfort', '550e8400-e29b-41d4-a716-446655440005', 'DenimCo', '98% Cotton, 2% Elastane', 'Machine wash inside out', 3499.00, 25, true,
   ARRAY['https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg']),
   
  ('660e8400-e29b-41d4-a716-446655440004', 'Elegant Summer Dress', 'elegant-summer-dress', 'Beautiful floral summer dress perfect for any occasion', '550e8400-e29b-41d4-a716-446655440006', 'FloralFashion', 'Cotton Blend', 'Hand wash recommended', 2999.00, 30, true,
   ARRAY['https://images.pexels.com/photos/972995/pexels-photo-972995.jpeg']),
   
  ('660e8400-e29b-41d4-a716-446655440005', 'Trendy Crop Top', 'trendy-crop-top', 'Stylish crop top for modern women', '550e8400-e29b-41d4-a716-446655440007', 'TrendyWear', 'Polyester Blend', 'Machine wash cold', 1299.00, 10, false,
   ARRAY['https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg']),
   
  ('660e8400-e29b-41d4-a716-446655440006', 'High-Waist Skinny Jeans', 'high-waist-skinny-jeans', 'Flattering high-waist skinny jeans', '550e8400-e29b-41d4-a716-446655440008', 'DenimCo', '95% Cotton, 5% Spandex', 'Machine wash cold', 2799.00, 20, true,
   ARRAY['https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg']);

-- Insert product variants
INSERT INTO product_variants (product_id, size, color, color_hex, stock_quantity, additional_price) VALUES
  -- Premium Cotton Shirt variants
  ('660e8400-e29b-41d4-a716-446655440001', 'S', 'White', '#FFFFFF', 25, 0),
  ('660e8400-e29b-41d4-a716-446655440001', 'M', 'White', '#FFFFFF', 30, 0),
  ('660e8400-e29b-41d4-a716-446655440001', 'L', 'White', '#FFFFFF', 20, 0),
  ('660e8400-e29b-41d4-a716-446655440001', 'XL', 'White', '#FFFFFF', 15, 0),
  ('660e8400-e29b-41d4-a716-446655440001', 'S', 'Blue', '#4A90E2', 20, 0),
  ('660e8400-e29b-41d4-a716-446655440001', 'M', 'Blue', '#4A90E2', 25, 0),
  ('660e8400-e29b-41d4-a716-446655440001', 'L', 'Blue', '#4A90E2', 18, 0),
  
  -- Casual Cotton T-Shirt variants
  ('660e8400-e29b-41d4-a716-446655440002', 'S', 'Black', '#000000', 40, 0),
  ('660e8400-e29b-41d4-a716-446655440002', 'M', 'Black', '#000000', 50, 0),
  ('660e8400-e29b-41d4-a716-446655440002', 'L', 'Black', '#000000', 35, 0),
  ('660e8400-e29b-41d4-a716-446655440002', 'XL', 'Black', '#000000', 25, 0),
  ('660e8400-e29b-41d4-a716-446655440002', 'S', 'Navy', '#001f3f', 35, 0),
  ('660e8400-e29b-41d4-a716-446655440002', 'M', 'Navy', '#001f3f', 40, 0),
  ('660e8400-e29b-41d4-a716-446655440002', 'L', 'Navy', '#001f3f', 30, 0),
  
  -- Slim Fit Jeans variants
  ('660e8400-e29b-41d4-a716-446655440003', '30', 'Dark Blue', '#1e3a8a', 20, 0),
  ('660e8400-e29b-41d4-a716-446655440003', '32', 'Dark Blue', '#1e3a8a', 25, 0),
  ('660e8400-e29b-41d4-a716-446655440003', '34', 'Dark Blue', '#1e3a8a', 22, 0),
  ('660e8400-e29b-41d4-a716-446655440003', '36', 'Dark Blue', '#1e3a8a', 18, 0),
  ('660e8400-e29b-41d4-a716-446655440003', '30', 'Black', '#000000', 15, 0),
  ('660e8400-e29b-41d4-a716-446655440003', '32', 'Black', '#000000', 20, 0),
  ('660e8400-e29b-41d4-a716-446655440003', '34', 'Black', '#000000', 18, 0),
  
  -- Elegant Summer Dress variants  
  ('660e8400-e29b-41d4-a716-446655440004', 'XS', 'Floral', '#ff69b4', 12, 0),
  ('660e8400-e29b-41d4-a716-446655440004', 'S', 'Floral', '#ff69b4', 18, 0),
  ('660e8400-e29b-41d4-a716-446655440004', 'M', 'Floral', '#ff69b4', 20, 0),
  ('660e8400-e29b-41d4-a716-446655440004', 'L', 'Floral', '#ff69b4', 15, 0),
  ('660e8400-e29b-41d4-a716-446655440004', 'XL', 'Floral', '#ff69b4', 10, 0),
  
  -- Trendy Crop Top variants
  ('660e8400-e29b-41d4-a716-446655440005', 'XS', 'Pink', '#ff1493', 15, 0),
  ('660e8400-e29b-41d4-a716-446655440005', 'S', 'Pink', '#ff1493', 25, 0),
  ('660e8400-e29b-41d4-a716-446655440005', 'M', 'Pink', '#ff1493', 20, 0),
  ('660e8400-e29b-41d4-a716-446655440005', 'XS', 'White', '#FFFFFF', 12, 0),
  ('660e8400-e29b-41d4-a716-446655440005', 'S', 'White', '#FFFFFF', 18, 0),
  ('660e8400-e29b-41d4-a716-446655440005', 'M', 'White', '#FFFFFF', 15, 0),
  
  -- High-Waist Skinny Jeans variants
  ('660e8400-e29b-41d4-a716-446655440006', '26', 'Dark Blue', '#1e3a8a', 15, 0),
  ('660e8400-e29b-41d4-a716-446655440006', '28', 'Dark Blue', '#1e3a8a', 20, 0),
  ('660e8400-e29b-41d4-a716-446655440006', '30', 'Dark Blue', '#1e3a8a', 18, 0),
  ('660e8400-e29b-41d4-a716-446655440006', '32', 'Dark Blue', '#1e3a8a', 12, 0),
  ('660e8400-e29b-41d4-a716-446655440006', '26', 'Black', '#000000', 12, 0),
  ('660e8400-e29b-41d4-a716-446655440006', '28', 'Black', '#000000', 16, 0),
  ('660e8400-e29b-41d4-a716-446655440006', '30', 'Black', '#000000', 14, 0);

-- Insert sample coupons
INSERT INTO coupons (code, type, value, minimum_amount, maximum_discount, usage_limit, expires_at) VALUES
  ('WELCOME20', 'percentage', 20, 1000, 500, 1000, '2025-12-31'::timestamptz),
  ('FLAT500', 'fixed', 500, 2000, NULL, 500, '2025-12-31'::timestamptz),
  ('SUMMER30', 'percentage', 30, 1500, 1000, 200, '2025-08-31'::timestamptz);