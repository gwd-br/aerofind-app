// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

require("dotenv").config();

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["@/assets/css/tailwind.css"],
  runtimeConfig: {
    debug: true,
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE ||
        "https://api.facial-dev.eventim.com.br/api",
    },
    // routeRules: {
    //   // Tudo que for /api/** vai para o backend externo
    //   "/api/v2/**": {
    //     proxy: `${process.env.NUXT_PUBLIC_API_BASE}/api/v2/**`,
    //   },
    // },
  },
  nitro: {
    preset: "static",
  },

  vite: {
    plugins: [tailwindcss()],
    assetsInclude: ["**/*.wasm", "**/*.jsep.wasm"],
  },

  modules: ["shadcn-nuxt", "nuxt-auth-utils", "@pinia/nuxt"],
  pinia: {
    autoImports: ["defineStore", "storeToRefs"],
    storesDirs: ["./app/stores/**"], // cobre nova estrutura do v4
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  components: [
    {
      path: "@/components/ui",
      extensions: [".vue"],
      pathPrefix: false,
    },
  ],
});
