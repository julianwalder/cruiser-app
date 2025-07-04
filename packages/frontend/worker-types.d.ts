/// <reference types="@cloudflare/workers-types" />

export {};

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Response | Promise<Response>): void;
}

declare global {
  function addEventListener(type: 'fetch', listener: (event: FetchEvent) => void): void;
} 