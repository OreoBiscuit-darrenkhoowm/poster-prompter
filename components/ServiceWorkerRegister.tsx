"use client";

import { useEffect } from "react";

/**
 * Registers the service worker so the app is installable and works offline.
 * Registration is skipped in development to avoid the SW caching dev bundles
 * and fighting with hot-module reloading.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration can fail offline or on unsupported browsers — that's fine,
        // the app still works as a normal web page.
      });
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
