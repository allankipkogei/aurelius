"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    image_url: "",
  });

  // 1. Fetch Inventory Data
  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
  };

  // 2. Load inventory on successful login
  useEffect(() => {
    if (isAuthenticated) {
      fetchInventory();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Aurelius2026") {
      setIsAuthenticated(true);
    } else {
      alert("Unauthorized access.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
        }),
      });

      if (res.ok) {
        alert("Watch added to the vault successfully.");
        setFormData({ name: "", brand: "", price: "", image_url: "" });
        fetchInventory(); // Refresh the list after adding
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || "Failed to add watch"}`);
      }
    } catch (err) {
      alert("Network error. Check your console.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Toggle Sold Status
  const toggleSoldStatus = async (id: number, currentStatus: boolean) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_sold_out: !currentStatus }),
      });
      fetchInventory(); // Refresh the list
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-neutral-900 p-8 border border-white/10 max-w-sm w-full">
          <h2 className="font-serif text-2xl text-amber-600 mb-6 italic text-center">Aurelius Vault</h2>
          <input 
            type="password" 
            placeholder="ACCESS KEY" 
            className="w-full bg-transparent border-b border-white/20 py-3 mb-6 outline-none focus:border-amber-600 text-white text-center tracking-widest uppercase"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-amber-600 py-3 text-[10px] font-bold uppercase tracking-widest text-white">Enter Vault</button>
        </form>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
          <h1 className="font-serif text-3xl italic">Collection Management</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Lock Vault</button>
        </header>

        {/* Product Entry Form */}
        <section className="bg-neutral-900/40 p-10 border border-white/5 shadow-2xl">
          <h2 className="text-amber-600 uppercase tracking-[0.4em] text-[10px] mb-10 font-bold">New Acquisition Details</h2>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <input 
                required
                placeholder="WATCH NAME" 
                className="bg-transparent border-b border-white/10 py-3 outline-none focus:border-amber-600 text-sm uppercase tracking-wider"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <input 
                required
                placeholder="BRAND" 
                className="bg-transparent border-b border-white/10 py-3 outline-none focus:border-amber-600 text-sm uppercase tracking-wider"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
              />
              <input 
                required
                type="number"
                placeholder="PRICE (KSH)" 
                className="bg-transparent border-b border-white/10 py-3 outline-none focus:border-amber-600 text-sm tracking-wider"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
              <input 
                required
                placeholder="IMAGE URL" 
                className="bg-transparent border-b border-white/10 py-3 outline-none focus:border-amber-600 text-sm tracking-wider"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              />
            </div>
            <button 
              disabled={isProcessing}
              className="bg-white text-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-amber-600 hover:text-white transition-all disabled:bg-gray-800 disabled:text-gray-500"
            >
              {isProcessing ? "Processing..." : "Add to Collection"}
            </button>
          </form>
        </section>

        {/* Live Inventory List */}
        <section className="mt-20">
          <h2 className="text-amber-600 uppercase tracking-[0.4em] text-[10px] mb-8 font-bold">Live Inventory Control</h2>
          <div className="grid gap-4">
            {inventory.length === 0 ? (
              <p className="text-gray-600 text-xs italic tracking-widest uppercase text-center py-10">The vault is currently empty.</p>
            ) : (
              inventory.map((watch: any) => (
                <div key={watch.id} className="flex justify-between items-center bg-white/5 p-6 border border-white/5 hover:border-amber-600/30 transition-all">
                  <div>
                    <p className="font-serif text-lg italic">{watch.name}</p>
                    <p className="text-[9px] uppercase tracking-widest text-gray-500">{watch.brand} • KSH {watch.price.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => toggleSoldStatus(watch.id, watch.is_sold_out)}
                    className={`px-6 py-2 text-[9px] uppercase tracking-widest font-bold border transition-colors ${
                      watch.is_sold_out 
                      ? "bg-red-900/20 text-red-500 border-red-500/50 hover:bg-red-900/40" 
                      : "bg-green-900/20 text-green-500 border-green-500/50 hover:bg-green-900/40"
                    }`}
                  >
                    {watch.is_sold_out ? "Sold Out" : "In Stock"}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}