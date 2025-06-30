import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateInviteCode(length: number){
  const charaters = "ABCDEFGHIJKLMNOPQRSTUVWXYZqwertyuioplkjhgfdsazxcvbnm0123456789";
  let result = "";
  for(let i =0; i < length; i++){
    result += charaters.charAt(Math.floor(Math.random() * charaters.length));
  }
  return result;
}