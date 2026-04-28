import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
	...routing,
	localeDetection: false, // disables browser language detection
});
export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	
	// Only redirect if exactly "/" and not already locale-prefixed
	if (pathname === "/") {
		return NextResponse.redirect(new URL("/en", request.url));
	}
	
	// For locale-prefixed paths, run the intl middleware
	const response = intlMiddleware(request);
	
	// Add cache-busting headers to prevent Safari caching issues
	if (response) {
		response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');
	}
	
	return response;
}

export const config = {
	matcher: ["/", "/(en|no|ne)(/.*)?"],
};
