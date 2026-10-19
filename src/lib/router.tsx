import { useEffect, useState } from "react";

export type RouteInfo = {
  path: string;
  params: Record<string, string>;
  search: URLSearchParams;
};

export function parseHash(): RouteInfo {
  const rawHash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  // Combine query parameters from window.location.search
  const search = new URLSearchParams(window.location.search);

  // Check if hash contains Supabase auth fragment parameters (e.g. access_token=... or error=...)
  if (
    rawHash.includes("access_token=") ||
    rawHash.includes("type=recovery") ||
    rawHash.includes("type=signup") ||
    rawHash.includes("error=") ||
    rawHash.includes("error_description=")
  ) {
    const fragmentParams = new URLSearchParams(rawHash);
    fragmentParams.forEach((val, key) => search.set(key, val));

    const errorDesc = fragmentParams.get("error_description") || fragmentParams.get("error");
    const isRecovery =
      fragmentParams.get("type") === "recovery" ||
      window.location.search.includes("recovery") ||
      window.location.search.includes("flow=recovery");

    if (errorDesc) {
      return {
        path: "/login",
        params: {},
        search,
      };
    }

    if (isRecovery) {
      return {
        path: "/reset-password",
        params: {},
        search,
      };
    }

    return {
      path: "/account",
      params: {},
      search,
    };
  }

  // Handle standard hash route like "#/login?redirect=..." or clean path for SEO crawling
  let path = "/";
  if (rawHash) {
    const normalized = rawHash.startsWith("/") ? rawHash : "/" + rawHash;
    const [pathPart, queryPart] = normalized.split("?");
    path = pathPart || "/";

    if (queryPart) {
      const hashParams = new URLSearchParams(queryPart);
      hashParams.forEach((val, key) => search.set(key, val));
    }
  } else if (typeof window !== "undefined" && window.location.pathname && window.location.pathname !== "/") {
    path = window.location.pathname;
  }

  // Also check if flow=recovery was in the search params
  if (search.get("flow") === "recovery" && path === "/") {
    return { path: "/reset-password", params: {}, search };
  }

  return { path, params: {}, search };
}

let currentRoute: RouteInfo = parseHash();
const listeners = new Set<() => void>();

export function navigate(to: string) {
  const cleanTo = to.startsWith("#") ? to.slice(1) : to;
  window.location.hash = cleanTo.startsWith("/") ? cleanTo : "/" + cleanTo;
}

export function useRoute(): RouteInfo {
  const [, force] = useState(0);
  useEffect(() => {
    const cb = () => force((n) => n + 1);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
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
  const handleRouteChange = () => {
    currentRoute = parseHash();
    window.scrollTo(0, 0);
    listeners.forEach((l) => l());
  };
  window.addEventListener("hashchange", handleRouteChange);
  window.addEventListener("popstate", handleRouteChange);
}
