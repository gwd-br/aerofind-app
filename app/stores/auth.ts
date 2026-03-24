// app/stores/auth.ts
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", () => {
  const token = useCookie<string | null>("auth_token", {
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });

  const user = ref<any | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  // ---- NOVO: controle de hidratação/ready
  const ready = ref(false);
  let inflightHydrate: Promise<void> | null = null;

  async function login(email: string, password: string) {
    const { $api } = useNuxtApp();
    const res = await $api<{ token: string }>("auth/login", {
      method: "POST",
      body: { email, password },
    });

    token.value = res.token;

    await fetchUser();
    ready.value = true;
  }

  async function forgotPassword(email: string) {
    const { $api } = useNuxtApp();
    await $api("auth/forgot-password", { method: "POST", body: { email } });
  }

  async function resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    const { $api } = useNuxtApp();
    await $api("auth/reset-password", {
      method: "POST",
      body: payload,
    });
  }

  async function fetchUser() {
    if (!token.value) {
      user.value = null;
      return null;
    }
    if (user.value) return user.value; // memo simples
    const { $api } = useNuxtApp();
    user.value = await $api("auth/me");
    return user.value;
  }

  // ---- NOVO: hidratar "apenas uma vez"
  async function hydrateOnce() {
    if (ready.value) return;
    if (inflightHydrate) return inflightHydrate;

    inflightHydrate = (async () => {
      if (!token.value) {
        // sem token não precisa buscar nada agora
        ready.value = true;
        return;
      }
      try {
        await Promise.allSettled([fetchUser()]);
      } catch {
        logout();
      } finally {
        ready.value = true;
        inflightHydrate = null;
      }
    })();

    return inflightHydrate;
  }

  // (mantém a função existente; agora um alias que chama a versão "once")
  async function hydrate() {
    return hydrateOnce();
  }

  function logout() {
    token.value = null;
    user.value = null;
    ready.value = true; // estado estável
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    fetchUser,
    logout,
    forgotPassword,
    resetPassword,
    hydrate,
  };
});
