import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

// Ant Design's responsive components (Descriptions, Grid, Select, Drawer…) read
// window.matchMedia / ResizeObserver, which jsdom doesn't implement. Polyfill them.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const rest = { ...props };
    delete rest.fill;
    delete rest.priority;
    delete rest.sizes;
    return React.createElement('img', rest as Record<string, unknown>);
  },
}));
