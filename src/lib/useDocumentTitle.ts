import { useEffect } from 'react';

// Sets document.title for the current route. Every route should set one so the
// title never goes stale when navigating (client-side routing keeps the doc).
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
