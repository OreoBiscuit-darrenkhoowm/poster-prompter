import type { Orientation } from "../canvas/sizes";

export type LogoAreaStyle = "auto" | "light" | "dark" | "white";

export type EventDetailsPayload = {
  title: string;
  date?: string;
  time?: string;
  venue?: string;
  highlights?: string;
  price?: string;
  tnc?: string;
};

export type PromptInput = {
  /** One entry per event on the poster (1 or 2). */
  events: EventDetailsPayload[];
  /** Optional overall heading used when the poster promotes multiple events. */
  posterHeadline?: string;
  stylePrompt: string;
  sizeName: string;
  orientation: Orientation;
  widthMm: number;
  heightMm: number;
  logoSlots: number;
  logoAreaStyle: LogoAreaStyle;
  includeQr: boolean;
  includePhotoSpace: boolean;
  photoSpaceBorder: boolean;
};
