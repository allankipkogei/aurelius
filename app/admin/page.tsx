"use client";
import { useState, useEffect } from "react";

// Define an interface for your watch data
interface Watch {
  id: number;
  name: string;
  brand: string;
  price: number;
  is_sold_out: boolean;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inventory, setInventory] = useState<Watch[]>([]); // Use the interface here
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    image_url: "",
  });

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

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
          price: parseInt(formData.price) || 0,
        }),
      });

      if (res.ok) {
        alert("Watch added!");
        setFormData({ name: "", brand: "", price: "", image_url: "" });
        await fetchInventory();
      }
    } catch (err) {
      alert("Error adding watch.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSoldStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_sold_out: !currentStatus }),
      });
      if (res.ok) await fetchInventory();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // Login UI (unchanged)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-neutral-900 p-8 border border-white/10 max-w-sm w-full">
          <h2 className="font-serif text-2xl text-amber-600 mb-6 italic text-center">Aurelius Vault</h2>
          <input 
            type="password" 
            placeholder="ACCESS KEY" 
            className="w-full bg-transparent border-b border-white/20 py-3 mb-6 outline-none focus:border-amber-600 text-white text-center"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-amber-600 py-3 text-white">Enter Vault</button>
        </form>
      </div>
    );
  }

  // Dashboard UI
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between mb-12">
          <h1 className="text-2xl font-serif italic">Collection Management</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-xs text-gray-500">Lock Vault</button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-900/50 p-8 border border-white/5 mb-20">
          <div className="grid grid-cols-2 gap-6">
            <input required placeholder="NAME" value={formData.name} className="bg-transparent border-b border-white/10 p-2" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input required placeholder="BRAND" value={formData.brand} className="bg-transparent border-b border-white/10 p-2" onChange={(e) => setFormData({...formData, brand: e.target.value})} />
            <input required type="number" placeholder="PRICE" value={formData.price} className="bg-transparent border-b border-white/10 p-2" onChange={(e) => setFormData({...formData, price: e.target.value})} />
            <input required placeholder="IMAGE URL" value={formData.image_url} className="bg-transparent border-b border-white/10 p-2" onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
          </div>
          <button disabled={isProcessing} className="bg-white text-black px-8 py-3 uppercase text-xs font-bold tracking-widest">
            {isProcessing ? "Processing..." : "Add to Collection"}
          </button>
        </form>

        <div className="space-y-4">
          {inventory.map((watch) => (
            <div key={watch.id} className="flex justify-between items-center bg-white/5 p-4 border border-white/5">
              <div>
                <p className="font-serif italic">{watch.name}</p>
                <p className="text-[10px] text-gray-500 uppercase">{watch.brand} • KSH {watch.price.toLocaleString()}</p>
              </div>
              <button 
                onClick={() => toggleSoldStatus(watch.id, watch.is_sold_out)}
                className={`px-4 py-2 text-[10px] font-bold border ${watch.is_sold_out ? "text-red-500 border-red-500/20" : "text-green-500 border-green-500/20"}`}
              >
                {watch.is_sold_out ? "SOLD" : "STOCK"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}