import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/contact",
  "/pricing",
  "/pricing/success",
  "/reserver-un-appel",
  "/mentions-legales",
  "/politique-de-confidentialite",
  "/cgu-cgv",
  "/sitemap.xml",
  "/robots.txt",
  "/opengraph-image(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/twilio(.*)",
  "/api/tts(.*)",
  "/api/cron(.*)",
  "/api/contact(.*)",
  "/api/stripe/checkout",
  "/api/stripe/webhook",
  "/api/stripe/session",
]);

export default clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url);

  if (url.pathname === "/") {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return;
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
