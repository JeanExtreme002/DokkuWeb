import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../../pages/api/auth/[...nextauth]';

const API_URL = process.env.BACKEND_URL!;
const API_KEY = process.env.BACKEND_API_KEY || '';

const AUTO_CLEANUP_CACHE_INTERVAL = 30 * 60 * 1000;

// Configuration list for which method+endpoint combinations should be cached
const CACHEABLE_ENDPOINTS: Array<{ method: string; endpoint: string }> = [
  { method: 'POST', endpoint: '/api/apps/list' },
  { method: 'POST', endpoint: '/api/databases/list' },
];

interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

class ServerCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 10 * 60 * 1000; // 10 minutes

  private generateKey(
    method: string,
    path: string,
    searchParams: URLSearchParams,
    body?: string
  ): string {
    const params = searchParams.toString();
    const bodyStr = body || '';
    return `${method}:${path}:${params}:${bodyStr}`;
  }

  private shouldCache(method: string, endpoint: string): boolean {
    return CACHEABLE_ENDPOINTS.some(
      (config) => config.method === method && endpoint.startsWith(config.endpoint)
    );
  }

  private isValid(entry: CacheEntry): boolean {
    return Date.now() < entry.expiry;
  }

  get(
    method: string,
    path: string,
    searchParams: URLSearchParams,
    body?: string
  ): { data: any; timestamp: number } | null {
    if (!this.shouldCache(method, path)) {
      return null;
    }

    const cacheKey = this.generateKey(method, path, searchParams, body);
    const entry = this.cache.get(cacheKey);

    if (!entry || !this.isValid(entry)) {
      if (entry) {
        this.cache.delete(cacheKey);
      }
      return null;
    }

    return { data: entry.data, timestamp: entry.timestamp };
  }

  set(
    method: string,
    path: string,
    searchParams: URLSearchParams,
    data: any,
    body?: string,
    ttl?: number
  ): void {
    if (!this.shouldCache(method, path)) {
      return;
    }

    const cacheKey = this.generateKey(method, path, searchParams, body);
    const now = Date.now();
    const expiry = now + (ttl || this.defaultTTL);

    this.cache.set(cacheKey, {
      data,
      timestamp: now,
      expiry,
    });
  }

  invalidate(method?: string, endpoint?: string): void {
    if (!method && !endpoint) {
      this.cache.clear();
      return;
    }

    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      const [keyMethod, keyEndpoint] = key.split(':');

      const methodMatches = !method || keyMethod === method;
      const endpointMatches = !endpoint || keyEndpoint.startsWith(endpoint);

      if (methodMatches && endpointMatches) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now >= entry.expiry) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}

// Singleton cache instance
const serverCache = new ServerCache();

// Auto cleanup
setInterval(() => {
  serverCache.cleanup();
}, AUTO_CLEANUP_CACHE_INTERVAL);

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function proxyHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(null, { status: 401 });

  const method = request.method.toUpperCase();
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) {
    return new Response(null, {
      status: 405,
      headers: { Allow: 'GET, POST, PUT, DELETE' },
    });
  }

  const nextUrl = request.nextUrl;
  const fullPath = nextUrl.pathname.split('/api/proxy/')[1] ?? '';
  if (!fullPath) {
    return new Response('Proxy path vazio', { status: 400 });
  }

  const outQs = new URLSearchParams(nextUrl.searchParams);
  outQs.set('api_key', API_KEY);

  const rawBody = method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer();

  let bodyToSend = JSON.stringify({ access_token: session.accessToken });

  if (rawBody) {
    try {
      const original = JSON.parse(Buffer.from(rawBody).toString('utf-8'));
      bodyToSend = JSON.stringify({ ...original, access_token: session.accessToken });
    } catch {}
  }

  // Check if cache should be bypassed
  const cacheHeader = request.headers.get('x-cache');
  const shouldBypassCache = cacheHeader === 'false';

  // Check cache first (only if not bypassing)
  let cachedResult = null;
  if (!shouldBypassCache) {
    cachedResult = serverCache.get(method, `/${fullPath}`, outQs, bodyToSend);
  }

  if (cachedResult) {
    const headers = new Headers();
    headers.set('content-type', 'application/json');
    headers.set('x-cache', 'HIT');
    headers.set('x-cache-date', formatTimestamp(cachedResult.timestamp));

    // Start background update
    updateCacheInBackground(method, fullPath, outQs, bodyToSend);

    return new Response(JSON.stringify(cachedResult.data, null, 2), {
      status: 200,
      headers,
    });
  }

  // No cache, make the request
  const upstreamBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

  let upstreamPath = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
  upstreamPath = upstreamPath.endsWith('/') ? upstreamPath : `${upstreamPath}/`;

  const upstreamUrl = `${upstreamBase}${upstreamPath}?${outQs.toString()}`;

  const baseHeaders: Record<string, string> = {
    accept: 'application/json',
    'content-type': 'application/json',
  };

  try {
    const res = await fetch(upstreamUrl, {
      method,
      headers: baseHeaders,
      body: method !== 'GET' ? bodyToSend : undefined,
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(10 * 60 * 1000),
    });

    const buf = await res.arrayBuffer();
    const text = new TextDecoder('utf-8').decode(buf);

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return new Response(text, {
        status: res.status,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }

    // Cache successful responses
    if (res.status === 200) {
      serverCache.set(method, `/${fullPath}`, outQs, json, bodyToSend);
    }

    const headers = new Headers(res.headers);
    headers.delete('content-encoding');
    headers.delete('content-length');
    headers.set('content-type', 'application/json');
    headers.set('x-cache', 'MISS');

    return new Response(JSON.stringify(json, null, 2), {
      status: res.status,
      headers,
    });
  } catch (error) {
    // On error, invalidate cache for this endpoint
    serverCache.invalidate(method, `/${fullPath}`);
    throw error;
  }
}

// Background update function
async function updateCacheInBackground(
  method: string,
  fullPath: string,
  outQs: URLSearchParams,
  bodyToSend: string
) {
  try {
    const upstreamBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const upstreamPath = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
    const upstreamUrl = `${upstreamBase}${upstreamPath}?${outQs.toString()}`;

    const baseHeaders: Record<string, string> = {
      accept: 'application/json',
      'content-type': 'application/json',
    };

    const res = await fetch(upstreamUrl, {
      method,
      headers: baseHeaders,
      body: method !== 'GET' ? bodyToSend : undefined,
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(10 * 60 * 1000),
    });

    if (res.status === 200) {
      const buf = await res.arrayBuffer();
      const text = new TextDecoder('utf-8').decode(buf);
      const json = JSON.parse(text);

      // Update cache with fresh data
      serverCache.set(method, `/${fullPath}`, outQs, json, bodyToSend);
    } else {
      // On error, invalidate cache
      serverCache.invalidate(method, `/${fullPath}`);
    }
  } catch {
    // On error, invalidate cache
    serverCache.invalidate(method, `/${fullPath}`);
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const DELETE = proxyHandler;
