import { PromptInput } from "./types";
import { DPI, mmToPx } from "../canvas/sizes";

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

  const creativeBrief = (d.highlights ?? "").trim();

  const reservations: string[] = [];
  if (req.includeQr) {
    reservations.push(
      "Reserve a clean ~15% × 15% area in a lower corner for a QR code. Draw it as an EMPTY dashed-outline placeholder square. Render the label \"SCAN HERE TO REGISTER\" directly ABOVE the placeholder. Do NOT attempt to render an actual QR code — AI-generated QR codes will not scan.",
    );
  }
  if (req.logoSlots > 0) {
    const logoTreatments = {
      auto: "Choose a treatment that suits the poster: continuous background artwork, a tonal band, a subtle pattern, or a darker footer. Avoid a plain white panel that breaks the design.",
      light: "Use a LIGHT-COLOURED background across the entire logo strip, not just its outline. Infer a pale tint from the poster's overall palette and visual style; choose the specific hue yourself. Keep it light and visually quiet to provide contrast for dark logos added later. Use a colour rather than pure white, and avoid strong textures or imagery behind the logos.",
      dark: "Use a DARK-COLOURED background across the entire logo strip, not just its outline. Infer a deep shade from the poster's overall palette and visual style; choose the specific hue yourself. Keep it dark and visually quiet to provide contrast for light logos added later. Avoid strong textures or imagery behind the logos.",
      white: "Use a clean, solid PURE WHITE (#FFFFFF) background across the entire logo strip, not just its outline. This white logo band is intentional and explicitly permitted. Keep its interior free of textures and imagery so logos added later remain clear.",
    };
    reservations.push(
      `Near the bottom of the poster, reserve a horizontal strip (~10% tall) for ${req.logoSlots} sponsor/partner logo${req.logoSlots > 1 ? "s" : ""} to be composited on top later. ${logoTreatments[req.logoAreaStyle]} Integrate the strip's edges and spacing into the composition. Leave it free of text, invented logos, and placeholder labels.`,
    );
  }
  if (req.includePhotoSpace) {
    if (req.photoSpaceBorder) {
      reservations.push(
        "Reserve one portrait-oriented space large enough for a guest-of-honour headshot to be composited in later. Draw a clearly visible, neat solid border around this photo space, with colour and thickness that complement the poster's style. Size and position are up to you. Keep the interior visually calm and free of text, using the background artwork or a coordinating non-white tone. Keep important poster content outside the border. Do NOT invent or draw any face, figure, photo content, or placeholder label inside this space.",
      );
    } else {
      reservations.push(
        "When composing the artwork, naturally include one portrait-oriented region of the scene that is visually quiet — for example a patch of sky, a plain wall, calm water, or any uncluttered area of the background — large enough that a guest-of-honour headshot can be composited on top later. Size and position are up to you. CRITICAL: this region must be part of the continuous illustration. Do NOT cut a hole, fill the area with white or any solid colour, draw a frame/box/dashed outline, or in any way visually demarcate it. The artwork must look complete and seamless on its own; the photo region is 'reserved' only in the sense that the existing background there is calm enough that a portrait can later be pasted over it without losing important detail. Do NOT invent or draw any face, figure, or photo content.",
      );
    }
  }

  const parts = [
    `Design a complete, finished ${req.sizeName} event poster in ${req.orientation} orientation.`,
    `REQUIRED CANVAS SIZE: ${req.sizeName}, ${req.orientation}, exactly ${req.widthMm} mm wide × ${req.heightMm} mm high. The entire final canvas must have these proportions (width:height = ${req.widthMm}:${req.heightMm}); do not substitute a standard image aspect ratio or place the poster inside a differently sized canvas.`,
    `Print export target: ${mmToPx(req.widthMm)} × ${mmToPx(req.heightMm)} pixels (width × height) at ${DPI} DPI. If the image tool cannot generate the exact dimensions directly, prepare the final artwork on the specified ${req.sizeName} canvas, extending the background as needed without stretching the design or cropping text. If an exact-size export cannot be provided, state that limitation separately rather than claiming the image is already correctly sized. Do not print canvas dimensions or production instructions on the poster.`,
    styleFragment
      ? `Style: ${styleFragment}.`
      : `Infer the visual theme from the title — the artwork should evoke the subject of the event.`,
    "The poster must fill the entire canvas edge to edge (full-bleed). Do NOT leave any outer white margins or outer white borders. Reserved areas for QR, logos, or a photo must follow the specific treatments below and integrate cleanly into the composition.",
    req.logoSlots > 0 && req.logoAreaStyle === "white"
      ? "The requested white logo strip is the only intentional white panel; avoid other stark white/blank panels that break the composition."
      : "Avoid stark white/blank panels that break the composition.",
    "Event copy to render inside the poster (the list immediately below). You decide the placement, sizing, and typographic hierarchy that best suits the composition:",
    detailLines.map((l) => `  • ${l}`).join("\n"),
    creativeBrief
      ? `Creative brief — additional information and imagery requests:\nInterpret the notes below as guidance, not copy to reproduce word for word. Decide how best to communicate each note through concise poster text, imagery, or a combination. Use background context to guide the mood and composition without necessarily printing it. Depict requested objects, scenes, or activities visually rather than printing their descriptions. Turn information that viewers need to know into clear, natural wording, preserving factual details such as names, quantities, times, and conditions. Honour explicit requests to include particular information or imagery, and preserve exact wording only when requested. Do not invent facts or print these instructions or the brief heading on the poster.\n<creative_brief>\n${creativeBrief}\n</creative_brief>`
      : "",
    "Spell every visible word correctly. If a text element would render below roughly 3% of the canvas height, OMIT it rather than rendering it illegibly. Prefer fewer, larger, well-rendered text elements over many small ones. Do not invent organisation names, sponsor names, or fine print that wasn't provided.",
    reservations.length > 0
      ? `Reserve clean blank space for assets the designer will add later:\n${reservations.map((r) => `  • ${r}`).join("\n")}`
      : "",
    "Output a polished, print-ready poster — not a mockup or wireframe.",
  ];

  return parts.filter(Boolean).join("\n");
}
