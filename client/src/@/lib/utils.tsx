// import { pb } from 'App'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function scheduleOnNextFrame(callback: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(callback))
}

export function sendMessage(data: any) {
  window.top?.postMessage(data, '*')
}

export function firstUppercase(str: string) {
  if (!str || str.length === 0) {
    return ''
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}


export const STRING_SET_ALL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
export const STRING_SET_LOWERCASE = "abcdefghijklmnopqrstuvwxyz0123456789"
export const STRING_SET_UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
export const STRING_SET_NUMBERS = "0123456789"

export function randomString(length: number, string_set: string = STRING_SET_ALL): string {
  const characters = string_set
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function isAsync(fn: Function): boolean {
  return fn.constructor.name === "AsyncFunction";
}


export class SeedableRandom {
  state: number;
  constructor(seed: number) {
    this.state = seed;
  }

  getFloat() {
    this.state = ((1103515245 * this.state + 12345) % 0x80000000);
    return this.state / (0x80000000 - 1);
  }
}

export function randomizeArrayToday(arr: any[] | undefined, today: Date = new Date()): any[] {
  if (!arr) return []
  const todaySeed = today.getDate().toString() + (today.getMonth() + 1).toString().padStart(2, '0') + today.getFullYear().toString()

  const rnd: SeedableRandom = new SeedableRandom(parseInt(todaySeed))
  const shuffled = arr.sort(() => {
    return rnd.getFloat() - 0.5
  })

  return shuffled
}

export function randomInt(min: number, max: number, seed?: number): number {
  if (seed !== undefined) {
    const rnd = new SeedableRandom(seed);
    return Math.floor(rnd.getFloat() * (max - min + 1)) + min;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function PBProps(data: { [key: string]: any }) {
  const formData = new FormData();

  for (const key in data) {
    if (data[key] === undefined || data[key] === null) continue

    if (Array.isArray(data[key])) {
      data[key].forEach((item: any) => {
        formData.append(key, item);
      });
    } else {
      formData.append(key, data[key]);
    }
  }
  return formData;
}

export function omitPossibleProps(obj: any, ...props: string[]) {
  const result = { ...obj };
  props.forEach(prop => {
    if (prop in result) {
      delete result[prop];
    }
  });
  return result;
}


export function waitForMs(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export function toDataURL(url: string) {
  return new Promise<string>((resolve, reject) => {

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result as unknown as string);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  })
}
