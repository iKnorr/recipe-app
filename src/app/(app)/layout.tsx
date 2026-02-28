import Link from "next/link";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-bold">
            Monsieur Cookie Dough
          </Link>
          <Link
            href="/recipes/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Add Recipe
          </Link>
        </div>
        <nav className="container mx-auto flex gap-6 border-t px-4 py-2">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Recipes
          </Link>
          <Link
            href="/tips"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Tips
          </Link>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </>
  );
}
