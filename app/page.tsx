"use client";
import { useState, useEffect } from "react";
import { inventory } from "./data/watches";

export default function Home() {
  const [cartCount, setCartCount] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const currentYear = new Date().getFullYear();

  // Handle navbar background on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const addToCart = () => setCartCount(prev => prev + 1);

  // --- NEW: M-PESA TRIGGER LOGIC ---
  const handlePayment = async () => {
    if (!phoneNumber) {
      alert("Please enter a phone number");
      return;
    }

    // Convert 07... to 2547... format for Safaricom
    const formattedPhone = phoneNumber.startsWith('0') 
      ? '254' + phoneNumber.slice(1) 
      : phoneNumber.replace(/\s+/g, ''); // Remove spaces

    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: cartCount * 2500, 
          phone: formattedPhone,
        }),
      });

      const data = await response.json();

      if (data.ResponseCode === "0") {
        alert("Success! Check your phone for the M-Pesa prompt.");
        setIsCheckoutOpen(false); 
      } else {
        alert("M-Pesa Error: " + (data.CustomerMessage || "Request failed. Check Vercel logs."));
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Failed to connect to the payment server.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-transparent text-white font-sans selection:bg-amber-600/30 selection:text-white">
      
      {/* 1. Dynamic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(45,45,45,1)_0%,_rgba(5,5,5,1)_100%)] -z-20" />
      
      {/* 2. Polished Navigation */}
      <nav className={`fixed top-0 left-0 right-0 px-6 py-4 flex justify-between items-center z-50 transition-all duration-500 ${
        scrolled ? "bg-[#050505]/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      }`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center font-serif text-sm text-white group-hover:scale-110 transition-transform">A</div>
            <span className="text-xl font-serif tracking-[0.2em] uppercase text-white/90">Aurelius</span>
          </div>
        </div>

        <div className="hidden md:flex gap-10 text-[10px] uppercase tracking-[0.3em] text-gray-400">
          <a href="#collection" className="hover:text-amber-500 transition-colors italic">Collection</a>
          <a href="#about" className="hover:text-amber-500 transition-colors italic">Heritage</a>
          <a href="#contact" className="hover:text-amber-500 transition-colors italic">Contact</a>
        </div>

        <button 
          onClick={() => setIsCheckoutOpen(true)}
          className="text-[10px] uppercase tracking-[0.2em] border border-white/10 px-6 py-2.5 hover:bg-white hover:text-black transition-all duration-500 active:scale-95"
        >
          Cart ({cartCount})
        </button>
      </nav>

      {/* 3. Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden bg-transparent">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] md:w-[700px] md:h-[700px] bg-amber-600/10 blur-[160px] rounded-full -z-10 animate-pulse" />
        
        <h1 className="text-4xl sm:text-6xl md:text-9xl font-serif mb-8 sm:mb-8 tracking-tighter text-white/95 leading-none">
          Timeless <br className="md:hidden" /> <span className="italic text-amber-600">Precision.</span>
        </h1>
        <p className="max-w-xl text-gray-400 text-sm sm:text-base md:text-lg mb-8 sm:mb-12 font-light leading-relaxed tracking-wide">
          Curated excellence for the modern gentleman. Discover high-caliber timepieces 
          delivered across Nairobi's elite circles.
        </p>
        <a href="#collection" className="group relative bg-amber-600 overflow-hidden text-white px-12 py-5 text-[10px] uppercase tracking-[0.4em] transition-all shadow-2xl shadow-amber-900/40">
          <span className="relative z-10">Explore Collection</span>
          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 -z-0" />
        </a>
      </section>

      {/* 4. Collection Section */}
      <section id="collection" className="py-20 sm:py-28 md:py-32 px-4 sm:px-6 bg-[#0a0a0a]/40 border-y border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
            <div>
              <h3 className="text-amber-600 uppercase tracking-[0.5em] text-[10px] mb-4">The Registry</h3>
              <h4 className="text-4xl md:text-5xl font-serif italic text-white/90">Selected Curations</h4>
            </div>
            <button className="text-[10px] uppercase tracking-[0.3em] border-b border-amber-600/50 pb-2 text-gray-400 hover:text-amber-500 transition-colors italic">
              View Full Gallery
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 md:gap-16">
            {inventory.map((watch) => (
              <div key={watch.id} className="group">
                <div className="aspect-[4/5] bg-neutral-900/20 mb-8 overflow-hidden border border-white/5 relative">
                  <img 
                    src={watch.image} 
                    alt={watch.name} 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-80 group-hover:opacity-100 grayscale-[30%] group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]">
                    <button 
                      onClick={addToCart}
                      className="bg-white text-black px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-amber-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
                    >
                      Acquire Piece
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-lg font-serif text-white/90 uppercase tracking-tight group-hover:text-amber-500 transition-colors">{watch.name}</h5>
                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mt-1 font-medium italic">{watch.brand}</p>
                  </div>
                  <p className="text-amber-600 font-light tracking-widest text-sm pt-1">KSH {watch.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Heritage Section */}
      <section id="about" className="py-20 sm:py-32 md:py-40 px-4 sm:px-6 bg-transparent">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div className="w-full lg:w-1/2 aspect-[4/5] relative group">
            <div className="absolute -inset-4 border border-amber-600/20 translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-700" />
            <div className="w-full h-full bg-neutral-900 relative border border-white/5 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000&auto=format&fit=crop" 
                alt="Craftsmanship" 
                className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-[3s]"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#050505] via-transparent to-transparent" />
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <h3 className="text-amber-600 uppercase tracking-[0.6em] text-[10px] mb-8">The Aurelius Standard</h3>
            <h4 className="text-5xl md:text-7xl font-serif mb-12 italic leading-tight text-white/95">
              The Weight of <br /> Excellence.
            </h4>
            <div className="space-y-10 text-gray-400 font-light leading-loose text-lg">
              <p>
                Aurelius was founded in Nairobi for those who understand that a timepiece is more than a tool—it is an inheritance. We curate only pieces that command respect.
              </p>
              <div className="flex items-center gap-6 pt-8">
                <div className="h-[1px] w-24 bg-amber-600/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact Section */}
      <section id="contact" className="py-32 px-6 bg-[#0a0a0a]/80 border-t border-white/5 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-24">
            <h3 className="text-amber-600 uppercase tracking-[0.6em] text-[10px] mb-6">Concierge Services</h3>
            <h4 className="text-4xl md:text-5xl font-serif italic mb-4">Request a Private Showing</h4>
            <p className="text-gray-500 font-light tracking-widest text-sm uppercase">Available across Nairobi's Central Districts</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24 text-[10px] tracking-[0.4em] text-gray-400 uppercase text-center">
            <div className="space-y-4">
              <p className="text-amber-600 italic font-bold">Direct Line</p>
              <p>+254 118983818</p>
            </div>
          </div>

          <form className="max-w-2xl mx-auto space-y-10">
            <div className="group relative">
              <input type="text" placeholder="NAME" className="w-full bg-transparent border-b border-white/10 py-4 text-xs tracking-[0.3em] focus:border-amber-600 outline-none transition-all placeholder:text-gray-800 uppercase text-white" />
            </div>
            <button type="button" className="w-full bg-white text-black py-6 text-[11px] font-bold uppercase tracking-[0.6em] hover:bg-amber-600 hover:text-white transition-all duration-500">
              Send Inquiry
            </button>
          </form>
        </div>
      </section>

      {/* 7. Footer - Updated for better visibility */}
      <footer className="py-12 px-4 sm:px-6 text-center border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex justify-center gap-6 mb-6 text-[10px] uppercase tracking-[0.3em] text-gray-400">
          <a href="#" className="hover:text-amber-600 transition-colors">Instagram</a>
        </div>
        <p className="text-[9px] sm:text-[9px] uppercase tracking-[0.5em] text-gray-500 font-medium">
          © {currentYear} Aurelius Timepieces Nairobi • A Standard of Excellence
        </p>
      </footer>

      {/* 8. Modern Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-[#050505] border border-white/10 p-12 max-w-md w-full relative">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center font-serif text-lg text-white mx-auto mb-6">M</div>
              <h3 className="font-serif text-3xl italic mb-2">M-Pesa Express</h3>
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mb-10">Secure Checkout Service</p>
              
              <div className="bg-white/5 p-6 mb-8 border border-white/5 text-left">
                <div className="flex justify-between text-[10px] tracking-widest text-gray-400 uppercase mb-2">
                  <span>Items</span>
                  <span>{cartCount} Pieces</span>
                </div>
                <div className="h-[1px] bg-white/5 my-4" />
                <div className="flex justify-between text-amber-600 text-xs tracking-[0.2em] font-bold uppercase">
                  <span>Grand Total</span>
                  <span>KSH {(cartCount * 2500).toLocaleString()}</span>
                </div>
              </div>

              <input 
                type="text" 
                placeholder="254 7XX XXX XXX" 
                className="w-full bg-transparent border-b border-white/20 py-4 text-center text-lg outline-none focus:border-amber-600 mb-10 transition-all font-mono tracking-widest text-white"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              
              {/* --- CONNECTED PAYMENT BUTTON --- */}
              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className={`w-full py-5 text-[11px] font-bold uppercase tracking-[0.5em] transition-all shadow-2xl ${
                  isProcessing ? "bg-gray-700 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700 shadow-amber-900/40"
                }`}
              >
                {isProcessing ? "Processing..." : "Request Payment"}
              </button>

              <p className="mt-6 text-[9px] text-gray-600 uppercase tracking-widest leading-loose text-center">
                By proceeding, you will receive an M-Pesa prompt <br/> to authorize this acquisition.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}