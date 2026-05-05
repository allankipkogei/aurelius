"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import SearchFilter, { FilterOptions } from "./SearchFilter";

interface Watch {
  id: number;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  is_sold_out: boolean;
  created_at: string;
}

interface CollectionViewProps {
  initialWatches: Watch[];
}

export default function CollectionView({ initialWatches }: CollectionViewProps) {
  const [watches, setWatches] = useState<Watch[]>(initialWatches);
  const [isLoading, setIsLoading] = useState(false);

  // Get unique brands from watches
  const brands = Array.from(new Set(initialWatches.map((w) => w.brand))).sort();

  const handleFilter = async (filters: FilterOptions) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.brand) params.append("brand", filters.brand);
      if (filters.minPrice > 0) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice < 10000000) params.append("maxPrice", filters.maxPrice.toString());
      if (filters.sort !== "newest") params.append("sort", filters.sort);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setWatches(data);
      }
    } catch (error) {
      console.error("Filter error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="collection" className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-8">
        <div>
          <h3 className="text-amber-600 uppercase tracking-[0.5em] text-[9px] mb-4">The 2026 Registry</h3>
          <h2 className="text-4xl font-serif italic">Selected Curations</h2>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilter brands={brands} onFilter={handleFilter} />

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 uppercase tracking-widest text-[10px]">Refining selection...</p>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
        {watches.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-white/5 bg-neutral-900/20">
            <p className="text-gray-500 uppercase tracking-widest text-[10px]">No watches match your criteria</p>
          </div>
        ) : (
          watches.map((watch) => (
            <ProductCard
              key={watch.id}
              id={watch.id}
              name={watch.name}
              brand={watch.brand}
              price={watch.price}
              image={watch.image_url}
              isSoldOut={watch.is_sold_out}
            />
          ))
        )}
      </div>

      {/* Result Count */}
      {watches.length > 0 && (
        <div className="text-center mt-12">
          <p className="text-gray-500 text-[9px] uppercase tracking-widest">
            Showing {watches.length} {watches.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
      )}
    </section>
  );
}
