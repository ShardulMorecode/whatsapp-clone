// src/lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchConversations() {
  const res = await fetch(`${API_BASE}/conversations`);
  if (!res.ok) throw new Error("Failed to load conversations");
  return res.json();
}

export async function fetchMessages(wa_id: string) {
  const res = await fetch(`${API_BASE}/messages/${encodeURIComponent(wa_id)}`);
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json();
}

export async function postMessage(payload: any) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}
