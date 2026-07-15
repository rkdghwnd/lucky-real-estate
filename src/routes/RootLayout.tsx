import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Public chrome. Admin uses its own layout (no header/footer), so the old
// SiteChrome "/admin" branch is no longer needed — routing separates them.
export function RootLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
