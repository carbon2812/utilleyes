import React, { useState, useEffect } from 'react';
import { X, MapPin, CreditCard, Truck, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCheckout } from '../../contexts/CheckoutContext';
import type { Address, Product, ProductVariant } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface QuickPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
}

const QuickPurchaseModal: React.FC<QuickPurchaseModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedVariant,
  quantity
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { quickPurchase, isProcessing } = useCheckout();

  useEffect(() => {
    if (isOpen && user) {
      fetchAddresses();
    }
  }, [isOpen, user]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      
      setAddresses(data || []);
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (data && data.length > 0) {
        setSelectedAddress(data[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const calculatePrice = () => {
    const basePrice = product.base_price * (1 - product.discount_percentage / 100);
    return basePrice + selectedVariant.additional_price;
  };

  const calculateTotal = () => {
    const itemTotal = calculatePrice() * quantity;
    const shipping = itemTotal > 999 ? 0 : 99;
    return itemTotal + shipping;
  };

  const handlePurchase = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setLoading(true);
    try {
      await quickPurchase(product.id, selectedVariant.id, quantity);
      onClose();
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Quick Purchase</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Summary */}
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
            <img
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{product.name}</h3>
              <p className="text-sm text-slate-600">
                {selectedVariant.size} - {selectedVariant.color}
              </p>
              <p className="text-sm text-slate-600">Quantity: {quantity}</p>
              <p className="text-lg font-bold text-slate-900">
                ₹{calculatePrice().toFixed(0)} × {quantity} = ₹{(calculatePrice() * quantity).toFixed(0)}
              </p>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Delivery Address
            </h3>
            
            {addresses.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800">No addresses found. Please add an address first.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddress?.id === address.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === address.id}
                      onChange={() => setSelectedAddress(address)}
                      className="sr-only"
                    />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{address.name}</p>
                        <p className="text-sm text-slate-600">{address.phone}</p>
                        <p className="text-sm text-slate-600">
                          {address.address_line1}, {address.address_line2 && `${address.address_line2}, `}
                          {address.city}, {address.state} - {address.postal_code}
                        </p>
                      </div>
                      {address.is_default && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Method
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-slate-900">Cash on Delivery</p>
                  <p className="text-sm text-slate-600">Pay when you receive your order</p>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 opacity-50">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  disabled
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-slate-900">Credit/Debit Card</p>
                  <p className="text-sm text-slate-600">Coming soon</p>
                </div>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span>₹{(calculatePrice() * quantity).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{calculatePrice() * quantity > 999 ? 'FREE' : '₹99'}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{calculateTotal().toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-slate-200">
            <div className="text-center">
              <Truck className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-900">Fast Delivery</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-900">Secure Payment</p>
            </div>
            <div className="text-center">
              <CreditCard className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-900">Easy Returns</p>
            </div>
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={loading || isProcessing || !selectedAddress}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading || isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              `Complete Purchase - ₹${calculateTotal().toFixed(0)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickPurchaseModal;