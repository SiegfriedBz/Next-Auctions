"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: 400 }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            Something went wrong!
          </h2>
          <p style={{ fontSize: "1rem", marginBottom: "1rem" }}>
            An unexpected error occurred. You can try reloading or go home.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <button type="button" onClick={() => reset()}>
              Try Again
            </button>
            <a href="/en">Go Home</a>
          </div>
        </div>
      </body>
    </html>
  );
}
