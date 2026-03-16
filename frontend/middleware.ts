import { withAuth } from "next-auth/middleware";

export default withAuth({
  secret:
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV !== "production"
      ? "feedmind-dev-secret-change-in-production"
      : undefined),
  pages: {
    signIn: "/auth",
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/forms/:path*", "/profile/:path*"],
};
