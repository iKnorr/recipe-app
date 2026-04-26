import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">Page not found</p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
      >
        Go home
      </Link>
    </div>
  );
}
