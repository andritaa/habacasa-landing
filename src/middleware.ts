import { betterFetch } from "@better-fetch/fetch";
import { NextRequest, NextResponse } from "next/server";

type SessionResponse = {
  session: { id: string; userId: string; expiresAt: string };
  user: { id: string; email: string; name: string };
};

export async function middleware(request: NextRequest) {
  const internalOrigin = `http://localhost:${process.env.PORT || 3000}`;

  const { data: session } = await betterFetch<SessionResponse>(
    "/api/auth/get-session",
    {
      baseURL: internalOrigin,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    }
  );

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
