
import '@testing-library/jest-dom';

// Mock environment variables
Object.defineProperty(window, 'import', {
  value: {
    meta: {
      env: {
        DEV: true,
        VITE_SUPABASE_URL: 'https://test.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'test-key',
      },
    },
  },
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
  },
  writable: true,
});
