import { create } from "zustand";
import type { Store } from "../types/models";

type AppState = {
  addressLabel: string;
  selectedStore: Store | null;
  setAddressLabel: (label: string) => void;
  setSelectedStore: (store: Store | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  addressLabel: "나주시 빛가람동",
  selectedStore: null,
  setAddressLabel: (addressLabel) => set({ addressLabel }),
  setSelectedStore: (selectedStore) => set({ selectedStore }),
}));
