import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/routes/RootLayout';
import { Home } from '@/routes/Home';
import { Listings } from '@/routes/Listings';
import { ListingDetail } from '@/routes/ListingDetail';
import { About } from '@/routes/About';
import { NotFound } from '@/routes/NotFound';

// Admin is CSR-only and heavy (forms, image compression, map). It is lazy-loaded
// via React Router route `lazy`, so its chunks load only when /admin/* is
// visited and stay out of the public bundle.
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'listings', element: <Listings /> },
      { path: 'listings/:slug', element: <ListingDetail /> },
      { path: 'about', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin/login',
    lazy: async () => ({ Component: (await import('@/routes/admin/Login')).AdminLogin }),
  },
  {
    path: '/admin',
    lazy: async () => ({ Component: (await import('@/routes/admin/AdminLayout')).AdminLayout }),
    children: [
      { index: true, lazy: async () => ({ Component: (await import('@/routes/admin/Dashboard')).AdminDashboard }) },
      { path: 'listings/new', lazy: async () => ({ Component: (await import('@/routes/admin/ListingNew')).AdminListingNew }) },
      { path: 'listings/:id/edit', lazy: async () => ({ Component: (await import('@/routes/admin/ListingEdit')).AdminListingEdit }) },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
