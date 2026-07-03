import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, priority, sizes, ...rest }: Record<string, unknown>) =>
    React.createElement('img', rest as Record<string, unknown>),
}));
