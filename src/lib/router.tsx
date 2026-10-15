import { useEffect, useState } from "react";

export type RouteInfo = {
  path: string;
  params: Record<string, string>;
  search: URLSearchParams;
};

function parseHash(): RouteInfo {
  const hash = window.location.hash.slice(1) || "/";
  const [pathPart, queryPart] = hash.split("?");
  const path = pathPart || "/";
  const search = new URLSearchParams(queryPart || "");
  return { path, params: {}, search };
}

let currentRoute: RouteInfo = parseHash();
const listeners = new Set<() => void>();

export function navigate(to: string) {
  window.location.hash = to;
}

export function useRoute(): RouteInfo {
  const [, force] = useState(0);
  useEffect(() => {
    const cb = () => force((n) => n + 1);
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);
  return currentRoute;
}

export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith("$")) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    currentRoute = parseHash();
    window.scrollTo(0, 0);
    listeners.forEach((l) => l());
  });
}
