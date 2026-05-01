"use client";

import { useEffect, useState } from "react";
import type { WSConnectionStatus } from "@/hooks/useProcessingProgressWS";

export type ConnectivityStatus = "online" | "offline" | "reconnecting";

function getBrowserOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function useConnectivityStatus(
  backendStatus?: WSConnectionStatus,
): ConnectivityStatus {
  const [isOnline, setIsOnline] = useState(getBrowserOnline);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) return "offline";

  if (
    backendStatus === "connecting" ||
    backendStatus === "disconnected" ||
    backendStatus === "error"
  ) {
    return "reconnecting";
  }

  return "online";
}
