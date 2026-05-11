import { PromptInput } from "./types";

function formatPrice(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^free$/i.test(trimmed)) return "Free";
  const withoutCurrency = trimmed.replace(/^\$+/, "");
  return `$${withoutCurrency}`;
}

export function buildPrompt(req: PromptInput): string {
  const styleFragment = req.stylePrompt.trim();

  const d = req.details;
  const detailLines: string[] = [`Title: "${d.title || "(your title)"}"`];
  if (d.date?.trim()) detailLines.push(`Date: ${d.date.trim()}`);
  if (d.time?.trim()) detailLines.push(`Time: ${d.time.trim()}`);
  if (d.venue?.trim()) detailLines.push(`Venue: ${d.venue.trim()}`);
  if (d.price?.trim()) detailLines.push(`Ticket Price: ${formatPrice(d.price)}`);
  if (d.tnc?.trim()) detailLines.push(`Fine print (T&C): ${d.tnc.trim()}`);

  const highlightLines = (d.highlights ?? "")
    .split(/\r?\n+/)
    .map((l) => l.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);

  const reservations: string[] = [];
  if (req.includeQr) {
    reservations.push(
      "Reserve a clean ~15% × 15% area in a lower corner for a QR code. Draw it as an EMPTY dashed-outline placeholder square. Render the label \"SCAN HERE TO REGISTER\" directly ABOVE the placeholder. Do NOT attempt to render an actual QR code — AI-generated QR codes will not scan.",
    );
  }
  if (req.logoSlots > 0) {
    reservations.push(
      `Near the bottom of the poster, keep a horizontal strip (~10% tall) visually calm so ${req.logoSlots} sponsor/partner logo${req.logoSlots > 1 ? "s" : ""} can be composited on top later. How that strip is filled is up to you — continuous background artwork, a tonal band, a subtle pattern, a darker footer, etc. — just not a plain white/blank panel that breaks the design.`,
    );
  }
  if (req.includePhotoSpace) {
    reservations.push(
      "When composing the artwork, naturally include one portrait-oriented region of the scene that is visually quiet — for example a patch of sky, a plain wall, calm water, or any uncluttered area of the background — large enough that a guest-of-honour headshot can be composited on top later. Size and position are up to you. CRITICAL: this region must be part of the continuous illustration. Do NOT cut a hole, fill the area with white or any solid colour, draw a frame/box/dashed outline, or in any way visually demarcate it. The artwork must look complete and seamless on its own; the photo region is 'reserved' only in the sense that the existing background there is calm enough that a portrait can later be pasted over it without losing important detail. Do NOT invent or draw any face, figure, or photo content.",
    );
  }

  const parts = [
    `Design a complete, finished event poster.`,
    styleFragment
      ? `Style: ${styleFragment}.`
      : `Infer the visual theme from the title — the artwork should evoke the subject of the event.`,
    `Canvas: ${req.widthMm} × ${req.heightMm} mm (aspect ratio ${req.aspectRatio}).`,
    "The poster must fill the entire canvas edge to edge (full-bleed). Do NOT leave any white margins, white borders, or stark white/blank panels that break the composition. Reserved areas for QR, logos, or a photo should integrate cleanly into the design — the exact treatment (continuous artwork, tonal band, subtle pattern, footer band, etc.) is up to you, as long as it doesn't read as an empty white void.",
    "Render all the following copy directly inside the poster. You decide the placement, sizing, and typographic hierarchy that best suits the composition:",
    detailLines.map((l) => `  • ${l}`).join("\n"),
    highlightLines.length > 0
      ? `Render these additional details inside the poster, weighted by importance — choose typography and placement that fits the composition. They are content, not fine print:\n${highlightLines.map((l) => `  • ${l}`).join("\n")}`
      : "",
    "Spell every visible word correctly. If a text element would render below roughly 3% of the canvas height, OMIT it rather than rendering it illegibly. Prefer fewer, larger, well-rendered text elements over many small ones. Do not invent organisation names, sponsor names, or fine print that wasn't provided.",
    reservations.length > 0
      ? `Reserve clean blank space for assets the designer will add later:\n${reservations.map((r) => `  • ${r}`).join("\n")}`
      : "",
    "Output a polished, print-ready poster — not a mockup or wireframe.",
  ];

  return parts.filter(Boolean).join("\n");
}
