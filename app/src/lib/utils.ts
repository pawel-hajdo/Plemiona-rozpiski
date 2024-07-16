import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import Cookies from 'js-cookie';
import { decodeToken  } from "react-jwt";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTokenFromCookies(){
  return Cookies.get('token');
}

export function getPlayerName(){
  const token = getTokenFromCookies();
  if (token) {
    const decoded = decodeToken(token);
    return decoded.sub;
  }
}

export function getPlayerId(){
  const token = getTokenFromCookies();
  if (token) {
    const decoded = decodeToken(token);
    return decoded.playerId;
  }
}
