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
  details: EventDetailsPayload;
  stylePrompt: string;
  aspectRatio: string;
  widthMm: number;
  heightMm: number;
  logoSlots: number;
  includeQr: boolean;
  includePhotoSpace: boolean;
};
