export function JsonLd({ data }: { data: object }) {
  // Escape "<" so an embedded "</script>" or "<!--" in owner/AI-authored text
  // cannot break out of the script tag (HTML-injection / XSS hardening).
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
