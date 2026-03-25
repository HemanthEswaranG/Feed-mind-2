import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hashIP(ip: string): string {
  let hash = 5381;
  for (let i = 0; i < ip.length; i += 1) {
    hash = (hash * 33) ^ ip.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export function encrypt(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

export function decrypt(encryptedText: string): string {
  return decodeURIComponent(escape(atob(encryptedText)));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getIntegrityColor(score: number): string {
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

export function getIntegrityLabel(score: number): string {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export function getSentimentEmoji(score: number | null): string {
  if (score === null) return "—";
  if (score > 0.3) return "😊";
  if (score < -0.3) return "😞";
  return "😐";
}
