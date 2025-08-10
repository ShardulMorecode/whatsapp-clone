// src/hooks/useWebsocket.ts
import { useEffect, useRef } from "react";

type MsgHandler = (msg: any) => void;

export default function useWebsocket(onMessage: MsgHandler, url?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const urlRef = useRef(url);

  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  useEffect(() => {
    if (!urlRef.current) return;
    let ws: WebSocket;
    let reconnectTimer = 1000;

    const connect = () => {
      ws = new WebSocket(urlRef.current as string);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectTimer = 1000;
        console.log("WS connected");
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          onMessage(data);
        } catch (e) {
          console.warn("WS message parse error", e);
        }
      };

      ws.onclose = () => {
        console.log("WS closed; reconnecting...");
        setTimeout(connect, reconnectTimer);
        reconnectTimer = Math.min(30000, reconnectTimer * 2);
      };

      ws.onerror = (err) => {
        console.error("WS error", err);
        ws.close();
      };
    };

    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [onMessage, url]);
}
