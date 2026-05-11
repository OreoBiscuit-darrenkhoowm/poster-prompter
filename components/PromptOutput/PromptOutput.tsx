"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { usePosterStore } from "@/lib/state/posterStore";
import { buildPrompt } from "@/lib/ai/promptBuilder";
import { aspectRatioBucket, getDimensions } from "@/lib/canvas/sizes";
import { cn } from "@/lib/utils";

const CHAT_TARGETS = {
  gemini: { label: "Gemini", url: "https://gemini.google.com/app" },
  chatgpt: { label: "ChatGPT", url: "https://chatgpt.com" },
} as const;

export function PromptOutput() {
  const {
    details,
    stylePrompt,
    sizePreset,
    orientation,
    logoCount,
    includeQr,
    includePhotoSpace,
    targetChat,
    setTargetChat,
  } = usePosterStore();
  const target = CHAT_TARGETS[targetChat];

  const prompt = useMemo(() => {
    const dim = getDimensions(sizePreset, orientation);
    const widthMm =
      orientation === "portrait" ? sizePreset.widthMm : sizePreset.heightMm;
    const heightMm =
      orientation === "portrait" ? sizePreset.heightMm : sizePreset.widthMm;
    return buildPrompt({
      details,
      stylePrompt,
      widthMm,
      heightMm,
      aspectRatio: aspectRatioBucket(dim.width, dim.height),
      logoSlots: logoCount,
      includeQr,
      includePhotoSpace,
    });
  }, [
    details,
    stylePrompt,
    sizePreset,
    orientation,
    logoCount,
    includeQr,
    includePhotoSpace,
  ]);

  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — clipboard may be blocked
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            Generated prompt
          </h2>
          <p className="text-xs text-zinc-500">
            Paste this into {target.label}, then attach any style reference
            images alongside it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5">
            {(Object.keys(CHAT_TARGETS) as Array<keyof typeof CHAT_TARGETS>).map(
              (key) => (
                <button
                  key={key}
                  onClick={() => setTargetChat(key)}
                  className={cn(
                    "rounded-sm px-2.5 py-1 text-[11px] font-medium transition-colors",
                    targetChat === key
                      ? "bg-fuchsia-600 text-white"
                      : "text-zinc-300 hover:bg-zinc-800",
                  )}
                >
                  {CHAT_TARGETS[key].label}
                </button>
              ),
            )}
          </div>
          <button onClick={onCopy} className={primaryBtn}>
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy prompt
              </>
            )}
          </button>
          <a
            href={target.url}
            target="_blank"
            rel="noreferrer"
            className={secondaryBtn}
          >
            <ExternalLink className="h-4 w-4" />
            Open {target.label}
          </a>
        </div>
      </div>

      <textarea
        readOnly
        value={prompt}
        className={cn(
          "flex-1 resize-none rounded-md border border-zinc-800 bg-zinc-900 p-4 font-mono text-xs leading-relaxed text-zinc-100",
          "focus:border-fuchsia-500 focus:outline-none",
        )}
      />

      <p className="text-[10px] text-zinc-500">
        The prompt updates live as you edit the form on the left.
      </p>
    </div>
  );
}

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-md bg-fuchsia-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-fuchsia-500";

const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800";
