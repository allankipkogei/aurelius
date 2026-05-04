"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <main className="min-h-screen bg-black text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-gray-500 hover:text-amber-600 transition-colors">
            ← Back to Collection
          </Link>
        </div>

        <h1 className="font-serif text-4xl italic mb-12">Your Vault</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-8">Your cart is empty</p>
            <Link 
              href="#collection" 
              className="inline-block bg-amber-600 text-black px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-12">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-6 bg-neutral-900/40 p-6 border border-white/5 hover:border-amber-600/30 transition-all">
                  <div className="w-24 h-32 flex-shrink-0 relative bg-neutral-800 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-amber-600 text-[9px] uppercase tracking-[0.3em] mb-1">{item.brand}</p>
                      <h3 className="font-serif italic text-lg mb-2">{item.name}</h3>
                      <p className="text-gray-400 text-[10px]">KSH {item.price.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center border border-white/20 hover:bg-white/10 transition-colors text-sm"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-[10px] font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-white/20 hover:bg-white/10 transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-amber-600 font-bold ml-auto">
                        KSH {(item.price * item.quantity).toLocaleString()}
                      </p>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="px-4 py-2 text-[9px] uppercase tracking-widest font-bold border border-red-600/50 text-red-500 bg-red-900/20 hover:bg-red-900/40 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-neutral-900/40 border border-white/5 p-8">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                <span className="text-[10px] uppercase tracking-widest">Subtotal</span>
                <span className="font-serif italic text-lg">KSH {totalPrice.toLocaleString()}</span>
              </div>
              
              <p className="text-gray-500 text-[9px] uppercase tracking-widest mb-8">
                Contact us via WhatsApp to complete your acquisition
              </p>

              <a
                href="https://wa.me/254118983818"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-green-600 text-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-green-700 transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
