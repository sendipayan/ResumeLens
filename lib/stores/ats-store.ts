"use client";

import { create } from "zustand";

export type AtsResult = {
  ATS_score: number;
  section_score: number;
  contact_score: number;
  formating_score: number;
  issues: string[];
};

type AtsState = {
  atsResult: AtsResult | null;
  analyzedAt: string | null;
  setAtsResult: (payload: { result: AtsResult; analyzedAt: string }) => void;
  clearAtsResult: () => void;
};

export const useAtsStore = create<AtsState>((set) => ({
  atsResult: null,
  analyzedAt: null,
  setAtsResult: (payload) =>
    set({ atsResult: payload.result, analyzedAt: payload.analyzedAt }),
  clearAtsResult: () => set({ atsResult: null, analyzedAt: null }),
}));
