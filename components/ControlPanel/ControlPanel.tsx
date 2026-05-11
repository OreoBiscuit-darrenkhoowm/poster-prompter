"use client";

import { usePosterStore } from "@/lib/state/posterStore";
import { SIZE_PRESETS } from "@/lib/canvas/sizes";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  const {
    details,
    setDetails,
    stylePrompt,
    setStylePrompt,
    sizePreset,
    setSizePreset,
    orientation,
    setOrientation,
    logoCount,
    setLogoCount,
    includeQr,
    setIncludeQr,
    includePhotoSpace,
    setIncludePhotoSpace,
  } = usePosterStore();

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-5 text-sm text-zinc-200">
      <Section title="Event details">
        <Field label="Title">
          <input
            value={details.title}
            onChange={(e) => setDetails({ title: e.target.value })}
            className={inputCls}
            placeholder="Saturday Jazz Night"
          />
        </Field>
        <Field label="Date">
          <input
            value={details.date}
            onChange={(e) => setDetails({ date: e.target.value })}
            className={inputCls}
            placeholder="Saturday, 12 July 2026"
          />
        </Field>
        <Field label="Time">
          <input
            value={details.time}
            onChange={(e) => setDetails({ time: e.target.value })}
            className={inputCls}
            placeholder="7:00 PM"
          />
        </Field>
        <Field label="Venue">
          <input
            value={details.venue}
            onChange={(e) => setDetails({ venue: e.target.value })}
            className={inputCls}
            placeholder="Marina Bay Convention Hall"
          />
        </Field>
        <Field label="Ticket Price (optional)">
          <input
            value={details.price}
            onChange={(e) => setDetails({ price: e.target.value })}
            className={inputCls}
            placeholder="e.g. 8 or 8/pax — leave blank if free"
          />
        </Field>
        <Field label="T&C (optional)">
          <textarea
            value={details.tnc}
            onChange={(e) => setDetails({ tnc: e.target.value })}
            className={cn(inputCls, "h-16 resize-y leading-snug")}
            placeholder="Strictly no outside food. Registration required."
          />
        </Field>
      </Section>

      <Section title="Style notes (optional)">
        <textarea
          value={stylePrompt}
          onChange={(e) => setStylePrompt(e.target.value)}
          className={cn(inputCls, "h-20 resize-y")}
          placeholder="e.g. kawaii cartoon, soft pastels, hand-drawn — leave blank to let AI infer from the title"
        />
      </Section>

      <Section title="Canvas size">
        <select
          value={sizePreset.id}
          onChange={(e) => {
            const next = SIZE_PRESETS.find((p) => p.id === e.target.value);
            if (next) setSizePreset(next);
          }}
          className={inputCls}
        >
          {SIZE_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} ({p.widthMm} × {p.heightMm} mm)
            </option>
          ))}
        </select>
        <SegmentedControl<"portrait" | "landscape">
          className="mt-2"
          value={orientation}
          onChange={setOrientation}
          options={[
            { value: "portrait", label: "Portrait" },
            { value: "landscape", label: "Landscape" },
          ]}
        />
      </Section>

      <Section title={`Reserve space — Logos: ${logoCount}`}>
        <input
          type="range"
          min={0}
          max={6}
          step={1}
          value={logoCount}
          onChange={(e) => setLogoCount(Number(e.target.value))}
          className="w-full accent-fuchsia-500"
        />
        <label className="mt-2 flex items-center gap-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={includeQr}
            onChange={(e) => setIncludeQr(e.target.checked)}
            className="accent-fuchsia-500"
          />
          Reserve a QR-code square
        </label>
        <label className="mt-1 flex items-center gap-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={includePhotoSpace}
            onChange={(e) => setIncludePhotoSpace(e.target.checked)}
            className="accent-fuchsia-500"
          />
          Reserve a blank photo space (e.g. GOH headshot)
        </label>
        <p className="mt-1 text-[10px] text-zinc-500">
          The prompt will ask the AI to leave clean space for {logoCount} logo
          {logoCount === 1 ? "" : "s"}
          {includeQr ? ", a QR placeholder" : ""}
          {includePhotoSpace ? ", and a blank photo rectangle" : ""}. Add them
          yourself in your design tool after Gemini exports the image.
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full rounded-md border border-zinc-800 bg-zinc-900 p-0.5",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors",
            value === o.value
              ? "bg-fuchsia-600 text-white"
              : "text-zinc-300 hover:bg-zinc-800",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-fuchsia-500 focus:outline-none";
