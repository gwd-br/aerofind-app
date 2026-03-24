// ~/composables/useFieldErrors.ts
import { ref } from "vue";

export type FieldErrors = Record<string, string>;

export function useFieldErrors() {
  const errors = ref<FieldErrors>({});

  const clear = () => {
    errors.value = {};
  };

  // Aceita vários formatos de backend (Axios, $fetch/Nuxt, etc.)
  const setFromUnknown = (err: any) => {
    const be =
      err?.response?.data?.errors ?? // Axios/Laravel
      err?.data?.errors ?? // ofetch/$fetch (Nuxt)
      err?.errors ?? // payload direto
      null;

    if (be && typeof be === "object") {
      const out: FieldErrors = {};
      for (const [field, msgs] of Object.entries(be)) {
        out[field] = Array.isArray(msgs) ? String(msgs[0]) : String(msgs);
      }
      errors.value = out;
      return;
    }

    // Fallback: se só vier message, amarra em "form"
    if (err?.response?.data?.message) {
      errors.value = { form: String(err.response.data.message) };
    } else if (err?.data?.message) {
      errors.value = { form: String(err.data.message) };
    } else if (err?.message) {
      errors.value = { form: String(err.message) };
    }
  };

  const has = (field: string) => !!errors.value[field];
  const msg = (field: string) => errors.value[field];

  // Classe Tailwind que funciona na maioria dos <Input>/<Textarea> (incl. shadcn-vue)
  const inputClass = (field: string) =>
    has(field)
      ? "!border-red-200 !ring-2 !ring-red-200 focus-visible:!ring-red-200"
      : "";

  // Acessibilidade pronta
  const aria = (field: string) =>
    has(field)
      ? { "aria-invalid": "true", "aria-describedby": `${field}-error` }
      : {};

  return { errors, clear, setFromUnknown, has, msg, inputClass, aria };
}
