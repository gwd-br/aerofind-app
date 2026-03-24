import { useAuthStore } from "@/stores/auth";
export default defineNuxtPlugin((nuxtApp) => {
  // const { session } = useUserSession();

  const auth = useAuthStore();
  const config = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ request, options, error }) {
      const token = auth.token;

      // console.log(token);
      // console.log(options);
      if (!options.headers) {
        options.headers = new Headers();
        options.headers.set("Accept", "application/json");
        options.headers.set("Content-Type", "application/json");
      }
      if (token) {
        options.headers.set("Authorization", `Bearer ${token}`);
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        await nuxtApp.runWithContext(() => navigateTo("/login"));
      }
    },
  });

  // Expose to useNuxtApp().$api
  return {
    provide: {
      api,
    },
  };
});
