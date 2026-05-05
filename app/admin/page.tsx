"use client";
import { useState, useEffect } from "react";

interface Watch {
  id: number;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  is_sold_out: boolean;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inventory, setInventory] = useState<Watch[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    imageUrl: "",
  });

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1523170335684-f042070fe1c7?q=80&w=1000&auto=format&fit=crop";

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
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Aurelius2026";
    if (password === adminPassword) {
      setIsAuthenticated(true);
    } else {
      alert("Unauthorized access.");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", brand: "", price: "", imageUrl: "" });
    setFile(null);
    setEditingId(null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEdit = (watch: Watch) => {
    setEditingId(watch.id);
    setFormData({
      name: watch.name,
      brand: watch.brand,
      price: watch.price.toString(),
      imageUrl: watch.image_url,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this watch?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Watch deleted successfully.");
        await fetchInventory();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete watch");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = formData.imageUrl;
    setIsProcessing(true);

    // Validate that we have either a manual URL or a file to upload
    if (!imageUrl && !file) {
      alert("Please either:\n1) Paste an image URL, or\n2) Upload an image file\n\nTo enable file uploads, add BLOB_READ_WRITE_TOKEN to .env.local");
      setIsProcessing(false);
      return;
    }

    try {
      // If file is provided, try to upload it
      if (file) {
        try {
          const uploadRes = await fetch(`/api/upload?filename=${file.name}`, {
            method: 'POST',
            body: file,
          });
          
          if (uploadRes.ok) {
            const blob = await uploadRes.json();
            imageUrl = blob.url;
            alert(`✓ Image uploaded successfully`);
          } else {
            let errorMsg = "File upload failed. Please use image URL instead.";
            try {
              const errorData = await uploadRes.json();
              errorMsg = errorData.error || errorMsg;
            } catch (e) {
              // Response wasn't JSON, use default message
            }
            console.error("Upload error:", errorMsg);
            // If file upload fails but they have a URL, use that
            if (!imageUrl) {
              alert(errorMsg);
              setIsProcessing(false);
              return;
            }
          }
        } catch (uploadErr: any) {
          const errorMsg = uploadErr.message || "Network error during upload. Please use image URL instead.";
          console.error("Upload error:", errorMsg);
          // If file upload fails but they have a URL, use that
          if (!imageUrl) {
            alert(errorMsg);
            setIsProcessing(false);
            return;
          }
        }
      }
      
      // Use default image if no URL provided and upload failed
      if (!imageUrl) {
        imageUrl = DEFAULT_IMAGE;
      }

      const payload = {
        name: formData.name,
        brand: formData.brand,
        image_url: imageUrl,
        price: parseInt(formData.price) || 0,
      };

      // Create or Update
      const res = await fetch(
        `/api/products${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        alert(editingId ? "Watch updated successfully." : "Watch added to the vault.");
        resetForm();
        await fetchInventory();
      } else {
        const error = await res.json();
        throw new Error(error.error || "Operation failed");
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
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
          <h1 className="font-serif text-3xl italic">Collection Management</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Lock Vault</button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10 bg-neutral-900/40 p-10 border border-white/5 shadow-2xl mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-amber-600 uppercase tracking-[0.4em] text-[10px] font-bold">
              {editingId ? "Edit Watch" : "Add New Watch"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[9px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <input required placeholder="WATCH NAME" value={formData.name} className="bg-transparent border-b border-white/10 py-3 outline-none focus:border-amber-600 text-sm uppercase tracking-wider" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input required placeholder="BRAND" value={formData.brand} className="bg-transparent border-b border-white/10 py-3 outline-none focus:border-amber-600 text-sm uppercase tracking-wider" onChange={(e) => setFormData({...formData, brand: e.target.value})} />
            <input required type="number" placeholder="PRICE (KSH)" value={formData.price} className="bg-transparent border-b border-white/10 py-3 outline-none focus:border-amber-600 text-sm tracking-wider" onChange={(e) => setFormData({...formData, price: e.target.value})} />
            
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-amber-600 font-bold">Image URL (Optional)</label>
              <input 
                type="text" 
                placeholder="https://example.com/image.jpg" 
                value={formData.imageUrl}
                className="bg-transparent border-b border-white/10 py-3 outline-none focus:border-amber-600 text-sm"
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-amber-600 font-bold">Or Upload Image (JPG, PNG, SVG)</label>
            <input 
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
            <p className="text-[8px] text-gray-500">Note: Requires BLOB_READ_WRITE_TOKEN in .env.local. Without it, use the Image URL field above.</p>
          </div>

          <div className="flex gap-4">
            <button disabled={isProcessing} className="flex-1 bg-white text-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-amber-600 hover:text-white transition-all disabled:bg-gray-800 disabled:text-gray-500">
              {isProcessing ? (editingId ? "Updating..." : "Adding...") : (editingId ? "Update Watch" : "Add to Collection")}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-4 border border-white/20 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
              >
                Clear Form
              </button>
            )}
          </div>
        </form>

        <section className="space-y-4">
          <h2 className="text-amber-600 uppercase tracking-[0.4em] text-[10px] mb-8 font-bold">Live Inventory Control ({inventory.length})</h2>
          {inventory.length === 0 ? (
            <div className="text-center py-12 border border-white/5 bg-neutral-900/20">
              <p className="text-gray-500 text-[10px] uppercase tracking-widest">No watches in collection yet</p>
            </div>
          ) : (
            inventory.map((watch) => (
              <div key={watch.id} className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white/5 p-6 border border-white/5 hover:border-amber-600/30 transition-all">
                <div className="flex-1">
                  <p className="font-serif text-lg italic">{watch.name}</p>
                  <p className="text-[9px] uppercase tracking-widest text-gray-500">{watch.brand} • KSH {watch.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button 
                    onClick={() => toggleSoldStatus(watch.id, watch.is_sold_out)}
                    className={`px-4 py-2 text-[9px] uppercase tracking-widest font-bold border transition-colors ${watch.is_sold_out ? "bg-red-900/20 text-red-500 border-red-500/50 hover:bg-red-900/40" : "bg-green-900/20 text-green-500 border-green-500/50 hover:bg-green-900/40"}`}
                  >
                    {watch.is_sold_out ? "Sold Out" : "In Stock"}
                  </button>
                  <button 
                    onClick={() => handleEdit(watch)}
                    className="px-4 py-2 text-[9px] uppercase tracking-widest font-bold border border-amber-600/50 text-amber-600 bg-amber-900/20 hover:bg-amber-900/40 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(watch.id)}
                    className="px-4 py-2 text-[9px] uppercase tracking-widest font-bold border border-red-600/50 text-red-500 bg-red-900/20 hover:bg-red-900/40 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}