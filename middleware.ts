import { clerkMiddleware, createRouteMatcher, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdminEmail, isCommercialEmail } from "./lib/admin";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/onboarding(.*)",
  "/api/dashboard(.*)",
  "/api/admin(.*)",
  "/api/verify(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url);

  if (url.pathname === "/") {
    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      const email = user?.primaryEmailAddress?.emailAddress ?? "";
      if (isAdminEmail(email)) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      if (isCommercialEmail(email)) {
        return NextResponse.redirect(new URL("/admin/demo", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
