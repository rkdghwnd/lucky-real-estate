import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/routes/RootLayout';
import { Home } from '@/routes/Home';
import { Listings } from '@/routes/Listings';
import { ListingDetail } from '@/routes/ListingDetail';
import { About } from '@/routes/About';
import { NotFound } from '@/routes/NotFound';
import { AdminLayout } from '@/routes/admin/AdminLayout';
import { AdminLogin } from '@/routes/admin/Login';
import { AdminDashboard } from '@/routes/admin/Dashboard';
import { AdminListingNew } from '@/routes/admin/ListingNew';
import { AdminListingEdit } from '@/routes/admin/ListingEdit';

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
  // Admin is CSR-only, outside the public chrome. Access is gated by AdminLayout
  // (session + is_admin) and enforced by Supabase RLS.
  { path: '/admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'listings/new', element: <AdminListingNew /> },
      { path: 'listings/:id/edit', element: <AdminListingEdit /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
