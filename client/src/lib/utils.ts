import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function truncate(str: string, length: number): string {
  if (!str) return "";
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function calculateCircleProgress(value: number, max: number): {
  dashArray: number;
  dashOffset: number;
} {
  const circumference = 100.53; // 2 * PI * r, where r is the radius of the circle (16)
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const dashOffset = circumference - (percent / 100) * circumference;
  
  return {
    dashArray: circumference,
    dashOffset,
  };
}

export function playAudio(url: string): void {
  if (!url) return;
  const audio = new Audio(url);
  audio.play().catch(error => {
    console.error("Error playing audio:", error);
  });
}
