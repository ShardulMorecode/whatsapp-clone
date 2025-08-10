"use client";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { fetchMessages, sendMessage } from "../lib/api";

interface ChatWindowProps {
  wa_id?: string;
  name?: string;
}

export default function ChatWindow({ wa_id, name }: ChatWindowProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (wa_id) {
      fetchMessages(wa_id)
        .then(setMessages)
        .catch(console.error);
    }
  }, [wa_id]);

  const handleSend = async () => {
    if (!input.trim() || !wa_id) return;
    const newMsg = {
      wa_id,
      name: name || "",
      from: "me",
      text: input,
      timestamp: Date.now(),
      status: "sent",
    };
    await sendMessage(newMsg);
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  if (!wa_id) {
    return (
      <div className="flex-1 flex items-center justify-center text-wa-subtext">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 bg-wa-header border-b border-wa-border px-4 flex items-center">
        <span className="font-medium">{name}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
        {messages.slice().reverse().map((msg) => (
          <div
            key={msg._id || msg.timestamp}
            className={`max-w-xs px-3 py-2 mb-2 rounded-lg text-sm ${
              msg.from === "me"
                ? "bg-wa-green text-white self-end"
                : "bg-white text-wa-text self-start"
            }`}
          >
            {msg.text}
            <div className="text-[10px] text-right mt-1 opacity-70">
              {dayjs(msg.timestamp).format("HH:mm")}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#e0e0e0] bg-[#f0f2f5] flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message"
          className="flex-1 px-12 py-9 h-42 rounded-full border border-gray-300 text-sm bg-white text-[#111b21] placeholder-[#667781] focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-[#00a884] hover:bg-[#029e7a] text-white px-5 h-12 rounded-full text-sm font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
