// src/components/ChatWindow.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { fetchMessages, postMessage } from "../lib/api";

export default function ChatWindow({
  wa_id,
  name,
  socketUpdater,
}: {
  wa_id?: string | null;
  name?: string;
  socketUpdater?: (cb: (m:any)=>void) => void;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!wa_id) return;
    fetchMessages(wa_id).then((msgs) => {
      setMessages(msgs);
      scrollToBottom();
    }).catch((e) => {
      console.error(e);
      setMessages([]);
    });
  }, [wa_id]);

  // handle incoming socket messages: append if belongs to current wa_id
  useEffect(() => {
    if (!socketUpdater) return;
    const handler = (incoming: any) => {
      if (!incoming) return;
      if (incoming.type === "new_message" || incoming.type === "outgoing") {
        const m = incoming.message || incoming;
        if (m.wa_id === wa_id) {
          setMessages((prev)=>[...prev, m]);
          scrollToBottom();
        }
      }
      if (incoming.type === "status_update" && incoming.meta_msg_id) {
        setMessages((prev)=>prev.map(pm => pm.message_id === incoming.meta_msg_id ? {...pm, status: incoming.status} : pm));
      }
    };
    socketUpdater(handler);
  }, [wa_id, socketUpdater]);

  const scrollToBottom = () => {
    requestAnimationFrame(()=> {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || !wa_id) return;
    const payload = {
      wa_id,
      name: name || wa_id,
      from: "me",
      text: text.trim(),
      timestamp: new Date().toISOString(),
      status: "sent"
    };
    try {
      const res = await postMessage(payload);
      // backend will broadcast via websocket; add immediately for responsiveness:
      setMessages((prev) => [...prev, { ...payload, message_id: res.data?._id || res.data?.id || Date.now() }]);
      setText("");
      scrollToBottom();
    } catch (err) {
      console.error("send error", err);
      // optionally show toast
    }
  };

  if (!wa_id) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Select a chat to start</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3 bg-gray-950">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-semibold">{(name||wa_id).slice(0,1).toUpperCase()}</div>
        <div>
          <div className="font-medium">{name || wa_id}</div>
          <div className="text-xs text-gray-400">Last seen recently</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4 bg-gradient-to-b from-gray-900 to-gray-950">
        {messages.map((m:any, idx:number) => {
          const fromMe = m.from === "me" || m.from === "918329446654" || m.from === "me" || m.from === "918329446654";
          return (
            <div key={m.message_id || m.id || idx} className={`max-w-[80%] ${fromMe ? "ml-auto text-right" : ""}`}>
              <div className={`${fromMe ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-100"} inline-block px-4 py-2 rounded-xl`}>
                <div>{m.text || m.body || m.message}</div>
                <div className="text-xs mt-1 opacity-80">{m.timestamp ? new Date(m.timestamp).toLocaleString() : ""} {fromMe && <span className="ml-2">✓{m.status === "delivered" ? "✓" : ""}{m.status === "read" ? "✓✓" : ""}</span>}</div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-gray-900 border-t border-gray-800 flex gap-3 items-center">
        <input
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder="Type a message"
          className="flex-1 bg-gray-800 text-gray-100 rounded-full px-4 py-2 focus:outline-none"
        />
        <button type="submit" className="px-4 py-2 rounded-full bg-blue-500 text-white">Send</button>
      </form>
    </div>
  );
}
