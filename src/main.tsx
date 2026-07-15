import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleProvider } from '@ant-design/cssinjs';
import '@fontsource/noto-sans-kr/400.css';
import '@fontsource/noto-sans-kr/500.css';
import '@fontsource/noto-sans-kr/700.css';
import '@/index.css';
import { AntdProvider } from '@/components/providers/AntdProvider';
import { router } from '@/App';

// Data is fetched live in the browser; a modest staleTime avoids refetch storms
// while keeping the admin's own view fresh via explicit invalidation (step 2g).
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
});

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root element not found');

createRoot(rootEl).render(
  <StrictMode>
    {/* StyleProvider layer → antd styles land in @layer antd (see globals.css layer order). */}
    <StyleProvider layer>
      <QueryClientProvider client={queryClient}>
        <AntdProvider>
          <RouterProvider router={router} />
        </AntdProvider>
      </QueryClientProvider>
    </StyleProvider>
  </StrictMode>,
);
