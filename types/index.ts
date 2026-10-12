export interface Car {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  year: number;
  mileage: number;
  engine_size: number;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  images: string[];
  is_featured: boolean;
  is_sold: boolean;
  created_at: string;
}