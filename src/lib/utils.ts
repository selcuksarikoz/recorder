import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const URL = window.URL || window.webkitURL;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createObjectURL = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

export const revokeObjectURL = (url: string): void => {
  URL.revokeObjectURL(url);
};
