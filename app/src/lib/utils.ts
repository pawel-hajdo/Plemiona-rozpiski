import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import Cookies from 'js-cookie';
import { decodeToken  } from "react-jwt";
import {rankItem} from "@tanstack/match-sorter-utils";

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
  const { sourceId, targetId, type, world } = row.original;
  let link = `https://${world}.plemiona.pl/game.php?village=${sourceId}&screen=place&target=${targetId}`;

  const catapultMatch = type.match(/Katapulty-(\d+)/);
  if (catapultMatch) {
    const catapultCount = catapultMatch[1];
    link += `&catapult=${catapultCount}`;
  }

  return link;
}

export const formatDate = (date: Date) => date.toLocaleString();

export const isButtonDisabled = (row: any) => {
  const currentTime = new Date();
  const minTime = new Date(row.original.minTime);
  return currentTime < minTime;
}
