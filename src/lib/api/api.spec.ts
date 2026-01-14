import axios from 'axios';

import { logout } from '../auth';
import { apiRequest } from './api';

jest.mock('axios');
jest.mock('../auth', () => ({ logout: jest.fn() }));

const mockedAxios = axios as jest.MockedFunction<typeof axios>;
const mockedLogout = logout as jest.Mock;

describe('apiRequest', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should make a POST request by default', async () => {
    mockedAxios.mockResolvedValueOnce({ data: 'ok', status: 200 });
    const res = await apiRequest({ endpoint: '/test' });
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', url: '/api/proxy/test' })
    );
    expect(res.data).toBe('ok');
  });

  it('should handle GET requests', async () => {
    mockedAxios.mockResolvedValueOnce({ data: 'get', status: 200 });
    const res = await apiRequest({ endpoint: '/get', method: 'GET' });
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', url: '/api/proxy/get' })
    );
    expect(res.data).toBe('get');
  });

  it('should pass data, params, headers, and responseType', async () => {
    mockedAxios.mockResolvedValueOnce({ data: 'ok', status: 200 });
    await apiRequest({
      endpoint: '/data',
      method: 'POST',
      data: { foo: 'bar' },
      params: { a: 1 },
      headers: { Auth: 'token' },
      responseType: 'json',
    });
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { foo: 'bar' },
        params: { a: 1 },
        headers: { Auth: 'token' },
        responseType: 'json',
      })
    );
  });

  it('should call logout on 401 with Invalid access token', async () => {
    mockedAxios.mockRejectedValueOnce({
      response: { status: 401, data: { detail: 'Invalid access token' } },
    });
    await expect(apiRequest({ endpoint: '/fail' })).rejects.toBeDefined();
    expect(mockedLogout).toHaveBeenCalled();
  });

  it('should throw error for other failures', async () => {
    mockedAxios.mockRejectedValueOnce({
      response: { status: 500, data: { detail: 'Server error' } },
    });
    await expect(apiRequest({ endpoint: '/error' })).rejects.toBeDefined();
    expect(mockedLogout).not.toHaveBeenCalled();
  });
});
