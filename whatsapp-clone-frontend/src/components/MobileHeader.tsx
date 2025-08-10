import React from "react";

interface MobileHeaderProps {
  title: string;
  onOpen: () => void;
}

export default function MobileHeader({ title, onOpen }: MobileHeaderProps) {
  return (
    <header className="md:hidden flex items-center justify-between px-4 h-14 bg-wa-header border-b border-wa-border">
      <button onClick={onOpen} className="text-lg font-bold">☰</button>
      <h1 className="font-medium">{title}</h1>
      <div className="w-6" /> {/* Spacer */}
    </header>
  );
}
