import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const saveLinksToOpenCount = (count) => {
  localStorage.setItem('linksToOpenCount', count);
};

export const loadLinksToOpenCount = () => {
  const count = localStorage.getItem('linksToOpenCount');
  return count ? parseInt(count, 10) : 10; // default 10
};

export const savePageSize = (size) => {
  localStorage.setItem('pageSize', size);
};

export const loadPageSize = () => {
  const size = localStorage.getItem('pageSize');
  return size ? parseInt(size, 10) : 10; // default 10
};


