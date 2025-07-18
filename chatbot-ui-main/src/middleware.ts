import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Get the pathname of the request
    const path = req.nextUrl.pathname;
    
    // Get the token from the session
    const token = req.nextauth.token;
    
    // Check if user is authenticated
    const isAuthenticated = !!token;
    
    // Define protected routes
    const protectedRoutes = ["/dashboard"];
    const authRoutes = ["/auth/login", "/auth/login/validate"];
    
    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => 
      path.startsWith(route)
    );
    
    // Check if the current path is an auth route
    const isAuthRoute = authRoutes.some(route => 
      path.startsWith(route)
    );
    
    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated && isProtectedRoute) {
      const loginUrl = new URL("/auth/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // If user is authenticated and trying to access auth routes
    if (isAuthenticated && isAuthRoute) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => {
        // This callback is called before the middleware function
        // We'll handle all authorization logic in the middleware function above
        return true;
      },
    },
  }
);

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 