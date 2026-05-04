"use client";

import Link from "next/link";
import { useState } from "react";
// Import from your Context, not the raw hook file, to avoid scope errors
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/5 px-6 md:px-12 py-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-black font-bold text-sm transition-transform group-hover:rotate-12">
            A
          </div>
          <span className="text-white tracking-[0.4em] uppercase text-sm font-light">Aurelius</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-12 text-[10px] uppercase tracking-[0.3em] text-gray-400">
          <Link href="#collection" className="hover:text-amber-600 transition-colors">Collection</Link>
          <Link href="#heritage" className="hover:text-amber-600 transition-colors">Heritage</Link>
          <Link href="#contact" className="hover:text-amber-600 transition-colors">Contact</Link>
        </div>

        {/* Action Area (Mobile Toggle + Cart) */}
        <div className="flex items-center gap-4">
          {/* Cart Button */}
          <button className="relative text-white border border-white/20 px-6 py-2 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            Cart ({itemCount})
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-600 text-black w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d={isOpen ? "M18 6L6 18M6 6l12 12" : "M3 12h18M3 6h18M3 18h18"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-black border-b border-white/10 flex flex-col p-8 gap-6 md:hidden animate-in fade-in slide-in-from-top-4">
          <Link href="#collection" onClick={() => setIsOpen(false)} className="text-[10px] uppercase tracking-[0.3em] text-white">Collection</Link>
          <Link href="#heritage" onClick={() => setIsOpen(false)} className="text-[10px] uppercase tracking-[0.3em] text-white">Heritage</Link>
          <Link href="#contact" onClick={() => setIsOpen(false)} className="text-[10px] uppercase tracking-[0.3em] text-white">Contact</Link>
        </div>
      )}
    </nav>
  );
}