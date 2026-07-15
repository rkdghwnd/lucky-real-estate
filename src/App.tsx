import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/routes/RootLayout';
import { Home } from '@/routes/Home';
import { Listings } from '@/routes/Listings';
import { ListingDetail } from '@/routes/ListingDetail';
import { About } from '@/routes/About';
import { NotFound } from '@/routes/NotFound';

// Public site route tree. Admin routes are added in step 2g.
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
]);
