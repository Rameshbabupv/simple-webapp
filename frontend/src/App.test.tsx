import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from './App';

test('renders Systech Nexus Platform title', async () => {
  await act(async () => {
    render(<App />);
  });

  const titleElement = screen.getByText(/Systech Nexus Platform/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders Keycloak authentication subtitle', async () => {
  await act(async () => {
    render(<App />);
  });

  const subtitleElement = screen.getByText(/Keycloak Authentication & User Management/i);
  expect(subtitleElement).toBeInTheDocument();
});

test('renders login button', async () => {
  await act(async () => {
    render(<App />);
  });

  // Should show either login button or user authentication state
  const authElement = screen.getByText(/Login with Keycloak|Authenticating/i);
  expect(authElement).toBeInTheDocument();
});
