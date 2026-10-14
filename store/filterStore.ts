import { create } from "zustand";

export type CarType =
  | "sedan"
  | "suv"
  | "hatchback"
  | "microbus"
  | "luxury"
  | null;

interface FilterState {
  search: string;
  type: CarType;
  mileage: number | null;
  minPrice: number | null;
  maxPrice: number | null;

  setSearch: (value: string) => void;
  setType: (value: CarType) => void;
  setMileage: (value: number | null) => void;
  setMinPrice: (value: number | null) => void;
  setMaxPrice: (value: number | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  search: "",
  type: null,
  mileage: null,
  minPrice: null,
  maxPrice: null,

  setSearch: (value) => set({ search: value }),
  setType: (value) => set({ type: value }),
  setMileage: (value) => set({ mileage: value }),
  setMinPrice: (value) => set({ minPrice: value }),
  setMaxPrice: (value) => set({ maxPrice: value }),
  resetFilters: () =>
    set({
      search: "",
      type: null,
      mileage: null,
      minPrice: null,
      maxPrice: null,
    }),
}));