/** @jest-environment node */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

const BASE_URL = 'http://localhost';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('../../../../pages/api/auth/[...nextauth]', () => ({
  authOptions: {},
}));
const getServerSessionMock = getServerSession as jest.Mock;

describe('API Proxy Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BACKEND_URL = 'https://example.com';
    process.env.BACKEND_API_KEY = 'test-key';

    // Avoid open handles from the route's setInterval
    jest.spyOn(global, 'setInterval').mockImplementation((() => ({}) as any) as any);
  });

  afterEach(() => {
    (global.setInterval as jest.Mock)?.mockRestore?.();
  });

  it('should return 401 when session is missing', async () => {
    getServerSessionMock.mockResolvedValue(null);

    const { GET } = await import('./route');

    const req = new NextRequest(BASE_URL + '/api/proxy/api/');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('should return 400 when proxy path is empty', async () => {
    getServerSessionMock.mockResolvedValue({ accessToken: 'token-123' });
    const { GET } = await import('./route');

    const req = new NextRequest(BASE_URL + '/api/proxy/');
    const res = await GET(req);

    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toContain('Proxy path vazio');
  });

  it('should cache GET requests for cacheable endpoints', async () => {
    getServerSessionMock.mockResolvedValue({ accessToken: 'token-123' });

    // Mock global fetch to simulate upstream API
    const fetchMock = jest.fn(
      async () =>
        new Response(JSON.stringify({ ok: true, source: 'upstream' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
    );
    global.fetch = fetchMock;

    const { GET } = await import('./route');

    const url = BASE_URL + '/api/proxy/api/?foo=bar';
    const req1 = new NextRequest(url);
    const res1 = await GET(req1);

    expect(res1.status).toBe(200);
    expect(res1.headers.get('x-cache')).toBe('MISS');
    const json1 = await res1.json();
    expect(json1).toEqual({ ok: true, source: 'upstream' });

    // Second request should be served from cache (HIT)
    const req2 = new NextRequest(url);
    const res2 = await GET(req2);

    expect(res2.status).toBe(200);
    expect(res2.headers.get('x-cache')).toBe('HIT');
    expect(res2.headers.get('x-cache-date')).toBeTruthy();
    const json2 = await res2.json();
    expect(json2).toEqual({ ok: true, source: 'upstream' });
  });

  it('should merge JSON body with access_token and caches on POST request', async () => {
    getServerSessionMock.mockResolvedValue({ accessToken: 'token-abc' });

    const fetchMock = jest.fn(async (input: any, init: any) => {
      // Verify upstream URL includes api_key
      expect(String(input)).toContain('api_key=test-key');

      // Verify body contains merged access_token
      if (init?.method === 'POST') {
        const body = init.body?.toString() || '';
        const parsed = JSON.parse(body);
        expect(parsed).toMatchObject({ foo: 'bar', access_token: 'token-abc' });
      }

      return new Response(JSON.stringify({ ok: true, method: init?.method }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    global.fetch = fetchMock;

    const { POST } = await import('./route');

    const url = BASE_URL + '/api/proxy/api/apps/list/';
    const req1 = new NextRequest(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);
    expect(res1.headers.get('x-cache')).toBe('MISS');

    // Second identical request should be served from cache
    const req2 = new NextRequest(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
    expect(res2.headers.get('x-cache')).toBe('HIT');
    const payload2 = await res2.json();
    expect(payload2).toEqual({ ok: true, method: 'POST' });
  });

  it('should bypass cache when x-cache=false header is present', async () => {
    getServerSessionMock.mockResolvedValue({ accessToken: 'token-123' });

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ run: 1 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ run: 2 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );
    global.fetch = fetchMock;

    const { GET } = await import('./route');

    const baseUrl = BASE_URL + '/api/proxy/api/?q=1';
    const res1 = await GET(new NextRequest(baseUrl));
    expect(res1.status).toBe(200);
    expect(res1.headers.get('x-cache')).toBe('MISS');

    // Bypass cache explicitly
    const res2 = await GET(new NextRequest(baseUrl, { headers: { 'x-cache': 'false' } }));
    expect(res2.status).toBe(200);
    expect(res2.headers.get('x-cache')).toBe('MISS');
    const json2 = await res2.json();
    expect(json2).toEqual({ run: 2 });
  });

  it('should pass through application/octet-stream responses', async () => {
    getServerSessionMock.mockResolvedValue({ accessToken: 'token-789' });

    const buf = new Uint8Array([1, 2, 3, 4]).buffer;
    const fetchMock = jest.fn(
      async () =>
        new Response(buf, {
          status: 200,
          headers: { 'content-type': 'application/octet-stream' },
        })
    );
    global.fetch = fetchMock;

    const { GET } = await import('./route');
    const res = await GET(new NextRequest(BASE_URL + '/api/proxy/api/apps/some-file/'));
    expect(res.status).toBe(200);
    expect(res.headers.get('x-cache')).toBe('MISS');
    const arr = await res.arrayBuffer();
    expect(new Uint8Array(arr)).toEqual(new Uint8Array(buf));
  });

  it('should return 405 for unsupported HTTP methods with Allow header', async () => {
    getServerSessionMock.mockResolvedValue({ accessToken: 'token-123' });

    const { POST } = await import('./route');
    const req = new NextRequest(BASE_URL + '/api/proxy/api/', { method: 'PATCH' });
    const res = await POST(req);

    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('GET, POST, PUT, DELETE');
  });

  it('should upload multipart/form-data, forward raw body, and not cache', async () => {
    getServerSessionMock.mockResolvedValue({ accessToken: 'token-xyz' });

    const boundary = 'abc123';
    const bodyBuf = new Uint8Array([10, 20, 30, 40]).buffer;

    const fetchMock = jest.fn(async (input: any, init: any) => {
      expect(init?.headers?.['content-type']).toContain('multipart/form-data');
      expect(init?.headers?.['content-type']).toContain(boundary);

      expect(init?.body instanceof ArrayBuffer || ArrayBuffer.isView(init?.body)).toBe(true);
      return new Response(JSON.stringify({ uploaded: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    global.fetch = fetchMock;

    const { POST } = await import('./route');

    const url = BASE_URL + '/api/proxy/api/apps/list/';
    const headers = { 'content-type': `multipart/form-data; boundary=${boundary}` };

    const req1 = new NextRequest(url, { method: 'POST', headers, body: bodyBuf as any });
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);
    expect(res1.headers.get('x-cache')).toBe('MISS');

    // Repeat request: still MISS (no caching for file uploads)
    const req2 = new NextRequest(url, { method: 'POST', headers, body: bodyBuf as any });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
    expect(res2.headers.get('x-cache')).toBe('MISS');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should invalidate cache on upstream failure and recovers', async () => {
    getServerSessionMock.mockResolvedValue({ accessToken: 'token-555' });

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: 1 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: 'recovered' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );
    global.fetch = fetchMock;

    const { POST } = await import('./route');

    const url = BASE_URL + '/api/proxy/api/apps/list/';
    const headers = { 'content-type': 'application/json' };

    // Prime cache with a successful response
    const res1 = await POST(
      new NextRequest(url, { method: 'POST', headers, body: JSON.stringify({ a: 1 }) })
    );
    expect(res1.status).toBe(200);
    expect(res1.headers.get('x-cache')).toBe('MISS');

    // Force network (bypass cache) and simulate upstream error -> should throw
    await expect(
      POST(
        new NextRequest(url, {
          method: 'POST',
          headers: { ...headers, 'x-cache': 'false' },
          body: JSON.stringify({ a: 1 }),
        })
      )
    ).rejects.toThrow('boom');

    // Next request should not hit cache (it was invalidated), should be MISS and recover
    const res3 = await POST(
      new NextRequest(url, { method: 'POST', headers, body: JSON.stringify({ a: 1 }) })
    );
    expect(res3.status).toBe(200);
    expect(res3.headers.get('x-cache')).toBe('MISS');
    const json3 = await res3.json();
    expect(json3).toEqual({ ok: 'recovered' });
  });

  it('should cache dynamic endpoint /api/apps/:app_name/info/', async () => {
    getServerSessionMock.mockResolvedValue({ accessToken: 'token-111' });

    const fetchMock = jest.fn(
      async () =>
        new Response(JSON.stringify({ app: 'myapp', info: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
    );
    global.fetch = fetchMock;

    const { POST } = await import('./route');
    const url = BASE_URL + '/api/proxy/api/apps/myapp/info/';

    const req1 = new NextRequest(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);
    expect(res1.headers.get('x-cache')).toBe('MISS');

    const req2 = new NextRequest(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
    expect(res2.headers.get('x-cache')).toBe('HIT');
    const json2 = await res2.json();
    expect(json2).toEqual({ app: 'myapp', info: true });
  });

  it('should cause cache MISS after TTL expiry', async () => {
    getServerSessionMock.mockResolvedValue({ accessToken: 'token-222' });
    const now = 1_700_000_000_000; // arbitrary epoch
    const ttlMs = 30 * 60 * 1000; // default TTL

    const dateSpy = jest.spyOn(Date, 'now');

    // First: time at cache write
    dateSpy.mockReturnValue(now);

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ count: 1 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ count: 2 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );
    global.fetch = fetchMock;

    const { GET } = await import('./route');
    const url = BASE_URL + '/api/proxy/api/';

    const res1 = await GET(new NextRequest(url));
    expect(res1.status).toBe(200);
    expect(res1.headers.get('x-cache')).toBe('MISS');

    // Advance time beyond expiry to force MISS on second request
    dateSpy.mockReturnValue(now + ttlMs + 1000);

    const res2 = await GET(new NextRequest(url));
    expect(res2.status).toBe(200);
    expect(res2.headers.get('x-cache')).toBe('MISS');
    const json2 = await res2.json();
    expect(json2).toEqual({ count: 2 });

    dateSpy.mockRestore();
  });

  it('should inject api_key and clean headers on GET request', async () => {
    getServerSessionMock.mockResolvedValue({ accessToken: 'token-333' });

    const fetchMock = jest.fn(
      async () =>
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'content-encoding': 'gzip',
            'content-length': '123',
          },
        })
    );
    global.fetch = fetchMock;

    const { GET } = await import('./route');

    const url = BASE_URL + '/api/proxy/api/?x=1';
    const res = await GET(new NextRequest(url));
    expect(res.status).toBe(200);

    // Ensure cleanup of upstream headers
    expect(res.headers.get('content-encoding')).toBeNull();
    expect(res.headers.get('content-length')).toBeNull();
    expect(res.headers.get('content-type')).toBe('application/json');

    // Verify api_key injected into upstream URL
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain('api_key=test-key');
  });

  it('should run update on background after HIT', async () => {
    getServerSessionMock.mockResolvedValue({ accessToken: 'token-555' });

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: 1 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: 2 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );
    global.fetch = fetchMock;

    const { GET } = await import('./route');
    const url = BASE_URL + '/api/proxy/api/?bg=1';

    // First MISS populates cache
    const res1 = await GET(new NextRequest(url));
    expect(res1.headers.get('x-cache')).toBe('MISS');

    // Second HIT should trigger background update
    const res2 = await GET(new NextRequest(url));
    expect(res2.headers.get('x-cache')).toBe('HIT');

    // Wait a tick for background update to execute
    await new Promise((r) => setImmediate(r));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should pass through text/plain upstream responses', async () => {
    getServerSessionMock.mockResolvedValue({ accessToken: 'token-666' });
    const fetchMock = jest.fn(
      async () =>
        new Response('hello world', {
          status: 200,
          headers: { 'content-type': 'text/plain' },
        })
    );
    global.fetch = fetchMock;

    const { GET } = await import('./route');
    const res = await GET(new NextRequest(BASE_URL + '/api/proxy/api/text/'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    const txt = await res.text();
    expect(txt).toBe('hello world');
  });
});
