import { reactive, ref, toRaw } from "vue";
import type { z } from "zod";

type FieldErrors<T> = Record<keyof T | "global", string>;

export function useZodForm<T extends Record<string, any>>(
  schema: z.ZodType<T>,
  initial: T
) {
  const form = reactive<T>({ ...initial });

  const baseErrors = {
    global: "",
    ...Object.keys(initial).reduce((a, k) => {
      (a as any)[k] = "";
      return a;
    }, {} as Record<keyof T, string>),
  };

  const errors = ref<FieldErrors<T>>(baseErrors as FieldErrors<T>);
  const submitting = ref(false);

  function reset() {
    Object.assign(form, initial);
    for (const k in errors.value) errors.value[k as keyof FieldErrors<T>] = "";
  }

  function validate(): boolean {
    for (const k in errors.value) errors.value[k as keyof FieldErrors<T>] = "";
    const res = schema.safeParse(toRaw(form));
    if (res.success) return true;
    const flat = res.error.flatten();
    for (const [field, msgs] of Object.entries(flat.fieldErrors) as [
      keyof T,
      string[]
    ][]) {
      if (msgs && msgs.length) errors.value[field] = msgs[0]!;
    }
    errors.value.global = flat.formErrors?.[0] || "";
    return false;
  }

  function applyLaravel422(err: any) {
    const status = err?.response?.status ?? err?.status;
    const data = err?.response?._data ?? err?._data ?? err?.data;
    if (status === 422 && data?.errors) {
      for (const [field, msgs] of Object.entries<Record<string, string[]>>(
        data.errors
      )) {
        errors.value[field as keyof T] = msgs?.[0] || "Campo inválido";
      }
      return true;
    }
    errors.value.global = data?.message || "Falha ao enviar. Tente novamente.";
    return false;
  }

  return {
    form,
    errors: errors.value,
    submitting,
    reset,
    validate,
    applyLaravel422,
  };
}
