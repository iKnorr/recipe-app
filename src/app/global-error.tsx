"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex h-dvh items-center justify-center bg-background font-sans antialiased">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-muted-foreground">
            An unexpected error occurred.
          </p>
          <button
            onClick={() => reset()}
            className="mt-4 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
