import { auth } from "@/infrastructure/auth/auth.config";
import { defineMiddleware } from "astro:middleware";

// Rutas internas que nunca necesitan verificar sesión (assets, API, partials)
const SKIP_SESSION_ROUTES = ['/_astro/', '/api/', '/partials/'];

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Static/internal routes: skip session check entirely (optimización)
  if (SKIP_SESSION_ROUTES.some(r => pathname.startsWith(r))) {
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }

  // All user-facing routes: check session
  const sessionData = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (sessionData) {
    context.locals.user = sessionData.user;
    context.locals.session = sessionData.session;
  } else {
    context.locals.user = null;
    context.locals.session = null;
  }

  // Proteger /dashboard: redirigir a signin si no hay sesión
  if (pathname.startsWith('/dashboard') && !sessionData) {
    return context.redirect('/signin');
  }

  // Redirigir a dashboard si ya hay sesión en páginas de auth
  if ((pathname === '/signin' || pathname === '/signup') && sessionData) {
    return context.redirect('/dashboard');
  }

  return next();
});
