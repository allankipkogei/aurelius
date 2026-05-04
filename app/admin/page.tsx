"use client";
import { useState, useEffect } from "react";

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
  const [inventory, setInventory] = useState<Watch[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
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
    if (isAuthenticated) fetchInventory();
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
    if (!file) {
      alert("Please attach a JPG, PNG, or SVG image.");
      return;
    }
    
    setIsProcessing(true);

    try {
      // 1. Upload the validated file to Vercel Blob
      const uploadRes = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });
      
      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || "Upload failed");
      }
      
      const blob = await uploadRes.json();

      // 2. Save watch details and the new Blob URL to Neon
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image_url: blob.url,
          price: parseInt(formData.price) || 0,
        }),
      });

      if (res.ok) {
        alert("Success: Watch added to the vault.");
        setFormData({ name: "", brand: "", price: "" });
        setFile(null);
        // Clear file input manually
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        await fetchInventory();
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-neutral-900 p-8 border border-white/10 max-w-sm w-full">
          <h2 className="font-serif text-2xl text-amber-600 mb-6 italic text-center">Aurelius Vault</h2>
          <input 
            type="password" 
            placeholder="ACCESS KEY" 
            className="w-full bg-transparent border-b border-white/20 py-3 mb-6 outline-none focus:border-amber-600 text-white text-center uppercase tracking-widest"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-amber-600 py-3 text-[10px] font-bold uppercase tracking-widest text-white">Enter Vault</button>
        </form>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
          <h1 className="font-serif text-3xl italic">Collection Management</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Lock Vault</button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10 bg-neutral-900/40 p-10 border border-white/5 shadow-2xl mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <input required placeholder="WATCH NAME" value={formData.name} className="bg-transparent border-b border-white/10 py-3 outline-none focus:border-amber-600 text-sm uppercase tracking-wider" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input required placeholder="BRAND" value={formData.brand} className="bg-transparent border-b border-white/10 py-3 outline-none focus:border-amber-600 text-sm uppercase tracking-wider" onChange={(e) => setFormData({...formData, brand: e.target.value})} />
            <input required type="number" placeholder="PRICE (KSH)" value={formData.price} className="bg-transparent border-b border-white/10 py-3 outline-none focus:border-amber-600 text-sm tracking-wider" onChange={(e) => setFormData({...formData, price: e.target.value})} />
            
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-amber-600 font-bold">Image Attachment (JPG, PNG, SVG)</label>
              <input 
                required
                type="file" 
                accept=".jpg, .jpeg, .png, .svg" 
                className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
                    if (!allowedTypes.includes(selectedFile.type)) {
                      alert("Invalid format. Please use JPG, PNG, or SVG.");
                      e.target.value = ""; 
                      return;
                    }
                    setFile(selectedFile);
                  }
                }}
              />
            </div>
          </div>
          <button disabled={isProcessing} className="bg-white text-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-amber-600 hover:text-white transition-all disabled:bg-gray-800 disabled:text-gray-500">
            {isProcessing ? "Adding to Vault..." : "Add to Collection"}
          </button>
        </form>

        <section className="space-y-4">
          <h2 className="text-amber-600 uppercase tracking-[0.4em] text-[10px] mb-8 font-bold">Live Inventory Control</h2>
          {inventory.map((watch) => (
            <div key={watch.id} className="flex justify-between items-center bg-white/5 p-6 border border-white/5 hover:border-amber-600/30 transition-all">
              <div>
                <p className="font-serif text-lg italic">{watch.name}</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500">{watch.brand} • KSH {watch.price.toLocaleString()}</p>
              </div>
              <button 
                onClick={() => toggleSoldStatus(watch.id, watch.is_sold_out)}
                className={`px-6 py-2 text-[9px] uppercase tracking-widest font-bold border transition-colors ${watch.is_sold_out ? "bg-red-900/20 text-red-500 border-red-500/50 hover:bg-red-900/40" : "bg-green-900/20 text-green-500 border-green-500/50 hover:bg-green-900/40"}`}
              >
                {watch.is_sold_out ? "Sold Out" : "In Stock"}
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}