import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import Cookies from 'js-cookie';
import { decodeToken  } from "react-jwt";
import {rankItem} from "@tanstack/match-sorter-utils";
import { DateTime } from 'luxon';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTokenFromCookies(){
  return Cookies.get('token');
}

export function getPlayerName(){
  const token = getTokenFromCookies();
  if (token) {
    const decoded: any = decodeToken(token);
    return decoded.sub;
  }
}

export function getPlayerId(){
  const token = getTokenFromCookies();
  if (token) {
    const decoded: any = decodeToken(token);
    return decoded.playerId;
  }
}

export function fuzzyFilter (row: any, columnId: any, value: any, addMeta: any) {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
}

export const generateLink = (row: any) => {
  const { sourceId, targetId, type, world, playerId } = row.original;
  const accountPlayerId = getPlayerId();
  let link = `https://${world}.plemiona.pl/game.php?village=${sourceId}&screen=place&target=${targetId}`;

  if(accountPlayerId != playerId){
    link += `&t=${playerId}`;
  }

  const catapultMatch = type.match(/Katapulty-(\d+)/);
  if (catapultMatch) {
    const catapultCount = catapultMatch[1];
    link += `&catapult=${catapultCount}`;
  }

  return link;
}

export const formatDate = (date: Date) => date.toLocaleString();

export const isButtonDisabled = (row: any) => {
  const currentTime = DateTime.now().setZone('Europe/Warsaw');
  const minTime = DateTime.fromISO(row.original.minTime, { zone: 'Europe/Warsaw' });
  return currentTime < minTime;
}

export const generateRandomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 32;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const setCookieToken = (token: string) => {
  const decodedToken = decodeToken(token) as DecodedToken;

  const currentTime = Math.floor(Date.now() / 1000);
  const tokenExpiry = decodedToken.exp;
  const maxAge = tokenExpiry - currentTime;

  if (maxAge > 0) {
    document.cookie = `token=${token}; path=/; max-age=${maxAge}`;
  }
}

interface DecodedToken {
  exp: number;
}

