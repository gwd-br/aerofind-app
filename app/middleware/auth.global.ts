// middleware/auth.global.ts
import { useAuthStore } from "@/stores/auth";
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();

  // se ainda não há user mas existe token no cookie,
  // tenta buscar os dados do usuário
  if (auth.token && !auth.user) {
    try {
      await auth.fetchUser();
    } catch (e) {
      // se falhar (ex.: 401), força logout
      auth.logout();
    }
  }

  // rotas públicas (ajuste conforme seu app)
  const publicPaths = new Set<string>([
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ]);

  if (publicPaths.has(to.path)) {
    // usuário logado acessando rota pública → redireciona p/ home
    if (auth.isAuthenticated) {
      return navigateTo("/");
    }
    return;
  }

  // rota privada sem estar autenticado → manda p/ login
  if (!auth.isAuthenticated) {
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }
});
