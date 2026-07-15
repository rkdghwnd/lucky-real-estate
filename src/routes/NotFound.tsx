import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-3xl font-extrabold text-ink">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-muted">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link to="/" className="mt-6 inline-block font-semibold text-brand hover:text-brand-dark">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
