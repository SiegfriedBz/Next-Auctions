import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
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
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            404 - Page Not Found
          </h1>
          <p style={{ fontSize: "1rem", marginBottom: "1rem" }}>
            Oops! The page you are looking for does not exist.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <a href="/en">Go Home</a>
          </div>
        </div>
      </body>
    </html>
  );
}
