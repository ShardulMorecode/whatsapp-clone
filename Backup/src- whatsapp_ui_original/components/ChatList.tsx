// src/components/ChatList.tsx
"use client";
import React from "react";

export default function ChatList({
  conversations,
  active,
  onSelect,
}: {
  conversations: any[];
  active?: string;
  onSelect: (wa_id: string) => void;
}) {
  return (
    <aside className="hidden md:block w-80 bg-gray-900 text-gray-100 h-screen sticky top-0 overflow-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Chats</h2>
      <div className="space-y-3">
        {conversations.length === 0 && <div className="text-gray-500">No chats</div>}
        {conversations.map((c: any) => {
          const wa = c._id || c.wa_id;
          return (
            <button
              key={wa}
              onClick={() => onSelect(wa)}
              className={`w-full text-left p-3 rounded-md transition flex items-start gap-3 ${
                active === wa ? "bg-gray-800 border-l-4 border-blue-400" : "hover:bg-gray-800"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold">
                { (c.name || wa).slice(0,1).toUpperCase() }
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div className={`font-medium ${active === wa ? "text-white" : "text-gray-100"}`}>
                    {c.name || wa}
                  </div>
                  <div className="text-xs text-gray-400">
                    {c.last_timestamp ? new Date(c.last_timestamp).toLocaleTimeString() : ""}
                  </div>
                </div>
                <div className="text-sm text-gray-400 truncate">{c.last_message}</div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

