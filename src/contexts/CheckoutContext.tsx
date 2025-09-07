import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import type { Address, CartItem } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CheckoutContextType {
  isProcessing: boolean;
  quickPurchase: (productId: string, variantId: string, quantity?: number) => Promise<void>;
  processOrder: (items: CartItem[], address: Address, paymentMethod: string) => Promise<string | null>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { clearCart } = useCart();

  const generateOrderNumber = () => {
    return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const processOrder = async (items: CartItem[], address: Address, paymentMethod: string): Promise<string | null> => {
    if (!user) {
      toast.error('Please log in to place an order');
      return null;
    }

    setIsProcessing(true);
    
    try {
      // Calculate totals
      const subtotal = items.reduce((total, item) => {
        if (item.product && item.variant) {
          const price = item.product.base_price * (1 - item.product.discount_percentage / 100) + item.variant.additional_price;
          return total + (price * item.quantity);
        }
        return total;
      }, 0);

      const shippingAmount = subtotal > 999 ? 0 : 99; // Free shipping over ₹999
      const totalAmount = subtotal + shippingAmount;

      // Create order
      const orderData = {
        user_id: user.id,
        order_number: generateOrderNumber(),
        status: 'pending',
        total_amount: totalAmount,
        discount_amount: 0,
        shipping_amount: shippingAmount,
        payment_status: 'pending',
        payment_method: paymentMethod,
        shipping_address: {
          name: address.name,
          phone: address.phone,
          address_line1: address.address_line1,
          address_line2: address.address_line2,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country
        }
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.product && item.variant 
          ? item.product.base_price * (1 - item.product.discount_percentage / 100) + item.variant.additional_price
          : 0,
        total_price: item.product && item.variant 
          ? (item.product.base_price * (1 - item.product.discount_percentage / 100) + item.variant.additional_price) * item.quantity
          : 0
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update stock quantities
      for (const item of items) {
        if (item.variant) {
          const { error: stockError } = await supabase
            .from('product_variants')
            .update({ 
              stock_quantity: Math.max(0, item.variant.stock_quantity - item.quantity)
            })
            .eq('id', item.variant_id);

          if (stockError) console.error('Error updating stock:', stockError);
        }
      }

      toast.success('Order placed successfully!');
      return order.id;

    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Failed to place order');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const quickPurchase = async (productId: string, variantId: string, quantity: number = 1) => {
    if (!user) {
      toast.error('Please log in to make a purchase');
      return;
    }

    setIsProcessing(true);

    try {
      // Get user's default address
      const { data: address, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (addressError || !address) {
        toast.error('Please add a default address first');
        setIsProcessing(false);
        return;
      }

      // Get product and variant details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
        `)
        .eq('id', productId)
        .single();

      if (productError || !product) {
        toast.error('Product not found');
        setIsProcessing(false);
        return;
      }

      const variant = product.variants?.find(v => v.id === variantId);
      if (!variant) {
        toast.error('Product variant not found');
        setIsProcessing(false);
        return;
      }

      if (variant.stock_quantity < quantity) {
        toast.error('Not enough stock available');
        setIsProcessing(false);
        return;
      }

      // Create mock cart item for processing
      const mockCartItem: CartItem = {
        id: 'temp',
        user_id: user.id,
        product_id: productId,
        variant_id: variantId,
        quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product,
        variant
      };

      // Process the order with default payment method (COD for now)
      const orderId = await processOrder([mockCartItem], address, 'cod');
      
      if (orderId) {
        // Redirect to order confirmation or payment
        toast.success('Redirecting to payment...');
        // Here you would integrate with Stripe/Razorpay
      }

    } catch (error) {
      console.error('Error in quick purchase:', error);
      toast.error('Failed to process quick purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  const value = {
    isProcessing,
    quickPurchase,
    processOrder,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};