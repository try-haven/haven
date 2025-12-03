import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { UserProvider, useUser } from './UserContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('UserContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should start with no user logged in', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('should sign up a new user', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    act(() => {
      const success = result.current.signUp('test@example.com', 'testuser', 'password123');
      expect(success).toBe(true);
    });

    expect(result.current.user).toEqual({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    });
    expect(result.current.isLoggedIn).toBe(true);
  });

  it('should not allow duplicate usernames', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    act(() => {
      result.current.signUp('test1@example.com', 'testuser', 'password123');
    });

    act(() => {
      const success = result.current.signUp('test2@example.com', 'testuser', 'password456');
      expect(success).toBe(false);
    });

    expect(result.current.user?.email).toBe('test1@example.com');
  });

  it('should log in an existing user', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    act(() => {
      result.current.signUp('test@example.com', 'testuser', 'password123');
      result.current.logOut();
    });

    expect(result.current.isLoggedIn).toBe(false);

    act(() => {
      const success = result.current.logIn('testuser', 'password123');
      expect(success).toBe(true);
    });

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user?.username).toBe('testuser');
  });

  it('should fail login with wrong password', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    act(() => {
      result.current.signUp('test@example.com', 'testuser', 'password123');
      result.current.logOut();
    });

    act(() => {
      const success = result.current.logIn('testuser', 'wrongpassword');
      expect(success).toBe(false);
    });

    expect(result.current.isLoggedIn).toBe(false);
  });

  it('should log out a user', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    act(() => {
      result.current.signUp('test@example.com', 'testuser', 'password123');
    });

    expect(result.current.isLoggedIn).toBe(true);

    act(() => {
      result.current.logOut();
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should update user preferences', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    act(() => {
      result.current.signUp('test@example.com', 'testuser', 'password123');
    });

    act(() => {
      result.current.updatePreferences({
        address: 'Los Angeles, CA',
        commute: ['car', 'public-transit'],
      });
    });

    expect(result.current.user?.preferences).toEqual({
      address: 'Los Angeles, CA',
      commute: ['car', 'public-transit'],
    });
  });

  it('should persist user to localStorage', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    act(() => {
      result.current.signUp('test@example.com', 'testuser', 'password123');
    });

    const storedUser = localStorageMock.getItem('haven_user');
    expect(storedUser).toBeTruthy();

    const parsedUser = JSON.parse(storedUser!);
    expect(parsedUser.username).toBe('testuser');
  });

  it('should load user from localStorage on mount', () => {
    localStorageMock.setItem(
      'haven_user',
      JSON.stringify({
        email: 'stored@example.com',
        username: 'storeduser',
        password: 'password123',
      })
    );

    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    // Wait for the useEffect to run
    expect(result.current.user?.username).toBe('storeduser');
    expect(result.current.isLoggedIn).toBe(true);
  });
});
