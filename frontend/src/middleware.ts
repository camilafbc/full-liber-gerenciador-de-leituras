import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("liber_refresh_token")?.value;
  const isAuthenticated = Boolean(refreshToken);

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isPublicRoute =
    isAuthRoute || pathname.startsWith("/auth-callback") || pathname === "/";

  // Usuário não autenticado tentando acessar página protegida
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Usuário já autenticado tentando acessar login ou cadastro
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Intercepta todas as requisições de páginas, ignorando:
     * - Rotas internas de API (/api/*)
     * - Arquivos estáticos do Next.js (_next/static, _next/image)
     * - Favicon e assets visuais com extensões comuns
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
