import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authenticate } from "@/lib/vps-auth.mjs";
export type ChatGPTUser = { userId: string; displayName: string; email: string; fullName: string | null };
// Preserve existing call sites; no longer trust Sites identity headers on the VPS.
export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const h = await headers();
  return authenticate(h.get("authorization"));
}
export async function requireChatGPTUser(returnTo: string): Promise<ChatGPTUser> {
  const u = await getChatGPTUser(); if (u) return u; redirect(chatGPTSignInPath(returnTo));
}
export function chatGPTSignInPath(returnTo: string) {
  return `/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/")}`;
}
export function chatGPTSignOutPath() { return "/signout-with-chatgpt"; }
