// src/components/MobileHeader.tsx
"use client";
import React from "react";
import { FaBars } from "react-icons/fa";

export default function MobileHeader({ title, onOpen }: { title?: string; onOpen: () => void; }) {
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-900 text-white sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onOpen} className="p-2 rounded-md hover:bg-gray-800">
          <FaBars />
        </button>
        <div className="text-sm font-medium">{title || "Chats"}</div>
      </div>
    </div>
  );
}
