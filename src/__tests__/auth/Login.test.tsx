import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '@/components/auth/Login';

const loginMock = jest.fn();

jest.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({ isAuthenticated: false, login: loginMock }),
}));

jest.mock('@/auth/config', () => ({ AUTH_CONFIG: { csrfCookie: 'csrf_token' } }));

jest.mock('js-cookie', () => ({
  get: (name: string) => (name === 'csrf_token' ? 'test-csrf' : undefined),
}));

describe('Login', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('shows error when fields are empty', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/please enter both/i);
  });

  it('submits credentials and redirects on success', async () => {
    loginMock.mockResolvedValue({ ok: true });

    const originalLocation = window.location;
    const mockReplace = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, replace: mockReplace },
      writable: true,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('user', 'pass', 'test-csrf');
      expect(mockReplace).toHaveBeenCalledWith('/');
    });

    Object.defineProperty(window, 'location', { value: originalLocation });
  });
});
