"use client";

import { useState, useEffect } from "react";

interface SearchFilterProps {
  brands: string[];
  onFilter: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  search: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  sort: 'newest' | 'price-low' | 'price-high' | 'name';
}

export default function SearchFilter({ brands, onFilter }: SearchFilterProps) {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [sort, setSort] = useState<'newest' | 'price-low' | 'price-high' | 'name'>('newest');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilter({ search, brand, minPrice, maxPrice, sort });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, brand, minPrice, maxPrice, sort, onFilter]);

  const hasActiveFilters = search || brand || minPrice > 0 || maxPrice < 10000000 || sort !== 'newest';

  return (
    <div className="mb-12 space-y-6">
      {/* Search Bar */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search watches..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-b border-white/10 py-3 outline-none focus:border-amber-600 text-sm uppercase tracking-wider"
        />
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-amber-600 transition-colors"
        >
          {isExpanded ? '−' : '+'} Filters
        </button>
      </div>

      {/* Expandable Filters */}
      <div className="overflow-hidden transition-all duration-300">
        {isExpanded && (
          <div className="bg-neutral-900/40 border border-white/5 p-6 space-y-6 animate-in fade-in slide-in-from-top-2">
            {/* Brand Filter */}
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-amber-600 font-bold mb-3">
                Brand
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-neutral-800 border border-white/10 text-white px-4 py-2 text-sm rounded outline-none focus:border-amber-600"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
              <label className="block text-[9px] uppercase tracking-widest text-amber-600 font-bold">
                Price Range
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
                  className="flex-1 bg-neutral-800 border border-white/10 text-white px-4 py-2 text-sm rounded outline-none focus:border-amber-600"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value) || 10000000)}
                  className="flex-1 bg-neutral-800 border border-white/10 text-white px-4 py-2 text-sm rounded outline-none focus:border-amber-600"
                />
              </div>
              <p className="text-[9px] text-gray-500">
                KSH {minPrice.toLocaleString()} - KSH {maxPrice.toLocaleString()}
              </p>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-amber-600 font-bold mb-3">
                Sort By
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'newest', label: 'Newest' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'name', label: 'Name: A-Z' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSort(option.value as any)}
                    className={`px-3 py-2 text-[9px] uppercase tracking-widest font-bold border transition-colors ${
                      sort === option.value
                        ? 'bg-amber-600 border-amber-600 text-black'
                        : 'border-white/10 text-white hover:border-amber-600/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearch("");
                  setBrand("");
                  setMinPrice(0);
                  setMaxPrice(10000000);
                  setSort('newest');
                }}
                className="w-full text-[9px] uppercase tracking-widest text-gray-500 hover:text-amber-600 transition-colors py-2 border border-white/10 hover:border-amber-600/50"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
