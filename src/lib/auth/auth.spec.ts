import { renderHook } from '@testing-library/react';
import { useSession } from 'next-auth/react';

import { useIsLoggedIn } from './auth';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('../config', () => ({
  config: {
    website: {
      emailDomains: ['allowed.com', 'test.com'],
    },
  },
}));

describe('useIsLoggedIn', () => {
  const mockedUseSession = useSession as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined when status is loading', () => {
    mockedUseSession.mockReturnValue({ data: null, status: 'loading' });
    const { result } = renderHook(() => useIsLoggedIn());
    expect(result.current).toBeUndefined();
  });

  it('should return false when user is not authenticated', () => {
    mockedUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    const { result } = renderHook(() => useIsLoggedIn());
    expect(result.current).toBe(false);
  });

  it('should return true when user email domain is allowed', () => {
    mockedUseSession.mockReturnValue({
      data: { user: { email: 'user@allowed.com' } },
      status: 'authenticated',
    });
    const { result } = renderHook(() => useIsLoggedIn());
    expect(result.current).toBe(true);
  });

  it('should return false when user email domain is not allowed', () => {
    mockedUseSession.mockReturnValue({
      data: { user: { email: 'user@notallowed.com' } },
      status: 'authenticated',
    });
    const { result } = renderHook(() => useIsLoggedIn());
    expect(result.current).toBe(false);
  });
});
