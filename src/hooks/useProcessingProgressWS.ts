"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/lib/localStore";
import { API_BASE_URL } from "@/lib/config";

export interface ProcessingProgressMessage {
  type: "processing_progress";
  resource_id: string;
  message_id: string;
  stage: string;
  progress: number;
  document_index: number;
  total_documents: number;
  details: Record<string, unknown> | null;
}

export type WSConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

/**
 * Opens a persistent WebSocket connection to the backend and listens for
 * messages with `type: "processing_progress"`.
 *
 * Connection: ws(s)://<API_BASE_URL>/ws?token=<access_token>
 * Reconnects automatically with exponential back-off (1 s → 30 s).
 */
export function useProcessingProgressWS(enabled = true): {
  connectionStatus: WSConnectionStatus;
  lastProgress: ProcessingProgressMessage | null;
} {
  const [connectionStatus, setConnectionStatus] =
    useState<WSConnectionStatus>("disconnected");
  const [lastProgress, setLastProgress] =
    useState<ProcessingProgressMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const reconnectDelayRef = useRef(1000);

  const connect = useCallback(() => {
    if (!mountedRef.current || !enabled) return;

    const token = getAccessToken();
    if (!token) return;

    // Derive WebSocket URL: http → ws, https → wss
    const wsBase = API_BASE_URL.replace(/^https/, "wss").replace(/^http/, "ws");
    const url = `${wsBase}/ws?token=${encodeURIComponent(token)}`;

    setConnectionStatus("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setConnectionStatus("connected");
      reconnectDelayRef.current = 1000; // reset back-off on successful connect
      console.log("[useProcessingProgressWS] WebSocket connected:", url);
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data as string);
        if (data?.type === "processing_progress") {
          setLastProgress(data as ProcessingProgressMessage);
        }
      } catch {
        // Ignore non-JSON frames
      }
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      setConnectionStatus("error");
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      wsRef.current = null;
      setConnectionStatus("disconnected");

      // Exponential back-off reconnect (cap at 30 s)
      const delay = reconnectDelayRef.current;
      reconnectDelayRef.current = Math.min(delay * 2, 30_000);
      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, delay);
    };
  }, [enabled]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect loop on intentional close
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, enabled]);

  return { connectionStatus, lastProgress };
}
