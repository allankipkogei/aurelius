export interface Watch {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string; // We will use placeholders for now
  description: string;
}

export const inventory: Watch[] = [
  {
    id: 1,
    name: "Classic Gold 829",
    brand: "Poedagar",
    price: 4500,
    image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1000&auto=format&fit=crop", 
    description: "Elegant gold-tone finish with a deep blue dial."
  },
  {
    id: 2,
    name: "Aviator Chronograph",
    brand: "Naviforce",
    price: 5200,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000&auto=format&fit=crop",
    description: "Rugged design for the adventurous modern man."
  },
  {
    id: 3,
    name: "Midnight Steel",
    brand: "Poedagar",
    price: 4800,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop",
    description: "Sleek black stainless steel with luminous hands."
  }
];