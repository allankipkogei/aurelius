"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "../../context/CartContext";

interface ProductCardProps {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string | string[]; // Allow for array or string
  isSoldOut?: boolean;
}

export default function ProductCard({
  id,
  name,
  brand,
  price,
  image,
  isSoldOut
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [showFeedback, setShowFeedback] = useState(false);

  // 1. Resolve the image source logic
  // Fallback to a placeholder if the image is missing or empty
  const resolvedImage = Array.isArray(image) 
    ? (image[0] || "/placeholder-watch.jpg") 
    : (image || "/placeholder-watch.jpg");

  const handleAddToCart = () => {
    addToCart({ id, name, brand, price, image: resolvedImage });
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  return (
    <div className="group relative flex flex-col bg-neutral-900/40 border border-white/5 transition-all hover:border-amber-600/30">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-800">
        <Image
          src={resolvedImage} // Use the resolved URL
          alt={`${brand} ${name}`}
          fill
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          {!isSoldOut ? (
            <button
              onClick={handleAddToCart}
              className="bg-white text-black px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-amber-600 hover:text-white transition-colors"
            >
              Acquire Piece
            </button>
          ) : (
            <span className="bg-neutral-800 text-gray-500 px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em]">
              Acquired
            </span>
          )}
        </div>

        {isSoldOut && (
          <div className="absolute top-4 left-4 bg-amber-600 text-black px-3 py-1 text-[8px] font-bold uppercase tracking-widest">
            Sold
          </div>
        )}

        {/* Feedback Toast */}
        {showFeedback && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in">
            <div className="text-center">
              <p className="text-white text-sm font-bold mb-2">✓ Added to vault</p>
              <p className="text-gray-400 text-[10px]">{name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-6 text-center">
        <p className="text-amber-600 text-[9px] uppercase tracking-[0.3em] mb-2 font-medium">
          {brand}
        </p>
        <h3 className="text-white font-serif italic text-xl mb-3">
          {name}
        </h3>
        <p className="text-gray-400 text-[10px] tracking-widest uppercase">
          KSH {price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}