import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';

interface LowStockItem {
  id: string;
  name: string;
  variant: string;
  stock: number;
  image: string;
}

interface LowStockAlertProps {
  items: LowStockItem[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ items }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-900">Low Stock Alert</h3>
          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
            {items.length} items
          </span>
        </div>
      </div>

      <div className="p-6">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">All products are well stocked!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{item.name}</h4>
                  <p className="text-sm text-slate-600">{item.variant}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-800">
                    {item.stock} left
                  </p>
                  <p className="text-xs text-amber-600">Low stock</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockAlert;