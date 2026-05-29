"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

/** The non-standard `beforeinstallprompt` event (Chromium browsers). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Shows an "Install app" button when the browser offers PWA installation.
 * Renders nothing when the app is already installed or the browser doesn't
 * support the prompt (e.g. iOS Safari, where users install via Share → Add to
 * Home Screen instead).
 */
export function InstallButton({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      // Stop Chrome's default mini-infobar so we can trigger the prompt on click.
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred) return null;

  async function onInstall() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    // The event can only be used once; drop it either way.
    setDeferred(null);
  }

  return (
    <button
      onClick={onInstall}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-fuchsia-500/40 bg-fuchsia-600/10 px-2.5 py-1 text-xs font-medium text-fuchsia-300 transition-colors hover:bg-fuchsia-600/20",
        className,
      )}
    >
      <Download className="h-3.5 w-3.5" />
      Install app
    </button>
  );
}
