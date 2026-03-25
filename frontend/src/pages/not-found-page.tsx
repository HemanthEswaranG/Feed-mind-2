import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-foreground">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-sm text-muted-foreground">The page you requested does not exist in the React migration router.</p>
      <Link className="text-primary underline" to="/dashboard">
        Go to dashboard
      </Link>
    </main>
  );
}
