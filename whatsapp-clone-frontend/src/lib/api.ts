// src/lib/api.ts
export async function fetchConversations() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function fetchMessages(wa_id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${wa_id}`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function sendMessage(data: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}
