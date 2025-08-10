// src/hooks/useWebsocket.ts
import { useEffect, useRef } from "react";

type MsgHandler = (msg: any) => void;

export default function useWebsocket(onMessage: MsgHandler, url?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const urlRef = useRef<string | undefined>(url);

  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  useEffect(() => {
    if (!urlRef.current) return;
    let ws: WebSocket;
    let reconnectTimer = 1000;
    let mounted = true;

    const connect = () => {
      if (!urlRef.current || !mounted) return;
      try {
        ws = new WebSocket(urlRef.current as string);
        wsRef.current = ws;
      } catch (err) {
        console.error("WS create error", err);
        setTimeout(connect, reconnectTimer);
        reconnectTimer = Math.min(30000, reconnectTimer * 2);
        return;
      }

      ws.onopen = () => {
        reconnectTimer = 1000;
        console.log("WS connected");
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          // call user callback
          try { onMessage(data); } catch(e){ console.warn(e); }
          // dispatch a global event so components (ChatWindow) can listen
          try {
            window.dispatchEvent(new CustomEvent("ws_message", { detail: data }));
          } catch (e) { /* ignore */ }
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
        try { ws.close(); } catch(e){}
      };
    };

    connect();

    return () => {
      mounted = false;
      wsRef.current?.close();
    };
  }, [onMessage, url]);
}
