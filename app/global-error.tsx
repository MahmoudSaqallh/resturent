"use client";

/* Root-level fallback (e.g. the menu failed to load in the root layout).
   Global styles are not available here, so styles are inline. */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#faf6ef",
          color: "#1a1512",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <title>تعذّر تحميل القائمة</title>
        <div>
          <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>تعذّر تحميل القائمة</h1>
          <p style={{ color: "#6f655c", margin: "0 0 20px" }}>حصل خلل مؤقت. تأكد من اتصالك ثم حاول مرة أخرى.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              height: 48,
              padding: "0 24px",
              border: 0,
              borderRadius: 999,
              background: "#d93a16",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            حاول مرة أخرى
          </button>
        </div>
      </body>
    </html>
  );
}
