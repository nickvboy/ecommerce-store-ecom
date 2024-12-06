import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const tryUrls = async (urls) => {
  for (const url of urls) {
    try {
      const response = await fetch(`${url}/health`);
      if (response.ok) {
        return url;
      }
    } catch (error) {
      console.log(`Failed to connect to ${url}`, error);
    }
  }
  return null;
};

export const getApiBaseUrl = async () => {
  const urls = [
    process.env.REACT_APP_API_URL_LOCAL,
    process.env.REACT_APP_API_URL_REMOTE
  ].filter(Boolean);

  const workingUrl = await tryUrls(urls);
  return workingUrl || urls[0]; // Fallback to first URL if none work
};

export const API_BASE_URL = process.env.REACT_APP_API_URL_LOCAL || 'http://localhost:5001/api';