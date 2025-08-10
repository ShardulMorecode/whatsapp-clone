// src/app/whatsapp/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import ChatList from "../../components/ChatList";
import ChatWindow from "../../components/ChatWindow";
import MobileHeader from "../../components/MobileHeader";
import useWebsocket from "../../hooks/useWebsocket";
import { fetchConversations } from "../../lib/api";

export default function WhatsAppPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // load convos
  useEffect(() => {
    fetchConversations().then((c) => {
      setConversations(c);
      if (c.length > 0 && !active) setActive(c[0]._id || c[0].wa_id);
    }).catch((e)=> {
      console.error(e);
    });
  }, []);

  // websocket
  useWebsocket((msg) => {
    // when new message arrives, refresh conversations list to update last message
    if (msg?.type === "new_message" || msg?.type === "outgoing") {
      fetchConversations().then(setConversations).catch(console.error);
    }
  }, (process.env.NEXT_PUBLIC_WS_URL || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/^http/, "ws") + "/ws" : "ws://localhost:8000/ws")));

  // pass a socketUpdater to ChatWindow so it can register message handlers
  const socketUpdater = (handler: (m:any)=>void) => {
    // this is simplistic — we attach a temporary listener that uses window event
    // when useWebsocket receives messages it could dispatch a custom event
    // For simplicity we use a global event bus:
    const ev = (event: CustomEvent) => handler(event.detail);
    window.addEventListener("ws_message", ev as EventListener);
    return () => window.removeEventListener("ws_message", ev as EventListener);
  };

  // helper to broadcast ws messages from hook to window events
  // (we can't directly pass hook's handler down easily from here without refactoring)
  // BUT our hook already calls console.log; if you want direct linking we can refactor quickly.

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <ChatList
        conversations={conversations}
        active={active || undefined}
        onSelect={(wa) => { setActive(wa); setMobileOpen(false); }}
      />

      {/* mobile header */}
      <MobileHeader title={conversations.find(c=>c._id===active)?.name || "Chats"} onOpen={() => setMobileOpen(true)} />

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black opacity-50" onClick={()=>setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-3/4 bg-gray-900 p-4 overflow-auto">
            <h3 className="text-xl font-bold mb-3">Chats</h3>
            {conversations.map(c => (
              <button key={c._id} onClick={() => { setActive(c._id); setMobileOpen(false); }} className="w-full text-left p-3 rounded hover:bg-gray-800">
                <div className="font-medium">{c.name || c._id}</div>
                <div className="text-sm text-gray-400">{c.last_message}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1">
        <ChatWindow wa_id={active || undefined} name={conversations.find(c=>c._id===active)?.name} socketUpdater={(cb)=>{ /* not used in this composition */ }} />
      </main>
    </div>
  );
}
