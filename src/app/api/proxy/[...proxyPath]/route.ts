import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../../pages/api/auth/[...nextauth]';

const API_URL = process.env.BACKEND_URL!;
const API_KEY = process.env.BACKEND_API_KEY || '';
const MASTER_KEY = process.env.BACKEND_MASTER_KEY || '';

async function proxyHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(null, { status: 401 });

  const method = request.method.toUpperCase();
  if (!['POST', 'PUT', 'DELETE'].includes(method)) {
    return new Response(null, {
      status: 405,
      headers: { Allow: 'POST, PUT, DELETE' },
    });
  }

  const nextUrl = request.nextUrl;
  const fullPath = nextUrl.pathname.split('/api/proxy/')[1] ?? '';
  if (!fullPath) {
    return new Response('Proxy path vazio', { status: 400 });
  }

  const outQs = new URLSearchParams(nextUrl.searchParams);
  outQs.set('api_key', API_KEY);

  const upstreamBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const upstreamPath = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
  const upstreamUrl = `${upstreamBase}${upstreamPath}?${outQs.toString()}`;

  const rawBody = method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer();

  const baseHeaders: Record<string, string> = {
    accept: 'application/json',
    'MASTER-KEY': MASTER_KEY,
    'content-type': 'application/json',
  };

  let bodyToSend = JSON.stringify({ access_token: session.accessToken });

  if (rawBody) {
    try {
      const original = JSON.parse(Buffer.from(rawBody).toString('utf-8'));
      bodyToSend = JSON.stringify({ ...original, access_token: session.accessToken });
    } catch {}
  }

  const res = await fetch(upstreamUrl, {
    method,
    headers: baseHeaders,
    body: bodyToSend,
    redirect: 'error',
    cache: 'no-store',
  });

  const buf = await res.arrayBuffer();
  const headers = new Headers(res.headers);

  if (!headers.get('content-type')) headers.set('content-type', 'application/json');
  return new Response(buf, { status: res.status, headers });
}

export const POST = proxyHandler;
export const PUT = proxyHandler;
export const DELETE = proxyHandler;
