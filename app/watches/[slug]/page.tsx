import ImageGallery from '../../components/ImageGallery'; // Relative path
import { Pool } from 'pg';

// Using the same local pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function WatchPage({ params }: { params: { slug: string } }) {
  try {
    // Querying your local PostgreSQL instance by slug
    const { rows } = await pool.query('SELECT * FROM watches WHERE slug = $1 LIMIT 1;', [params.slug]);
    const watch = rows[0];

    if (!watch) return <div className="text-center py-20">Watch not found.</div>;

    return (
      <>
        <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12 bg-black text-white">
          <ImageGallery images={watch.images} />
          
          <div className="space-y-6">
            <h1 className="text-4xl font-serif italic">{watch.name}</h1>
            <p className="text-amber-600 uppercase tracking-widest text-xs">{watch.brand}</p>
            <p className="text-gray-400 leading-relaxed">{watch.heritage_story}</p>
            
            <div className="border-t border-white/10 pt-6">
              <h3 className="uppercase tracking-widest text-xs mb-4 text-gray-500">Specifications</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="text-gray-500">Movement:</span> {watch.movement}</li>
                <li><span className="text-gray-500">Case:</span> {watch.case_material}</li>
                <li><span className="text-gray-500">Water Resistance:</span> {watch.water_resistance}</li>
              </ul>
            </div>
          </div>
        </main>
        
        <footer className="bg-black text-white py-12 border-t border-white/10 text-center">
          <p className="text-gray-600 text-[10px] uppercase tracking-[0.5em]">&copy; {new Date().getFullYear()} Aurelius Timepieces. All rights reserved.</p>
        </footer>
      </>
    );