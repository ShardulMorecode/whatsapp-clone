"use client";
import React, { useEffect, useState } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import useWebsocket from "../hooks/useWebsocket";
import { fetchConversations } from "../lib/api";

export default function WhatsAppPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);

  // temporary static userId — replace with logged-in user data
  const userId = "123";

  // load conversations
  useEffect(() => {
    fetchConversations()
      .then((c) => {
        setConversations(c);
        if (c.length > 0 && !active) {
          setActive(c[0]._id || c[0].wa_id);
        }
      })
      .catch(console.error);
  }, []);

  // websocket
  useWebsocket(
    (msg) => {
      if (msg?.type === "new_message" || msg?.type === "outgoing") {
        fetchConversations().then(setConversations).catch(console.error);
      }
    },
    `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws"}/${userId}`
  );

  return (
    <div className="min-h-screen flex bg-wa-bg text-wa-text">
      {/* Sidebar */}
      <div className="w-1/4 min-w-[320px] bg-wa-sidebar border-r border-wa-border flex flex-col">
        <div className="bg-wa-green text-white px-4 py-3 text-lg font-semibold">
          WhatsApp
        </div>
        <ChatList
          conversations={conversations}
          active={active || undefined}
          onSelect={(wa) => setActive(wa)}
        />
      </div>

      {/* Chat window */}
      <main className="flex-1 flex flex-col">
        <ChatWindow
          wa_id={active || undefined}
          name={conversations.find((c) => c._id === active)?.name}
        />
      </main>
    </div>
  );
}
