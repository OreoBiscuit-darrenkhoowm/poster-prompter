"use client";

import { create } from "zustand";
import { Orientation, SIZE_PRESETS, SizePreset } from "@/lib/canvas/sizes";

export type EventDetails = {
  title: string;
  date: string;
  venue: string;
  time: string;
  highlights: string;
  price: string;
  tnc: string;
};

type PosterState = {
  details: EventDetails;
  stylePrompt: string;
  sizePreset: SizePreset;
  orientation: Orientation;
  logoCount: number;
  includeQr: boolean;
  includePhotoSpace: boolean;

  setDetails: (patch: Partial<EventDetails>) => void;
  setStylePrompt: (s: string) => void;
  setSizePreset: (s: SizePreset) => void;
  setOrientation: (o: Orientation) => void;
  setLogoCount: (n: number) => void;
  setIncludeQr: (b: boolean) => void;
  setIncludePhotoSpace: (b: boolean) => void;
};

const DEFAULT_DETAILS: EventDetails = {
  title: "",
  date: "",
  venue: "",
  time: "",
  highlights: "",
  price: "",
  tnc: "",
};

export const usePosterStore = create<PosterState>((set) => ({
  details: DEFAULT_DETAILS,
  stylePrompt: "",
  sizePreset: SIZE_PRESETS[0],
  orientation: "portrait",
  logoCount: 2,
  includeQr: true,
  includePhotoSpace: false,

  setDetails: (patch) =>
    set((s) => ({ details: { ...s.details, ...patch } })),
  setStylePrompt: (stylePrompt) => set({ stylePrompt }),
  setSizePreset: (sizePreset) => set({ sizePreset }),
  setOrientation: (orientation) => set({ orientation }),
  setLogoCount: (n) =>
    set({ logoCount: Math.max(0, Math.min(6, Math.round(n))) }),
  setIncludeQr: (includeQr) => set({ includeQr }),
  setIncludePhotoSpace: (includePhotoSpace) => set({ includePhotoSpace }),
}));
