import React from "react";

interface ChatListProps {
  conversations: any[];
  active?: string;
  onSelect: (wa_id: string) => void;
}

export default function ChatList({ conversations, active, onSelect }: ChatListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((c) => {
        const id = c._id || c.wa_id;
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-wa-sidebar-hover ${
              isActive ? "bg-wa-sidebar-active" : ""
            }`}
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold">
              {c.name?.[0] || "?"}
            </div>

            {/* Text */}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-medium truncate">{c.name || id}</span>
              <span className="text-sm text-wa-subtext truncate">{c.last_message}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
