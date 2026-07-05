import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SiteChrome } from './SiteChrome';

const route = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

function renderChrome() {
  return render(
    <SiteChrome header={<header>공개 헤더</header>} footer={<footer>공개 푸터</footer>}>
      <p>페이지 내용</p>
    </SiteChrome>,
  );
}

describe('SiteChrome', () => {
  beforeEach(() => { route.pathname = '/'; });

  it('wraps public pages with the public header and footer', () => {
    renderChrome();
    expect(screen.getByText('공개 헤더')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('페이지 내용');
    expect(screen.getByText('공개 푸터')).toBeInTheDocument();
  });

  it('renders only admin content under /admin', () => {
    route.pathname = '/admin/listings/new';
    renderChrome();
    expect(screen.queryByText('공개 헤더')).not.toBeInTheDocument();
    expect(screen.queryByText('공개 푸터')).not.toBeInTheDocument();
    expect(screen.getByText('페이지 내용')).toBeInTheDocument();
  });
});
