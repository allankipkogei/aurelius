"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [watches, setWatches] = useState<Watch[]>(initialWatches);
  const [isLoading, setIsLoading] = useState(false);

  // Derive unique brands for the filter dropdown
  const brands = Array.from(new Set(initialWatches.map((w) => w.brand))).sort();

  const handleFilter = useCallback(async (filters: FilterOptions) => {
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.brand) params.append("brand", filters.brand);
      if (filters.minPrice > 0) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice < 10000000) params.append("maxPrice", filters.maxPrice.toString());
      if (filters.sort !== "newest") params.append("sort", filters.sort);

      // Update the browser URL without a full page reload
      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : "/#collection", { scroll: false });

      const res = await fetch(`/api/products?${queryString}`);
      if (res.ok) {
        const data = await res.json();
        setWatches(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Collection Filter Error:", error);
    } finally {
      // Small timeout to prevent flicker on ultra-fast connections
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [router]);

  return (
    <section id="collection" className="max-w-7xl mx-auto px-6 py-24 min-h-[100vh]">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-8">
        <div className="space-y-1">
          <h3 className="text-amber-600 uppercase tracking-[0.5em] text-[10px] font-medium">
            The 2026 Registry
          </h3>
          <h2 className="text-4xl md:text-5xl font-serif italic text-white/90">
            Selected Curations
          </h2>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-16">
        <SearchFilter brands={brands} onFilter={handleFilter} />
      </div>

      {/* Main Content Area */}
      <div className="relative">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {[...Array(6)].map((_, i) => (
              <div key={`skeleton-${i}`} className="space-y-6 opacity-40 animate-pulse">
                <div className="aspect-[4/5] bg-neutral-800 border border-white/5" />
                <div className="space-y-3 px-2">
                  <div className="h-2 bg-neutral-700 w-1/4" />
                  <div className="h-4 bg-neutral-700 w-3/4" />
                  <div className="h-2 bg-neutral-700 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20 transition-all duration-500">
            {watches.length === 0 ? (
              <div className="col-span-full py-32 text-center border border-white/5 bg-neutral-900/10 backdrop-blur-sm">
                <p className="text-gray-500 uppercase tracking-[0.3em] text-[11px]">
                  No pieces found in current registry
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-6 text-amber-600 text-[10px] uppercase tracking-widest hover:text-amber-500 transition-colors"
                >
                  Reset Selection
                </button>
              </div>
            ) : (
              watches.map((watch) => (
                <div 
                  key={watch.id} 
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                >
                  <ProductCard
                    id={watch.id}
                    name={watch.name}
                    brand={watch.brand}
                    price={watch.price}
                    image={watch.image_url}
                    isSoldOut={watch.is_sold_out}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Meta */}
      {!isLoading && watches.length > 0 && (
        <div className="flex flex-col items-center mt-20 pt-12 border-t border-white/5">
          <p className="text-gray-600 text-[10px] uppercase tracking-[0.4em] font-light">
            Displaying {watches.length} {watches.length === 1 ? "Archival Piece" : "Archival Pieces"}
          </p>
        </div>
      )}
    </section>
  );
}