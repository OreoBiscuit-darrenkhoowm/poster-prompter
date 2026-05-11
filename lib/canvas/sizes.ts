export type Orientation = "portrait" | "landscape";

export type SizePreset = {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  category: "paper" | "signage";
};

export const DPI = 300;
export const MM_PER_INCH = 25.4;

export const mmToPx = (mm: number, dpi = DPI) =>
  Math.round((mm / MM_PER_INCH) * dpi);

export const SIZE_PRESETS: SizePreset[] = [
  { id: "a4", label: "A4", widthMm: 210, heightMm: 297, category: "paper" },
  { id: "a3", label: "A3", widthMm: 297, heightMm: 420, category: "paper" },
  { id: "a5", label: "A5", widthMm: 148, heightMm: 210, category: "paper" },
  {
    id: "rollup",
    label: "Roll-up banner (850 × 2000)",
    widthMm: 850,
    heightMm: 2000,
    category: "signage",
  },
  {
    id: "x-stand",
    label: "X-stand (600 × 1600)",
    widthMm: 600,
    heightMm: 1600,
    category: "signage",
  },
];

export function getDimensions(
  preset: SizePreset,
  orientation: Orientation,
  dpi = DPI,
) {
  const w = mmToPx(preset.widthMm, dpi);
  const h = mmToPx(preset.heightMm, dpi);
  return orientation === "portrait"
    ? { width: w, height: h }
    : { width: h, height: w };
}

/**
 * Closest aspect-ratio bucket the AI APIs natively support, used when
 * asking the model to fill a canvas without distortion.
 */
export function aspectRatioBucket(width: number, height: number) {
  const ratio = width / height;
  const candidates = [
    { name: "1:1", value: 1 },
    { name: "3:4", value: 3 / 4 },
    { name: "4:3", value: 4 / 3 },
    { name: "9:16", value: 9 / 16 },
    { name: "16:9", value: 16 / 9 },
    { name: "2:3", value: 2 / 3 },
    { name: "3:2", value: 3 / 2 },
  ];
  let best = candidates[0];
  let bestDelta = Infinity;
  for (const c of candidates) {
    const d = Math.abs(c.value - ratio);
    if (d < bestDelta) {
      bestDelta = d;
      best = c;
    }
  }
  return best.name;
}
