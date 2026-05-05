import ProductCard from "./components/ProductCard";
import { RiWhatsappFill } from 'react-icons/ri';
import { db } from '@vercel/postgres'; // Assuming you're using Vercel Postgres

async function getWatches() {
  try {
    // Fetching directly from your database for the "2026 Registry"
    const { rows } = await db.sql`SELECT * FROM watches ORDER BY created_at DESC;`;
    return rows;
  } catch (error) {
    console.error("Database connection failed:", error);
    console.warn("Database unavailable. The homepage will display with an empty collection message.");
    return [];
  }
}

export default async function Home() {
  const inventory = await getWatches();

  return (
    <main className="min-h-screen bg-black text-white antialiased">
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 text-center">
        <h1 className="text-5xl md:text-8xl font-serif mb-6 italic">
          Timeless <span className="text-amber-600">Precision.</span>
        </h1>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] max-w-2xl mx-auto leading-loose">
          Curated excellence for the modern gentleman. Discover high-caliber 
          timepieces delivered across Nairobi's elite circles.
        </p>
      </section>

      {/* Collection Section */}
      <section id="collection" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-16 border-b border-white/10 pb-8">
          <div>
            <h3 className="text-amber-600 uppercase tracking-[0.5em] text-[9px] mb-4">The 2026 Registry</h3>
            <h2 className="text-4xl font-serif italic">Selected Curations</h2>
          </div>
          <button className="text-[10px] uppercase tracking-[0.3em] text-gray-500 hover:text-amber-600 transition-colors">
            View Full Gallery
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {inventory.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-white/5 bg-neutral-900/20">
              <p className="text-gray-500 uppercase tracking-widest text-[10px]">Awaiting New Acquisitions</p>
            </div>
          ) : (
            inventory.map((watch) => (
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
      </section>

      {/* Heritage Section */}
      <section id="heritage" className="py-32 px-6 bg-neutral-950">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="w-full lg:w-1/2">
            <h3 className="text-amber-600 uppercase tracking-[0.6em] text-[10px] mb-6">The Aurelius Standard</h3>
            <h4 className="text-4xl md:text-5xl font-serif mb-8 italic leading-tight">The Weight of Excellence.</h4>
            <p className="text-gray-400 leading-relaxed font-light tracking-wide">
              Aurelius was founded in Nairobi for those who understand that a timepiece is more than a tool—it is an inheritance. We curate only pieces that command respect and maintain the horological integrity required by East Africa's most discerning collectors.
            </p>

          </div>

          <div className="w-full lg:w-1/2 aspect-[4/5] relative grayscale hover:grayscale-0 transition-all duration-1000 border border-white/5">
            <img 
              src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000&auto=format&fit=crop" 
              alt="Horological Excellence" 
              className="w-full h-full object-cover opacity-80" 
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 md:py-20 px-4 md:px-6 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-amber-600 uppercase tracking-[0.6em] text-[9px] md:text-[10px] mb-4 md:mb-6">Get In Touch</h3>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif italic mb-6 md:mb-8">Inquiries & Acquisitions</h2>
          <a 
            href="https://wa.me/254118983818" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-4 px-4 md:px-8 py-3 md:py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors w-full md:w-auto max-w-sm md:max-w-none"
          >
            <RiWhatsappFill className="text-2xl md:text-3xl flex-shrink-0" />
            <div className="text-center md:text-left">
              <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] opacity-90">WhatsApp</p>
              <p className="text-base md:text-lg font-semibold">+254 118 983 818</p>
            </div>
          </a>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-gray-600 text-[10px] uppercase tracking-[0.5em]">© 2026 Aurelius Timepieces</p>
      </footer>
    </main>
  );
}