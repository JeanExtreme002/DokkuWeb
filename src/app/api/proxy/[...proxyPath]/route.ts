import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../../pages/api/auth/[...nextauth]';

const API_URL = process.env.BACKEND_URL;
const API_KEY = process.env.BACKEND_API_KEY || '';
const MASTER_KEY = process.env.BACKEND_MASTER_KEY || '';

async function proxyHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(null, { status: 401 });
  }

  const method = request.method.toUpperCase();

  if (!['POST', 'PUT', 'DELETE'].includes(method)) {
    return new Response(null, {
      status: 405,
      headers: { Allow: 'POST, PUT, DELETE' },
    });
  }

  const { searchParams, pathname } = new URL(request.url);

  const proxy = pathname.split('/api/proxy/')[1] || '';
  const params = new URLSearchParams({
    api_key: API_KEY,
  });

  searchParams.forEach((value, key) => {
    if (key !== 'proxy') params.append(key, value);
  });

  const url = `${API_URL}/${proxy}?${params.toString()}`;

  let body: any = {
    access_token: session.accessToken,
  };

  try {
    const originBody = await request.json();
    body = {
      ...originBody,
      ...body,
    };
  } catch {
    // If the request body is not JSON, we can ignore it
  }

  const apiRes = await fetch(url, {
    method,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'MASTER-KEY': MASTER_KEY,
    },
    body: JSON.stringify(body),
  });

  const buffer = await apiRes.arrayBuffer();
  return new Response(Buffer.from(buffer), {
    status: apiRes.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST = proxyHandler;
export const PUT = proxyHandler;
export const DELETE = proxyHandler;
