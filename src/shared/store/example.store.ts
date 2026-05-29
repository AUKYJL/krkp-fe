import { create } from "zustand";

export interface MapStore {
  onboardActiveSquirrelDataAttr: string;
  setOnboardActiveSquirrelDataAttr: (dataAttr: string) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  onboardActiveSquirrelDataAttr: "",
  setOnboardActiveSquirrelDataAttr: (dataAttr: string) =>
    set({ onboardActiveSquirrelDataAttr: dataAttr }),
}));
