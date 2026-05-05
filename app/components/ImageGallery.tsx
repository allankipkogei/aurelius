'use client';
import { useState } from 'react';

export default function ImageGallery({ images }: { images: string[] }) {
  const [activeImg, setActiveImg] = useState(images[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden cursor-zoom-in group">
        <img 
          src={activeImg} 
          alt="Watch Detail" 
          className="transition-transform duration-500 group-hover:scale-150"
        />
      </div>
      <div className="flex gap-2">
        {images.map((img) => (
          <button key={img} onClick={() => setActiveImg(img)}>
            <img src={img} className="w-20 h-20 object-cover border hover:border-orange-500" />
          </button>
        ))}
      </div>
    </div>
  );
}