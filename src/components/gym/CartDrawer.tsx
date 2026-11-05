import React from 'react';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, Sparkles } from 'lucide-react';
import { Product, User } from '../../types/laravel';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  user: User;
  isVip: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  user,
  isVip,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const discountRate = isVip ? 0.15 : 0;
  const discountAmount = subtotal * discountRate;
  const total = subtotal - discountAmount;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white font-mono">
                  CARRITO EN BOLIVIANOS (Bs.)
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isVip && (
              <div className="mt-4 p-2.5 rounded-xl bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-red-400" />
                <span>
                  <strong>Beneficio VIP Activo:</strong> 15% de descuento directo en toda la tienda.
                </span>
              </div>
            )}

            {/* Items List */}
            <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Tu carrito está vacío. Agrega suplementos o indumentaria desde el catálogo.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex gap-3 items-center"
                  >
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-xs text-red-400 font-mono font-bold mt-0.5">
                        Bs. {item.product.price.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-white px-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Total & Checkout */}
          {items.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>Bs. {subtotal.toFixed(2)}</span>
                </div>
                {isVip && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Descuento VIP (15%)</span>
                    <span>-Bs. {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Total a Pagar</span>
                  <span className="text-red-400 font-mono">Bs. {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(
                    `¡Pedido por Bs. ${total.toFixed(2)} procesado con éxito para ${user.name}! Se envió la confirmación a ${user.email}.`
                  );
                  onClearCart();
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Proceder al Pago Seguro (Bs.)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
